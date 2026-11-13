import { t as require_dist } from "../_libs/msedge-tts.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/eleven-voice.server-DHm1gHT3.js
var import_dist = require_dist();
var CAST = {
	fire: {
		voice: "zh-HK-HiuGaaiNeural",
		pitch: "+12Hz",
		rate: "+4%"
	},
	wheel: {
		voice: "zh-HK-WanLungNeural",
		pitch: "-8Hz",
		rate: "-4%"
	},
	bridge: {
		voice: "zh-HK-WanLungNeural",
		pitch: "+8Hz",
		rate: "+2%"
	}
};
var cache = /* @__PURE__ */ new Map();
var engines = /* @__PURE__ */ new Map();
function engine(voice) {
	const found = engines.get(voice);
	if (found) return found.ready;
	const tts = new import_dist.MsEdgeTTS();
	const ready = tts.setMetadata(voice, import_dist.OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3).catch((error) => {
		engines.delete(voice);
		throw error;
	});
	engines.set(voice, {
		tts,
		ready
	});
	return ready;
}
async function synthesize(id, spoken) {
	const cast = CAST[id];
	await engine(cast.voice);
	const { audioStream } = engines.get(cast.voice).tts.toStream(spoken, {
		pitch: cast.pitch,
		rate: cast.rate
	});
	const chunks = [];
	for await (const chunk of audioStream) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
	return Buffer.concat(chunks).toString("base64");
}
async function speakCastVoice(id, text) {
	const spoken = text.replace(/\s+/g, " ").trim().slice(0, 400);
	if (!spoken) return "";
	const key = `${id}:${spoken}`;
	const cached = cache.get(key);
	if (cached) return cached;
	let audio = "";
	try {
		audio = await synthesize(id, spoken);
	} catch {
		engines.delete(CAST[id].voice);
		try {
			audio = await synthesize(id, spoken);
		} catch {
			return "";
		}
	}
	if (audio.length < 1e3) return "";
	cache.set(key, audio);
	if (cache.size > 80) cache.delete(cache.keys().next().value ?? key);
	return audio;
}
//#endregion
export { speakCastVoice };
