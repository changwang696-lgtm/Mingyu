const state = {
  users: [],
  selectedUserId: "",
  selectedUser: null,
  storageMode: "local"
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

function formatMembership(user) {
  if (!user?.membershipPlanName) return "No active membership";
  return `${user.membershipPlanName} · ${user.membershipStatus || "inactive"}`;
}

function getMessageText(message) {
  if (!message) return "";
  if (message instanceof Error) return message.message;
  return String(message);
}

function showMessage(message, isError = false) {
  const target = $("#usersMessage");
  target.textContent = getMessageText(message);
  target.dataset.state = isError ? "error" : "normal";
}

function resetUserDetail() {
  state.selectedUser = null;
  $("#userDetailEmpty").hidden = false;
  $("#userDetailBox").hidden = true;
  $("#deleteConfirmInput").value = "";
  $("#deleteUserBtn").dataset.userId = "";
  $("#deleteUserBtn").disabled = true;
}

function setDeleteBusy(isBusy) {
  const button = $("#deleteUserBtn");
  button.disabled = isBusy || !state.selectedUser?.user?.id;
  button.textContent = isBusy ? "正在永久删除..." : "永久删除这个用户";
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
  $("#adminSessionText").textContent = `已登录管理员：${data.username} · 当前可管理注册用户`;
  return data;
}

function renderUsers() {
  const list = $("#usersList");
  list.innerHTML = "";
  $("#usersCount").textContent = String(state.users.length);
  if (!state.users.length) {
    list.innerHTML = "<div class=\"admin-empty\">当前没有符合条件的注册用户。</div>";
    return;
  }

  state.users.forEach(user => {
    const item = document.createElement("button");
    item.type = "button";
    item.className = `admin-order-item${user.id === state.selectedUserId ? " is-active" : ""}`;
    item.innerHTML = `
      <strong>${user.displayName || user.email}</strong>
      <span>${user.email}</span>
      <span>${formatMembership(user)}</span>
      <span>Credits：${user.creditsBalance || 0}</span>
      <small>${formatDateTime(user.createdAt)}</small>
    `;
    item.addEventListener("click", () => {
      state.selectedUserId = user.id;
      renderUsers();
      loadUserDetail(user.id).catch(error => showMessage(error, true));
    });
    list.appendChild(item);
  });
}

function renderCards(targetId, items) {
  const target = $(targetId);
  if (!items.length) {
    target.innerHTML = "<div class=\"admin-empty\">暂无记录。</div>";
    return;
  }
  target.innerHTML = items.map(item => `
    <article class="admin-related-card">
      <strong>${item.title}</strong>
      <span>${item.meta || "-"}</span>
      ${item.extra ? `<small>${item.extra}</small>` : ""}
    </article>
  `).join("");
}

function renderUserDetail(detail) {
  state.selectedUser = detail;
  $("#userDetailEmpty").hidden = true;
  $("#userDetailBox").hidden = false;
  $("#storageModeText").textContent = detail.storageMode === "supabase" ? "当前存储：Supabase" : "当前存储：本地 JSON";
  $("#userDetailMeta").innerHTML = [
    ["用户 ID", detail.user.id],
    ["邮箱", detail.user.email],
    ["显示名称", detail.user.displayName || "-"],
    ["当前 Credits", detail.user.creditsBalance || 0],
    ["会员状态", detail.user.membershipStatus || "inactive"],
    ["会员方案", detail.user.membershipPlanName || "No active membership"],
    ["注册时间", formatDateTime(detail.user.createdAt)],
    ["待验证注册", detail.counts.pendingRegistration ? "有" : "无"]
  ].map(([label, value]) => `
    <div class="admin-detail-card">
      <small>${label}</small>
      <strong>${value}</strong>
    </div>
  `).join("");

  $("#userCountsGrid").innerHTML = [
    ["活跃会话", detail.counts.sessions],
    ["积分流水", detail.counts.ledger],
    ["生成记录", detail.counts.reports],
    ["会员订单", detail.counts.memberOrders],
    ["游客订单", detail.counts.guestOrders],
    ["大师留言", detail.counts.feedback]
  ].map(([label, value]) => `
    <div class="admin-chip">
      <small>${label}</small>
      <strong>${value}</strong>
    </div>
  `).join("");

  renderCards("#userReportsList", (detail.reports || []).map(item => ({
    title: `${item.inputName || "-"} · ${item.tier === "complete" ? "完整版" : "简约版"}`,
    meta: `${item.zodiac || "-"} · ${formatDateTime(item.createdAt)}`,
    extra: Array.isArray(item.previewNames) && item.previewNames.length ? item.previewNames.join(" / ") : ""
  })));

  renderCards("#userMemberOrdersList", (detail.memberOrders || []).map(item => ({
    title: `${item.itemName || item.itemId}`,
    meta: `${item.creditsDelta || 0} credits · ${item.status || "-"}`,
    extra: formatDateTime(item.createdAt)
  })));

  renderCards("#userGuestOrdersList", (detail.guestOrders || []).map(item => ({
    title: `${item.inputName || item.email} · ${item.tier === "complete" ? "完整版" : "简约版"}`,
    meta: `${item.status || "-"} · ${item.emailDeliveryStatus || "pending"}`,
    extra: formatDateTime(item.createdAt)
  })));

  renderCards("#userFeedbackList", (detail.feedback || []).map(item => ({
    title: item.reply?.message ? "已留言并已处理" : "已留言待处理",
    meta: `${item.page || "/"} · ${formatDateTime(item.createdAt)}`,
    extra: String(item.message || "").slice(0, 120)
  })));

  $("#deleteWarningText").textContent = `永久删除后，将清理 ${detail.user.email} 的账号、会话、会员订单、生成记录、大师留言，以及关联旧游客订单。`;
  $("#deleteConfirmInput").value = "";
  $("#deleteConfirmInput").placeholder = detail.user.email;
  $("#deleteUserBtn").dataset.userId = detail.user.id;
  setDeleteBusy(false);
}

async function loadUsers() {
  const refreshButton = $("#refreshUsersBtn");
  refreshButton.disabled = true;
  showMessage("正在读取注册用户清单...");
  try {
    const params = new URLSearchParams();
    const query = $("#searchInput").value.trim();
    if (query) params.set("q", query);
    const response = await fetch(`/api/admin/users?${params.toString()}`);
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "读取用户清单失败。");
    state.users = data.users || [];
    state.storageMode = data.storageMode || "local";
    if (state.selectedUserId && !state.users.some(user => user.id === state.selectedUserId)) {
      state.selectedUserId = "";
    }
    if (!state.selectedUserId && state.users.length) {
      state.selectedUserId = state.users[0].id;
    }
    renderUsers();
    if (state.selectedUserId) {
      await loadUserDetail(state.selectedUserId);
    } else {
      resetUserDetail();
      $("#storageModeText").textContent = state.storageMode === "supabase" ? "当前存储：Supabase" : "当前存储：本地 JSON";
    }
    showMessage(query ? `已筛选到 ${state.users.length} 个注册用户。` : `已加载 ${state.users.length} 个注册用户。`);
  } catch (error) {
    showMessage(error, true);
    throw error;
  } finally {
    refreshButton.disabled = false;
  }
}

async function loadUserDetail(userId) {
  const response = await fetch(`/api/admin/users/detail?user=${encodeURIComponent(userId)}`);
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "读取用户详情失败。");
  renderUserDetail(data);
}

async function deleteUser(userId, confirmationEmail) {
  showMessage("正在永久删除用户账号...");
  setDeleteBusy(true);
  try {
    const response = await fetch("/api/admin/users/delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, confirmationEmail })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "删除用户失败。");
    showMessage(`已永久删除：${data.deleted.email}`);
    state.selectedUserId = "";
    resetUserDetail();
    await loadUsers();
  } catch (error) {
    showMessage(error, true);
    throw error;
  } finally {
    setDeleteBusy(false);
  }
}

$("#refreshUsersBtn").addEventListener("click", () => {
  loadUsers().catch(error => showMessage(error, true));
});

$("#searchInput").addEventListener("keydown", event => {
  if (event.key === "Enter") {
    event.preventDefault();
    loadUsers().catch(error => showMessage(error, true));
  }
});

$("#deleteUserForm").addEventListener("submit", event => {
  event.preventDefault();
  const userId = $("#deleteUserBtn").dataset.userId;
  const confirmationEmail = $("#deleteConfirmInput").value.trim();
  if (!userId || !state.selectedUser?.user?.email) {
    showMessage("请先选择一个用户。", true);
    return;
  }
  if (confirmationEmail !== state.selectedUser.user.email) {
    showMessage("请输入该用户的完整邮箱以确认永久删除。", true);
    return;
  }
  deleteUser(userId, confirmationEmail).catch(error => showMessage(error, true));
});

$("#adminLogoutBtn").addEventListener("click", async () => {
  await fetch("/api/admin/logout", { method: "POST" });
  window.location.href = "/admin-login.html";
});

Promise.resolve()
  .then(ensureAdminSession)
  .then(session => {
    if (!session) return;
    resetUserDetail();
    return loadUsers();
  })
  .catch(error => showMessage(error, true));
