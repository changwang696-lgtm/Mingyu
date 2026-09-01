const statusBanner = document.querySelector("#statusBanner");
const googleUnavailableNote = document.querySelector("#googleUnavailableNote");
const authGrid = document.querySelector("#authGrid");
const authModal = document.querySelector("#authModal");
const authModalBackdrop = document.querySelector("#authModalBackdrop");
const authModalClose = document.querySelector("#authModalClose");
const authOpenButtons = document.querySelectorAll("[data-open-auth]");
const dashboard = document.querySelector("#dashboard");
const registerForm = document.querySelector("#registerForm");
const loginForm = document.querySelector("#loginForm");
const registerHelp = document.querySelector("#registerHelp");
const registerVerificationBlock = document.querySelector("#registerVerificationBlock");
const registerVerificationCode = document.querySelector("#registerVerificationCode");
const registerChallengePrompt = document.querySelector("#registerChallengePrompt");
const registerChallengeAnswer = document.querySelector("#registerChallengeAnswer");
const registerChallengeRefreshBtn = document.querySelector("#registerChallengeRefreshBtn");
const registerSubmitBtn = document.querySelector("#registerSubmitBtn");
const resendRegisterCodeBtn = document.querySelector("#resendRegisterCodeBtn");
const registerGoogleBlock = document.querySelector("#registerGoogleBlock");
const registerGoogleButton = document.querySelector("#registerGoogleButton");
const registerPane = document.querySelector("#registerPane");
const registerTabBtn = document.querySelector("#registerTabBtn");
const loginChallengePrompt = document.querySelector("#loginChallengePrompt");
const loginChallengeAnswer = document.querySelector("#loginChallengeAnswer");
const loginChallengeRefreshBtn = document.querySelector("#loginChallengeRefreshBtn");
const loginSubmitBtn = loginForm?.querySelector('button[type="submit"]');
const loginGoogleBlock = document.querySelector("#loginGoogleBlock");
const loginGoogleButton = document.querySelector("#loginGoogleButton");
const loginPane = document.querySelector("#loginPane");
const loginTabBtn = document.querySelector("#loginTabBtn");
const logoutBtn = document.querySelector("#logoutBtn");
const memberName = document.querySelector("#memberName");
const memberEmail = document.querySelector("#memberEmail");
const memberCredits = document.querySelector("#memberCredits");
const memberPlan = document.querySelector("#memberPlan");
const memberRenewal = document.querySelector("#memberRenewal");
const ledgerList = document.querySelector("#ledgerList");
const reportList = document.querySelector("#reportList");
const memberOrderList = document.querySelector("#memberOrderList");
const serviceOrderList = document.querySelector("#serviceOrderList");
const planGrid = document.querySelector("#planGrid");
const paypalPurchaseNote = document.querySelector("#paypalPurchaseNote");
const welcomePolicyText = document.querySelector("#welcomePolicyText");
const nextPath = new URLSearchParams(window.location.search).get("next") || "/";
const requestedAuthTarget = getRequestedAuthTarget();
let sessionState = {
  loggedIn: false,
  user: null,
  catalog: null,
  googleAuth: { enabled: false, clientId: null }
};
let purchasePendingPlanId = null;
let payPalState = { enabled: false, mode: null };
let registerVerificationPending = false;
let registerVerificationMaskedEmail = "";
let registerCooldownUntil = 0;
let registerCooldownTimer = null;
let registerSubmitting = false;
let resendSubmitting = false;
let loginSubmitting = false;
let registerChallengeToken = "";
let loginChallengeToken = "";
let statusHideTimer = null;
let googleInitializedClientId = "";
let googleButtonsRendered = false;
let googleInitPromise = null;

const registerFieldLabels = {
  displayName: "Display name",
  email: "Email",
  password: "Password",
  verificationCode: "Email code"
};

const planDisplayMap = {
  starter: {
    title: "Starter Membership",
    description: "30 credits monthly for light usage"
  },
  studio: {
    title: "Studio Membership",
    description: "80 credits monthly for frequent usage"
  },
  "credit-pack-50": {
    title: "Credit Pack",
    description: "One-time 50-credit pack for flexible use"
  }
};

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[character]));
}

function safeDate(value) {
  if (!value) return "No date yet";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "No date yet" : date.toLocaleString();
}

function formatMoney(value, currency = "USD") {
  return `${currency} ${value}`;
}

function planDisplay(plan) {
  const titleZh = String(plan?.nameZh || "").trim();
  const titleEn = String(plan?.nameEn || plan?.name || "").trim();
  const descriptionZh = String(plan?.descriptionZh || "").trim();
  const descriptionEn = String(plan?.descriptionEn || "").trim();
  if (titleZh || titleEn || descriptionZh || descriptionEn) {
    return {
      title: titleEn || titleZh || "Membership",
      description: descriptionEn || descriptionZh || `${plan?.credits || 0} credits`
    };
  }
  return planDisplayMap[plan?.id] || {
    title: `${plan?.name || "Membership"}`,
    description: `${plan?.credits || 0} credits`
  };
}

function findCatalogPlan(planId) {
  return (sessionState.catalog?.plans || []).find(plan => plan.id === planId) || null;
}

function intervalLabel(interval) {
  return interval === "month"
    ? "Membership Plan"
    : "One-Time Purchase";
}

function formatPayPalMode(mode) {
  return mode === "live" ? "PayPal Live" : mode === "sandbox" ? "PayPal Sandbox" : "PayPal";
}

function formatOrderStatus(status) {
  const current = String(status || "").toLowerCase();
  if (current === "completed") return "Completed";
  if (current === "pending_payment") return "Pending Payment";
  if (current === "cancelled") return "Cancelled";
  if (current === "paid") return "Paid";
  return status ? `${status}` : "Processing";
}

function normalizeTier(tier) {
  return String(tier || "").toLowerCase() === "complete" ? "complete" : "simple";
}

function reportTierLabel(tier) {
  return normalizeTier(tier) === "complete" ? "Complete" : "Simple";
}

function reportTierDescription(tier) {
  return normalizeTier(tier) === "complete"
    ? "Full naming report"
    : "Names and zodiac";
}

function mergeSessionState(data = {}) {
  const nextGoogleAuth = data.googleAuth
    ? {
        enabled: Boolean(data.googleAuth?.enabled),
        clientId: String(data.googleAuth?.clientId || "").trim() || null
      }
    : sessionState.googleAuth || { enabled: false, clientId: null };
  sessionState = {
    ...sessionState,
    ...data,
    googleAuth: nextGoogleAuth
  };
  return sessionState;
}

function getGoogleButtonWidth(host) {
  const measuredWidth = Number(host?.clientWidth || 0);
  if (!measuredWidth) return 320;
  return Math.max(220, Math.min(380, Math.round(measuredWidth)));
}

function setGoogleBlocksVisible(visible) {
  if (registerGoogleBlock) registerGoogleBlock.hidden = !visible;
  if (loginGoogleBlock) loginGoogleBlock.hidden = !visible;
}

function setAuthTab(target) {
  const showRegister = target !== "login";
  if (registerPane) registerPane.hidden = !showRegister;
  if (loginPane) loginPane.hidden = showRegister;
  if (registerTabBtn) {
    registerTabBtn.classList.toggle("is-active", showRegister);
    registerTabBtn.setAttribute("aria-selected", showRegister ? "true" : "false");
  }
  if (loginTabBtn) {
    loginTabBtn.classList.toggle("is-active", !showRegister);
    loginTabBtn.setAttribute("aria-selected", showRegister ? "false" : "true");
  }
}

function getRequestedAuthTarget() {
  const params = new URLSearchParams(window.location.search);
  const authParam = String(params.get("auth") || "").trim().toLowerCase();
  if (authParam === "login" || authParam === "register") return authParam;
  const hash = String(window.location.hash || "").trim().toLowerCase();
  if (hash === "#loginform") return "login";
  if (hash === "#registerform") return "register";
  return "";
}

function clearRequestedAuthInUrl() {
  const url = new URL(window.location.href);
  let shouldReplace = false;
  if (url.searchParams.has("auth")) {
    url.searchParams.delete("auth");
    shouldReplace = true;
  }
  if (url.hash === "#loginForm" || url.hash === "#registerForm") {
    url.hash = "";
    shouldReplace = true;
  }
  if (shouldReplace) {
    history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }
}

function focusAuthField(target) {
  const field = target === "login"
    ? loginForm?.querySelector('input[name="email"]')
    : registerForm?.querySelector('input[name="displayName"], input[name="email"]');
  window.setTimeout(() => field?.focus(), 30);
}

function openAuthModal(target = "register", options = {}) {
  if (!authModal) return;
  setAuthTab(target);
  authModal.hidden = false;
  document.body.classList.add("auth-modal-open");
  if (options.focusField !== false) {
    focusAuthField(target);
  }
}

function closeAuthModal(options = {}) {
  if (!authModal || authModal.hidden) return;
  authModal.hidden = true;
  document.body.classList.remove("auth-modal-open");
  if (options.clearUrl !== false) {
    clearRequestedAuthInUrl();
  }
}

function isRestrictedGoogleBrowser() {
  const ua = String(window.navigator.userAgent || "").toLowerCase();
  return [
    "micromessenger",
    "qq/",
    "weibo",
    "alipayclient",
    "fbav",
    "fban",
    "instagram"
  ].some(token => ua.includes(token));
}

function setGoogleUnavailableNotice(visible, message = "") {
  if (!googleUnavailableNote) return;
  googleUnavailableNote.hidden = !visible;
  if (visible && message) {
    googleUnavailableNote.innerHTML = message;
  }
}

function wait(ms) {
  return new Promise(resolve => window.setTimeout(resolve, ms));
}

async function waitForGoogleIdentity(maxAttempts = 20) {
  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    if (window.google?.accounts?.id) return true;
    await wait(300);
  }
  return false;
}

function normalizeGoogleError(message) {
  const text = String(message || "").trim();
  if (!text) return "Google Sign-In failed. Please try again.";
  if (/not configured/i.test(text)) return "Google Sign-In is not configured yet.";
  if (/credential is required/i.test(text)) return "Google did not return a credential. Please try again.";
  if (/audience does not match/i.test(text)) return "The Google Client ID does not match this site.";
  if (/email is not verified/i.test(text)) return "Your Google email is not verified yet.";
  if (/valid email address/i.test(text)) return "Google did not return a valid email address.";
  if (/failed to load/i.test(text)) return "Google Sign-In failed to load. Please refresh and try again.";
  return text;
}

async function handleGoogleCredentialResponse(googleResponse) {
  const credential = String(googleResponse?.credential || "").trim();
  if (!credential) {
    showStatus("Google did not return a credential. Please try again.", true);
    return;
  }

  hideStatus();
  showStatus("Signing in with Google...");

  try {
    const response = await fetch("/api/auth/google", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Google Sign-In failed. Please try again.");
    renderSession({
      loggedIn: true,
      user: data.user,
      catalog: data.catalog,
      googleAuth: data.googleAuth
    });
    showStatus("Signed in with Google.", false, { autoHideMs: 2200 });
    await fetchOverview();
    redirectAfterAuth();
  } catch (error) {
    showStatus(normalizeGoogleError(error.message), true);
  }
}

function renderGoogleButtons() {
  if (!window.google?.accounts?.id) return;
  const hosts = [
    { node: registerGoogleButton, text: "signup_with" },
    { node: loginGoogleButton, text: "signin_with" }
  ];
  hosts.forEach(({ node, text }) => {
    if (!node) return;
    node.innerHTML = "";
    window.google.accounts.id.renderButton(node, {
      type: "standard",
      theme: "outline",
      shape: "rectangular",
      size: "large",
      text,
      logo_alignment: "left",
      width: getGoogleButtonWidth(node)
    });
  });
  googleButtonsRendered = true;
}

async function ensureGoogleAuthReady() {
  const googleAuth = sessionState.googleAuth || {};
  const clientId = String(googleAuth.clientId || "").trim();
  const enabled = Boolean(googleAuth.enabled && clientId);

  setGoogleBlocksVisible(enabled);
  if (!enabled) {
    setGoogleUnavailableNotice(false);
    return;
  }
  if (googleInitPromise) return googleInitPromise;

  googleInitPromise = (async () => {
    const ready = await waitForGoogleIdentity();
    if (!ready) throw new Error("Google Sign-In failed to load.");

    if (googleInitializedClientId !== clientId) {
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: handleGoogleCredentialResponse,
        auto_select: false,
        cancel_on_tap_outside: true
      });
      googleInitializedClientId = clientId;
      googleButtonsRendered = false;
    }

    if (!googleButtonsRendered) {
      renderGoogleButtons();
    }
    setGoogleUnavailableNotice(false);
  })()
    .catch(error => {
      setGoogleBlocksVisible(false);
      const restrictedHint = isRestrictedGoogleBrowser()
        ? "This browser may block Google services. Use email sign-in or open this page in your system browser."
        : "Google Sign-In is temporarily unavailable in this browser. Please use email sign-in for now.";
      setGoogleUnavailableNotice(true, restrictedHint);
      console.warn("Google Sign-In is unavailable on this page:", normalizeGoogleError(error.message));
    })
    .finally(() => {
      googleInitPromise = null;
    });

  return googleInitPromise;
}

function redirectAfterAuth() {
  if (!sessionStorage.getItem("mingyu_pending_service_intent")) return;
  const safePath = nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/";
  window.location.assign(safePath);
}

function showStatus(message, isError = false, options = {}) {
  const autoHideMs = Number(options?.autoHideMs || 0);
  if (statusHideTimer) {
    window.clearTimeout(statusHideTimer);
    statusHideTimer = null;
  }
  statusBanner.hidden = false;
  statusBanner.textContent = message;
  statusBanner.dataset.state = isError ? "error" : "success";
  statusBanner.style.animation = "none";
  void statusBanner.offsetWidth;
  statusBanner.style.animation = "";
  if (!isError && autoHideMs > 0) {
    statusHideTimer = window.setTimeout(() => {
      hideStatus();
    }, autoHideMs);
  }
}

function hideStatus() {
  if (statusHideTimer) {
    window.clearTimeout(statusHideTimer);
    statusHideTimer = null;
  }
  statusBanner.hidden = true;
  statusBanner.textContent = "";
  delete statusBanner.dataset.state;
}

function renderPayPalPurchaseNote() {
  if (!paypalPurchaseNote) return;
  if (!payPalState.mode) {
    paypalPurchaseNote.textContent = "Checking PayPal configuration...";
    return;
  }
  if (!payPalState.enabled) {
    paypalPurchaseNote.textContent = "PayPal is not configured yet, so purchase buttons stay disabled.";
    return;
  }
  paypalPurchaseNote.textContent = `${formatPayPalMode(payPalState.mode)} is connected. Selecting a plan will redirect to PayPal checkout.`;
}

function getAuthChallengeNodes(formName) {
  if (formName === "login") {
    return {
      token: loginChallengeToken,
      setToken(value) { loginChallengeToken = value; },
      prompt: loginChallengePrompt,
      answer: loginChallengeAnswer,
      refreshBtn: loginChallengeRefreshBtn
    };
  }
  return {
    token: registerChallengeToken,
    setToken(value) { registerChallengeToken = value; },
    prompt: registerChallengePrompt,
    answer: registerChallengeAnswer,
    refreshBtn: registerChallengeRefreshBtn
  };
}

function setAuthChallenge(formName, challenge, { clearAnswer = true } = {}) {
  const nodes = getAuthChallengeNodes(formName);
  nodes.setToken(String(challenge?.token || "").trim());
  if (nodes.prompt) {
    nodes.prompt.textContent = challenge?.prompt || "The question failed to load. Please refresh it.";
  }
  if (clearAnswer && nodes.answer) {
    nodes.answer.value = "";
  }
}

async function refreshAuthChallenge(formName, { focusAnswer = false } = {}) {
  const nodes = getAuthChallengeNodes(formName);
  if (nodes.prompt) nodes.prompt.textContent = "Loading...";
  nodes.setToken("");
  try {
    const response = await fetch("/api/auth/challenge");
    const data = await response.json();
    setAuthChallenge(formName, data?.authChallenge);
    if (focusAnswer && nodes.answer) nodes.answer.focus();
  } catch {
    setAuthChallenge(formName, null);
  }
}

function findRegisterField(fieldName) {
  return registerForm?.querySelector(`[name="${fieldName}"]`) || null;
}

function getRegisterFieldValue(fieldName) {
  return String(findRegisterField(fieldName)?.value || "").trim();
}

function showRegisterFieldError(fieldName, message) {
  const field = findRegisterField(fieldName);
  showStatus(message, true);
  if (field) field.focus();
  return false;
}

function findLoginField(fieldName) {
  return loginForm?.querySelector(`[name="${fieldName}"]`) || null;
}

function getLoginFieldValue(fieldName) {
  return String(findLoginField(fieldName)?.value || "").trim();
}

function showLoginFieldError(fieldName, message) {
  const field = findLoginField(fieldName);
  showStatus(message, true);
  if (field) field.focus();
  return false;
}

function normalizeAuthError(message) {
  const text = String(message || "").trim();
  if (!text) return "Request failed. Please try again.";
  if (/Too many login attempts/i.test(text)) {
    return "Too many login attempts. Please try again later.";
  }
  if (/Please complete the human verification question/i.test(text)) {
    return "Please complete the human verification question.";
  }
  if (/Please enter a numeric answer for the human verification question/i.test(text)) {
    return "The human verification answer must be a number.";
  }
  if (/human verification question has expired/i.test(text)) {
    return "The human verification question expired. A new one is ready for you.";
  }
  if (/human verification answer is incorrect/i.test(text)) {
    return "The human verification answer is incorrect. Please try again.";
  }
  return text;
}

function normalizeRegisterError(message) {
  const text = normalizeAuthError(message);
  if (!text) return "Registration failed. Please try again.";
  if (/already exists/i.test(text)) {
    return "This email already has an account. Please sign in or use another email.";
  }
  if (/A valid email address is required/i.test(text)) {
    return "Please enter a valid email address.";
  }
  if (/Password must be at least 8 characters/i.test(text)) {
    return "Your password must be at least 8 characters.";
  }
  if (/verification code has expired/i.test(text)) {
    return "The verification code expired. Please request a new one.";
  }
  if (/verification code was just sent/i.test(text) || /Please wait \d+ seconds/i.test(text)) {
    return "A code was just sent. Please wait a moment before trying again.";
  }
  if (/Too many incorrect verification attempts/i.test(text)) {
    return "Too many incorrect code attempts. Please request a new code.";
  }
  if (/Incorrect verification code/i.test(text)) {
    return text.replace("Incorrect verification code.", "The verification code is incorrect.");
  }
  if (/Failed to send verification email/i.test(text)) {
    return "We could not send the verification code. Please try again.";
  }
  return text;
}

function validateRegisterForm() {
  const email = getRegisterFieldValue("email");
  const password = getRegisterFieldValue("password");
  const verificationCode = getRegisterFieldValue("verificationCode");
  const challengeAnswer = String(registerChallengeAnswer?.value || "").trim();

  if (!email) return showRegisterFieldError("email", "Please enter your email address.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return showRegisterFieldError("email", "Please enter a valid email address.");
  }
  if (!password) return showRegisterFieldError("password", "Please enter a password.");
  if (password.length < 8) {
    return showRegisterFieldError("password", "Your password must be at least 8 characters.");
  }
  if (!registerChallengeToken) return showRegisterFieldError("challengeAnswer", "The human verification question is still loading. Please refresh it and try again.");
  if (!challengeAnswer) {
    showStatus("Please enter the answer to the human verification question.", true);
    registerChallengeAnswer?.focus();
    return false;
  }
  if (!/^-?\d+$/.test(challengeAnswer)) {
    showStatus("The human verification answer must be a number.", true);
    registerChallengeAnswer?.focus();
    return false;
  }
  if (registerVerificationPending) {
    if (!verificationCode) return showRegisterFieldError("verificationCode", "Please enter the email code to finish registration.");
    if (!/^\d{6}$/.test(verificationCode)) {
      return showRegisterFieldError("verificationCode", "The email code must contain 6 digits.");
    }
  }
  return true;
}

function normalizeLoginError(message) {
  const text = normalizeAuthError(message);
  if (/Incorrect email or password/i.test(text)) {
    return "The email or password is incorrect.";
  }
  if (/A valid email address is required/i.test(text)) {
    return "Please enter a valid email address.";
  }
  return text || "Sign-in failed. Please try again.";
}

function validateLoginForm() {
  const email = getLoginFieldValue("email");
  const password = getLoginFieldValue("password");
  const challengeAnswer = String(loginChallengeAnswer?.value || "").trim();

  if (!email) return showLoginFieldError("email", "Please enter your email.");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return showLoginFieldError("email", "Please enter a valid email address.");
  }
  if (!password) return showLoginFieldError("password", "Please enter your password.");
  if (!loginChallengeToken) {
    showStatus("The human verification question is still loading. Please refresh it and try again.", true);
    return false;
  }
  if (!challengeAnswer) {
    showStatus("Please enter the answer to the human verification question.", true);
    loginChallengeAnswer?.focus();
    return false;
  }
  if (!/^-?\d+$/.test(challengeAnswer)) {
    showStatus("The human verification answer must be a number.", true);
    loginChallengeAnswer?.focus();
    return false;
  }
  return true;
}

function updateRegisterActionUi() {
  if (registerSubmitBtn) {
    registerSubmitBtn.disabled = registerSubmitting;
    if (registerSubmitting) {
      registerSubmitBtn.textContent = registerVerificationPending ? "Verifying email..." : "Sending code...";
    } else {
      registerSubmitBtn.textContent = registerVerificationPending ? "Verify email and create account" : "Send email code";
    }
  }
  if (resendRegisterCodeBtn) {
    if (resendSubmitting) {
      resendRegisterCodeBtn.disabled = true;
      resendRegisterCodeBtn.textContent = "Resending...";
      return;
    }
  }
  if (registerChallengeRefreshBtn) {
    registerChallengeRefreshBtn.disabled = registerSubmitting || resendSubmitting;
  }
}

function updateLoginActionUi() {
  if (loginSubmitBtn) {
    loginSubmitBtn.disabled = loginSubmitting;
    loginSubmitBtn.textContent = loginSubmitting ? "Signing in..." : "Sign in";
  }
  if (loginChallengeRefreshBtn) {
    loginChallengeRefreshBtn.disabled = loginSubmitting;
  }
}

function stopRegisterCooldownTimer() {
  if (!registerCooldownTimer) return;
  window.clearInterval(registerCooldownTimer);
  registerCooldownTimer = null;
}

function updateRegisterCooldownUi() {
  if (!resendRegisterCodeBtn) return;
  if (!registerVerificationPending) {
    resendRegisterCodeBtn.disabled = true;
    resendRegisterCodeBtn.textContent = "Resend code";
    return;
  }
  const remainingSeconds = Math.max(0, Math.ceil((registerCooldownUntil - Date.now()) / 1000));
  resendRegisterCodeBtn.disabled = remainingSeconds > 0;
  resendRegisterCodeBtn.textContent = remainingSeconds > 0
    ? `Resend in ${remainingSeconds}s`
    : "Resend code";
  if (remainingSeconds <= 0) stopRegisterCooldownTimer();
}

function setRegisterVerificationMode(active, { maskedEmail = "", cooldownSeconds = 0 } = {}) {
  registerVerificationPending = active;
  if (!active) {
    registerVerificationMaskedEmail = "";
    registerCooldownUntil = 0;
    stopRegisterCooldownTimer();
    registerVerificationBlock.hidden = true;
    registerVerificationCode.required = false;
    registerVerificationCode.value = "";
    registerHelp.innerHTML = "A 6-digit email code will be sent automatically. Enter it to finish registration and sign in.";
    updateRegisterCooldownUi();
    updateRegisterActionUi();
    return;
  }

  registerVerificationMaskedEmail = maskedEmail || registerVerificationMaskedEmail;
  registerVerificationBlock.hidden = false;
  registerVerificationCode.required = true;
  registerHelp.innerHTML = registerVerificationMaskedEmail
    ? `The code was sent to ${escapeHtml(registerVerificationMaskedEmail)}. Please verify within 10 minutes.`
    : "The code has been sent. Enter the 6 digits from your email to finish registration.";
  registerCooldownUntil = cooldownSeconds > 0 ? Date.now() + cooldownSeconds * 1000 : 0;
  updateRegisterCooldownUi();
  updateRegisterActionUi();
  if (cooldownSeconds > 0) {
    stopRegisterCooldownTimer();
    registerCooldownTimer = window.setInterval(updateRegisterCooldownUi, 1000);
  }
  registerVerificationCode.focus();
}

function renderCatalog(catalog) {
  if (!catalog?.plans || !planGrid) return;
  if (welcomePolicyText) {
    const welcomeCredits = Math.max(0, Number.parseInt(catalog.welcomeCredits ?? 0, 10) || 0);
    welcomePolicyText.innerHTML = `New accounts receive ${welcomeCredits} welcome credits so you can try the member flow before purchasing a membership or a one-time credit pack.`;
  }
  planGrid.innerHTML = catalog.plans.map(plan => `
    <article class="plan-card">
      <small>${intervalLabel(plan.interval)}</small>
      <strong>${escapeHtml(planDisplay(plan).title)}</strong>
      <div>${escapeHtml(plan.price)}</div>
      <p>${escapeHtml(planDisplay(plan).description)}</p>
      <div class="item-meta">Includes ${plan.credits} credits</div>
      <button
        type="button"
        class="plan-purchase"
        data-plan-id="${escapeHtml(plan.id)}"
        ${!sessionState.loggedIn || purchasePendingPlanId === plan.id || !payPalState.enabled ? "disabled" : ""}
      >
        ${!sessionState.loggedIn
          ? "Sign in first"
          : !payPalState.enabled
            ? "PayPal unavailable"
            : purchasePendingPlanId === plan.id
              ? "Redirecting..."
              : "Pay with PayPal"}
      </button>
    </article>
  `).join("");
  renderPayPalPurchaseNote();
}

function renderLedger(entries) {
  if (!ledgerList) return;
  if (!entries?.length) {
    const welcomeCredits = Math.max(0, Number.parseInt(sessionState.catalog?.welcomeCredits ?? 0, 10) || 0);
    ledgerList.innerHTML = `<div class="empty-state">No credit activity yet. Your ${welcomeCredits} welcome credits and future purchases or usage will appear here.</div>`;
    return;
  }

  ledgerList.innerHTML = entries.map(entry => `
    <article class="ledger-item">
      <small>${new Date(entry.createdAt).toLocaleString()}</small>
      <strong>${entry.description}</strong>
      <div class="item-meta">${entry.creditsDelta > 0 ? "+" : ""}${entry.creditsDelta} credits · Balance ${entry.creditsBalanceAfter}</div>
    </article>
  `).join("");
}

function renderReports(reports) {
  if (!reportList) return;
  if (!reports?.length) {
    reportList.innerHTML = `<div class="empty-state">No report history yet. After generating with member credits, simple and complete reports will appear here.</div>`;
    return;
  }

  const simpleReports = reports.filter(report => normalizeTier(report.tier) === "simple");
  const completeReports = reports.filter(report => normalizeTier(report.tier) === "complete");

  const renderReportCards = items => items.map(report => {
    const previewNames = (Array.isArray(report.previewNames) ? report.previewNames : [])
      .map(escapeHtml)
      .join(" · ");
    const canDownloadPdf = normalizeTier(report.tier) === "complete" && report.pdfUrl;
    return `
      <article class="report-item">
        <small>${safeDate(report.createdAt)} · ${reportTierLabel(report.tier)}</small>
        <strong>${escapeHtml(report.inputName)}</strong>
        <div class="item-meta">${reportTierDescription(report.tier)}${report.zodiac ? ` · ${escapeHtml(report.zodiac)}` : ""}</div>
        <p>${previewNames || "Result ready. Use the links below to open the details."}</p>
        <div class="item-actions">
          <a class="text-link" href="${report.resultUrl}">Open Result</a>
          ${canDownloadPdf ? `<a class="text-link" href="${report.pdfUrl}">Download PDF</a>` : ""}
        </div>
      </article>
    `;
  }).join("");

  const renderReportSection = (title, desc, items, emptyText) => `
    <section class="report-section">
      <div class="report-section-head">
        <strong>${title}</strong>
        <span>${desc}</span>
      </div>
      ${items.length
        ? `<div class="report-list-inner">${renderReportCards(items)}</div>`
        : `<div class="empty-state">${emptyText}</div>`}
    </section>
  `;

  reportList.innerHTML = [
    renderReportSection("Simple", "Names and zodiac", simpleReports, "No simple report history yet."),
    renderReportSection("Complete", "Full naming result with PDF download", completeReports, "No complete report history yet.")
  ].join("");
}

function renderMemberOrders(orders) {
  if (!memberOrderList) return;
  if (!orders?.length) {
    memberOrderList.innerHTML = `<div class="empty-state">No membership or credit pack orders yet. Paid PayPal purchases will appear here.</div>`;
    return;
  }

  memberOrderList.innerHTML = orders.map(order => `
    <article class="report-item">
      <small>${safeDate(order.createdAt)} · ${escapeHtml(formatOrderStatus(order.status))}</small>
      <strong>${escapeHtml(planDisplay(findCatalogPlan(order.itemId) || { id: order.itemId || order.membershipPlanId || (order.itemType === "credit_pack" ? "credit-pack-50" : ""), name: order.itemName, credits: order.creditsDelta }).title)}</strong>
      <div class="item-meta">${formatMoney(order.amount, order.currency)} · +${order.creditsDelta} credits</div>
      <p>${order.status === "completed"
        ? (order.membershipRenewalAt ? `Renewal: ${new Date(order.membershipRenewalAt).toLocaleDateString()}` : "One-time credit purchase completed.")
        : "Waiting for PayPal confirmation."}</p>
    </article>
  `).join("");
}

function renderServiceOrders(orders) {
  if (!serviceOrderList) return;
  if (!orders?.length) {
    serviceOrderList.innerHTML = `<div class="empty-state">No one-time naming orders yet. Orders and PDF links from the homepage will appear here.</div>`;
    return;
  }

  serviceOrderList.innerHTML = orders.map(order => `
    <article class="report-item">
      <small>${safeDate(order.createdAt)} · ${escapeHtml(formatOrderStatus(order.status))} · Payment ${escapeHtml(order.paymentStatus || "pending")}</small>
      <strong>${escapeHtml(order.inputName || order.id)}</strong>
      <div class="item-meta">${escapeHtml(order.tier)} · ${formatMoney(order.paymentAmount || order.priceValue, order.paymentCurrency || "USD")}</div>
      <p>Order ID: ${escapeHtml(order.id)}</p>
      <div class="item-actions">
        ${order.deliveryUrl ? `<a class="text-link" href="${order.deliveryUrl}">Open Result</a>` : ""}
        ${order.pdfUrl ? `<a class="text-link" href="${order.pdfUrl}">Download PDF</a>` : ""}
        ${!order.deliveryUrl && order.successUrl ? `<a class="text-link" href="${order.successUrl}">Resume Payment</a>` : ""}
      </div>
    </article>
  `).join("");
}

function renderSession(data) {
  const nextState = mergeSessionState(data);
  renderCatalog(nextState.catalog);
  void ensureGoogleAuthReady();
  if (!nextState.loggedIn || !nextState.user) {
    authGrid.hidden = false;
    dashboard.hidden = true;
    return;
  }

  closeAuthModal({ clearUrl: true });
  authGrid.hidden = true;
  dashboard.hidden = false;
  memberName.textContent = nextState.user.displayName || "Member";
  memberEmail.textContent = nextState.user.email;
  memberCredits.textContent = String(nextState.user.creditsBalance);
  memberPlan.textContent = nextState.user.membership?.planName
    ? `${nextState.user.membership.planName}`
    : "No active membership";
  memberRenewal.innerHTML = nextState.user.membership?.renewalAt
    ? `Renewal date: ${new Date(nextState.user.membership.renewalAt).toLocaleDateString()}`
    : "No renewal is scheduled yet.";
}

async function fetchPayPalState() {
  const response = await fetch("/api/paypal-config");
  const data = await response.json();
  payPalState = {
    enabled: Boolean(data?.enabled),
    mode: data?.mode || "unavailable"
  };
  renderPayPalPurchaseNote();
  renderCatalog(sessionState.catalog);
  return payPalState;
}

async function fetchSession() {
  const response = await fetch("/api/auth/session");
  const data = await response.json();
  renderSession(data);
  return data;
}

async function fetchOverview() {
  const response = await fetch("/api/member/overview");
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Unable to load your member account right now.");
  renderSession({ loggedIn: true, user: data.user, catalog: data.catalog });
  renderLedger(data.ledger);
  renderReports(data.reports);
  renderMemberOrders(data.memberOrders);
  renderServiceOrders(data.serviceOrders);
  return data;
}

registerForm.addEventListener("submit", async event => {
  event.preventDefault();
  hideStatus();
  if (!validateRegisterForm()) return;
  const form = event.currentTarget;
  const formData = Object.fromEntries(new FormData(form));
  formData.challengeToken = registerChallengeToken;
  registerSubmitting = true;
  updateRegisterActionUi();
  showStatus(registerVerificationPending ? "Verifying email..." : "Sending email code...");

  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    const data = await response.json();
    if (data?.authChallenge) setAuthChallenge("register", data.authChallenge);
    if (!response.ok) {
      if (data.verificationRequired) {
        setRegisterVerificationMode(true, {
          maskedEmail: data.maskedEmail || maskEmail(formData.email || ""),
          cooldownSeconds: data.cooldownSeconds || 0
        });
      }
      throw new Error(normalizeRegisterError(data.error || "Registration failed. Please try again."));
    }

    if (data.verificationRequired) {
      setRegisterVerificationMode(true, {
        maskedEmail: data.maskedEmail || maskEmail(formData.email || ""),
        cooldownSeconds: data.cooldownSeconds || 0
      });
      showStatus("Verification code sent. Please check your inbox.", false, { autoHideMs: 2200 });
      return;
    }

    form.reset();
    setAuthChallenge("register", data?.authChallenge);
    setRegisterVerificationMode(false);
    closeAuthModal({ clearUrl: true });
    showStatus("Registration completed.", false, { autoHideMs: 2200 });
    await fetchOverview();
    redirectAfterAuth();
  } catch (error) {
    showStatus(normalizeRegisterError(error.message), true);
    await refreshAuthChallenge("register");
  } finally {
    registerSubmitting = false;
    updateRegisterActionUi();
  }
});

loginForm.addEventListener("submit", async event => {
  event.preventDefault();
  hideStatus();
  if (!validateLoginForm()) return;
  const form = event.currentTarget;
  const formData = Object.fromEntries(new FormData(form));
  formData.challengeToken = loginChallengeToken;
  loginSubmitting = true;
  updateLoginActionUi();
  showStatus("Signing in...");
  try {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    const data = await response.json();
    if (data?.authChallenge) setAuthChallenge("login", data.authChallenge);
    if (!response.ok) throw new Error(data.error || "Sign-in failed. Please try again.");
    form.reset();
    closeAuthModal({ clearUrl: true });
    showStatus("Signed in successfully.", false, { autoHideMs: 2200 });
    await fetchOverview();
    redirectAfterAuth();
  } catch (error) {
    showStatus(normalizeLoginError(error.message), true);
    await refreshAuthChallenge("login");
  } finally {
    loginSubmitting = false;
    updateLoginActionUi();
  }
});

logoutBtn.addEventListener("click", async () => {
  hideStatus();
  await fetch("/api/auth/logout", { method: "POST" });
  renderLedger([]);
  renderReports([]);
  renderMemberOrders([]);
  renderServiceOrders([]);
  await fetchSession();
  showStatus("Signed out.", false, { autoHideMs: 2200 });
});

resendRegisterCodeBtn.addEventListener("click", async () => {
  if (!registerVerificationPending) return;
  hideStatus();
  if (!registerChallengeToken) {
    showStatus("The human verification question is still loading. Please refresh it and try again.", true);
    return;
  }
  const challengeAnswer = String(registerChallengeAnswer?.value || "").trim();
  if (!challengeAnswer) {
    showStatus("Please answer the human verification question before resending the code.", true);
    registerChallengeAnswer?.focus();
    return;
  }
  const formData = Object.fromEntries(new FormData(registerForm));
  formData.challengeToken = registerChallengeToken;
  formData.verificationCode = "";
  resendSubmitting = true;
  updateRegisterActionUi();
  showStatus("Resending code...");
  try {
    const response = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    const data = await response.json();
    if (data?.authChallenge) setAuthChallenge("register", data.authChallenge);
    if (!response.ok) throw new Error(data.error || "Unable to resend the verification code. Please try again.");
    setRegisterVerificationMode(true, {
      maskedEmail: data.maskedEmail || registerVerificationMaskedEmail || maskEmail(formData.email || ""),
      cooldownSeconds: data.cooldownSeconds || 0
    });
    showStatus("Verification code resent.", false, { autoHideMs: 2200 });
  } catch (error) {
    showStatus(normalizeRegisterError(error.message), true);
    await refreshAuthChallenge("register");
  } finally {
    resendSubmitting = false;
    updateRegisterCooldownUi();
    updateRegisterActionUi();
  }
});

registerChallengeRefreshBtn?.addEventListener("click", () => {
  refreshAuthChallenge("register", { focusAnswer: true });
});

loginChallengeRefreshBtn?.addEventListener("click", () => {
  refreshAuthChallenge("login", { focusAnswer: true });
});

registerTabBtn?.addEventListener("click", () => {
  setAuthTab("register");
});

loginTabBtn?.addEventListener("click", () => {
  setAuthTab("login");
});

authOpenButtons.forEach(button => {
  button.addEventListener("click", () => {
    openAuthModal(button.dataset.openAuth || "register");
  });
});

authModalBackdrop?.addEventListener("click", () => {
  closeAuthModal();
});

authModalClose?.addEventListener("click", () => {
  closeAuthModal();
});

window.addEventListener("keydown", event => {
  if (event.key === "Escape" && !authModal?.hidden) {
    closeAuthModal();
  }
});

planGrid.addEventListener("click", async event => {
  const button = event.target.closest("[data-plan-id]");
  if (!button) return;
  if (!sessionState.loggedIn) {
    showStatus("Please sign in before purchasing.", true);
    return;
  }
  if (!payPalState.enabled) {
    showStatus("PayPal is not configured yet, so purchase is unavailable.", true);
    return;
  }

  const planId = String(button.dataset.planId || "");
  purchasePendingPlanId = planId;
  renderCatalog(sessionState.catalog);
  showStatus("Redirecting to PayPal...");

  try {
    const response = await fetch("/api/member/purchase/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Unable to start the purchase right now.");
    window.location.assign(data.approvalUrl);
  } catch (error) {
    purchasePendingPlanId = null;
    renderCatalog(sessionState.catalog);
    showStatus(error.message, true);
  }
});

async function handleReturnedMemberPurchase() {
  const params = new URLSearchParams(window.location.search);
  const memberOrderId = params.get("memberOrder");
  const payPalOrderId = params.get("token");
  const cancelled = params.get("cancelled") === "1";

  if (cancelled) {
    showStatus("PayPal checkout was cancelled.", true);
    history.replaceState({}, "", "/account.html");
    return;
  }
  if (!memberOrderId) return;

  showStatus("Confirming your PayPal payment...");
  const response = await fetch("/api/member/purchase/capture", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ memberOrderId, payPalOrderId })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Unable to confirm this PayPal payment right now.");

  showStatus("Purchase completed and credits added.", false, { autoHideMs: 2200 });
  history.replaceState({}, "", "/account.html");
  await fetchOverview();
}

Promise.allSettled([fetchPayPalState(), fetchSession()])
  .then(data => {
    setAuthTab(requestedAuthTarget || "register");
    setRegisterVerificationMode(false);
    updateRegisterActionUi();
    updateLoginActionUi();
    const sessionData = data[1]?.status === "fulfilled" ? data[1].value : null;
    setAuthChallenge("register", sessionData?.authChallenge);
    setAuthChallenge("login", sessionData?.authChallenge);
    if (sessionData?.loggedIn) {
      return fetchOverview().then(() => handleReturnedMemberPurchase());
    }
    if (requestedAuthTarget) {
      openAuthModal(requestedAuthTarget);
    }
    renderCatalog(sessionData?.catalog || sessionState.catalog);
    renderLedger([]);
    renderReports([]);
    renderMemberOrders([]);
    renderServiceOrders([]);
    return null;
  })
  .catch(error => {
    renderLedger([]);
    renderReports([]);
    renderMemberOrders([]);
    renderServiceOrders([]);
    setRegisterVerificationMode(false);
    updateRegisterActionUi();
    updateLoginActionUi();
    showStatus(error?.message || "Unable to load the member account right now.", true);
  });

function maskEmail(email) {
  const normalized = String(email || "").trim().toLowerCase();
  const [local, domain] = normalized.split("@");
  if (!local || !domain) return normalized;
  const visibleLength = Math.min(2, local.length);
  return `${local.slice(0, visibleLength)}${"*".repeat(Math.max(1, local.length - visibleLength))}@${domain}`;
}
