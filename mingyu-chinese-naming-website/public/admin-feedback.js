const state = {
  feedback: [],
  selectedFeedbackId: ""
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
  $("#adminSessionText").textContent = `已登录管理员：${data.username} · 当前可查看用户留言`;
  return data;
}

function showMessage(message) {
  $("#feedbackMessage").textContent = message || "";
}

function renderFeedbackList() {
  const list = $("#feedbackList");
  list.innerHTML = "";
  $("#feedbackCount").textContent = String(state.feedback.length);
  if (!state.feedback.length) {
    list.innerHTML = "<div class=\"admin-empty\">当前没有用户留言。</div>";
    return;
  }

  state.feedback.forEach(item => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `admin-order-item${item.id === state.selectedFeedbackId ? " is-active" : ""}`;
    button.innerHTML = `
      <strong>${item.email || "匿名留言 / Anonymous"}</strong>
      <span>${item.page || "/"}</span>
      <span>${String(item.message || "").slice(0, 56)}${String(item.message || "").length > 56 ? "..." : ""}</span>
      <small>${formatDateTime(item.createdAt)}</small>
    `;
    button.addEventListener("click", () => {
      state.selectedFeedbackId = item.id;
      renderFeedbackList();
      renderFeedbackDetail(item);
    });
    list.appendChild(button);
  });
}

function renderFeedbackDetail(item) {
  $("#feedbackDetailEmpty").hidden = true;
  $("#feedbackDetailBox").hidden = false;
  $("#feedbackDetailMeta").innerHTML = [
    ["留言时间", formatDateTime(item.createdAt)],
    ["联系邮箱", item.email || "未填写"],
    ["来源页面", item.page || "/"],
    ["留言编号", item.id]
  ].map(([label, value]) => `
    <div class="admin-detail-card">
      <small>${label}</small>
      <strong>${value}</strong>
    </div>
  `).join("");
  $("#feedbackBody").textContent = item.message || "";
}

async function loadFeedback() {
  showMessage("正在读取用户留言...");
  const params = new URLSearchParams();
  const query = $("#searchInput").value.trim();
  if (query) params.set("q", query);
  const response = await fetch(`/api/admin/feedback?${params.toString()}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "读取留言失败。");
  state.feedback = data.feedback || [];
  if (state.selectedFeedbackId && !state.feedback.some(item => item.id === state.selectedFeedbackId)) {
    state.selectedFeedbackId = "";
  }
  renderFeedbackList();
  if (state.selectedFeedbackId) {
    const selected = state.feedback.find(item => item.id === state.selectedFeedbackId);
    if (selected) renderFeedbackDetail(selected);
  } else {
    $("#feedbackDetailEmpty").hidden = false;
    $("#feedbackDetailBox").hidden = true;
  }
  showMessage(`已加载 ${state.feedback.length} 条用户留言。`);
}

$("#refreshFeedbackBtn").addEventListener("click", () => {
  loadFeedback().catch(showMessage);
});

$("#searchInput").addEventListener("keydown", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    loadFeedback().catch(showMessage);
  }
});

$("#adminLogoutBtn").addEventListener("click", async () => {
  await fetch("/api/admin/logout", { method: "POST" });
  window.location.href = "/admin-login.html";
});

Promise.resolve()
  .then(ensureAdminSession)
  .then(session => {
    if (!session) return;
    return loadFeedback();
  })
  .catch(showMessage);
