import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { a as isCharacterId, i as getSql } from "./db-CVk9yCKN.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/roster.functions-B7GuLVRf.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
function clean(value, max) {
	if (typeof value !== "string") return "";
	return value.replace(/\s+/g, " ").trim().slice(0, max);
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
var joinClass = createServerFn({ method: "POST" }).validator(readStudent).handler(createSsrRpc("0868764a0181634dffbed1cd2a74ff3bfea151d9310316c37b8d1861dd4ebaac"));
async function addWarning(studentId) {
	const sql = await getSql();
	const rows = await sql`
    update students set warnings = warnings + 1
    where id = ${studentId} and warnings < 3
    returning warnings
  `;
	if (rows[0]) return Number(rows[0].warnings) || 0;
	const current = await sql`select warnings from students where id = ${studentId}`;
	return Number(current[0]?.warnings) || 0;
}
async function warningCount(studentId) {
	const rows = await (await getSql())`select warnings from students where id = ${studentId}`;
	return Number(rows[0]?.warnings) || 0;
}
async function recordAsk(input) {
	if (!isCharacterId(input.characterId)) return;
	const sql = await getSql();
	if (!(await sql`select id from students where id = ${input.studentId}`)[0]) return;
	await sql`
    insert into asks (id, student_id, character_id, question, answer)
    values (${crypto.randomUUID()}, ${input.studentId}, ${input.characterId}, ${input.question.slice(0, 400)}, ${input.answer.slice(0, 800)})
  `;
}
var unlockTeacher = createServerFn({ method: "POST" }).validator((input) => {
	if (!input || typeof input !== "object") throw new Error("請輸入密碼");
	const code = clean(input.code, 40);
	if (!code) throw new Error("請輸入密碼");
	return { code };
}).handler(createSsrRpc("c9872655d3e81ea7c12d5a97e26d23c7780b0cea2fb9f43c02734651f75ac016"));
var loadBoard = createServerFn({ method: "POST" }).validator((input) => {
	if (!input || typeof input !== "object") throw new Error("請先解鎖");
	const token = clean(input.token, 80);
	if (!token) throw new Error("請先解鎖");
	return { token };
}).handler(createSsrRpc("5527fe6c19d61e1140e90e05608dbdbfce5b33eea39febd9f88828816f470dff"));
//#endregion
export { recordAsk as a, loadBoard as i, createSsrRpc as n, unlockTeacher as o, joinClass as r, warningCount as s, addWarning as t };
