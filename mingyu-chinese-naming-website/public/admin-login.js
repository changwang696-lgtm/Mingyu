async function checkAdminSession() {
  const response = await fetch("/api/admin/session");
  const data = await response.json();
  if (data.authenticated) {
    window.location.href = "/admin-orders.html";
  }
  return data;
}

function normalizeAdminError(message) {
  const text = String(message || "").trim();
  if (!text) return "后台登录失败，请稍后重试。";
  if (/Too many admin login attempts/i.test(text)) {
    return "后台登录尝试次数过多，请稍后再试。";
  }
  if (/Incorrect admin username or password/i.test(text)) {
    return "管理员账号或密码不正确。";
  }
  return text;
}

document.querySelector("#adminLoginForm").addEventListener("submit", async event => {
  event.preventDefault();
  const message = document.querySelector("#adminLoginMessage");
  message.textContent = "正在登录后台...";
  const formData = Object.fromEntries(new FormData(event.currentTarget));
  try {
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData)
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "后台登录失败。");
    window.location.href = "/admin-orders.html";
  } catch (error) {
    message.textContent = normalizeAdminError(error.message);
  }
});

checkAdminSession().catch(error => {
  document.querySelector("#adminLoginMessage").textContent = normalizeAdminError(error.message);
});
