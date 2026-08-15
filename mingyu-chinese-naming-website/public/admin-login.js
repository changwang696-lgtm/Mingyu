async function checkAdminSession() {
  const response = await fetch("/api/admin/session");
  const data = await response.json();
  if (data.authenticated) {
    window.location.href = "/admin-orders.html";
  }
  return data;
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
    message.textContent = error.message;
  }
});

checkAdminSession().catch(error => {
  document.querySelector("#adminLoginMessage").textContent = error.message;
});
