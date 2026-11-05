import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState, type FormEvent } from "react";
import { loadBoard, unlockTeacher, type BoardStudent } from "@/lib/roster.functions";

export const Route = createFileRoute("/teacher")({
  component: TeacherPage,
});

const GRADE_CLASSES = ["5A", "5B", "5C", "5D", "5E"] as const;

function classBucket(value: string): (typeof GRADE_CLASSES)[number] | "其他" {
  const normalized = value
    .trim()
    .replace(/\s+/g, "")
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
    .toUpperCase();
  if (normalized === "5A" || normalized === "5B" || normalized === "5C" || normalized === "5D" || normalized === "5E") {
    return normalized;
  }
  return "其他";
}

function byNumber(left: BoardStudent, right: BoardStudent): number {
  const gap = Number(left.studentNo) - Number(right.studentNo);
  if (gap !== 0) return gap;
  return left.name.localeCompare(right.name, "zh-Hant");
}
function when(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("zh-HK", {
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "Asia/Hong_Kong",
  }).format(date);
}

function TeacherPage() {
  const unlock = useServerFn(unlockTeacher);
  const load = useServerFn(loadBoard);
  const [code, setCode] = useState("");
  const [token, setToken] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [students, setStudents] = useState<BoardStudent[] | null>(null);

  async function open(event: FormEvent) {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const result = await unlock({ data: { code } });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setToken(result.token);
      const board = await load({ data: { token: result.token } });
      if (!board.ok) {
        setError(board.error);
        return;
      }
      setStudents(board.students);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "暫時打不開");
    } finally {
      setBusy(false);
    }
  }

  async function refresh() {
    if (!token) return;
    setBusy(true);
    try {
      const board = await load({ data: { token } });
      if (!board.ok) {
        setError(board.error);
        setStudents(null);
        setToken("");
        return;
      }
      setStudents(board.students);
    } finally {
      setBusy(false);
    }
  }

  const groups: { name: (typeof GRADE_CLASSES)[number] | "其他"; students: BoardStudent[] }[] = GRADE_CLASSES.map(
    (name) => ({
      name,
      students: (students ?? []).filter((student) => classBucket(student.className) === name).sort(byNumber),
    }),
  );
  const others = (students ?? []).filter((student) => classBucket(student.className) === "其他").sort(byNumber);
  if (others.length > 0) groups.push({ name: "其他", students: others });

  return (
    <main className="min-h-dvh bg-paper px-4 py-6 text-ink">
      <div className="mx-auto max-w-3xl">
        <p className="text-sm font-medium text-meadow">小學科學 · 教師後台</p>
        <div className="mt-1 flex flex-wrap items-end justify-between gap-3">
          <h1 className="font-display text-5xl leading-none">同學問了甚麼</h1>
          <Link to="/" className="text-sm underline">
            返回營地
          </Link>
        </div>
        {students ? (
          <section className="mt-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-muted">共 {students.length} 位同學</p>
              <button
                type="button"
                onClick={refresh}
                disabled={busy}
                className="h-11 rounded-full border border-line bg-sheet px-4 text-sm focus-visible:ring-2 focus-visible:ring-meadow"
              >
                重新整理
              </button>
            </div>
            {students.length === 0 ? (
              <p className="mt-6 rounded-2xl bg-sheet p-4">還沒有同學填寫資料。</p>
            ) : (
              <div className="mt-4 flex flex-col gap-8">
                {groups.map((group) => (
                  <section key={group.name}>
                    <h2 className="font-display text-4xl leading-none">
                      {group.name}
                      <span className="ml-3 font-sans text-base text-muted">{group.students.length} 人</span>
                    </h2>
                    {group.students.length === 0 ? (
                      <p className="mt-3 text-sm text-muted">還沒有同學。</p>
                    ) : (
                      <ul className="mt-3 flex flex-col gap-4">
                        {group.students.map((student) => (
                          <li key={student.id} className="rounded-3xl border border-line bg-sheet p-4">
                            <h3 className="text-lg font-medium">
                              {group.name === "其他" ? `${student.className}　` : ""}
                              {student.studentNo}號　{student.name}
                              {student.locked ? (
                                <span className="ml-2 text-sm font-medium text-ember">已停止使用</span>
                              ) : student.warnings > 0 ? (
                                <span className="ml-2 text-sm text-ember">警告 {student.warnings}/3</span>
                              ) : null}
                            </h3>
                            {student.asks.length === 0 ? (
                              <p className="mt-2 text-sm text-muted">還沒有發問。</p>
                            ) : (
                              <ul className="mt-3 flex flex-col gap-3">
                                {student.asks.map((ask, index) => (
                                  <li key={`${student.id}-${index}`} className="rounded-2xl bg-paper px-3 py-2">
                                    <p className="text-sm text-muted">
                                      {when(ask.at)}　問{ask.character}
                                    </p>
                                    <p className="mt-1 text-pretty">問：{ask.question}</p>
                                    <p className="mt-1 text-pretty text-meadow-deep">答：{ask.answer}</p>
                                  </li>
                                ))}
                              </ul>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>
                ))}
              </div>
            )}
          </section>
        ) : (
          <form onSubmit={open} className="mt-6 max-w-sm rounded-3xl border border-line bg-sheet p-5">
            <label className="block text-sm font-medium" htmlFor="teacher-code">
              教師密碼
              <input
                id="teacher-code"
                type="password"
                autoComplete="current-password"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                className="mt-1 h-12 w-full rounded-2xl border border-line bg-paper px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-meadow"
              />
            </label>
            {error ? (
              <p className="mt-3 text-sm text-ember" role="alert">
                {error}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={busy || !code.trim()}
              className="mt-4 h-12 w-full rounded-full bg-meadow font-medium text-paper disabled:opacity-60"
            >
              {busy ? "打開緊……" : "進入後台"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
