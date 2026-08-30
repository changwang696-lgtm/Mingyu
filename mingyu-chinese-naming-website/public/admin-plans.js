const defaultSettings = {
  welcomeCredits: 3,
  servicePricing: {
    simple: { value: "2.99", label: "Simple Edition" },
    complete: { value: "9.90", label: "Complete Edition" }
  }
};

const state = {
  plans: [],
  settings: normalizeSettings(defaultSettings)
};

function $(selector) {
  return document.querySelector(selector);
}

function showMessage(message, isError = false) {
  const node = $("#plansMessage");
  node.textContent = message || "";
  node.style.color = isError ? "#9e392b" : "#54463a";
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

function normalizePriceValue(value, fallback = "0.00") {
  const parsed = Number.parseFloat(String(value ?? "").trim());
  if (!Number.isFinite(parsed) || parsed < 0) return fallback;
  return parsed.toFixed(2);
}

function normalizeSettings(settings = {}) {
  return {
    welcomeCredits: Math.max(0, Number.parseInt(settings.welcomeCredits ?? defaultSettings.welcomeCredits, 10) || 0),
    servicePricing: {
      simple: {
        label: defaultSettings.servicePricing.simple.label,
        value: normalizePriceValue(settings.servicePricing?.simple?.value, defaultSettings.servicePricing.simple.value)
      },
      complete: {
        label: defaultSettings.servicePricing.complete.label,
        value: normalizePriceValue(settings.servicePricing?.complete?.value, defaultSettings.servicePricing.complete.value)
      }
    }
  };
}

async function ensureAdminSession() {
  const response = await fetch("/api/admin/session");
  const data = await response.json();
  if (!data.configured) {
    throw new Error("后台账号尚未配置，请先设置 ADMIN_USERNAME / ADMIN_PASSWORD / ADMIN_SESSION_SECRET。");
  }
  if (!data.authenticated) {
    window.location.href = "/admin-login.html";
    return null;
  }
  $("#adminSessionText").textContent = `已登录管理员：${data.username} · 当前套餐数 ${data.planCount || 0}`;
  return data;
}

function renderSettings(settings) {
  const grid = $("#settingsGrid");
  grid.innerHTML = `
    <section class="admin-config-card">
      <p class="admin-card-kicker">WELCOME CREDITS</p>
      <h3>新用户注册赠送</h3>
      <p class="admin-muted">注册成功后自动发放给新账户，可立即用于会员生成。</p>
      <label class="admin-field">
        <span>赠送 Credits 数量</span>
        <input id="welcomeCreditsInput" value="${escapeHtml(settings.welcomeCredits)}" inputmode="numeric" />
      </label>
    </section>

    <section class="admin-config-card">
      <p class="admin-card-kicker">SERVICE PRICING</p>
      <h3>两种 PDF / 起名结果价格</h3>
      <p class="admin-muted">首页购买按钮、支付弹窗、PayPal 下单金额都会读取这里的设置。</p>
      <div class="admin-inline-grid">
        <label class="admin-field">
          <span>简约版价格（USD）</span>
          <input id="simplePriceInput" value="${escapeHtml(settings.servicePricing.simple.value)}" inputmode="decimal" placeholder="2.99" />
        </label>
        <label class="admin-field">
          <span>完整版价格（USD）</span>
          <input id="completePriceInput" value="${escapeHtml(settings.servicePricing.complete.value)}" inputmode="decimal" placeholder="9.90" />
        </label>
      </div>
      <div class="admin-price-preview">
        <span>简约版 / ${escapeHtml(settings.servicePricing.simple.label)}：$${escapeHtml(settings.servicePricing.simple.value)}</span>
        <span>完整版 / ${escapeHtml(settings.servicePricing.complete.label)}：$${escapeHtml(settings.servicePricing.complete.value)}</span>
      </div>
    </section>
  `;
}

function renderPlans(plans) {
  const grid = $("#plansGrid");
  grid.innerHTML = plans.map(plan => `
    <section class="admin-plan-card" data-plan-id="${escapeHtml(plan.id)}">
      <div class="admin-section-head">
        <div>
          <p class="admin-card-kicker">PLAN ID · ${escapeHtml(plan.id)}</p>
          <h3>${escapeHtml(plan.nameZh)} / ${escapeHtml(plan.nameEn)}</h3>
          <p class="admin-muted">该 ID 用于购买与订单记录，建议保持不变；这里只编辑名称、价格、描述和 credits。</p>
        </div>
      </div>

      <div class="admin-field">
        <span>中文名称</span>
        <input name="nameZh" value="${escapeHtml(plan.nameZh)}" />
      </div>
      <div class="admin-field">
        <span>英文名称</span>
        <input name="nameEn" value="${escapeHtml(plan.nameEn)}" />
      </div>
      <div class="admin-field">
        <span>中文描述</span>
        <textarea name="descriptionZh">${escapeHtml(plan.descriptionZh)}</textarea>
      </div>
      <div class="admin-field">
        <span>英文描述</span>
        <textarea name="descriptionEn">${escapeHtml(plan.descriptionEn)}</textarea>
      </div>

      <div class="admin-inline-grid">
        <label class="admin-field">
          <span>展示价格</span>
          <input name="price" value="${escapeHtml(plan.price)}" placeholder="$19/month" />
        </label>
        <label class="admin-field">
          <span>PayPal 金额</span>
          <input name="payPalValue" value="${escapeHtml(plan.payPalValue)}" inputmode="decimal" placeholder="19.00" />
        </label>
      </div>

      <div class="admin-inline-grid">
        <label class="admin-field">
          <span>Credits 数量</span>
          <input name="credits" value="${escapeHtml(plan.credits)}" inputmode="numeric" />
        </label>
        <label class="admin-field">
          <span>排序</span>
          <input name="sortOrder" value="${escapeHtml(plan.sortOrder)}" inputmode="numeric" />
        </label>
      </div>

      <div class="admin-inline-grid">
        <label class="admin-field">
          <span>套餐类型</span>
          <select name="interval">
            <option value="month"${plan.interval === "month" ? " selected" : ""}>月度会员</option>
            <option value="one-time"${plan.interval === "one-time" ? " selected" : ""}>一次性点数包</option>
          </select>
        </label>
        <label class="admin-field">
          <span>启用状态</span>
          <select name="active">
            <option value="true"${plan.active ? " selected" : ""}>启用</option>
            <option value="false"${!plan.active ? " selected" : ""}>停用</option>
          </select>
        </label>
      </div>
    </section>
  `).join("");
}

function collectSettings() {
  return normalizeSettings({
    welcomeCredits: $("#welcomeCreditsInput").value.trim(),
    servicePricing: {
      simple: { value: $("#simplePriceInput").value.trim() },
      complete: { value: $("#completePriceInput").value.trim() }
    }
  });
}

function collectPlans() {
  return Array.from(document.querySelectorAll(".admin-plan-card")).map(card => ({
    id: card.dataset.planId,
    nameZh: card.querySelector('[name="nameZh"]').value.trim(),
    nameEn: card.querySelector('[name="nameEn"]').value.trim(),
    name: card.querySelector('[name="nameEn"]').value.trim(),
    descriptionZh: card.querySelector('[name="descriptionZh"]').value.trim(),
    descriptionEn: card.querySelector('[name="descriptionEn"]').value.trim(),
    price: card.querySelector('[name="price"]').value.trim(),
    payPalValue: card.querySelector('[name="payPalValue"]').value.trim(),
    credits: Number.parseInt(card.querySelector('[name="credits"]').value.trim(), 10) || 0,
    sortOrder: Number.parseInt(card.querySelector('[name="sortOrder"]').value.trim(), 10) || 0,
    interval: card.querySelector('[name="interval"]').value,
    active: card.querySelector('[name="active"]').value === "true"
  }));
}

async function loadPlans() {
  showMessage("正在读取会员套餐与价格配置...");
  const response = await fetch("/api/admin/member-plans");
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "读取会员套餐与价格配置失败。");
  state.plans = data.plans || [];
  state.settings = normalizeSettings(data.settings);
  renderSettings(state.settings);
  renderPlans(state.plans);
  $("#planStorageText").textContent = data.storage === "local_database_file"
    ? `当前配置保存在服务器本地数据库文件中：欢迎赠送 ${state.settings.welcomeCredits} credits，套餐 ${state.plans.length} 个。`
    : `当前配置已加载：欢迎赠送 ${state.settings.welcomeCredits} credits，套餐 ${state.plans.length} 个。`;
  showMessage(`已加载业务设置与 ${state.plans.length} 个会员套餐。${data.payPalEnabled ? " PayPal 已连接。" : " PayPal 当前未配置。"}`);
}

async function savePlans() {
  const plans = collectPlans();
  const settings = collectSettings();
  showMessage("正在保存业务设置与会员套餐配置...");
  const response = await fetch("/api/admin/member-plans", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plans, settings })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "保存业务设置失败。");
  state.plans = data.plans || [];
  state.settings = normalizeSettings(data.settings);
  renderSettings(state.settings);
  renderPlans(state.plans);
  showMessage(`已保存：新用户赠送 ${state.settings.welcomeCredits} credits，简约版 $${state.settings.servicePricing.simple.value}，完整版 $${state.settings.servicePricing.complete.value}，以及 ${state.plans.length} 个会员套餐。`);
}

$("#reloadPlansBtn").addEventListener("click", () => {
  loadPlans().catch(error => showMessage(error.message, true));
});

$("#savePlansBtn").addEventListener("click", () => {
  savePlans().catch(error => showMessage(error.message, true));
});

$("#adminLogoutBtn").addEventListener("click", async () => {
  await fetch("/api/admin/logout", { method: "POST" });
  window.location.href = "/admin-login.html";
});

Promise.resolve()
  .then(ensureAdminSession)
  .then(session => {
    if (!session) return null;
    return loadPlans();
  })
  .catch(error => showMessage(error.message, true));
