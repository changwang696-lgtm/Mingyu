const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "public");
const port = Number(process.env.PORT) || 4173;
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".png": "image/png" };
const signs = [["鼠", "Rat"], ["牛", "Ox"], ["虎", "Tiger"], ["兔", "Rabbit"], ["龙", "Dragon"], ["蛇", "Snake"], ["马", "Horse"], ["羊", "Goat"], ["猴", "Monkey"], ["鸡", "Rooster"], ["狗", "Dog"], ["猪", "Pig"]];
const zodiacProfiles = [
  { personality: ["机智灵敏", "适应力强", "善于交际"], personalityEn: ["Quick-witted", "Adaptable", "Sociable"], symbolism: "鼠对应子支，是十二地支循环的起点。传统意象常联系敏锐、生命力与善于把握细微机会，也寓有新周期萌发、生机延续之意。", symbolismEn: "The Rat corresponds to Zi, the opening branch of the twelve-part cycle. It traditionally evokes alertness, vitality and an ability to notice small opportunities, while suggesting the beginning and renewal of a new cycle." },
  { personality: ["踏实稳重", "勤奋努力", "责任心强"], personalityEn: ["Steady", "Diligent", "Responsible"], symbolism: "牛与农耕、土地和收获紧密相连，象征勤劳、坚韧与值得信赖的力量。它所代表的成就并非急进，而是来自长期耕耘与稳健积累。", symbolismEn: "The Ox is closely linked with farming, land and harvest. It symbolizes diligence, endurance and dependable strength, with achievement arising through patient work and steady accumulation." },
  { personality: ["勇敢果断", "自信独立", "富有领导力"], personalityEn: ["Courageous", "Decisive", "Independent"], symbolism: "虎在中国文化中具有威严、勇武与守护的意象，常见于镇护辟邪的民俗表达。它也象征面对挑战时的胆识、行动力与正直气概。", symbolismEn: "In Chinese culture the Tiger conveys authority, courage and protection, often appearing in guardian traditions. It also symbolizes boldness, action and integrity when facing challenges." },
  { personality: ["温和善良", "心思细腻", "谨慎敏感"], personalityEn: ["Gentle", "Thoughtful", "Perceptive"], symbolism: "兔常与温雅、安宁和灵敏相连，也因月宫玉兔的故事具有长寿与祥瑞联想。其文化意象强调柔和并非软弱，而是一种细致而从容的力量。", symbolismEn: "The Rabbit is associated with gentleness, peace and sensitivity. Through the Moon Rabbit legend it also carries ideas of longevity and auspiciousness, presenting softness as attentive and composed strength." },
  { personality: ["自信强大", "志向远大", "富有创造力"], personalityEn: ["Confident", "Ambitious", "Creative"], symbolism: "龙汇聚多种瑞兽特征，是中华文化中尊贵、祥瑞与生生不息的重要象征。它联系风云水势、开拓精神和向上力量，寓意格局、担当与创造。", symbolismEn: "The Dragon combines features of several auspicious creatures and is a major Chinese symbol of dignity, good fortune and enduring vitality. It evokes transformative energy, vision, responsibility and creation." },
  { personality: ["聪明睿智", "冷静沉着", "洞察力强"], personalityEn: ["Wise", "Composed", "Insightful"], symbolism: "蛇的蜕皮使其具有更新、转化与生命延续的文化联想。它也常象征深思、智慧和含蓄的判断力，强调在安静观察之后把握时机。", symbolismEn: "Because it sheds its skin, the Snake carries associations of renewal, transformation and continuity. It also symbolizes reflection, wisdom and restrained judgment that acts after careful observation." },
  { personality: ["自由奔放", "热情开朗", "行动力强"], personalityEn: ["Free-spirited", "Warm", "Energetic"], symbolism: "马与奔赴、道路和功业相连，常见‘马到成功’‘龙马精神’等吉祥表达。它象征开阔、进取、生命活力，以及把理想转化为行动的能力。", symbolismEn: "The Horse is linked with journeys, open roads and achievement, reflected in auspicious phrases about swift success and vigorous spirit. It symbolizes freedom, progress, vitality and turning ideals into action." },
  { personality: ["温和善良", "富有同情心", "追求和谐"], personalityEn: ["Kind", "Compassionate", "Harmonious"], symbolism: "羊因‘羊’与‘祥’的古文字文化联系，常承载温良、吉庆与和美的寓意。它也与群体照应、礼让和丰足相连，体现柔和而稳定的亲和力。", symbolismEn: "Through an old cultural connection between the characters for goat and auspiciousness, the Goat conveys kindness, harmony and good fortune. It also suggests mutual care, courtesy and abundance." },
  { personality: ["聪明机智", "灵活多变", "好奇心强"], personalityEn: ["Clever", "Flexible", "Curious"], symbolism: "猴在传统故事中常以聪慧、机变和探索精神出现。‘猴’与‘侯’的谐音也带来进阶与功名的吉祥联想，象征以才智应对变化。", symbolismEn: "In traditional stories the Monkey often represents intelligence, agility and exploration. A wordplay linking monkey with noble rank also gives it auspicious associations with advancement and using ingenuity to navigate change." },
  { personality: ["勤奋守时", "注重细节", "自信果断"], personalityEn: ["Punctual", "Attentive", "Decisive"], symbolism: "鸡鸣报晓标记昼夜交替，因此鸡象征守时、光明与新的开始。其忠实履行时序的形象，也寓有勤勉、守信和在恰当时刻发声的品格。", symbolismEn: "The Rooster's dawn call marks the transition from night to day, so it symbolizes punctuality, light and new beginnings. Its faithful rhythm also suggests diligence, reliability and speaking at the right moment." },
  { personality: ["忠诚可靠", "正直勇敢", "重情重义"], personalityEn: ["Loyal", "Upright", "Courageous"], symbolism: "狗长期承担守护家园与陪伴的角色，在中国民俗中象征忠诚、警觉与安定。其寓意强调信义、保护所珍视之人与面对不公的勇气。", symbolismEn: "The Dog has long served as guardian and companion, symbolizing loyalty, vigilance and security. Its meaning emphasizes trust, protecting what matters and courage in the face of injustice." },
  { personality: ["乐观随和", "知足常乐", "真诚宽厚"], personalityEn: ["Optimistic", "Content", "Sincere"], symbolism: "猪与家业、丰收和充足生活相连，传统意象多含福气、安康与富足。它也代表真诚、宽厚，以及懂得珍惜日常生活的朴实智慧。", symbolismEn: "The Pig is associated with household prosperity, harvest and a well-provided life, carrying meanings of blessing, wellbeing and abundance. It also represents sincerity, generosity and appreciation of everyday contentment." }
];
const stems = [
  { char: "甲", element: "木", polarity: "阳" }, { char: "乙", element: "木", polarity: "阴" },
  { char: "丙", element: "火", polarity: "阳" }, { char: "丁", element: "火", polarity: "阴" },
  { char: "戊", element: "土", polarity: "阳" }, { char: "己", element: "土", polarity: "阴" },
  { char: "庚", element: "金", polarity: "阳" }, { char: "辛", element: "金", polarity: "阴" },
  { char: "壬", element: "水", polarity: "阳" }, { char: "癸", element: "水", polarity: "阴" }
];
const branches = [
  { char: "子", element: "水", range: "23:00-01:00" }, { char: "丑", element: "土", range: "01:00-03:00" },
  { char: "寅", element: "木", range: "03:00-05:00" }, { char: "卯", element: "木", range: "05:00-07:00" },
  { char: "辰", element: "土", range: "07:00-09:00" }, { char: "巳", element: "火", range: "09:00-11:00" },
  { char: "午", element: "火", range: "11:00-13:00" }, { char: "未", element: "土", range: "13:00-15:00" },
  { char: "申", element: "金", range: "15:00-17:00" }, { char: "酉", element: "金", range: "17:00-19:00" },
  { char: "戌", element: "土", range: "19:00-21:00" }, { char: "亥", element: "水", range: "21:00-23:00" }
];

function traditionalCulture(body) {
  const birth = new Date(body.birth);
  const calendarYear = birth.getFullYear();
  const month = birth.getMonth() + 1;
  const day = birth.getDate();
  const traditionalYear = month < 2 || (month === 2 && day < 4) ? calendarYear - 1 : calendarYear;
  const cycleIndex = ((traditionalYear - 1984) % 60 + 60) % 60;
  const stem = stems[cycleIndex % 10];
  const branchIndex = cycleIndex % 12;
  const branch = branches[branchIndex];
  const [zodiac, zodiacEn] = signs[branchIndex];
  const zodiacProfile = zodiacProfiles[branchIndex];
  const hour = birth.getHours();
  const hourBranch = branches[Math.floor(((hour + 1) % 24) / 2)];
  return {
    basisYear: traditionalYear,
    pillar: `${stem.char}${branch.char}`,
    cycleNumber: cycleIndex + 1,
    stem,
    branch: { ...branch, zodiac, zodiacEn },
    hourBranch,
    zodiacProfile,
    note: "年柱以公历约 2 月 4 日立春为界作文化计算；精确交节时刻、月柱、日柱与时干需结合出生地时区和专业万年历复核。当前结果不构成完整八字排盘，也不据此判断五行喜忌。",
    noteEn: "The year pillar uses approximately February 4 (Start of Spring) as its boundary. Exact solar-term timing and the month, day and hour stems require timezone-aware calendrical calculation. This is not a complete BaZi chart and does not claim an elemental deficiency."
  };
}

function demoResult(body) {
  const culture = traditionalCulture(body);
  const year = culture.basisYear;
  const animal = culture.branch.zodiac;
  const animalEn = culture.branch.zodiacEn;
  return {
    zodiac: { animal, animalEn, years: String(year), traits: culture.zodiacProfile.personality, traitsEn: culture.zodiacProfile.personalityEn },
    summary: "你的出生时刻呈现出明朗而丰沛的文化意象。名字宜在行动力与沉静感之间取得平衡：既保留原名的个人气质，也以温润的字义承接内在秩序。以下名字不是简单音译，而是结合声音、汉字与文化联想所作的跨文化表达。",
    summaryEn: "Your birth moment carries a bright, abundant cultural image. A fitting name balances momentum with composure, preserving the character of your original name while adding calm inner order through meaning, sound and form.",
    names: [
      { hanzi: "林曜安", pinyin: "Lin Yao'an", seal: "曜安", meaning: "曜，是照耀与清朗；安，是从容与安定。名字寓意在广阔世界中保持明亮，也拥有安顿自我的力量。", meaningEn: "Yao evokes radiant clarity; An means peace and inner steadiness. Together they suggest a bright presence grounded by quiet confidence.", tone: "平 · 仄 · 平" },
      { hanzi: "沈知远", pinyin: "Shen Zhiyuan", seal: "知远", meaning: "知，代表洞察与求索；远，象征开阔的眼界。名字含有‘知行致远’的文化联想，温雅而坚定。", meaningEn: "Zhi means insight and learning; Yuan suggests a far-reaching vision. The name feels cultivated, composed and quietly ambitious.", tone: "仄 · 平 · 仄" },
      { hanzi: "苏景和", pinyin: "Su Jinghe", seal: "景和", meaning: "景，是光景与敬慕；和，是和谐与包容。整体意象如春日和光，亲切、明朗且具有国际感。", meaningEn: "Jing evokes light and admiration; He means harmony and openness. Its image is warm daylight: approachable, lucid and cosmopolitan.", tone: "平 · 仄 · 平" }
    ],
    culturalNote: `生肖是传统民俗中观察时间与生命节律的一种象征语言，并非对性格与命运的科学判定。${animal}的意象在这里作为理解时间与文化联想的入口。`,
    culturalNoteEn: `The zodiac is a symbolic language used in Chinese tradition to reflect on time and life rhythms, not a scientific claim about personality or destiny. Here, the ${animalEn} is a starting point for cultural interpretation.`,
    inputName: body.name,
    traditionalCulture: culture,
    demo: true
  };
}

function send(res, status, data, type = "application/json; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type, "X-Content-Type-Options": "nosniff" });
  res.end(type.startsWith("application/json") ? JSON.stringify(data) : data);
}

function generate(req, res) {
  let raw = "";
  req.on("data", chunk => {
    raw += chunk;
    if (raw.length > 100000) req.destroy();
  });
  req.on("end", async () => {
    let body;
    try { body = JSON.parse(raw); } catch { return send(res, 400, { error: "Invalid request" }); }
    if (!body.name?.trim() || !body.birth) return send(res, 422, { error: "Name and birth date are required" });
    if (Number.isNaN(new Date(body.birth).getTime())) return send(res, 422, { error: "Birth date is invalid" });
    if (!process.env.OPENAI_API_KEY) return send(res, 200, demoResult(body));

    const culture = traditionalCulture(body);
    const prompt = `You are a careful bilingual Chinese naming consultant. Return JSON only with keys zodiac (animal, animalEn, years, traits, traitsEn), summary, summaryEn, names (3 objects: hanzi, pinyin, seal, meaning, meaningEn, tone), culturalNote, culturalNoteEn, inputName. Use the deterministic year pillar, zodiac and birth-hour element below as cultural imagery when explaining name choices. Never claim this is a complete BaZi chart, never infer missing or favorable elements, and never present symbolism as certainty or science. User: ${JSON.stringify(body)}. Deterministic culture context: ${JSON.stringify(culture)}`;
    try {
      const api = await fetch("https://api.openai.com/v1/responses", { method: "POST", headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" }, body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-5.2", input: prompt, text: { format: { type: "json_object" } } }) });
      const json = await api.json();
      if (!api.ok) throw new Error(json.error?.message || "OpenAI request failed");
      const output = json.output_text || json.output?.flatMap(item => item.content || []).find(item => item.type === "output_text")?.text;
      const result = JSON.parse(output);
      result.traditionalCulture = culture;
      result.zodiac = { ...result.zodiac, animal: culture.branch.zodiac, animalEn: culture.branch.zodiacEn, years: String(culture.basisYear), traits: culture.zodiacProfile.personality, traitsEn: culture.zodiacProfile.personalityEn };
      send(res, 200, result);
    } catch (error) { send(res, 502, { error: error.message }); }
  });
}

http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/api/generate") return generate(req, res);
  const safeUrl = req.url === "/" ? "/index.html" : req.url.split("?")[0];
  const file = path.normalize(path.join(root, safeUrl));
  if (!file.startsWith(root)) return send(res, 403, "Forbidden", "text/plain; charset=utf-8");
  fs.readFile(file, (error, data) => error ? send(res, 404, "Not found", "text/plain; charset=utf-8") : send(res, 200, data, types[path.extname(file)] || "application/octet-stream"));
}).listen(port, () => console.log(`Mingyu is running at http://localhost:${port}`));
