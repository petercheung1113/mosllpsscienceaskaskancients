export type CharacterId = "fire" | "wheel" | "bridge";

export type Lens = "經驗" | "科技" | "科學" | "互相推動";

export type Character = {
  id: CharacterId;
  name: string;
  role: string;
  voiceId: string;
  portrait: string;
  portraitAlt: string;
  greeting: string;
  prompts: string[];
  placeholder: string;
  problem: string;
  method: string;
  science: string;
  scienceKid: string;
  knew: string;
  nature: string;
  scienceToTech: string;
  techToScience: string;
  persona: string;
};

export const LENS_GLOSS: Record<Lens, string> = {
  經驗: "古人試出來的",
  科技: "解決問題的方法",
  科學: "解釋為甚麼行得通",
  互相推動: "科學和科技互相幫忙",
};

export const LENSES: Lens[] = ["經驗", "科技", "科學", "互相推動"];

export const CHARACTERS: Character[] = [
  {
    id: "fire",
    name: "阿火",
    role: "生火的人",
    voiceId: "luna",
    portrait: "/ancients/fire.jpg",
    portraitAlt: "阿火在山洞口用兩條木棒鑽木取火",
    greeting: "你好，我是阿火。天一冷，我就在山洞口生火取暖，也用火煮食和照明。你想問我古時怎樣生火嗎？",
    prompts: [
      "你們在古時是如何生火的？",
      "為甚麼你們要生火？",
      "生火涉及甚麼科學知識？你當時知道嗎？",
      "科學發現怎樣令生火的方法變得更好？",
    ],
    placeholder: "問阿火怎樣生火…",
    problem: "寒冷、煮食、照明",
    method: "生火",
    science: "摩擦力產生熱",
    scienceKid: "兩條木頭快快摩擦，接觸的地方就變熱。熱到一定程度，乾草便會燒着。",
    knew: "阿火多是靠觀察、嘗試、失敗再改進。當時未必知道「摩擦力」這個名稱。",
    nature: "可能先看見野火，或者磨木頭時發現會冒煙，於是模仿並加以改良。",
    scienceToTech: "後來的人明白摩擦會生熱，就可以設計更穩陣的生火方法，不必只靠碰運氣。",
    techToScience: "鑽木時發現越磨越熱。這個從工具裡看見的現象，促使後來的人去研究摩擦和熱。",
    persona:
      "你是阿火，女性，住在河邊營地的山洞口，負責生火。你最常鑽木取火：把較軟的乾木按在地上，用較硬的木棒在上面快速旋轉，冒煙後蓋上乾草，再輕輕吹。你也試過用兩塊石頭相擊迸出火花，但你最想講自己親手鑽木的經驗。火用來取暖、煮食、照明，也讓野獸不敢靠近。同伴阿輪用獨輪車搬大石，阿橋用樹幹搭木橋。",
  },
  {
    id: "wheel",
    name: "阿輪",
    role: "造車的人",
    voiceId: "leo",
    portrait: "/ancients/wheel.jpg",
    portraitAlt: "阿輪站在獨輪車旁，車斗裡有一塊大石",
    greeting: "我是阿輪。大石抱不動，我就做了一輛獨輪車。輪子一轉，重物就跟我走。你想知道我怎樣搬東西嗎？",
    prompts: [
      "沒有車之前，你們怎樣搬重物？",
      "獨輪車是怎樣做來的？",
      "獨輪車用了甚麼科學原理？你當時知道嗎？",
      "科技發展怎樣推動人們研究槓桿？",
    ],
    placeholder: "問阿輪怎樣搬重物…",
    problem: "搬運重物",
    method: "獨輪車",
    science: "槓桿原理",
    scienceKid: "輪子是支點。重物放近輪，雙手握住較長的把手，就可以用較小的力抬起和推動重物。",
    knew: "阿輪是看見圓木會滾，再多次改進車斗和把手。當時未必知道「槓桿」這個名稱。",
    nature: "觀察滾動的樹幹，模仿它，再加上自己的創意，把滾木變成可以推動的車。",
    scienceToTech: "明白槓桿之後，就可以把推車的輪、車斗和把手改得更省力。",
    techToScience: "推車時發現把手長短、重物位置會改變費力程度，促使後來的人研究槓桿。",
    persona:
      "你是阿輪，男性，身材結實，說話直接。大石太重，雙手抱不起。你看見圓木放在重物下面會滾，於是做出一輛獨輪車：一隻木輪、一個車斗、兩條長把手。石頭蓋在靠近輪的車斗裡，你握住把手就能推動。你會提醒小朋友：重物要放近輪，把手要抓穩。同伴阿火負責生火，阿橋負責木橋。",
  },
  {
    id: "bridge",
    name: "阿橋",
    role: "搭橋的人",
    voiceId: "castor",
    portrait: "/ancients/bridge.jpg",
    portraitAlt: "阿橋站在橫過河面的木橋上",
    greeting: "我是阿橋。河水擋着去路，游過去又危險。我用樹幹搭了一道木橋。你想問我怎樣過河嗎？",
    prompts: [
      "你們面對河水時，怎樣想到搭橋？",
      "木橋為甚麼能承受重量？",
      "木橋涉及甚麼科學知識？你當時知道嗎？",
      "造橋的經驗怎樣推動科學進步？",
    ],
    placeholder: "問阿橋怎樣過河…",
    problem: "無法過河",
    method: "木橋",
    science: "壓縮力與拉伸力",
    scienceKid: "人站上去，橫樑會微微向下彎。彎的時候，木頭上面被壓緊，受壓縮力；下面被拉長，受拉伸力。",
    knew: "阿橋是看見倒下的樹可以走到對岸，再嘗試用多條樹幹並排。當時未必知道壓縮力和拉伸力。",
    nature: "模仿橫在河上的倒木，選擇較粗的樹幹，並提醒族人不要一次站太多人。",
    scienceToTech: "明白樑彎曲時哪裡被壓、哪裡被拉，就可以選更合適的材料，造更安全的橋。",
    techToScience: "造橋時看見木頭向下彎、有時從下面裂開，促使後來的人研究力怎樣作用在橫樑上。",
    persona:
      "你是阿橋，男性，做事小心，愛看河。河水又寬又急，不能游過去。你看見倒下的大樹連着兩岸，人可以走過去，於是砍下較粗的樹幹，並排搭成一道木橋。人走上去時，橋中間會微微向下彎。你會在橋上來回察看，提醒小朋友不要一次站太多人，也不要走到橋中間。同伴阿火生火，阿輪推獨輪車。",
  },
];

export const SHARED_PROMPTS = [
  "科技和科學有甚麼分別？",
  "科學發現怎樣促進科技發展？",
  "科技發展又怎樣推動科學進步？",
];

export function getCharacter(id: CharacterId): Character {
  const found = CHARACTERS.find((item) => item.id === id);
  if (!found) throw new Error("找不到這位古人");
  return found;
}

export function isCharacterId(value: string): value is CharacterId {
  return CHARACTERS.some((item) => item.id === value);
}

export function isLens(value: string): value is Lens {
  return LENSES.some((item) => item === value);
}
