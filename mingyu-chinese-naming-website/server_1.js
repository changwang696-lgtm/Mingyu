const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "public");
const types = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".png": "image/png" };

const demoResult = (body) => ({
  zodiac: { animal: "马", animalEn: "Horse", years: "午火 · Fire", traits: ["自由", "热忱", "敏锐"], traitsEn: ["Free-spirited", "Warm", "Perceptive"] },
  summary: "你的出生时刻落在盛夏午火的意象中。名字宜在明朗与沉静之间取得平衡：既保留行动力，也以温润的字义承接内在秩序。以下名字不是简单音译，而是结合原名气质、汉字声韵与文化联想所作的跨文化表达。",
  summaryEn: "Your birth moment carries the imagery of summer fire. A fitting name balances brightness with composure: preserving momentum while adding a calm inner order. These are not literal transliterations, but cross-cultural interpretations shaped by sound, meaning and character aesthetics.",
  names: [
    { hanzi: "林曜安", pinyin: "Lin Yao'an", seal: "曜安", meaning: "曜，是照耀与清朗；安，是从容与安定。名字寓意在广阔世界中保持明亮，也拥有安顿自我的力量。", meaningEn: "Yao evokes radiant clarity; An means peace and inner steadiness. Together they suggest a bright presence grounded by quiet confidence.", tone: "平 · 仄 · 平" },
    { hanzi: "沈知远", pinyin: "Shen Zhiyuan", seal: "知远", meaning: "知，代表洞察与求索；远，象征开阔的眼界。名字含有“知行致远”的文化联想，温雅而坚定。", meaningEn: "Zhi means insight and learning; Yuan suggests a far-reaching vision. The name feels cultivated, composed and quietly ambitious.", tone: "仄 · 平 · 仄" },
    { hanzi: "苏景和", pinyin: "Su Jinghe", seal: "景和", meaning: "景，是光景与敬慕；和，是和谐与包容。整体意象如春日和光，亲切、明朗且具有国际感。", meaningEn: "Jing evokes light and admiration; He means harmony and openness. Its image is warm daylight: approachable, lucid and cosmopolitan.", tone: "平 · 仄 · 平" }
  ],
  culturalNote: "生肖是传统民俗中观察时间与生命节律的一种象征语言，并非对性格与命运的科学判定。马的文化意象常与奔赴、坦荡、生命力相连。",
  culturalNoteEn: "The zodiac is a symbolic language through which Chinese tradition reflects on time and the rhythms of life, not a scientific determination of personality or destiny. The Horse is associated with vitality, openness and forward movement.",
  inputName: body.name || "Alex Morgan"
});

function send(res, status, data, type = "application/json; charset=utf-8") {
  res.writeHead(status, { "Content-Type": type });
  res.end(type.startsWith("application/json") ? JSON.stringify(data) : data);
}

async function generate(req, res) {
  let raw = "";
  req.on("data", chunk => raw += chunk);
  req.on("end", async () => {
    let body;
    try { body = JSON.parse(raw); } catch { return send(res, 400, { error: "Invalid request" }); }
    if (!process.env.OPENAI_API_KEY) return send(res, 200, { ...demoResult(body), demo: true });

    const prompt = `You are a careful bilingual Chinese naming consultant. Return JSON only with keys zodiac (animal, animalEn, years, traits, traitsEn), summary, summaryEn, names (3 objects: hanzi, pinyin, seal, meaning, meaningEn, tone), culturalNote, culturalNoteEn, inputName. Explain symbolism as cultural interpretation, never certainty or science. User: ${JSON.stringify(body)}`;
    try {
      const api = await fetch("https://api.openai.com/v1/responses", {
        method: "POST",
        headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-5.2", input: prompt, text: { format: { type: "json_object" } } })
      });
      const json = await api.json();
      if (!api.ok) throw new Error(json.error?.message || "OpenAI request failed");
      const text = json.output_text || json.output?.flatMap(x => x.content || []).find(x => x.type === "output_text")?.text;
      send(res, 200, JSON.parse(text));
    } catch (error) { send(res, 502, { error: error.message }); }
  });
}

http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/api/generate") return generate(req, res);
  const safeUrl = req.url === "/" ? "/index.html" : req.url.split("?")[0];
  const file = path.normalize(path.join(root, safeUrl));
  if (!file.startsWith(root)) return send(res, 403, "Forbidden", "text/plain");
  fs.readFile(file, (err, data) => err ? send(res, 404, "Not found", "text/plain") : send(res, 200, data, types[path.extname(file)] || "application/octet-stream"));
}).listen(process.env.PORT || 4173, () => console.log("Mingyu is running at http://localhost:4173"));
