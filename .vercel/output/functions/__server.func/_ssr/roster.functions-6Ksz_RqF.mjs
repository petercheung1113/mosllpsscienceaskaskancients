import { t as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-A6pJPYTF.mjs";
import { r as isMisconduct } from "./conduct-CRoEMSDo.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/roster.functions-6Ksz_RqF.js
function clean(value, max) {
	if (typeof value !== "string") return "";
	return value.replace(/\s+/g, " ").trim().slice(0, max);
}
function normalizeUsername(value) {
	return value.trim().replace(/\s+/g, "").replace(/[Ａ-Ｚａ-ｚ０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 65248)).toUpperCase();
}
function readStudent(input) {
	if (!input || typeof input !== "object") throw new Error("請填寫資料");
	const data = input;
	const name = clean(data.name, 20);
	const className = clean(data.className, 12);
	const studentNo = clean(data.studentNo, 6);
	if (name.length < 1) throw new Error("請寫下姓名");
	if (className.length < 1) throw new Error("請寫下班別");
	if (!/^\d{1,6}$/.test(studentNo)) throw new Error("學號請用數字");
	return {
		name,
		className,
		studentNo
	};
}
var joinClass_createServerFn_handler = createServerRpc({
	id: "0868764a0181634dffbed1cd2a74ff3bfea151d9310316c37b8d1861dd4ebaac",
	name: "joinClass",
	filename: "src/lib/roster.functions.ts"
}, (opts) => joinClass.__executeServer(opts));
var joinClass = createServerFn({ method: "POST" }).validator(readStudent).handler(joinClass_createServerFn_handler, async ({ data }) => {
	if (isMisconduct(data.name) || isMisconduct(data.className)) return {
		ok: false,
		error: "請用有禮的姓名和班別。"
	};
	const { joinOnce } = await import("./roster.server-YDYH-MUK.mjs");
	return joinOnce(data);
});
var loginStudent_createServerFn_handler = createServerRpc({
	id: "f3aaf27a20c10df294bf4c5990543a2a271fb3a33091ab8b9a1b04af29344260",
	name: "loginStudent",
	filename: "src/lib/roster.functions.ts"
}, (opts) => loginStudent.__executeServer(opts));
var loginStudent = createServerFn({ method: "POST" }).validator((input) => {
	if (!input || typeof input !== "object") throw new Error("請輸入帳號和密碼");
	const data = input;
	const username = normalizeUsername(clean(data.username, 12));
	const password = clean(data.password, 20);
	if (!username || !password) throw new Error("請輸入帳號和密碼");
	return {
		username,
		password
	};
}).handler(loginStudent_createServerFn_handler, async ({ data }) => {
	const { loginOnce } = await import("./roster.server-YDYH-MUK.mjs");
	return loginOnce(data);
});
var unlockTeacher_createServerFn_handler = createServerRpc({
	id: "c9872655d3e81ea7c12d5a97e26d23c7780b0cea2fb9f43c02734651f75ac016",
	name: "unlockTeacher",
	filename: "src/lib/roster.functions.ts"
}, (opts) => unlockTeacher.__executeServer(opts));
var unlockTeacher = createServerFn({ method: "POST" }).validator((input) => {
	if (!input || typeof input !== "object") throw new Error("請輸入密碼");
	const code = clean(input.code, 40);
	if (!code) throw new Error("請輸入密碼");
	return { code };
}).handler(unlockTeacher_createServerFn_handler, async ({ data }) => {
	const { passwordOk, issueTeacherToken } = await import("./roster.server-YDYH-MUK.mjs");
	if (!passwordOk(data.code)) return {
		ok: false,
		error: "密碼不對"
	};
	return {
		ok: true,
		token: issueTeacherToken()
	};
});
var loadBoard_createServerFn_handler = createServerRpc({
	id: "5527fe6c19d61e1140e90e05608dbdbfce5b33eea39febd9f88828816f470dff",
	name: "loadBoard",
	filename: "src/lib/roster.functions.ts"
}, (opts) => loadBoard.__executeServer(opts));
var loadBoard = createServerFn({ method: "POST" }).validator((input) => {
	if (!input || typeof input !== "object") throw new Error("請先解鎖");
	const token = clean(input.token, 80);
	if (!token) throw new Error("請先解鎖");
	return { token };
}).handler(loadBoard_createServerFn_handler, async ({ data }) => {
	const { teacherOk, readBoard } = await import("./roster.server-YDYH-MUK.mjs");
	if (!teacherOk(data.token)) return {
		ok: false,
		error: "請再輸入密碼"
	};
	const board = await readBoard();
	return {
		ok: true,
		students: board.students,
		accounts: board.accounts
	};
});
var clearBoard_createServerFn_handler = createServerRpc({
	id: "4a8107ee6f6e8fcc1919b6a3aaf431f1ed42d1c1a3a72269624e91c4bc0364ac",
	name: "clearBoard",
	filename: "src/lib/roster.functions.ts"
}, (opts) => clearBoard.__executeServer(opts));
var clearBoard = createServerFn({ method: "POST" }).validator((input) => {
	if (!input || typeof input !== "object") throw new Error("請先解鎖");
	const token = clean(input.token, 80);
	if (!token) throw new Error("請先解鎖");
	return { token };
}).handler(clearBoard_createServerFn_handler, async ({ data }) => {
	const { teacherOk, wipeBoard } = await import("./roster.server-YDYH-MUK.mjs");
	if (!teacherOk(data.token)) return {
		ok: false,
		error: "請再輸入密碼"
	};
	await wipeBoard();
	return { ok: true };
});
//#endregion
export { clearBoard_createServerFn_handler, joinClass_createServerFn_handler, loadBoard_createServerFn_handler, loginStudent_createServerFn_handler, unlockTeacher_createServerFn_handler };
