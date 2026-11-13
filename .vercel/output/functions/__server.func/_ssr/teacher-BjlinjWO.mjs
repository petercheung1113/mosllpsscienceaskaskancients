import { o as __toESM } from "../_runtime.mjs";
import { J as require_react, x as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as unlockTeacher, o as useServerFn, r as loadBoard, t as clearBoard } from "./roster.functions-fdOpSYnH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/teacher-BjlinjWO.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var GRADE_CLASSES = [
	"5A",
	"5B",
	"5C",
	"5D",
	"5E"
];
function classBucket(value) {
	const normalized = value.trim().replace(/\s+/g, "").replace(/[Ａ-Ｚａ-ｚ０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 65248)).toUpperCase();
	if (normalized === "5A" || normalized === "5B" || normalized === "5C" || normalized === "5D" || normalized === "5E") return normalized;
	return "其他";
}
function byNumber(left, right) {
	const gap = Number(left.studentNo) - Number(right.studentNo);
	if (gap !== 0) return gap;
	return left.name.localeCompare(right.name, "zh-Hant");
}
function when(value) {
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return "";
	return new Intl.DateTimeFormat("zh-HK", {
		month: "numeric",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
		hourCycle: "h23",
		timeZone: "Asia/Hong_Kong"
	}).format(date);
}
function TeacherPage() {
	const unlock = useServerFn(unlockTeacher);
	const load = useServerFn(loadBoard);
	const wipe = useServerFn(clearBoard);
	const [code, setCode] = (0, import_react.useState)("");
	const [token, setToken] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	const [students, setStudents] = (0, import_react.useState)(null);
	const [accounts, setAccounts] = (0, import_react.useState)([]);
	const [confirmClear, setConfirmClear] = (0, import_react.useState)(false);
	async function open(event) {
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
			setAccounts(board.accounts);
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
			setAccounts(board.accounts);
		} finally {
			setBusy(false);
		}
	}
	async function clearAll() {
		if (!token || busy) return;
		setBusy(true);
		setError("");
		try {
			const result = await wipe({ data: { token } });
			if (!result.ok) {
				setError(result.error);
				setStudents(null);
				setToken("");
				return;
			}
			setConfirmClear(false);
			const board = await load({ data: { token } });
			if (board.ok) {
				setStudents(board.students);
				setAccounts(board.accounts);
			} else setStudents([]);
		} catch (caught) {
			setError(caught instanceof Error ? caught.message : "清除不到");
		} finally {
			setBusy(false);
		}
	}
	const groups = GRADE_CLASSES.map((name) => ({
		name,
		students: (students ?? []).filter((student) => classBucket(student.className) === name).sort(byNumber)
	}));
	const others = (students ?? []).filter((student) => classBucket(student.className) === "其他").sort(byNumber);
	if (others.length > 0) groups.push({
		name: "其他",
		students: others
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		className: "min-h-dvh bg-paper px-4 py-6 text-ink",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mx-auto max-w-3xl",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium text-meadow",
					children: "小學科學 · 教師後台"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mt-1 flex flex-wrap items-end justify-between gap-3",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "font-display text-5xl leading-none",
						children: "同學問了甚麼"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/",
						className: "text-sm underline",
						children: "返回營地"
					})]
				}),
				students ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
					className: "mt-6",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center justify-between gap-3",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
								className: "text-sm text-muted",
								children: [
									"共 ",
									students.length,
									" 位同學"
								]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
								className: "flex gap-2",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: refresh,
									disabled: busy,
									className: "h-11 rounded-full border border-line bg-sheet px-4 text-sm focus-visible:ring-2 focus-visible:ring-meadow",
									children: "重新整理"
								}), confirmClear ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: clearAll,
									disabled: busy,
									className: "h-11 rounded-full bg-ember px-4 text-sm font-medium text-paper focus-visible:ring-2 focus-visible:ring-meadow",
									children: "確定清除"
								}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
									type: "button",
									onClick: () => setConfirmClear(true),
									disabled: busy,
									className: "h-11 rounded-full border border-ember px-4 text-sm text-ember focus-visible:ring-2 focus-visible:ring-ember",
									children: "清除所有資料"
								})]
							})]
						}),
						confirmClear ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-ember",
							role: "alert",
							children: "會刪除全部對話和警告。5A 的帳號密碼會保留。刪除後不能還原。"
						}) : null,
						error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-ember",
							role: "alert",
							children: error
						}) : null,
						accounts.length > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "mt-4 overflow-x-auto rounded-3xl border border-line bg-sheet",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "px-4 pt-4 text-sm font-medium",
								children: "5A 帳號密碼"
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
								className: "mt-2 w-full text-left text-sm",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
									className: "text-muted",
									children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", { children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-2 font-medium",
											children: "學號"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-2 font-medium",
											children: "帳號"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-4 py-2 font-medium",
											children: "密碼"
										})
									] })
								}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("tbody", { children: accounts.map((account) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-t border-line",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-2",
											children: account.studentNo
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-2",
											children: account.username
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
											className: "px-4 py-2",
											children: account.password
										})
									]
								}, account.username)) })]
							})]
						}) : null,
						students.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-6 rounded-2xl bg-sheet p-4",
							children: "還沒有同學填寫資料。"
						}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
							className: "mt-4 flex flex-col gap-8",
							children: groups.map((group) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h2", {
								className: "font-display text-4xl leading-none",
								children: [group.name, /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
									className: "ml-3 font-sans text-base text-muted",
									children: [group.students.length, " 人"]
								})]
							}), group.students.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
								className: "mt-3 text-sm text-muted",
								children: "還沒有同學。"
							}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
								className: "mt-3 flex flex-col gap-4",
								children: group.students.map((student) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
									className: "rounded-3xl border border-line bg-sheet p-4",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("h3", {
										className: "text-lg font-medium",
										children: [
											group.name === "其他" ? `${student.className}　` : "",
											student.studentNo,
											"號　",
											student.name,
											student.locked ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "ml-2 text-sm font-medium text-ember",
												children: "已停止使用"
											}) : student.warnings > 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "ml-2 text-sm text-ember",
												children: [
													"警告 ",
													student.warnings,
													"/3"
												]
											}) : null
										]
									}), student.asks.length === 0 ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "mt-2 text-sm text-muted",
										children: "還沒有發問。"
									}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
										className: "mt-3 flex flex-col gap-3",
										children: student.asks.map((ask, index) => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
											className: "rounded-2xl bg-paper px-3 py-2",
											children: [
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "text-sm text-muted",
													children: [
														when(ask.at),
														"　問",
														ask.character
													]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "mt-1 text-pretty",
													children: ["問：", ask.question]
												}),
												/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
													className: "mt-1 text-pretty text-meadow-deep",
													children: ["答：", ask.answer]
												})
											]
										}, `${student.id}-${index}`))
									})]
								}, student.id))
							})] }, group.name))
						})
					]
				}) : /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
					onSubmit: open,
					className: "mt-6 max-w-sm rounded-3xl border border-line bg-sheet p-5",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
							className: "block text-sm font-medium",
							htmlFor: "teacher-code",
							children: ["教師密碼", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
								id: "teacher-code",
								type: "password",
								autoComplete: "current-password",
								value: code,
								onChange: (event) => setCode(event.target.value),
								className: "mt-1 h-12 w-full rounded-2xl border border-line bg-paper px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-meadow"
							})]
						}),
						error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "mt-3 text-sm text-ember",
							role: "alert",
							children: error
						}) : null,
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
							type: "submit",
							disabled: busy || !code.trim(),
							className: "mt-4 h-12 w-full rounded-full bg-meadow font-medium text-paper disabled:opacity-60",
							children: busy ? "打開緊……" : "進入後台"
						})
					]
				})
			]
		})
	});
}
//#endregion
export { TeacherPage as component };
