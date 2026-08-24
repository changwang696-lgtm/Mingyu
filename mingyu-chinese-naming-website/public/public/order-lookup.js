document.querySelector("#lookupForm").addEventListener("submit", async event => {
  event.preventDefault();
  const message = document.querySelector("#lookupMessage");
  message.textContent = "正在查找你的订单...";
  const formData = Object.fromEntries(new FormData(event.currentTarget));
  try {
    const response = await fetch("/api/guest-orders/lookup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "找回订单失败。");
    localStorage.setItem("mingyu_guest_checkout", JSON.stringify({
      orderId: data.orderId,
      accessToken: data.accessToken,
      createdAt: Date.now()
    }));
    window.location.href = data.successUrl;
  } catch (error) {
    message.textContent = error.message;
  }
});
