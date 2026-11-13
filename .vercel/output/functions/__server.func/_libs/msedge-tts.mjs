import { i as __require, t as __commonJSMin } from "../_runtime.mjs";
import { t as require_axios } from "./axios+[...].mjs";
import { t as require_node } from "./isomorphic-ws.mjs";
//#region node_modules/msedge-tts/dist/Output.js
var require_Output = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.OUTPUT_EXTENSIONS = exports.OUTPUT_FORMAT = void 0;
	/**
	* Only a few of the [possible formats](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/rest-text-to-speech#audio-outputs) are accepted.
	*/
	var OUTPUT_FORMAT;
	(function(OUTPUT_FORMAT) {
		OUTPUT_FORMAT["AUDIO_24KHZ_48KBITRATE_MONO_MP3"] = "audio-24khz-48kbitrate-mono-mp3";
		OUTPUT_FORMAT["AUDIO_24KHZ_96KBITRATE_MONO_MP3"] = "audio-24khz-96kbitrate-mono-mp3";
		OUTPUT_FORMAT["WEBM_24KHZ_16BIT_MONO_OPUS"] = "webm-24khz-16bit-mono-opus";
	})(OUTPUT_FORMAT || (exports.OUTPUT_FORMAT = OUTPUT_FORMAT = {}));
	exports.OUTPUT_EXTENSIONS = {
		[OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3]: "mp3",
		[OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3]: "mp3",
		[OUTPUT_FORMAT.WEBM_24KHZ_16BIT_MONO_OPUS]: "webm"
	};
}));
//#endregion
//#region node_modules/msedge-tts/dist/Prosody.js
var require_Prosody = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.VOLUME = exports.PITCH = exports.RATE = exports.ProsodyOptions = void 0;
	var ProsodyOptions = class {
		/**
		* The pitch to use.
		* Can be any {@link PITCH}, or a relative frequency in Hz (+50Hz), a relative semitone (+2st), or a relative percentage (+50%).
		* [SSML documentation](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-synthesis-markup-voice#:~:text=Optional-,pitch,-Indicates%20the%20baseline)
		*/
		pitch = "+0Hz";
		/**
		* The rate to use.
		* Can be any {@link RATE}, or a relative number (0.5), or string with a relative percentage (+50%).
		* [SSML documentation](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-synthesis-markup-voice#:~:text=Optional-,rate,-Indicates%20the%20speaking)
		*/
		rate = 1;
		/**
		* The volume to use.
		* Can be any {@link VOLUME}, or an absolute number (0, 100), a string with a relative number (+50), or a relative percentage (+50%).
		* [SSML documentation](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-synthesis-markup-voice#:~:text=Optional-,volume,-Indicates%20the%20volume)
		*/
		volume = 100;
	};
	exports.ProsodyOptions = ProsodyOptions;
	/**
	* https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-synthesis-markup-voice#:~:text=Optional-,rate,-Indicates%20the%20speaking
	*/
	var RATE;
	(function(RATE) {
		RATE["X_SLOW"] = "x-slow";
		RATE["SLOW"] = "slow";
		RATE["MEDIUM"] = "medium";
		RATE["FAST"] = "fast";
		RATE["X_FAST"] = "x-fast";
		RATE["DEFAULT"] = "default";
	})(RATE || (exports.RATE = RATE = {}));
	/**
	* https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-synthesis-markup-voice#:~:text=Optional-,pitch,-Indicates%20the%20baseline
	*/
	var PITCH;
	(function(PITCH) {
		PITCH["X_LOW"] = "x-low";
		PITCH["LOW"] = "low";
		PITCH["MEDIUM"] = "medium";
		PITCH["HIGH"] = "high";
		PITCH["X_HIGH"] = "x-high";
		PITCH["DEFAULT"] = "default";
	})(PITCH || (exports.PITCH = PITCH = {}));
	/**
	* https://learn.microsoft.com/en-us/azure/ai-services/speech-service/speech-synthesis-markup-voice#:~:text=Optional-,volume,-Indicates%20the%20volume
	*/
	var VOLUME;
	(function(VOLUME) {
		VOLUME["SILENT"] = "silent";
		VOLUME["X_SOFT"] = "x-soft";
		VOLUME["SOFT"] = "soft";
		VOLUME["MEDIUM"] = "medium";
		VOLUME["LOUD"] = "loud";
		VOLUME["X_LOUD"] = "x-LOUD";
		VOLUME["DEFAULT"] = "default";
	})(VOLUME || (exports.VOLUME = VOLUME = {}));
}));
//#endregion
//#region node_modules/msedge-tts/dist/utils.js
var require_utils = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.joinPath = void 0;
	var joinPath = (...parts) => {
		return parts.filter(Boolean).join("/").replace(/\/{2,}/g, "/");
	};
	exports.joinPath = joinPath;
}));
//#endregion
//#region node_modules/msedge-tts/dist/SecMsGec.js
var require_SecMsGec = /* @__PURE__ */ __commonJSMin(((exports) => {
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.hashSecMsGecV2 = hashSecMsGecV2;
	var EDGE_COPYRIGHT = "Copyright (C) Microsoft Corporation. All rights reserved.";
	var SWAP_FIRST_WORD = {
		swappedWord: 4010109435,
		swappedSum: 1995771700,
		swappedProduct: 3287280279
	};
	var SWAP_SECOND_WORD = {
		swappedWord: 3273069531,
		swappedSum: 411160124,
		swappedProduct: 901586633
	};
	var MIX_FIRST_WORD = [
		3482890513,
		2265471903,
		315537773,
		629022083
	];
	var MIX_SECOND_WORD = [
		2725517045,
		3548616447,
		2090019721,
		3215236969
	];
	async function hashSecMsGecV2(ticksAndToken) {
		const message = new TextEncoder().encode(EDGE_COPYRIGHT + ticksAndToken);
		const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", message));
		return `${toUpperHex(cs64(message, digest))}-${toUpperHex(digest)}`;
	}
	function cs64(message, digest) {
		const digestView = new DataView(digest.buffer, digest.byteOffset, digest.byteLength);
		const firstKey = (digestView.getUint32(0, true) | 1) >>> 0;
		const secondKey = (digestView.getUint32(4, true) | 1) >>> 0;
		const padded = new Uint8Array(Math.ceil(message.length / 8) * 8);
		padded.set(message);
		const words = new DataView(padded.buffer);
		let swapSum = 0;
		let lastSwap = 0;
		let mix = 0;
		let mixSum = 0;
		for (let offset = 0; offset < padded.length; offset += 8) {
			const firstWord = words.getUint32(offset, true);
			const secondWord = words.getUint32(offset + 4, true);
			const firstSwap = swapTerm(firstWord, firstKey, SWAP_FIRST_WORD);
			lastSwap = swapTerm(secondWord, secondKey, SWAP_SECOND_WORD);
			swapSum = swapSum + firstSwap + lastSwap >>> 0;
			mix = swapAndMultiply(Math.imul(mix + firstWord, firstKey), MIX_FIRST_WORD);
			mixSum = mixSum + mix >>> 0;
			mix = swapAndMultiply(Math.imul(mix + secondWord, secondKey), MIX_SECOND_WORD);
			mixSum = mixSum + mix >>> 0;
		}
		const checksum = /* @__PURE__ */ new Uint8Array(8);
		const checksumView = new DataView(checksum.buffer);
		checksumView.setUint32(0, lastSwap ^ mix, true);
		checksumView.setUint32(4, swapSum ^ mixSum, true);
		return checksum;
	}
	function swapTerm(word, key, multipliers) {
		const sum = Math.imul(word, key) + Math.imul(swapHalves(word), multipliers.swappedWord);
		const product = Math.imul(swapHalves(sum), multipliers.swappedSum) >>> 0;
		return Math.imul(swapHalves(product), multipliers.swappedProduct) + product >>> 0;
	}
	function swapAndMultiply(value, multipliers) {
		for (const multiplier of multipliers) value = Math.imul(swapHalves(value), multiplier) >>> 0;
		return value;
	}
	function swapHalves(value) {
		return (value << 16 | value >>> 16) >>> 0;
	}
	function toUpperHex(bytes) {
		return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
	}
}));
//#endregion
//#region node_modules/msedge-tts/dist/MsEdgeTTS.js
var require_MsEdgeTTS = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o, v) {
		Object.defineProperty(o, "default", {
			enumerable: true,
			value: v
		});
	}) : function(o, v) {
		o["default"] = v;
	});
	var __importStar = exports && exports.__importStar || function(mod) {
		if (mod && mod.__esModule) return mod;
		var result = {};
		if (mod != null) {
			for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
		}
		__setModuleDefault(result, mod);
		return result;
	};
	var __importDefault = exports && exports.__importDefault || function(mod) {
		return mod && mod.__esModule ? mod : { "default": mod };
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	exports.MsEdgeTTS = exports.MetadataOptions = void 0;
	var axios_1 = __importDefault(require_axios());
	var isomorphic_ws_1 = __importDefault(require_node());
	var index_1 = __require("node:buffer");
	var Output_1 = require_Output();
	var stream_1 = __require("stream");
	var fs = __importStar(__require("fs"));
	var Prosody_1 = require_Prosody();
	var utils_1 = require_utils();
	var SecMsGec_1 = require_SecMsGec();
	var MetadataOptions = class {
		/**
		* (optional) any voice locale that is supported by the voice. See the list of all voices for compatibility. If not provided, the locale will be inferred from the `voiceName`.
		* Changing the voiceName will reset the voiceLocale.
		*/
		voiceLocale;
		/**
		* (optional) whether to enable sentence boundary metadata. Default is `false`
		*/
		sentenceBoundaryEnabled = false;
		/**
		* (optional) whether to enable word boundary metadata. Default is `false`
		*/
		wordBoundaryEnabled = false;
	};
	exports.MetadataOptions = MetadataOptions;
	var messageTypes;
	(function(messageTypes) {
		messageTypes["TURN_START"] = "turn.start";
		messageTypes["TURN_END"] = "turn.end";
		messageTypes["RESPONSE"] = "response";
		messageTypes["SPEECH_CONFIG"] = "speech.config";
		messageTypes["AUDIO_METADATA"] = "audio.metadata";
		messageTypes["AUDIO"] = "audio";
		messageTypes["SSML"] = "ssml";
	})(messageTypes || (messageTypes = {}));
	exports.MsEdgeTTS = class MsEdgeTTS {
		static TRUSTED_CLIENT_TOKEN = "6A5AA1D4EAFF4E9FB37E23D68491D6F4";
		static VOICES_URL = `https://speech.platform.bing.com/consumer/speech/synthesize/readaloud/voices/list?trustedclienttoken=${MsEdgeTTS.TRUSTED_CLIENT_TOKEN}`;
		static WSS_URL = "wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1";
		static JSON_XML_DELIM = "\r\n\r\n";
		static AUDIO_DELIM = "Path:audio\r\n";
		static VOICE_LANG_REGEX = /\b[a-z]{2,}-[A-Z]{2}\b/;
		static _clockOffsetMs = 0;
		_enableLogger;
		_isBrowser;
		_ws;
		_clientInit;
		_clientGeneration = 0;
		_voice;
		_outputFormat;
		_metadataOptions = new MetadataOptions();
		_streams = {};
		_retiredSockets = [];
		_startTime = 0;
		_agent;
		_connectionTimeoutMs;
		_synthesisTimeoutMs;
		_log(...o) {
			if (this._enableLogger) console.log(...o);
		}
		/**
		* Create a new `MsEdgeTTS` instance.
		*
		* @param options (optional) {@link Options}
		*/
		constructor(options) {
			this._agent = options?.agent || void 0;
			this._enableLogger = options?.enableLogger || false;
			this._isBrowser = typeof window !== "undefined" && typeof window.document !== "undefined";
			this._connectionTimeoutMs = options?.connectionTimeoutMs === void 0 ? 1e4 : options.connectionTimeoutMs;
			this._synthesisTimeoutMs = options?.synthesisTimeoutMs === void 0 ? 6e4 : options.synthesisTimeoutMs;
			for (const [name, value] of Object.entries({
				connectionTimeoutMs: this._connectionTimeoutMs,
				synthesisTimeoutMs: this._synthesisTimeoutMs
			})) if (!Number.isInteger(value) || value < 0 || value > 2147483647) throw new Error(`${name} must be an integer between 0 and 2147483647 milliseconds.`);
		}
		static async getSynthUrl() {
			const req_id = MsEdgeTTS.generateUUID();
			const secMsGEC = await MsEdgeTTS.generateSecMsGec(this.TRUSTED_CLIENT_TOKEN);
			return `${this.WSS_URL}?TrustedClientToken=${this.TRUSTED_CLIENT_TOKEN}&Sec-MS-GEC=${secMsGEC}&Sec-MS-GEC-Version=2-143.0.3650.96&ConnectionId=${req_id}`;
		}
		_initClient() {
			if (this._clientInit) return this._clientInit;
			const tracked = this._createClient().finally(() => {
				if (this._clientInit === tracked) this._clientInit = void 0;
			});
			this._clientInit = tracked;
			return tracked;
		}
		async _createClient(retryClock = true, deadline = this._connectionTimeoutMs ? Date.now() + this._connectionTimeoutMs : 0, generation = this._clientGeneration) {
			const previous = this._ws;
			if (previous) {
				if (previous.readyState === previous.OPEN && Object.values(this._streams).some((stream) => stream.socket === previous && !stream.turnEnded)) {
					if (!this._retiredSockets.includes(previous)) this._retiredSockets.push(previous);
				} else this._closeSocket(previous);
			}
			const synthUrl = await MsEdgeTTS.getSynthUrl();
			if (generation !== this._clientGeneration) throw new Error("Edge TTS connection closed before initialization completed.");
			const remaining = deadline ? deadline - Date.now() : 0;
			if (deadline && remaining <= 0) throw new Error(`Edge TTS connection timed out after ${this._connectionTimeoutMs} milliseconds.`);
			const options = { headers: {
				"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/143.0.0.0 Safari/537.36 Edg/143.0.0.0",
				"Origin": "chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold"
			} };
			const ws = this._ws = this._isBrowser ? new isomorphic_ws_1.default(synthUrl) : new isomorphic_ws_1.default(synthUrl, {
				...options,
				agent: this._agent
			});
			ws.binaryType = "arraybuffer";
			return new Promise((resolve, reject) => {
				let connecting = true;
				const connectionTimeout = this._connectionTimeoutMs ? setTimeout(() => {
					connecting = false;
					reject(/* @__PURE__ */ new Error(`Edge TTS connection timed out after ${this._connectionTimeoutMs} milliseconds.`));
					this._closeSocket(ws);
				}, remaining) : void 0;
				if (!this._isBrowser) ws.once("unexpected-response", (request, response) => {
					if (!connecting || ws.readyState !== ws.CONNECTING || generation !== this._clientGeneration) {
						request.destroy();
						response.destroy();
						return;
					}
					const error = Object.assign(/* @__PURE__ */ new Error(`Unexpected server response: ${response.statusCode}`), {
						statusCode: response.statusCode,
						serverDate: response.headers.date
					});
					request.destroy(error);
					response.destroy();
				});
				ws.onopen = () => {
					if (!connecting) return;
					connecting = false;
					clearTimeout(connectionTimeout);
					this._log("Connected in", (Date.now() - this._startTime) / 1e3, "seconds");
					this._send(`Content-Type:application/json; charset=utf-8\r\nPath:${messageTypes.SPEECH_CONFIG}${MsEdgeTTS.JSON_XML_DELIM}
                    {
                        "context": {
                            "synthesis": {
                                "audio": {
                                    "metadataoptions": {
                                        "sentenceBoundaryEnabled": "${this._metadataOptions.sentenceBoundaryEnabled}",
                                        "wordBoundaryEnabled": "${this._metadataOptions.wordBoundaryEnabled}"
                                    },
                                    "outputFormat": "${this._outputFormat}" 
                                }
                            }
                        }
                    }
                `, void 0, ws).then(resolve, (error) => {
						this._closeSocket(ws);
						reject(error);
					});
				};
				ws.onmessage = (m) => {
					const buffer = index_1.Buffer.from(m.data);
					const message = buffer.toString();
					const requestId = /X-RequestId:(.*?)\r\n/.exec(message)?.[1];
					const stream = requestId && this._streams[requestId];
					if (!stream || stream.audio.destroyed || stream.turnEnded || stream.socket !== ws) return;
					if (message.includes(`Path:${messageTypes.TURN_START}`)) {
						this._log("->", message);
						this._resetSynthesisTimeout(requestId);
					} else if (message.includes(`Path:${messageTypes.TURN_END}`)) {
						this._log("->", message);
						clearTimeout(stream.timeout);
						stream.timeout = void 0;
						stream.turnEnded = true;
						stream.audio.push(null);
						this._closeRetiredSockets();
					} else if (message.includes(`Path:${messageTypes.RESPONSE}`)) {
						this._log("->", message);
						this._resetSynthesisTimeout(requestId);
					} else if (message.includes(`Path:${messageTypes.AUDIO_METADATA}`)) {
						const dataStartIndex = buffer.indexOf(MsEdgeTTS.JSON_XML_DELIM) + MsEdgeTTS.JSON_XML_DELIM.length;
						const data = buffer.subarray(dataStartIndex);
						this._log("->", message);
						this._resetSynthesisTimeout(requestId);
						this._pushMetadata(data, requestId);
					} else if (message.includes(`Path:${messageTypes.AUDIO}`) && m.data instanceof ArrayBuffer) {
						const dataStartIndex = buffer.indexOf(MsEdgeTTS.AUDIO_DELIM) + MsEdgeTTS.AUDIO_DELIM.length;
						const headers = buffer.subarray(0, dataStartIndex).toString();
						const data = buffer.subarray(dataStartIndex);
						this._log("->", headers);
						this._resetSynthesisTimeout(requestId);
						this._pushAudioData(data, requestId);
					} else this._log("->", "UNKNOWN MESSAGE", message);
				};
				ws.onclose = () => {
					connecting = false;
					clearTimeout(connectionTimeout);
					reject(/* @__PURE__ */ new Error("Edge TTS connection closed before initialization completed."));
					this._log("disconnected after:", (Date.now() - this._startTime) / 1e3, "seconds");
					for (const requestId in this._streams) {
						const stream = this._streams[requestId];
						if (stream.socket !== ws) continue;
						clearTimeout(stream.timeout);
						if (stream.turnEnded) stream.audio.push(null);
						else stream.audio.destroy(/* @__PURE__ */ new Error("Stream closed before the synthesis completed (no turn.end received). The audio is likely truncated."));
					}
				};
				ws.onerror = (event) => {
					connecting = false;
					clearTimeout(connectionTimeout);
					const underlying = event?.error ?? event;
					const message = underlying?.message ?? String(underlying);
					const code = underlying?.code ?? event?.code;
					const wrapped = /* @__PURE__ */ new Error(`Edge TTS WebSocket error: ${message}${code ? ` (code=${code})` : ""}`);
					wrapped.cause = underlying;
					reject(wrapped);
					for (const stream of Object.values(this._streams)) if (stream.socket === ws && !stream.turnEnded) stream.audio.destroy(wrapped);
					this._closeSocket(ws);
				};
			}).catch((error) => {
				const underlying = error.cause;
				const serverTime = typeof underlying?.serverDate === "string" ? Date.parse(underlying.serverDate) : NaN;
				if (retryClock && underlying?.statusCode === 403 && Number.isFinite(serverTime) && generation === this._clientGeneration && (!deadline || Date.now() < deadline)) {
					MsEdgeTTS._clockOffsetMs = serverTime - Date.now();
					return this._createClient(false, deadline, generation);
				}
				throw error;
			});
		}
		_closeSocket(socket) {
			if (socket.readyState === socket.CLOSED) return;
			const terminate = socket.terminate;
			if (socket.readyState !== socket.OPEN && terminate) terminate.call(socket);
			else socket.close();
		}
		_closeRetiredSockets() {
			this._retiredSockets = this._retiredSockets.filter((socket) => {
				if (Object.values(this._streams).some((stream) => stream.socket === socket && !stream.turnEnded)) return true;
				socket.close();
				return false;
			});
		}
		static generateUUID() {
			return "xxxxxxxx-xxxx-xxxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function(c) {
				const r = Math.random() * 16 | 0;
				return (c === "x" ? r : r & 3 | 8).toString(16);
			});
		}
		static async generateSecMsGec(trustedClientToken) {
			const ticks = Math.floor((Date.now() + MsEdgeTTS._clockOffsetMs) / 1e3) + 11644473600;
			const windowsTicks = (ticks - ticks % 300) * 1e7;
			return (0, SecMsGec_1.hashSecMsGecV2)(`${windowsTicks}${trustedClientToken}`);
		}
		async _send(message, requestId, initialSocket) {
			let socket = initialSocket ?? this._ws;
			for (let i = 1; !initialSocket && i <= 3 && socket.readyState !== socket.OPEN; i++) {
				if (requestId && !this._streams[requestId]) return;
				if (i == 1) this._startTime = Date.now();
				this._log("connecting: ", i);
				await this._initClient();
				socket = this._ws;
			}
			if (requestId) {
				const stream = this._streams[requestId];
				if (!stream || stream.audio.destroyed || stream.turnEnded) return;
				stream.socket = socket;
			}
			if (socket.readyState !== socket.OPEN) throw new Error("Edge TTS WebSocket is not open.");
			if (requestId) this._resetSynthesisTimeout(requestId);
			if (this._isBrowser) {
				socket.send(message);
				this._log("<-", message);
				return;
			}
			await new Promise((resolve, reject) => {
				socket.send(message, (error) => {
					if (error) return reject(error);
					this._log("<-", message);
					resolve();
				});
			});
		}
		_resetSynthesisTimeout(requestId) {
			const stream = this._streams[requestId];
			if (!stream || stream.audio.destroyed || stream.turnEnded) return;
			clearTimeout(stream.timeout);
			if (this._synthesisTimeoutMs) stream.timeout = setTimeout(() => {
				stream.audio.destroy(/* @__PURE__ */ new Error(`Edge TTS synthesis timed out after ${this._synthesisTimeoutMs} milliseconds without activity.`));
			}, this._synthesisTimeoutMs);
		}
		_pushAudioData(data, requestId) {
			this._streams[requestId]?.audio.push(data);
		}
		_pushMetadata(data, requestId) {
			this._streams[requestId]?.metadata?.push(data);
		}
		_SSMLTemplate(input, options = {}) {
			options = {
				...new Prosody_1.ProsodyOptions(),
				...options
			};
			return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xmlns:mstts="https://www.w3.org/2001/mstts" xml:lang="${this._metadataOptions.voiceLocale}">
                <voice name="${this._voice}">
                    <prosody pitch="${options.pitch}" rate="${options.rate}" volume="${options.volume}">
                        ${input}
                    </prosody> 
                </voice>
            </speak>`;
		}
		/**
		* Fetch the list of voices available in Microsoft Edge.
		* These, however, are not all. The complete list of voices supported by this module [can be found here](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/language-support) (neural, standard, and preview).
		*/
		getVoices() {
			return new Promise((resolve, reject) => {
				axios_1.default.get(MsEdgeTTS.VOICES_URL).then((res) => resolve(res.data)).catch(reject);
			});
		}
		/**
		* Sets the required information for the speech to be synthesised and inits a new WebSocket connection.
		* Must be called at least once before text can be synthesised.
		* Saved in this instance. Can be called at any time times to update the metadata.
		* Merges specified values into previously provided values.
		*
		* @param voiceName a string with any `ShortName`. A list of all available neural voices can be found [here](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/language-support#neural-voices). However, it is not limited to neural voices: standard voices can also be used. A list of standard voices can be found [here](https://docs.microsoft.com/en-us/azure/cognitive-services/speech-service/language-support#standard-voices). Changing the voiceName will reset the voiceLocale.
		* @param outputFormat any {@link OUTPUT_FORMAT}
		* @param metadataOptions (optional) {@link MetadataOptions}
		*/
		async setMetadata(voiceName, outputFormat, metadataOptions) {
			const oldVoice = this._voice;
			const oldOutputFormat = this._outputFormat;
			const oldOptions = JSON.stringify(this._metadataOptions);
			this._voice = voiceName;
			Object.assign(this._metadataOptions, metadataOptions);
			if (!metadataOptions?.voiceLocale && (!this._metadataOptions.voiceLocale || oldVoice !== this._voice)) {
				const voiceLangMatch = MsEdgeTTS.VOICE_LANG_REGEX.exec(this._voice);
				if (!voiceLangMatch) throw new Error("Could not infer voiceLocale from voiceName, and no voiceLocale was specified!");
				this._metadataOptions.voiceLocale = voiceLangMatch[0];
			}
			this._outputFormat = outputFormat;
			if (!(oldVoice !== this._voice || oldOutputFormat !== this._outputFormat || oldOptions !== JSON.stringify(this._metadataOptions)) && !this._clientInit && this._ws?.readyState === isomorphic_ws_1.default.OPEN && !this._retiredSockets.includes(this._ws)) return;
			this._startTime = Date.now();
			await this._initClient();
		}
		_metadataCheck() {
			if (!this._ws) throw new Error("Speech synthesis not configured yet. Run setMetadata before calling toStream or toFile.");
		}
		/**
		* Close the WebSocket connection.
		*/
		close() {
			this._clientGeneration++;
			const sockets = new Set(this._retiredSockets);
			if (this._ws) sockets.add(this._ws);
			this._retiredSockets = [];
			for (const stream of Object.values(this._streams)) {
				clearTimeout(stream.timeout);
				if (!stream.turnEnded) stream.audio.destroy(/* @__PURE__ */ new Error("Stream closed before the synthesis completed (no turn.end received). The audio is likely truncated."));
			}
			sockets.forEach((socket) => this._closeSocket(socket));
		}
		/**
		* Writes raw audio synthesised from text to a file. Uses a basic {@link _SSMLTemplate SML template}.
		*
		* @param dirPath a valid output directory path
		* @param input the input to synthesise
		* @param options (optional) {@link ProsodyOptions}
		@returns {Promise<{audioFilePath: string, metadataFilePath: string | null}>} - a `Promise` with the full filepaths
		*/
		toFile(dirPath, input, options) {
			return this._rawSSMLRequestToFile(dirPath, this._SSMLTemplate(input, options));
		}
		/**
		* Writes raw audio synthesised from text in real-time to a {@link Readable}. Uses a basic {@link _SSMLTemplate SML template}.
		*
		* @param input the text to synthesise. Can include SSML elements.
		* @param options (optional) {@link ProsodyOptions}
		@returns {Promise<{audioStream: Readable, metadataStream: Readable | null}>} - a `Promise` with the streams
		*/
		toStream(input, options) {
			return this._rawSSMLRequest(this._SSMLTemplate(input, options));
		}
		/**
		* Writes raw audio synthesised from text to a file. Has no SSML template. Basic SSML should be provided in the request.
		*
		* @param dirPath a valid output directory path.
		* @param requestSSML the SSML to send. SSML elements required in order to work.
		* @returns {Promise<{audioFilePath: string, metadataFilePath: string | null}>} - a `Promise` with the full filepaths
		*/
		rawToFile(dirPath, requestSSML) {
			return this._rawSSMLRequestToFile(dirPath, requestSSML);
		}
		/**
		* Writes raw audio synthesised from a request in real-time to a {@link Readable}. Has no SSML template. Basic SSML should be provided in the request.
		*
		* @param requestSSML the SSML to send. SSML elements required in order to work.
		@returns {Promise<{audioStream: Readable, metadataStream: Readable | null}>} - a `Promise` with the streams
		*/
		rawToStream(requestSSML) {
			return this._rawSSMLRequest(requestSSML);
		}
		_hasMetadataBoundaries() {
			return this._metadataOptions.sentenceBoundaryEnabled || this._metadataOptions.wordBoundaryEnabled;
		}
		async _rawSSMLRequestToFile(dirPath, requestSSML) {
			const { audioStream, metadataStream, requestId } = this._rawSSMLRequest(requestSSML);
			const audioFilePath = (0, utils_1.joinPath)(dirPath, "audio." + Output_1.OUTPUT_EXTENSIONS[this._outputFormat]);
			const metadataFilePath = !!metadataStream ? (0, utils_1.joinPath)(dirPath, "metadata.json") : null;
			try {
				await Promise.all([new Promise((resolve, reject) => {
					const writableAudioFile = audioStream.pipe(fs.createWriteStream(audioFilePath));
					audioStream.once("error", (e) => {
						writableAudioFile.destroy();
						reject(e);
					});
					writableAudioFile.once("close", async () => {
						if (writableAudioFile.bytesWritten > 0) resolve(audioFilePath);
						else {
							reject(/* @__PURE__ */ new Error("No audio data received"));
							fs.rmSync(audioFilePath, { force: true });
						}
					});
					writableAudioFile.once("error", reject);
				}), new Promise((resolve, reject) => {
					if (!metadataFilePath) return resolve(null);
					const metadataItems = { Metadata: [] };
					metadataStream.on("data", (chunk) => {
						const chunkObj = JSON.parse(chunk.toString());
						metadataItems.Metadata.push(...chunkObj["Metadata"]);
					});
					metadataStream.once("close", () => {
						if (metadataItems.Metadata.length > 0) {
							fs.writeFileSync(metadataFilePath, JSON.stringify(metadataItems, null, 2));
							resolve(metadataFilePath);
						} else {
							reject(/* @__PURE__ */ new Error("No metadata received"));
							fs.rmSync(metadataFilePath, { force: true });
						}
					});
					metadataStream.once("error", reject);
				})]);
				return {
					audioFilePath,
					metadataFilePath,
					requestId
				};
			} catch (e) {
				audioStream.destroy();
				metadataStream?.destroy();
				throw e;
			}
		}
		static randomHex(bytes) {
			const arr = new Uint8Array(bytes);
			crypto.getRandomValues(arr);
			return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
		}
		_rawSSMLRequest(requestSSML) {
			this._metadataCheck();
			const requestId = MsEdgeTTS.randomHex(16);
			const request = `X-RequestId:${requestId}\r\nContent-Type:application/ssml+xml\r\nPath:${messageTypes.SSML}${MsEdgeTTS.JSON_XML_DELIM}` + requestSSML.trim();
			const self = this;
			const audioStream = new stream_1.Readable({
				read() {},
				destroy(error, callback) {
					clearTimeout(self._streams[requestId]?.timeout);
					delete self._streams[requestId];
					self._closeRetiredSockets();
					callback(error);
				}
			});
			const metadataStream = this._hasMetadataBoundaries() ? new stream_1.Readable({ read() {} }) : null;
			audioStream.on("error", (e) => {
				audioStream.destroy();
				metadataStream?.destroy();
			});
			audioStream.once("close", () => {
				audioStream.destroy();
				metadataStream?.destroy();
			});
			this._streams[requestId] = {
				audio: audioStream,
				metadata: metadataStream,
				turnEnded: false
			};
			this._send(request, requestId).catch((error) => {
				this._streams[requestId]?.audio.destroy(error);
			});
			return {
				audioStream,
				metadataStream,
				requestId
			};
		}
	};
}));
//#endregion
//#region node_modules/msedge-tts/dist/index.js
var require_dist = /* @__PURE__ */ __commonJSMin(((exports) => {
	var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		var desc = Object.getOwnPropertyDescriptor(m, k);
		if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) desc = {
			enumerable: true,
			get: function() {
				return m[k];
			}
		};
		Object.defineProperty(o, k2, desc);
	}) : (function(o, m, k, k2) {
		if (k2 === void 0) k2 = k;
		o[k2] = m[k];
	}));
	var __exportStar = exports && exports.__exportStar || function(m, exports$1) {
		for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports$1, p)) __createBinding(exports$1, m, p);
	};
	Object.defineProperty(exports, "__esModule", { value: true });
	__exportStar(require_MsEdgeTTS(), exports);
	__exportStar(require_Output(), exports);
	__exportStar(require_Prosody(), exports);
}));
//#endregion
export { require_dist as t };
