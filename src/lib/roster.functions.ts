import { createHmac, timingSafeEqual } from "node:crypto";
import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { getCharacter, isCharacterId } from "@/lib/lesson";
import { isMisconduct } from "@/lib/conduct";

const TEACHER_CODE = process.env.TEACHER_CODE?.trim() || "mosllps123456";

function clean(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

function readStudent(input: unknown): { name: string; className: string; studentNo: string } {
  if (!input || typeof input !== "object") throw new Error("請填寫資料");
  const data = input as { name?: unknown; className?: unknown; studentNo?: unknown };
  const name = clean(data.name, 20);
  const className = clean(data.className, 12);
  const studentNo = clean(data.studentNo, 6);
  if (name.length < 1) throw new Error("請寫下姓名");
  if (className.length < 1) throw new Error("請寫下班別");
  if (!/^\d{1,6}$/.test(studentNo)) throw new Error("學號請用數字");
  return { name, className, studentNo };
}

export const joinClass = createServerFn({ method: "POST" })
  .validator(readStudent)
  .handler(async ({ data }) => {
    if (isMisconduct(data.name) || isMisconduct(data.className)) {
      return { ok: false as const, error: "請用有禮的姓名和班別。" };
    }
    const sql = await getSql();
    const found = await sql<{ id: string; warnings: number }>`
      select id, warnings from students where class_name = ${data.className} and student_no = ${data.studentNo}
    `;
    if (found[0]) {
      await sql`update students set name = ${data.name} where id = ${found[0].id}`;
      const warnings = Number(found[0].warnings) || 0;
      return { ok: true as const, studentId: found[0].id, warnings, locked: warnings >= 3 };
    }
    const id = crypto.randomUUID();
    await sql`
      insert into students (id, name, class_name, student_no)
      values (${id}, ${data.name}, ${data.className}, ${data.studentNo})
    `;
    return { ok: true as const, studentId: id, warnings: 0, locked: false };
  });

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

function teacherToken(): string {
  return createHmac("sha256", TEACHER_CODE).update("roster-v1").digest("hex");
}

function same(left: string, right: string): boolean {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export const unlockTeacher = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    if (!input || typeof input !== "object") throw new Error("請輸入密碼");
    const code = clean((input as { code?: unknown }).code, 40);
    if (!code) throw new Error("請輸入密碼");
    return { code };
  })
  .handler(async ({ data }) => {
    if (!same(data.code, TEACHER_CODE)) return { ok: false as const, error: "密碼不對" };
    return { ok: true as const, token: teacherToken() };
  });

export type BoardAsk = {
  character: string;
  question: string;
  answer: string;
  at: string;
};

export type BoardStudent = {
  id: string;
  name: string;
  className: string;
  studentNo: string;
  warnings: number;
  locked: boolean;
  asks: BoardAsk[];
};

export const loadBoard = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    if (!input || typeof input !== "object") throw new Error("請先解鎖");
    const token = clean((input as { token?: unknown }).token, 80);
    if (!token) throw new Error("請先解鎖");
    return { token };
  })
  .handler(async ({ data }) => {
    if (!same(data.token, teacherToken())) return { ok: false as const, error: "請再輸入密碼" };
    const sql = await getSql();
    const rows = await sql<{
      id: string;
      name: string;
      class_name: string;
      student_no: string;
      warnings: number;
      character_id: string | null;
      question: string | null;
      answer: string | null;
      at: string | null;
    }>`
      select s.id, s.name, s.class_name, s.student_no, s.warnings,
             a.character_id, a.question, a.answer, a.created_at::text as at
      from students s
      left join asks a on a.student_id = s.id
      order by s.class_name, s.student_no, a.created_at desc nulls last
    `;
    const students: BoardStudent[] = [];
    for (const row of rows) {
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
    return { ok: true as const, students };
  });
