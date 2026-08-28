const state = {
  orders: [],
  selectedOrderId: ""
};

function $(selector) {
  return document.querySelector(selector);
}

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("zh-CN", { hour12: false });
}

function prettify(value) {
  return JSON.stringify(value || {}, null, 2);
}

function getFilters() {
  return {
    status: $("#statusFilter").value,
    emailStatus: $("#emailFilter").value,
    q: $("#searchInput").value.trim()
  };
}

async function ensureAdminSession() {
  const response = await fetch("/api/admin/session");
  const data = await response.json();
  if (!data.configured) {
    throw new Error("后台账号尚未配置，请先在 Render 环境变量中填写 ADMIN_USERNAME / ADMIN_PASSWORD / ADMIN_SESSION_SECRET。");
  }
  if (!data.authenticated) {
    window.location.href = "/admin-login.html";
    return null;
  }
  $("#adminSessionText").textContent = `已登录管理员：${data.username} · 邮件发送${data.emailEnabled ? "已启用" : "未启用"} · 套餐数 ${data.planCount || 0}`;
  return data;
}

function renderOrders() {
  const list = $("#ordersList");
  list.innerHTML = "";
  $("#ordersCount").textContent = String(state.orders.length);
  if (!state.orders.length) {
    list.innerHTML = "<div class=\"admin-empty\">当前筛选条件下没有订单。</div>";
    return;
  }

  state.orders.forEach(order => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = `admin-order-item${order.id === state.selectedOrderId ? " is-active" : ""}`;
    item.innerHTML = `
      <strong>${order.id}</strong>
      <span>${order.email}</span>
      <span>${order.inputName || "-"}</span>
      <span>${order.tier === "simple" ? "简约版" : "完整版"} · $${order.priceValue}</span>
      <span>订单状态：${order.status}</span>
      <span>邮件状态：${order.emailDeliveryStatus || "pending"}</span>
      <small>${formatDateTime(order.createdAt)}</small>
    `;
    item.addEventListener("click", () => {
      state.selectedOrderId = order.id;
      renderOrders();
      loadOrderDetail(order.id).catch(showMessage);
    });
    list.appendChild(item);
  });
}

function renderOrderDetail(order) {
  $("#orderDetailEmpty").hidden = true;
  $("#orderDetailBox").hidden = false;
  $("#resendMailBtn").disabled = !order.hasResult;
  $("#resendMailBtn").dataset.orderId = order.id;
  $("#orderDetailMeta").innerHTML = [
    ["订单号", order.id],
    ["邮箱", order.email],
    ["宝宝姓名", order.inputName || "-"],
    ["版本", order.tier === "simple" ? "简约版" : "完整版"],
    ["订单状态", order.status],
    ["邮件状态", order.emailDeliveryStatus || "pending"],
    ["下单时间", formatDateTime(order.createdAt)],
    ["完成时间", formatDateTime(order.fulfilledAt)],
    ["付款确认", formatDateTime(order.paymentConfirmedAt)],
    ["邮件发送", formatDateTime(order.emailSentAt)]
  ].map(([label, value]) => `
    <div class="admin-detail-card">
      <small>${label}</small>
      <strong>${value || "-"}</strong>
    </div>
  `).join("");

  const linkItems = [];
  if (order.successUrl) linkItems.push(`<a class="admin-link" href="${order.successUrl}" target="_blank" rel="noreferrer">打开支付完成页</a>`);
  if (order.deliveryUrl) linkItems.push(`<a class="admin-link" href="${order.deliveryUrl}" target="_blank" rel="noreferrer">打开结果页</a>`);
  if (order.emailDeliveryError) linkItems.push(`<span class="admin-error-text">邮件错误：${order.emailDeliveryError}</span>`);
  $("#orderDetailLinks").innerHTML = linkItems.join("");
  $("#orderFormBody").textContent = prettify(order.formBody);
  $("#orderResultBody").textContent = order.result ? prettify({
    names: order.result.names,
    summary: order.result.summary,
    zodiac: order.result.zodiac
  }) : "该订单还没有生成结果。";
}

function showMessage(message) {
  $("#ordersMessage").textContent = message || "";
}

async function loadOrders() {
  showMessage("正在读取游客订单清单...");
  const params = new URLSearchParams(getFilters());
  const response = await fetch(`/api/admin/guest-orders?${params.toString()}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "读取订单清单失败。");
  state.orders = data.orders || [];
  if (state.selectedOrderId && !state.orders.some(order => order.id === state.selectedOrderId)) {
    state.selectedOrderId = "";
  }
  renderOrders();
  showMessage(`已加载 ${state.orders.length} 条游客订单。`);
  if (state.selectedOrderId) {
    await loadOrderDetail(state.selectedOrderId);
  }
}

async function loadOrderDetail(orderId) {
  const response = await fetch(`/api/admin/guest-orders/detail?order=${encodeURIComponent(orderId)}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "读取订单详情失败。");
  renderOrderDetail(data.order);
}

async function resendOrderEmail(orderId) {
  showMessage("正在补发游客结果邮件...");
  const response = await fetch("/api/admin/guest-orders/send-email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ orderId, force: true })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "补发邮件失败。");
  showMessage(`邮件已发送到 ${data.order.email}`);
  await loadOrders();
  await loadOrderDetail(orderId);
}

$("#refreshOrdersBtn").addEventListener("click", () => {
  loadOrders().catch(showMessage);
});

$("#statusFilter").addEventListener("change", () => {
  loadOrders().catch(showMessage);
});

$("#emailFilter").addEventListener("change", () => {
  loadOrders().catch(showMessage);
});

$("#searchInput").addEventListener("keydown", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    loadOrders().catch(showMessage);
  }
});

$("#resendMailBtn").addEventListener("click", () => {
  const orderId = $("#resendMailBtn").dataset.orderId;
  if (!orderId) return;
  resendOrderEmail(orderId).catch(showMessage);
});

$("#adminLogoutBtn").addEventListener("click", async () => {
  await fetch("/api/admin/logout", { method: "POST" });
  window.location.href = "/admin-login.html";
});

Promise.resolve()
  .then(ensureAdminSession)
  .then(session => {
    if (!session) return;
    return loadOrders();
  })
  .catch(showMessage);
