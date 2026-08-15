const guestCheckoutKey = "mingyu_guest_checkout";
const params = new URLSearchParams(window.location.search);

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
}

function resolveCurrentOrder() {
  const stored = getStoredOrder();
  const orderId = params.get("order") || stored?.orderId || "";
  const token = params.get("token") || stored?.accessToken || "";
  return { orderId, token };
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
  setMeta(order);
  setStatus(order.hasResult
    ? "该订单的结果已经保存。你可以直接重新打开结果。"
    : "订单已记录。完成 PayPal 付款后，点击下方按钮继续解锁结果。");
  return order;
}

document.querySelector("#unlockBtn").addEventListener("click", async () => {
  const current = resolveCurrentOrder();
  if (!current.orderId || !current.token) {
    setMessage("当前没有可用订单，请先返回首页重新发起付款。");
    return;
  }
  setMessage("正在为你恢复并保存结果...");
  try {
    const response = await fetch("/api/guest-orders/fulfill", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: current.orderId, token: current.token })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "解锁结果失败。");
    window.location.href = data.deliveryUrl;
  } catch (error) {
    setMessage(error.message);
  }
});

loadStatus().catch(error => {
  setStatus(error.message);
});
