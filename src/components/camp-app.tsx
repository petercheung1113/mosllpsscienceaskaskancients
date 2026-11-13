import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { BookOpen, RotateCcw, Send } from "lucide-react";
import { askAncient } from "@/lib/ask.functions";
import { greetingSpeech } from "@/lib/speak-yue";
import { speakAncient } from "@/lib/voice.functions";
import { joinClass } from "@/lib/roster.functions";
import {
  CHARACTERS,
  LENS_GLOSS,
  getCharacter,
  isCharacterId,
  isLens,
  type Character,
  type CharacterId,
  type Lens,
} from "@/lib/lesson";

type Msg = {
  id: string;
  role: "user" | "assistant";
  content: string;
  lens?: Lens;
  think?: string;
};

type Threads = Record<CharacterId, Msg[]>;
type FilmId = "idle" | CharacterId;

const STORAGE_KEY = "ancient-camp-v1";

function voiceLabel(voice: SpeechSynthesisVoice): string {
  return `${voice.name} ${voice.voiceURI}`.toLowerCase();
}

function isCantoneseVoice(voice: SpeechSynthesisVoice): boolean {
  const lang = voice.lang.toLowerCase().replaceAll("_", "-");
  const label = voiceLabel(voice);
  return lang === "zh-hk" || lang.endsWith("-hk") || lang.startsWith("yue") || /sin-?ji|善怡|cantonese|粵語|粤语/.test(label);
}

function soundsMale(voice: SpeechSynthesisVoice): boolean {
  return /eddy|艾迪|grandpa|爺爺|rocko|daniel|alex|fred|male|\bman\b|boy|男/.test(voiceLabel(voice));
}

function cantoneseVoice(id: CharacterId): SpeechSynthesisVoice | null {
  const voices = speechSynthesis.getVoices().filter(isCantoneseVoice);
  if (!voices.length) return null;
  const female = voices.find((voice) => /善怡|sin-?ji|flo|sandy|珊迪/.test(voiceLabel(voice)) && !soundsMale(voice)) ?? null;
  if (id === "fire") return female;
  return voices.find((voice) => soundsMale(voice)) ?? null;
}

function allowDeviceVoice(id: CharacterId): boolean {
  if (typeof speechSynthesis === "undefined") return false;
  return Boolean(cantoneseVoice(id));
}

async function waitMs(ms: number): Promise<string> {
  return new Promise((resolve) => window.setTimeout(() => resolve(""), ms));
}

function idWait(id: CharacterId): number {
  return allowDeviceVoice(id) ? 250 : 7000;
}

function greeting(person: Character): Msg {
  return {
    id: `greet-${person.id}`,
    role: "assistant",
    content: person.greeting,
  };
}

function freshThreads(): Threads {
  return {
    fire: [greeting(getCharacter("fire"))],
    wheel: [greeting(getCharacter("wheel"))],
    bridge: [greeting(getCharacter("bridge"))],
  };
}

function lensClass(lens: Lens): string {
  if (lens === "科技") return "bg-meadow text-paper";
  if (lens === "科學") return "bg-ember text-paper";
  if (lens === "互相推動") return "bg-meadow-deep text-paper";
  return "bg-paper-2 text-ink";
}

const FILMS: Record<FilmId, { src: string; poster: string }> = {
  idle: { src: "/ancients/scene-idle.mp4?v=15", poster: "/ancients/poster-idle.jpg?v=15" },
  fire: { src: "/ancients/scene-fire.mp4?v=15", poster: "/ancients/poster-fire.jpg?v=15" },
  wheel: { src: "/ancients/scene-wheel.mp4?v=15", poster: "/ancients/poster-wheel.jpg?v=15" },
  bridge: { src: "/ancients/scene-bridge.mp4?v=15", poster: "/ancients/poster-bridge.jpg?v=15" },
};

function filmBuffered(el: HTMLVideoElement): boolean {
  if (el.error || !Number.isFinite(el.duration) || el.duration <= 0) return false;
  if (el.readyState >= 4) return true;
  if (!el.buffered.length) return false;
  return el.buffered.end(el.buffered.length - 1) >= el.duration - 0.3;
}

function CampFilm({ active, onReady, filmsRef }: { active: FilmId; onReady: () => void; filmsRef: { current: Partial<Record<FilmId, HTMLVideoElement | null>> } }) {
  const refs = useRef<Partial<Record<FilmId, HTMLVideoElement | null>>>({});
  const onReadyRef = useRef(onReady);
  const reported = useRef(false);
  onReadyRef.current = onReady;

  useEffect(() => {
    const tick = () => {
      const ids = Object.keys(FILMS) as FilmId[];
      for (const id of ids) {
        const el = refs.current[id];
        if (!el) continue;
        el.muted = true;
        if (el.paused) void el.play().catch(() => undefined);
      }
      if (reported.current) return;
      if (!ids.every((id) => {
        const el = refs.current[id];
        return Boolean(el && filmBuffered(el));
      })) return;
      reported.current = true;
      onReadyRef.current();
    };
    const timer = window.setInterval(tick, 250);
    tick();
    return () => window.clearInterval(timer);
  }, [active]);

  useEffect(() => {
    const el = refs.current[active];
    if (!el) return;
    el.muted = true;
    if (el.ended) el.currentTime = 0;
    if (el.paused) void el.play().catch(() => undefined);
  }, [active]);

  return (
    <>
      {(Object.keys(FILMS) as FilmId[]).map((id) => (
        <img
          key={`${id}-still`}
          src={FILMS[id].poster}
          alt=""
          className={`pointer-events-none absolute inset-0 h-full w-full object-cover ${id === active ? "z-[1]" : "hidden"}`}
        />
      ))}
      {(Object.keys(FILMS) as FilmId[]).map((id) => (
        <video
          key={id}
          data-film={id}
          ref={(node) => {
            refs.current[id] = node;
            filmsRef.current[id] = node;
          }}
          src={FILMS[id].src}
          poster={FILMS[id].poster}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          className={`pointer-events-none absolute inset-0 h-full w-full object-cover ${id === active ? "z-[2] opacity-100" : "z-0 opacity-0"}`}
          aria-label={id === active ? "河邊營地：阿火在生火，阿輪推大石，阿橋正走過木橋" : undefined}
        />
      ))}
    </>
  );
}

export function CampApp() {
  const ask = useServerFn(askAncient);
  const voice = useServerFn(speakAncient);
  const [studentId, setStudentId] = useState<string | null>(null);
  const [sceneReady, setSceneReady] = useState(false);
  const [banned, setBanned] = useState(false);
  const [characterId, setCharacterId] = useState<CharacterId | null>(null);
  const [showGreeting, setShowGreeting] = useState(false);
  const [threads, setThreads] = useState<Threads>(freshThreads);
  const [draft, setDraft] = useState("");
  const [hint, setHint] = useState("");
  const [pendingId, setPendingId] = useState<CharacterId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lessonOpen, setLessonOpen] = useState(false);
  const [speakError, setSpeakError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const speakGen = useRef(0);
  const speakTimer = useRef(0);
  const audioCtx = useRef<AudioContext | null>(null);
  const stopAudio = useRef<(() => void) | null>(null);
  const filmRefs = useRef<Partial<Record<FilmId, HTMLVideoElement | null>>>({});
  const characterRef = useRef<CharacterId | null>(null);
  const chatGen = useRef<Record<CharacterId, number>>({ fire: 0, wheel: 0, bridge: 0 });
  characterRef.current = characterId;
  const person = characterId ? getCharacter(characterId) : null;
  const messages = characterId ? threads[characterId] : [];
  const waiting = Boolean(characterId) && pendingId === characterId;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { characterId?: string; threads?: Partial<Record<CharacterId, Msg[]>> };
        if (saved.characterId && isCharacterId(saved.characterId) && saved.threads) {
          const next = freshThreads();
          for (const item of CHARACTERS) {
            const stored = saved.threads[item.id];
            if (Array.isArray(stored) && stored.length > 0) next[item.id] = stored.slice(-20);
          }
          setThreads(next);
        }
      }
    } catch {
      /* keep the fresh camp */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ characterId, threads }));
  }, [ready, characterId, threads]);

  useEffect(() => {
    const synth = window.speechSynthesis;
    if (!synth) return;
    const warm = () => {
      synth.getVoices();
    };
    warm();
    synth.addEventListener("voiceschanged", warm);
    const keep = window.setInterval(() => {
      if (synth.speaking) synth.resume();
    }, 8000);
    return () => {
      synth.removeEventListener("voiceschanged", warm);
      window.clearInterval(keep);
      synth.cancel();
    };
  }, []);

  function primeSpeech() {
    window.speechSynthesis?.cancel();
  }

  function unlockAudio() {
    const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctx) return;
    if (!audioCtx.current) audioCtx.current = new Ctx();
    void audioCtx.current.resume();
  }

  function cutSpeech() {
    window.clearTimeout(speakTimer.current);
    window.speechSynthesis?.cancel();
    stopAudio.current?.();
    stopAudio.current = null;
  }

  function nextSpeakToken() {
    speakGen.current += 1;
    cutSpeech();
    return speakGen.current;
  }

  function haltSpeech() {
    nextSpeakToken();
  }

  async function readyClip(base64: string, token: number) {
    const ctx = audioCtx.current;
    if (!ctx || !base64 || speakGen.current !== token) return null;
    await ctx.resume();
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
    const buffer = await ctx.decodeAudioData(bytes.buffer);
    if (speakGen.current !== token) return null;
    return buffer;
  }

  function startClip(buffer: AudioBuffer, token: number) {
    const ctx = audioCtx.current;
    if (!ctx || speakGen.current !== token) return false;
    cutSpeech();
    if (speakGen.current !== token) return false;
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    stopAudio.current = () => {
      try {
        source.stop();
      } catch {
        /* already stopped */
      }
    };
    source.start();
    return true;
  }

  async function playMp3(base64: string, token: number) {
    const buffer = await readyClip(base64, token);
    if (!buffer) return false;
    return startClip(buffer, token);
  }

  async function castClip(id: CharacterId, text: string, budgetMs: number): Promise<string> {
  const job = voice({ data: { text, characterId: id } })
    .then((row) => row.audio)
    .catch(() => "");
  const clip = await Promise.race([job, waitMs(budgetMs)]);
  if (clip || allowDeviceVoice(id)) return clip;
  return Promise.race([job, waitMs(5000)]);
}

  async function speakLine(id: CharacterId, text: string, token: number, audio?: string) {
    try {
      unlockAudio();
      let clip = audio ?? "";
      if (!clip) clip = await castClip(id, text, allowDeviceVoice(id) ? 3200 : 7000);
      if (speakGen.current !== token) return;
      if (clip && (await playMp3(clip, token))) return;
      if (allowDeviceVoice(id)) speakCantonese(text, token, id);
    } catch {
      if (speakGen.current === token && allowDeviceVoice(id)) speakCantonese(text, token, id);
    }
  }

  function speakCantonese(text: string, token: number, id: CharacterId) {
    const synth = window.speechSynthesis;
    const line = text.replace(/\s+/g, " ").trim().slice(0, 320);
    if (!synth || !line || speakGen.current !== token || !allowDeviceVoice(id)) {
      if (!synth && speakGen.current === token && allowDeviceVoice(id)) setSpeakError("這部裝置未有廣東話朗讀");
      return;
    }
    const start = () => {
      if (speakGen.current !== token) return;
      cutSpeech();
      speakTimer.current = window.setTimeout(() => {
        if (speakGen.current !== token) return;
        const picked = cantoneseVoice(id);
        if (!picked) return;
        const utterance = new SpeechSynthesisUtterance(line);
        utterance.voice = picked;
        utterance.lang = picked.lang || "zh-HK";
        utterance.rate = id === "fire" ? 1.02 : id === "wheel" ? 0.9 : 0.94;
        utterance.pitch = id === "fire" ? 1.15 : id === "wheel" ? 0.7 : 0.8;
        utterance.onerror = (event) => {
          if (event.error === "canceled" || event.error === "interrupted") return;
          if (speakGen.current !== token) return;
          if (event.error === "not-allowed") setSpeakError("請再按一次，裝置先讀得出聲");
        };
        synth.cancel();
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

  function select(id: CharacterId) {
    const clip = filmRefs.current[id];
    if (clip) {
      clip.muted = true;
      if (clip.ended) clip.currentTime = 0;
      void clip.play();
    }
    setShowGreeting(true);
    setCharacterId(id);
    setLessonOpen(false);
    setError(null);
    setSpeakError(null);
    setHint("");
    const token = nextSpeakToken();
    unlockAudio();
    void speakLine(id, greetingSpeech(id), token);
  }

  function resumeWork() {
    haltSpeech();
    setCharacterId(null);
    setError(null);
  }

  async function run(target: CharacterId, history: Msg[], gen: number, token: number) {
    if (!studentId) return;
    setPendingId(target);
    setError(null);
    const personNow = getCharacter(target);
    const started = performance.now();
    let revealed = false;
    const showTogether = (content: string, spoken: string, speakToken: number, buffer: AudioBuffer | null) => {
      const reply: Msg = {
        id: crypto.randomUUID(),
        role: "assistant",
        content,
        lens: "經驗",
        think: "",
      };
      setThreads((prev) => ({ ...prev, [target]: [...history, reply].slice(-20) }));
      setPendingId(null);
      if (characterRef.current !== target || speakGen.current !== speakToken) return;
      unlockAudio();
      if (buffer && startClip(buffer, speakToken)) return;
      speakCantonese(spoken, speakToken, target);
    };
    const slow = window.setTimeout(() => {
      if (chatGen.current[target] !== gen || revealed || !allowDeviceVoice(target)) return;
      revealed = true;
      showTogether(
        `我在。請先問我遇到甚麼生活難題，再問我怎樣解決。`,
        `我喺度呀。請你先問我遇到咩生活難題，再問我點樣解決。`,
        token,
        null,
      );
    }, 4800);
    try {
      const result = await ask({
        data: {
          characterId: target,
          studentId,
          messages: history.slice(-6).map(({ role, content }) => ({ role, content })),
        },
      });
      window.clearTimeout(slow);
      if (chatGen.current[target] !== gen) return;
      if (result.locked) setBanned(true);
      const spoken = result.speak || result.reply;
      const speakToken = revealed ? nextSpeakToken() : token;
      let buffer: AudioBuffer | null = null;
      if (!revealed && characterRef.current === target) {
        let clip = result.audio || "";
        if (!clip) {
          const left = Math.max(idWait(target), 4700 - (performance.now() - started));
          clip = await castClip(target, spoken, left);
        }
        if (clip && chatGen.current[target] === gen && speakGen.current === speakToken) {
          try {
            buffer = await readyClip(clip, speakToken);
          } catch {
            buffer = null;
          }
        }
      }
      if (chatGen.current[target] !== gen) return;
      revealed = true;
      const reply: Msg = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: result.reply,
        lens: isLens(result.lens) ? result.lens : "經驗",
        think: result.think,
      };
      setThreads((prev) => ({ ...prev, [target]: [...history, reply].slice(-20) }));
      setPendingId(null);
      if (characterRef.current !== target || speakGen.current !== speakToken) return;
      unlockAudio();
      if (buffer && startClip(buffer, speakToken)) return;
      speakCantonese(spoken, speakToken, target);
    } catch {
      window.clearTimeout(slow);
      if (!revealed && chatGen.current[target] === gen && characterRef.current === target) {
        setError(`${personNow.name}聽不清楚，請再送出一次。`);
      }
    } finally {
      window.clearTimeout(slow);
      if (chatGen.current[target] === gen) setPendingId(null);
    }
  }

  function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed || pendingId || !characterId || banned) return;
    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", content: trimmed };
    const history = [...threads[characterId], userMsg].slice(-20);
    const gen = ++chatGen.current[characterId];
    const token = nextSpeakToken();
    unlockAudio();
    setShowGreeting(false);
    setThreads((prev) => ({ ...prev, [characterId]: history }));
    setDraft("");
    setHint("");
    primeSpeech();
    void run(characterId, history, gen, token);
  }

  function retry() {
    if (pendingId || !characterId) return;
    const history = threads[characterId];
    if (history[history.length - 1]?.role !== "user") return;
    const gen = ++chatGen.current[characterId];
    const token = nextSpeakToken();
    primeSpeech();
    void run(characterId, history, gen, token);
  }

  function resetChat() {
    if (pendingId || !characterId || !person) return;
    chatGen.current[characterId] += 1;
    haltSpeech();
    setError(null);
    setThreads((prev) => ({ ...prev, [characterId]: [greeting(person)] }));
  }

  const spots: Record<CharacterId, { name: CSSProperties; bubble: CSSProperties; doing: string }> = {
    fire: { name: { left: "13%", top: "45%" }, bubble: { left: "24%", top: "48%", width: "min(22%, 200px)" }, doing: "生火中" },
    wheel: { name: { left: "34%", top: "25%" }, bubble: { left: "50%", top: "8%", width: "min(20%, 188px)" }, doing: "推大石" },
    bridge: { name: { left: "78%", top: "6%" }, bubble: { left: "80%", top: "14%", width: "min(16%, 176px)" }, doing: "過橋中" },
  };
  const latest = [...messages].reverse().find((message) => message.role === "assistant");
  const asked = messages.some((message) => message.role === "user");
  const lessonPerson = person ?? getCharacter("fire");
  const film: FilmId = characterId === "fire" || characterId === "wheel" || characterId === "bridge" ? characterId : "idle";
  const tailOnLeft = person?.id === "fire" || person?.id === "wheel" || person?.id === "bridge";

  return (
    <main className="relative h-dvh overflow-hidden bg-ink text-ink">
      <p className="sr-only">按下正在生火、推車或過橋的古人，他們會停下來。在最底打字發問，答案會出現在他們旁邊的對話泡泡。</p>
      <div className="scene-slot relative h-full">
        <img src="/ancients/valley.jpg" alt="" className="absolute inset-0 h-full w-full object-cover blur-md" />
        <div className="absolute inset-0 grid place-items-center">
          <div className="stage">
            <CampFilm active={film} filmsRef={filmRefs} onReady={() => setSceneReady(true)} />
            <div className="pointer-events-none absolute top-3 left-3 z-10 rounded-2xl bg-sheet/90 px-3 py-2">
              <p className="text-sm font-medium text-meadow">小學科學 · 科學與科技</p>
              <h1 className="font-display text-3xl leading-none text-ink">古人問一問</h1>
            </div>
            <button
              type="button"
              onClick={() => setLessonOpen((open) => !open)}
              aria-expanded={lessonOpen}
              className="absolute top-3 right-3 z-10 inline-flex min-h-11 items-center gap-1 rounded-full bg-sheet/90 px-3 text-sm focus-visible:ring-2 focus-visible:ring-meadow"
            >
              <BookOpen className="size-4" aria-hidden />
              本課重點
            </button>
            {(Object.keys(spots) as CharacterId[]).map((id) => {
              const item = getCharacter(id);
              const spot = spots[id];
              const paused = characterId === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => select(id)}
                  aria-pressed={paused}
                  aria-label={paused ? `${item.name}望住你，打個招呼` : `按下${item.name}，叫${item.name}停低打招呼`}
                  className="absolute z-10 -translate-x-1/2 cursor-pointer rounded-full bg-meadow-deep/90 px-2.5 py-1 text-sm font-medium whitespace-nowrap text-paper touch-manipulation focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheet"
                  style={spot.name}
                >
                  {item.name} · {spot.doing}
                </button>
              );
            })}
            {person ? (
              <div className="say" style={spots[person.id].bubble} role="status">
                <span
                  aria-hidden
                  className={`absolute size-3 rotate-45 border border-line bg-sheet ${tailOnLeft ? "-left-1.5 top-8 border-t-0 border-r-0" : "-right-1.5 top-8 border-b-0 border-l-0"}`}
                />
                <div className="max-h-44 overflow-auto rounded-2xl border border-line bg-sheet/95 px-3 py-2 shadow-lg">
                  <p className="text-sm font-medium text-meadow">{person.name}</p>
                  {waiting ? (
                    <p className="mt-1 text-pretty">{person.name}正在回想……</p>
                  ) : error ? (
                    <div role="alert">
                      <p className="mt-1 text-pretty">{error}</p>
                      <button type="button" onClick={retry} className="mt-1 min-h-11 font-medium text-ember focus-visible:ring-2 focus-visible:ring-ember">
                        再送出一次
                      </button>
                    </div>
                  ) : showGreeting || !(asked && latest) ? (
                    <p className="mt-1 text-pretty">{person.greeting}</p>
                  ) : (
                    <>
                      <p className="mt-1 text-pretty">{latest.content}</p>
                      {latest.lens ? (
                        <p className="mt-2 text-sm">
                          <span className={`rounded-full px-2.5 py-1 font-medium ${lensClass(latest.lens)}`}>{latest.lens}</span>
                          <span className="ml-2 text-muted">{LENS_GLOSS[latest.lens]}</span>
                        </p>
                      ) : null}
                    </>
                  )}
                  {speakError ? <p className="mt-1 text-sm text-muted">{speakError}</p> : null}
                  <div className="mt-1 flex flex-wrap items-center gap-1">
                    <button type="button" onClick={resumeWork} className="min-h-11 rounded-full px-2 text-sm focus-visible:ring-2 focus-visible:ring-meadow">
                      繼續工作
                    </button>
                    <button
                      type="button"
                      onClick={resetChat}
                      disabled={Boolean(pendingId)}
                      aria-label={`重置和${person.name}的對話`}
                      className="inline-flex size-11 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:ring-meadow disabled:opacity-50"
                    >
                      <RotateCcw className="size-4" aria-hidden />
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
        {lessonOpen ? (
          <div className="absolute inset-x-3 top-16 z-20 max-h-[70%] overflow-y-auto md:inset-x-auto md:right-3 md:w-96">
            <div className="rounded-2xl border border-line bg-sheet p-4">
              <h2 className="font-display text-3xl leading-none">本課要記住</h2>
              <p className="mt-2 text-sm text-pretty text-muted">學習目標：知道科學發現能促進科技的發展，而科技的發展亦能推動科學進步。</p>
              <ul className="mt-3 flex flex-col gap-2">
                {CHARACTERS.map((item) => {
                  const shown = lessonPerson.id === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        aria-pressed={shown}
                        onClick={() => select(item.id)}
                        className={`w-full rounded-xl border px-3 py-2 text-left focus-visible:ring-2 focus-visible:ring-meadow ${shown ? "border-meadow bg-paper" : "border-transparent bg-paper"}`}
                      >
                        <span className="block text-sm text-muted">生活難題：{item.problem}</span>
                        <span className="block font-medium">
                          解決：{item.method}
                          <span className="ml-2 font-normal text-meadow">{item.science}</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
              <div className="mt-3 space-y-2 text-sm">
                <p className="text-pretty">
                  <span className="font-medium">{lessonPerson.name}的方法。 </span>
                  {lessonPerson.scienceKid}
                </p>
                <p className="text-pretty text-muted">{lessonPerson.knew}</p>
                <p className="text-pretty text-muted">{lessonPerson.nature}</p>
              </div>
              <div className="mt-3 grid gap-2">
                <p className="rounded-xl bg-paper px-3 py-2 text-sm text-pretty">
                  <span className="font-medium text-meadow">科學 → 科技　</span>
                  {lessonPerson.scienceToTech}
                </p>
                <p className="rounded-xl bg-paper px-3 py-2 text-sm text-pretty">
                  <span className="font-medium text-ember">科技 → 科學　</span>
                  {lessonPerson.techToScience}
                </p>
              </div>
            </div>
          </div>
        ) : null}
        <form
          className="safe-bottom pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-ink/55 to-transparent px-3 pt-8 pb-3"
          onSubmit={(event) => {
            event.preventDefault();
            submit(draft);
          }}
        >
          <div className="pointer-events-auto mx-auto flex max-w-3xl flex-col gap-2">
            {person ? (
              <div className="flex flex-wrap gap-2">
                {person.prompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    disabled={Boolean(pendingId)}
                    onClick={() => submit(prompt)}
                    className="min-h-11 rounded-full border border-line bg-sheet/95 px-3 text-sm font-medium focus-visible:ring-2 focus-visible:ring-meadow disabled:opacity-50"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            ) : null}
            <div className="flex gap-2">
            <label htmlFor="ask" className="sr-only">
              {person ? `問${person.name}` : "先選擇一位古人"}
            </label>
            <input
              id="ask"
              ref={inputRef}
              maxLength={160}
              enterKeyHint="send"
              autoComplete="off"
              disabled={!person || Boolean(pendingId)}
              placeholder={person ? person.placeholder : "先按下一位正在工作的古人"}
              className="h-12 min-w-0 flex-1 rounded-full border border-line bg-sheet px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-meadow disabled:opacity-80"
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
            <button
              type="submit"
              disabled={!person || !draft.trim() || Boolean(pendingId)}
              className="inline-flex h-12 min-w-20 items-center justify-center gap-1 rounded-full bg-ember px-4 font-medium text-paper focus-visible:ring-2 focus-visible:ring-meadow disabled:opacity-50"
            >
              <Send className="size-4" aria-hidden />
              送出
            </button>
            </div>
          </div>
          {hint ? <p className="sr-only">{hint}</p> : null}
        </form>
      </div>
      {sceneReady ? null : (
        <div className="absolute inset-0 z-[70] grid place-items-center bg-ink text-paper">
          <p className="font-display text-4xl">加載中</p>
        </div>
      )}
      {sceneReady ? (
        banned ? <BannedNotice /> : studentId ? null : <StudentGate onReady={setStudentId} onBanned={() => setBanned(true)} />
      ) : null}
    </main>
  );
}

function StudentGate({ onReady, onBanned }: { onReady: (id: string) => void; onBanned: () => void }) {
  const join = useServerFn(joinClass);
  const [name, setName] = useState("");
  const [className, setClassName] = useState("");
  const [studentNo, setStudentNo] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const result = await join({ data: { name, className, studentNo } });
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

  return (
    <div className="absolute inset-0 z-50 grid place-items-center bg-ink/55 p-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-3xl border border-line bg-sheet p-6 shadow-lg">
        <p className="text-sm font-medium text-meadow">小學科學 · 科學與科技</p>
        <h1 className="font-display text-5xl leading-none text-ink">先寫低你的資料</h1>
        <p className="mt-2 text-pretty text-muted">寫好姓名、班別同學號，就可以同古人傾偈。</p>
        <label className="mt-4 block text-sm font-medium" htmlFor="student-name">
          姓名
          <input
            id="student-name"
            required
            autoComplete="name"
            maxLength={20}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="例如：陳小明"
            className="mt-1 h-12 w-full rounded-2xl border border-line bg-paper px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-meadow"
          />
        </label>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <label className="block text-sm font-medium" htmlFor="student-class">
            班別
            <select
              id="student-class"
              required
              value={className}
              onChange={(event) => setClassName(event.target.value)}
              className="mt-1 h-12 w-full rounded-2xl border border-line bg-paper px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-meadow"
            >
              <option value="">請選擇</option>
              {["5A", "5B", "5C", "5D", "5E"].map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium" htmlFor="student-no">
            學號
            <select
              id="student-no"
              required
              value={studentNo}
              onChange={(event) => setStudentNo(event.target.value)}
              className="mt-1 h-12 w-full rounded-2xl border border-line bg-paper px-4 text-base outline-none focus-visible:ring-2 focus-visible:ring-meadow"
            >
              <option value="">請選擇</option>
              {Array.from({ length: 35 }, (_, index) => String(index + 1)).map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
        </div>
        {error ? (
          <p className="mt-3 text-sm text-ember" role="alert">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={busy}
          className="mt-4 h-12 w-full rounded-full bg-meadow font-medium text-paper focus-visible:ring-2 focus-visible:ring-ember disabled:opacity-60"
        >
          {busy ? "寫緊……" : "開始問古人"}
        </button>
        <p className="mt-4 text-center text-sm text-muted">
          <Link to="/teacher" className="underline">
            教師入口
          </Link>
        </p>
      </form>
    </div>
  );
}

function BannedNotice() {
  return (
    <div className="absolute inset-0 z-50 grid place-items-center bg-ink/70 p-4">
      <div className="w-full max-w-md rounded-3xl border border-line bg-sheet p-6 text-center shadow-lg" role="alert">
        <p className="text-sm font-medium text-ember">第 3 次警告</p>
        <h1 className="mt-2 font-display text-5xl leading-none">不能再使用</h1>
        <p className="mt-3 text-pretty">你用了不尊重的說話，這個網頁已經停止。請找老師。</p>
      </div>
    </div>
  );
}
