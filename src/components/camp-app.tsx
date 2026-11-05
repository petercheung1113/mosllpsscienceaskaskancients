import { useEffect, useRef, useState, type CSSProperties } from "react";
import { useServerFn } from "@tanstack/react-start";
import { BookOpen, RotateCcw, Send } from "lucide-react";
import { askAncient } from "@/lib/ask.functions";
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

const STORAGE_KEY = "ancient-camp-v1";
const SILENT_WAV =
  "data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=";

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

const FILMS = {
  idle: { src: "/ancients/scene-idle.mp4?v=15", poster: "/ancients/poster-idle.jpg?v=15" },
  fire: { src: "/ancients/scene-fire.mp4?v=15", poster: "/ancients/poster-fire.jpg?v=15" },
  wheel: { src: "/ancients/scene-wheel.mp4?v=15", poster: "/ancients/poster-wheel.jpg?v=15" },
  bridge: { src: "/ancients/scene-bridge.mp4?v=15", poster: "/ancients/poster-bridge.jpg?v=15" },
} as const;

type FilmId = keyof typeof FILMS;

function CampFilm({ active, onReady }: { active: FilmId; onReady: () => void }) {
  const refs = useRef<Partial<Record<FilmId, HTMLVideoElement | null>>>({});
  const seen = useRef(new Set<FilmId>());
  const done = useRef(false);
  const onReadyRef = useRef(onReady);
  onReadyRef.current = onReady;

  function note(id: FilmId) {
    seen.current.add(id);
    if (!done.current && seen.current.size === Object.keys(FILMS).length) {
      done.current = true;
      onReadyRef.current();
    }
  }

  useEffect(() => {
    for (const id of Object.keys(FILMS) as FilmId[]) {
      const el = refs.current[id];
      if (el && el.readyState >= 3) note(id);
    }
    const timer = window.setTimeout(() => {
      if (!done.current) {
        done.current = true;
        onReadyRef.current();
      }
    }, 12000);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    for (const id of Object.keys(FILMS) as FilmId[]) {
      const el = refs.current[id];
      if (!el || id === active) continue;
      el.pause();
    }
    const el = refs.current[active];
    if (!el) return;
    const kick = () => {
      if (el.ended) el.currentTime = 0;
      if (el.paused) void el.play().catch(() => {});
    };
    el.addEventListener("ended", kick);
    kick();
    return () => el.removeEventListener("ended", kick);
  }, [active]);

  return (
    <>
      {(Object.keys(FILMS) as FilmId[]).map((id) => (
        <img
          key={`${id}-still`}
          src={FILMS[id].poster}
          alt=""
          loading="eager"
          className={`pointer-events-none absolute inset-0 h-full w-full object-cover ${id === active ? "z-[1]" : "hidden"}`}
        />
      ))}
      {(Object.keys(FILMS) as FilmId[]).map((id) => (
        <video
          key={id}
          data-film={id}
          ref={(node) => {
            refs.current[id] = node;
          }}
          src={FILMS[id].src}
          poster={FILMS[id].poster}
          muted
          loop
          playsInline
          autoPlay
          preload="auto"
          onCanPlayThrough={() => note(id)}
          onError={() => note(id)}
          className={`pointer-events-none absolute inset-0 h-full w-full object-cover ${id === active ? "z-[2] opacity-100" : "z-0 opacity-0"}`}
          aria-label={id === active ? "河邊營地：阿火在生火，阿輪推大石，阿橋正走過木橋" : undefined}
        />
      ))}
    </>
  );
}

export function CampApp() {
  const ask = useServerFn(askAncient);
  const [characterId, setCharacterId] = useState<CharacterId | null>(null);
  const [filmReady, setFilmReady] = useState(false);
  const [threads, setThreads] = useState<Threads>(freshThreads);
  const [draft, setDraft] = useState("");
  const [hint, setHint] = useState("");
  const [pendingId, setPendingId] = useState<CharacterId | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lessonOpen, setLessonOpen] = useState(false);
  const [speakError, setSpeakError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const speakGen = useRef(0);
  const characterRef = useRef<CharacterId | null>(null);
  const chatGen = useRef<Record<CharacterId, number>>({ fire: 0, wheel: 0, bridge: 0 });
  characterRef.current = characterId;

  const booted = filmReady;
  const person = characterId ? getCharacter(characterId) : null;
  const messages = characterId ? threads[characterId] : [];
  const waiting = Boolean(characterId) && pendingId === characterId;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as { characterId?: string; threads?: Threads };
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
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  function primeSpeech() {
    const audio = audioRef.current ?? new Audio();
    audioRef.current = audio;
    audio.src = SILENT_WAV;
    void audio.play().catch(() => undefined);
  }

  function select(id: CharacterId) {
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

  async function run(target: CharacterId, history: Msg[], gen: number) {
    setPendingId(target);
    setError(null);
    try {
      const result = await ask({
        data: {
          characterId: target,
          messages: history.slice(-6).map(({ role, content }) => ({ role, content })),
        },
      });
      if (chatGen.current[target] !== gen) return;
      if (!result.ok) {
        if (characterRef.current === target) setError(result.error);
        return;
      }
      const reply: Msg = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: result.reply,
        lens: isLens(result.lens) ? result.lens : "經驗",
        think: result.think,
      };
      setThreads((prev) => ({ ...prev, [target]: [...history, reply].slice(-20) }));
      if (characterRef.current === target && result.audio) playReady(result.mime, result.audio);
    } catch {
      if (chatGen.current[target] === gen && characterRef.current === target) {
        setError(`${getCharacter(target).name}聽不清楚，請再送出一次。`);
      }
    } finally {
      if (chatGen.current[target] === gen) setPendingId(null);
    }
  }

  function submit(text: string) {
    const trimmed = text.trim();
    if (!trimmed || pendingId || !characterId) return;
    const userMsg: Msg = { id: crypto.randomUUID(), role: "user", content: trimmed };
    const history = [...threads[characterId], userMsg].slice(-20);
    const gen = ++chatGen.current[characterId];
    setThreads((prev) => ({ ...prev, [characterId]: history }));
    setDraft("");
    setHint("");
    primeSpeech();
    void run(characterId, history, gen);
  }

  function retry() {
    if (pendingId || !characterId) return;
    const history = threads[characterId];
    if (history[history.length - 1]?.role !== "user") return;
    const gen = ++chatGen.current[characterId];
    primeSpeech();
    void run(characterId, history, gen);
  }

  function resetChat() {
    if (pendingId || !characterId || !person) return;
    chatGen.current[characterId] += 1;
    audioRef.current?.pause();
    speakGen.current += 1;
    setError(null);
    setThreads((prev) => ({ ...prev, [characterId]: [greeting(person)] }));
  }

  function playReady(mime: string, audioB64: string) {
    if (!audioB64) return;
    const gen = ++speakGen.current;
    const audio = audioRef.current ?? new Audio();
    audioRef.current = audio;
    audio.pause();
    setSpeakError(null);
    audio.src = `data:${mime || "audio/mpeg"};base64,${audioB64}`;
    void audio.play().catch(() => {
      if (gen === speakGen.current) setSpeakError("暫時未能朗讀");
    });
  }

  const spots: Record<CharacterId, { name: CSSProperties; bubble: CSSProperties; doing: string }> = {
    fire: {
      name: { left: "13%", top: "45%" },
      bubble: { left: "24%", top: "48%", width: "min(22%, 200px)" },
      doing: "生火中",
    },
    wheel: {
      name: { left: "34%", top: "25%" },
      bubble: { left: "44%", top: "18%", width: "min(22%, 200px)" },
      doing: "推大石",
    },
    bridge: {
      name: { left: "78%", top: "6%" },
      bubble: { left: "86%", top: "14%", width: "min(13%, 168px)" },
      doing: "過橋中",
    },
  };
  const latest = [...messages].reverse().find((message) => message.role === "assistant");
  const asked = messages.some((message) => message.role === "user");
  const showBubble = Boolean(person);
  const lessonPerson = person ?? getCharacter("fire");
  const film: FilmId =
    characterId === "fire" || characterId === "wheel" || characterId === "bridge" ? characterId : "idle";
  const tailOnLeft = person?.id === "fire" || person?.id === "bridge";

  return (
    <main className="relative h-dvh overflow-hidden bg-ink text-ink">
      <p className="sr-only">
        按下正在生火、推車或過橋的古人，他們會停下來。在最底打字發問，答案會出現在他們旁邊的對話泡泡。
      </p>
      <div className="scene-slot relative h-full">
        <img src="/ancients/valley.jpg" alt="" className="absolute inset-0 h-full w-full object-cover blur-md" />
        <div className="absolute inset-0 grid place-items-center">
          <div className="stage">
            <CampFilm active={film} onReady={() => setFilmReady(true)} />
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
            {person && showBubble ? (
              <div className="say" style={spots[person.id].bubble} role="status">
                <span
                  aria-hidden
                  className={`absolute size-3 rotate-45 border border-line bg-sheet ${
                    tailOnLeft ? "-left-1.5 top-8 border-t-0 border-r-0" : "-right-1.5 top-8 border-b-0 border-l-0"
                  }`}
                />
                <div className="max-h-44 overflow-auto rounded-2xl border border-line bg-sheet/95 px-3 py-2 shadow-lg">
                  <p className="text-sm font-medium text-meadow">{person.name}</p>
                  {waiting ? (
                    <p className="mt-1 text-pretty">{person.name}正在回想……</p>
                  ) : error ? (
                    <div role="alert">
                      <p className="mt-1 text-pretty">{error}</p>
                      <button
                        type="button"
                        onClick={retry}
                        className="mt-1 min-h-11 font-medium text-ember focus-visible:ring-2 focus-visible:ring-ember"
                      >
                        再送出一次
                      </button>
                    </div>
                  ) : asked && latest ? (
                    <>
                      <p className="mt-1 text-pretty">{latest.content}</p>
                      {latest.lens ? (
                        <p className="mt-2 text-sm">
                          <span className={`rounded-full px-2.5 py-1 font-medium ${lensClass(latest.lens)}`}>{latest.lens}</span>
                          <span className="ml-2 text-muted">{LENS_GLOSS[latest.lens]}</span>
                        </p>
                      ) : null}
                    </>
                  ) : (
                    <p className="mt-1 text-pretty">{person.greeting}</p>
                  )}
                  {speakError ? <p className="mt-1 text-sm text-muted">{speakError}</p> : null}
                  <div className="mt-1 flex flex-wrap items-center gap-1">
                    <button
                      type="button"
                      onClick={resumeWork}
                      className="min-h-11 rounded-full px-2 text-sm focus-visible:ring-2 focus-visible:ring-meadow"
                    >
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
              <p className="mt-2 text-sm text-pretty text-muted">
                學習目標：知道科學發現能促進科技的發展，而科技的發展亦能推動科學進步。
              </p>
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
                        <span className="block text-sm text-muted">{item.problem}</span>
                        <span className="block font-medium">
                          {item.method}
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
          <div className="pointer-events-auto mx-auto flex max-w-3xl gap-2">
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
          {hint ? <p className="sr-only">{hint}</p> : null}
        </form>
      </div>
      {booted ? null : (
        <div className="absolute inset-0 z-40 grid place-items-center bg-ink/80 text-paper">
          <p className="font-display text-4xl">加載中</p>
        </div>
      )}
    </main>
  );
}
