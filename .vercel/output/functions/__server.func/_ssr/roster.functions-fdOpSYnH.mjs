import { o as __toESM } from "../_runtime.mjs";
import { J as require_react, W as isRedirect, b as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/roster.functions-fdOpSYnH.js
var import_react = /* @__PURE__ */ __toESM(require_react());
function useServerFn(serverFn) {
	const router = useRouter();
	return import_react.useCallback(async (...args) => {
		try {
			const res = await serverFn(...args);
			if (isRedirect(res)) throw res;
			return res;
		} catch (err) {
			if (isRedirect(err)) {
				err.options._fromLocation = router.stores.location.get();
				return router.navigate(router.resolveRedirect(err).options);
			}
			throw err;
		}
	}, [router, serverFn]);
}
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
createServerFn({ method: "POST" }).validator(readStudent).handler(createSsrRpc("0868764a0181634dffbed1cd2a74ff3bfea151d9310316c37b8d1861dd4ebaac"));
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
}).handler(createSsrRpc("f3aaf27a20c10df294bf4c5990543a2a271fb3a33091ab8b9a1b04af29344260"));
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
var clearBoard = createServerFn({ method: "POST" }).validator((input) => {
	if (!input || typeof input !== "object") throw new Error("請先解鎖");
	const token = clean(input.token, 80);
	if (!token) throw new Error("請先解鎖");
	return { token };
}).handler(createSsrRpc("4a8107ee6f6e8fcc1919b6a3aaf431f1ed42d1c1a3a72269624e91c4bc0364ac"));
//#endregion
export { unlockTeacher as a, loginStudent as i, createSsrRpc as n, useServerFn as o, loadBoard as r, clearBoard as t };
