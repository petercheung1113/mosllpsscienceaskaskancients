import { i as getRequest, n as TSS_SERVER_FUNCTION, t as createServerFn } from "./ssr.mjs";
import { a as isLens, i as isCharacterId, r as getCharacter, t as CHARACTERS } from "./lesson-Deifb3Y-.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/ask.functions-GoPjm2Lb.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var hits = /* @__PURE__ */ new Map();
function allowRequest(ip) {
	const now = Date.now();
	const recent = (hits.get(ip) ?? []).filter((stamp) => now - stamp < 6e4);
	if (recent.length >= 80) return false;
	recent.push(now);
	hits.set(ip, recent);
	if (hits.size > 400) {
		const oldest = hits.keys().next().value;
		if (oldest) hits.delete(oldest);
	}
	return true;
}
function clientIp() {
	try {
		return getRequest().headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
	} catch {
		return "local";
	}
}
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
var CAMP_ASIDES = [
	"小孩子把乾草編成圓球，在平地上踢來踢去。",
	"小弟弟比賽誰先把一小筐野果提回山洞。",
	"孩子們在淺水邊揀又扁又滑的石，看誰的石在水面跳得遠。",
	"天黑時長輩圍著火講野獸怎樣走近營地，孩子們靠在大人腿上聽。",
	"孩子只准撿細柴，粗木要大人來劈。",
	"下雨時大家擠在洞口，用泥捏小獸，等它在火旁慢慢乾。",
	"阿橋讓孩子站在橋頭數原木，但不准走到橋中間。",
	"阿輪有時讓孩子扶著空車的把手，感覺輪子一轉就輕了。",
	"傍晚把烤魚分給最小的孩子先吃。",
	"孩子學鳥叫，看誰先把河邊的雀引過來。"
];
function systemPrompt(id) {
	const person = getCharacter(id);
	const others = CHARACTERS.filter((item) => item.id !== id).map((item) => `${item.name}（${item.method}：${item.science}）`).join("、");
	const facts = CHARACTERS.map((item) => `- ${item.problem} → 科技方法「${item.method}」。科學：${item.science}。${item.scienceKid} ${item.knew} 模仿大自然：${item.nature} 科學促進科技：${item.scienceToTech} 科技推動科學：${item.techToScience}`).join("\n");
	const fresh = CAMP_ASIDES[Math.floor(Math.random() * CAMP_ASIDES.length)];
	return `你是香港小學常識課的古人夥伴，現在扮演「${person.name}」。用繁體中文，語氣親切，句子短，用詞淺白，像跟小四、小五學生聊天。用「甚麼」「為甚麼」「怎樣」。不要用大陸用語，也不要寫成全篇粵語（避免嘅、咗、喺）。

${person.persona}

其他同伴：${others}。學生問到同伴時，先答你知道的一點，再請他去問那位同伴。

本課知識（問到科學、科技、發明時用，不要違背）：
古人面對寒冷（以及煮食、照明）、搬運重物、無法過河。他們用生火、獨輪車和木橋來解決。
他們多是觀察和模仿大自然，再嘗試、失敗、改進。當時未必知道正式的科學名稱。
${facts}
科學是解釋為甚麼行得通的知識；科技是解決生活問題的方法和工具。科學發現能促進科技發展，科技發展亦能推動科學進步。不要每句都背這句。例子優先用上面三項。

你活在古代，不認識學生時代的東西。聽到打機、遊戲機、手機、電腦、電視、汽車、飛機、電車、雪糕、汽水這類現代詞，不要假裝知道，也不要說「很好玩吧」。先問「甚麼是……？」，再用一件營地小事對照，最後請學生解釋給你聽。

這次若要對照營地，只用這一件，寫成新句子，不要照抄：${fresh}

嚴禁重複。不要再寫這句或近似句：「我活在河邊營地，沒有電，天黑只靠火堆照明取暖。小孩子在草地上追著玩、幫忙撿柴，從不靠近火心。」前面已經答過的句子、例子、開場，這次都要換掉。每次換一個生活細節，換一種講法。

營地生活（只在問到時挑一兩樣，不要每答都倒出來）：
- 食物：河魚、小獸、野果、漿果、堅果、植物的根。用火烤熟。沒有白米、麵包、糖果、牛奶、汽水。
- 飲水：河邊取水，阿火把水燒開再喝。
- 衣服：獸皮和植物編的。
- 居住：睡在山洞口。
- 一天：天亮找食物、砍柴、搬石頭、看橋；天黑圍火講故事。
- 害怕：急流、黑夜、野獸、火熄了。
- 小孩子：追著玩、撿細柴、看火但不走近火心、編草球、在淺水邊揀石。沒有遊戲機。

回答規則：
- 用第一人稱「我」。
- 先直接回答學生這一問。食、衣、住、玩、害怕、家人、天氣、動物、身體、感受，都要認真答，不要說「我只懂生火、搬運、過河」。
- 學生提到你沒聽過的現代事物時，第一句就要問「甚麼是……？」，不要評論它好不好玩，最後請學生講給你聽。對照只用上面指定的那一件。
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
function parseModel(raw) {
	const start = raw.indexOf("{");
	const end = raw.lastIndexOf("}");
	if (start < 0 || end <= start) return null;
	try {
		const value = JSON.parse(raw.slice(start, end + 1));
		if (typeof value.reply !== "string") return null;
		const reply = value.reply.replace(/\s+/g, " ").trim();
		if (!reply) return null;
		const lens = typeof value.lens === "string" && isLens(value.lens) ? value.lens : "經驗";
		const think = typeof value.think === "string" ? value.think.replace(/\s+/g, " ").trim().slice(0, 40) : "";
		return {
			reply: reply.slice(0, 500),
			lens,
			think
		};
	} catch {
		return null;
	}
}
async function callGrok(apiKey, messages, jsonMode) {
	const body = {
		model: "grok-4.5",
		temperature: .8,
		max_tokens: 700,
		messages
	};
	if (jsonMode) body.response_format = { type: "json_object" };
	return fetch("https://api.x.ai/v1/chat/completions", {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${apiKey}`
		},
		body: JSON.stringify(body),
		signal: AbortSignal.timeout(28e3)
	});
}
var askAncient_createServerFn_handler = createServerRpc({
	id: "9f1adc45fff0dccd56d7ad46a8d2dc6fe129fbac034eb0f1b077032f2b05e1ac",
	name: "askAncient",
	filename: "src/lib/ask.functions.ts"
}, (opts) => askAncient.__executeServer(opts));
var askAncient = createServerFn({ method: "POST" }).validator(readChat).handler(askAncient_createServerFn_handler, async ({ data }) => {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: false,
		error: "這位古人暫時不能回答，請稍後再試。"
	};
	if (!allowRequest(clientIp())) return {
		ok: false,
		error: "問得太密了，休息幾秒再問。"
	};
	const person = getCharacter(data.characterId);
	const messages = [{
		role: "system",
		content: systemPrompt(data.characterId)
	}, ...data.messages.slice(-8)];
	let response;
	try {
		response = await callGrok(apiKey, messages, true);
		if (response.status === 400) response = await callGrok(apiKey, messages, false);
		else if (response.status === 429 || response.status >= 500) response = await callGrok(apiKey, messages, true);
	} catch {
		return {
			ok: false,
			error: `${person.name}聽不清楚，請再送出一次。`
		};
	}
	if (!response.ok) {
		console.error("xai chat failed", response.status);
		return {
			ok: false,
			error: `${person.name}聽不清楚，請再送出一次。`
		};
	}
	const parsed = parseModel((await response.json()).choices?.[0]?.message?.content ?? "");
	if (!parsed) {
		console.error("xai chat unparsed");
		return {
			ok: false,
			error: `${person.name}說得太亂，請再問一次。`
		};
	}
	return {
		ok: true,
		reply: parsed.reply,
		lens: parsed.lens,
		think: parsed.think
	};
});
function readSpeech(input) {
	if (!input || typeof input !== "object") throw new Error("未能朗讀");
	const data = input;
	if (typeof data.characterId !== "string" || !isCharacterId(data.characterId)) throw new Error("找不到這位古人");
	if (typeof data.text !== "string") throw new Error("未能朗讀");
	const text = data.text.replace(/\s+/g, " ").trim().slice(0, 180);
	if (!text) throw new Error("未能朗讀");
	return {
		characterId: data.characterId,
		text
	};
}
var speakAncient_createServerFn_handler = createServerRpc({
	id: "368fea765894ae01c83fc33b26a7cb9b62d940a221cabb32e82004634bfb3c04",
	name: "speakAncient",
	filename: "src/lib/ask.functions.ts"
}, (opts) => speakAncient.__executeServer(opts));
var speakAncient = createServerFn({ method: "POST" }).validator(readSpeech).handler(speakAncient_createServerFn_handler, async ({ data }) => {
	const apiKey = process.env.XAI_API_KEY;
	if (!apiKey) return {
		ok: false,
		error: "暫時未能朗讀"
	};
	if (!allowRequest(clientIp())) return {
		ok: false,
		error: "請等一等再聽"
	};
	const person = getCharacter(data.characterId);
	try {
		const response = await fetch("https://api.x.ai/v1/tts", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${apiKey}`
			},
			body: JSON.stringify({
				text: data.text,
				voice_id: person.voiceId,
				language: "zh"
			}),
			signal: AbortSignal.timeout(28e3)
		});
		if (!response.ok) {
			console.error("xai tts failed", response.status);
			return {
				ok: false,
				error: "暫時未能朗讀"
			};
		}
		const bytes = Buffer.from(await response.arrayBuffer());
		if (bytes.byteLength < 80 || bytes.byteLength > 15e5) return {
			ok: false,
			error: "暫時未能朗讀"
		};
		const mime = response.headers.get("content-type") || "audio/mpeg";
		return {
			ok: true,
			audio: bytes.toString("base64"),
			mime: mime.startsWith("audio/") ? mime : "audio/mpeg"
		};
	} catch {
		return {
			ok: false,
			error: "暫時未能朗讀"
		};
	}
});
//#endregion
export { askAncient_createServerFn_handler, speakAncient_createServerFn_handler };
