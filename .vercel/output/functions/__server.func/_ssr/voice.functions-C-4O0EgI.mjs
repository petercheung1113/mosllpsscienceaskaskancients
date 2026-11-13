import { t as createServerFn } from "./ssr.mjs";
import { t as createServerRpc } from "./createServerRpc-A6pJPYTF.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/voice.functions-C-4O0EgI.js
function readLine(input) {
	const data = input ?? {};
	return {
		text: typeof data.text === "string" ? data.text.replace(/\s+/g, " ").trim().slice(0, 400) : "",
		characterId: data.characterId === "wheel" || data.characterId === "bridge" ? data.characterId : "fire"
	};
}
var speakAncient_createServerFn_handler = createServerRpc({
	id: "3dac22e247b15095f3b50af940de6979534b2f6a5b526e9e2424b84cc0485c59",
	name: "speakAncient",
	filename: "src/lib/voice.functions.ts"
}, (opts) => speakAncient.__executeServer(opts));
var speakAncient = createServerFn({ method: "POST" }).validator(readLine).handler(speakAncient_createServerFn_handler, async ({ data }) => {
	if (!data.text) return { audio: "" };
	const { speakCastVoice } = await import("./eleven-voice.server-DHm1gHT3.mjs");
	return { audio: await speakCastVoice(data.characterId, data.text) };
});
//#endregion
export { speakAncient_createServerFn_handler };
