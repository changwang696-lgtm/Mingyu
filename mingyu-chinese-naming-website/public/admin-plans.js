const state = {
  plans: []
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

function renderPlans(plans) {
  const grid = $("#plansGrid");
  grid.innerHTML = plans.map(plan => `
    <section class="admin-plan-card" data-plan-id="${escapeHtml(plan.id)}">
      <div class="admin-list-header">
        <div>
          <h2>${escapeHtml(plan.id)}</h2>
          <p class="admin-muted">该 ID 用于购买与订单记录，建议保持不变。</p>
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
  showMessage("正在读取会员套餐配置...");
  const response = await fetch("/api/admin/member-plans");
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "读取会员套餐失败。");
  state.plans = data.plans || [];
  renderPlans(state.plans);
  $("#planStorageText").textContent = data.storage === "local_database_file"
    ? `当前套餐保存在服务器本地数据库文件中，共 ${state.plans.length} 个套餐。`
    : `当前套餐已加载，共 ${state.plans.length} 个套餐。`;
  showMessage(`已加载 ${state.plans.length} 个会员套餐。${data.payPalEnabled ? " PayPal 已连接。" : " PayPal 当前未配置。"}`);
}

async function savePlans() {
  const plans = collectPlans();
  showMessage("正在保存会员套餐配置...");
  const response = await fetch("/api/admin/member-plans", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plans })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "保存会员套餐失败。");
  state.plans = data.plans || [];
  renderPlans(state.plans);
  showMessage(`已保存 ${state.plans.length} 个会员套餐，会员中心刷新后会读取新配置。`);
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
