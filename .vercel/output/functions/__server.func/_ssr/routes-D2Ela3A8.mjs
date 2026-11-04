import { i as __toESM } from "../_runtime.mjs";
import { U as isRedirect, b as require_jsx_runtime, q as require_react, y as useRouter } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { a as isLens, i as isCharacterId, n as LENS_GLOSS, r as getCharacter, t as CHARACTERS } from "./lesson-DvXosKj2.mjs";
import { i as BookOpen, n as Send, r as RotateCcw } from "../_libs/lucide-react.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-D2Ela3A8.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
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
function readChat(input) {
	if (!input || typeof input !== "object") throw new Error("問題格式不對");
	const data = input;
	if (typeof data.characterId !== "string" || !isCharacterId(data.characterId)) throw new Error("找不到這位古人");
	if (!Array.isArray(data.messages) || data.messages.length === 0 || data.messages.length > 16) throw new Error("請把問題寫短一點");
	const messages = data.messages.map((item) => {
		if (!item || typeof item !== "object") throw new Error("問題格式不對");
		const turn = item;
		if (turn.role !== "user" && turn.role !== "assistant") throw new Error("問題格式不對");
		if (typeof turn.content !== "string") throw new Error("問題格式不對");
		const content = turn.content.replace(/\s+/g, " ").trim().slice(0, 400);
		if (!content) throw new Error("請寫下你的問題");
		return {
			role: turn.role === "assistant" ? "assistant" : "user",
			content
		};
	});
	if (messages[messages.length - 1]?.role !== "user") throw new Error("請先寫下你的問題");
	return {
		characterId: data.characterId,
		messages
	};
}
var askAncient = createServerFn({ method: "POST" }).validator(readChat).handler(createSsrRpc("9f1adc45fff0dccd56d7ad46a8d2dc6fe129fbac034eb0f1b077032f2b05e1ac"));
function readSpeech(input) {
	if (!input || typeof input !== "object") throw new Error("未能朗讀");
	const data = input;
	if (typeof data.characterId !== "string" || !isCharacterId(data.characterId)) throw new Error("找不到這位古人");
	if (typeof data.text !== "string") throw new Error("未能朗讀");
	const text = data.text.replace(/\s+/g, " ").trim().slice(0, 320);
	if (!text) throw new Error("未能朗讀");
	return {
		characterId: data.characterId,
		text
	};
}
createServerFn({ method: "POST" }).validator(readSpeech).handler(createSsrRpc("368fea765894ae01c83fc33b26a7cb9b62d940a221cabb32e82004634bfb3c04"));
var STORAGE_KEY = "ancient-camp-v1";
var SILENT_WAV = "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";
function greeting(person) {
	return {
		id: `greet-${person.id}`,
		role: "assistant",
		content: person.greeting
	};
}
function freshThreads() {
	return {
		fire: [greeting(getCharacter("fire"))],
		wheel: [greeting(getCharacter("wheel"))],
		bridge: [greeting(getCharacter("bridge"))]
	};
}
function lensClass(lens) {
	if (lens === "科技") return "bg-meadow text-paper";
	if (lens === "科學") return "bg-ember text-paper";
	if (lens === "互相推動") return "bg-meadow-deep text-paper";
	return "bg-paper-2 text-ink";
}
var FILMS = {
	idle: {
		src: "/ancients/scene-idle.mp4?v=15",
		poster: "/ancients/poster-idle.jpg?v=15"
	},
	fire: {
		src: "/ancients/scene-fire.mp4?v=15",
		poster: "/ancients/poster-fire.jpg?v=15"
	},
	wheel: {
		src: "/ancients/scene-wheel.mp4?v=15",
		poster: "/ancients/poster-wheel.jpg?v=15"
	},
	bridge: {
		src: "/ancients/scene-bridge.mp4?v=15",
		poster: "/ancients/poster-bridge.jpg?v=15"
	}
};
function CampFilm({ active, onReady }) {
	const refs = (0, import_react.useRef)({});
	const seen = (0, import_react.useRef)(/* @__PURE__ */ new Set());
	const done = (0, import_react.useRef)(false);
	const onReadyRef = (0, import_react.useRef)(onReady);
	onReadyRef.current = onReady;
	function note(id) {
		seen.current.add(id);
		if (!done.current && seen.current.size === Object.keys(FILMS).length) {
			done.current = true;
			onReadyRef.current();
		}
	}
	(0, import_react.useEffect)(() => {
		for (const id of Object.keys(FILMS)) {
			const el = refs.current[id];
			if (el && el.readyState >= 3) note(id);
		}
		const timer = window.setTimeout(() => {
			if (!done.current) {
				done.current = true;
				onReadyRef.current();
			}
		}, 12e3);
		return () => window.clearTimeout(timer);
	}, []);
	(0, import_react.useEffect)(() => {
		for (const id of Object.keys(FILMS)) {
			const el = refs.current[id];
			if (!el || id === active) continue;
			el.pause();
		}
		const el = refs.current[active];
		if (!el) return;
		const kick = () => {
			if (el.ended) el.currentTime = 0;
			if (el.paused) el.play().catch(() => {});
		};
		el.addEventListener("ended", kick);
		kick();
		return () => el.removeEventListener("ended", kick);
	}, [active]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [Object.keys(FILMS).map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: FILMS[id].poster,
		alt: "",
		loading: "eager",
		className: `pointer-events-none absolute inset-0 h-full w-full object-cover ${id === active ? "z-[1]" : "hidden"}`
	}, `${id}-still`)), Object.keys(FILMS).map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("video", {
		"data-film": id,
		ref: (node) => {
			refs.current[id] = node;
		},
		src: FILMS[id].src,
		poster: FILMS[id].poster,
		muted: true,
		loop: true,
		playsInline: true,
		autoPlay: true,
		preload: "auto",
		onCanPlayThrough: () => note(id),
		onError: () => note(id),
		className: `pointer-events-none absolute inset-0 h-full w-full object-cover ${id === active ? "z-[2] opacity-100" : "z-0 opacity-0"}`,
		"aria-label": id === active ? "河邊營地：阿火在生火，阿輪推大石，阿橋正走過木橋" : void 0
	}, id))] });
}
function CampApp() {
	const ask = useServerFn(askAncient);
	const [characterId, setCharacterId] = (0, import_react.useState)(null);
	const [filmReady, setFilmReady] = (0, import_react.useState)(false);
	const [threads, setThreads] = (0, import_react.useState)(freshThreads);
	const [draft, setDraft] = (0, import_react.useState)("");
	const [hint, setHint] = (0, import_react.useState)("");
	const [pendingId, setPendingId] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [lessonOpen, setLessonOpen] = (0, import_react.useState)(false);
	const [speakError, setSpeakError] = (0, import_react.useState)(null);
	const [ready, setReady] = (0, import_react.useState)(false);
	const inputRef = (0, import_react.useRef)(null);
	const audioRef = (0, import_react.useRef)(null);
	const speakGen = (0, import_react.useRef)(0);
	const characterRef = (0, import_react.useRef)(null);
	const chatGen = (0, import_react.useRef)({
		fire: 0,
		wheel: 0,
		bridge: 0
	});
	characterRef.current = characterId;
	const booted = filmReady;
	const person = characterId ? getCharacter(characterId) : null;
	const messages = characterId ? threads[characterId] : [];
	const waiting = Boolean(characterId) && pendingId === characterId;
	(0, import_react.useEffect)(() => {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (raw) {
				const saved = JSON.parse(raw);
				if (saved.characterId && isCharacterId(saved.characterId) && saved.threads) {
					const next = freshThreads();
					for (const item of CHARACTERS) {
						const stored = saved.threads[item.id];
						if (Array.isArray(stored) && stored.length > 0) next[item.id] = stored.slice(-20);
					}
					setThreads(next);
				}
			}
		} catch {}
		setReady(true);
	}, []);
	(0, import_react.useEffect)(() => {
		if (!ready) return;
		localStorage.setItem(STORAGE_KEY, JSON.stringify({
			characterId,
			threads
		}));
	}, [
		ready,
		characterId,
		threads
	]);
	(0, import_react.useEffect)(() => {
		return () => {
			audioRef.current?.pause();
		};
	}, []);
	function primeSpeech() {
		const audio = audioRef.current ?? new Audio();
		audioRef.current = audio;
		audio.src = SILENT_WAV;
		audio.play().catch(() => void 0);
	}
	function select(id) {
		setCharacterId(id);
		setLessonOpen(false);
		setError(null);
		setSpeakError(null);
		setHint("");
		audioRef.current?.pause();
		speakGen.current += 1;
	}
	function resumeWork() {
		audioRef.current?.pause();
		speakGen.current += 1;
		setCharacterId(null);
		setError(null);
	}
	async function run(target, history, gen) {
		setPendingId(target);
		setError(null);
		try {
			const result = await ask({ data: {
				characterId: target,
				messages: history.slice(-6).map(({ role, content }) => ({
					role,
					content
				}))
			} });
			if (chatGen.current[target] !== gen) return;
			if (!result.ok) {
				if (characterRef.current === target) setError(result.error);
				return;
			}
			const reply = {
				id: crypto.randomUUID(),
				role: "assistant",
				content: result.reply,
				lens: isLens(result.lens) ? result.lens : "經驗",
				think: result.think
			};
			setThreads((prev) => ({
				...prev,
				[target]: [...history, reply].slice(-20)
			}));
			if (characterRef.current === target && result.audio) playReady(result.mime, result.audio);
		} catch {
			if (chatGen.current[target] === gen && characterRef.current === target) setError(`${getCharacter(target).name}聽不清楚，請再送出一次。`);
		} finally {
			if (chatGen.current[target] === gen) setPendingId(null);
		}
	}
	function submit(text) {
		const trimmed = text.trim();
		if (!trimmed || pendingId || !characterId) return;
		const userMsg = {
			id: crypto.randomUUID(),
			role: "user",
			content: trimmed
		};
		const history = [...threads[characterId], userMsg].slice(-20);
		const gen = ++chatGen.current[characterId];
		setThreads((prev) => ({
			...prev,
			[characterId]: history
		}));
		setDraft("");
		setHint("");
		primeSpeech();
		run(characterId, history, gen);
	}
	function retry() {
		if (pendingId || !characterId) return;
		const history = threads[characterId];
		if (history[history.length - 1]?.role !== "user") return;
		const gen = ++chatGen.current[characterId];
		primeSpeech();
		run(characterId, history, gen);
	}
	function resetChat() {
		if (pendingId || !characterId || !person) return;
		chatGen.current[characterId] += 1;
		audioRef.current?.pause();
		speakGen.current += 1;
		setError(null);
		setThreads((prev) => ({
			...prev,
			[characterId]: [greeting(person)]
		}));
	}
	function playReady(mime, audioB64) {
		if (!audioB64) return;
		const gen = ++speakGen.current;
		const audio = audioRef.current ?? new Audio();
		audioRef.current = audio;
		audio.pause();
		setSpeakError(null);
		audio.src = `data:${mime || "audio/mpeg"};base64,${audioB64}`;
		audio.play().catch(() => {
			if (gen === speakGen.current) setSpeakError("暫時未能朗讀");
		});
	}
	const spots = {
		fire: {
			name: {
				left: "13%",
				top: "45%"
			},
			bubble: {
				left: "24%",
				top: "48%",
				width: "min(22%, 200px)"
			},
			doing: "生火中"
		},
		wheel: {
			name: {
				left: "34%",
				top: "25%"
			},
			bubble: {
				left: "44%",
				top: "18%",
				width: "min(22%, 200px)"
			},
			doing: "推大石"
		},
		bridge: {
			name: {
				left: "50%",
				top: "21%"
			},
			bubble: {
				left: "60%",
				top: "14%",
				width: "min(22%, 200px)"
			},
			doing: "過橋中"
		}
	};
	const latest = [...messages].reverse().find((message) => message.role === "assistant");
	const asked = messages.some((message) => message.role === "user");
	const showBubble = Boolean(person);
	const lessonPerson = person ?? getCharacter("fire");
	const film = characterId === "fire" || characterId === "wheel" || characterId === "bridge" ? characterId : "idle";
	const tailOnLeft = person?.id === "fire";
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "relative h-dvh overflow-hidden bg-ink text-ink",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "sr-only",
				children: "按下正在生火、推車或過橋的古人，他們會停下來。在最底打字發問，答案會出現在他們旁邊的對話泡泡。"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "scene-slot relative h-full",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
						src: "/ancients/valley.jpg",
						alt: "",
						className: "absolute inset-0 h-full w-full object-cover blur-md"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-0 grid place-items-center",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "stage",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CampFilm, {
									active: film,
									onReady: () => setFilmReady(true)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "pointer-events-none absolute top-3 left-3 z-10 rounded-2xl bg-sheet/90 px-3 py-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
										className: "text-sm font-medium text-meadow",
										children: "小學科學 · 科學與科技"
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
										className: "font-display text-3xl leading-none text-ink",
										children: "古人問一問"
									})]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "button",
									onClick: () => setLessonOpen((open) => !open),
									"aria-expanded": lessonOpen,
									className: "absolute top-3 right-3 z-10 inline-flex min-h-11 items-center gap-1 rounded-full bg-sheet/90 px-3 text-sm focus-visible:ring-2 focus-visible:ring-meadow",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(BookOpen, {
										className: "size-4",
										"aria-hidden": true
									}), "本課重點"]
								}),
								Object.keys(spots).map((id) => {
									const item = getCharacter(id);
									const spot = spots[id];
									const paused = characterId === id;
									return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
										type: "button",
										onClick: () => select(id),
										"aria-pressed": paused,
										"aria-label": paused ? `${item.name}望住你，打個招呼` : `按下${item.name}，叫${item.name}停低打招呼`,
										className: "absolute z-10 -translate-x-1/2 cursor-pointer rounded-full bg-meadow-deep/90 px-2.5 py-1 text-sm font-medium whitespace-nowrap text-paper touch-manipulation focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheet",
										style: spot.name,
										children: [
											item.name,
											" · ",
											spot.doing
										]
									}, id);
								}),
								person && showBubble ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "say",
									style: spots[person.id].bubble,
									role: "status",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
										"aria-hidden": true,
										className: `absolute size-3 rotate-45 border border-line bg-sheet ${tailOnLeft ? "-left-1.5 top-8 border-t-0 border-r-0" : "-right-1.5 top-8 border-b-0 border-l-0"}`
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
										className: "max-h-36 overflow-auto rounded-2xl border border-line bg-sheet/95 px-3 py-2 shadow-lg",
										children: [
											/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "text-sm font-medium text-meadow",
												children: person.name
											}),
											waiting ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "mt-1 text-pretty",
												children: [person.name, "正在回想……"]
											}) : error ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												role: "alert",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
													className: "mt-1 text-pretty",
													children: error
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													onClick: retry,
													className: "mt-1 min-h-11 font-medium text-ember focus-visible:ring-2 focus-visible:ring-ember",
													children: "再送出一次"
												})]
											}) : asked && latest ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 text-pretty",
												children: latest.content
											}), latest.lens ? /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
												className: "mt-2 text-sm",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: `rounded-full px-2.5 py-1 font-medium ${lensClass(latest.lens)}`,
													children: latest.lens
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "ml-2 text-muted",
													children: LENS_GLOSS[latest.lens]
												})]
											}) : null] }) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 text-pretty",
												children: person.greeting
											}),
											speakError ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
												className: "mt-1 text-sm text-muted",
												children: speakError
											}) : null,
											/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
												className: "mt-1 flex flex-wrap items-center gap-1",
												children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													onClick: resumeWork,
													className: "min-h-11 rounded-full px-2 text-sm focus-visible:ring-2 focus-visible:ring-meadow",
													children: "繼續工作"
												}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
													type: "button",
													onClick: resetChat,
													disabled: Boolean(pendingId),
													"aria-label": `重置和${person.name}的對話`,
													className: "inline-flex size-11 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:ring-meadow disabled:opacity-50",
													children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(RotateCcw, {
														className: "size-4",
														"aria-hidden": true
													})
												})]
											})
										]
									})]
								}) : null
							]
						})
					}),
					lessonOpen ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "absolute inset-x-3 top-16 z-20 max-h-[70%] overflow-y-auto md:inset-x-auto md:right-3 md:w-96",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "rounded-2xl border border-line bg-sheet p-4",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
									className: "font-display text-3xl leading-none",
									children: "本課要記住"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
									className: "mt-2 text-sm text-pretty text-muted",
									children: "學習目標：知道科學發現能促進科技的發展，而科技的發展亦能推動科學進步。"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
									className: "mt-3 flex flex-col gap-2",
									children: CHARACTERS.map((item) => {
										const shown = lessonPerson.id === item.id;
										return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
											type: "button",
											"aria-pressed": shown,
											onClick: () => select(item.id),
											className: `w-full rounded-xl border px-3 py-2 text-left focus-visible:ring-2 focus-visible:ring-meadow ${shown ? "border-meadow bg-paper" : "border-transparent bg-paper"}`,
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
												className: "block text-sm text-muted",
												children: item.problem
											}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "block font-medium",
												children: [item.method, /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
													className: "ml-2 font-normal text-meadow",
													children: item.science
												})]
											})]
										}) }, item.id);
									})
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 space-y-2 text-sm",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
											className: "text-pretty",
											children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
												className: "font-medium",
												children: [lessonPerson.name, "的方法。 "]
											}), lessonPerson.scienceKid]
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-pretty text-muted",
											children: lessonPerson.knew
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
											className: "text-pretty text-muted",
											children: lessonPerson.nature
										})
									]
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
									className: "mt-3 grid gap-2",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "rounded-xl bg-paper px-3 py-2 text-sm text-pretty",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-medium text-meadow",
											children: "科學 → 科技　"
										}), lessonPerson.scienceToTech]
									}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
										className: "rounded-xl bg-paper px-3 py-2 text-sm text-pretty",
										children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
											className: "font-medium text-ember",
											children: "科技 → 科學　"
										}), lessonPerson.techToScience]
									})]
								})
							]
						})
					}) : null,
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
						className: "safe-bottom pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-ink/55 to-transparent px-3 pt-8 pb-3",
						onSubmit: (event) => {
							event.preventDefault();
							submit(draft);
						},
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "pointer-events-auto mx-auto flex max-w-3xl gap-2",
							children: [
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("label", {
									htmlFor: "ask",
									className: "sr-only",
									children: person ? `問${person.name}` : "先選擇一位古人"
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
									id: "ask",
									ref: inputRef,
									maxLength: 160,
									enterKeyHint: "send",
									autoComplete: "off",
									disabled: !person || Boolean(pendingId),
									placeholder: person ? person.placeholder : "先按下一位正在工作的古人",
									className: "h-12 min-w-0 flex-1 rounded-full border border-line bg-sheet px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-meadow disabled:opacity-80",
									value: draft,
									onChange: (event) => setDraft(event.target.value)
								}),
								/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
									type: "submit",
									disabled: !person || !draft.trim() || Boolean(pendingId),
									className: "inline-flex h-12 min-w-20 items-center justify-center gap-1 rounded-full bg-ember px-4 font-medium text-paper focus-visible:ring-2 focus-visible:ring-meadow disabled:opacity-50",
									children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Send, {
										className: "size-4",
										"aria-hidden": true
									}), "送出"]
								})
							]
						}), hint ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
							className: "sr-only",
							children: hint
						}) : null]
					})
				]
			}),
			booted ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 z-40 grid place-items-center bg-ink/80 text-paper",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-4xl",
					children: "加載中"
				})
			})
		]
	});
}
var SplitComponent = CampApp;
//#endregion
export { SplitComponent as component };
