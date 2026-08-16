const translations = {
  en: {
    navPlans: "Plans", navNaming: "Naming", navCulture: "Zodiac Culture", navCraft: "Crafts", accountLinkGuest: "Sign in",
    eyebrow: "Words become a vessel · Meet the East", heroA: "One name,", heroB: "a lifetime of meaning",
    heroBody: "From your original name, birth moment and personality, discover AI-powered Chinese naming suggestions, cultural readings, and paid naming reports with guest order recovery.",
    begin: "Find my name", introTitle: "Not a translation, but a new way to see you.",
    introBody: "A Chinese name is a choice of sound, form and meaning. Starting from your identity, we interpret zodiac symbolism and character traditions to create names that are thoughtful, explained and usable in real life.",
    pricingTitle: "A pricing model that fits an AI product better",
    pricingBody: "We are moving away from wallet-like stored value and toward a clearer AI membership and credits model: monthly plans include fixed generation credits, while one-time purchases are sold as explicit credit packs.",
    starterType: "MEMBERSHIP", starterTitle: "Starter · 30 credits / month", perMonth: "/ month",
    starterPoint1: "30 AI naming generation credits each month",
    starterPoint2: "Designed for personal ongoing exploration and keepsakes",
    starterPoint3: "Clear billing, member identity, and support access",
    studioType: "PRO MEMBERSHIP", studioTitle: "Studio · 80 credits / month",
    studioPoint1: "80 AI naming and report credits every month",
    studioPoint2: "Best for frequent generation, comparison, and printing",
    studioPoint3: "Priority access to full reports, PDF exports, and member support",
    creditType: "ONE-TIME PURCHASE", creditTitle: "Credit Pack · 50 credits", oneTime: "one-time",
    creditPoint1: "Buy 50 credits in one payment, with no auto-renewal",
    creditPoint2: "Suitable for gifting, focused creation, or short-term use",
    creditPoint3: "Statements clearly describe AI naming credits",
    billingTitle: "Billing language that users and payment reviewers can both understand",
    billingPoint1: "1 credit = 1 AI Chinese naming or report generation request",
    billingPoint2: "Monthly memberships auto-renew and must disclose price, cycle, and cancellation method",
    billingPoint3: "One-time credit packs do not auto-renew and are not wallet balances or stored cash value",
    billingPoint4: "Digital delivery happens in-app after successful payment and generation",
    billingLink: "View cancellation and renewal policy",
    flowTitle: "The full membership and credits journey",
    flowBody: "This is also the product shape that PayPal and Stripe understand more easily: register first, buy a plan, spend credits inside the account, and keep a visible delivery history.",
    flowStep1Title: "Create an account", flowStep1Body: "Users create an account with email and receive member identity, billing history, and support access.",
    flowStep2Title: "Choose a plan", flowStep2Body: "Pick a monthly membership or one-time credit pack, with clear price and currency at checkout.",
    flowStep3Title: "Spend credits", flowStep3Body: "Each AI naming request consumes credits and records its generation time and fulfillment status.",
    flowStep4Title: "Manage membership", flowStep4Body: "View remaining credits, saved reports, invoices, renewal timing, and cancellation instructions in the account.",
    memberStripEyebrow: "MEMBER ACCESS",
    memberStripGuest: "Create account / Sign in",
    memberStripLoggedIn: "Open member center",
    memberStripGuestBody: "Sign in to receive welcome credits, generate with your balance, and keep a saved history in your account.",
    memberStripLoggedInBody: "Signed in as {name}. You have {credits} credits available and can generate directly with member balance.",
    simpleCreditCaption: "Use 1 credit when signed in",
    completeCreditCaption: "Use 3 credits when signed in",
    memberPaymentFallback: "Not enough credits for this request. Continue with PayPal checkout instead.",
    creditUsed: "{count} credit used. {remaining} credits remaining.",
    accountLinkMember: "My account",
    formTitle: "Tell us who you are", formSub: "For guest checkout recovery, we store the information required to deliver and reopen your paid result. If you prefer, enter only your surname; results remain about 90% as effective.",
    nameLabel: "Your current name", nameHint: "Any language is welcome. We consider pronunciation and context.",
    deliveryEmailLabel: "Delivery email",
    deliveryEmailHint: "Used to recover your order, reopen your result, and receive support if anything goes wrong.",
    genderLabel: "Gender expression", female: "Female", male: "Male", neutral: "Neutral / Any",
    birthLabel: "Date and time of birth", birthHint: "The more accurate, the more nuanced the cultural reading.",
    timezoneLabel: "Birthplace time zone", timezonePlaceholder: "Select the birthplace time zone", timezoneHint: "Daylight saving is applied before conversion to China Standard Time (UTC+8).", wishLabel: "What should your name convey?",
    simpleEdition: "SIMPLE EDITION", simpleGenerate: "Names and zodiac", simpleNoPdf: "View online · PDF included",
    completeEdition: "COMPLETE EDITION", completeGenerate: "Complete naming result", completeWithPdf: "Full result · Save as PDF",
    humanTitle: "Privacy first · Stored only for delivery", humanBody: "We store the details needed to deliver your paid result, reopen your order, and support dispute handling. This is a cultural interpretation, not fortune-telling or professional advice.",
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
    launchTitle: "Current site status",
    launchBody: "The site currently focuses on guest one-time generation and order recovery. Registration, sign-in, memberships, credit ledger, invoices, and auto-renew billing are temporarily hidden but the code is preserved for a later relaunch.",
    demoNote: "This is a demonstration checkout. No real charge will be made.", loading: "Reading the sound, meaning and moment of your name...",
         paypalInlineTitle: "Pay with PayPal directly",
         paypalInlineBody: "Complete the form above, then continue to the official PayPal page. You can pay with a PayPal account or an eligible card. The email you enter on this site is only for delivery and can differ from your PayPal login email.",
    paypalValidation: "Please complete the required form fields before starting PayPal checkout.",
         paypalHostedNote: "After your order is prepared, you will be redirected to the official PayPal payment page. You can pay with a PayPal account or an eligible bank card. The email entered on this site is only used to deliver your result and can differ from your PayPal login email. If you cancel payment, PayPal will return you to this site and keep your order for later recovery.",
         paypalHostedDialogNote: "You will be redirected to the official PayPal payment page. After payment, the site will continue and restore your result automatically. If you cancel payment, you will be returned to this site.",
    paypalHostedOpen: "Open PayPal checkout",
    paypalHostedOpened: "Redirecting to the PayPal checkout page...",
    guestOrderSavedTitle: "Guest order saved",
         guestOrderSavedBody: "Order {orderId} is ready. Complete payment on PayPal and you will be returned to the site to restore or reopen your result. If you cancel payment, the order will still be kept for later recovery.",
    findOrderLink: "Find my order",
    guestOrderCreateFailed: "We could not create your guest order. Please try again.",
    guestOrderRecovered: "Your saved order result has been restored."
  },
  zh: {
    navPlans: "会员套餐", navNaming: "起名", navCulture: "生肖文化", navCraft: "东方好物", accountLinkGuest: "注册 / 登录", eyebrow: "以字为舟 · 渡见东方",
    heroA: "一个名字，", heroB: "一生的东方寓意", heroBody: "从你的原名、出生时刻与个性出发，获得由 AI 驱动的中文起名建议、文化解读，以及支持游客订单找回的付费报告服务。",
    begin: "开始寻名", introTitle: "不是翻译名字，而是重新认识你。",
    introBody: "中文名字是声音、字形与意义的共同选择。我们以你的身份为起点，参考生肖的文化意象与汉字传统，提供有出处、有解释、可被真实使用的名字。",
    pricingTitle: "更适合 AI 产品的收费方式",
    pricingBody: "我们不做钱包储值，而是采用更清晰的 AI 会员与 credits 模型：月度套餐包含固定生成额度，一次性购买则以明确的 credits 包形式提供。",
    starterType: "月度会员", starterTitle: "Starter · 30 credits / 月", perMonth: "/ 月",
    starterPoint1: "每月获得 30 次 AI 起名生成额度",
    starterPoint2: "适合个人持续试用与收藏",
    starterPoint3: "支持账单说明、会员身份与客服入口",
    studioType: "高阶会员", studioTitle: "Studio · 80 credits / 月",
    studioPoint1: "每月获得 80 次 AI 起名与报告额度",
    studioPoint2: "适合高频生成、对比和打印收藏",
    studioPoint3: "优先体验完整报告、PDF 与会员支持",
    creditType: "一次性购买", creditTitle: "Credit Pack · 50 credits", oneTime: "一次性",
    creditPoint1: "一次性购买 50 credits，不自动续费",
    creditPoint2: "适合节日赠礼、集中生成与短期使用",
    creditPoint3: "账单上清晰标注 AI naming credits",
    billingTitle: "用户与支付平台都能看懂的账单说明",
    billingPoint1: "1 credit = 1 次 AI 中文起名或报告生成请求",
    billingPoint2: "月度会员为自动续费，续费周期、价格和取消方式需明确展示",
    billingPoint3: "一次性 credit pack 不自动续费，不属于钱包余额或现金储值",
    billingPoint4: "数字服务交付方式为：支付成功后，在网站内生成并显示结果",
    billingLink: "查看取消订阅与续费说明",
    flowTitle: "会员与 credits 的完整路径",
    flowBody: "这也是 PayPal 与 Stripe 更容易理解的产品形态：先注册，再购买套餐，然后在账户内消耗 credits 并查看交付记录。",
    flowStep1Title: "注册账户", flowStep1Body: "用户用邮箱创建账户，获得会员身份、账单记录与支持入口。",
    flowStep2Title: "选择套餐", flowStep2Body: "选择月度会员或一次性 credits 包，并在结账页看到明确价格与币种。",
    flowStep3Title: "消耗 credits", flowStep3Body: "每次提交 AI 起名请求时消耗对应 credits，同时记录生成时间与交付状态。",
    flowStep4Title: "管理会员", flowStep4Body: "在账户中查看剩余 credits、历史报告、发票、续费时间与取消订阅方式。",
    memberStripEyebrow: "会员入口",
    memberStripGuest: "前往注册 / 登录",
    memberStripLoggedIn: "打开会员中心",
    memberStripGuestBody: "登录后可获得欢迎 credits，直接用余额生成结果，并在会员中心查看历史记录。",
    memberStripLoggedInBody: "已登录为 {name}，当前剩余 {credits} credits，可直接使用会员余额生成结果。",
    simpleCreditCaption: "登录后可使用 1 credit",
    completeCreditCaption: "登录后可使用 3 credits",
    memberPaymentFallback: "当前 credits 不足，本次将继续使用 PayPal 结账。",
    creditUsed: "已消耗 {count} credit，当前剩余 {remaining} credits。",
    accountLinkMember: "会员中心",
    formTitle: "告诉我们，你是谁", formSub: "为支持游客订单交付与找回，我们会保存本次付款所需信息。若有顾虑，可只输入您的姓氏，生成效果仍约有 90%。",
    nameLabel: "你现在的姓名",
    nameHint: "支持任何语言，我们会理解读音与文化背景", genderLabel: "性别表达", female: "女性", male: "男性", neutral: "中性 / 不限",
    deliveryEmailLabel: "交付邮箱",
    deliveryEmailHint: "用于找回订单、重新打开结果，以及后续客服协助",
    birthLabel: "出生日期与时间", birthHint: "越准确，文化解读越细致", timezoneLabel: "出生地时区", timezonePlaceholder: "请选择出生地对应时区", timezoneHint: "系统会处理夏令时，并换算为中国标准时间（UTC+8）", wishLabel: "你希望名字传达什么？",
    simpleEdition: "简约版", simpleGenerate: "生成名字及生肖", simpleNoPdf: "页面查看 · 含 PDF 下载",
    completeEdition: "完整版", completeGenerate: "生成全部起名结果", completeWithPdf: "完整页面 · 可保存 PDF",
    humanTitle: "隐私优先 · 仅为交付保存必要信息", humanBody: "我们会保存交付结果、找回订单与处理争议所需的信息；如有顾虑可只输入姓氏。结果为传统文化创意解读，不构成命运预测或专业建议。",
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
    launchTitle: "当前站点状态",
    launchBody: "目前站点仍以游客单次生成与订单找回为主；注册、登录、会员套餐、credits 台账、发票与自动续费界面已暂时隐藏并保留代码，后续可继续启用。",
    demoNote: "当前为演示结账流程，未接入真实扣款。", loading: "正在研读你的名字与时辰...",
         paypalInlineTitle: "使用 PayPal 直接付款",
         paypalInlineBody: "填写上方信息后，将跳转到 PayPal 官方安全支付页。你可以使用 PayPal 账户登录付款，或选择支持的银行卡支付。你在本站填写的邮箱仅用于接收结果邮件，与 PayPal 登录邮箱可以不同。",
    paypalValidation: "请先完整填写必填信息，再使用 PayPal 付款。",
         paypalHostedNote: "当前会先创建游客订单，再跳转到 PayPal 官方安全支付页。你可以使用 PayPal 账户登录付款，或选择支持的银行卡支付。你在本站填写的邮箱仅用于接收结果邮件，与 PayPal 登录邮箱可以不同。若你取消支付，PayPal 会带你返回本站，订单也会保留，方便稍后继续或找回。",
         paypalHostedDialogNote: "当前将跳转到 PayPal 官方安全支付页进行付款。付款完成后，网站会自动继续并恢复结果；若你取消支付，也会返回本站。",
    paypalHostedOpen: "打开 PayPal 付款页",
    paypalHostedOpened: "正在跳转到 PayPal 付款页...",
    guestOrderSavedTitle: "游客订单已保存",
         guestOrderSavedBody: "订单号 {orderId} 已创建。请在 PayPal 完成付款，随后会自动回到本站恢复或重新打开结果。若你取消支付，订单仍会保留，方便稍后继续或找回。",
    findOrderLink: "找回我的订单",
    guestOrderCreateFailed: "创建游客订单失败，请稍后重试。",
    guestOrderRecovered: "已为你恢复已保存的订单结果。"
  }
};

let lang = "zh";
let latest = null;
let activeTier = "complete";
let pendingTier = "simple";
let pendingBody = null;
let sessionState = { loggedIn: false, user: null, catalog: null };
// Future switch: set to true when the account, membership, and credits experience should return to the homepage.
const membershipPreviewEnabled = false;
let paypalConfig = { enabled: false, clientId: null, currency: "USD" };
let paypalSdkPromise = null;
let paypalButtonsInstance = null;
let inlinePayPalRendered = false;
const guestCheckoutKey = "mingyu_guest_checkout";
const hostedPayPalLinks = { simple: "#", complete: "#" };
let guestOrderMeta = null;
const $ = selector => document.querySelector(selector);
const dialog = $("#payment");
const creditCosts = { simple: 1, complete: 3 };

const tierCopy = {
  simple: {
    price: "$2.99",
    zh: { title: "确认生成简约版", eyebrow: "简约版 · SIMPLE EDITION", button: "支付并生成 · $2.99", benefits: ["生成 3 个中文候选名字及拼音", "展示对应的固定十二生肖", "结果保存到订单并支持 PDF 下载"] },
    en: { title: "Confirm Simple Edition", eyebrow: "SIMPLE EDITION", button: "Pay & generate · $2.99", benefits: ["Three Chinese name options with pinyin", "Your fixed Chinese zodiac sign", "Saved to your order with PDF download access"] }
  },
  complete: {
    price: "$9.90",
    zh: { title: "确认生成完整版", eyebrow: "完整版 · COMPLETE EDITION", button: "演示支付并生成 · $9.90", benefits: ["全部名字释义与中英双语解读", "生肖性格、象征寓意、干支五行与时辰", "完整结果可保存为 A4 PDF"] },
    en: { title: "Confirm Complete Edition", eyebrow: "COMPLETE EDITION", button: "Demo payment & generate · $9.90", benefits: ["Complete bilingual name interpretations", "Zodiac traits, symbolism, stems, branches and elements", "Save the full result as an A4 PDF"] }
  }
};

function t(key, replacements = {}) {
  const template = translations[lang][key] || "";
  return Object.entries(replacements).reduce((value, [token, replacement]) => value.replaceAll(`{${token}}`, replacement), template);
}

function updateMemberExperience() {
  const accountLink = $("#accountLink");
  const memberStripText = $("#memberStripText");
  const memberStripLink = $("#memberStripLink");
  const simplePrice = $("#simplePlanPrice");
  const completePrice = $("#completePlanPrice");
  const simpleCaption = $("#simplePlanCaption");
  const completeCaption = $("#completePlanCaption");

  if (!simplePrice || !completePrice || !simpleCaption || !completeCaption) return;

  if (!membershipPreviewEnabled) {
    if (accountLink) {
      accountLink.hidden = true;
      accountLink.style.display = "none";
    }
    if ($("#navPlansLink")) {
      $("#navPlansLink").hidden = true;
      $("#navPlansLink").style.display = "none";
    }
    if ($("#pricing")) $("#pricing").hidden = true;
    if ($("#memberFlow")) $("#memberFlow").hidden = true;
    if ($("#memberStrip")) $("#memberStrip").hidden = true;
    simplePrice.textContent = "$2.99";
    completePrice.textContent = "$9.90";
    simpleCaption.textContent = translations[lang].simpleNoPdf;
    completeCaption.textContent = translations[lang].completeWithPdf;
    return;
  }

  if (!accountLink || !memberStripText || !memberStripLink) return;
  accountLink.hidden = false;
  accountLink.style.display = "";
  if ($("#navPlansLink")) {
    $("#navPlansLink").hidden = false;
    $("#navPlansLink").style.display = "";
  }
  if ($("#pricing")) $("#pricing").hidden = false;
  if ($("#memberFlow")) $("#memberFlow").hidden = false;
  if ($("#memberStrip")) $("#memberStrip").hidden = false;

  if (sessionState.loggedIn && sessionState.user) {
    accountLink.textContent = translations[lang].accountLinkMember;
    memberStripText.textContent = t("memberStripLoggedInBody", {
      name: sessionState.user.displayName || sessionState.user.email,
      credits: String(sessionState.user.creditsBalance)
    });
    memberStripLink.textContent = translations[lang].memberStripLoggedIn;
    simplePrice.textContent = `${creditCosts.simple} cr`;
    completePrice.textContent = `${creditCosts.complete} cr`;
    simpleCaption.textContent = translations[lang].simpleCreditCaption;
    completeCaption.textContent = translations[lang].completeCreditCaption;
  } else {
    accountLink.textContent = translations[lang].accountLinkGuest;
    memberStripText.textContent = translations[lang].memberStripGuestBody;
    memberStripLink.textContent = translations[lang].memberStripGuest;
    simplePrice.textContent = "$2.99";
    completePrice.textContent = "$9.90";
    simpleCaption.textContent = translations[lang].simpleNoPdf;
    completeCaption.textContent = translations[lang].completeWithPdf;
  }
}

function applyLanguage() {
  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  document.querySelectorAll("[data-i18n]").forEach(element => {
    const value = translations[lang][element.dataset.i18n];
    if (value) element.textContent = value;
  });
  if ($("#paypalInlineTitle")) $("#paypalInlineTitle").textContent = translations[lang].paypalInlineTitle;
  if ($("#paypalInlineBody")) $("#paypalInlineBody").textContent = translations[lang].paypalInlineBody;
  if ($("#paypalHostedNote")) $("#paypalHostedNote").textContent = translations[lang].paypalHostedNote;
  if ($("#guestCheckoutNote strong")) $("#guestCheckoutNote strong").textContent = translations[lang].guestOrderSavedTitle;
  if ($("#findOrderLink")) $("#findOrderLink").textContent = translations[lang].findOrderLink;
  if ($("#dialogHostedLink")) $("#dialogHostedLink").textContent = translations[lang].paypalHostedOpen;
  $("#langBtn").textContent = lang === "zh" ? "EN" : "中文";
  updateMemberExperience();
  if (dialog.open) updatePaymentDialog();
  if (latest) render(latest);
}

$("#langBtn").onclick = () => {
  lang = lang === "zh" ? "en" : "zh";
  applyLanguage();
};

$("#nameForm").addEventListener("submit", async event => {
  event.preventDefault();
  const form = event.currentTarget;
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }
  pendingTier = event.submitter?.value === "complete" ? "complete" : "simple";
  pendingBody = { ...Object.fromEntries(new FormData(form)), tier: pendingTier };
  if (sessionState.loggedIn && sessionState.user && sessionState.user.creditsBalance >= creditCosts[pendingTier]) {
    startMemberGeneration();
    return;
  }
  if (hostedPayPalLinks[pendingTier]) {
    try {
      await openHostedCheckout(pendingTier);
      return;
    } catch {
      return;
    }
  }
  if (sessionState.loggedIn && sessionState.user) $("#formMessage").textContent = translations[lang].memberPaymentFallback;
  updatePaymentDialog();
  dialog.showModal();
});

function updatePaymentDialog() {
  const copy = tierCopy[pendingTier][lang];
  const hasHostedCheckout = Boolean(hostedPayPalLinks[pendingTier]);
  $("#paymentTitle").textContent = copy.title;
  $("#paymentEyebrow").textContent = copy.eyebrow;
  $("#paymentBenefits").innerHTML = copy.benefits.map(item => `<li>${esc(item)}</li>`).join("");
  $("#confirmPurchaseText").textContent = copy.button;
  $("#paymentNote").textContent = hasHostedCheckout
    ? translations[lang].paypalHostedDialogNote
    : paypalConfig.enabled
    ? (lang === "zh" ? "支付将由 PayPal 安全处理，付款完成后立即生成结果。" : "Payment will be processed securely by PayPal. Your result will generate immediately after capture.")
    : translations[lang].demoNote;
  $("#confirmPurchase").hidden = paypalConfig.enabled || hasHostedCheckout;
  $("#paypalButtons").hidden = hasHostedCheckout || !paypalConfig.enabled;
  $("#hostedCheckout").hidden = !hasHostedCheckout;
  if (hasHostedCheckout && $("#dialogHostedLink")) $("#dialogHostedLink").href = hostedPayPalLinks[pendingTier];
  if (hasHostedCheckout) return;
  if (paypalConfig.enabled) renderPayPalButtons();
}

$("#confirmPurchase").onclick = async () => {
  if (paypalConfig.enabled) return;
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
  const usedCredits = data.membership?.consumedCredits;
  $("#result").classList.toggle("simple-result", simple);
  $("#resultTitle").textContent = simple ? translations[lang].simpleResultTitle : translations[lang].resultTitle;
  $("#editionBadge").textContent = usedCredits
    ? `${simple ? (en ? "Simple Edition" : "简约版") : (en ? "Complete Edition" : "完整版")} · ${usedCredits} ${en ? "credits" : "credits"}`
    : (simple ? `${en ? "Simple Edition" : "简约版"} · $2.99` : `${en ? "Complete Edition" : "完整版"} · $9.90`);
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
      <div><small>${en ? `NAME 0${index + 1}` : `候选 0${index + 1}`}</small><div class="hanzi">${esc(name.hanzi)}</div><div class="pinyin">${esc(name.pinyin)}</div></div>
      <div class="name-detail"><p>${esc(en ? name.meaningEn : name.meaning)}</p><span class="tone">${esc(name.tone)}</span></div>
      <div class="seal"><span class="seal-mark" aria-hidden="true">印</span><span class="seal-text">${esc(name.seal)}</span></div>
    </article>`).join("");
  $("#demoBadge").hidden = !data.demo;
  $("#demoBadge").textContent = en ? "Cultural preview" : "文化体验版";
}

function loadPayPalSdk() {
  if (!paypalConfig.enabled || !paypalConfig.clientId) return Promise.reject(new Error("PayPal is not configured."));
  if (window.paypal) return Promise.resolve(window.paypal);
  if (paypalSdkPromise) return paypalSdkPromise;
  paypalSdkPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${encodeURIComponent(paypalConfig.clientId)}&currency=${encodeURIComponent(paypalConfig.currency)}&intent=capture`;
    script.async = true;
    script.onload = () => resolve(window.paypal);
    script.onerror = () => reject(new Error("Failed to load PayPal SDK."));
    document.head.appendChild(script);
  });
  return paypalSdkPromise;
}

function collectFormBody(tier, requireValid = true) {
  const form = $("#nameForm");
  if (requireValid && !form.checkValidity()) {
    form.reportValidity();
    $("#formMessage").textContent = translations[lang].paypalValidation;
    throw new Error(translations[lang].paypalValidation);
  }
  $("#formMessage").textContent = "";
  return { ...Object.fromEntries(new FormData(form)), tier };
}

function persistGuestOrder(order) {
  localStorage.setItem(guestCheckoutKey, JSON.stringify(order));
}

function readGuestOrder() {
  try {
    return JSON.parse(localStorage.getItem(guestCheckoutKey) || "null");
  } catch {
    return null;
  }
}

function showGuestCheckoutNotice(order) {
  if (!$("#guestCheckoutNote")) return;
  $("#guestCheckoutNote").hidden = false;
  const body = $("#guestOrderSavedBody");
  if (body) body.textContent = t("guestOrderSavedBody", { orderId: order.orderId });
  const successLink = $("#guestSuccessLink");
  if (successLink) successLink.href = order.successUrl;
}

async function createGuestOrderForTier(tier, body = null) {
  const requestBody = body || collectFormBody(tier, true);
  pendingTier = tier;
  pendingBody = requestBody;
  const response = await fetch("/api/guest-orders/start", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(requestBody)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || translations[lang].guestOrderCreateFailed);
  const order = { ...data, tier, body: requestBody, createdAt: Date.now() };
  persistGuestOrder(order);
  showGuestCheckoutNotice(order);
  return order;
}

async function openHostedCheckout(tier) {
  const preparedBody = collectFormBody(tier, true);
  $("#formMessage").textContent = lang === "zh" ? "正在创建游客订单..." : "Preparing your guest order...";
  try {
    const order = await createGuestOrderForTier(tier, preparedBody);
    $("#formMessage").textContent = translations[lang].paypalHostedOpened;
    window.location.assign(order.approvalUrl);
  } catch (error) {
    $("#formMessage").textContent = error.message || translations[lang].guestOrderCreateFailed;
    throw error;
  }
}

async function bindHostedCheckoutLink(selector, tier) {
  const link = $(selector);
  if (!link) return;
  link.href = "#";
  link.addEventListener("click", async event => {
    event.preventDefault();
    try {
      await openHostedCheckout(tier);
    } catch (error) {
      $("#formMessage").textContent = error.message || translations[lang].guestOrderCreateFailed;
    }
  });
}

async function capturePayPalOrder(orderID, tier) {
  $("#loading").hidden = false;
  try {
    const response = await fetch("/api/paypal/capture-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderID })
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Unable to capture PayPal order.");
    activeTier = tier;
    latest = result;
    render(result);
    if (result.membership?.remainingCredits != null && sessionState.user) {
      sessionState.user.creditsBalance = result.membership.remainingCredits;
      updateMemberExperience();
    } else {
      await refreshSession();
    }
    $("#result").hidden = false;
    $("#result").scrollIntoView({ behavior: "smooth" });
  } finally {
    $("#loading").hidden = true;
  }
}

async function refreshSession() {
  if (!membershipPreviewEnabled) {
    sessionState = { loggedIn: false, user: null, catalog: null };
    updateMemberExperience();
    return;
  }
  try {
    const response = await fetch("/api/auth/session");
    const data = await response.json();
    sessionState = data;
    updateMemberExperience();
  } catch {
    sessionState = { loggedIn: false, user: null, catalog: null };
    updateMemberExperience();
  }
}

async function startMemberGeneration() {
  if (!membershipPreviewEnabled) {
    throw new Error(lang === "zh" ? "会员生成入口当前已隐藏。" : "Member generation is temporarily hidden.");
  }
  $("#loading").hidden = false;
  $("#formMessage").textContent = "";
  try {
    const response = await fetch("/api/member/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pendingBody)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Request failed");
    activeTier = pendingTier;
    latest = data;
    render(data);
    if (sessionState.user && data.membership?.remainingCredits != null) {
      sessionState.user.creditsBalance = data.membership.remainingCredits;
      $("#formMessage").textContent = t("creditUsed", {
        count: String(data.membership.consumedCredits),
        remaining: String(data.membership.remainingCredits)
      });
      updateMemberExperience();
    } else {
      await refreshSession();
    }
    $("#result").hidden = false;
    $("#result").scrollIntoView({ behavior: "smooth" });
  } catch (error) {
    alert((lang === "zh" ? "生成失败：" : "Generation failed: ") + error.message);
  } finally {
    $("#loading").hidden = true;
  }
}

async function createPayPalOrderForTier(tier) {
  const body = collectFormBody(tier, true);
  pendingTier = tier;
  pendingBody = body;
  const response = await fetch("/api/paypal/create-order", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Unable to create PayPal order.");
  return data.id;
}

async function renderPayPalButtons() {
  const container = $("#paypalButtons");
  container.hidden = false;
  container.innerHTML = "";
  try {
    const paypal = await loadPayPalSdk();
    if (paypalButtonsInstance?.close) paypalButtonsInstance.close();
    paypalButtonsInstance = paypal.Buttons({
      style: { layout: "vertical", color: "gold", shape: "rect", label: "paypal" },
      createOrder: async () => createPayPalOrderForTier(pendingTier),
      onApprove: async data => {
        dialog.close();
        try {
          await capturePayPalOrder(data.orderID, pendingTier);
        } catch (error) {
          alert((lang === "zh" ? "支付后生成失败：" : "Generation failed after payment: ") + error.message);
        }
      },
      onCancel: () => {
        $("#paymentNote").textContent = lang === "zh" ? "你已取消 PayPal 支付，可再次点击完成购买。" : "You cancelled the PayPal checkout. You can try again when ready.";
      },
      onError: error => {
        alert((lang === "zh" ? "PayPal 支付失败：" : "PayPal checkout failed: ") + error.message);
      }
    });
    await paypalButtonsInstance.render("#paypalButtons");
  } catch (error) {
    container.hidden = true;
    $("#confirmPurchase").hidden = paypalConfig.enabled;
    $("#paymentNote").textContent = paypalConfig.enabled
      ? (lang === "zh" ? "PayPal 初始化失败，请刷新页面后重试，或检查浏览器是否拦截了 PayPal 脚本。" : "PayPal failed to initialize. Please refresh the page and make sure your browser is not blocking the PayPal script.")
      : (lang === "zh" ? "PayPal 未配置，当前显示演示流程。" : "PayPal is not configured, so the demo flow is shown.");
  }
}

async function renderInlinePayPalButtons() {
  if (inlinePayPalRendered) return;
  if (!$("#paypalInline")) return;
  const paypal = await loadPayPalSdk();
  $("#paypalInline").hidden = false;

  const renderOne = async (selector, tier) => {
    await paypal.Buttons({
      style: { layout: "vertical", color: "gold", shape: "rect", label: "paypal", tagline: false },
      createOrder: () => createPayPalOrderForTier(tier),
      onApprove: async data => {
        try {
          await capturePayPalOrder(data.orderID, tier);
        } catch (error) {
          alert((lang === "zh" ? "支付后生成失败：" : "Generation failed after payment: ") + error.message);
        }
      },
      onError: error => {
        alert((lang === "zh" ? "PayPal 支付失败：" : "PayPal checkout failed: ") + error.message);
      },
      onCancel: () => {
        $("#formMessage").textContent = lang === "zh" ? "你已取消 PayPal 支付，可重新发起付款。" : "You cancelled PayPal checkout. You can start again when ready.";
      }
    }).render(selector);
  };

  await renderOne("#paypalSimpleButton", "simple");
  await renderOne("#paypalCompleteButton", "complete");
  inlinePayPalRendered = true;
}

function renderHostedCheckoutLinks() {
  if (!$("#paypalInline")) return;
  if (!paypalConfig.enabled) {
    $("#paypalInline").hidden = true;
    return;
  }
  $("#paypalInline").hidden = false;
  bindHostedCheckoutLink("#hostedSimpleLink", "simple");
  bindHostedCheckoutLink("#hostedCompleteLink", "complete");
  inlinePayPalRendered = true;
}

async function restoreGuestOrderResultFromUrl() {
  const params = new URLSearchParams(window.location.search);
  const orderId = params.get("guestOrder");
  const token = params.get("token");
  if (!orderId || !token) return;
  try {
    const response = await fetch(`/api/guest-orders/result?order=${encodeURIComponent(orderId)}&token=${encodeURIComponent(token)}`);
    const data = await response.json();
    if (!response.ok) return;
    guestOrderMeta = {
      orderId: data.orderId,
      token,
      pdfUrl: data.pdfUrl || null
    };
    activeTier = data.tier;
    latest = data.result;
    render(data.result);
    $("#result").hidden = false;
    $("#formMessage").textContent = translations[lang].guestOrderRecovered;
    showGuestCheckoutNotice({
      orderId: data.orderId,
      successUrl: `/checkout-success.html?order=${encodeURIComponent(data.orderId)}&access=${encodeURIComponent(token)}`
    });
    $("#result").scrollIntoView({ behavior: "smooth" });
  } catch {
    // Ignore silently and leave the normal page flow intact.
  }
}

function renderZodiacProfile(culture, en) {
  const profile = culture?.zodiacProfile;
  if (!profile) return;
  const traits = en ? profile.personalityEn : profile.personality;
  const icons = ["志", "心", "行"];
  $("#profileTraits").innerHTML = traits.map((trait, index) => `<span><b>0${index + 1}</b><i aria-hidden="true">${icons[index % icons.length]}</i><em>${esc(trait)}</em></span>`).join("");
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
  $("#hourRange").textContent = en ? `${culture.hourBranch.range} · China time ${culture.chinaBirthLabel}` : `${culture.hourBranch.range} · 北京时间 ${culture.chinaBirthLabel}`;
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
  if (guestOrderMeta?.pdfUrl) {
    window.location.assign(guestOrderMeta.pdfUrl);
    return;
  }
  if (activeTier !== "complete") return;
  document.body.classList.add("printing");
  window.print();
  setTimeout(() => document.body.classList.remove("printing"), 500);
};

fetch("/api/paypal-config")
  .then(response => response.json())
  .then(config => {
    paypalConfig = { ...paypalConfig, ...config };
    if (paypalConfig.enabled) {
      renderHostedCheckoutLinks();
    }
    if (dialog.open) updatePaymentDialog();
  })
  .catch(() => {
    $("#paypalInline").hidden = true;
  });

applyLanguage();
refreshSession();
restoreGuestOrderResultFromUrl();
