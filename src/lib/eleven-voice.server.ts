import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";
import type { CharacterId } from "@/lib/lesson";

const CAST: Record<CharacterId, { voice: string; pitch: string; rate: string }> = {
  fire: { voice: "zh-HK-HiuGaaiNeural", pitch: "+4Hz", rate: "+2%" },
  wheel: { voice: "zh-HK-WanLungNeural", pitch: "-10Hz", rate: "-6%" },
  bridge: { voice: "zh-HK-WanLungNeural", pitch: "-4Hz", rate: "-2%" },
};

const cache = new Map<string, string>();
const engines = new Map<CharacterId, { tts: MsEdgeTTS; ready: Promise<void> }>();
const tails = new Map<CharacterId, Promise<unknown>>();

function engine(id: CharacterId): Promise<void> {
  const found = engines.get(id);
  if (found) return found.ready;
  const tts = new MsEdgeTTS();
  const ready = tts.setMetadata(CAST[id].voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3).catch((error: unknown) => {
    engines.delete(id);
    throw error;
  });
  engines.set(id, { tts, ready });
  return ready;
}

function escapeSsml(text: string): string {
  const amp = "&" + "amp;";
  const lt = "&" + "lt;";
  const gt = "&" + "gt;";
  return text.replaceAll("&", amp).replaceAll("<", lt).replaceAll(">", gt);
}

async function synthesize(id: CharacterId, spoken: string): Promise<string> {
  const cast = CAST[id];
  const run = async () => {
    await engine(id);
    const { audioStream } = engines.get(id)!.tts.toStream(escapeSsml(spoken), { pitch: cast.pitch, rate: cast.rate });
    const chunks: Buffer[] = [];
    for await (const chunk of audioStream) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    return Buffer.concat(chunks).toString("base64");
  };
  const prev = tails.get(id) ?? Promise.resolve();
  const next = prev.then(run, run);
  tails.set(id, next.then(() => undefined, () => undefined));
  return next;
}

export async function speakCastVoice(id: CharacterId, text: string): Promise<string> {
  const spoken = text.replace(/\s+/g, " ").trim().slice(0, 400);
  if (!spoken) return "";
  const key = `${id}:${CAST[id].voice}:${CAST[id].pitch}:${CAST[id].rate}:${spoken}`;
  const cached = cache.get(key);
  if (cached) return cached;
  let audio = "";
  try {
    audio = await synthesize(id, spoken);
  } catch {
    engines.delete(id);
    try {
      audio = await synthesize(id, spoken);
    } catch {
      return "";
    }
  }
  if (audio.length < 1000) return "";
  cache.set(key, audio);
  if (cache.size > 80) cache.delete(cache.keys().next().value ?? key);
  return audio;
}
