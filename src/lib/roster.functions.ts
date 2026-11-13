import { createServerFn } from "@tanstack/react-start";
import { isMisconduct } from "@/lib/conduct";

function clean(value: unknown, max: number): string {
  if (typeof value !== "string") return "";
  return value.replace(/\s+/g, " ").trim().slice(0, max);
}

function normalizeUsername(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, "")
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
    .toUpperCase();
}

const CLASSES = ["5A", "5B", "5C", "5D", "5E"] as const;

function canonClass(value: string): string {
  return value
    .trim()
    .replace(/\s+/g, "")
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
    .toUpperCase();
}

function readStudent(input: unknown): { name: string; className: string; studentNo: string } {
  if (!input || typeof input !== "object") throw new Error("請填寫資料");
  const data = input as { name?: unknown; className?: unknown; studentNo?: unknown };
  const name = clean(data.name, 20);
  const className = canonClass(clean(data.className, 12));
  const rawNo = clean(data.studentNo, 6).replace(/[０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0));
  const studentNo = Number(rawNo);
  if (name.length < 1) throw new Error("請寫下姓名");
  if (!CLASSES.includes(className as (typeof CLASSES)[number])) throw new Error("班別只可以是 5A、5B、5C、5D 或 5E");
  if (!/^\d{1,2}$/.test(rawNo) || studentNo < 1 || studentNo > 35) throw new Error("學號只可以是 1 至 35");
  return { name, className, studentNo: String(studentNo) };
}

export const joinClass = createServerFn({ method: "POST" })
  .validator(readStudent)
  .handler(async ({ data }) => {
    if (isMisconduct(data.name) || isMisconduct(data.className)) {
      return { ok: false as const, error: "請用有禮的姓名和班別。" };
    }
    const { joinOnce } = await import("@/lib/roster.server");
    return joinOnce(data);
  });

export const loginStudent = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    if (!input || typeof input !== "object") throw new Error("請輸入帳號和密碼");
    const data = input as { username?: unknown; password?: unknown };
    const username = normalizeUsername(clean(data.username, 12));
    const password = clean(data.password, 20);
    if (!username || !password) throw new Error("請輸入帳號和密碼");
    return { username, password };
  })
  .handler(async ({ data }) => {
    const { loginOnce } = await import("@/lib/roster.server");
    return loginOnce(data);
  });

export const unlockTeacher = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    if (!input || typeof input !== "object") throw new Error("請輸入密碼");
    const code = clean((input as { code?: unknown }).code, 40);
    if (!code) throw new Error("請輸入密碼");
    return { code };
  })
  .handler(async ({ data }) => {
    const { passwordOk, issueTeacherToken } = await import("@/lib/roster.server");
    if (!passwordOk(data.code)) return { ok: false as const, error: "密碼不對" };
    return { ok: true as const, token: issueTeacherToken() };
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
    const { teacherOk, readBoard } = await import("@/lib/roster.server");
    if (!teacherOk(data.token)) return { ok: false as const, error: "請再輸入密碼" };
    const board = await readBoard();
    return { ok: true as const, students: board.students };
  });

export const clearBoard = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    if (!input || typeof input !== "object") throw new Error("請先解鎖");
    const token = clean((input as { token?: unknown }).token, 80);
    if (!token) throw new Error("請先解鎖");
    return { token };
  })
  .handler(async ({ data }) => {
    const { teacherOk, wipeBoard } = await import("@/lib/roster.server");
    if (!teacherOk(data.token)) return { ok: false as const, error: "請再輸入密碼" };
    await wipeBoard();
    return { ok: true as const };
  });

export const releaseStudent = createServerFn({ method: "POST" })
  .validator((input: unknown) => {
    if (!input || typeof input !== "object") throw new Error("請先解鎖");
    const data = input as { token?: unknown; studentId?: unknown };
    const token = clean(data.token, 80);
    const studentId = clean(data.studentId, 40);
    if (!token) throw new Error("請先解鎖");
    if (!/^[0-9a-f-]{36}$/i.test(studentId)) throw new Error("找不到這位同學");
    return { token, studentId };
  })
  .handler(async ({ data }) => {
    const { teacherOk, releaseStudent: releaseOne } = await import("@/lib/roster.server");
    if (!teacherOk(data.token)) return { ok: false as const, error: "請再輸入密碼" };
    const released = await releaseOne(data.studentId);
    if (!released) return { ok: false as const, error: "這位同學未被停止使用" };
    return { ok: true as const };
  });
