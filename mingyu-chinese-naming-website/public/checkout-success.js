const guestCheckoutKey = "mingyu_guest_checkout";
const params = new URLSearchParams(window.location.search);
let autoUnlockStarted = false;

function getStoredOrder() {
  try {
    return JSON.parse(localStorage.getItem(guestCheckoutKey) || "null");
  } catch {
    return null;
  }
}

function setStatus(message) {
  document.querySelector("#statusBox").textContent = message;
}

function setMessage(message) {
  document.querySelector("#messageBox").textContent = message;
}

function setMeta(order) {
  document.querySelector("#orderIdValue").textContent = order.orderId || "-";
  document.querySelector("#emailValue").textContent = order.email || "-";
  document.querySelector("#tierValue").textContent = order.tier === "simple" ? "Simple Edition · $2.99" : "Complete Edition · $9.90";
  document.querySelector("#statusValue").textContent = order.status || "-";
  if (order.deliveryUrl) {
    const link = document.querySelector("#viewResultLink");
    link.href = order.deliveryUrl;
    link.hidden = order.status !== "fulfilled";
  }
  const pdfLink = document.querySelector("#downloadPdfLink");
  if (pdfLink) {
    pdfLink.href = order.pdfUrl || "#";
    pdfLink.hidden = !order.pdfUrl;
  }
}

function persistCurrentOrder(order) {
  if (!order?.orderId || !order?.accessToken) return;
  localStorage.setItem(guestCheckoutKey, JSON.stringify({
    orderId: order.orderId,
    accessToken: order.accessToken,
    createdAt: Date.now()
  }));
}

function resolveCurrentOrder() {
  const stored = getStoredOrder();
  const orderId = params.get("order") || stored?.orderId || "";
  const accessToken = params.get("access") || stored?.accessToken || "";
  const payPalOrderId = params.get("token") || "";
  const cancelled = params.get("cancelled") === "1";
  return { orderId, token: accessToken, payPalOrderId, cancelled };
}

async function loadStatus() {
  const current = resolveCurrentOrder();
  if (!current.orderId || !current.token) {
    setStatus("没有找到当前订单。你可以前往“找回我的订单”页面恢复。");
    document.querySelector("#unlockBtn").disabled = true;
    return null;
  }
  const response = await fetch(`/api/guest-orders/status?order=${encodeURIComponent(current.orderId)}&token=${encodeURIComponent(current.token)}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "无法读取订单状态。");
  const order = {
    ...current,
    ...data,
    deliveryUrl: `/?guestOrder=${encodeURIComponent(current.orderId)}&token=${encodeURIComponent(current.token)}`
  };
  persistCurrentOrder({ orderId: current.orderId, accessToken: current.token });
  setMeta(order);
  setStatus(order.hasResult
    ? "该订单的结果已经保存。你可以直接重新打开结果。"
    : "订单已记录。系统将自动为你恢复并保存结果。");
  return order;
}

async function fulfillCurrentOrder({ auto = false } = {}) {
  const current = resolveCurrentOrder();
  if (!current.orderId || !current.token) {
    setMessage("当前没有可用订单，请先返回首页重新发起付款。");
    return;
  }
  setMessage(auto ? "正在自动恢复并保存结果..." : "正在为你恢复并保存结果...");
  setStatus(auto ? "已检测到当前订单，正在生成并保存结果..." : "正在处理你的订单，请稍候...");
  document.querySelector("#unlockBtn").disabled = true;
  try {
    const response = await fetch("/api/guest-orders/fulfill", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: current.orderId, token: current.token, paypalOrderId: current.payPalOrderId || null })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "解锁结果失败。");
    persistCurrentOrder({ orderId: current.orderId, accessToken: current.token });
    setStatus("结果已经保存，正在为你打开结果页...");
    setMessage("订单处理完成，正在跳转...");
    window.location.href = data.deliveryUrl;
  } catch (error) {
    setMessage(error.message);
    document.querySelector("#unlockBtn").disabled = false;
  }
}

document.querySelector("#unlockBtn").addEventListener("click", async () => {
  await fulfillCurrentOrder({ auto: false });
});

document.querySelector("#copyOrderBtn").addEventListener("click", async () => {
  const orderId = document.querySelector("#orderIdValue").textContent.trim();
  if (!orderId || orderId === "-") {
    setMessage("当前还没有可复制的订单号。");
    return;
  }
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(orderId);
    } else {
      const input = document.createElement("input");
      input.value = orderId;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
    }
    setMessage("订单号已复制。");
  } catch {
    setMessage("复制失败，请手动记录订单号。");
  }
});

async function initializeSuccessPage() {
  try {
    const order = await loadStatus();
    const current = resolveCurrentOrder();
    if (current.cancelled) {
      setStatus("你已取消 PayPal 付款。订单仍然保留，你可以稍后重新发起支付。");
      setMessage("如需继续，可返回首页重新发起，或保留订单号稍后找回。");
      return;
    }
    if (!order || order.hasResult || autoUnlockStarted) return;
    autoUnlockStarted = true;
    await fulfillCurrentOrder({ auto: true });
  } catch (error) {
    setStatus(error.message);
  }
}

initializeSuccessPage();
