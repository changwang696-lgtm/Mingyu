const pageView = document.body.dataset.accountView || "ledger";
const statusBanner = document.querySelector("#statusBanner");
const memberName = document.querySelector("#memberName");
const memberEmail = document.querySelector("#memberEmail");
const memberCredits = document.querySelector("#memberCredits");
const memberPlan = document.querySelector("#memberPlan");
const ledgerList = document.querySelector("#ledgerList");
const reportList = document.querySelector("#reportList");

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
  if (!value) return "No date yet";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "No date yet" : date.toLocaleString();
}

function normalizeTier(tier) {
  return String(tier || "").toLowerCase() === "complete" ? "complete" : "simple";
}

function reportTierLabel(tier) {
  return normalizeTier(tier) === "complete" ? "Complete" : "Simple";
}

function reportTierDescription(tier) {
  return normalizeTier(tier) === "complete"
    ? "Full naming result with PDF download"
    : "Names and zodiac snapshot";
}

function showStatus(message, isError = false) {
  if (!statusBanner) return;
  statusBanner.hidden = false;
  statusBanner.textContent = message;
  statusBanner.dataset.state = isError ? "error" : "success";
}

function renderSummary(user) {
  if (!user) return;
  if (memberName) memberName.textContent = user.displayName || "Member";
  if (memberEmail) memberEmail.textContent = user.email || "you@example.com";
  if (memberCredits) memberCredits.textContent = String(user.creditsBalance ?? 0);
  if (memberPlan) {
    memberPlan.textContent = user.membership?.planName || "No active membership";
  }
}

function renderLedger(entries, welcomeCredits = 0) {
  if (!ledgerList) return;
  if (!entries?.length) {
    ledgerList.innerHTML = `<div class="empty-state">No credit activity yet. Your ${welcomeCredits} welcome credits and future purchases or usage will appear here.</div>`;
    return;
  }
  ledgerList.innerHTML = entries.map(entry => `
    <article class="ledger-item">
      <small>${safeDate(entry.createdAt)}</small>
      <strong>${escapeHtml(entry.description || "Credit activity")}</strong>
      <div class="item-meta">${entry.creditsDelta > 0 ? "+" : ""}${entry.creditsDelta} credits · Balance ${entry.creditsBalanceAfter}</div>
    </article>
  `).join("");
}

function renderReports(reports) {
  if (!reportList) return;
  if (!reports?.length) {
    reportList.innerHTML = `<div class="empty-state">No report history yet. Your simple and complete reports will appear here after generation.</div>`;
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
        <strong>${escapeHtml(report.inputName || "Generated result")}</strong>
        <div class="item-meta">${reportTierDescription(report.tier)}${report.zodiac ? ` · ${escapeHtml(report.zodiac)}` : ""}</div>
        <p>${previewNames || "Result ready. Use the links below to open the page or download the PDF."}</p>
        <div class="item-actions">
          <a class="text-link" href="${report.resultUrl}">Open Result</a>
          ${canDownloadPdf ? `<a class="text-link" href="${report.pdfUrl}">Download PDF</a>` : ""}
        </div>
      </article>
    `;
  }).join("");

  const renderSection = (title, subtitle, items, emptyText) => `
    <section class="report-section">
      <div class="report-section-head">
        <strong>${title}</strong>
        <span>${subtitle}</span>
      </div>
      ${items.length
        ? `<div class="report-list-inner">${renderReportCards(items)}</div>`
        : `<div class="empty-state">${emptyText}</div>`}
    </section>
  `;

  reportList.innerHTML = [
    renderSection("Simple reports", "Names and zodiac", simpleReports, "No simple reports yet."),
    renderSection("Complete reports", "Full naming result with PDF", completeReports, "No complete reports yet.")
  ].join("");
}

async function fetchSession() {
  const response = await fetch("/api/auth/session");
  const data = await response.json();
  if (!data?.loggedIn) {
    const next = encodeURIComponent(window.location.pathname);
    window.location.assign(`/account.html?next=${next}`);
    return null;
  }
  return data;
}

async function fetchOverview() {
  const response = await fetch("/api/member/overview");
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Unable to load your account history right now.");
  return data;
}

Promise.all([fetchSession(), fetchOverview()])
  .then(([, overview]) => {
    renderSummary(overview.user);
    if (pageView === "ledger") {
      renderLedger(overview.ledger, overview.catalog?.welcomeCredits || 0);
    } else {
      renderReports(overview.reports);
    }
  })
  .catch(error => {
    showStatus(error?.message || "Unable to load this page right now.", true);
  });
