import { o as __toESM } from "../_runtime.mjs";
import { J as require_react, x as require_jsx_runtime, y as Link } from "../_libs/@tanstack/react-router+[...].mjs";
import { t as createServerFn } from "./ssr.mjs";
import { a as isLens, i as isCharacterId, n as LENS_GLOSS, r as getCharacter, t as CHARACTERS } from "./lesson-DvXosKj2.mjs";
import { t as greetingSpeech } from "./speak-yue-C8YC4yGG.mjs";
import { i as BookOpen, n as Send, r as RotateCcw } from "../_libs/lucide-react.mjs";
import { i as loginStudent, n as createSsrRpc, o as useServerFn } from "./roster.functions-fdOpSYnH.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-DNMrpR8F.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function readChat(input) {
	if (!input || typeof input !== "object") throw new Error("問題格式不對");
	const data = input;
	if (typeof data.characterId !== "string" || !isCharacterId(data.characterId)) throw new Error("找不到這位古人");
	if (typeof data.studentId !== "string" || !/^[0-9a-f-]{36}$/i.test(data.studentId)) throw new Error("請先登入");
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
		studentId: data.studentId,
		messages
	};
}
var askAncient = createServerFn({ method: "POST" }).validator(readChat).handler(createSsrRpc("9f1adc45fff0dccd56d7ad46a8d2dc6fe129fbac034eb0f1b077032f2b05e1ac"));
function readLine(input) {
	const data = input ?? {};
	return {
		text: typeof data.text === "string" ? data.text.replace(/\s+/g, " ").trim().slice(0, 400) : "",
		characterId: data.characterId === "wheel" || data.characterId === "bridge" ? data.characterId : "fire"
	};
}
var speakAncient = createServerFn({ method: "POST" }).validator(readLine).handler(createSsrRpc("3dac22e247b15095f3b50af940de6979534b2f6a5b526e9e2424b84cc0485c59"));
var STORAGE_KEY = "ancient-camp-v1";
function voiceLabel(voice) {
	return `${voice.name} ${voice.voiceURI}`.toLowerCase();
}
function isCantoneseVoice(voice) {
	const lang = voice.lang.toLowerCase().replaceAll("_", "-");
	const label = voiceLabel(voice);
	return lang === "zh-hk" || lang.endsWith("-hk") || lang.startsWith("yue") || /sin-?ji|善怡|cantonese|粵語|粤语/.test(label);
}
function soundsMale(voice) {
	return /eddy|艾迪|grandpa|爺爺|rocko|daniel|alex|fred|male|\bman\b|boy|男/.test(voiceLabel(voice));
}
function cantoneseVoice(id) {
	const voices = speechSynthesis.getVoices().filter(isCantoneseVoice);
	if (!voices.length) return null;
	const female = voices.find((voice) => /善怡|sin-?ji|flo|sandy|珊迪/.test(voiceLabel(voice)) && !soundsMale(voice));
	if (id === "fire") return female ?? voices.find((voice) => !soundsMale(voice)) ?? null;
	return voices.find(soundsMale) ?? voices.find((voice) => voice !== female) ?? voices[0];
}
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
function filmBuffered(el) {
	if (el.error || !Number.isFinite(el.duration) || el.duration <= 0) return false;
	if (el.readyState >= 4) return true;
	if (!el.buffered.length) return false;
	return el.buffered.end(el.buffered.length - 1) >= el.duration - .3;
}
function CampFilm({ active, onReady }) {
	const refs = (0, import_react.useRef)({});
	const [shown, setShown] = (0, import_react.useState)({});
	const onReadyRef = (0, import_react.useRef)(onReady);
	const reported = (0, import_react.useRef)(false);
	onReadyRef.current = onReady;
	function mark(id) {
		setShown((prev) => prev[id] ? prev : {
			...prev,
			[id]: true
		});
	}
	(0, import_react.useEffect)(() => {
		const tick = () => {
			const ids = Object.keys(FILMS);
			for (const id of ids) {
				const el = refs.current[id];
				if (!el || filmBuffered(el) || !el.paused) continue;
				el.play().catch(() => {});
			}
			if (reported.current) return;
			if (!ids.every((id) => {
				const el = refs.current[id];
				return Boolean(el && filmBuffered(el));
			})) return;
			reported.current = true;
			for (const id of ids) {
				if (id === active) continue;
				refs.current[id]?.pause();
			}
			onReadyRef.current();
		};
		const timer = window.setInterval(tick, 250);
		tick();
		return () => window.clearInterval(timer);
	}, [active]);
	(0, import_react.useEffect)(() => {
		for (const id of Object.keys(FILMS)) {
			const el = refs.current[id];
			if (!el || id === active || !filmBuffered(el)) continue;
			el.pause();
		}
		const el = refs.current[active];
		if (!el) return;
		const kick = () => {
			if (el.ended) el.currentTime = 0;
			if (el.paused) el.play().catch(() => {});
		};
		if (el.readyState >= 2) mark(active);
		el.addEventListener("ended", kick);
		kick();
		return () => el.removeEventListener("ended", kick);
	}, [active]);
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)(import_jsx_runtime.Fragment, { children: [Object.keys(FILMS).map((id) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("img", {
		src: FILMS[id].poster,
		alt: "",
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
		onLoadedData: () => mark(id),
		onProgress: () => {
			const el = refs.current[id];
			if (el && filmBuffered(el)) mark(id);
		},
		className: `pointer-events-none absolute inset-0 h-full w-full object-cover ${id === active && shown[id] ? "z-[2] opacity-100" : "z-0 opacity-0"}`,
		"aria-label": id === active ? "河邊營地：阿火在生火，阿輪推大石，阿橋正走過木橋" : void 0
	}, id))] });
}
function CampApp() {
	const ask = useServerFn(askAncient);
	const voice = useServerFn(speakAncient);
	const [studentId, setStudentId] = (0, import_react.useState)(null);
	const [sceneReady, setSceneReady] = (0, import_react.useState)(false);
	const [banned, setBanned] = (0, import_react.useState)(false);
	const [characterId, setCharacterId] = (0, import_react.useState)(null);
	const [threads, setThreads] = (0, import_react.useState)(freshThreads);
	const [draft, setDraft] = (0, import_react.useState)("");
	const [hint, setHint] = (0, import_react.useState)("");
	const [pendingId, setPendingId] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [lessonOpen, setLessonOpen] = (0, import_react.useState)(false);
	const [speakError, setSpeakError] = (0, import_react.useState)(null);
	const [ready, setReady] = (0, import_react.useState)(false);
	const inputRef = (0, import_react.useRef)(null);
	const speakGen = (0, import_react.useRef)(0);
	const audioCtx = (0, import_react.useRef)(null);
	const stopAudio = (0, import_react.useRef)(null);
	const characterRef = (0, import_react.useRef)(null);
	const chatGen = (0, import_react.useRef)({
		fire: 0,
		wheel: 0,
		bridge: 0
	});
	characterRef.current = characterId;
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
		const synth = window.speechSynthesis;
		if (!synth) return;
		const warm = () => {
			synth.getVoices();
		};
		warm();
		synth.addEventListener("voiceschanged", warm);
		const keep = window.setInterval(() => {
			if (synth.speaking) synth.resume();
		}, 8e3);
		return () => {
			synth.removeEventListener("voiceschanged", warm);
			window.clearInterval(keep);
			synth.cancel();
		};
	}, []);
	function primeSpeech() {
		const synth = window.speechSynthesis;
		if (!synth) return;
		synth.resume();
		if (synth.speaking || synth.pending) return;
		const warm = new SpeechSynthesisUtterance(" ");
		warm.volume = 0;
		warm.lang = "zh-HK";
		synth.speak(warm);
	}
	function unlockAudio() {
		const Ctx = window.AudioContext || window.webkitAudioContext;
		if (!Ctx) return;
		if (!audioCtx.current) audioCtx.current = new Ctx();
		audioCtx.current.resume();
	}
	function haltSpeech() {
		speakGen.current += 1;
		window.speechSynthesis?.cancel();
		stopAudio.current?.();
		stopAudio.current = null;
	}
	async function playMp3(base64, token) {
		const ctx = audioCtx.current;
		if (!ctx || speakGen.current !== token) return false;
		await ctx.resume();
		const binary = atob(base64);
		const bytes = new Uint8Array(binary.length);
		for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
		const buffer = await ctx.decodeAudioData(bytes.buffer);
		if (speakGen.current !== token) return false;
		stopAudio.current?.();
		const source = ctx.createBufferSource();
		source.buffer = buffer;
		source.connect(ctx.destination);
		stopAudio.current = () => {
			try {
				source.stop();
			} catch {}
		};
		source.start();
		return true;
	}
	async function speakLine(id, text, token, audio) {
		unlockAudio();
		const clip = audio || (await voice({ data: {
			text,
			characterId: id
		} })).audio;
		if (speakGen.current !== token) return;
		if (clip && await playMp3(clip, token)) return;
		speakCantonese(text, token, id);
	}
	function speakCantonese(text, token, id) {
		const synth = window.speechSynthesis;
		const line = text.replace(/\s+/g, " ").trim().slice(0, 320);
		if (!synth || !line || speakGen.current !== token) {
			if (!synth && speakGen.current === token) setSpeakError("這部裝置未有廣東話朗讀");
			return;
		}
		const start = () => {
			if (speakGen.current !== token) return;
			synth.cancel();
			window.setTimeout(() => {
				if (speakGen.current !== token) return;
				const utterance = new SpeechSynthesisUtterance(line);
				const picked = cantoneseVoice(id);
				if (picked) {
					utterance.voice = picked;
					utterance.lang = picked.lang || "zh-HK";
				} else utterance.lang = "zh-HK";
				utterance.rate = id === "fire" ? 1.02 : .92;
				utterance.pitch = id === "fire" ? 1.7 : id === "wheel" ? .72 : .86;
				utterance.onerror = (event) => {
					if (event.error === "canceled" || event.error === "interrupted") return;
					if (speakGen.current !== token) return;
					if (event.error === "not-allowed") setSpeakError("請再按一次，裝置先讀得出聲");
				};
				synth.resume();
				synth.speak(utterance);
				setSpeakError(null);
			}, 40);
		};
		if (speechSynthesis.getVoices().some(isCantoneseVoice) || speakGen.current !== token) {
			start();
			return;
		}
		let begun = false;
		const readyVoices = () => {
			if (begun || speakGen.current !== token) return;
			begun = true;
			synth.removeEventListener("voiceschanged", readyVoices);
			start();
		};
		synth.addEventListener("voiceschanged", readyVoices);
		window.setTimeout(readyVoices, 400);
	}
	function select(id) {
		setCharacterId(id);
		setLessonOpen(false);
		setError(null);
		setSpeakError(null);
		setHint("");
		const token = ++speakGen.current;
		unlockAudio();
		speakLine(id, greetingSpeech(id), token);
	}
	function resumeWork() {
		haltSpeech();
		setCharacterId(null);
		setError(null);
	}
	async function run(target, history, gen, token) {
		if (!studentId) return;
		setPendingId(target);
		setError(null);
		try {
			const result = await ask({ data: {
				characterId: target,
				studentId,
				messages: history.slice(-6).map(({ role, content }) => ({
					role,
					content
				}))
			} });
			if (chatGen.current[target] !== gen) return;
			if (result.locked) setBanned(true);
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
			if (characterRef.current !== target) return;
			unlockAudio();
			await speakLine(target, result.speak || result.reply, token, result.audio);
		} catch {
			if (chatGen.current[target] === gen && characterRef.current === target) setError(`${getCharacter(target).name}聽不清楚，請再送出一次。`);
		} finally {
			if (chatGen.current[target] === gen) setPendingId(null);
		}
	}
	function submit(text) {
		const trimmed = text.trim();
		if (!trimmed || pendingId || !characterId || banned) return;
		const userMsg = {
			id: crypto.randomUUID(),
			role: "user",
			content: trimmed
		};
		const history = [...threads[characterId], userMsg].slice(-20);
		const gen = ++chatGen.current[characterId];
		const token = ++speakGen.current;
		unlockAudio();
		setThreads((prev) => ({
			...prev,
			[characterId]: history
		}));
		setDraft("");
		setHint("");
		primeSpeech();
		run(characterId, history, gen, token);
	}
	function retry() {
		if (pendingId || !characterId) return;
		const history = threads[characterId];
		if (history[history.length - 1]?.role !== "user") return;
		const gen = ++chatGen.current[characterId];
		const token = ++speakGen.current;
		primeSpeech();
		run(characterId, history, gen, token);
	}
	function resetChat() {
		if (pendingId || !characterId || !person) return;
		chatGen.current[characterId] += 1;
		haltSpeech();
		setError(null);
		setThreads((prev) => ({
			...prev,
			[characterId]: [greeting(person)]
		}));
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
				left: "50%",
				top: "8%",
				width: "min(20%, 188px)"
			},
			doing: "推大石"
		},
		bridge: {
			name: {
				left: "78%",
				top: "6%"
			},
			bubble: {
				left: "80%",
				top: "14%",
				width: "min(16%, 176px)"
			},
			doing: "過橋中"
		}
	};
	const latest = [...messages].reverse().find((message) => message.role === "assistant");
	const asked = messages.some((message) => message.role === "user");
	const showBubble = Boolean(person);
	const lessonPerson = person ?? getCharacter("fire");
	const film = characterId === "fire" || characterId === "wheel" || characterId === "bridge" ? characterId : "idle";
	const tailOnLeft = person?.id === "fire" || person?.id === "wheel" || person?.id === "bridge";
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
									onReady: () => setSceneReady(true)
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
										className: "max-h-44 overflow-auto rounded-2xl border border-line bg-sheet/95 px-3 py-2 shadow-lg",
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
			sceneReady ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "absolute inset-0 z-[70] grid place-items-center bg-ink text-paper",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "font-display text-4xl",
					children: "加載中"
				})
			}),
			sceneReady ? banned ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(BannedNotice, {}) : studentId ? null : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(StudentGate, {
				onReady: setStudentId,
				onBanned: () => setBanned(true)
			}) : null
		]
	});
}
function StudentGate({ onReady, onBanned }) {
	const login = useServerFn(loginStudent);
	const [username, setUsername] = (0, import_react.useState)("");
	const [password, setPassword] = (0, import_react.useState)("");
	const [error, setError] = (0, import_react.useState)("");
	const [busy, setBusy] = (0, import_react.useState)(false);
	async function submit(event) {
		event.preventDefault();
		if (busy) return;
		setBusy(true);
		setError("");
		try {
			const result = await login({ data: {
				username,
				password
			} });
			if (!result.ok) {
				setError(result.error);
				return;
			}
			if (result.locked) onBanned();
			else onReady(result.studentId);
		} catch (caught) {
			setError(caught instanceof Error ? caught.message : "請再試一次");
		} finally {
			setBusy(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-50 grid place-items-center bg-ink/55 p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("form", {
			onSubmit: submit,
			className: "w-full max-w-md rounded-3xl border border-line bg-sheet p-6 shadow-lg",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium text-meadow",
					children: "小學科學 · 科學與科技"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "font-display text-5xl leading-none text-ink",
					children: "登入"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-2 text-pretty text-muted",
					children: "用老師派的帳號和密碼登入，就可以同古人傾偈。"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-4 block text-sm font-medium",
					htmlFor: "student-user",
					children: ["帳號", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: "student-user",
						required: true,
						autoComplete: "username",
						maxLength: 12,
						value: username,
						onChange: (event) => setUsername(event.target.value),
						placeholder: "例如：5A01",
						className: "mt-1 h-12 w-full rounded-2xl border border-line bg-paper px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-meadow"
					})]
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
					className: "mt-3 block text-sm font-medium",
					htmlFor: "student-password",
					children: ["密碼", /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						id: "student-password",
						required: true,
						type: "password",
						autoComplete: "current-password",
						inputMode: "numeric",
						maxLength: 20,
						value: password,
						onChange: (event) => setPassword(event.target.value),
						placeholder: "六位數字",
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
					disabled: busy,
					className: "mt-4 h-12 w-full rounded-full bg-meadow font-medium text-paper focus-visible:ring-2 focus-visible:ring-ember disabled:opacity-60",
					children: busy ? "登入緊……" : "登入"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 text-center text-sm text-muted",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Link, {
						to: "/teacher",
						className: "underline",
						children: "教師入口"
					})
				})
			]
		})
	});
}
function BannedNotice() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: "absolute inset-0 z-50 grid place-items-center bg-ink/70 p-4",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "w-full max-w-md rounded-3xl border border-line bg-sheet p-6 text-center shadow-lg",
			role: "alert",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "text-sm font-medium text-ember",
					children: "第 3 次警告"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
					className: "mt-2 font-display text-5xl leading-none",
					children: "不能再使用"
				}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-pretty",
					children: "你用了不尊重的說話，這個網頁已經停止。請找老師。"
				})
			]
		})
	});
}
var SplitComponent = CampApp;
//#endregion
export { SplitComponent as component };
