import { i as isCharacterId, r as getCharacter } from "./lesson-DvXosKj2.mjs";
import { r as isMisconduct } from "./conduct-CRoEMSDo.mjs";
import { createHmac, timingSafeEqual } from "node:crypto";
//#region node_modules/.nitro/vite/services/ssr/assets/roster.server-YDYH-MUK.js
var _0001_roster_default = "create table if not exists students (\n  id text primary key,\n  name text not null,\n  class_name text not null,\n  student_no text not null,\n  created_at timestamptz not null default now(),\n  unique (class_name, student_no)\n);\n\ncreate table if not exists asks (\n  id text primary key,\n  student_id text not null references students (id),\n  character_id text not null,\n  question text not null,\n  answer text not null,\n  created_at timestamptz not null default now()\n);\n\ncreate index if not exists asks_student_time_idx on asks (student_id, created_at desc);\n";
var _0002_warnings_default = "alter table students add column if not exists warnings integer not null default 0;\n";
var _0003_accounts_default = "alter table students add column if not exists username text;\nalter table students add column if not exists password_hash text;\ncreate unique index if not exists students_username_idx on students (username);\n";
var _0004_claimed_default = "alter table students add column if not exists claimed boolean not null default false;\n";
/**
* Migration bookkeeping shared by the two appliers — `scripts/migrate.mjs`
* (deploy, `readdir`) and `src/lib/db.ts` (PGLite preview, `import.meta.glob`).
*
* Applied files are keyed by BASENAME, so the same file applies once no matter
* which directory it is globbed from. That is what makes the auth schema safe to
* copy from `migrations/auth/` into `migrations/` when an app turns sign-in on:
* a database that already has `0001_auth.sql` will not re-run it.
*
* Neither applier descends into subdirectories, so `migrations/auth/*.sql` is
* out of scope for both until it is copied up.
*/
/**
* The `_migrations` key for a migration path (or bare filename).
* @param {string} path
* @returns {string}
*/
function migrationName(path) {
	return path.split("/").pop() ?? path;
}
/**
* @param {string} path
* @returns {boolean}
*/
function isMigrationFile(path) {
	return path.endsWith(".sql");
}
/**
* Migrations in `paths` that are not yet in `applied`, in apply order.
* Non-`.sql` entries (a `readdir` also yields `migrations/auth/`) are dropped.
* @param {Iterable<string>} paths
* @param {Iterable<string>} applied
* @returns {Array<{ name: string, path: string }>}
*/
function pendingMigrations(paths, applied) {
	const done = new Set(applied);
	return [...paths].filter(isMigrationFile).map((path) => ({
		name: migrationName(path),
		path
	})).sort((a, b) => a.name.localeCompare(b.name)).filter(({ name }) => !done.has(name));
}
var rawDatabaseUrl = typeof process !== "undefined" ? process.env.DATABASE_URL : void 0;
var databaseUrl = rawDatabaseUrl && rawDatabaseUrl.trim() ? rawDatabaseUrl : void 0;
/**
* Active backend: real **Neon** when `DATABASE_URL` is set (deployed / configured
* sandbox), otherwise a local embedded **PGLite** (Postgres compiled to WASM) so
* the app has a working database even with nothing configured — the live preview
* included. Swap in Neon later by just setting `DATABASE_URL`; no code changes.
*/
var dbSource = databaseUrl ? "neon" : "pglite";
/**
* Init state lives on globalThis as promises: dev HMR creates new instances of
* this module, and two instances racing module-level state would open a second
* pool or run two concurrent PGLite migration passes (whose duplicate
* `_migrations` insert rejects — and would get memoized, poisoning every later
* `getSql()`). A failed init clears its slot so the next call retries.
*/
var globalRef = globalThis;
/**
* Result-type parity: Postgres sends every value as text plus a type OID — the
* JS value is the DRIVER's parsing choice, and pg and PGLite disagree (pg:
* int8 -> string, date -> local-midnight Date; PGLite: int8 -> BigInt, which
* JSON.stringify rejects, date -> UTC Date). Normalize both so preview and
* production return identical, JSON-safe shapes:
*   int8/bigint (incl. count(*)) -> number (past 2^53 loses precision — cast
*                                   `::text` if you ever need huge integers)
*   date                         -> 'YYYY-MM-DD' string
*   interval                     -> Postgres interval text
* numeric already comes back as a string on both (arbitrary precision).
*/
var OID_INT8 = 20;
var OID_DATE = 1082;
var OID_INTERVAL = 1186;
var identity = (v) => v;
/** Wrap a query runner in the tagged-template + `.query()` `Sql` surface. */
function toSql(run) {
	const sql = (async (strings, ...values) => {
		let text = strings[0];
		for (let i = 0; i < values.length; i += 1) text += `$${i + 1}${strings[i + 1]}`;
		return run(text, values);
	});
	sql.query = (text, params = []) => run(text, params);
	return sql;
}
function createNeonSql() {
	globalRef.__pgSqlPromise__ ??= (async () => {
		const { Pool, types } = await import("../_libs/pg.mjs").then((n) => n.t);
		types.setTypeParser(OID_INT8, Number);
		types.setTypeParser(OID_DATE, identity);
		types.setTypeParser(OID_INTERVAL, identity);
		const pool = new Pool({ connectionString: databaseUrl });
		return toSql(async (text, params) => {
			return (await pool.query(text, params)).rows;
		});
	})().catch((err) => {
		globalRef.__pgSqlPromise__ = void 0;
		throw err;
	});
	return globalRef.__pgSqlPromise__;
}
async function createPgliteSql() {
	globalRef.__pgliteInstance__ ??= (async () => {
		const { PGlite } = await import("../_libs/electric-sql__pglite.mjs").then((n) => n.t);
		const pg = new PGlite({ parsers: {
			[OID_INT8]: Number,
			[OID_DATE]: identity,
			[OID_INTERVAL]: identity
		} });
		await pg.waitReady;
		await pg.exec("create table if not exists _migrations (name text primary key, applied_at timestamptz not null default now())");
		return pg;
	})().catch((err) => {
		globalRef.__pgliteInstance__ = void 0;
		throw err;
	});
	const pg = await globalRef.__pgliteInstance__;
	const migrate = async () => {
		const migrations = /* #__PURE__ */ Object.assign({
			"/migrations/0001_roster.sql": _0001_roster_default,
			"/migrations/0002_warnings.sql": _0002_warnings_default,
			"/migrations/0003_accounts.sql": _0003_accounts_default,
			"/migrations/0004_claimed.sql": _0004_claimed_default
		});
		const done = (await pg.query("select name from _migrations")).rows.map((r) => r.name);
		for (const { name, path } of pendingMigrations(Object.keys(migrations), done)) await pg.transaction(async (tx) => {
			await tx.exec(migrations[path]);
			await tx.query("insert into _migrations (name) values ($1)", [name]);
		});
	};
	const pass = (globalRef.__pgliteMigrateChain__ ?? Promise.resolve()).catch(() => void 0).then(migrate);
	globalRef.__pgliteMigrateChain__ = pass;
	await pass;
	return toSql(async (text, params) => {
		return (await pg.query(text, params)).rows;
	});
}
var sqlPromise = null;
async function createSql() {
	if (typeof window !== "undefined") throw new Error("@/lib/db is server-only — call getSql() from a createServerFn handler or a server route loader, never from client code.");
	return dbSource === "neon" ? createNeonSql() : createPgliteSql();
}
/**
* Get the shared, **server-only** SQL client. Neon when `DATABASE_URL` is set,
* otherwise the local PGLite fallback. Memoized — safe to call per request.
*
* Schema comes from `migrations/*.sql`, auto-applied before the first query on
* both backends — define tables there, never inline in server functions.
*/
function getSql() {
	sqlPromise ??= createSql().catch((err) => {
		sqlPromise = null;
		throw err;
	});
	return sqlPromise;
}
/**
* Finish DB bootstrap before the server handles traffic.
*
* - **PGLite** (preview / no `DATABASE_URL`): open the in-memory DB and apply
*   `migrations/*.sql`. Idempotent — concurrent callers share one promise.
* - **Neon**: no-op (pool is created lazily on first query).
*
* Vite `configureServer` awaits this at dev startup; production imports of this
* module kick it off immediately (see bottom of file).
*/
function ensureDbReady() {
	if (dbSource !== "pglite") return Promise.resolve();
	return getSql().then(() => void 0);
}
var globalBoot = globalThis;
if (typeof window === "undefined" && dbSource === "pglite") globalBoot.__pgBootstrapPromise__ ??= ensureDbReady().catch((err) => {
	globalBoot.__pgBootstrapPromise__ = void 0;
	console.error("[db] PGLite bootstrap failed:", err);
	throw err;
});
var TEACHER_CODE = "26430707";
var USED = "該學號在此班別已被使用";
function passwordHash(password) {
	return createHmac("sha256", "camp-login-v1").update(password).digest("hex");
}
function teacherToken() {
	return createHmac("sha256", TEACHER_CODE).update("roster-v1").digest("hex");
}
function same(left, right) {
	const a = Buffer.from(left);
	const b = Buffer.from(right);
	if (a.length !== b.length) return false;
	return timingSafeEqual(a, b);
}
function teacherOk(token) {
	return same(token, teacherToken());
}
function passwordOk(code) {
	return same(code, TEACHER_CODE);
}
function issueTeacherToken() {
	return teacherToken();
}
function canonClass(value) {
	return value.trim().replace(/\s+/g, "").replace(/[Ａ-Ｚａ-ｚ０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 65248)).toUpperCase();
}
function canonNo(value) {
	return value.replace(/^0+(?=\d)/, "");
}
async function ensureClassAccounts() {
	const { CLASS_ACCOUNTS } = await import("./class-accounts.server-D2PkCdt9.mjs");
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
async function joinOnce(data) {
	if (isMisconduct(data.name) || isMisconduct(data.className)) return {
		ok: false,
		error: "請用有禮的姓名和班別。"
	};
	const sql = await getSql();
	const className = canonClass(data.className);
	const studentNo = canonNo(data.studentNo);
	if ((await sql`
    select id from students
    where upper(class_name) = ${className} and ltrim(student_no, '0') = ${studentNo}
  `)[0]) return {
		ok: false,
		error: USED
	};
	const id = crypto.randomUUID();
	await sql`
    insert into students (id, name, class_name, student_no, claimed)
    values (${id}, ${data.name}, ${className}, ${studentNo}, true)
  `;
	return {
		ok: true,
		studentId: id,
		warnings: 0,
		locked: false
	};
}
async function loginOnce(data) {
	await ensureClassAccounts();
	const sql = await getSql();
	const row = (await sql`
    select id, password_hash, warnings from students where username = ${data.username}
  `)[0];
	const expected = row?.password_hash ?? "";
	if (!row || !expected || !same(passwordHash(data.password), expected)) return {
		ok: false,
		error: "帳號或密碼不對"
	};
	if (!(await sql`
    update students set claimed = true
    where id = ${row.id} and claimed = false
    returning id
  `)[0]) return {
		ok: false,
		error: USED
	};
	const warnings = Number(row.warnings) || 0;
	return {
		ok: true,
		studentId: row.id,
		warnings,
		locked: warnings >= 3
	};
}
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
async function readBoard() {
	await ensureClassAccounts();
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
	const { CLASS_ACCOUNTS } = await import("./class-accounts.server-D2PkCdt9.mjs");
	return {
		students,
		accounts: CLASS_ACCOUNTS
	};
}
async function wipeBoard() {
	const sql = await getSql();
	await sql`delete from asks`;
	await sql`delete from students`;
	await ensureClassAccounts();
}
//#endregion
export { addWarning, issueTeacherToken, joinOnce, loginOnce, passwordOk, readBoard, recordAsk, teacherOk, warningCount, wipeBoard };
