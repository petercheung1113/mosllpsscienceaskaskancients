import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { CHARACTERS, getCharacter, isCharacterId, isLens, type CharacterId, type Lens } from "@/lib/lesson";

type ChatTurn = { role: "user" | "assistant"; content: string };

const hits = new Map<string, number[]>();

function allowRequest(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((stamp) => now - stamp < 60_000);
  if (recent.length >= 80) return false;
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 400) {
    const oldest = hits.keys().next().value;
    if (oldest) hits.delete(oldest);
  }
  return true;
}

function clientIp(): string {
  try {
    const header = getRequest().headers.get("x-forwarded-for");
    return header?.split(",")[0]?.trim() || "local";
  } catch {
    return "local";
  }
}

function readChat(input: unknown): { characterId: CharacterId; messages: ChatTurn[] } {
  if (!input || typeof input !== "object") throw new Error("問題格式不對");
  const data = input as { characterId?: unknown; messages?: unknown };
  if (typeof data.characterId !== "string" || !isCharacterId(data.characterId)) {
    throw new Error("找不到這位古人");
  }
  if (!Array.isArray(data.messages) || data.messages.length === 0 || data.messages.length > 16) {
    throw new Error("請把問題寫短一點");
  }
  const messages = data.messages.map((item) => {
    if (!item || typeof item !== "object") throw new Error("問題格式不對");
    const turn = item as { role?: unknown; content?: unknown };
    if (turn.role !== "user" && turn.role !== "assistant") throw new Error("問題格式不對");
    if (typeof turn.content !== "string") throw new Error("問題格式不對");
    const content = turn.content.replace(/\s+/g, " ").trim().slice(0, 400);
    if (!content) throw new Error("請寫下你的問題");
    const role: "user" | "assistant" = turn.role === "assistant" ? "assistant" : "user";
    return { role, content };
  });
  if (messages[messages.length - 1]?.role !== "user") throw new Error("請先寫下你的問題");
  return { characterId: data.characterId, messages };
}

function systemPrompt(id: CharacterId): string {
  const person = getCharacter(id);
  const others = CHARACTERS.filter((item) => item.id !== id)
    .map((item) => `${item.name}（${item.method}：${item.science}）`)
    .join("、");
  const facts = CHARACTERS.map(
    (item) =>
      `- ${item.problem} → 科技方法「${item.method}」。科學：${item.science}。${item.scienceKid} ${item.knew} 模仿大自然：${item.nature} 科學促進科技：${item.scienceToTech} 科技推動科學：${item.techToScience}`,
  ).join("\n");

  return `你是香港小學科學課的古人夥伴，現在扮演「${person.name}」。你是一個會聊天的人，不是只能背課文的機器。學生問甚麼，你都先答那一問。

用繁體中文書面語，語氣親切，句子短，像跟小四、小五說話。用「甚麼」「為甚麼」「怎樣」。不要用大陸用語，也不要寫成全篇粵語（避免嘅、咗、喺、係）。學生常常用廣東話打字，例如「早晨」「食咗飯未」「食左」「點解」「係咪」。你要聽得懂，再用書面語答。

${person.persona}

其他同伴：${others}。問到同伴時，先答你知道的一點，再請他去問那位同伴。

一定要答的日常話（不要岔開去講生火、推車、搭橋，除非他問的就是這些）：
- 打招呼：你好、哈囉、嗨、早晨、早安、再見。你要回禮。例如他說「你好」，你就說「你好，我是${person.name}」；他說「早晨」，你就說「早晨」。可以再問他一句今天好嗎。
- 吃過飯沒有、肚餓、早餐、午餐：答「我吃過了」，並說你吃的是河魚、小獸肉、野果或漿果。不要問「甚麼是飯」，也不要說還沒吃。
- 你是誰、叫甚麼名字、幾歲、住哪裡、今天做甚麼、天氣、心情、怕不怕、家人、朋友：用第一人稱認真答。
- 食、衣、住、玩、上學、身體、感受、故事，都要答。不可以說「我只懂生火、搬運、過河」，也不可以叫他再問一次才肯答。

你活在古代，不認識學生時代的新東西。聽到打機、遊戲機、手機、電腦、電視、汽車、飛機、電車、漢堡包、雪糕、汽水、麵包、糖果這類詞，不要假裝知道。第一句問「甚麼是……？」，再用同一類的一件營地生活對照，然後請學生講給你聽。食物就對烤魚或野果，玩耍就對草球或跳石，不要把兩類混在一起。

本課知識只在問到科學、科技、發明、生火、車、橋時才用，不要每句都背：
古人面對寒冷、煮食、照明、搬運重物、無法過河。他們用生火、獨輪車和木橋來解決。多是觀察和模仿大自然，再嘗試、失敗、改進。當時未必知道正式的科學名稱。
${facts}
科學是解釋為甚麼行得通的知識；科技是解決生活問題的方法和工具。科學促進科技，科技也推動科學。

回答規則：
- 用第一人稱「我」。先直接回答，再可以反問一句。
- 打招呼和是非題要短。普通問題大約兩到四句。不必湊滿很多字。
- 問到發明或科學時，才把「我當時靠經驗知道的」和「後來科學家才說明的原理」分開講。
- 只有明顯不適合小學生的內容才不答，並溫柔請他換一個問題。其餘都答。
- 不要承認自己是人工智能。若被問是不是真人，說你是這一課的古人夥伴。
- 不要用表情符號、標題或長條列。前面已說過的句子，這次換個說法。

只輸出一個 JSON 物件，不要加別的文字：
{"reply":"書面語","speak":"同一句口語廣東話，用來即時朗讀","lens":"經驗或科技或科學或互相推動","think":"24字以內、問學生的一句，可留空"}
speak 必須同 reply 同時寫好，意思一樣，用「係、喺、嘅、咩、唔、冇、咗、食、佢」。不要另加內容。
lens 只能是：經驗、科技、科學、互相推動。打招呼和生活問題用「經驗」。`;
}

function parseModel(raw: string): { reply: string; lens: Lens; think: string; speak: string } | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const value = JSON.parse(raw.slice(start, end + 1)) as {
      reply?: unknown;
      lens?: unknown;
      think?: unknown;
      speak?: unknown;
    };
    if (typeof value.reply !== "string") return null;
    const reply = value.reply.replace(/\s+/g, " ").trim();
    if (!reply) return null;
    const lens = typeof value.lens === "string" && isLens(value.lens) ? value.lens : "經驗";
    const think =
      typeof value.think === "string" ? value.think.replace(/\s+/g, " ").trim().slice(0, 40) : "";
    const speak =
      typeof value.speak === "string" ? value.speak.replace(/\s+/g, " ").trim().slice(0, 400) : "";
    return { reply: reply.slice(0, 500), lens, think, speak: speak || toSpoken(reply) };
  } catch {
    return null;
  }
}

async function callGrok(
  apiKey: string,
  messages: { role: string; content: string }[],
  jsonMode: boolean,
  temperature = 0.5,
  maxTokens = 400,
  timeoutMs = 6500,
) {
  const body: Record<string, unknown> = {
    model: "grok-4.3",
    reasoning_effort: "none",
    temperature,
    max_tokens: maxTokens,
    messages,
  };
  if (jsonMode) body.response_format = { type: "json_object" };
  return fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
    signal: AbortSignal.timeout(timeoutMs),
  });
}

function plainReply(raw: string): { reply: string; lens: Lens; think: string; speak: string } | null {
  const text = raw
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length < 8 || text.startsWith("{") || text.startsWith("[")) return null;
  const reply = text.slice(0, 220);
  return { reply, lens: "經驗", think: "", speak: toSpoken(reply) };
}

function toSpoken(text: string): string {
  const pairs: [string, string][] = [
    ["甚麼", "咩"],
    ["什麼", "咩"],
    ["沒有", "冇"],
    ["不是", "唔係"],
    ["不會", "唔會"],
    ["不要", "唔好"],
    ["吃過了", "食咗啦"],
    ["吃過", "食咗"],
    ["吃了", "食咗"],
    ["吃", "食"],
    ["我們", "我哋"],
    ["他們", "佢哋"],
    ["我是", "我係"],
    ["今天", "今日"],
    ["你今天好嗎", "你今日好嗎"],
    ["很高興", "好開心"],
    ["嗎", "呀"],
    ["的", "嘅"],
    ["在", "喺"],
    ["和", "同"],
    ["給", "畀"],
    ["看", "睇"],
    ["說", "講"],
    ["還", "仲"],
    ["了", "咗"],
    ["不", "唔"],
  ];
  let spoken = text;
  for (const [from, to] of pairs) spoken = spoken.replaceAll(from, to);
  return spoken;
}

function fallbackReply(id: CharacterId, question: string): { reply: string; lens: Lens; think: string; speak: string } {
  const name = getCharacter(id).name;
  const text = question.replace(/\s+/g, "");
  const hello = /^(你好|您好|哈囉|嗨|hi|hello|早晨|早安|早上好|午安|再見|拜拜)/i.test(text);
  const eaten = /食咗|食左|食過|吃了|吃過|吃飯|食飯|食未|飯未/.test(text);
  const who = /你是誰|你係邊|叫甚麼|叫咩|幾歲|名字/.test(text);
  const say = (reply: string, think = "") => ({ reply, lens: "經驗" as const, think, speak: toSpoken(reply) });
  if (hello) {
    const line = /早晨|早安/.test(text) ? `早晨。我是${name}，今天也在營地做事。你吃過東西了嗎？` : `你好，我是${name}。很高興你來找我說話。你今天好嗎？`;
    return say(line);
  }
  if (eaten) {
    return say("我吃過了。天亮後烤了一條河魚，還吃了幾顆野果。你吃過了嗎？", "你吃的是甚麼？");
  }
  if (who) return say(`我是${name}，住在河邊的營地。你想問我今天做的事，還是想先跟我打招呼？`);
  if (/漢堡|雪糕|汽水|糖果|麵包|蛋糕/.test(question)) {
    return say("甚麼是你說的那種食物？我沒吃過。我肚子餓就烤河魚，也採野果和堅果。你可以講給我聽嗎？", "它是甚麼味道？");
  }
  if (/打機|遊戲機|遊戲/.test(question)) {
    return say("甚麼是你說的那種玩法？我們的孩子把乾草編成圓球來踢，也在淺水邊比賽跳石。你可以講給我聽嗎？", "你們怎麼玩？");
  }
  return say(`${name}聽見了。你可以再說清楚一點嗎？我想認真回答你。`);
}

async function completeAsk(
  apiKey: string,
  messages: { role: string; content: string }[],
): Promise<{ reply: string; lens: Lens; think: string; speak: string } | null> {
  const response = await callGrok(apiKey, messages, true);
  if (response.status === 400) {
    const plain = await callGrok(apiKey, messages, false, 0.5, 400, 5000);
    if (!plain.ok) return null;
    const payload = (await plain.json()) as { choices?: { message?: { content?: string } }[] };
    const text = payload.choices?.[0]?.message?.content ?? "";
    return parseModel(text) ?? plainReply(text);
  }
  if (!response.ok) return null;
  const payload = (await response.json()) as { choices?: { message?: { content?: string } }[] };
  const text = payload.choices?.[0]?.message?.content ?? "";
  return parseModel(text) ?? plainReply(text);
}

export const askAncient = createServerFn({ method: "POST" })
  .validator(readChat)
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) {
      const backup = fallbackReply(data.characterId, data.messages[data.messages.length - 1]?.content ?? "");
      return { ok: true as const, reply: backup.reply, lens: backup.lens, think: backup.think, audio: "", mime: "audio/mpeg" };
    }
    if (!allowRequest(clientIp())) return { ok: false as const, error: "問得太密了，休息幾秒再問。" };

    const question = data.messages[data.messages.length - 1]?.content ?? "";
    const messages = [
      { role: "system", content: systemPrompt(data.characterId) },
      ...data.messages.slice(-6),
    ];
    const started = Date.now();
    try {
      const first = await completeAsk(apiKey, messages);
      if (first) return await withVoice(apiKey, data.characterId, first);
    } catch {
      /* try once more only if the first attempt failed quickly */
    }
    if (Date.now() - started < 4000) {
      try {
        const second = await completeAsk(apiKey, messages);
        if (second) return await withVoice(apiKey, data.characterId, second);
      } catch {
        /* use the camp fallback below */
      }
    }
    const backup = fallbackReply(data.characterId, question);
    return await withVoice(apiKey, data.characterId, backup);
  });

async function synthesize(
  apiKey: string,
  voiceId: string,
  text: string,
): Promise<{ audio: string; mime: string } | null> {
  const spoken = text.replace(/\s+/g, " ").trim().slice(0, 320);
  if (!spoken) return null;
  const response = await fetch("https://api.x.ai/v1/tts", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      text: spoken,
      voice_id: voiceId,
      language: "yue",
    }),
    signal: AbortSignal.timeout(8_000),
  });
  if (!response.ok) return null;
  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.byteLength < 80 || bytes.byteLength > 1_500_000) return null;
  const mime = response.headers.get("content-type") || "audio/mpeg";
  return { audio: bytes.toString("base64"), mime: mime.startsWith("audio/") ? mime : "audio/mpeg" };
}

async function withVoice(
  apiKey: string,
  id: CharacterId,
  answer: { reply: string; lens: Lens; think: string; speak: string },
) {
  const person = getCharacter(id);
  let clip: { audio: string; mime: string } | null = null;
  try {
    clip = await synthesize(apiKey, person.voiceId, answer.speak || toSpoken(answer.reply));
  } catch {
    clip = null;
  }
  return {
    ok: true as const,
    reply: answer.reply,
    lens: answer.lens,
    think: answer.think,
    audio: clip?.audio ?? "",
    mime: clip?.mime ?? "audio/mpeg",
  };
}

function readSpeech(input: unknown): { characterId: CharacterId; text: string } {
  if (!input || typeof input !== "object") throw new Error("未能朗讀");
  const data = input as { characterId?: unknown; text?: unknown };
  if (typeof data.characterId !== "string" || !isCharacterId(data.characterId)) {
    throw new Error("找不到這位古人");
  }
  if (typeof data.text !== "string") throw new Error("未能朗讀");
  const text = data.text.replace(/\s+/g, " ").trim().slice(0, 320);
  if (!text) throw new Error("未能朗讀");
  return { characterId: data.characterId, text };
}

export const speakAncient = createServerFn({ method: "POST" })
  .validator(readSpeech)
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "暫時未能朗讀" };
    if (!allowRequest(clientIp())) return { ok: false as const, error: "請等一等再聽" };

    const person = getCharacter(data.characterId);
    try {
      const clip = await synthesize(apiKey, person.voiceId, toSpoken(data.text));
      if (!clip) return { ok: false as const, error: "暫時未能朗讀" };
      return { ok: true as const, audio: clip.audio, mime: clip.mime };
    } catch {
      return { ok: false as const, error: "暫時未能朗讀" };
    }
  });
