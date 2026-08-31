function formatLookupMessage(message) {
  const text = String(message || "").trim();
  if (!text) return "找回订单失败，请稍后重试。 / We could not recover the order. Please try again.";
  if (text.includes(" / ")) return text;
  if (/order not found/i.test(text) || /未找到|不存在/.test(text)) {
    return "未找到对应订单，请检查邮箱和订单号。 / We could not find that order. Please check the email and order ID.";
  }
  if (/email/i.test(text) && /order/i.test(text)) {
    return "邮箱与订单号不匹配，请重新核对。 / The email and order ID do not match. Please review them and try again.";
  }
  return `${text} / ${text}`;
}

document.querySelector("#lookupForm").addEventListener("submit", async event => {
  event.preventDefault();
  const message = document.querySelector("#lookupMessage");
  message.textContent = "正在查找你的订单... / Looking up your order...";
  const formData = Object.fromEntries(new FormData(event.currentTarget));
  try {
    const response = await fetch("/api/guest-orders/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "找回订单失败。 / Order recovery failed.");
    localStorage.setItem("mingyu_guest_checkout", JSON.stringify({
      orderId: data.orderId,
      accessToken: data.accessToken,
      createdAt: Date.now()
    }));
    window.location.href = data.successUrl;
  } catch (error) {
    message.textContent = formatLookupMessage(error.message);
  }
});
