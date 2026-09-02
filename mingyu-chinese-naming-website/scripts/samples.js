const translations = {
  en: {
    title: "Samples | Mingyu",
    navNaming: "Naming",
    navCulture: "Zodiac Culture",
    navCraft: "Crafts",
    navSamples: "Samples",
    accountLinkGuest: "Sign in",
    heroEyebrow: "MINGYU SAMPLES",
    heroTitle: "See what a refined piece of Eastern wisdom design can really look like.",
    cardLabel: "SAMPLE CARD / 01",
    cardTitle: "A card of Eastern wisdom I am proud to show.",
    reportLabel: "SAMPLE REPORT / 02",
    reportTitle: "A personality decoding report inspired by the ancient Eastern Five Phases.",
    cta: "I Want One Too",
    altCardFront: "Sample front of an Eastern wisdom card",
    altCardBack: "Sample back of an Eastern wisdom card",
    altReportCover: "Sample cover of an Eastern Five-Phases personality report"
  },
  zh: {
    title: "样品 | Mingyu",
    navNaming: "起名",
    navCulture: "生肖文化",
    navCraft: "东方好物",
    navSamples: "样品",
    accountLinkGuest: "注册 / 登录",
    heroEyebrow: "样品展示",
    heroTitle: "看看一张真正有气质的东方智慧作品，长什么样。",
    cardLabel: "样品卡片 / 01",
    cardTitle: "一张让我骄傲的东方智慧卡片",
    reportLabel: "样品报告 / 02",
    reportTitle: "古老东方五行灵感的人格解码报告",
    cta: "我也想做",
    altCardFront: "东方智慧卡片样品正面",
    altCardBack: "东方智慧卡片样品背面",
    altReportCover: "东方五行人格解码报告样品封面"
  }
};

let lang = "en";

function $(selector) {
  return document.querySelector(selector);
}

function applyLanguage() {
  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  document.title = translations[lang].title;
  document.querySelectorAll("[data-i18n]").forEach(element => {
    const value = translations[lang][element.dataset.i18n];
    if (value) element.textContent = value;
  });
  $("#langBtn").textContent = lang === "zh" ? "EN" : "中文";
  $("#sampleCardImageFront").alt = translations[lang].altCardFront;
  $("#sampleCardImageBack").alt = translations[lang].altCardBack;
  $("#sampleReportCover").alt = translations[lang].altReportCover;
}

$("#langBtn").onclick = () => {
  lang = lang === "zh" ? "en" : "zh";
  applyLanguage();
};

applyLanguage();
