const translations = {
  en: {
    navNaming: "Naming", navCulture: "Zodiac Culture", navCraft: "Crafts",
    eyebrow: "Words become a vessel · Meet the East", heroA: "One name,", heroB: "a lifetime of meaning",
    heroBody: "From your original name, birth moment and personality, discover a Chinese name that sounds natural and carries cultural depth.",
    begin: "Find my name", introTitle: "Not a translation, but a new way to see you.",
    introBody: "A Chinese name is a choice of sound, form and meaning. Starting from your identity, we interpret zodiac symbolism and character traditions to create names that are thoughtful, explained and usable in real life.",
    formTitle: "Tell us who you are", formSub: "About 1 minute · Choose the edition after entering your details",
    nameLabel: "Your current name", nameHint: "Any language is welcome. We consider pronunciation and context.",
    genderLabel: "Gender expression", female: "Female", male: "Male", neutral: "Neutral / Any",
    birthLabel: "Date and time of birth", birthHint: "The more accurate, the more nuanced the cultural reading.",
    placeLabel: "Place of birth", placeHint: "Used to understand your birth time zone.", wishLabel: "What should your name convey?",
    simpleEdition: "SIMPLE EDITION", simpleGenerate: "Names and zodiac", simpleNoPdf: "View online · No PDF",
    completeEdition: "COMPLETE EDITION", completeGenerate: "Complete naming result", completeWithPdf: "Full result · Save as PDF",
    humanTitle: "Culture-led, human-centred", humanBody: "This is a creative cultural interpretation, not fortune-telling or professional advice.",
    resultTitle: "Your Chinese name folio", simpleResultTitle: "Your names and zodiac", restart: "Start again ↺",
    zodiacTitle: "Your zodiac imagery", traditionTitle: "Traditional time & element reading", yearPillar: "Year pillar",
    heavenlyStem: "Heavenly stem", earthlyBranch: "Earthly branch & zodiac", birthHour: "Birth hour",
    stemMeaning: "The yin-yang and element carried by the year's heavenly stem", branchMeaning: "Each earthly branch has a fixed zodiac correspondence", methodNote: "Method note",
    zodiacProfileTitle: "Zodiac culture in detail", personalityEyebrow: "PERSONALITY", personalityTitle: "Personality traits",
    personalityNote: "These are traditional zodiac archetypes for cultural interpretation, not a scientific assessment of an individual.",
    symbolismEyebrow: "SYMBOLISM & MEANING", symbolismTitle: "Symbolism & meaning",
    reportEyebrow: "PERSONAL EDITION", pdfReadyTitle: "Your complete report is ready",
    pdfReadyBody: "Save the complete result as a polished A4 PDF for printing, gifting or keeping.", savePdf: "Save PDF",
    craftTitle: "An Eastern gift bearing your name", craftSub: "Objects made by artisans, turning your name into a keepsake you can touch.",
    product1: "Custom name seal", product2: "Silk round fan", product3: "Name calligraphy scroll",
    demoNote: "This is a demonstration checkout. No real charge will be made.", loading: "Reading the sound, meaning and moment of your name..."
  },
  zh: {
    navNaming: "起名", navCulture: "生肖文化", navCraft: "东方好物", eyebrow: "以字为舟 · 渡见东方",
    heroA: "一个名字，", heroB: "一生的东方寓意", heroBody: "从你的原名、出生时刻与个性出发，寻找一个既自然好听，也经得起文化推敲的中文名字。",
    begin: "开始寻名", introTitle: "不是翻译名字，而是重新认识你。",
    introBody: "中文名字是声音、字形与意义的共同选择。我们以你的身份为起点，参考生肖的文化意象与汉字传统，提供有出处、有解释、可被真实使用的名字。",
    formTitle: "告诉我们，你是谁", formSub: "约 1 分钟 · 填写资料后选择生成版本", nameLabel: "你现在的姓名",
    nameHint: "支持任何语言，我们会理解读音与文化背景", genderLabel: "性别表达", female: "女性", male: "男性", neutral: "中性 / 不限",
    birthLabel: "出生日期与时间", birthHint: "越准确，文化解读越细致", placeLabel: "出生地", placeHint: "用于理解出生时区", wishLabel: "你希望名字传达什么？",
    simpleEdition: "简约版", simpleGenerate: "生成名字及生肖", simpleNoPdf: "页面查看 · 不含 PDF",
    completeEdition: "完整版", completeGenerate: "生成全部起名结果", completeWithPdf: "完整页面 · 可保存 PDF",
    humanTitle: "以文化为依据，以人为中心", humanBody: "结果为传统文化创意解读，不构成命运预测或专业建议。",
    resultTitle: "你的东方名字卷", simpleResultTitle: "你的名字与生肖", restart: "重新填写 ↺", zodiacTitle: "你的生肖意象",
    traditionTitle: "传统时序文化解读", yearPillar: "年柱", heavenlyStem: "天干", earthlyBranch: "地支与生肖", birthHour: "出生时辰",
    stemMeaning: "体现年柱天干的阴阳与五行属性", branchMeaning: "地支与生肖为固定对应关系", methodNote: "计算说明",
    zodiacProfileTitle: "生肖文化详解", personalityEyebrow: "性格意象 · PERSONALITY", personalityTitle: "性格特征",
    personalityNote: "源自传统生肖文化的典型特征，仅作文化理解，不代表对个人性格的科学判定。",
    symbolismEyebrow: "文化意象 · SYMBOLISM & MEANING", symbolismTitle: "象征与寓意",
    reportEyebrow: "珍藏版 · PERSONAL EDITION", pdfReadyTitle: "完整报告已经生成",
    pdfReadyBody: "可将当前完整结果保存为精美 A4 PDF，用于珍藏、打印或赠礼。", savePdf: "保存 PDF",
    craftTitle: "一件带着名字的东方礼物", craftSub: "来自手艺人的小物，为名字留下可以触摸的纪念。",
    product1: "定制姓名印章", product2: "缂丝团扇", product3: "姓名书法卷",
    demoNote: "当前为演示结账流程，未接入真实扣款。", loading: "正在研读你的名字与时辰..."
  }
};

let lang = "zh";
let latest = null;
let activeTier = "complete";
let pendingTier = "simple";
let pendingBody = null;
const $ = selector => document.querySelector(selector);
const dialog = $("#payment");

const tierCopy = {
  simple: {
    price: "$2.99",
    zh: { title: "确认生成简约版", eyebrow: "简约版 · SIMPLE EDITION", button: "演示支付并生成 · $2.99", benefits: ["生成 3 个中文候选名字及拼音", "展示对应的固定十二生肖", "结果仅在网页查看，不提供 PDF"] },
    en: { title: "Confirm Simple Edition", eyebrow: "SIMPLE EDITION", button: "Demo payment & generate · $2.99", benefits: ["Three Chinese name options with pinyin", "Your fixed Chinese zodiac sign", "Online result only, without PDF"] }
  },
  complete: {
    price: "$9.90",
    zh: { title: "确认生成完整版", eyebrow: "完整版 · COMPLETE EDITION", button: "演示支付并生成 · $9.90", benefits: ["全部名字释义与中英双语解读", "生肖性格、象征寓意、干支五行与时辰", "完整结果可保存为 A4 PDF"] },
    en: { title: "Confirm Complete Edition", eyebrow: "COMPLETE EDITION", button: "Demo payment & generate · $9.90", benefits: ["Complete bilingual name interpretations", "Zodiac traits, symbolism, stems, branches and elements", "Save the full result as an A4 PDF"] }
  }
};

function applyLanguage() {
  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  document.querySelectorAll("[data-i18n]").forEach(element => {
    const value = translations[lang][element.dataset.i18n];
    if (value) element.textContent = value;
  });
  $("#langBtn").textContent = lang === "zh" ? "EN" : "中文";
  if (dialog.open) updatePaymentDialog();
  if (latest) render(latest);
}

$("#langBtn").onclick = () => {
  lang = lang === "zh" ? "en" : "zh";
  applyLanguage();
};

$("#nameForm").addEventListener("submit", event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  pendingTier = event.submitter?.value === "complete" ? "complete" : "simple";
  pendingBody = { ...Object.fromEntries(new FormData(form)), tier: pendingTier };
  updatePaymentDialog();
  dialog.showModal();
});

function updatePaymentDialog() {
  const copy = tierCopy[pendingTier][lang];
  $("#paymentTitle").textContent = copy.title;
  $("#paymentEyebrow").textContent = copy.eyebrow;
  $("#paymentBenefits").innerHTML = copy.benefits.map(item => `<li>${esc(item)}</li>`).join("");
  $("#confirmPurchaseText").textContent = copy.button;
}

$("#confirmPurchase").onclick = async () => {
  dialog.close();
  $("#loading").hidden = false;
  try {
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pendingBody)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Request failed");
    activeTier = pendingTier;
    latest = data;
    render(data);
    $("#result").hidden = false;
    $("#result").scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    alert((lang === "zh" ? "生成失败：" : "Generation failed: ") + error.message);
  } finally {
    $("#loading").hidden = true;
  }
};

function render(data) {
  const en = lang === "en";
  const simple = activeTier === "simple";
  const animalKey = data.zodiac.animalEn.toLowerCase();
  $("#result").classList.toggle("simple-result", simple);
  $("#resultTitle").textContent = simple ? translations[lang].simpleResultTitle : translations[lang].resultTitle;
  $("#editionBadge").textContent = simple ? `${en ? "Simple Edition" : "简约版"} · $2.99` : `${en ? "Complete Edition" : "完整版"} · $9.90`;
  $("#zodiacGlyph span").textContent = data.zodiac.animal;
  $("#zodiacImage").src = `/assets/zodiac/${animalKey}.jpg`;
  $("#zodiacImage").alt = `${data.zodiac.animal} · ${data.zodiac.animalEn}`;
  $("#zodiacName").textContent = `${data.zodiac.years} · ${en ? data.zodiac.animalEn : data.zodiac.animal}`;
  $("#traits").innerHTML = (en ? data.zodiac.traitsEn : data.zodiac.traits).map(item => `<span>${esc(item)}</span>`).join("");
  $("#summary").textContent = en ? data.summaryEn : data.summary;
  $("#culturalNote").textContent = en ? data.culturalNoteEn : data.culturalNote;
  renderZodiacProfile(data.traditionalCulture, en);
  renderCulture(data.traditionalCulture, en);
  $("#nameList").innerHTML = data.names.map((name, index) => `
    <article class="name-card">
      <div><small>0${index + 1}</small><div class="hanzi">${esc(name.hanzi)}</div><div class="pinyin">${esc(name.pinyin)}</div></div>
      <div class="name-detail"><p>${esc(en ? name.meaningEn : name.meaning)}</p><span class="tone">${esc(name.tone)}</span></div>
      <div class="seal">${esc(name.seal)}</div>
    </article>`).join("");
  $("#demoBadge").hidden = !data.demo;
  $("#demoBadge").textContent = en ? "Cultural preview" : "文化体验版";
}

function renderZodiacProfile(culture, en) {
  const profile = culture?.zodiacProfile;
  if (!profile) return;
  const traits = en ? profile.personalityEn : profile.personality;
  $("#profileTraits").innerHTML = traits.map((trait, index) => `<span><b>0${index + 1}</b>${esc(trait)}</span>`).join("");
  $("#zodiacSymbolism").textContent = en ? profile.symbolismEn : profile.symbolism;
}

function renderCulture(culture, en) {
  if (!culture) return;
  const elements = { 木: "Wood", 火: "Fire", 土: "Earth", 金: "Metal", 水: "Water" };
  const polarities = { 阳: "Yang", 阴: "Yin" };
  const branchNames = { 子: "Zi", 丑: "Chou", 寅: "Yin", 卯: "Mao", 辰: "Chen", 巳: "Si", 午: "Wu", 未: "Wei", 申: "Shen", 酉: "You", 戌: "Xu", 亥: "Hai" };
  $("#pillarStem").textContent = culture.stem.char;
  $("#pillarBranch").textContent = culture.branch.char;
  $("#yearPillar").textContent = culture.pillar;
  $("#cyclePosition").textContent = en ? `Sexagenary cycle · No. ${culture.cycleNumber}` : `六十甲子 · 第 ${culture.cycleNumber} 位`;
  $("#stemDetail").textContent = en ? `${culture.stem.char} · ${polarities[culture.stem.polarity]} ${elements[culture.stem.element]}` : `${culture.stem.char} · ${culture.stem.polarity}${culture.stem.element}`;
  $("#branchDetail").textContent = en ? `${culture.branch.char} · ${elements[culture.branch.element]} · ${culture.branch.zodiacEn}` : `${culture.branch.char} · ${culture.branch.element} · ${culture.branch.zodiac}`;
  $("#hourDetail").textContent = en ? `${branchNames[culture.hourBranch.char]} hour · ${elements[culture.hourBranch.element]}` : `${culture.hourBranch.char}时 · ${culture.hourBranch.element}`;
  $("#hourRange").textContent = culture.hourBranch.range;
  $("#cultureNote").textContent = en ? culture.noteEn : culture.note;
  const present = new Set([culture.stem.element, culture.branch.element, culture.hourBranch.element]);
  document.querySelectorAll(".element-flow span").forEach(element => {
    element.classList.toggle("is-present", present.has(element.dataset.element));
    element.textContent = en ? elements[element.dataset.element] : element.dataset.element;
  });
}

function esc(value) {
  return String(value).replace(/[&<>"']/g, character => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[character]));
}

$("#restart").onclick = () => {
  $("#result").hidden = true;
  $("#ritual").scrollIntoView({ behavior: "smooth" });
};
dialog.querySelector(".close").onclick = () => dialog.close();
$("#savePdf").onclick = () => {
  if (activeTier !== "complete") return;
  document.body.classList.add("printing");
  window.print();
  setTimeout(() => document.body.classList.remove("printing"), 500);
};

applyLanguage();
