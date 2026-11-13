//#region node_modules/.nitro/vite/services/ssr/assets/conduct-CRoEMSDo.js
var CHINESE = [
	"屌",
	"閪",
	"撚",
	"仆街",
	"撲街",
	"冚家鏟",
	"食屎",
	"吃屎",
	"狗屎",
	"狗雜種",
	"屎忽",
	"屎窟",
	"臭閪",
	"傻閪",
	"戇鳩",
	"死仔",
	"死八婆",
	"頂你個肺",
	"顶你个肺",
	"收皮",
	"你老母",
	"屌你",
	"操你",
	"操你媽",
	"操你妈",
	"肏",
	"傻逼",
	"傻屄",
	"他媽",
	"他妈",
	"賤人",
	"贱人",
	"婊子",
	"白痴",
	"白癡",
	"智障",
	"腦殘",
	"脑残",
	"廢物",
	"废物",
	"人渣",
	"低能",
	"弱智",
	"蠢材",
	"笨蛋",
	"傻瓜",
	"醜八怪",
	"丑八怪",
	"肥豬",
	"閉嘴",
	"闭嘴",
	"滚开",
	"滾開",
	"你是垃圾",
	"你好蠢",
	"你很蠢",
	"你個蠢",
	"打死你",
	"殺死你",
	"杀死你",
	"想死你",
	"強姦",
	"强奸",
	"猥褻",
	"猥亵",
	"色情",
	"做愛",
	"做爱",
	"性交",
	"性愛",
	"性爱",
	"性侵",
	"裸體",
	"裸体",
	"脫光",
	"脱光",
	"陰莖",
	"阴茎",
	"陰道",
	"阴道",
	"自慰",
	"手淫",
	"奶頭",
	"乳头",
	"約炮",
	"约炮",
	"露點",
	"露点",
	"援交",
	"去死"
];
var DISTRESS = [
	"自殺",
	"自杀",
	"不想活",
	"唔想活",
	"割腕",
	"跳樓",
	"跳楼",
	"想死"
];
function fold(text) {
	return text.toLowerCase().replace(/[Ａ-Ｚａ-ｚ０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 65248)).replace(/[\s\u200b._\-*~!！?？,，.。·・/\\|+@#$%^&=]+/g, "");
}
function leet(text) {
	return fold(text).replace(/1/g, "i").replace(/0/g, "o").replace(/3/g, "e").replace(/4/g, "a").replace(/5/g, "s");
}
function hasLatin(text, word) {
	return new RegExp(`(^|[^a-z])${word}([^a-z]|$)`).test(text);
}
function isMisconduct(text) {
	const plain = fold(text);
	if (CHINESE.some((word) => plain.includes(word.toLowerCase()))) return true;
	if ([
		"on9",
		"on99",
		"dllm",
		"dnlm",
		"diu",
		"pk"
	].some((word) => hasLatin(plain, word))) return true;
	const coded = leet(text);
	return [
		"fuck",
		"shit",
		"bitch",
		"asshole",
		"dick",
		"pussy",
		"cunt",
		"slut",
		"whore",
		"bastard",
		"porn",
		"hentai",
		"nude",
		"naked",
		"blowjob",
		"handjob",
		"wtf",
		"stfu",
		"motherfucker",
		"nigger",
		"nigga",
		"faggot",
		"retard"
	].some((word) => hasLatin(coded, word));
}
function isDistress(text) {
	if (isMisconduct(text)) return false;
	const folded = fold(text);
	return DISTRESS.some((word) => folded.includes(word));
}
function warningSpeech(count) {
	if (count >= 3) return {
		reply: "這是第 3 次警告。你用了不尊重的說話，現在不能再使用這個網頁。請找老師。",
		speak: "呢個係第三次警告。你講咗唔尊重人嘅說話，而家唔可以再用呢個網頁。請你搵老師。"
	};
	const left = count === 1 ? "仲有兩次警告，就要停用。" : "再有一次，就唔可以再用。";
	return {
		reply: `這句話不尊重人，我不會回答。這是第 ${count} 次警告。請停止粗口、人身攻擊和不宜的內容。${count === 1 ? "還有兩次警告，就會停止使用。" : "再有一次，就不能再使用這個網頁。"}`,
		speak: `呢句說話唔尊重人，我唔會答。呢個係第${count}次警告。唔好再講粗口、鬧人，或者講唔適合嘅內容。${left}`
	};
}
function lockedSpeech() {
	return {
		reply: "你已被警告三次，不能再使用這個網頁。請找老師。",
		speak: "你已經被警告三次，唔可以再用呢個網頁。請你搵老師。"
	};
}
function careSpeech() {
	return {
		reply: "我聽到你好像很難過。請立刻告訴老師或家長，也可以打給撒瑪利亞會 2389 2222。你很重要。",
		speak: "我聽到你似好難受。請你即刻告訴老師或者屋企人，亦可以打俾撒瑪利亞會二三八九二二二二。你好重要。"
	};
}
//#endregion
export { warningSpeech as a, lockedSpeech as i, isDistress as n, isMisconduct as r, careSpeech as t };
