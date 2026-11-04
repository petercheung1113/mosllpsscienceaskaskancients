import { useEffect, useLayoutEffect, useRef, useState } from "react";

export type QiaoPose = {
  x: number;
  y: number;
  s: number;
  doing: string;
};

type Seg = {
  a: { x: number; y: number; s: number };
  b: { x: number; y: number; s: number };
  dur: number;
  mode: "walk" | "pull";
  face: "left" | "right";
};

/** Feet travel the logs first, then the near grass, then the rope. */
const SEGMENTS: Seg[] = [
  { a: { x: 0.935, y: 0.552, s: 0.34 }, b: { x: 0.78, y: 0.566, s: 0.39 }, dur: 4.4, mode: "walk", face: "left" },
  { a: { x: 0.78, y: 0.566, s: 0.39 }, b: { x: 0.7, y: 0.64, s: 0.42 }, dur: 1.7, mode: "walk", face: "left" },
  { a: { x: 0.7, y: 0.64, s: 0.42 }, b: { x: 0.54, y: 0.84, s: 0.49 }, dur: 3.4, mode: "walk", face: "left" },
  { a: { x: 0.54, y: 0.84, s: 0.49 }, b: { x: 0.335, y: 0.785, s: 0.5 }, dur: 2.5, mode: "walk", face: "left" },
  { a: { x: 0.335, y: 0.785, s: 0.5 }, b: { x: 0.335, y: 0.785, s: 0.5 }, dur: 6, mode: "pull", face: "right" },
  { a: { x: 0.335, y: 0.785, s: 0.5 }, b: { x: 0.54, y: 0.84, s: 0.49 }, dur: 2.3, mode: "walk", face: "right" },
  { a: { x: 0.54, y: 0.84, s: 0.49 }, b: { x: 0.7, y: 0.64, s: 0.42 }, dur: 3.1, mode: "walk", face: "right" },
  { a: { x: 0.7, y: 0.64, s: 0.42 }, b: { x: 0.78, y: 0.566, s: 0.39 }, dur: 1.7, mode: "walk", face: "right" },
  { a: { x: 0.78, y: 0.566, s: 0.39 }, b: { x: 0.935, y: 0.552, s: 0.34 }, dur: 4.2, mode: "walk", face: "right" },
];

const TOTAL = SEGMENTS.reduce((sum, seg) => sum + seg.dur, 0);

function poseAt(elapsed: number): QiaoPose & { mode: "walk" | "pull"; face: "left" | "right" } {
  let t = elapsed % TOTAL;
  if (t < 0) t += TOTAL;
  let acc = 0;
  for (const seg of SEGMENTS) {
    if (t <= acc + seg.dur) {
      const u = seg.dur <= 0 ? 0 : Math.min(1, Math.max(0, (t - acc) / seg.dur));
      const y = seg.a.y + (seg.b.y - seg.a.y) * u;
      const mode = seg.mode;
      return {
        x: seg.a.x + (seg.b.x - seg.a.x) * u,
        y,
        s: seg.a.s + (seg.b.s - seg.a.s) * u,
        face: seg.face,
        mode,
        doing: mode === "pull" ? "幫手推車" : y < 0.6 ? "過橋中" : "行去推車",
      };
    }
    acc += seg.dur;
  }
  const last = SEGMENTS[0];
  return { ...last.a, face: last.face, mode: last.mode, doing: "過橋中" };
}

const START = poseAt(0);

function keyMagenta(data: Uint8ClampedArray) {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const dist = Math.hypot(r - 225, g, b - 150);
    let a = 255;
    if (g < 42 && r > 165 && b > 85) a = 0;
    else if (dist < 52) a = 0;
    else if (dist < 100) a = ((dist - 52) / 48) * 255;
    data[i + 3] = a;
    if (a < 250) {
      data[i] = Math.min(r, g + 50);
      data[i + 2] = Math.min(b, g + 60);
    }
  }
}

export function QiaoWalker({
  paused,
  showLabel,
  onSelect,
  onPose,
  onReady,
}: {
  paused: boolean;
  showLabel: boolean;
  onSelect: () => void;
  onPose: (pose: QiaoPose) => void;
  onReady: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const walkRef = useRef<HTMLVideoElement>(null);
  const pullRef = useRef<HTMLVideoElement>(null);
  const waveRef = useRef<HTMLVideoElement>(null);
  const poseRef = useRef(START);
  const doingRef = useRef(START.doing);
  const pausedRef = useRef(paused);
  const onPoseRef = useRef(onPose);
  const onReadyRef = useRef(onReady);
  const readyOnce = useRef(false);
  const [doing, setDoing] = useState(START.doing);
  pausedRef.current = paused;
  onPoseRef.current = onPose;
  onReadyRef.current = onReady;

  useEffect(() => {
    onPoseRef.current(poseRef.current);
  }, [paused, doing]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!readyOnce.current) {
        readyOnce.current = true;
        onReadyRef.current();
      }
    }, 12000);
    return () => window.clearTimeout(timer);
  }, []);

  useLayoutEffect(() => {
    const btn = btnRef.current;
    const pose = poseRef.current;
    if (!btn) return;
    const aspect = 0.57;
    const width = pose.s * aspect * (9 / 16);
    btn.style.left = `${(pose.x - width / 2) * 100}%`;
    btn.style.top = `${(pose.y - pose.s) * 100}%`;
    btn.style.width = `${width * 100}%`;
    btn.style.height = `${pose.s * 100}%`;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const stage = canvas?.parentElement;
    if (!canvas || !stage) return;
    const off = document.createElement("canvas");
    const offCtx = off.getContext("2d", { willReadFrequently: true });
    const ctx = canvas.getContext("2d");
    if (!offCtx || !ctx) return;

    const clock = { epoch: performance.now(), frozen: 0, holding: false };
    let frame = 0;
    let stopped = false;
    let keyedStamp = "";

    const noteReady = () => {
      const clips = [walkRef.current, pullRef.current, waveRef.current];
      if (clips.every((clip) => clip && clip.readyState >= 2)) {
        if (!readyOnce.current) {
          readyOnce.current = true;
          onReadyRef.current();
        }
      }
    };

    for (const clip of [walkRef.current, pullRef.current, waveRef.current]) {
      if (!clip) continue;
      clip.addEventListener("canplay", noteReady);
      clip.addEventListener("error", noteReady);
      void clip.play().catch(() => {});
    }
    noteReady();

    const draw = (now: number) => {
      if (stopped) return;
      frame = window.requestAnimationFrame(draw);
      if (pausedRef.current) {
        if (!clock.holding) {
          clock.frozen = now - clock.epoch;
          clock.holding = true;
        }
      } else if (clock.holding) {
        clock.epoch = now - clock.frozen;
        clock.holding = false;
      }
      const elapsed = (pausedRef.current ? clock.frozen : now - clock.epoch) / 1000;
      const pose = poseAt(elapsed);
      poseRef.current = pose;
      if (pose.doing !== doingRef.current) {
        doingRef.current = pose.doing;
        setDoing(pose.doing);
      }

      const walk = walkRef.current;
      const pull = pullRef.current;
      const wave = waveRef.current;
      const clip = pausedRef.current ? wave : pose.mode === "pull" ? pull : walk;
      const rect = stage.getBoundingClientRect();
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      const w = Math.max(1, Math.round(rect.width * dpr));
      const h = Math.max(1, Math.round(rect.height * dpr));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }
      ctx.clearRect(0, 0, w, h);
      if (!clip || clip.readyState < 2 || !clip.videoWidth) {
        placeButton(pose, 0.57);
        return;
      }
      const rate = !pausedRef.current && pose.mode === "walk" ? 0.75 : 1;
      if (clip.playbackRate !== rate) clip.playbackRate = rate;

      const keyH = 480;
      const keyW = Math.max(2, Math.round(keyH * (clip.videoWidth / clip.videoHeight)));
      if (off.width !== keyW || off.height !== keyH) {
        off.width = keyW;
        off.height = keyH;
        keyedStamp = "";
      }
      const stamp = `${clip.src}:${clip.currentTime}`;
      if (stamp !== keyedStamp) {
        offCtx.drawImage(clip, 0, 0, keyW, keyH);
        const pixels = offCtx.getImageData(0, 0, keyW, keyH);
        keyMagenta(pixels.data);
        offCtx.putImageData(pixels, 0, 0);
        keyedStamp = stamp;
      }

      const th = pose.s * h;
      const tw = th * (keyW / keyH);
      const footX = pose.x * w;
      const footY = pose.y * h;
      const x = footX - tw / 2;
      const y = footY - th;
      ctx.save();
      ctx.fillStyle = "rgba(36, 48, 22, 0.32)";
      ctx.beginPath();
      ctx.ellipse(footX, footY + th * 0.012, tw * 0.22, Math.max(3, th * 0.028), 0, 0, Math.PI * 2);
      ctx.fill();
      const mirror = !pausedRef.current && pose.mode === "walk" && pose.face === "right";
      if (mirror) {
        ctx.translate(x + tw, y);
        ctx.scale(-1, 1);
        ctx.drawImage(off, 0, 0, tw, th);
      } else {
        ctx.drawImage(off, x, y, tw, th);
      }
      ctx.restore();
      placeButton(pose, keyW / keyH);
    };

    function placeButton(pose: QiaoPose, aspect: number) {
      const btn = btnRef.current;
      if (!btn) return;
      const width = pose.s * aspect * (9 / 16);
      btn.style.left = `${(pose.x - width / 2) * 100}%`;
      btn.style.top = `${(pose.y - pose.s) * 100}%`;
      btn.style.width = `${width * 100}%`;
      btn.style.height = `${pose.s * 100}%`;
    }

    frame = window.requestAnimationFrame(draw);
    return () => {
      stopped = true;
      window.cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <>
      <video ref={walkRef} src="/ancients/qiao-walk.mp4?v=11" muted playsInline loop autoPlay preload="auto" className="pointer-events-none absolute top-0 left-0 h-8 w-8 opacity-0" />
      <video ref={pullRef} src="/ancients/qiao-pull.mp4?v=11" muted playsInline loop autoPlay preload="auto" className="pointer-events-none absolute top-0 left-8 h-8 w-8 opacity-0" />
      <video ref={waveRef} src="/ancients/qiao-wave.mp4?v=11" muted playsInline loop autoPlay preload="auto" className="pointer-events-none absolute top-0 left-16 h-8 w-8 opacity-0" />
      <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 z-[3] h-full w-full" />
      <button
        ref={btnRef}
        type="button"
        onClick={onSelect}
        aria-pressed={paused}
        aria-label={paused ? "阿橋望住你，打個招呼" : "按下阿橋，叫阿橋停低打招呼"}
        className="absolute z-[5] cursor-pointer rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sheet"
      >
        {showLabel ? (
          <span className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2 rounded-full bg-meadow-deep/90 px-2.5 py-1 text-sm font-medium whitespace-nowrap text-paper">
            阿橋 · {doing}
          </span>
        ) : null}
      </button>
    </>
  );
}
