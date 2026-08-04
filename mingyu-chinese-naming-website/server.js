const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "public");
const port = Number(process.env.PORT) || 4173;
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg"
};
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
const chinaTimeZone = "Asia/Shanghai";
const placeTimeZones = [
  { keywords: ["new york", "nyc", "boston", "philadelphia", "washington", "miami", "atlanta", "orlando", "montreal", "toronto"], timeZone: "America/New_York" },
  { keywords: ["chicago", "houston", "dallas", "austin", "minneapolis", "mexico city"], timeZone: "America/Chicago" },
  { keywords: ["denver", "phoenix", "salt lake city"], timeZone: "America/Denver" },
  { keywords: ["los angeles", "san francisco", "seattle", "vancouver", "las vegas", "san diego", "california"], timeZone: "America/Los_Angeles" },
  { keywords: ["london", "manchester", "dublin", "ireland", "united kingdom", "uk", "england", "portugal", "lisbon"], timeZone: "Europe/London" },
  { keywords: ["paris", "france", "berlin", "germany", "rome", "italy", "madrid", "spain", "amsterdam", "netherlands", "brussels", "belgium", "vienna", "austria", "copenhagen", "denmark", "oslo", "norway", "stockholm", "sweden", "warsaw", "poland", "prague", "czech", "switzerland", "zurich"], timeZone: "Europe/Paris" },
  { keywords: ["athens", "greece", "helsinki", "finland", "bucharest", "romania", "sofia", "bulgaria", "riga", "latvia", "vilnius", "lithuania", "tallinn", "estonia", "kyiv", "kiev", "ukraine"], timeZone: "Europe/Athens" },
  { keywords: ["istanbul", "turkey"], timeZone: "Europe/Istanbul" },
  { keywords: ["beijing", "shanghai", "guangzhou", "shenzhen", "china", "hong kong", "macau", "taipei", "taiwan", "singapore", "kuala lumpur"], timeZone: chinaTimeZone }
];

function pad(number) {
  return String(number).padStart(2, "0");
}

function inferTimeZoneFromPlace(place) {
  const source = String(place || "").trim().toLowerCase();
  if (!source) return { timeZone: chinaTimeZone, inferred: false };
  const match = placeTimeZones.find(entry => entry.keywords.some(keyword => source.includes(keyword)));
  return match ? { timeZone: match.timeZone, inferred: true } : { timeZone: chinaTimeZone, inferred: false };
}

function isValidTimeZone(timeZone) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format();
    return true;
  } catch {
    return false;
  }
}

function parseBirthInput(input) {
  const match = String(input || "").match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) return null;
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4]),
    minute: Number(match[5]),
    second: 0
  };
}

function getTimeZoneParts(date, timeZone) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
  const parts = Object.fromEntries(formatter.formatToParts(date).filter(part => part.type !== "literal").map(part => [part.type, part.value]));
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second)
  };
}

function getTimeZoneOffsetMinutes(date, timeZone) {
  const zoned = getTimeZoneParts(date, timeZone);
  const utcTime = Date.UTC(zoned.year, zoned.month - 1, zoned.day, zoned.hour, zoned.minute, zoned.second);
  return (utcTime - date.getTime()) / 60000;
}

function zonedDateTimeToUtc(parts, timeZone) {
  const utcGuess = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second || 0);
  const firstOffset = getTimeZoneOffsetMinutes(new Date(utcGuess), timeZone);
  let timestamp = utcGuess - firstOffset * 60000;
  const finalOffset = getTimeZoneOffsetMinutes(new Date(timestamp), timeZone);
  if (finalOffset !== firstOffset) timestamp = utcGuess - finalOffset * 60000;
  return new Date(timestamp);
}

function formatDateTimeLabel(parts) {
  return `${parts.year}.${pad(parts.month)}.${pad(parts.day)} ${pad(parts.hour)}:${pad(parts.minute)}`;
}

function resolveBirthContext(body) {
  const birthParts = parseBirthInput(body.birth);
  if (!birthParts) return null;
  const requestedTimeZone = String(body.birthTimeZone || "").trim();
  const source = requestedTimeZone && isValidTimeZone(requestedTimeZone)
    ? { timeZone: requestedTimeZone, inferred: false }
    : inferTimeZoneFromPlace(body.place);
  const utcDate = zonedDateTimeToUtc(birthParts, source.timeZone);
  const chinaParts = getTimeZoneParts(utcDate, chinaTimeZone);
  return {
    utcDate,
    sourceTimeZone: source.timeZone,
    sourceInferred: source.inferred,
    originalParts: birthParts,
    chinaParts,
    chinaLabel: formatDateTimeLabel(chinaParts),
    originalLabel: formatDateTimeLabel(birthParts)
  };
}

function traditionalCulture(body) {
  const birthContext = resolveBirthContext(body);
  const birth = birthContext?.chinaParts || parseBirthInput(body.birth);
  const calendarYear = birth.year;
  const month = birth.month;
  const day = birth.day;
  const traditionalYear = month < 2 || (month === 2 && day < 4) ? calendarYear - 1 : calendarYear;
  const cycleIndex = ((traditionalYear - 1984) % 60 + 60) % 60;
  const stem = stems[cycleIndex % 10];
  const branchIndex = cycleIndex % 12;
  const branch = branches[branchIndex];
  const [zodiac, zodiacEn] = signs[branchIndex];
  const zodiacProfile = zodiacProfiles[branchIndex];
  const hour = birth.hour;
  const hourBranch = branches[Math.floor(((hour + 1) % 24) / 2)];
  const timeNoteZh = birthContext
    ? `出生时间已根据出生地“${body.place || "未填写"}”推断时区，并换算为北京时间 ${birthContext.chinaLabel} 后计算年柱与时辰。`
    : "出生时间按北京时间理解后计算年柱与时辰。";
  const timeNoteEn = birthContext
    ? `The birth time is interpreted in the timezone inferred from "${body.place || "the provided birthplace"}" and converted to China Standard Time (${birthContext.chinaLabel}) before calculating the year pillar and birth hour.`
    : "The birth time is interpreted in China Standard Time before calculating the year pillar and birth hour.";
  return {
    basisYear: traditionalYear,
    pillar: `${stem.char}${branch.char}`,
    cycleNumber: cycleIndex + 1,
    stem,
    branch: { ...branch, zodiac, zodiacEn },
    hourBranch,
    zodiacProfile,
    originalBirthLabel: birthContext?.originalLabel || null,
    chinaBirthLabel: birthContext?.chinaLabel || formatDateTimeLabel(birth),
    sourceTimeZone: birthContext?.sourceTimeZone || chinaTimeZone,
    note: `${timeNoteZh} 年柱以公历约 2 月 4 日立春为界作文化计算；精确交节时刻、月柱、日柱与时干需结合出生地时区和专业万年历复核。当前结果不构成完整八字排盘，也不据此判断五行喜忌。`,
    noteEn: `${timeNoteEn} The year pillar uses approximately February 4 (Start of Spring) as its boundary. Exact solar-term timing and the month, day and hour stems require timezone-aware calendrical calculation. This is not a complete BaZi chart and does not claim an elemental deficiency.`
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

function normalizeTier(tier) {
  return tier === "simple" ? "simple" : "complete";
}

function compactBody(body) {
  return {
    name: String(body.name || "").trim(),
    gender: body.gender || "neutral",
    birth: body.birth,
    place: body.place?.trim() || "",
    wish: body.wish?.trim() || "",
    tier: normalizeTier(body.tier)
  };
}

function getAiConfig() {
  if (process.env.DEEPSEEK_API_KEY) {
    return {
      provider: "deepseek",
      apiKey: process.env.DEEPSEEK_API_KEY,
      model: process.env.DEEPSEEK_MODEL || "deepseek-v4-flash",
      url: "https://api.deepseek.com/chat/completions"
    };
  }

  if (process.env.OPENAI_API_KEY) {
    return {
      provider: "openai",
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || "gpt-5.2",
      url: "https://api.openai.com/v1/responses"
    };
  }

  return null;
}

function buildPrompt(body, culture) {
  const tier = normalizeTier(body.tier);
  const styleGuide = tier === "simple"
    ? "Keep the result concise. Summary and culturalNote should each stay under 45 words per language. Each name meaning should stay under 28 words per language."
    : "Keep the writing vivid but still concise. Summary should stay under 85 words per language. culturalNote should stay under 65 words per language. Each name meaning should stay under 45 words per language.";

  const userProfile = compactBody(body);
  const cultureLine = [
    `year pillar: ${culture.pillar}`,
    `cycle number: ${culture.cycleNumber}`,
    `zodiac zh/en: ${culture.branch.zodiac}/${culture.branch.zodiacEn}`,
    `stem: ${culture.stem.char} ${culture.stem.polarity}${culture.stem.element}`,
    `branch: ${culture.branch.char} ${culture.branch.element}`,
    `hour branch: ${culture.hourBranch.char} ${culture.hourBranch.element} ${culture.hourBranch.range}`
  ].join("; ");

  return [
    "Return valid JSON only.",
    "Required shape:",
    '{"zodiac":{"animal":"","animalEn":"","years":"","traits":[],"traitsEn":[]},"summary":"","summaryEn":"","names":[{"hanzi":"","pinyin":"","seal":"","meaning":"","meaningEn":"","tone":""},{"hanzi":"","pinyin":"","seal":"","meaning":"","meaningEn":"","tone":""},{"hanzi":"","pinyin":"","seal":"","meaning":"","meaningEn":"","tone":""}],"culturalNote":"","culturalNoteEn":"","inputName":""}',
    "Task:",
    "Create three culturally grounded Chinese name options for an international user.",
    "Do not claim destiny, science, full BaZi accuracy, missing elements, or favorable elements.",
    "Use bilingual output for all narrative fields.",
    styleGuide,
    `User profile: ${JSON.stringify(userProfile)}`,
    `Deterministic culture context: ${cultureLine}`
  ].join("\n");
}

async function fetchJson(url, options, errorMessage) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const json = await response.json();
    if (!response.ok) throw new Error(json.error?.message || errorMessage);
    return json;
  } catch (error) {
    if (error.name === "AbortError") throw new Error("AI generation timed out. Please try again.");
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function readDeepSeekContent(json) {
  const message = json.choices?.[0]?.message;
  const content = message?.content;
  if (typeof content === "string" && content.trim()) return content.trim();

  if (Array.isArray(content)) {
    const text = content
      .map(item => item?.text || item?.content || "")
      .join("")
      .trim();
    if (text) return text;
  }

  const fallback = json.output_text || message?.reasoning_content || "";
  return typeof fallback === "string" ? fallback.trim() : "";
}

async function requestDeepSeekJson(config, prompt, maxTokens, allowRetry = true) {
  const json = await fetchJson(config.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: maxTokens,
      temperature: 0.7,
      stream: false,
      thinking: { type: "disabled" },
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: "You are a careful bilingual Chinese naming consultant. Return valid JSON only with no markdown fences."
        },
        { role: "user", content: prompt }
      ]
    })
  }, "DeepSeek request failed");

  const output = readDeepSeekContent(json);
  if (output) return JSON.parse(output);

  if (!allowRetry) throw new Error("DeepSeek returned empty content");

  const retryPrompt = `${prompt}\nIf you cannot comply, still return the required JSON shape with concise placeholder-safe values.`;
  return requestDeepSeekJson(config, retryPrompt, Math.max(maxTokens, 1000), false);
}

async function requestAiResult(body, culture) {
  const config = getAiConfig();
  if (!config) return demoResult(body);
  const tier = normalizeTier(body.tier);
  const prompt = buildPrompt(body, culture);
  const maxTokens = tier === "simple" ? 700 : 1200;

  if (config.provider === "deepseek") {
    return requestDeepSeekJson(config, prompt, maxTokens);
  }

  const json = await fetchJson(config.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: config.model,
      input: prompt,
      max_output_tokens: maxTokens,
      text: { format: { type: "json_object" } }
    })
  }, "OpenAI request failed");
  const output = json.output_text || json.output?.flatMap(item => item.content || []).find(item => item.type === "output_text")?.text;
  if (!output) throw new Error("OpenAI returned empty content");
  return JSON.parse(output);
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
    if (!body.name?.trim() || !body.birth || !body.birthTimeZone) return send(res, 422, { error: "Name, birth date and birthplace time zone are required" });
    if (Number.isNaN(new Date(body.birth).getTime())) return send(res, 422, { error: "Birth date is invalid" });
    if (!isValidTimeZone(body.birthTimeZone)) return send(res, 422, { error: "Birthplace time zone is invalid" });

    const culture = traditionalCulture(body);
    try {
      const result = await requestAiResult(body, culture);
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
