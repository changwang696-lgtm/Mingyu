const state = {
  feedback: [],
  selectedFeedbackId: "",
  emailEnabled: false,
  adminName: ""
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
  state.adminName = data.username || "";
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
    const displayName = item.displayName || item.email || "匿名会员";
    const replyState = item.reply?.message ? (item.reply.emailSent ? "已回复并发信" : "已回复") : "待回复";
    button.innerHTML = `
      <strong>${displayName}</strong>
      <span>${item.page || "/"}</span>
      <span>${String(item.message || "").slice(0, 56)}${String(item.message || "").length > 56 ? "..." : ""}</span>
      <span>${replyState}</span>
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
    ["会员账号", item.displayName || "未命名会员"],
    ["联系邮箱", item.email || "未填写"],
    ["来源页面", item.page || "/"],
    ["留言编号", item.id],
    ["回复状态", item.reply?.message ? (item.reply.emailSent ? "已回复并发送邮件" : `已回复${item.reply.emailError ? "（邮件未发出）" : ""}`) : "暂未回复"]
  ].map(([label, value]) => `
    <div class="admin-detail-card">
      <small>${label}</small>
      <strong>${value}</strong>
    </div>
  `).join("");
  $("#feedbackBody").textContent = item.message || "";
  $("#replyMessageInput").value = item.reply?.message || "";
  $("#replySummary").textContent = item.reply?.message
    ? `最近回复：${formatDateTime(item.reply.repliedAt)} · ${item.reply.repliedBy || state.adminName || "管理员"}${item.reply.emailSent ? ` · 已发至 ${item.reply.deliveredTo || item.email || "-"}` : item.reply.emailError ? ` · ${item.reply.emailError}` : ""}`
    : "暂未回复。";
  $("#replyDeliveryHint").textContent = state.emailEnabled
    ? "保存回复后会自动发送到会员邮箱。"
    : "当前邮箱未配置，回复会先保存到后台记录。";
  $("#replySubmitBtn").dataset.feedbackId = item.id;
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
  state.emailEnabled = Boolean(data.emailEnabled);
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

async function replyFeedback(feedbackId, replyMessage) {
  showMessage("正在保存并发送回复...");
  const response = await fetch("/api/admin/feedback/reply", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ feedbackId, replyMessage })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "回复失败。");
  const next = data.feedback;
  state.feedback = state.feedback.map(item => item.id === next.id ? next : item);
  state.selectedFeedbackId = next.id;
  renderFeedbackList();
  renderFeedbackDetail(next);
  showMessage(next.reply?.emailSent
    ? `回复已保存，并已发送到 ${next.reply.deliveredTo || next.email || "-"}。`
    : `回复已保存。${next.reply?.emailError ? ` ${next.reply.emailError}` : ""}`);
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

$("#feedbackReplyForm").addEventListener("submit", event => {
  event.preventDefault();
  const feedbackId = $("#replySubmitBtn").dataset.feedbackId;
  const replyMessage = $("#replyMessageInput").value.trim();
  if (!feedbackId) {
    showMessage("请先选择一条留言。");
    return;
  }
  if (!replyMessage) {
    showMessage("请先填写回复内容。");
    return;
  }
  replyFeedback(feedbackId, replyMessage).catch(showMessage);
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
