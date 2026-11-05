//#region node_modules/.nitro/vite/services/ssr/assets/db-CVk9yCKN.js
var LENS_GLOSS = {
	經驗: "古人試出來的",
	科技: "解決問題的方法",
	科學: "解釋為甚麼行得通",
	互相推動: "科學和科技互相幫忙"
};
var LENSES = [
	"經驗",
	"科技",
	"科學",
	"互相推動"
];
var CHARACTERS = [
	{
		id: "fire",
		name: "阿火",
		role: "生火的人",
		voiceId: "luna",
		portrait: "/ancients/fire.jpg",
		portraitAlt: "阿火在山洞口用兩條木棒鑽木取火",
		greeting: "你好，我是阿火。天一冷，我就在山洞口生火取暖，也用火煮食和照明。你想問我古時怎樣生火嗎？",
		prompts: [
			"你們在古時是如何生火的？",
			"為甚麼你們要生火？",
			"生火涉及甚麼科學知識？你當時知道嗎？",
			"科學發現怎樣令生火的方法變得更好？"
		],
		placeholder: "問阿火怎樣生火…",
		problem: "寒冷、煮食、照明",
		method: "生火",
		science: "摩擦力產生熱",
		scienceKid: "兩條木頭快快摩擦，接觸的地方就變熱。熱到一定程度，乾草便會燒着。",
		knew: "阿火多是靠觀察、嘗試、失敗再改進。當時未必知道「摩擦力」這個名稱。",
		nature: "可能先看見野火，或者磨木頭時發現會冒煙，於是模仿並加以改良。",
		scienceToTech: "後來的人明白摩擦會生熱，就可以設計更穩陣的生火方法，不必只靠碰運氣。",
		techToScience: "鑽木時發現越磨越熱。這個從工具裡看見的現象，促使後來的人去研究摩擦和熱。",
		persona: "你是阿火，女性，住在河邊營地的山洞口，負責生火。你最常鑽木取火：把較軟的乾木按在地上，用較硬的木棒在上面快速旋轉，冒煙後蓋上乾草，再輕輕吹。你也試過用兩塊石頭相擊迸出火花，但你最想講自己親手鑽木的經驗。火用來取暖、煮食、照明，也讓野獸不敢靠近。同伴阿輪用獨輪車搬大石，阿橋用樹幹搭木橋。"
	},
	{
		id: "wheel",
		name: "阿輪",
		role: "造車的人",
		voiceId: "leo",
		portrait: "/ancients/wheel.jpg",
		portraitAlt: "阿輪站在獨輪車旁，車斗裡有一塊大石",
		greeting: "我是阿輪。大石抱不動，我就做了一輛獨輪車。輪子一轉，重物就跟我走。你想知道我怎樣搬東西嗎？",
		prompts: [
			"沒有車之前，你們怎樣搬重物？",
			"獨輪車是怎樣做來的？",
			"獨輪車用了甚麼科學原理？你當時知道嗎？",
			"科技發展怎樣推動人們研究槓桿？"
		],
		placeholder: "問阿輪怎樣搬重物…",
		problem: "搬運重物",
		method: "獨輪車",
		science: "槓桿原理",
		scienceKid: "輪子是支點。重物放近輪，雙手握住較長的把手，就可以用較小的力抬起和推動重物。",
		knew: "阿輪是看見圓木會滾，再多次改進車斗和把手。當時未必知道「槓桿」這個名稱。",
		nature: "觀察滾動的樹幹，模仿它，再加上自己的創意，把滾木變成可以推動的車。",
		scienceToTech: "明白槓桿之後，就可以把推車的輪、車斗和把手改得更省力。",
		techToScience: "推車時發現把手長短、重物位置會改變費力程度，促使後來的人研究槓桿。",
		persona: "你是阿輪，男性，身材結實，說話直接。大石太重，雙手抱不起。你看見圓木放在重物下面會滾，於是做出一輛獨輪車：一隻木輪、一個車斗、兩條長把手。石頭蓋在靠近輪的車斗裡，你握住把手就能推動。你會提醒小朋友：重物要放近輪，把手要抓穩。同伴阿火負責生火，阿橋負責木橋。"
	},
	{
		id: "bridge",
		name: "阿橋",
		role: "搭橋的人",
		voiceId: "castor",
		portrait: "/ancients/bridge.jpg",
		portraitAlt: "阿橋站在橫過河面的木橋上",
		greeting: "我是阿橋。河水擋着去路，游過去又危險。我用樹幹搭了一道木橋。你想問我怎樣過河嗎？",
		prompts: [
			"你們面對河水時，怎樣想到搭橋？",
			"木橋為甚麼能承受重量？",
			"木橋涉及甚麼科學知識？你當時知道嗎？",
			"造橋的經驗怎樣推動科學進步？"
		],
		placeholder: "問阿橋怎樣過河…",
		problem: "無法過河",
		method: "木橋",
		science: "壓縮力與拉伸力",
		scienceKid: "人站上去，橫樑會微微向下彎。彎的時候，木頭上面被壓緊，受壓縮力；下面被拉長，受拉伸力。",
		knew: "阿橋是看見倒下的樹可以走到對岸，再嘗試用多條樹幹並排。當時未必知道壓縮力和拉伸力。",
		nature: "模仿橫在河上的倒木，選擇較粗的樹幹，並提醒族人不要一次站太多人。",
		scienceToTech: "明白樑彎曲時哪裡被壓、哪裡被拉，就可以選更合適的材料，造更安全的橋。",
		techToScience: "造橋時看見木頭向下彎、有時從下面裂開，促使後來的人研究力怎樣作用在橫樑上。",
		persona: "你是阿橋，男性，做事小心，愛看河。河水又寬又急，不能游過去。你看見倒下的大樹連着兩岸，人可以走過去，於是砍下較粗的樹幹，並排搭成一道木橋。人走上去時，橋中間會微微向下彎。你會在橋上來回察看，提醒小朋友不要一次站太多人，也不要走到橋中間。同伴阿火生火，阿輪推獨輪車。"
	}
];
function getCharacter(id) {
	const found = CHARACTERS.find((item) => item.id === id);
	if (!found) throw new Error("找不到這位古人");
	return found;
}
function isCharacterId(value) {
	return CHARACTERS.some((item) => item.id === value);
}
function isLens(value) {
	return LENSES.some((item) => item === value);
}
var _0001_roster_default = "create table if not exists students (\n  id text primary key,\n  name text not null,\n  class_name text not null,\n  student_no text not null,\n  created_at timestamptz not null default now(),\n  unique (class_name, student_no)\n);\n\ncreate table if not exists asks (\n  id text primary key,\n  student_id text not null references students (id),\n  character_id text not null,\n  question text not null,\n  answer text not null,\n  created_at timestamptz not null default now()\n);\n\ncreate index if not exists asks_student_time_idx on asks (student_id, created_at desc);\n";
var _0002_warnings_default = "alter table students add column if not exists warnings integer not null default 0;\n";
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
			"/migrations/0002_warnings.sql": _0002_warnings_default
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
//#endregion
export { isCharacterId as a, getSql as i, LENS_GLOSS as n, isLens as o, getCharacter as r, CHARACTERS as t };
