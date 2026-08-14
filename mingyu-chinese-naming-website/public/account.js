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
const planGrid = document.querySelector("#planGrid");

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
      <div>${entry.creditsDelta > 0 ? "+" : ""}${entry.creditsDelta} credits · Balance ${entry.creditsBalanceAfter}</div>
    </article>
  `).join("");
}

function renderReports(reports) {
  if (!reports?.length) {
    reportList.innerHTML = `<div class="empty-state">No saved reports yet. After a successful member generation, your recent naming history will appear here.</div>`;
    return;
  }

  reportList.innerHTML = reports.map(report => `
    <article class="report-item">
      <small>${new Date(report.createdAt).toLocaleString()} · ${report.tier}</small>
      <strong>${report.inputName}</strong>
      <div>${report.zodiac}</div>
      <p>${report.previewNames.join(" · ")}</p>
    </article>
  `).join("");
}

function renderSession(data) {
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
  await fetchSession();
  showStatus("Signed out successfully.");
});

fetchSession()
  .then(data => {
    if (data.loggedIn) return fetchOverview();
    renderCatalog(data.catalog);
    renderLedger([]);
    renderReports([]);
    return null;
  })
  .catch(() => {
    showStatus("Unable to load member center right now.", true);
  });
