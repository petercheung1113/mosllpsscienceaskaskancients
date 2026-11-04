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

  return `你是香港小學科學課的古人夥伴，現在扮演「${person.name}」。用繁體中文，語氣親切，句子短，用詞淺白，像跟小四、小五學生聊天。用「甚麼」「為甚麼」「怎樣」。不要用大陸用語，也不要寫成全篇粵語（避免嘅、咗、喺）。

${person.persona}

其他同伴：${others}。學生問到同伴時，先答你知道的一點，再請他去問那位同伴。

本課知識（問到科學、科技、發明時用，不要違背）：
古人面對寒冷（以及煮食、照明）、搬運重物、無法過河。他們用生火、獨輪車和木橋來解決。
他們多是觀察和模仿大自然，再嘗試、失敗、改進。當時未必知道正式的科學名稱。
${facts}
科學是解釋為甚麼行得通的知識；科技是解決生活問題的方法和工具。科學發現能促進科技發展，科技發展亦能推動科學進步。不要每句都背這句。例子優先用上面三項。

你活在古代，不認識學生時代的東西。聽到打機、遊戲機、手機、電腦、電視、汽車、飛機、電車、漢堡包、雪糕、汽水、麵包、糖果這類現代詞，不要假裝知道，也不要說「很好玩吧」。第一句就問「甚麼是……？」，再用同一類的一件營地生活對照，最後請學生解釋給你聽。

對照必須貼題，不可以岔開去講不相干的事。先判斷學生這一問屬於哪一類，只從那一類挑一件，寫成新句子：
- 食物、食、餓、味道：河魚、小獸、野果、漿果、堅果、植物的根，用火烤熟；傍晚把烤魚分給最小的孩子。不要改講玩耍。
- 玩耍、遊戲、無聊：編草球踢、淺水邊跳石、追著玩、學鳥叫引雀。不要改講食物。
- 出門、交通、車、遠：走路、獨輪車推重物、木橋過河。
- 衣服、冷、熱：獸皮，或用植物編成的衣服。
- 屋、睡覺、下雨：睡在山洞口；下雨擠在洞口。
- 飲水、渴：河邊取水，阿火把水燒開再喝。
同一類裡如果上一句用過，這次換同一類的另一件。

反例：學生說「我平時食漢堡包」，不可以回答「孩子學鳥叫，看誰先把河邊的雀引過來」。那和食物無關。應先問「甚麼是漢堡包？」，再說自己吃烤魚或野果，然後請學生講漢堡包是甚麼。

嚴禁重複。不要再寫這句或近似句：「我活在河邊營地，沒有電，天黑只靠火堆照明取暖。小孩子在草地上追著玩、幫忙撿柴，從不靠近火心。」前面已經答過的句子、例子、開場，這次都要換掉。

營地生活（只在問到時，按上面的類別挑一件，不要每答都倒出來）：
- 食物：河魚、小獸、野果、漿果、堅果、植物的根。用火烤熟。沒有白米、麵包、糖果、牛奶、汽水、漢堡包。
- 飲水：河邊取水，阿火把水燒開再喝。
- 衣服：獸皮和植物編的。
- 居住：睡在山洞口。
- 一天：天亮找食物、砍柴、搬石頭、看橋；天黑圍火講故事。
- 害怕：急流、黑夜、野獸、火熄了。
- 小孩子玩耍：追著玩、撿細柴、看火但不走近火心、編草球、在淺水邊揀石、學鳥叫。沒有遊戲機。

回答規則：
- 用第一人稱「我」。
- 先直接回答學生這一問。食、衣、住、玩、害怕、家人、天氣、動物、身體、感受，都要認真答，不要說「我只懂生火、搬運、過河」。
- 學生提到你沒聽過的現代事物時，第一句就要問「甚麼是……？」，不要評論它好不好玩，最後請學生講給你聽。中間那句對照必須和學生講的是同一類，禁止插入不相干的活動。
- 問到發明或科學時，才把「我當時靠經驗知道的」和「後來科學家才說明的原理」分開講。生活題不必硬拉原理。
- 可以反問一句。
- 只有不適合小學生的內容才不答，並溫柔請他問營地的事。
- 不要承認自己是人工智能或語言模型。若被問是不是真人，說你是這一課的古人夥伴。
- 不要用表情符號、標題或長條列。

只輸出一個 JSON 物件，不要加別的文字：
{"reply":"60到160字的說話","lens":"經驗或科技或科學或互相推動","think":"24字以內、問學生的一句"}
lens 只能是：經驗、科技、科學、互相推動。生活問題用「經驗」。
think 是給學生想的短問題，不是你自己的答案。`;
}

function parseModel(raw: string): { reply: string; lens: Lens; think: string } | null {
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const value = JSON.parse(raw.slice(start, end + 1)) as {
      reply?: unknown;
      lens?: unknown;
      think?: unknown;
    };
    if (typeof value.reply !== "string") return null;
    const reply = value.reply.replace(/\s+/g, " ").trim();
    if (!reply) return null;
    const lens = typeof value.lens === "string" && isLens(value.lens) ? value.lens : "經驗";
    const think =
      typeof value.think === "string" ? value.think.replace(/\s+/g, " ").trim().slice(0, 40) : "";
    return { reply: reply.slice(0, 500), lens, think };
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

function plainReply(raw: string): { reply: string; lens: Lens; think: string } | null {
  const text = raw
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (text.length < 8 || text.startsWith("{") || text.startsWith("[")) return null;
  return { reply: text.slice(0, 220), lens: "經驗", think: "" };
}

function fallbackReply(id: CharacterId, question: string): { reply: string; lens: Lens; think: string } {
  const food = /食|餓|飯|漢堡|肉|菜|野果|水果|甜|味|糕|糖/.test(question);
  const play = /玩|遊戲|打機|無聊/.test(question);
  const wear = /衣|穿|冷|熱|鞋/.test(question);
  const home = /屋|睡|雨|住|洞/.test(question);
  const water = /喝水|飲水|渴|河水/.test(question);
  const travel = /汽車|飛機|船|行路|出門|坐車/.test(question);
  let reply = "";
  if (food) {
    reply = "甚麼是你說的那種食物？我沒吃過。我肚子餓就烤河魚，也採野果和堅果，傍晚把烤魚分給最小的孩子。你可以講給我聽嗎？";
  } else if (play) {
    reply = "甚麼是你說的那種玩法？我們的孩子把乾草編成圓球來踢，也在淺水邊比賽跳石。你可以講給我聽嗎？";
  } else if (wear) {
    reply = "我們穿獸皮，也用植物編成衣服。天冷就靠近火堆。你說的衣服是怎樣的？";
  } else if (home) {
    reply = "我們睡在山洞口。下雨就擠在洞口，看着火慢慢燒。你住的地方是怎樣的？";
  } else if (water) {
    reply =
      id === "fire"
        ? "我們在河邊取水，我把水燒開再喝。你說的是甚麼水？"
        : "我們在河邊取水，阿火把水燒開再喝。你說的是甚麼水？";
  } else if (travel) {
    reply = "我們靠雙腳走路。重的東西用獨輪車推，過河就走木橋。你說的是怎樣走？";
  } else if (id === "fire") {
    reply = "我在山洞口鑽木取火，用來取暖、烤魚和照明。你想問生火，還是告訴我你那邊的生活？";
  } else if (id === "wheel") {
    reply = "大石抱不動，我就做了一輛獨輪車，輪子一轉就輕了。你想問搬東西，還是告訴我你那邊的生活？";
  } else {
    reply = "河水擋着去路，我用樹幹搭了木橋，人可以走過去。你想問過河，還是告訴我你那邊的生活？";
  }
  return { reply, lens: "經驗", think: "你那邊是怎樣的？" };
}

async function completeAsk(
  apiKey: string,
  messages: { role: string; content: string }[],
): Promise<{ reply: string; lens: Lens; think: string } | null> {
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
      return { ok: true as const, reply: backup.reply, lens: backup.lens, think: backup.think };
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
      if (first) return { ok: true as const, reply: first.reply, lens: first.lens, think: first.think };
    } catch {
      /* try once more only if the first attempt failed quickly */
    }
    if (Date.now() - started < 4000) {
      try {
        const second = await completeAsk(apiKey, messages);
        if (second) return { ok: true as const, reply: second.reply, lens: second.lens, think: second.think };
      } catch {
        /* use the camp fallback below */
      }
    }
    const backup = fallbackReply(data.characterId, question);
    return { ok: true as const, reply: backup.reply, lens: backup.lens, think: backup.think };
  });

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

function cleanSpoken(raw: string): string {
  const text = raw
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/^["「]|["」]$/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return text.slice(0, 400);
}

async function spokenCantonese(apiKey: string, name: string, text: string): Promise<string> {
  try {
    const response = await callGrok(
      apiKey,
      [
        {
          role: "system",
          content: `你把書面中文改成香港小學生聽得明的口語廣東話，只供朗讀。保持原意，不要加新資料，不要用英文。用「係、喺、嘅、咩、唔、冇、咗、睇、食、佢、畀、啲、咁、點解、噉」。說話人是「${name}」，保持第一人稱。只輸出要讀出的句子。`,
        },
        { role: "user", content: text },
      ],
      false,
      0.3,
    );
    if (!response.ok) return text;
    const payload = (await response.json()) as { choices?: { message?: { content?: string } }[] };
    const spoken = cleanSpoken(payload.choices?.[0]?.message?.content ?? "");
    if (spoken.length < 4) return text;
    return spoken;
  } catch {
    return text;
  }
}

export const speakAncient = createServerFn({ method: "POST" })
  .validator(readSpeech)
  .handler(async ({ data }) => {
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: false as const, error: "暫時未能朗讀" };
    if (!allowRequest(clientIp())) return { ok: false as const, error: "請等一等再聽" };

    const person = getCharacter(data.characterId);
    const spoken = await spokenCantonese(apiKey, person.name, data.text);
    try {
      const response = await fetch("https://api.x.ai/v1/tts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          text: spoken,
          voice_id: person.voiceId,
          language: "yue",
        }),
        signal: AbortSignal.timeout(28_000),
      });
      if (!response.ok) {
        console.error("xai tts failed", response.status);
        return { ok: false as const, error: "暫時未能朗讀" };
      }
      const bytes = Buffer.from(await response.arrayBuffer());
      if (bytes.byteLength < 80 || bytes.byteLength > 1_500_000) {
        return { ok: false as const, error: "暫時未能朗讀" };
      }
      const mime = response.headers.get("content-type") || "audio/mpeg";
      return {
        ok: true as const,
        audio: bytes.toString("base64"),
        mime: mime.startsWith("audio/") ? mime : "audio/mpeg",
      };
    } catch {
      return { ok: false as const, error: "暫時未能朗讀" };
    }
  });
