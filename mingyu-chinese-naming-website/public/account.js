const statusBanner = document.querySelector("#statusBanner");
const authGrid = document.querySelector("#authGrid");
const dashboard = document.querySelector("#dashboard");
const registerForm = document.querySelector("#registerForm");
const loginForm = document.querySelector("#loginForm");
const logoutBtn = document.querySelector("#logoutBtn");
const memberName = document.querySelector("#memberName");
const memberEmail = document.querySelector("#memberEmail");
const memberCredits = document.querySelector("#memberCredits");
const memberPlan = document.querySelector("#memberPlan");
const memberRenewal = document.querySelector("#memberRenewal");
const ledgerList = document.querySelector("#ledgerList");
const reportList = document.querySelector("#reportList");
const memberOrderList = document.querySelector("#memberOrderList");
const serviceOrderList = document.querySelector("#serviceOrderList");
const planGrid = document.querySelector("#planGrid");
const nextPath = new URLSearchParams(window.location.search).get("next") || "/";
let sessionState = { loggedIn: false, user: null, catalog: null };
let purchasePendingPlanId = null;

function escapeHtml(value) {
  return String(value || "").replace(/[&<>"']/g, character => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;"
  }[character]));
}

function safeDate(value) {
  if (!value) return "Not available";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "Not available" : date.toLocaleString();
}

function formatMoney(value, currency = "USD") {
  return `${currency} ${value}`;
}

function normalizeTier(tier) {
  return String(tier || "").toLowerCase() === "complete" ? "complete" : "simple";
}

function reportTierLabel(tier) {
  return normalizeTier(tier) === "complete" ? "完整版" : "简约版";
}

function reportTierDescription(tier) {
  return normalizeTier(tier) === "complete"
    ? "生成全部起名结果"
    : "生成名字及生肖";
}

function redirectAfterAuth() {
  if (!sessionStorage.getItem("mingyu_pending_service_intent")) return;
  const safePath = nextPath.startsWith("/") && !nextPath.startsWith("//") ? nextPath : "/";
  window.location.assign(safePath);
}

function showStatus(message, isError = false) {
  statusBanner.hidden = false;
  statusBanner.textContent = message;
  statusBanner.style.borderLeftColor = isError ? "#9e392b" : "#176d68";
}

function hideStatus() {
  statusBanner.hidden = true;
  statusBanner.textContent = "";
}

function renderCatalog(catalog) {
  if (!catalog?.plans) return;
  planGrid.innerHTML = catalog.plans.map(plan => `
    <article class="plan-card">
      <small>${plan.interval === "month" ? "MEMBERSHIP PLAN" : "ONE-TIME PLAN"}</small>
      <strong>${plan.name}</strong>
      <div>${plan.price}</div>
      <p>${plan.credits} credits included</p>
      <button
        type="button"
        class="plan-purchase"
        data-plan-id="${escapeHtml(plan.id)}"
        ${!sessionState.loggedIn || purchasePendingPlanId === plan.id ? "disabled" : ""}
      >
        ${!sessionState.loggedIn ? "Sign in first" : purchasePendingPlanId === plan.id ? "Redirecting..." : "Buy with PayPal"}
      </button>
    </article>
  `).join("");
}

function renderLedger(entries) {
  if (!entries?.length) {
    ledgerList.innerHTML = `<div class="empty-state">No credit activity yet. Registering grants welcome credits, and each member generation request will appear here.</div>`;
    return;
  }

  ledgerList.innerHTML = entries.map(entry => `
    <article class="ledger-item">
      <small>${new Date(entry.createdAt).toLocaleString()}</small>
      <strong>${entry.description}</strong>
      <div class="item-meta">${entry.creditsDelta > 0 ? "+" : ""}${entry.creditsDelta} credits · Balance ${entry.creditsBalanceAfter}</div>
    </article>
  `).join("");
}

function renderReports(reports) {
  if (!reports?.length) {
    reportList.innerHTML = `<div class="empty-state">暂时还没有历史生成记录。登录后完成会员生成，这里会分别显示简约版与完整版清单。</div>`;
    return;
  }

  const simpleReports = reports.filter(report => normalizeTier(report.tier) === "simple");
  const completeReports = reports.filter(report => normalizeTier(report.tier) === "complete");

  const renderReportCards = items => items.map(report => {
    const previewNames = (Array.isArray(report.previewNames) ? report.previewNames : [])
      .map(escapeHtml)
      .join(" · ");
    const canDownloadPdf = normalizeTier(report.tier) === "complete" && report.pdfUrl;
    return `
      <article class="report-item">
        <small>${safeDate(report.createdAt)} · ${reportTierLabel(report.tier)}</small>
        <strong>${escapeHtml(report.inputName)}</strong>
        <div class="item-meta">${reportTierDescription(report.tier)}${report.zodiac ? ` · ${escapeHtml(report.zodiac)}` : ""}</div>
        <p>${previewNames || "已生成结果，点击下方可查看详情。"}</p>
        <div class="item-actions">
          <a class="text-link" href="${report.resultUrl}">查看结果</a>
          ${canDownloadPdf ? `<a class="text-link" href="${report.pdfUrl}">下载 PDF</a>` : ""}
        </div>
      </article>
    `;
  }).join("");

  const renderReportSection = (title, desc, items, emptyText) => `
    <section class="report-section">
      <div class="report-section-head">
        <strong>${title}</strong>
        <span>${desc}</span>
      </div>
      ${items.length
        ? `<div class="report-list-inner">${renderReportCards(items)}</div>`
        : `<div class="empty-state">${emptyText}</div>`}
    </section>
  `;

  reportList.innerHTML = [
    renderReportSection("简约版", "生成名字及生肖", simpleReports, "还没有简约版历史生成记录。"),
    renderReportSection("完整版", "生成全部起名结果，可直接下载 PDF", completeReports, "还没有完整版历史生成记录。")
  ].join("");
}

function renderMemberOrders(orders) {
  if (!orders?.length) {
    memberOrderList.innerHTML = `<div class="empty-state">No membership or credit-pack orders yet. After you complete a PayPal purchase here, the order will appear in this list.</div>`;
    return;
  }

  memberOrderList.innerHTML = orders.map(order => `
    <article class="report-item">
      <small>${safeDate(order.createdAt)} · ${escapeHtml(order.status)}</small>
      <strong>${escapeHtml(order.itemName)}</strong>
      <div class="item-meta">${formatMoney(order.amount, order.currency)} · +${order.creditsDelta} credits</div>
      <p>${order.status === "completed"
        ? (order.membershipRenewalAt ? `Renews on ${new Date(order.membershipRenewalAt).toLocaleDateString()}` : "One-time credit purchase completed.")
        : "Waiting for PayPal confirmation."}</p>
    </article>
  `).join("");
}

function renderServiceOrders(orders) {
  if (!orders?.length) {
    serviceOrderList.innerHTML = `<div class="empty-state">No paid naming orders yet. If you buy a single naming service from the homepage, the order and PDF entry will appear here.</div>`;
    return;
  }

  serviceOrderList.innerHTML = orders.map(order => `
    <article class="report-item">
      <small>${safeDate(order.createdAt)} · ${escapeHtml(order.status)} · ${escapeHtml(order.paymentStatus || "pending")}</small>
      <strong>${escapeHtml(order.inputName || order.id)}</strong>
      <div class="item-meta">${escapeHtml(order.tier)} · ${formatMoney(order.paymentAmount || order.priceValue, order.paymentCurrency || "USD")}</div>
      <p>Order ID: ${escapeHtml(order.id)}</p>
      <div class="item-actions">
        ${order.deliveryUrl ? `<a class="text-link" href="${order.deliveryUrl}">Open result</a>` : ""}
        ${order.pdfUrl ? `<a class="text-link" href="${order.pdfUrl}">Download PDF</a>` : ""}
        ${!order.deliveryUrl && order.successUrl ? `<a class="text-link" href="${order.successUrl}">Continue payment return</a>` : ""}
      </div>
    </article>
  `).join("");
}

function renderSession(data) {
  sessionState = data;
  renderCatalog(data.catalog);
  if (!data.loggedIn || !data.user) {
    authGrid.hidden = false;
    dashboard.hidden = true;
    return;
  }

  authGrid.hidden = true;
  dashboard.hidden = false;
  memberName.textContent = data.user.displayName || "Member";
  memberEmail.textContent = data.user.email;
  memberCredits.textContent = String(data.user.creditsBalance);
  memberPlan.textContent = data.user.membership?.planName || "No active membership";
  memberRenewal.textContent = data.user.membership?.renewalAt
    ? `Renews on ${new Date(data.user.membership.renewalAt).toLocaleDateString()}`
    : "No renewal is scheduled yet.";
}

async function fetchSession() {
  const response = await fetch("/api/auth/session");
  const data = await response.json();
  renderSession(data);
  return data;
}

async function fetchOverview() {
  const response = await fetch("/api/member/overview");
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Unable to load member overview.");
  renderSession({ loggedIn: true, user: data.user, catalog: data.catalog });
  renderLedger(data.ledger);
  renderReports(data.reports);
  renderMemberOrders(data.memberOrders);
  renderServiceOrders(data.serviceOrders);
  return data;
}

async function handleAuth(endpoint, form) {
  hideStatus();
  const formData = Object.fromEntries(new FormData(form));
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(formData)
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Request failed.");
  form.reset();
  showStatus(data.message || "Success.");
  await fetchOverview();
  redirectAfterAuth();
}

registerForm.addEventListener("submit", async event => {
  event.preventDefault();
  try {
    await handleAuth("/api/auth/register", event.currentTarget);
  } catch (error) {
    showStatus(error.message, true);
  }
});

loginForm.addEventListener("submit", async event => {
  event.preventDefault();
  try {
    await handleAuth("/api/auth/login", event.currentTarget);
  } catch (error) {
    showStatus(error.message, true);
  }
});

logoutBtn.addEventListener("click", async () => {
  hideStatus();
  await fetch("/api/auth/logout", { method: "POST" });
  renderLedger([]);
  renderReports([]);
  renderMemberOrders([]);
  renderServiceOrders([]);
  await fetchSession();
  showStatus("Signed out successfully.");
});

planGrid.addEventListener("click", async event => {
  const button = event.target.closest("[data-plan-id]");
  if (!button) return;
  if (!sessionState.loggedIn) {
    showStatus("Please sign in before purchasing a membership or credit pack.", true);
    return;
  }

  const planId = String(button.dataset.planId || "");
  purchasePendingPlanId = planId;
  renderCatalog(sessionState.catalog);
  showStatus("Redirecting to PayPal...");

  try {
    const response = await fetch("/api/member/purchase/start", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || "Unable to start purchase.");
    window.location.assign(data.approvalUrl);
  } catch (error) {
    purchasePendingPlanId = null;
    renderCatalog(sessionState.catalog);
    showStatus(error.message, true);
  }
});

async function handleReturnedMemberPurchase() {
  const params = new URLSearchParams(window.location.search);
  const memberOrderId = params.get("memberOrder");
  const payPalOrderId = params.get("token");
  const cancelled = params.get("cancelled") === "1";

  if (cancelled) {
    showStatus("PayPal payment was cancelled. You can start the purchase again when ready.", true);
    history.replaceState({}, "", "/account.html");
    return;
  }
  if (!memberOrderId) return;

  showStatus("Confirming your PayPal payment...");
  const response = await fetch("/api/member/purchase/capture", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ memberOrderId, payPalOrderId })
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Unable to confirm this PayPal purchase.");

  showStatus("Purchase completed. Credits have been added to your account.");
  history.replaceState({}, "", "/account.html");
  await fetchOverview();
}

fetchSession()
  .then(data => {
    if (data.loggedIn) {
      return fetchOverview().then(() => handleReturnedMemberPurchase());
    }
    renderCatalog(data.catalog);
    renderLedger([]);
    renderReports([]);
    renderMemberOrders([]);
    renderServiceOrders([]);
    return null;
  })
  .catch(error => {
    showStatus(error?.message || "Unable to load member center right now.", true);
  });
