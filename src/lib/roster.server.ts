import { createHmac, timingSafeEqual } from "node:crypto";
import { getSql } from "@/lib/db";
import { getCharacter, isCharacterId } from "@/lib/lesson";
import { isMisconduct } from "@/lib/conduct";

const TEACHER_CODE = "26430707";
const USED = "該學號在此班別已被使用";

function passwordHash(password: string): string {
  return createHmac("sha256", "camp-login-v1").update(password).digest("hex");
}

function teacherToken(): string {
  return createHmac("sha256", TEACHER_CODE).update("roster-v1").digest("hex");
}

function same(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export function teacherOk(token: string): boolean {
  return same(token, teacherToken());
}

export function passwordOk(code: string): boolean {
  return same(code, TEACHER_CODE);
}

export function issueTeacherToken(): string {
  return teacherToken();
}

function canonClass(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, "")
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
    .toUpperCase();
}

function canonNo(value: string): string {
  return value.replace(/^0+(?=\d)/, "");
}

export async function ensureClassAccounts(): Promise<void> {
  const { CLASS_ACCOUNTS } = await import("@/lib/class-accounts.server");
  const sql = await getSql();
  for (const account of CLASS_ACCOUNTS) {
    const hash = passwordHash(account.password);
    await sql`
      insert into students (id, name, class_name, student_no, username, password_hash)
      values (${crypto.randomUUID()}, ${account.name}, ${account.className}, ${account.studentNo}, ${account.username}, ${hash})
      on conflict (class_name, student_no) do update
      set username = excluded.username,
          password_hash = excluded.password_hash,
          name = excluded.name
    `;
  }
}

export async function joinOnce(data: { name: string; className: string; studentNo: string }) {
  if (isMisconduct(data.name) || isMisconduct(data.className)) {
    return { ok: false as const, error: "請用有禮的姓名和班別。" };
  }
  const sql = await getSql();
  const className = canonClass(data.className);
  const studentNo = canonNo(data.studentNo);
  const found = await sql<{ id: string; claimed: boolean; warnings: number }>`
    select id, claimed, warnings from students
    where upper(class_name) = ${className} and ltrim(student_no, '0') = ${studentNo}
  `;
  if (found[0]?.claimed) return { ok: false as const, error: USED };
  if (found[0]) {
    const taken = await sql<{ id: string; warnings: number }>`
      update students set name = ${data.name}, claimed = true
      where id = ${found[0].id} and claimed = false
      returning id, warnings
    `;
    if (!taken[0]) return { ok: false as const, error: USED };
    const warnings = Number(taken[0].warnings) || 0;
    return { ok: true as const, studentId: taken[0].id, warnings, locked: warnings >= 3 };
  }
  const id = crypto.randomUUID();
  await sql`
    insert into students (id, name, class_name, student_no, claimed)
    values (${id}, ${data.name}, ${className}, ${studentNo}, true)
  `;
  return { ok: true as const, studentId: id, warnings: 0, locked: false };
}

export async function loginOnce(data: { username: string; password: string }) {
  await ensureClassAccounts();
  const sql = await getSql();
  const found = await sql<{ id: string; password_hash: string | null; warnings: number }>`
    select id, password_hash, warnings from students where username = ${data.username}
  `;
  const row = found[0];
  const expected = row?.password_hash ?? "";
  if (!row || !expected || !same(passwordHash(data.password), expected)) {
    return { ok: false as const, error: "帳號或密碼不對" };
  }
  const taken = await sql<{ id: string }>`
    update students set claimed = true
    where id = ${row.id} and claimed = false
    returning id
  `;
  if (!taken[0]) return { ok: false as const, error: USED };
  const warnings = Number(row.warnings) || 0;
  return { ok: true as const, studentId: row.id, warnings, locked: warnings >= 3 };
}

export async function addWarning(studentId: string): Promise<number> {
  const sql = await getSql();
  const rows = await sql<{ warnings: number }>`
    update students set warnings = warnings + 1
    where id = ${studentId} and warnings < 3
    returning warnings
  `;
  if (rows[0]) return Number(rows[0].warnings) || 0;
  const current = await sql<{ warnings: number }>`select warnings from students where id = ${studentId}`;
  return Number(current[0]?.warnings) || 0;
}

export async function warningCount(studentId: string): Promise<number> {
  const sql = await getSql();
  const rows = await sql<{ warnings: number }>`select warnings from students where id = ${studentId}`;
  return Number(rows[0]?.warnings) || 0;
}

export async function recordAsk(input: {
  studentId: string;
  characterId: string;
  question: string;
  answer: string;
}): Promise<void> {
  if (!isCharacterId(input.characterId)) return;
  const sql = await getSql();
  const found = await sql<{ id: string }>`select id from students where id = ${input.studentId}`;
  if (!found[0]) return;
  await sql`
    insert into asks (id, student_id, character_id, question, answer)
    values (${crypto.randomUUID()}, ${input.studentId}, ${input.characterId}, ${input.question.slice(0, 400)}, ${input.answer.slice(0, 800)})
  `;
}

export async function readBoard() {
  const sql = await getSql();
  const rows = await sql<{
    id: string;
    name: string;
    class_name: string;
    student_no: string;
    warnings: number;
    claimed: boolean;
    username: string | null;
    character_id: string | null;
    question: string | null;
    answer: string | null;
    at: string | null;
  }>`
    select s.id, s.name, s.class_name, s.student_no, s.warnings, s.claimed, s.username,
           a.character_id, a.question, a.answer, a.created_at::text as at
    from students s
    left join asks a on a.student_id = s.id
    order by s.class_name, s.student_no, a.created_at desc nulls last
  `;
  const students: {
    id: string;
    name: string;
    className: string;
    studentNo: string;
    warnings: number;
    locked: boolean;
    asks: { character: string; question: string; answer: string; at: string }[];
  }[] = [];
  for (const row of rows) {
    if (!row.claimed && row.username) continue;
    let student = students.find((item) => item.id === row.id);
    if (!student) {
      student = {
        id: row.id,
        name: row.name,
        className: row.class_name,
        studentNo: row.student_no,
        warnings: Number(row.warnings) || 0,
        locked: (Number(row.warnings) || 0) >= 3,
        asks: [],
      };
      students.push(student);
    }
    if (row.question && row.answer && row.character_id && isCharacterId(row.character_id)) {
      student.asks.push({
        character: getCharacter(row.character_id).name,
        question: row.question,
        answer: row.answer,
        at: row.at ?? "",
      });
    }
  }
  return { students };
}

export async function wipeBoard(): Promise<void> {
  const sql = await getSql();
  await sql`delete from asks`;
  await sql`delete from students`;
}

export async function releaseStudent(studentId: string): Promise<boolean> {
  const sql = await getSql();
  const found = await sql<{ warnings: number }>`select warnings from students where id = ${studentId}`;
  if (!found[0] || Number(found[0].warnings) < 3) return false;
  await sql`delete from asks where student_id = ${studentId}`;
  await sql`delete from students where id = ${studentId}`;
  return true;
}
