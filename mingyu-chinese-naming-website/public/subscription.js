const translations = {
  en: {
    navNaming: "Naming",
    navSubscribe: "Subscribe",
    navCraft: "Crafts",
    navSamples: "Samples",
    accountGuest: "Sign in",
    accountMember: "My account",
    heroEyebrow: "MINGYU MEMBERSHIP",
    heroTitle: "Subscribe first, then create names with member credits.",
    heroBody: "Choose a plan that fits how often you need Chinese naming reports. New visitors create an account first, then return here to complete PayPal checkout securely.",
    heroCta: "View Plans",
    registerCta: "Create Account",
    flowEyebrow: "PURCHASE FLOW",
    flowTitle: "Visitors register first, then buy a package.",
    step1Title: "Choose a package",
    step1Body: "Compare credits, price, and usage style before committing.",
    step2Title: "Create your account",
    step2Body: "If you are not signed in, we guide you to register and bring you back here.",
    step3Title: "Pay securely",
    step3Body: "Signed-in members continue to PayPal, then credits are added automatically.",
    plansEyebrow: "SUBSCRIPTION PACKAGES",
    plansTitle: "Choose from three packages.",
    loading: "Loading member status...",
    guestHint: "You are browsing as a visitor. Pick a package and we will guide you to registration first.",
    memberHint: "Signed in as {name}. Choose a package to continue to PayPal checkout.",
    paypalUnavailable: "PayPal is not configured yet. Purchase buttons are temporarily unavailable.",
    signInFirst: "Register to buy",
    buyNow: "Pay with PayPal",
    redirecting: "Redirecting...",
    credits: "{count} credits included",
    month: "Monthly subscription",
    oneTime: "One-time credit pack",
    selectedAfterAuth: "You are signed in now. Continue with {plan} when you are ready.",
    registeringForPlan: "Create your account first. We will bring you back to buy {plan}.",
    purchaseError: "Unable to start checkout. Please try again.",
    noteEyebrow: "MEMBER BENEFITS",
    noteTitle: "Your credits stay connected to your account.",
    noteBody: "After purchase, use credits on the homepage to generate simple DNA cards or complete naming reports. Your history, orders, and downloads stay available in the member center.",
    accountCta: "Open Member Center"
  },
  zh: {
    navNaming: "起名",
    navSubscribe: "订阅",
    navCraft: "东方好物",
    navSamples: "样品",
    accountGuest: "注册 / 登录",
    accountMember: "会员中心",
    heroEyebrow: "名屿会员",
    heroTitle: "先订阅套餐，再用会员 credits 生成名字。",
    heroBody: "根据你的使用频率选择套餐。游客点击套餐后会先进入注册流程，注册或登录成功后回到这里继续安全购买。",
    heroCta: "查看套餐",
    registerCta: "立即注册",
    flowEyebrow: "购买流程",
    flowTitle: "游客先注册，再购买套餐。",
    step1Title: "选择套餐",
    step1Body: "先比较 credits、价格和适合的使用方式。",
    step2Title: "注册或登录",
    step2Body: "未登录时会引导你创建账号，并在完成后回到订阅页。",
    step3Title: "安全付款",
    step3Body: "已登录会员可进入 PayPal 支付，完成后 credits 自动入账。",
    plansEyebrow: "订阅套餐",
    plansTitle: "三种套餐，按需选择。",
    loading: "正在读取会员状态...",
    guestHint: "你当前是游客。选择套餐后，我们会先引导你注册账号。",
    memberHint: "已登录为 {name}。选择套餐后可继续前往 PayPal 付款。",
    paypalUnavailable: "PayPal 暂未配置，套餐购买按钮暂不可用。",
    signInFirst: "注册后购买",
    buyNow: "PayPal 购买",
    redirecting: "正在跳转...",
    credits: "包含 {count} credits",
    month: "月度订阅套餐",
    oneTime: "一次性点数包",
    selectedAfterAuth: "你已登录，可以继续购买 {plan}。",
    registeringForPlan: "先创建账号，完成后会回到这里购买 {plan}。",
    purchaseError: "暂时无法发起付款，请稍后重试。",
    noteEyebrow: "会员权益",
    noteTitle: "你的 credits 会绑定在会员账号下。",
    noteBody: "购买后可在首页使用 credits 生成 DNA 名片或完整起名报告。历史记录、订单和下载入口都会保存在会员中心。",
    accountCta: "打开会员中心"
  }
};

const planDisplayMap = {
  starter: {
    featured: false,
    en: {
      title: "Starter Membership",
      description: "Best for trying a few complete naming reports each month.",
      features: ["Monthly member credits", "Saved report history", "Use credits on the homepage"]
    },
    zh: {
      title: "入门会员",
      description: "适合每月少量生成完整起名报告。",
      features: ["每月发放会员 credits", "保存报告历史", "可在首页直接使用 credits"]
    }
  },
  studio: {
    featured: true,
    en: {
      title: "Studio Membership",
      description: "Best for frequent use, client work, or repeated naming exploration.",
      features: ["Higher monthly credit allowance", "Saved orders and reports", "Suitable for repeated naming sessions"]
    },
    zh: {
      title: "工作室会员",
      description: "适合高频使用、客户服务或多次起名探索。",
      features: ["更高月度 credits 额度", "保存订单和报告", "适合持续生成多个方案"]
    }
  },
  "credit-pack-50": {
    featured: false,
    en: {
      title: "Credit Pack",
      description: "A flexible one-time pack when you do not need a monthly subscription.",
      features: ["One-time purchase", "Credits added after PayPal payment", "Use whenever you need a report"]
    },
    zh: {
      title: "点数包",
      description: "不想订阅月费时，可以按需购买的一次性 credits。",
      features: ["一次性购买", "PayPal 付款后入账", "需要报告时随时使用"]
    }
  }
};

const selectedPlanKey = "mingyu_selected_subscription_plan";
const pendingIntentKey = "mingyu_pending_service_intent";
const subscriptionPath = "/subscription.html";

let lang = "en";
let sessionState = { loggedIn: false, user: null, catalog: null };
let payPalState = { enabled: false, mode: null };
let pendingPlanId = "";

function $(selector) {
  return document.querySelector(selector);
}

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[character]));
}

function t(key, replacements = {}) {
  const template = translations[lang][key] || "";
  return Object.entries(replacements).reduce((value, [token, replacement]) => value.replaceAll(`{${token}}`, replacement), template);
}

function getPlanCopy(plan) {
  const mapped = planDisplayMap[plan?.id]?.[lang] || {};
  const title = lang === "zh"
    ? String(plan?.nameZh || mapped.title || plan?.name || "").trim()
    : String(plan?.nameEn || mapped.title || plan?.name || "").trim();
  const description = lang === "zh"
    ? String(plan?.descriptionZh || mapped.description || "").trim()
    : String(plan?.descriptionEn || mapped.description || "").trim();
  return {
    title: title || "Membership",
    description: description || `${plan?.credits || 0} credits`,
    features: mapped.features || []
  };
}

function intervalLabel(plan) {
  return plan?.interval === "month" ? t("month") : t("oneTime");
}

function setStatus(message, state = "") {
  const statusLine = $("#statusLine");
  if (!statusLine) return;
  statusLine.textContent = message || "";
  statusLine.dataset.state = state;
}

function updateStaticLanguage() {
  document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  document.querySelectorAll("[data-i18n]").forEach(element => {
    const value = translations[lang][element.dataset.i18n];
    if (value) element.textContent = value;
  });
  $("#langBtn").textContent = lang === "zh" ? "EN" : "中文";
  const accountLink = $("#accountLink");
  if (accountLink) {
    accountLink.textContent = sessionState.loggedIn ? t("accountMember") : t("accountGuest");
    accountLink.href = sessionState.loggedIn ? "/account.html" : `/account.html?auth=login&next=${encodeURIComponent(subscriptionPath)}`;
  }
}

function renderHint() {
  const hint = $("#sessionHint");
  if (!hint) return;
  if (payPalState.enabled === false && sessionState.loggedIn) {
    hint.textContent = t("paypalUnavailable");
    return;
  }
  if (sessionState.loggedIn) {
    hint.textContent = t("memberHint", {
      name: sessionState.user?.displayName || sessionState.user?.email || "Member"
    });
    return;
  }
  hint.textContent = t("guestHint");
}

function renderPlans() {
  const grid = $("#subscriptionPlanGrid");
  const plans = sessionState.catalog?.plans || [];
  if (!grid) return;
  if (!plans.length) {
    grid.innerHTML = `<article class="subscription-plan-card"><h3>${lang === "zh" ? "暂无可购买套餐" : "No plans available"}</h3></article>`;
    return;
  }
  const selectedPlanId = sessionStorage.getItem(selectedPlanKey) || "";
  grid.innerHTML = plans.map(plan => {
    const copy = getPlanCopy(plan);
    const meta = planDisplayMap[plan.id] || {};
    const isSelected = selectedPlanId === plan.id;
    const actionText = pendingPlanId === plan.id
      ? t("redirecting")
      : sessionState.loggedIn
        ? t("buyNow")
        : t("signInFirst");
    const disabled = sessionState.loggedIn && (!payPalState.enabled || pendingPlanId === plan.id);
    return `
      <article class="subscription-plan-card ${meta.featured ? "featured" : ""} ${isSelected ? "is-selected" : ""}" data-plan-card="${escapeHtml(plan.id)}">
        <small>${escapeHtml(intervalLabel(plan))}</small>
        <h3>${escapeHtml(copy.title)}</h3>
        <p class="plan-price">${escapeHtml(plan.price || "")}</p>
        <p class="plan-description">${escapeHtml(copy.description)}</p>
        <ul class="plan-feature-list">
          <li>${escapeHtml(t("credits", { count: plan.credits || 0 }))}</li>
          ${copy.features.map(feature => `<li>${escapeHtml(feature)}</li>`).join("")}
        </ul>
        <button class="plan-action" type="button" data-plan-id="${escapeHtml(plan.id)}" ${disabled ? "disabled" : ""}>${escapeHtml(actionText)}</button>
        <p class="plan-footnote">${escapeHtml(sessionState.loggedIn ? t("step3Body") : t("step2Body"))}</p>
      </article>
    `;
  }).join("");
}

function renderPage() {
  updateStaticLanguage();
  renderHint();
  renderPlans();
}

function redirectToRegister(plan) {
  const copy = getPlanCopy(plan);
  sessionStorage.setItem(pendingIntentKey, "subscription");
  sessionStorage.setItem(selectedPlanKey, plan.id);
  setStatus(t("registeringForPlan", { plan: copy.title }), "success");
  window.location.assign(`/account.html?auth=register&next=${encodeURIComponent(subscriptionPath)}`);
}

async function startPurchase(plan) {
  if (!payPalState.enabled) {
    setStatus(t("paypalUnavailable"));
    return;
  }
  pendingPlanId = plan.id;
  renderPlans();
  setStatus(t("redirecting"), "success");
  try {
    const response = await fetch("/api/member/purchase/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId: plan.id })
    });
    const data = await response.json();
    if (response.status === 401) {
      redirectToRegister(plan);
      return;
    }
    if (!response.ok) throw new Error(data.error || t("purchaseError"));
    sessionStorage.removeItem(selectedPlanKey);
    sessionStorage.removeItem(pendingIntentKey);
    window.location.assign(data.approvalUrl);
  } catch (error) {
    pendingPlanId = "";
    renderPlans();
    setStatus(error.message || t("purchaseError"));
  }
}

function handlePlanClick(event) {
  const button = event.target.closest("[data-plan-id]");
  if (!button) return;
  const plan = (sessionState.catalog?.plans || []).find(item => item.id === button.dataset.planId);
  if (!plan) return;
  if (!sessionState.loggedIn) {
    redirectToRegister(plan);
    return;
  }
  void startPurchase(plan);
}

async function loadState() {
  const [sessionResult, paypalResult] = await Promise.allSettled([
    fetch("/api/auth/session").then(response => response.json()),
    fetch("/api/paypal-config").then(response => response.json())
  ]);

  if (sessionResult.status === "fulfilled") {
    sessionState = {
      loggedIn: Boolean(sessionResult.value?.loggedIn),
      user: sessionResult.value?.user || null,
      catalog: sessionResult.value?.catalog || null
    };
  }
  if (paypalResult.status === "fulfilled") {
    payPalState = {
      enabled: Boolean(paypalResult.value?.enabled),
      mode: paypalResult.value?.mode || null
    };
  }
  renderPage();

  const selectedPlanId = sessionStorage.getItem(selectedPlanKey);
  const selectedPlan = (sessionState.catalog?.plans || []).find(plan => plan.id === selectedPlanId);
  if (sessionState.loggedIn && selectedPlan) {
    setStatus(t("selectedAfterAuth", { plan: getPlanCopy(selectedPlan).title }), "success");
    Array.from(document.querySelectorAll("[data-plan-card]"))
      .find(card => card.dataset.planCard === selectedPlan.id)
      ?.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

document.querySelectorAll("[data-auth-entry]").forEach(link => {
  link.addEventListener("click", () => {
    sessionStorage.setItem(pendingIntentKey, "subscription");
  });
});

$("#subscriptionPlanGrid")?.addEventListener("click", handlePlanClick);
$("#langBtn")?.addEventListener("click", () => {
  lang = lang === "zh" ? "en" : "zh";
  renderPage();
});

loadState().catch(error => {
  renderPage();
  setStatus(error.message || (lang === "zh" ? "订阅页加载失败，请稍后重试。" : "Unable to load subscriptions. Please try again."));
});
