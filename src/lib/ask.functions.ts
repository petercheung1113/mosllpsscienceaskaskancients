import { createServerFn } from "@tanstack/react-start";
import { CHARACTERS, getCharacter, isCharacterId, type CharacterId, type Lens } from "@/lib/lesson";
import { matchCampLife } from "@/lib/camp-qa";
import { toColloquial } from "@/lib/speak-yue";
import { recordAsk, warningCount, addWarning } from "@/lib/roster.server";
import { careSpeech, isDistress, isMisconduct, lockedSpeech, warningSpeech } from "@/lib/conduct";

type ChatTurn = { role: "user" | "assistant"; content: string };
type Line = { reply: string; lens: Lens; think: string; speak: string };

function readChat(input: unknown): { characterId: CharacterId; studentId: string; messages: ChatTurn[] } {
  if (!input || typeof input !== "object") throw new Error("問題格式不對");
  const data = input as { characterId?: unknown; studentId?: unknown; messages?: unknown };
  if (typeof data.characterId !== "string" || !isCharacterId(data.characterId)) {
    throw new Error("找不到這位古人");
  }
  if (typeof data.studentId !== "string" || !/^[0-9a-f-]{36}$/i.test(data.studentId)) {
    throw new Error("請先登入");
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
  return { characterId: data.characterId, studentId: data.studentId, messages };
}

function line(reply: string, lens: Lens = "經驗", think = "", speak?: string): Line {
  return { reply, lens, think, speak: speak ?? toColloquial(reply) };
}

const HOW: Record<CharacterId, string> = {
  fire: "我把較軟的乾木按在地上，用較硬的木棒在上面快速旋轉，冒煙後蓋上乾草，再輕輕吹。我也試過用兩塊石頭相擊迸出火花。",
  wheel: "我看見圓木放在重物下面會滾，於是做了一輛獨輪車：一隻木輪、一個車斗、兩條長把手。石頭蓋在靠近輪的車斗裡，握住把手就能推動。",
  bridge: "我看見倒下的大樹連着兩岸，於是砍下較粗的樹幹，並排搭成一道木橋。人走上去時，橋中間會微微向下彎。不要一次站太多人。",
};

const HOW_SAY: Record<CharacterId, string> = {
  fire: "我將軟啲嘅乾木撳喺地下，用硬啲嘅木棒喺上面快快咁轉。一見到冒煙，就蓋上乾草，再輕輕吹。我都試過用兩塊石相撞，迸出火花添。",
  wheel: "我見到圓木放喺重嘢下面會滾，於是整咗架獨輪車：一隻木輪、一個車斗、兩條長把手。石放近個輪，握住把手就推得郁。",
  bridge: "我見到棵大樹倒低，連住兩邊岸，於是斬咗粗啲嘅樹幹，並排搭成條木橋。人行上去，中間會微微向下彎。唔好一次過站太多人呀。",
};

const PROBLEM: Record<CharacterId, Line> = {
  fire: line("我的生活難題是寒冷。天冷的時候，沒有火，人就受不住。", "經驗", "", "我嘅生活難題係寒冷。天冷嘅時候，冇火，人就頂唔住。"),
  wheel: line("我的生活難題是要搬運重物。大石抱不起來。", "經驗", "", "我嘅生活難題係要搬運重物。大石抱唔起。"),
  bridge: line("我的生活難題是無法過河。河水又寬又急，游過去很危險。", "經驗", "", "我嘅生活難題係無法過河。河水又闊又急，游過去好危險。"),
};

const SOLVE: Record<CharacterId, Line> = {
  fire: line(
    "我用生火解決寒冷。我把兩條木頭快快摩擦，接觸的地方就變熱，熱到一定程度，乾草便會燒着。",
    "科技",
    "",
    "我用生火解決寒冷。我將兩條木頭快快摩擦，接觸嘅地方就變熱，熱到一定程度，乾草就會燒着。",
  ),
  wheel: line(
    "我用獨輪車搬運重物。重物放近輪，我握住較長的把手，就可以用較小的力推動。",
    "科技",
    "",
    "我用獨輪車搬運重物。重嘢放近個輪，我捉住長啲嘅把手，就可以用少啲力去推。",
  ),
  bridge: line(
    "我用木橋過河。人站上去，木橋會微微向下彎，所以我選較粗的樹幹，也不讓太多人同時站上去。",
    "科技",
    "",
    "我用木橋過河。人企上去，木橋會微微向下彎，所以我揀粗啲嘅樹幹，亦唔畀太多人一齊企上去。",
  ),
};

const SAW: Record<CharacterId, Line> = {
  fire: line(
    "我只知道兩條木頭快快摩擦，接觸的地方就變熱，乾草便會燒着。摩擦力這個名稱，是後來的人才說的，我當時不知道。",
    "科學",
    "",
    "我淨係知兩條木頭快快摩擦，接觸嘅地方就變熱，乾草就會燒着。摩擦力呢個名，係後尾啲人先講嘅，我當時唔知。",
  ),
  wheel: line(
    "我只知道重物放近輪、握住長把手，推起來就輕很多。槓桿這個名稱，是後來的人才說的，我當時不知道。",
    "科學",
    "",
    "我淨係知重嘢放近個輪、捉住長把手，推起身就輕好多。槓桿呢個名，係後尾啲人先講嘅，我當時唔知。",
  ),
  bridge: line(
    "我只知道人站上去，木橋會向下彎，太多人就危險。壓縮力和拉伸力這些名稱，是後來的人才說的，我當時不知道。",
    "科學",
    "",
    "我淨係知人企上去，木橋會向下彎，太多人就危險。壓縮力同拉伸力呢啲名，係後尾啲人先講嘅，我當時唔知。",
  ),
};

function asksProblem(text: string): boolean {
  return /難題|生活問題|遇到甚麼困難|遇到咩困難|遇到甚麼問題/.test(text);
}

function asksSolve(text: string): boolean {
  return /點解決|怎樣解決|如何解決|點樣解決|怎麼解決|點樣解決法/.test(text);
}

function ownTopic(id: CharacterId, text: string): boolean {
  if (id === "fire") return /生火|鑽木|取火|摩擦力|照明|取暖|用火|寒冷|天冷|好凍|天凍/.test(text);
  if (id === "wheel") return /獨輪|推車|大石|槓桿|搬重|搬運|輪子|重物/.test(text);
  return /木橋|搭橋|過河|壓縮|拉伸|過唔到/.test(text);
}

function localReply(id: CharacterId, question: string): Line {
  const person = getCharacter(id);
  const text = question.replace(/\s+/g, "");
  const others = CHARACTERS.filter((item) => item.id !== id);

  if (/^(你好|您好|哈囉|嗨|hi|hello|早晨|早安|早上好|午安)/i.test(text)) {
    if (/早晨|早安/.test(text)) {
      return line(
        `早晨。我是${person.name}，今天也在營地做事。你吃過東西了嗎？`,
        "經驗",
        "",
        `早晨呀。我係${person.name}，今日都喺營地做事。你食咗嘢未呀？`,
      );
    }
    return line(
      `你好，我是${person.name}。很高興你來找我說話。你今天好嗎？`,
      "經驗",
      "",
      `你好呀，我係${person.name}。好開心你嚟搵我傾偈。你今日好呀？`,
    );
  }
  if (/再見|拜拜/.test(text)) {
    return line(`再見。下次可以再問我${person.method}。`, "經驗", "", `拜拜啦。下次可以再問我${person.method}呀。`);
  }
  if (/食咗|食左|食過|吃了|吃過|吃飯|食飯|食未|飯未|肚餓|早餐|午餐/.test(text)) {
    return line(
      "我吃過了。天亮後烤了一條河魚，還吃了幾顆野果。你吃過了嗎？",
      "經驗",
      "你吃的是甚麼？",
      "我食咗啦。天光之後烤咗一條河魚，仲食咗幾顆野果。你食咗未呀？",
    );
  }
  if (/你是誰|你係邊|叫甚麼|叫咩名/.test(text)) {
    return line(
      `我是${person.name}，住在河邊的營地。我負責${person.method}。`,
      "經驗",
      "",
      `我係${person.name}呀，住喺河邊嘅營地。我負責${person.method}嘅。`,
    );
  }
  if (/分別|科學是甚麼|科技是甚麼|甚麼是科學|甚麼是科技|係咪一樣|是不是一樣/.test(text)) {
    return line(
      `科學是解釋為甚麼行得通的知識；科技是解決生活問題的方法和工具。我用${person.method}解決${person.problem}，那是科技。後來的人才說明${person.science}，那是科學。`,
      "互相推動",
      "你覺得哪一樣先出現？",
      `科學就係解釋點解行得通嘅知識；科技就係解決生活問題嘅方法同工具呀。我用${person.method}去解決${person.problem}，呢個係科技。後尾啲人先講明${person.science}，呢個先係科學啦。`,
    );
  }
  if (/促進科技|科學促進|科學發現/.test(text)) return line(person.scienceToTech, "互相推動");
  if (/推動科學|科技推動|科技發展/.test(text)) return line(person.techToScience, "互相推動");

  for (const other of others) {
    if (ownTopic(other.id, text)) {
      return line(`這件事是${other.name}在做的。他用${other.method}解決${other.problem}。你去問${other.name}，他會講得更清楚。`, "科技");
    }
  }

  if (ownTopic(id, text) || /科學|科技|原理|發明/.test(text)) {
    if (/當時|知不知道|知唔知|知道嗎/.test(text)) return line(person.knew, "經驗");
    if (/模仿|大自然|觀察/.test(text)) return line(person.nature, "經驗");
    if (/科學|原理|摩擦力|槓桿|壓縮|拉伸|為甚麼行|點解會|承受|彎/.test(text)) return SAW[id];
    if (asksProblem(text) || /為甚麼要|點解要|有甚麼用|用來|為甚麼/.test(text)) return PROBLEM[id];
    if (asksSolve(text)) return SOLVE[id];
    return line(HOW[id], "科技", "", HOW_SAY[id]);
  }

  if (asksSolve(text)) return SOLVE[id];
  if (asksProblem(text)) return PROBLEM[id];

  const life = matchCampLife(id, text, person);
  if (life) return line(life);

  return line(
    `這件事超出我生活的年代，我說不清楚。你可以先問我遇到甚麼生活難題，再問我怎樣解決。`,
    "經驗",
    "",
    `呢件事超出我生活嘅年代，我說唔清楚呀。你可以先問我遇到咩生活難題，再問我點樣解決。`,
  );
}

export const askAncient = createServerFn({ method: "POST" })
  .validator(readChat)
  .handler(async ({ data }) => {
    const question = data.messages[data.messages.length - 1]?.content ?? "";
    const keep = async (reply: {
      ok: true;
      reply: string;
      lens: Lens;
      think: string;
      speak: string;
      warning: boolean;
      locked: boolean;
      warnings: number;
    }) => {
      const logged = recordAsk({
        studentId: data.studentId,
        characterId: data.characterId,
        question,
        answer: reply.reply,
      }).catch(() => {
        /* the child still hears the answer */
      });
      await Promise.race([logged, new Promise((resolve) => setTimeout(resolve, 600))]);
      return { ...reply, audio: "" };
    };
    const pack = (answer: Line, flags: { warning: boolean; locked: boolean; warnings: number }) =>
      keep({ ok: true as const, ...answer, speak: answer.speak || answer.reply, ...flags });

    const warnings = await Promise.race([
      warningCount(data.studentId),
      new Promise<number>((resolve) => setTimeout(() => resolve(0), 800)),
    ]);
    if (warnings >= 3) {
      const locked = lockedSpeech();
      return pack({ reply: locked.reply, lens: "經驗", think: "", speak: locked.speak }, { warning: true, locked: true, warnings });
    }
    if (isMisconduct(question)) {
      const count = await addWarning(data.studentId);
      const warning = warningSpeech(count);
      return pack({ ...line(warning.reply), speak: warning.speak }, { warning: true, locked: count >= 3, warnings: count });
    }
    if (isDistress(question)) {
      const care = careSpeech();
      return pack({ ...line(care.reply), speak: care.speak }, { warning: false, locked: false, warnings });
    }
    return pack(localReply(data.characterId, question), { warning: false, locked: false, warnings });
  });
