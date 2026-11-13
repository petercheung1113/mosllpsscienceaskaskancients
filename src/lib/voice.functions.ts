import { createServerFn } from "@tanstack/react-start";
import type { CharacterId } from "@/lib/lesson";

function readLine(input: unknown): { text: string; characterId: CharacterId } {
  const data = (input ?? {}) as { text?: unknown; characterId?: unknown };
  const text = typeof data.text === "string" ? data.text.replace(/\s+/g, " ").trim().slice(0, 400) : "";
  const characterId: CharacterId = data.characterId === "wheel" || data.characterId === "bridge" ? data.characterId : "fire";
  return { text, characterId };
}

export const speakAncient = createServerFn({ method: "POST" })
  .validator(readLine)
  .handler(async ({ data }) => {
    if (!data.text) return { audio: "" };
    const { speakCastVoice } = await import("@/lib/eleven-voice.server");
    return { audio: await speakCastVoice(data.characterId, data.text) };
  });
