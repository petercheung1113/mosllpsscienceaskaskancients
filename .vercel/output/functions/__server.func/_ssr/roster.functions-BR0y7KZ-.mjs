import { t as createServerFn } from "./ssr.mjs";
import { i as isMisconduct, n as createServerRpc } from "./conduct-BqUxUOVJ.mjs";
import { a as isCharacterId, i as getSql, r as getCharacter } from "./db-CVk9yCKN.mjs";
import { createHmac, timingSafeEqual } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/roster.functions-BR0y7KZ-.js
var TEACHER_CODE = process.env.TEACHER_CODE?.trim() || "mosllps123456";
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
	const sql = await getSql();
	const found = await sql`
      select id, warnings from students where class_name = ${data.className} and student_no = ${data.studentNo}
    `;
	if (found[0]) {
		await sql`update students set name = ${data.name} where id = ${found[0].id}`;
		const warnings = Number(found[0].warnings) || 0;
		return {
			ok: true,
			studentId: found[0].id,
			warnings,
			locked: warnings >= 3
		};
	}
	const id = crypto.randomUUID();
	await sql`
      insert into students (id, name, class_name, student_no)
      values (${id}, ${data.name}, ${data.className}, ${data.studentNo})
    `;
	return {
		ok: true,
		studentId: id,
		warnings: 0,
		locked: false
	};
});
function teacherToken() {
	return createHmac("sha256", TEACHER_CODE).update("roster-v1").digest("hex");
}
function same(left, right) {
	const a = Buffer.from(left);
	const b = Buffer.from(right);
	if (a.length !== b.length) return false;
	return timingSafeEqual(a, b);
}
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
	if (!same(data.code, TEACHER_CODE)) return {
		ok: false,
		error: "密碼不對"
	};
	return {
		ok: true,
		token: teacherToken()
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
	if (!same(data.token, teacherToken())) return {
		ok: false,
		error: "請再輸入密碼"
	};
	const rows = await (await getSql())`
      select s.id, s.name, s.class_name, s.student_no, s.warnings,
             a.character_id, a.question, a.answer, a.created_at::text as at
      from students s
      left join asks a on a.student_id = s.id
      order by s.class_name, s.student_no, a.created_at desc nulls last
    `;
	const students = [];
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
				asks: []
			};
			students.push(student);
		}
		if (row.question && row.answer && row.character_id && isCharacterId(row.character_id)) student.asks.push({
			character: getCharacter(row.character_id).name,
			question: row.question,
			answer: row.answer,
			at: row.at ?? ""
		});
	}
	return {
		ok: true,
		students
	};
});
//#endregion
export { joinClass_createServerFn_handler, loadBoard_createServerFn_handler, unlockTeacher_createServerFn_handler };
