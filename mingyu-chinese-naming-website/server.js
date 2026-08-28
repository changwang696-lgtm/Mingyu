const http = require("http");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const { PDFDocument, rgb } = require("pdf-lib");
const fontkit = require("@pdf-lib/fontkit");

const root = path.join(__dirname, "public");
const dataDir = path.join(__dirname, "data");
const databaseFile = path.join(dataDir, "membership-db.json");
const fontCacheDir = path.join(dataDir, "fonts");
const pdfFontCacheFile = path.join(fontCacheDir, "NotoSansCJKsc-Regular.otf");
const pdfAssetCache = new Map();
const supabaseUrl = process.env.SUPABASE_URL || "";
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || "";
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
const useSupabase = Boolean(supabaseUrl && supabaseServiceRoleKey);
const port = Number(process.env.PORT) || 4173;
const orderStore = new Map();
const sessionCookieName = "mingyu_session";
const adminSessionCookieName = "mingyu_admin";
const welcomeCredits = 3;
const sessionLifetimeSeconds = 60 * 60 * 24 * 30;
const adminSessionLifetimeSeconds = 60 * 60 * 24 * 7;
const adminUsername = process.env.ADMIN_USERNAME || "";
const adminPassword = process.env.ADMIN_PASSWORD || "";
const adminSessionSecret = process.env.ADMIN_SESSION_SECRET || adminPassword || "";
const resendApiKey = process.env.RESEND_API_KEY || "";
const mailFrom = process.env.MAIL_FROM || "";
const mailReplyTo = process.env.MAIL_REPLY_TO || "";
const siteBaseUrl = String(process.env.SITE_BASE_URL || "").replace(/\/$/, "");
const pdfFontUrl = process.env.PDF_FONT_URL || "https://raw.githubusercontent.com/notofonts/noto-cjk/main/Sans/OTF/SimplifiedChinese/NotoSansCJKsc-Regular.otf";
const tierPricing = {
  simple: { value: "2.99", label: "Simple Edition" },
  complete: { value: "9.90", label: "Complete Edition" }
};
const tierCreditCosts = { simple: 1, complete: 3 };
const memberPlans = {
  starter: {
    id: "starter",
    name: "Starter Membership",
    price: "$19/month",
    payPalValue: "19.00",
    credits: 30,
    interval: "month"
  },
  studio: {
    id: "studio",
    name: "Studio Membership",
    price: "$39/month",
    payPalValue: "39.00",
    credits: 80,
    interval: "month"
  },
  creditPack: {
    id: "credit-pack-50",
    name: "Credit Pack",
    price: "$29 one-time",
    payPalValue: "29.00",
    credits: 50,
    interval: "one-time"
  }
};
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".json": "application/json; charset=utf-8",
  ".pdf": "application/pdf"
};
const signs = [["鼠", "Rat"], ["牛", "Ox"], ["虎", "Tiger"], ["兔", "Rabbit"], ["龙", "Dragon"], ["蛇", "Snake"], ["马", "Horse"], ["羊", "Goat"], ["猴", "Monkey"], ["鸡", "Rooster"], ["狗", "Dog"], ["猪", "Pig"]];
const zodiacProfiles = [
  { personality: ["机智灵敏", "适应力强", "善于交际"], personalityEn: ["Quick-witted", "Adaptable", "Sociable"], symbolism: "鼠对应子支，是十二地支循环的起点。传统意象常联系敏锐、生命力与善于把握细微机会，也寓有新周期萌发、生机延续之意。", symbolismEn: "The Rat corresponds to Zi, the opening branch of the twelve-part cycle. It traditionally evokes alertness, vitality and an ability to notice small opportunities, while suggesting the beginning and renewal of a new cycle." },
  { personality: ["踏实稳重", "勤奋努力", "责任心强"], personalityEn: ["Steady", "Diligent", "Responsible"], symbolism: "牛与农耕、土地和收获紧密相连，象征勤劳、坚韧与值得信赖的力量。它所代表的成就并非急进，而是来自长期耕耘与稳健积累。", symbolismEn: "The Ox is closely linked with farming, land and harvest. It symbolizes diligence, endurance and dependable strength, with achievement arising through patient work and steady accumulation." },
  { personality: ["勇敢果断", "自信独立", "富有领导力"], personalityEn: ["Courageous", "Decisive", "Independent"], symbolism: "虎在中国文化中具有威严、勇武与守护的意象，常见于镇护辟邪的民俗表达。它也象征面对挑战时的胆识、行动力与正直气概。", symbolismEn: "In Chinese culture the Tiger conveys authority, courage and protection, often appearing in guardian traditions. It also symbolizes boldness, action and integrity when facing challenges." },
  { personality: ["温和善良", "心思细腻", "谨慎敏感"], personalityEn: ["Gentle", "Thoughtful", "Perceptive"], symbolism: "兔常与温雅、安宁和灵敏相连，也因月宫玉兔的故事具有长寿与祥瑞联想。其文化意象强调柔和并非软弱，而是一种细致而从容的力量。", symbolismEn: "The Rabbit is associated with gentleness, peace and sensitivity. Through the Moon Rabbit legend it also carries ideas of longevity and auspiciousness, presenting softness as attentive and composed strength." },
  { personality: ["自信强大", "志向远大", "富有创造力"], personalityEn: ["Confident", "Ambitious", "Creative"], symbolism: "龙汇聚多种瑞兽特征，是中华文化中尊贵、祥瑞与生生不息的重要象征。它联系风云水势、开拓精神和向上力量，寓意格局、担当与创造。", symbolismEn: "The Dragon combines features of several auspicious creatures and is a major Chinese symbol of dignity, good fortune and enduring vitality. It evokes transformative energy, vision, responsibility and creation." },
  { personality: ["聪明睿智", "冷静沉着", "洞察力强"], personalityEn: ["Wise", "Composed", "Insightful"], symbolism: "蛇的蜕皮使其具有更新、转化与生命延续的文化联想。它也常象征深思、智慧和含蓄的判断力，强调在安静观察之后把握时机。", symbolismEn: "Because it sheds its skin, the Snake carries associations of renewal, transformation and continuity. It also symbolizes reflection, wisdom and restrained judgment that acts after careful observation." },
  { personality: ["自由奔放", "热情开朗", "行动力强"], personalityEn: ["Free-spirited", "Warm", "Energetic"], symbolism: "马与奔赴、道路和功业相连，常见‘马到成功’‘龙马精神’等吉祥表达。它象征开阔、进取、生命活力，以及把理想转化为行动的能力。", symbolismEn: "The Horse is linked with journeys, open roads and achievement, reflected in auspicious phrases about swift success and vigorous spirit. It symbolizes freedom, progress, vitality and turning ideals into action." },
  { personality: ["温和善良", "富有同情心", "追求和谐"], personalityEn: ["Kind", "Compassionate", "Harmonious"], symbolism: "羊因‘羊’与‘祥’的古文字文化联系，常承载温良、吉庆与和美的寓意。它也与群体照应、礼让和丰足相连，体现柔和而稳定的亲和力。", symbolismEn: "Through an old cultural connection between the characters for goat and auspiciousness, the Goat conveys kindness, harmony and good fortune. It also suggests mutual care, courtesy and abundance." },
  { personality: ["聪明机智", "灵活多变", "好奇心强"], personalityEn: ["Clever", "Flexible", "Curious"], symbolism: "猴在传统故事中常以聪慧、机变和探索精神出现。‘猴’与‘侯’的谐音也带来进阶与功名的吉祥联想，象征以才智应对变化。", symbolismEn: "In traditional stories the Monkey often represents intelligence, agility and exploration. A wordplay linking monkey with noble rank also gives it auspicious associations with advancement and using ingenuity to navigate change." },
  { personality: ["勤奋守时", "注重细节", "自信果断"], personalityEn: ["Punctual", "Attentive", "Decisive"], symbolism: "鸡鸣报晓标记昼夜交替，因此鸡象征守时、光明与新的开始。其忠实履行时序的形象，也寓有勤勉、守信和在恰当时刻发声的品格。", symbolismEn: "The Rooster's dawn call marks the transition from night to day, so it symbolizes punctuality, light and new beginnings. Its faithful rhythm also suggests diligence, reliability and speaking at the right moment." },
  { personality: ["忠诚可靠", "正直勇敢", "重情重义"], personalityEn: ["Loyal", "Upright", "Courageous"], symbolism: "狗长期承担守护家园与陪伴的角色，在中国民俗中象征忠诚、警觉与安定。其寓意强调信义、保护所珍视之人与面对不公的勇气。", symbolismEn: "The Dog has long served as guardian and companion, symbolizing loyalty, vigilance and security. Its meaning emphasizes trust, protecting what matters and courage in the face of injustice." },
  { personality: ["乐观随和", "知足常乐", "真诚宽厚"], personalityEn: ["Optimistic", "Content", "Sincere"], symbolism: "猪与家业、丰收和充足生活相连，传统意象多含福气、安康与富足。它也代表真诚、宽厚，以及懂得珍惜日常生活的朴实智慧。", symbolismEn: "The Pig is associated with household prosperity, harvest and a well-provided life, carrying meanings of blessing, wellbeing and abundance. It also represents sincerity, generosity and appreciation of everyday contentment." }
];
const stems = [
  { char: "甲", element: "木", polarity: "阳" }, { char: "乙", element: "木", polarity: "阴" },
  { char: "丙", element: "火", polarity: "阳" }, { char: "丁", element: "火", polarity: "阴" },
  { char: "戊", element: "土", polarity: "阳" }, { char: "己", element: "土", polarity: "阴" },
  { char: "庚", element: "金", polarity: "阳" }, { char: "辛", element: "金", polarity: "阴" },
  { char: "壬", element: "水", polarity: "阳" }, { char: "癸", element: "水", polarity: "阴" }
];
const branches = [
  { char: "子", element: "水", range: "23:00-01:00" }, { char: "丑", element: "土", range: "01:00-03:00" },
  { char: "寅", element: "木", range: "03:00-05:00" }, { char: "卯", element: "木", range: "05:00-07:00" },
  { char: "辰", element: "土", range: "07:00-09:00" }, { char: "巳", element: "火", range: "09:00-11:00" },
  { char: "午", element: "火", range: "11:00-13:00" }, { char: "未", element: "土", range: "13:00-15:00" },
  { char: "申", element: "金", range: "15:00-17:00" }, { char: "酉", element: "金", range: "17:00-19:00" },
  { char: "戌", element: "土", range: "19:00-21:00" }, { char: "亥", element: "水", range: "21:00-23:00" }
];
const chinaTimeZone = "Asia/Shanghai";
const placeTimeZones = [
  { keywords: ["new york", "nyc", "boston", "philadelphia", "washington", "miami", "atlanta", "orlando", "montreal", "toronto"], timeZone: "America/New_York" },
  { keywords: ["chicago", "houston", "dallas", "austin", "minneapolis", "mexico city"], timeZone: "America/Chicago" },
  { keywords: ["denver", "phoenix", "salt lake city"], timeZone: "America/Denver" },
  { keywords: ["los angeles", "san francisco", "seattle", "vancouver", "las vegas", "san diego", "california"], timeZone: "America/Los_Angeles" },
  { keywords: ["london", "manchester", "dublin", "ireland", "united kingdom", "uk", "england", "portugal", "lisbon"], timeZone: "Europe/London" },
  { keywords: ["paris", "france", "berlin", "germany", "rome", "italy", "madrid", "spain", "amsterdam", "netherlands", "brussels", "belgium", "vienna", "austria", "copenhagen", "denmark", "oslo", "norway", "stockholm", "sweden", "warsaw", "poland", "prague", "czech", "switzerland", "zurich"], timeZone: "Europe/Paris" },
  { keywords: ["athens", "greece", "helsinki", "finland", "bucharest", "romania", "sofia", "bulgaria", "riga", "latvia", "vilnius", "lithuania", "tallinn", "estonia", "kyiv", "kiev", "ukraine"], timeZone: "Europe/Athens" },
  { keywords: ["istanbul", "turkey"], timeZone: "Europe/Istanbul" },
  { keywords: ["beijing", "shanghai", "guangzhou", "shenzhen", "china", "hong kong", "macau", "taipei", "taiwan", "singapore", "kuala lumpur"], timeZone: chinaTimeZone }
];

function createDefaultDatabase() {
  return { users: [], sessions: [], reports: [], guestOrders: [], memberOrders: [] };
}

function ensureDatabaseFile() {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  if (!fs.existsSync(databaseFile)) fs.writeFileSync(databaseFile, JSON.stringify(createDefaultDatabase(), null, 2));
}

function loadDatabase() {
  ensureDatabaseFile();
  try {
    const parsed = JSON.parse(fs.readFileSync(databaseFile, "utf8"));
    return {
      users: Array.isArray(parsed.users) ? parsed.users : [],
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
        reports: Array.isArray(parsed.reports) ? parsed.reports : [],
        guestOrders: Array.isArray(parsed.guestOrders) ? parsed.guestOrders : [],
        memberOrders: Array.isArray(parsed.memberOrders) ? parsed.memberOrders : []
    };
  } catch {
    const fallback = createDefaultDatabase();
    fs.writeFileSync(databaseFile, JSON.stringify(fallback, null, 2));
    return fallback;
  }
}

let database = loadDatabase();

function saveDatabase() {
  fs.writeFileSync(databaseFile, JSON.stringify(database, null, 2));
}

function isJwtLikeKey(value) {
  return /^\S+\.\S+\.\S+$/.test(String(value || "").trim());
}

function isSupabaseNewApiKey(value) {
  return /^sb_(publishable|secret)_/i.test(String(value || "").trim());
}

function getSupabaseHeaders(extraHeaders = {}) {
  const serviceKey = String(supabaseServiceRoleKey || "").trim();
  const anonKey = String(supabaseAnonKey || "").trim();
  const apiKey = serviceKey || anonKey;
  const headers = {
    ...(apiKey ? { apikey: apiKey } : {}),
    ...extraHeaders
  };

  // Legacy Supabase keys are JWTs and can be sent in Authorization.
  if (isJwtLikeKey(serviceKey)) {
    headers.Authorization = `Bearer ${serviceKey}`;
    return headers;
  }

  // New-style sb_secret / sb_publishable keys should be sent as apikey only.
  if (isSupabaseNewApiKey(serviceKey)) {
    return headers;
  }

  if (!serviceKey && isJwtLikeKey(anonKey)) {
    headers.Authorization = `Bearer ${anonKey}`;
  }
  return headers;
}

function normalizeSupabaseErrorMessage(message) {
  const text = String(message || "");
  if (/Expected 3 parts in JWT; got 1/i.test(text)) {
    return "Supabase key configuration is invalid. If you are using the new sb_secret key, keep it on SUPABASE_SERVICE_ROLE_KEY and do not send it as a Bearer JWT. If you are using legacy keys, SUPABASE_SERVICE_ROLE_KEY must be the full service_role JWT.";
  }
  return text;
}

function buildSupabaseUrl(resource, searchParams = {}) {
  const url = new URL(`/rest/v1/${resource}`, supabaseUrl);
  for (const [key, value] of Object.entries(searchParams)) {
    if (value !== undefined && value !== null) url.searchParams.set(key, String(value));
  }
  return url;
}

async function supabaseRequest(resource, { method = "GET", searchParams = {}, body, headers = {}, allowEmpty = false } = {}) {
  const response = await fetch(buildSupabaseUrl(resource, searchParams), {
    method,
    headers: getSupabaseHeaders({
      "Content-Type": "application/json",
      Prefer: "return=representation",
      ...headers
    }),
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  if (!response.ok) {
        throw new Error(normalizeSupabaseErrorMessage(payload?.message || payload?.details || payload?.hint || `Supabase request failed for ${resource}`));
  }
  return allowEmpty ? payload : payload || [];
}

async function supabaseRpc(name, args = {}) {
  const response = await fetch(new URL(`/rest/v1/rpc/${name}`, supabaseUrl), {
    method: "POST",
    headers: getSupabaseHeaders({
      "Content-Type": "application/json",
      Prefer: "return=representation"
    }),
    body: JSON.stringify(args)
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : null;
  if (!response.ok) throw new Error(normalizeSupabaseErrorMessage(payload?.message || payload?.details || payload?.hint || `Supabase RPC failed for ${name}`));
  return payload;
}

function nextId(prefix) {
  return `${prefix}${crypto.randomUUID().replace(/-/g, "")}`;
}

function nowIso() {
  return new Date().toISOString();
}

function pad(number) {
  return String(number).padStart(2, "0");
}

function normalizeTier(tier) {
  return tier === "simple" ? "simple" : "complete";
}

function compactBody(body) {
  return {
    name: String(body.name || "").trim(),
    gender: body.gender || "neutral",
    birth: body.birth,
    birthTimeZone: String(body.birthTimeZone || "").trim(),
    place: body.place?.trim() || "",
    wish: body.wish?.trim() || "",
    tier: normalizeTier(body.tier)
  };
}

function normalizeEmail(email) {
  return String(email || "").trim().toLowerCase();
}

function validateEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  return {
    salt,
    hash: crypto.scryptSync(password, salt, 64).toString("hex")
  };
}

function verifyPassword(password, hash, salt) {
  const nextHash = crypto.scryptSync(password, salt, 64);
  const currentHash = Buffer.from(hash, "hex");
  return currentHash.length === nextHash.length && crypto.timingSafeEqual(currentHash, nextHash);
}

function sanitizeMembership(membership = {}) {
  return {
    planId: membership.planId || null,
    planName: membership.planName || "No active membership",
    status: membership.status || "inactive",
    renewalAt: membership.renewalAt || null,
    cancelAtPeriodEnd: Boolean(membership.cancelAtPeriodEnd)
  };
}

function sanitizeUserRecord(user) {
  return {
    ...user,
    creditsBalance: Number(user.creditsBalance) || 0,
    membership: sanitizeMembership(user.membership),
    ledger: Array.isArray(user.ledger) ? user.ledger : [],
    reportIds: Array.isArray(user.reportIds) ? user.reportIds : []
  };
}

function mapUserRow(row, ledger = [], reportIds = []) {
  return sanitizeUserRecord({
    id: row.id,
    email: row.email,
    displayName: row.display_name,
    passwordHash: row.password_hash,
    passwordSalt: row.password_salt,
    createdAt: row.created_at,
    creditsBalance: Number(row.credits_balance) || 0,
    membership: row.membership || {},
    ledger,
    reportIds
  });
}

function mapLedgerRow(row) {
  return {
    id: row.id,
    type: row.entry_type,
    source: row.source,
    description: row.description,
    creditsDelta: row.credits_delta,
    creditsBalanceAfter: row.credits_balance_after,
    referenceId: row.reference_id,
    createdAt: row.created_at
  };
}

function mapReportSummaryRow(row) {
  return {
    id: row.id,
    tier: row.tier,
    inputName: row.input_name,
    createdAt: row.created_at,
    zodiac: row.zodiac,
    previewNames: Array.isArray(row.preview_names) ? row.preview_names : [],
    resultUrl: buildMemberReportResultUrl(row.id),
    pdfUrl: buildMemberReportPdfUrl(row.id)
  };
}

function mapGuestOrderRow(row) {
  return {
    id: row.id,
    userId: row.user_id || null,
    accessToken: row.access_token,
    email: row.email,
    tier: row.tier,
    priceValue: row.price_value,
    paypalLink: row.paypal_link || null,
    paypalOrderId: row.paypal_order_id || null,
    paypalCaptureId: row.paypal_capture_id || null,
    paymentStatus: row.payment_status || null,
    paymentAmount: row.payment_amount || null,
    paymentCurrency: row.payment_currency || "USD",
    inputName: row.input_name,
    formBody: row.form_body,
    status: row.status,
    result: row.result || null,
    pdfBase64: row.pdf_base64 || null,
    pdfFileName: row.pdf_file_name || null,
    pdfGeneratedAt: row.pdf_generated_at || null,
    createdAt: row.created_at,
    fulfilledAt: row.fulfilled_at || null,
    paymentConfirmedAt: row.payment_confirmed_at || null,
    emailSentAt: row.email_sent_at || null,
    emailDeliveryStatus: row.email_delivery_status || null,
    emailDeliveryError: row.email_delivery_error || null
  };
}

function mapMemberOrderRow(row) {
  return {
    id: row.id,
    userId: row.user_id,
    itemType: row.item_type,
    itemId: row.item_id,
    itemName: row.item_name,
    amount: row.amount,
    currency: row.currency || "USD",
    creditsDelta: Number(row.credits_delta) || 0,
    status: row.status || "pending_payment",
    paypalOrderId: row.paypal_order_id || null,
    paypalCaptureId: row.paypal_capture_id || null,
    membershipPlanId: row.membership_plan_id || null,
    membershipPlanName: row.membership_plan_name || null,
    membershipRenewalAt: row.membership_renewal_at || null,
    createdAt: row.created_at,
    completedAt: row.completed_at || null
  };
}

function getMemberPlan(planId) {
  return Object.values(memberPlans).find(plan => plan.id === planId) || null;
}

function getPublicCatalog() {
  return {
    plans: Object.values(memberPlans),
    generationCosts: tierCreditCosts,
    welcomeCredits
  };
}

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    creditsBalance: user.creditsBalance,
    membership: sanitizeMembership(user.membership),
    createdAt: user.createdAt
  };
}

function addLedgerEntry(user, entry) {
  user.ledger = Array.isArray(user.ledger) ? user.ledger : [];
  user.creditsBalance = Number(user.creditsBalance) || 0;
  user.creditsBalance += entry.creditsDelta;
  const ledgerItem = {
    id: nextId("ledger_"),
    type: entry.type,
    source: entry.source,
    description: entry.description,
    creditsDelta: entry.creditsDelta,
    creditsBalanceAfter: user.creditsBalance,
    referenceId: entry.referenceId || null,
    createdAt: nowIso()
  };
  user.ledger.unshift(ledgerItem);
  user.ledger = user.ledger.slice(0, 100);
  return ledgerItem;
}

function createUserRecord(email, password, displayName) {
  const { salt, hash } = hashPassword(password);
  const user = sanitizeUserRecord({
    id: nextId("user_"),
    email,
    displayName,
    passwordHash: hash,
    passwordSalt: salt,
    createdAt: nowIso(),
    creditsBalance: 0,
    membership: {
      planId: null,
      planName: "No active membership",
      status: "inactive",
      renewalAt: null,
      cancelAtPeriodEnd: false
    },
    ledger: [],
    reportIds: []
  });
  addLedgerEntry(user, {
    type: "grant",
    source: "welcome",
    description: `Welcome credits for new account`,
    creditsDelta: welcomeCredits
  });
  return user;
}

async function findUserByEmail(email) {
  const normalizedEmail = normalizeEmail(email);
  if (!useSupabase) return database.users.find(user => user.email === normalizedEmail) || null;
  const rows = await supabaseRequest("app_users", {
    searchParams: {
      select: "*",
      email: `eq.${normalizedEmail}`,
      limit: 1
    }
  });
  return rows[0] ? mapUserRow(rows[0]) : null;
}

async function getUserById(userId) {
  if (!useSupabase) {
    const user = database.users.find(item => item.id === userId);
    return user ? sanitizeUserRecord(user) : null;
  }
  const rows = await supabaseRequest("app_users", {
    searchParams: {
      select: "*",
      id: `eq.${userId}`,
      limit: 1
    }
  });
  return rows[0] ? mapUserRow(rows[0]) : null;
}

async function getUserLedger(userId, limit = 20) {
  if (!useSupabase) {
    const user = database.users.find(item => item.id === userId);
    return user?.ledger?.slice(0, limit) || [];
  }
  const rows = await supabaseRequest("credit_ledger", {
    searchParams: {
      select: "*",
      user_id: `eq.${userId}`,
      order: "created_at.desc",
      limit
    }
  });
  return rows.map(mapLedgerRow);
}

async function getUserReportSummaries(userId, limit = 12) {
  if (!useSupabase) {
    const user = database.users.find(item => item.id === userId);
    return user ? listUserReports(user) : [];
  }
  const rows = await supabaseRequest("naming_reports", {
    searchParams: {
      select: "id,tier,input_name,created_at,zodiac,preview_names",
      user_id: `eq.${userId}`,
      order: "created_at.desc",
      limit
    }
  });
  return rows.map(mapReportSummaryRow);
}

function createGuestOrderRecord(userId, email, formBody) {
  const tier = normalizeTier(formBody.tier);
  const pricing = tierPricing[tier];
  const orderId = nextId("guest_");
  return {
    id: orderId,
    userId: userId || null,
    accessToken: nextId("gtok_"),
    email,
    tier,
    priceValue: pricing.value,
    paypalLink: null,
    paypalOrderId: null,
    paypalCaptureId: null,
    paymentStatus: "pending",
    paymentAmount: pricing.value,
    paymentCurrency: "USD",
    inputName: formBody.name,
    formBody,
    status: "pending_payment",
    result: null,
    pdfBase64: null,
    pdfFileName: `${orderId}-${tier}.pdf`,
    pdfGeneratedAt: null,
    createdAt: nowIso(),
    fulfilledAt: null,
    paymentConfirmedAt: null,
    emailSentAt: null,
    emailDeliveryStatus: "pending",
    emailDeliveryError: null
  };
}

function createMemberOrderRecord(user, plan) {
  const orderId = nextId("mord_");
  return {
    id: orderId,
    userId: user.id,
    itemType: plan.interval === "month" ? "membership" : "credit_pack",
    itemId: plan.id,
    itemName: plan.name,
    amount: plan.payPalValue,
    currency: "USD",
    creditsDelta: plan.credits,
    status: "pending_payment",
    paypalOrderId: null,
    paypalCaptureId: null,
    membershipPlanId: plan.interval === "month" ? plan.id : null,
    membershipPlanName: plan.interval === "month" ? plan.name : null,
    membershipRenewalAt: null,
    createdAt: nowIso(),
    completedAt: null
  };
}

async function getGuestOrderById(orderId) {
  if (!useSupabase) {
    return database.guestOrders.find(item => item.id === orderId) || null;
  }
  const rows = await supabaseRequest("guest_orders", {
    searchParams: {
      select: "*",
      id: `eq.${orderId}`,
      limit: 1
    }
  });
  return rows[0] ? mapGuestOrderRow(rows[0]) : null;
}

async function getGuestOrderByIdAndToken(orderId, token) {
  if (!useSupabase) {
    return database.guestOrders.find(item => item.id === orderId && item.accessToken === token) || null;
  }
  const rows = await supabaseRequest("guest_orders", {
    searchParams: {
      select: "*",
      id: `eq.${orderId}`,
      access_token: `eq.${token}`,
      limit: 1
    }
  });
  return rows[0] ? mapGuestOrderRow(rows[0]) : null;
}

async function getGuestOrderByIdAndEmail(orderId, email) {
  const normalizedEmail = normalizeEmail(email);
  if (!useSupabase) {
    return database.guestOrders.find(item => item.id === orderId && item.email === normalizedEmail) || null;
  }
  const rows = await supabaseRequest("guest_orders", {
    searchParams: {
      select: "*",
      id: `eq.${orderId}`,
      email: `eq.${normalizedEmail}`,
      limit: 1
    }
  });
  return rows[0] ? mapGuestOrderRow(rows[0]) : null;
}

async function insertGuestOrder(order) {
  if (!useSupabase) {
    database.guestOrders.unshift(order);
    database.guestOrders = database.guestOrders.slice(0, 500);
    saveDatabase();
    return order;
  }
  const rows = await supabaseRequest("guest_orders", {
    method: "POST",
    body: {
      id: order.id,
      user_id: order.userId,
      access_token: order.accessToken,
      email: order.email,
      tier: order.tier,
      price_value: order.priceValue,
      paypal_link: order.paypalLink,
          paypal_order_id: order.paypalOrderId,
          paypal_capture_id: order.paypalCaptureId,
          payment_status: order.paymentStatus,
          payment_amount: order.paymentAmount,
          payment_currency: order.paymentCurrency,
      input_name: order.inputName,
      form_body: order.formBody,
      status: order.status,
          pdf_base64: order.pdfBase64,
          pdf_file_name: order.pdfFileName,
          pdf_generated_at: order.pdfGeneratedAt,
      created_at: order.createdAt,
      email_delivery_status: order.emailDeliveryStatus
    }
  });
  return rows[0] ? mapGuestOrderRow(rows[0]) : order;
}

async function updateGuestOrder(orderId, token, updates) {
  if (!useSupabase) {
    const index = database.guestOrders.findIndex(item => item.id === orderId && item.accessToken === token);
    if (index === -1) return null;
    database.guestOrders[index] = { ...database.guestOrders[index], ...updates };
    saveDatabase();
    return database.guestOrders[index];
  }
  const rows = await supabaseRequest("guest_orders", {
    method: "PATCH",
    searchParams: {
      id: `eq.${orderId}`,
      access_token: `eq.${token}`
    },
    body: {
      ...(updates.status ? { status: updates.status } : {}),
          ...(updates.paypalLink !== undefined ? { paypal_link: updates.paypalLink } : {}),
          ...(updates.paypalOrderId !== undefined ? { paypal_order_id: updates.paypalOrderId } : {}),
          ...(updates.paypalCaptureId !== undefined ? { paypal_capture_id: updates.paypalCaptureId } : {}),
          ...(updates.paymentStatus !== undefined ? { payment_status: updates.paymentStatus } : {}),
          ...(updates.paymentAmount !== undefined ? { payment_amount: updates.paymentAmount } : {}),
          ...(updates.paymentCurrency !== undefined ? { payment_currency: updates.paymentCurrency } : {}),
      ...(updates.result !== undefined ? { result: updates.result } : {}),
          ...(updates.pdfBase64 !== undefined ? { pdf_base64: updates.pdfBase64 } : {}),
          ...(updates.pdfFileName !== undefined ? { pdf_file_name: updates.pdfFileName } : {}),
          ...(updates.pdfGeneratedAt !== undefined ? { pdf_generated_at: updates.pdfGeneratedAt } : {}),
      ...(updates.fulfilledAt ? { fulfilled_at: updates.fulfilledAt } : {}),
      ...(updates.paymentConfirmedAt ? { payment_confirmed_at: updates.paymentConfirmedAt } : {}),
      ...(updates.emailSentAt !== undefined ? { email_sent_at: updates.emailSentAt } : {}),
      ...(updates.emailDeliveryStatus !== undefined ? { email_delivery_status: updates.emailDeliveryStatus } : {}),
      ...(updates.emailDeliveryError !== undefined ? { email_delivery_error: updates.emailDeliveryError } : {})
    },
    allowEmpty: true
  });
  return rows?.[0] ? mapGuestOrderRow(rows[0]) : null;
}

async function listGuestOrders({ status, limit = 100 } = {}) {
  const normalizedLimit = Math.max(1, Math.min(Number(limit) || 100, 200));
  if (!useSupabase) {
    return database.guestOrders
      .filter(item => !status || item.status === status)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, normalizedLimit);
  }
  const rows = await supabaseRequest("guest_orders", {
    searchParams: {
      select: "*",
      order: "created_at.desc",
      limit: normalizedLimit,
      ...(status ? { status: `eq.${status}` } : {})
    }
  });
  return rows.map(mapGuestOrderRow);
}

async function listUserServiceOrders(userId, limit = 12) {
  const normalizedLimit = Math.max(1, Math.min(Number(limit) || 12, 50));
  if (!useSupabase) {
    return database.guestOrders
      .filter(item => item.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, normalizedLimit)
      .map(summarizeGuestOrder);
  }
  const rows = await supabaseRequest("guest_orders", {
    searchParams: {
      select: "*",
      user_id: `eq.${userId}`,
      order: "created_at.desc",
      limit: normalizedLimit
    }
  });
  return rows.map(mapGuestOrderRow).map(summarizeGuestOrder);
}

async function getMemberOrderById(orderId) {
  if (!useSupabase) {
    return database.memberOrders.find(item => item.id === orderId) || null;
  }
  const rows = await supabaseRequest("member_orders", {
    searchParams: {
      select: "*",
      id: `eq.${orderId}`,
      limit: 1
    }
  });
  return rows[0] ? mapMemberOrderRow(rows[0]) : null;
}

async function getMemberOrderByPayPalOrderId(payPalOrderId) {
  if (!useSupabase) {
    return database.memberOrders.find(item => item.paypalOrderId === payPalOrderId) || null;
  }
  const rows = await supabaseRequest("member_orders", {
    searchParams: {
      select: "*",
      paypal_order_id: `eq.${payPalOrderId}`,
      limit: 1
    }
  });
  return rows[0] ? mapMemberOrderRow(rows[0]) : null;
}

async function insertMemberOrder(order) {
  if (!useSupabase) {
    database.memberOrders.unshift(order);
    database.memberOrders = database.memberOrders.slice(0, 500);
    saveDatabase();
    return order;
  }
  const rows = await supabaseRequest("member_orders", {
    method: "POST",
    body: {
      id: order.id,
      user_id: order.userId,
      item_type: order.itemType,
      item_id: order.itemId,
      item_name: order.itemName,
      amount: order.amount,
      currency: order.currency,
      credits_delta: order.creditsDelta,
      status: order.status,
      paypal_order_id: order.paypalOrderId,
      paypal_capture_id: order.paypalCaptureId,
      membership_plan_id: order.membershipPlanId,
      membership_plan_name: order.membershipPlanName,
      membership_renewal_at: order.membershipRenewalAt,
      created_at: order.createdAt,
      completed_at: order.completedAt
    }
  });
  return rows[0] ? mapMemberOrderRow(rows[0]) : order;
}

async function updateMemberOrder(orderId, updates) {
  if (!useSupabase) {
    const index = database.memberOrders.findIndex(item => item.id === orderId);
    if (index === -1) return null;
    database.memberOrders[index] = { ...database.memberOrders[index], ...updates };
    saveDatabase();
    return database.memberOrders[index];
  }
  const rows = await supabaseRequest("member_orders", {
    method: "PATCH",
    searchParams: {
      id: `eq.${orderId}`
    },
    body: {
      ...(updates.status !== undefined ? { status: updates.status } : {}),
      ...(updates.paypalOrderId !== undefined ? { paypal_order_id: updates.paypalOrderId } : {}),
      ...(updates.paypalCaptureId !== undefined ? { paypal_capture_id: updates.paypalCaptureId } : {}),
      ...(updates.membershipRenewalAt !== undefined ? { membership_renewal_at: updates.membershipRenewalAt } : {}),
      ...(updates.completedAt !== undefined ? { completed_at: updates.completedAt } : {})
    },
    allowEmpty: true
  });
  return rows?.[0] ? mapMemberOrderRow(rows[0]) : null;
}

async function listUserMemberOrders(userId, limit = 12) {
  const normalizedLimit = Math.max(1, Math.min(Number(limit) || 12, 50));
  if (!useSupabase) {
    return database.memberOrders
      .filter(item => item.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, normalizedLimit);
  }
  const rows = await supabaseRequest("member_orders", {
    searchParams: {
      select: "*",
      user_id: `eq.${userId}`,
      order: "created_at.desc",
      limit: normalizedLimit
    }
  });
  return rows.map(mapMemberOrderRow);
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getAbsoluteUrl(relativePath) {
  if (!siteBaseUrl) return relativePath;
  const normalizedPath = String(relativePath || "").startsWith("/") ? relativePath : `/${relativePath}`;
  return `${siteBaseUrl}${normalizedPath}`;
}

function buildGuestOrderSuccessUrl(order) {
  return getAbsoluteUrl(`/checkout-success.html?order=${encodeURIComponent(order.id)}&access=${encodeURIComponent(order.accessToken)}`);
}

function buildGuestOrderDeliveryUrl(order) {
  return getAbsoluteUrl(`/?guestOrder=${encodeURIComponent(order.id)}&token=${encodeURIComponent(order.accessToken)}`);
}

function buildGuestOrderPdfUrl(order) {
  return getAbsoluteUrl(`/api/guest-orders/pdf?order=${encodeURIComponent(order.id)}&token=${encodeURIComponent(order.accessToken)}`);
}

function buildMemberReportResultUrl(reportId) {
  return getAbsoluteUrl(`/?memberReport=${encodeURIComponent(reportId)}`);
}

function buildMemberReportPdfUrl(reportId) {
  return getAbsoluteUrl(`/api/member/report/pdf?id=${encodeURIComponent(reportId)}`);
}

function summarizeMemberReport(report) {
  return {
    id: report.id,
    tier: report.tier,
    inputName: report.inputName,
    createdAt: report.createdAt,
    zodiac: report.zodiac,
    previewNames: Array.isArray(report.previewNames) ? report.previewNames : [],
    resultUrl: buildMemberReportResultUrl(report.id),
    pdfUrl: buildMemberReportPdfUrl(report.id)
  };
}

function isMailConfigured() {
  return Boolean(resendApiKey && mailFrom && siteBaseUrl);
}

function summarizeGuestOrder(order) {
  return {
    id: order.id,
    email: order.email,
    tier: order.tier,
    priceValue: order.priceValue,
    inputName: order.inputName,
    status: order.status,
    paymentStatus: order.paymentStatus || "pending",
    paypalOrderId: order.paypalOrderId || null,
    paypalCaptureId: order.paypalCaptureId || null,
    paymentAmount: order.paymentAmount || null,
    paymentCurrency: order.paymentCurrency || "USD",
    createdAt: order.createdAt,
    fulfilledAt: order.fulfilledAt,
    paymentConfirmedAt: order.paymentConfirmedAt,
    emailSentAt: order.emailSentAt,
    emailDeliveryStatus: order.emailDeliveryStatus || "pending",
    emailDeliveryError: order.emailDeliveryError,
    hasResult: Boolean(order.result),
    hasPdf: Boolean(order.pdfBase64),
    pdfGeneratedAt: order.pdfGeneratedAt || null,
    pdfUrl: order.pdfBase64 ? buildGuestOrderPdfUrl(order) : null,
    deliveryUrl: order.result ? buildGuestOrderDeliveryUrl(order) : null,
    successUrl: buildGuestOrderSuccessUrl(order)
  };
}

function summarizeMemberOrder(order) {
  return {
    id: order.id,
    itemType: order.itemType,
    itemId: order.itemId,
    itemName: order.itemName,
    amount: order.amount,
    currency: order.currency || "USD",
    creditsDelta: Number(order.creditsDelta) || 0,
    status: order.status,
    paypalOrderId: order.paypalOrderId || null,
    paypalCaptureId: order.paypalCaptureId || null,
    membershipPlanId: order.membershipPlanId || null,
    membershipPlanName: order.membershipPlanName || null,
    membershipRenewalAt: order.membershipRenewalAt || null,
    createdAt: order.createdAt,
    completedAt: order.completedAt || null
  };
}

function ensureDirSync(dirPath) {
  if (!fs.existsSync(dirPath)) fs.mkdirSync(dirPath, { recursive: true });
}

async function getPdfFontBytes() {
  ensureDirSync(fontCacheDir);
  if (fs.existsSync(pdfFontCacheFile)) return fs.readFileSync(pdfFontCacheFile);
  const response = await fetch(pdfFontUrl);
  if (!response.ok) throw new Error("Unable to download the PDF font file.");
  const buffer = Buffer.from(await response.arrayBuffer());
  fs.writeFileSync(pdfFontCacheFile, buffer);
  return buffer;
}

function formatReportDate(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) return nowIso().slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function wrapPdfText(text, font, size, maxWidth) {
  const source = String(text || "").replace(/\r/g, "");
  const paragraphs = source.split("\n");
  const lines = [];
  for (const paragraph of paragraphs) {
    const trimmed = paragraph.trim();
    if (!trimmed) {
      lines.push("");
      continue;
    }
    let current = "";
    for (const character of trimmed) {
      const candidate = current + character;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth || !current) {
        current = candidate;
      } else {
        lines.push(current);
        current = character;
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

function joinPdfBilingualText(zh, en) {
  const zhText = String(zh || "").trim();
  const enText = String(en || "").trim();
  if (zhText && enText) return `${zhText}\n${enText}`;
  return zhText || enText || "";
}

function getPdfAssetBuffer(relativePath) {
  const normalized = String(relativePath || "").replace(/^[/\\]+/, "");
  if (!normalized) return null;
  const rootPath = path.resolve(root);
  const filePath = path.resolve(root, normalized);
  if (filePath !== rootPath && !filePath.startsWith(`${rootPath}${path.sep}`)) return null;
  if (pdfAssetCache.has(filePath)) return pdfAssetCache.get(filePath);
  if (!fs.existsSync(filePath)) return null;
  const buffer = fs.readFileSync(filePath);
  pdfAssetCache.set(filePath, buffer);
  return buffer;
}

async function embedPdfAsset(pdfDoc, relativePath) {
  const buffer = getPdfAssetBuffer(relativePath);
  if (!buffer) return null;
  const extension = path.extname(String(relativePath || "")).toLowerCase();
  try {
    const image = extension === ".png" ? await pdfDoc.embedPng(buffer) : await pdfDoc.embedJpg(buffer);
    return { image, width: image.width, height: image.height };
  } catch {
    return null;
  }
}

function fitPdfImage(asset, maxWidth, maxHeight) {
  if (!asset?.width || !asset?.height) return { width: 0, height: 0 };
  const scale = Math.min(maxWidth / asset.width, maxHeight / asset.height);
  return {
    width: asset.width * scale,
    height: asset.height * scale
  };
}

function getZodiacAssetRelativePath(result) {
  const animalKey = String(result?.zodiac?.animalEn || "").trim().toLowerCase();
  return animalKey ? `/assets/zodiac/${animalKey}.jpg` : null;
}

async function buildNamingReportPdfBytes({
  reportId,
  editionLabel,
  ownerLabel,
  generatedDate,
  result,
  accessLines,
  isComplete
}) {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);
  const font = await pdfDoc.embedFont(await getPdfFontBytes(), { subset: false });
  const pageSize = [595.28, 841.89];
  const pageWidth = pageSize[0];
  const pageHeight = pageSize[1];
  const margin = 48;
  const maxWidth = pageWidth - margin * 2;
  const lineGap = 6;
  const colors = {
    ink: rgb(0.04, 0.11, 0.19),
    warm: rgb(0.62, 0.22, 0.17),
    soft: rgb(0.33, 0.27, 0.23),
    line: rgb(0.82, 0.74, 0.6),
    panel: rgb(0.97, 0.94, 0.88),
    paper: rgb(0.95, 0.92, 0.84)
  };

  const resultData = result || {};
  const culture = resultData.traditionalCulture || {};
  const zodiacTraits = Array.isArray(resultData.zodiac?.traits) ? resultData.zodiac.traits : [];
  const profile = culture.zodiacProfile || {};
  const zodiacImage = await embedPdfAsset(pdfDoc, getZodiacAssetRelativePath(resultData));
  const reportPreview = isComplete ? await embedPdfAsset(pdfDoc, "/assets/zodiac/report-overview.jpg") : null;

  let page = pdfDoc.addPage(pageSize);
  let y = pageHeight - margin;

  const beginNewPage = withHeader => {
    page = pdfDoc.addPage(pageSize);
    y = pageHeight - margin;
    if (!withHeader) return;
    page.drawText("Mingyu Chinese Naming Report", {
      x: margin,
      y,
      size: 12,
      font,
      color: colors.warm
    });
    y -= 18;
    page.drawLine({
      start: { x: margin, y },
      end: { x: pageWidth - margin, y },
      thickness: 1,
      color: colors.line
    });
    y -= 18;
  };

  const ensureSpace = neededHeight => {
    if (y - neededHeight >= margin) return;
    beginNewPage(true);
  };

  const drawTextLine = (text, { size = 11, color = colors.soft, x = margin } = {}) => {
    ensureSpace(size + lineGap);
    page.drawText(String(text || ""), { x, y, size, font, color });
    y -= size + lineGap;
  };

  const drawParagraph = (text, { size = 11, color = colors.soft, x = margin, gapAfter = 8, width = maxWidth - (x - margin) } = {}) => {
    const lines = wrapPdfText(text, font, size, width);
    for (const line of lines) drawTextLine(line || " ", { size, color, x });
    y -= gapAfter;
  };

  const drawDivider = (gapAfter = 14) => {
    ensureSpace(12);
    page.drawLine({
      start: { x: margin, y: y - 2 },
      end: { x: pageWidth - margin, y: y - 2 },
      thickness: 1,
      color: colors.line
    });
    y -= gapAfter;
  };

  const drawSectionTitle = (title, subtitle = "") => {
    drawTextLine(title, { size: 16, color: colors.ink });
    if (subtitle) drawTextLine(subtitle, { size: 10, color: colors.warm });
    y -= 4;
  };

  const drawCenteredAsset = (asset, maxAssetWidth, maxAssetHeight, gapAfter = 12) => {
    if (!asset) return;
    const dimensions = fitPdfImage(asset, maxAssetWidth, maxAssetHeight);
    ensureSpace(dimensions.height + gapAfter + 6);
    page.drawImage(asset.image, {
      x: (pageWidth - dimensions.width) / 2,
      y: y - dimensions.height,
      width: dimensions.width,
      height: dimensions.height
    });
    page.drawRectangle({
      x: (pageWidth - dimensions.width) / 2,
      y: y - dimensions.height,
      width: dimensions.width,
      height: dimensions.height,
      borderWidth: 1,
      borderColor: colors.line
    });
    y -= dimensions.height + gapAfter;
  };

  const drawTraditionalSnapshotPanel = cultureData => {
    const panelHeight = 236;
    const panelWidth = maxWidth;
    const panelX = margin;
    const panelY = y - panelHeight;
    const boxGap = 8;
    const boxCount = 4;
    const boxWidth = (panelWidth - boxGap * (boxCount + 1)) / boxCount;
    const boxHeight = 76;
    const boxTopY = panelY + panelHeight - 72 - boxHeight;
    const rowTop = panelY + 48;
    const rowCenterY = rowTop + 24;
    const elements = ["木", "火", "土", "金", "水"];
    const present = new Set([cultureData?.stem?.element, cultureData?.branch?.element, cultureData?.hourBranch?.element].filter(Boolean));
    const boxes = [
      {
        label: "年柱 / Year pillar",
        value: cultureData?.pillar || "-",
        note: `六十甲子 · 第 ${cultureData?.cycleNumber || "-"} 位`
      },
      {
        label: "天干 / Heavenly stem",
        value: `${cultureData?.stem?.char || "-"} · ${cultureData?.stem?.polarity || "-"}${cultureData?.stem?.element || ""}`.trim(),
        note: "体现年柱天干的阴阳与五行属性"
      },
      {
        label: "地支与生肖 / Branch & zodiac",
        value: `${cultureData?.branch?.char || "-"} · ${cultureData?.branch?.element || "-"} · ${cultureData?.branch?.zodiac || "-"}`.trim(),
        note: "地支与生肖为固定对应关系"
      },
      {
        label: "出生时辰 / Birth hour",
        value: `${cultureData?.hourBranch?.char || "-"}时 · ${cultureData?.hourBranch?.element || "-"}`.trim(),
        note: `${cultureData?.hourBranch?.range || "-"} · 北京时间 ${cultureData?.chinaBirthLabel || "-"}`
      }
    ];

    ensureSpace(panelHeight + 16);
    page.drawRectangle({
      x: panelX,
      y: panelY,
      width: panelWidth,
      height: panelHeight,
      color: colors.ink
    });
    page.drawRectangle({
      x: panelX,
      y: panelY,
      width: panelWidth,
      height: panelHeight,
      borderWidth: 1,
      borderColor: colors.line
    });
    page.drawText("干支 · 五行 · 时辰", {
      x: panelX + 18,
      y: panelY + panelHeight - 24,
      size: 10,
      font,
      color: colors.warm
    });
    page.drawText("传统时序文化解读", {
      x: panelX + 18,
      y: panelY + panelHeight - 46,
      size: 18,
      font,
      color: colors.paper
    });
    page.drawRectangle({
      x: panelX + panelWidth - 70,
      y: panelY + panelHeight - 50,
      width: 52,
      height: 32,
      color: colors.warm
    });
    page.drawText(`${cultureData?.stem?.char || "-"} ${cultureData?.branch?.char || "-"}`, {
      x: panelX + panelWidth - 58,
      y: panelY + panelHeight - 39,
      size: 16,
      font,
      color: colors.paper
    });

    for (let index = 0; index < boxes.length; index += 1) {
      const box = boxes[index];
      const x = panelX + boxGap + (boxWidth + boxGap) * index;
      page.drawRectangle({
        x,
        y: boxTopY,
        width: boxWidth,
        height: boxHeight,
        borderWidth: 1,
        borderColor: colors.line
      });
      page.drawText(box.label, {
        x: x + 8,
        y: boxTopY + boxHeight - 16,
        size: 8,
        font,
        color: colors.paper
      });
      const valueLines = wrapPdfText(box.value, font, 12, boxWidth - 16).slice(0, 2);
      let valueY = boxTopY + boxHeight - 36;
      for (const line of valueLines) {
        page.drawText(line, {
          x: x + 8,
          y: valueY,
          size: 12,
          font,
          color: colors.warm
        });
        valueY -= 14;
      }
      const noteLines = wrapPdfText(box.note, font, 7.5, boxWidth - 16).slice(0, 2);
      let noteY = boxTopY + 10;
      for (const line of noteLines.reverse()) {
        page.drawText(line, {
          x: x + 8,
          y: noteY,
          size: 7.5,
          font,
          color: rgb(0.82, 0.78, 0.7)
        });
        noteY += 9;
      }
    }

    const lineStartX = panelX + 120;
    const lineEndX = panelX + panelWidth - 120;
    page.drawLine({
      start: { x: lineStartX, y: rowCenterY },
      end: { x: lineEndX, y: rowCenterY },
      thickness: 1,
      color: colors.line
    });
    elements.forEach((element, index) => {
      const cx = lineStartX + ((lineEndX - lineStartX) / (elements.length - 1)) * index;
      const active = present.has(element);
      page.drawCircle({
        x: cx,
        y: rowCenterY,
        size: 16,
        color: active ? colors.warm : colors.ink,
        borderWidth: 1,
        borderColor: colors.line
      });
      page.drawText(element, {
        x: cx - 5,
        y: rowCenterY - 5,
        size: 11,
        font,
        color: active ? colors.ink : colors.paper
      });
    });

    page.drawRectangle({
      x: panelX + 18,
      y: panelY + 14,
      width: panelWidth - 36,
      height: 34,
      color: rgb(0.08, 0.2, 0.32)
    });
    page.drawLine({
      start: { x: panelX + 18, y: panelY + 14 },
      end: { x: panelX + 18, y: panelY + 48 },
      thickness: 2,
      color: colors.warm
    });
    const notePreview = wrapPdfText(cultureData?.note || "暂无传统文化说明。", font, 8, panelWidth - 64).slice(0, 2).join(" ");
    page.drawText("计算说明 / Method note", {
      x: panelX + 28,
      y: panelY + 33,
      size: 8,
      font,
      color: colors.paper
    });
    page.drawText(notePreview, {
      x: panelX + 120,
      y: panelY + 33,
      size: 7.5,
      font,
      color: rgb(0.82, 0.78, 0.7)
    });
    y = panelY - 16;
  };

  const drawPersonalitySnapshotPanel = profileData => {
    const zhTraits = Array.isArray(profileData?.personality) ? profileData.personality : [];
    const enTraits = Array.isArray(profileData?.personalityEn) ? profileData.personalityEn : [];
    const icons = ["志", "心", "行"];
    const titleHeight = 60;
    const rowHeight = 58;
    const noteHeight = 34;
    const panelHeight = titleHeight + Math.max(zhTraits.length, 1) * rowHeight + noteHeight + 18;
    const panelX = margin;
    const panelY = y - panelHeight;
    const panelWidth = maxWidth;
    const leftNumberWidth = 42;
    const leftIconWidth = 42;
    const cardX = panelX + 22;
    const cardWidth = panelWidth - 44;

    ensureSpace(panelHeight + 12);
    page.drawRectangle({
      x: panelX,
      y: panelY,
      width: panelWidth,
      height: panelHeight,
      color: colors.panel,
      borderWidth: 1,
      borderColor: colors.line
    });
    page.drawText("性格意象 · PERSONALITY", {
      x: panelX + 18,
      y: panelY + panelHeight - 24,
      size: 10,
      font,
      color: colors.warm
    });
    page.drawCircle({
      x: panelX + 34,
      y: panelY + panelHeight - 52,
      size: 18,
      color: colors.warm,
      borderWidth: 1,
      borderColor: colors.line
    });
    page.drawText("性", {
      x: panelX + 28,
      y: panelY + panelHeight - 58,
      size: 18,
      font,
      color: colors.paper
    });
    page.drawText("性格特征", {
      x: panelX + 58,
      y: panelY + panelHeight - 58,
      size: 20,
      font,
      color: colors.ink
    });

    zhTraits.forEach((trait, index) => {
      const rowY = panelY + panelHeight - titleHeight - 10 - rowHeight * (index + 1);
      const english = enTraits[index] || "";
      page.drawRectangle({
        x: cardX,
        y: rowY,
        width: cardWidth,
        height: rowHeight - 8,
        color: rgb(0.12, 0.47, 0.44)
      });
      page.drawLine({
        start: { x: cardX + leftNumberWidth, y: rowY },
        end: { x: cardX + leftNumberWidth, y: rowY + rowHeight - 8 },
        thickness: 1,
        color: rgb(0.29, 0.62, 0.58)
      });
      page.drawLine({
        start: { x: cardX + leftNumberWidth + leftIconWidth, y: rowY },
        end: { x: cardX + leftNumberWidth + leftIconWidth, y: rowY + rowHeight - 8 },
        thickness: 1,
        color: rgb(0.29, 0.62, 0.58)
      });
      page.drawText(`0${index + 1}`, {
        x: cardX + 12,
        y: rowY + 18,
        size: 10,
        font,
        color: colors.paper
      });
      page.drawText(icons[index % icons.length], {
        x: cardX + leftNumberWidth + 14,
        y: rowY + 18,
        size: 16,
        font,
        color: colors.paper
      });
      page.drawText(trait, {
        x: cardX + leftNumberWidth + leftIconWidth + 16,
        y: rowY + 30,
        size: 18,
        font,
        color: colors.paper
      });
      page.drawText(english, {
        x: cardX + leftNumberWidth + leftIconWidth + 16,
        y: rowY + 12,
        size: 13,
        font,
        color: colors.paper
      });
    });

    page.drawText("源自传统生肖文化的典型特征，仅作文化理解，不代表对个人性格的科学判定。", {
      x: panelX + 18,
      y: panelY + 16,
      size: 9,
      font,
      color: colors.soft
    });
    y = panelY - 14;
  };

  page.drawRectangle({
    x: 0,
    y: pageHeight - 190,
    width: pageWidth,
    height: 190,
    color: colors.ink
  });

  page.drawText("名屿 Mingyu", {
    x: margin,
    y: pageHeight - 54,
    size: 14,
    font,
    color: colors.paper
  });
  page.drawText("Chinese Naming Report", {
    x: margin,
    y: pageHeight - 88,
    size: 24,
    font,
    color: colors.paper
  });
  page.drawText(editionLabel, {
    x: margin,
    y: pageHeight - 118,
    size: 13,
    font,
    color: colors.paper
  });
  page.drawText(reportId, {
    x: margin,
    y: pageHeight - 144,
    size: 10,
    font,
    color: colors.paper
  });
  y = pageHeight - 216;

  drawParagraph(`${ownerLabel}\n生成日期 / Generated date: ${generatedDate}\n输入姓名 / Input name: ${resultData.inputName || "-"}`, {
    size: 11,
    color: colors.soft,
    gapAfter: 12
  });

  drawSectionTitle("你的生肖意象 / Zodiac", "网页上的生肖图现在也会进入 PDF");
  drawCenteredAsset(zodiacImage, 130, 130, 14);
  drawTextLine(`${resultData.zodiac?.years || "-"} · ${resultData.zodiac?.animal || "-"} · ${resultData.zodiac?.animalEn || "-"}`, {
    size: 15,
    color: colors.ink
  });
  if (zodiacTraits.length) {
    drawParagraph(`Traits / 特征: ${zodiacTraits.join(" · ")}`, {
      size: 10,
      color: colors.warm,
      gapAfter: 6
    });
  }
  drawParagraph(joinPdfBilingualText(resultData.summary || "暂无概览说明。", resultData.summaryEn || "Summary unavailable."), {
    size: 11,
    color: colors.soft,
    gapAfter: 10
  });
  drawDivider();

  if (isComplete) beginNewPage(true);

  drawSectionTitle("候选名字 / Name Options", "每个名字说明都同步输出中文与英文");
  if (reportPreview) {
    drawCenteredAsset(reportPreview, 176, 220, 14);
  }
  for (const option of Array.isArray(resultData.names) ? resultData.names : []) {
    ensureSpace(92);
    page.drawRectangle({
      x: margin,
      y: y - 80,
      width: maxWidth,
      height: 80,
      color: colors.panel,
      borderWidth: 1,
      borderColor: colors.line
    });
    y -= 12;
    drawTextLine(`${option.hanzi || ""}  ${option.pinyin || ""}`.trim(), { size: 13, color: colors.ink, x: margin + 12 });
    if (option.seal) drawTextLine(`Seal / 印记: ${option.seal}`, { size: 9, color: colors.warm, x: margin + 12 });
    if (option.tone) drawTextLine(`Tone / 声调: ${option.tone}`, { size: 9, color: colors.warm, x: margin + 12 });
    drawParagraph(joinPdfBilingualText(option.meaning || "", option.meaningEn || ""), {
      size: 9.5,
      color: colors.soft,
      x: margin + 12,
      width: maxWidth - 24,
      gapAfter: 8
    });
  }

  if (isComplete) {
    beginNewPage(true);
    drawSectionTitle("生肖文化详解 / Zodiac Culture", "完整版包含网页中的完整生肖文化解读");
    if (Array.isArray(profile.personality) && profile.personality.length) {
      drawPersonalitySnapshotPanel(profile);
    }
    drawParagraph(joinPdfBilingualText(profile.symbolism || "暂无生肖文化说明。", profile.symbolismEn || "Zodiac symbolism unavailable."), {
      size: 11,
      color: colors.soft,
      gapAfter: 8
    });
    beginNewPage(true);
    drawSectionTitle("传统时序文化解读 / Traditional Reading", "对应网页中的年柱、时辰与文化注解");
    drawTraditionalSnapshotPanel(culture);
    drawParagraph(
      [
        `原始出生时间 / Original birth time: ${culture.originalBirthLabel || "-"}`,
        `时区换算 / Timezone: ${culture.sourceTimeZone || "-"} -> ${culture.chinaBirthLabel || "-"}`,
        `年柱 / Year pillar: ${culture.pillar || "-"} · 六十甲子位次 / Cycle position: ${culture.cycleNumber || "-"}`,
        `天干 / Heavenly stem: ${culture.stem?.char || "-"} · ${culture.stem?.polarity || "-"}${culture.stem?.element || ""}`,
        `地支与生肖 / Earthly branch: ${culture.branch?.char || "-"} · ${culture.branch?.element || "-"} · ${culture.branch?.zodiac || "-"}`
      ].join("\n"),
      {
        size: 10,
        color: colors.soft,
        gapAfter: 8
      }
    );
    drawParagraph(joinPdfBilingualText(culture.note || "暂无传统文化说明。", culture.noteEn || "Traditional reading unavailable."), {
      size: 10,
      color: colors.soft,
      gapAfter: 8
    });
    if (resultData.culturalNote || resultData.culturalNoteEn) {
      drawSectionTitle("补充说明 / Additional Note", "对应网页结果底部的文化注解");
      drawParagraph(joinPdfBilingualText(resultData.culturalNote, resultData.culturalNoteEn || ""), {
        size: 10,
        color: colors.soft,
        gapAfter: 8
      });
    }
  } else if (resultData.culturalNote || resultData.culturalNoteEn) {
    drawDivider();
    drawSectionTitle("文化说明 / Cultural Note");
    drawParagraph(joinPdfBilingualText(resultData.culturalNote, resultData.culturalNoteEn || ""), {
      size: 11,
      color: colors.soft,
      gapAfter: 10
    });
  }

  drawDivider();
  drawSectionTitle("访问方式 / Access");
  drawParagraph(accessLines.join("\n"), {
    size: 10,
    color: colors.soft,
    gapAfter: 0
  });

  return Buffer.from(await pdfDoc.save());
}

async function buildGuestOrderPdfBytes(order) {
  const result = order.result || {};
  const culture = result.traditionalCulture || {};
  const editionLabel = order.tier === "simple" ? "简约版 · Simple Edition" : "完整版 · Complete Edition";
  const downloadUrl = buildGuestOrderPdfUrl(order);
  return buildNamingReportPdfBytes({
    reportId: `Guest Order · ${order.id}`,
    editionLabel,
    ownerLabel: `交付邮箱 / Delivery email: ${order.email}\n价格 / Price: USD ${order.priceValue}`,
    generatedDate: formatReportDate(order.fulfilledAt || order.createdAt),
    result: {
      ...result,
      inputName: result.inputName || order.inputName || order.formBody?.name || "-",
      traditionalCulture: culture
    },
    accessLines: [
      `Order ID: ${order.id}`,
      `Result page: ${buildGuestOrderDeliveryUrl(order)}`,
      `PDF download: ${downloadUrl}`
    ],
    isComplete: order.tier !== "simple"
  });
}

async function buildMemberReportPdfBytes(report, user) {
  const result = report.result || {};
  const editionLabel = report.tier === "simple" ? "简约版 · Simple Edition" : "完整版 · Complete Edition";
  const resultUrl = buildMemberReportResultUrl(report.id);
  const pdfUrl = buildMemberReportPdfUrl(report.id);
  return buildNamingReportPdfBytes({
    reportId: `Member Report · ${report.id}`,
    editionLabel,
    ownerLabel: `会员 / Member: ${user.displayName || user.email}\n账户邮箱 / Account email: ${user.email}`,
    generatedDate: formatReportDate(report.createdAt),
    result: {
      ...result,
      inputName: result.inputName || report.inputName || "-"
    },
    accessLines: [
      `Report ID: ${report.id}`,
      `Result page: ${resultUrl}`,
      `PDF download: ${pdfUrl}`
    ],
    isComplete: report.tier !== "simple"
  });
}

function buildGuestOrderEmail(order) {
  const editionLabel = order.tier === "simple" ? "Simple Edition" : "Complete Edition";
  const deliveryUrl = buildGuestOrderDeliveryUrl(order);
  const successUrl = buildGuestOrderSuccessUrl(order);
  const pdfUrl = order.pdfBase64 ? buildGuestOrderPdfUrl(order) : "";
  const supportUrl = getAbsoluteUrl("/order-lookup.html");
  const subject = `Your Mingyu Chinese naming result is ready (${order.id})`;
  const html = `
  <div style="font-family:Arial,sans-serif;background:#f6ecd8;padding:32px 16px;color:#30251d;">
    <div style="max-width:640px;margin:0 auto;background:#fffdf8;border:1px solid rgba(48,37,29,.12);padding:32px;">
      <p style="margin:0 0 12px;color:#9e392b;font-size:12px;letter-spacing:1.2px;">MINGYU DELIVERY</p>
      <h1 style="margin:0 0 16px;color:#071c31;font-size:28px;font-weight:400;">Your naming result is ready</h1>
      <p style="margin:0 0 14px;line-height:1.8;">Thank you for your order. We have saved your result so you can reopen it any time from the secure link below.</p>
      <div style="margin:20px 0;padding:18px;border-left:4px solid #176d68;background:rgba(23,109,104,.08);">
        <p style="margin:0 0 8px;"><strong>Order ID:</strong> ${escapeHtml(order.id)}</p>
        <p style="margin:0 0 8px;"><strong>Edition:</strong> ${escapeHtml(editionLabel)} · $${escapeHtml(order.priceValue)}</p>
        <p style="margin:0;"><strong>Delivery email:</strong> ${escapeHtml(order.email)}</p>
      </div>
      <p style="margin:20px 0 12px;">
        <a href="${escapeHtml(deliveryUrl)}" style="display:inline-block;padding:14px 22px;background:#9e392b;color:#fff8e9;text-decoration:none;">Open My Result</a>
      </p>
      ${pdfUrl ? `<p style="margin:0 0 14px;"><a href="${escapeHtml(pdfUrl)}">Download PDF directly</a></p>` : `<p style="margin:0 0 14px;line-height:1.8;">After opening your result, you can use the Save PDF button on the page to keep a local copy.</p>`}
      <p style="margin:0 0 8px;line-height:1.8;">Need to reopen the payment return page first? Use this secure continue link:</p>
      <p style="margin:0 0 14px;"><a href="${escapeHtml(successUrl)}">${escapeHtml(successUrl)}</a></p>
      <p style="margin:0 0 8px;line-height:1.8;">If you ever lose the page, you can recover the order here:</p>
      <p style="margin:0 0 18px;"><a href="${escapeHtml(supportUrl)}">${escapeHtml(supportUrl)}</a></p>
      <p style="margin:0;color:#7a6b5f;font-size:13px;line-height:1.8;">This email was sent automatically by Mingyu after your guest order was fulfilled.</p>
    </div>
  </div>`;
  const text = [
    "Your Mingyu naming result is ready.",
    `Order ID: ${order.id}`,
    `Edition: ${editionLabel} - $${order.priceValue}`,
    `Open your result: ${deliveryUrl}`,
    ...(pdfUrl ? [`Download PDF: ${pdfUrl}`] : ["Save PDF from the result page after opening it."]),
    `Continue from the payment return page: ${successUrl}`,
    `Recover your order later: ${supportUrl}`
  ].join("\n");
  return { subject, html, text };
}

async function sendGuestOrderEmail(order, { force = false } = {}) {
  if (!order?.id || !order?.accessToken) throw new Error("Guest order is incomplete.");
  if (!order.result) throw new Error("This order does not have a saved result yet.");
  if (!isMailConfigured()) {
    throw new Error("Email delivery is not configured. Set RESEND_API_KEY, MAIL_FROM, and SITE_BASE_URL.");
  }
  if (!force && order.emailDeliveryStatus === "sent") return order;

  const emailContent = buildGuestOrderEmail(order);
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: mailFrom,
      to: [order.email],
      ...(mailReplyTo ? { reply_to: mailReplyTo } : {}),
      subject: emailContent.subject,
      html: emailContent.html,
      text: emailContent.text
    })
  });
  const text = await response.text();
  let payload = {};
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = {};
    }
  }
  if (!response.ok) {
    const message = payload?.message || payload?.error || "Email delivery failed.";
    await updateGuestOrder(order.id, order.accessToken, {
      emailDeliveryStatus: "failed",
      emailDeliveryError: message
    });
    throw new Error(message);
  }

  const sentAt = nowIso();
  const updated = await updateGuestOrder(order.id, order.accessToken, {
    emailSentAt: sentAt,
    emailDeliveryStatus: "sent",
    emailDeliveryError: null
  });
  return updated || { ...order, emailSentAt: sentAt, emailDeliveryStatus: "sent", emailDeliveryError: null };
}

function parseCookies(req) {
  return Object.fromEntries(
    String(req.headers.cookie || "")
      .split(";")
      .map(chunk => chunk.trim())
      .filter(Boolean)
      .map(chunk => {
        const index = chunk.indexOf("=");
        return index === -1
          ? [chunk, ""]
          : [chunk.slice(0, index), decodeURIComponent(chunk.slice(index + 1))];
      })
  );
}

function buildSessionCookie(value, maxAgeSeconds) {
  const parts = [
    `${sessionCookieName}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAgeSeconds}`
  ];
  if (process.env.NODE_ENV === "production") parts.push("Secure");
  return parts.join("; ");
}

function buildAdminCookie(value, maxAgeSeconds) {
  const parts = [
    `${adminSessionCookieName}=${encodeURIComponent(value)}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${maxAgeSeconds}`
  ];
  if (process.env.NODE_ENV === "production") parts.push("Secure");
  return parts.join("; ");
}

function signAdminPayload(payload) {
  return crypto.createHmac("sha256", adminSessionSecret).update(payload).digest("hex");
}

function createAdminToken(username) {
  const expiresAt = Date.now() + adminSessionLifetimeSeconds * 1000;
  const payload = `${username}.${expiresAt}`;
  const signature = signAdminPayload(payload);
  return Buffer.from(`${payload}.${signature}`).toString("base64url");
}

function readAdminToken(token) {
  if (!token || !adminSessionSecret) return null;
  try {
    const raw = Buffer.from(token, "base64url").toString("utf8");
    const [username, expiresAt, signature] = raw.split(".");
    const payload = `${username}.${expiresAt}`;
    if (!username || !expiresAt || !signature) return null;
    if (signAdminPayload(payload) !== signature) return null;
    if (Number(expiresAt) < Date.now()) return null;
    return { username, expiresAt: Number(expiresAt) };
  } catch {
    return null;
  }
}

function isAdminConfigured() {
  return Boolean(adminUsername && adminPassword && adminSessionSecret);
}

function getAuthenticatedAdmin(req) {
  if (!isAdminConfigured()) return null;
  const token = parseCookies(req)[adminSessionCookieName];
  const session = readAdminToken(token);
  if (!session || session.username !== adminUsername) return null;
  return { username: session.username };
}

function requireAdmin(req, res) {
  const admin = getAuthenticatedAdmin(req);
  if (!admin) {
    send(res, 401, { error: "Please sign in as admin first." });
    return null;
  }
  return admin;
}

async function cleanupSessions() {
  if (!useSupabase) {
    const now = Date.now();
    database.sessions = database.sessions.filter(session => {
      const expiresAt = new Date(session.expiresAt).getTime();
      return Number.isFinite(expiresAt) && expiresAt > now;
    });
    return;
  }
  await supabaseRequest("app_sessions", {
    method: "DELETE",
    searchParams: { expires_at: `lt.${nowIso()}` },
    allowEmpty: true
  });
}

async function createSession(userId) {
  await cleanupSessions();
  const token = nextId("sess_");
  const sessionRow = {
    id: token,
    user_id: userId,
    created_at: nowIso(),
    expires_at: new Date(Date.now() + sessionLifetimeSeconds * 1000).toISOString()
  };
  if (!useSupabase) {
    database.sessions.push({
      id: token,
      userId,
      createdAt: sessionRow.created_at,
      expiresAt: sessionRow.expires_at
    });
    saveDatabase();
    return token;
  }
  await supabaseRequest("app_sessions", {
    method: "POST",
    body: sessionRow
  });
  return token;
}

async function destroySession(req) {
  const token = parseCookies(req)[sessionCookieName];
  if (!token) return;
  if (!useSupabase) {
    database.sessions = database.sessions.filter(session => session.id !== token);
    saveDatabase();
    return;
  }
  await supabaseRequest("app_sessions", {
    method: "DELETE",
    searchParams: { id: `eq.${token}` },
    allowEmpty: true
  });
}

async function getAuthenticatedUser(req) {
  await cleanupSessions();
  const token = parseCookies(req)[sessionCookieName];
  if (!token) return null;
  if (!useSupabase) {
    const session = database.sessions.find(item => item.id === token);
    if (!session) return null;
    const user = database.users.find(item => item.id === session.userId);
    return user ? sanitizeUserRecord(user) : null;
  }
  const sessions = await supabaseRequest("app_sessions", {
    searchParams: {
      select: "id,user_id,expires_at",
      id: `eq.${token}`,
      limit: 1
    }
  });
  if (!sessions[0]) return null;
  return getUserById(sessions[0].user_id);
}

function listUserReports(user) {
  const reportIds = Array.isArray(user.reportIds) ? user.reportIds : [];
  return reportIds
    .map(reportId => database.reports.find(report => report.id === reportId && report.userId === user.id))
    .filter(Boolean)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 12)
    .map(summarizeMemberReport);
}

function send(res, status, data, type = "application/json; charset=utf-8", extraHeaders = {}) {
  res.writeHead(status, { "Content-Type": type, "X-Content-Type-Options": "nosniff", ...extraHeaders });
  res.end(type.startsWith("application/json") ? JSON.stringify(data) : data);
}

function readJsonBody(req, res) {
  return new Promise(resolve => {
    let raw = "";
    req.on("data", chunk => {
      raw += chunk;
      if (raw.length > 100000) {
        send(res, 413, { error: "Request too large" });
        req.destroy();
      }
    });
    req.on("end", () => {
      try {
        resolve(JSON.parse(raw || "{}"));
      } catch {
        send(res, 400, { error: "Invalid request" });
        resolve(null);
      }
    });
  });
}

function validateGenerationBody(body) {
  if (!body.name?.trim() || !body.birth || !body.birthTimeZone) return "Name, birth date and birthplace time zone are required";
  if (Number.isNaN(new Date(body.birth).getTime())) return "Birth date is invalid";
  if (!isValidTimeZone(body.birthTimeZone)) return "Birthplace time zone is invalid";
  return null;
}

function validateGuestCheckoutBody(rawBody) {
  const body = compactBody(rawBody);
  const validationError = validateGenerationBody(body);
  if (validationError) return validationError;
  const email = normalizeEmail(rawBody.deliveryEmail || rawBody.email);
  if (!validateEmail(email)) return "A valid delivery email is required";
  return null;
}

function parseBirthInput(input) {
  const match = String(input || "").match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!match) return null;
  return {
    year: Number(match[1]),
    month: Number(match[2]),
    day: Number(match[3]),
    hour: Number(match[4]),
    minute: Number(match[5]),
    second: 0
  };
}

function inferTimeZoneFromPlace(place) {
  const source = String(place || "").trim().toLowerCase();
  if (!source) return { timeZone: chinaTimeZone, inferred: false };
  const match = placeTimeZones.find(entry => entry.keywords.some(keyword => source.includes(keyword)));
  return match ? { timeZone: match.timeZone, inferred: true } : { timeZone: chinaTimeZone, inferred: false };
}

function isValidTimeZone(timeZone) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone }).format();
    return true;
  } catch {
    return false;
  }
}

function getTimeZoneParts(date, timeZone) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
  const parts = Object.fromEntries(formatter.formatToParts(date).filter(part => part.type !== "literal").map(part => [part.type, part.value]));
  return {
    year: Number(parts.year),
    month: Number(parts.month),
    day: Number(parts.day),
    hour: Number(parts.hour),
    minute: Number(parts.minute),
    second: Number(parts.second)
  };
}

function getTimeZoneOffsetMinutes(date, timeZone) {
  const zoned = getTimeZoneParts(date, timeZone);
  const utcTime = Date.UTC(zoned.year, zoned.month - 1, zoned.day, zoned.hour, zoned.minute, zoned.second);
  return (utcTime - date.getTime()) / 60000;
}

function zonedDateTimeToUtc(parts, timeZone) {
  const utcGuess = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second || 0);
  const firstOffset = getTimeZoneOffsetMinutes(new Date(utcGuess), timeZone);
  let timestamp = utcGuess - firstOffset * 60000;
  const finalOffset = getTimeZoneOffsetMinutes(new Date(timestamp), timeZone);
  if (finalOffset !== firstOffset) timestamp = utcGuess - finalOffset * 60000;
  return new Date(timestamp);
}

function formatDateTimeLabel(parts) {
  return `${parts.year}.${pad(parts.month)}.${pad(parts.day)} ${pad(parts.hour)}:${pad(parts.minute)}`;
}

function resolveBirthContext(body) {
  const birthParts = parseBirthInput(body.birth);
  if (!birthParts) return null;
  const requestedTimeZone = String(body.birthTimeZone || "").trim();
  const source = requestedTimeZone && isValidTimeZone(requestedTimeZone)
    ? { timeZone: requestedTimeZone, inferred: false }
    : inferTimeZoneFromPlace(body.place);
  const utcDate = zonedDateTimeToUtc(birthParts, source.timeZone);
  const chinaParts = getTimeZoneParts(utcDate, chinaTimeZone);
  return {
    utcDate,
    sourceTimeZone: source.timeZone,
    sourceInferred: source.inferred,
    originalParts: birthParts,
    chinaParts,
    chinaLabel: formatDateTimeLabel(chinaParts),
    originalLabel: formatDateTimeLabel(birthParts)
  };
}

function traditionalCulture(body) {
  const birthContext = resolveBirthContext(body);
  const birth = birthContext?.chinaParts || parseBirthInput(body.birth);
  const calendarYear = birth.year;
  const month = birth.month;
  const day = birth.day;
  const traditionalYear = month < 2 || (month === 2 && day < 4) ? calendarYear - 1 : calendarYear;
  const cycleIndex = ((traditionalYear - 1984) % 60 + 60) % 60;
  const stem = stems[cycleIndex % 10];
  const branchIndex = cycleIndex % 12;
  const branch = branches[branchIndex];
  const [zodiac, zodiacEn] = signs[branchIndex];
  const zodiacProfile = zodiacProfiles[branchIndex];
  const hour = birth.hour;
  const hourBranch = branches[Math.floor(((hour + 1) % 24) / 2)];
  const sourceLabel = birthContext?.sourceTimeZone || chinaTimeZone;
  const timeNoteZh = birthContext
    ? `出生时间已按所选时区 ${sourceLabel} 换算为北京时间 ${birthContext.chinaLabel} 后计算年柱与时辰。`
    : "出生时间按北京时间理解后计算年柱与时辰。";
  const timeNoteEn = birthContext
    ? `The birth time is interpreted in the selected timezone ${sourceLabel} and converted to China Standard Time (${birthContext.chinaLabel}) before calculating the year pillar and birth hour.`
    : "The birth time is interpreted in China Standard Time before calculating the year pillar and birth hour.";
  return {
    basisYear: traditionalYear,
    pillar: `${stem.char}${branch.char}`,
    cycleNumber: cycleIndex + 1,
    stem,
    branch: { ...branch, zodiac, zodiacEn },
    hourBranch,
    zodiacProfile,
    originalBirthLabel: birthContext?.originalLabel || null,
    chinaBirthLabel: birthContext?.chinaLabel || formatDateTimeLabel(birth),
    sourceTimeZone: birthContext?.sourceTimeZone || chinaTimeZone,
    note: `${timeNoteZh} 年柱以公历约 2 月 4 日立春为界作文化计算；精确交节时刻、月柱、日柱与时干需结合出生地时区和专业万年历复核。当前结果不构成完整八字排盘，也不据此判断五行喜忌。`,
    noteEn: `${timeNoteEn} The year pillar uses approximately February 4 (Start of Spring) as its boundary. Exact solar-term timing and the month, day and hour stems require timezone-aware calendrical calculation. This is not a complete BaZi chart and does not claim an elemental deficiency.`
  };
}

function demoResult(body) {
  const culture = traditionalCulture(body);
  const year = culture.basisYear;
  const animal = culture.branch.zodiac;
  const animalEn = culture.branch.zodiacEn;
  return {
    zodiac: { animal, animalEn, years: String(year), traits: culture.zodiacProfile.personality, traitsEn: culture.zodiacProfile.personalityEn },
    summary: "你的出生时刻呈现出明朗而丰沛的文化意象。名字宜在行动力与沉静感之间取得平衡：既保留原名的个人气质，也以温润的字义承接内在秩序。以下名字不是简单音译，而是结合声音、汉字与文化联想所作的跨文化表达。",
    summaryEn: "Your birth moment carries a bright, abundant cultural image. A fitting name balances momentum with composure, preserving the character of your original name while adding calm inner order through meaning, sound and form.",
    names: [
      { hanzi: "林曜安", pinyin: "Lin Yao'an", seal: "曜安", meaning: "曜，是照耀与清朗；安，是从容与安定。名字寓意在广阔世界中保持明亮，也拥有安顿自我的力量。", meaningEn: "Yao evokes radiant clarity; An means peace and inner steadiness. Together they suggest a bright presence grounded by quiet confidence.", tone: "平 · 仄 · 平" },
      { hanzi: "沈知远", pinyin: "Shen Zhiyuan", seal: "知远", meaning: "知，代表洞察与求索；远，象征开阔的眼界。名字含有‘知行致远’的文化联想，温雅而坚定。", meaningEn: "Zhi means insight and learning; Yuan suggests a far-reaching vision. The name feels cultivated, composed and quietly ambitious.", tone: "仄 · 平 · 仄" },
      { hanzi: "苏景和", pinyin: "Su Jinghe", seal: "景和", meaning: "景，是光景与敬慕；和，是和谐与包容。整体意象如春日和光，亲切、明朗且具有国际感。", meaningEn: "Jing evokes light and admiration; He means harmony and openness. Its image is warm daylight: approachable, lucid and cosmopolitan.", tone: "平 · 仄 · 平" }
    ],
    culturalNote: `生肖是传统民俗中观察时间与生命节律的一种象征语言，并非对性格与命运的科学判定。${animal}的意象在这里作为理解时间与文化联想的入口。`,
    culturalNoteEn: `The zodiac is a symbolic language used in Chinese tradition to reflect on time and life rhythms, not a scientific claim about personality or destiny. Here, the ${animalEn} is a starting point for cultural interpretation.`,
    inputName: body.name,
    traditionalCulture: culture,
    demo: true
  };
}

function getAiConfig() {
  if (process.env.DEEPSEEK_API_KEY) {
    return {
      provider: "deepseek",
      apiKey: process.env.DEEPSEEK_API_KEY,
      model: process.env.DEEPSEEK_MODEL || "deepseek-v4-flash",
      url: "https://api.deepseek.com/chat/completions"
    };
  }

  if (process.env.OPENAI_API_KEY) {
    return {
      provider: "openai",
      apiKey: process.env.OPENAI_API_KEY,
      model: process.env.OPENAI_MODEL || "gpt-5.2",
      url: "https://api.openai.com/v1/responses"
    };
  }

  return null;
}

function getPayPalMode() {
  const configuredMode = String(process.env.PAYPAL_ENV || "").trim().toLowerCase();
  if (configuredMode && configuredMode !== "live" && configuredMode !== "sandbox") {
    throw new Error("PAYPAL_ENV must be either live or sandbox.");
  }
  if (configuredMode) return configuredMode;
  return process.env.NODE_ENV === "production" ? "live" : "sandbox";
}

function getPayPalConfig() {
  const clientId = String(process.env.PAYPAL_CLIENT_ID || "").trim();
  const clientSecret = String(process.env.PAYPAL_CLIENT_SECRET || "").trim();
  if (!clientId || !clientSecret) return null;
  const mode = getPayPalMode();
  return {
    clientId,
    clientSecret,
    mode,
    baseUrl: mode === "live" ? "https://api-m.paypal.com" : "https://api-m.sandbox.paypal.com"
  };
}

function getHostedPayPalLinks() {
  // Hosted payment links cannot be reconciled with a server-side PayPal order.
  // All customer payments use the REST Checkout flow.
  return { simple: null, complete: null };
}

function getHostedPayPalLink(tier) {
  const links = getHostedPayPalLinks();
  return links[normalizeTier(tier)] || null;
}

function cleanupOrders() {
  const cutoff = Date.now() - 1000 * 60 * 60 * 6;
  for (const [orderId, value] of orderStore.entries()) {
    if (value.createdAt < cutoff) orderStore.delete(orderId);
  }
}

async function fetchJson(url, options, errorMessage) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    const json = await response.json();
    if (!response.ok) throw new Error(json.error?.message || errorMessage);
    return json;
  } catch (error) {
    if (error.name === "AbortError") throw new Error("AI generation timed out. Please try again.");
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function buildPrompt(body, culture) {
  const tier = normalizeTier(body.tier);
  const styleGuide = tier === "simple"
    ? "Keep the result concise. Summary and culturalNote should each stay under 45 words per language. Each name meaning should stay under 28 words per language."
    : "Keep the writing vivid but still concise. Summary should stay under 85 words per language. culturalNote should stay under 65 words per language. Each name meaning should stay under 45 words per language.";
  const userProfile = compactBody(body);
  const cultureLine = [
    `year pillar: ${culture.pillar}`,
    `cycle number: ${culture.cycleNumber}`,
    `zodiac zh/en: ${culture.branch.zodiac}/${culture.branch.zodiacEn}`,
    `stem: ${culture.stem.char} ${culture.stem.polarity}${culture.stem.element}`,
    `branch: ${culture.branch.char} ${culture.branch.element}`,
    `hour branch: ${culture.hourBranch.char} ${culture.hourBranch.element} ${culture.hourBranch.range}`
  ].join("; ");

  return [
    "Return valid JSON only.",
    "Required shape:",
    '{"zodiac":{"animal":"","animalEn":"","years":"","traits":[],"traitsEn":[]},"summary":"","summaryEn":"","names":[{"hanzi":"","pinyin":"","seal":"","meaning":"","meaningEn":"","tone":""},{"hanzi":"","pinyin":"","seal":"","meaning":"","meaningEn":"","tone":""},{"hanzi":"","pinyin":"","seal":"","meaning":"","meaningEn":"","tone":""}],"culturalNote":"","culturalNoteEn":"","inputName":""}',
    "Task:",
    "Create three culturally grounded Chinese name options for an international user.",
    "Do not claim destiny, science, full BaZi accuracy, missing elements, or favorable elements.",
    "Use bilingual output for all narrative fields.",
    styleGuide,
    `User profile: ${JSON.stringify(userProfile)}`,
    `Deterministic culture context: ${cultureLine}`
  ].join("\n");
}

function readDeepSeekContent(json) {
  const message = json.choices?.[0]?.message;
  const content = message?.content;
  if (typeof content === "string" && content.trim()) return content.trim();

  if (Array.isArray(content)) {
    const text = content.map(item => item?.text || item?.content || "").join("").trim();
    if (text) return text;
  }

  const fallback = json.output_text || message?.reasoning_content || "";
  return typeof fallback === "string" ? fallback.trim() : "";
}

async function requestDeepSeekJson(config, prompt, maxTokens, allowRetry = true) {
  const json = await fetchJson(config.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: config.model,
      max_tokens: maxTokens,
      temperature: 0.7,
      stream: false,
      thinking: { type: "disabled" },
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "You are a careful bilingual Chinese naming consultant. Return valid JSON only with no markdown fences." },
        { role: "user", content: prompt }
      ]
    })
  }, "DeepSeek request failed");

  const output = readDeepSeekContent(json);
  if (output) return JSON.parse(output);
  if (!allowRetry) throw new Error("DeepSeek returned empty content");
  return requestDeepSeekJson(config, `${prompt}\nIf you cannot comply, still return the required JSON shape with concise placeholder-safe values.`, Math.max(maxTokens, 1000), false);
}

async function requestAiResult(body, culture) {
  const config = getAiConfig();
  if (!config) return demoResult(body);

  const tier = normalizeTier(body.tier);
  const prompt = buildPrompt(body, culture);
  const maxTokens = tier === "simple" ? 700 : 1200;

  if (config.provider === "deepseek") return requestDeepSeekJson(config, prompt, maxTokens);

  const json = await fetchJson(config.url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: config.model,
      input: prompt,
      max_output_tokens: maxTokens,
      text: { format: { type: "json_object" } }
    })
  }, "OpenAI request failed");
  const output = json.output_text || json.output?.flatMap(item => item.content || []).find(item => item.type === "output_text")?.text;
  if (!output) throw new Error("OpenAI returned empty content");
  return JSON.parse(output);
}

async function buildPaidResult(body) {
  const culture = traditionalCulture(body);
  const result = await requestAiResult(body, culture);
  result.traditionalCulture = culture;
  result.zodiac = {
    ...result.zodiac,
    animal: culture.branch.zodiac,
    animalEn: culture.branch.zodiacEn,
    years: String(culture.basisYear),
    traits: culture.zodiacProfile.personality,
    traitsEn: culture.zodiacProfile.personalityEn
  };
  return result;
}

async function fetchPayPalAccessToken(config) {
  const response = await fetch(`${config.baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${config.clientId}:${config.clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded"
    },
    body: "grant_type=client_credentials"
  });
  const json = await response.json();
  if (!response.ok || !json.access_token) {
    if (config.mode === "live") {
      throw new Error("PayPal Live authentication failed. PAYPAL_ENV=live requires the Client ID and Secret from the same PayPal Live app; Sandbox credentials cannot process real payments.");
    }
    throw new Error(json.error_description || "PayPal Sandbox authentication failed.");
  }
  return json.access_token;
}

async function fetchPayPalJson(config, pathname, options, errorMessage) {
  const accessToken = await fetchPayPalAccessToken(config);
  const response = await fetch(`${config.baseUrl}${pathname}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...(options?.headers || {})
    }
  });
  const json = await response.json();
  if (!response.ok) throw new Error(json?.message || json?.details?.[0]?.description || errorMessage);
  return json;
}

function getGuestOrderCancelUrl(order) {
  const successUrl = buildGuestOrderSuccessUrl(order);
  return `${successUrl}${successUrl.includes("?") ? "&" : "?"}cancelled=1`;
}

function buildMemberOrderReturnUrl(order) {
  return getAbsoluteUrl(`/account.html?memberOrder=${encodeURIComponent(order.id)}`);
}

function buildMemberOrderCancelUrl(order) {
  const returnUrl = buildMemberOrderReturnUrl(order);
  return `${returnUrl}${returnUrl.includes("?") ? "&" : "?"}cancelled=1`;
}

function getPayPalApprovalLink(payPalOrder) {
  return payPalOrder?.links?.find(link => link.rel === "payer-action" || link.rel === "approve")?.href || null;
}

function assertPayPalApprovalLinkMatchesMode(config, approvalUrl) {
  let hostname;
  try {
    hostname = new URL(approvalUrl).hostname.toLowerCase();
  } catch {
    throw new Error("PayPal returned an invalid approval URL.");
  }
  const isSandboxUrl = hostname === "sandbox.paypal.com" || hostname.endsWith(".sandbox.paypal.com");
  if (config.mode === "live" && isSandboxUrl) {
    throw new Error("PayPal returned a Sandbox checkout URL while PAYPAL_ENV=live. Verify that both credentials come from the same PayPal Live app and redeploy the service.");
  }
  return approvalUrl;
}

function extractPayPalCapture(payPalOrder) {
  const purchaseUnit = payPalOrder?.purchase_units?.[0] || {};
  const capture = purchaseUnit.payments?.captures?.[0] || null;
  return {
    status: capture?.status || payPalOrder?.status || null,
    captureId: capture?.id || null,
    amount: capture?.amount?.value || purchaseUnit.amount?.value || null,
    currency: capture?.amount?.currency_code || purchaseUnit.amount?.currency_code || "USD",
    customId: purchaseUnit.custom_id || purchaseUnit.invoice_id || purchaseUnit.reference_id || null
  };
}

function assertPayPalOrderMatchesGuestOrder(order, payPalOrder) {
  const capture = extractPayPalCapture(payPalOrder);
  if (capture.customId && capture.customId !== order.id) {
    throw new Error("The PayPal payment does not match this guest order.");
  }
  if (capture.amount && String(capture.amount) !== String(order.priceValue)) {
    throw new Error("The paid amount does not match this guest order.");
  }
  if (capture.currency && String(capture.currency).toUpperCase() !== "USD") {
    throw new Error("The paid currency does not match this guest order.");
  }
  return capture;
}

function assertPayPalOrderMatchesMemberOrder(order, payPalOrder) {
  const capture = extractPayPalCapture(payPalOrder);
  if (capture.customId && capture.customId !== order.id) {
    throw new Error("The PayPal payment does not match this member order.");
  }
  if (capture.amount && String(capture.amount) !== String(order.amount)) {
    throw new Error("The paid amount does not match this member order.");
  }
  if (capture.currency && String(capture.currency).toUpperCase() !== String(order.currency || "USD").toUpperCase()) {
    throw new Error("The paid currency does not match this member order.");
  }
  return capture;
}

async function createPayPalGuestCheckout(order) {
  const config = getPayPalConfig();
  if (!config) throw new Error("PayPal is not configured yet.");
  const created = await fetchPayPalJson(config, "/v2/checkout/orders", {
    method: "POST",
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{
        custom_id: order.id,
        invoice_id: order.id,
        description: `Mingyu Chinese Naming - ${tierPricing[order.tier].label}`,
        amount: {
          currency_code: order.paymentCurrency || "USD",
          value: order.priceValue
        }
      }],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: "Mingyu",
            landing_page: "GUEST_CHECKOUT",
            shipping_preference: "NO_SHIPPING",
            user_action: "PAY_NOW",
            return_url: buildGuestOrderSuccessUrl(order),
            cancel_url: getGuestOrderCancelUrl(order)
          }
        }
      }
    })
  }, "PayPal order creation failed");
  const approvalUrl = getPayPalApprovalLink(created);
  if (!approvalUrl) throw new Error("PayPal did not return an approval URL.");
  assertPayPalApprovalLinkMatchesMode(config, approvalUrl);
  return {
    paypalOrderId: created.id,
    paypalLink: approvalUrl,
    paymentStatus: String(created.status || "CREATED").toLowerCase()
  };
}

async function createPayPalMemberCheckout(order) {
  const config = getPayPalConfig();
  if (!config) throw new Error("PayPal is not configured yet.");
  const created = await fetchPayPalJson(config, "/v2/checkout/orders", {
    method: "POST",
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [{
        custom_id: order.id,
        invoice_id: order.id,
        description: order.itemName,
        amount: {
          currency_code: order.currency || "USD",
          value: order.amount
        }
      }],
      payment_source: {
        paypal: {
          experience_context: {
            brand_name: "Mingyu",
            landing_page: "LOGIN",
            shipping_preference: "NO_SHIPPING",
            user_action: "PAY_NOW",
            return_url: buildMemberOrderReturnUrl(order),
            cancel_url: buildMemberOrderCancelUrl(order)
          }
        }
      }
    })
  }, "PayPal order creation failed");
  const approvalUrl = getPayPalApprovalLink(created);
  if (!approvalUrl) throw new Error("PayPal did not return an approval URL.");
  assertPayPalApprovalLinkMatchesMode(config, approvalUrl);
  return {
    paypalOrderId: created.id,
    paypalLink: approvalUrl,
    paymentStatus: String(created.status || "CREATED").toLowerCase()
  };
}

function getRenewalAtFromNow(days = 30) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

async function applyMemberOrderPurchase(order) {
  const user = await getUserById(order.userId);
  if (!user) throw new Error("Account not found.");

  const completedAt = order.completedAt || nowIso();
  const renewalAt = order.membershipPlanId ? getRenewalAtFromNow(30) : null;
  const purchaseDescription = order.itemType === "membership"
    ? `${order.itemName} activated`
    : `${order.itemName} purchased`;

  if (!useSupabase) {
    const liveUser = database.users.find(item => item.id === order.userId);
    if (!liveUser) throw new Error("Account not found.");
    if (order.membershipPlanId) {
      liveUser.membership = {
        planId: order.membershipPlanId,
        planName: order.membershipPlanName || order.itemName,
        status: "active",
        renewalAt,
        cancelAtPeriodEnd: false
      };
    }
    addLedgerEntry(liveUser, {
      type: "grant",
      source: "purchase",
      description: `${purchaseDescription} · ${order.creditsDelta} credits added`,
      creditsDelta: order.creditsDelta,
      referenceId: order.id
    });
    saveDatabase();
    return {
      user: publicUser(liveUser),
      remainingCredits: liveUser.creditsBalance,
      membershipRenewalAt: renewalAt
    };
  }

  const nextBalance = (Number(user.creditsBalance) || 0) + (Number(order.creditsDelta) || 0);
  const nextMembership = order.membershipPlanId
    ? {
        planId: order.membershipPlanId,
        planName: order.membershipPlanName || order.itemName,
        status: "active",
        renewalAt,
        cancelAtPeriodEnd: false
      }
    : sanitizeMembership(user.membership);

  await supabaseRequest("app_users", {
    method: "PATCH",
    searchParams: {
      id: `eq.${order.userId}`
    },
    body: {
      credits_balance: nextBalance,
      membership: nextMembership
    },
    allowEmpty: true
  });
  await supabaseRequest("credit_ledger", {
    method: "POST",
    body: {
      id: nextId("ledger_"),
      user_id: order.userId,
      entry_type: "grant",
      source: "purchase",
      description: `${purchaseDescription} · ${order.creditsDelta} credits added`,
      credits_delta: order.creditsDelta,
      credits_balance_after: nextBalance,
      reference_id: order.id
    }
  });
  const updatedUser = await getUserById(order.userId);
  return {
    user: publicUser(updatedUser || { ...user, creditsBalance: nextBalance, membership: nextMembership }),
    remainingCredits: nextBalance,
    membershipRenewalAt: renewalAt
  };
}

async function confirmMemberOrderPayment(order, requestedPayPalOrderId = null) {
  const config = getPayPalConfig();
  if (!config) throw new Error("PayPal is not configured yet.");
  const payPalOrderId = requestedPayPalOrderId || order.paypalOrderId;
  if (!payPalOrderId) throw new Error("The PayPal order ID is missing for this member order.");
  if (order.paypalOrderId && requestedPayPalOrderId && order.paypalOrderId !== requestedPayPalOrderId) {
    throw new Error("This PayPal return does not match the current member order.");
  }

  const fetched = await fetchPayPalJson(config, `/v2/checkout/orders/${encodeURIComponent(payPalOrderId)}`, {
    method: "GET"
  }, "PayPal order lookup failed");
  let capture = assertPayPalOrderMatchesMemberOrder(order, fetched);
  let payPalOrder = fetched;

  if (capture.status !== "COMPLETED") {
    if (String(fetched.status || "").toUpperCase() !== "APPROVED") {
      throw new Error("PayPal payment has not been approved yet.");
    }
    payPalOrder = await fetchPayPalJson(config, `/v2/checkout/orders/${encodeURIComponent(payPalOrderId)}/capture`, {
      method: "POST",
      body: JSON.stringify({})
    }, "PayPal capture failed");
    capture = assertPayPalOrderMatchesMemberOrder(order, payPalOrder);
  }

  if (capture.status !== "COMPLETED") {
    throw new Error("PayPal payment is not completed yet.");
  }

  const updated = await updateMemberOrder(order.id, {
    status: "paid",
    paypalOrderId: payPalOrderId,
    paypalCaptureId: capture.captureId
  });
  return updated || { ...order, status: "paid", paypalOrderId: payPalOrderId, paypalCaptureId: capture.captureId };
}

async function ensureMemberOrderCompleted(order, requestedPayPalOrderId = null) {
  let liveOrder = order;
  if (liveOrder.status !== "completed") {
    if (liveOrder.status !== "paid") {
      liveOrder = await confirmMemberOrderPayment(liveOrder, requestedPayPalOrderId);
    }
    const completedAt = liveOrder.completedAt || nowIso();
    const applied = await applyMemberOrderPurchase(liveOrder);
    liveOrder = await updateMemberOrder(liveOrder.id, {
      status: "completed",
      membershipRenewalAt: applied.membershipRenewalAt,
      completedAt
    }) || { ...liveOrder, status: "completed", membershipRenewalAt: applied.membershipRenewalAt, completedAt };
    return {
      order: liveOrder,
      user: applied.user,
      remainingCredits: applied.remainingCredits
    };
  }

  const currentUser = await getUserById(liveOrder.userId);
  return {
    order: liveOrder,
    user: publicUser(currentUser || { ...order, creditsBalance: 0 }),
    remainingCredits: currentUser?.creditsBalance ?? 0
  };
}

function isGuestOrderPaymentConfirmed(order) {
  const paymentStatus = String(order.paymentStatus || "").toLowerCase();
  return Boolean(order.paymentConfirmedAt) && (paymentStatus === "completed" || paymentStatus === "hosted_link_confirmed");
}

async function confirmHostedLinkGuestOrder(order) {
  if (!getHostedPayPalLink(order.tier)) {
    throw new Error("Hosted PayPal links are not configured for this guest order.");
  }
  const paymentConfirmedAt = order.paymentConfirmedAt || nowIso();
  const updates = {
    paymentStatus: "hosted_link_confirmed",
    paymentConfirmedAt,
    status: order.result ? order.status : "paid"
  };
  const updated = await updateGuestOrder(order.id, order.accessToken, updates);
  return updated || { ...order, ...updates };
}

async function confirmGuestOrderPayment(order, requestedPayPalOrderId = null) {
  const config = getPayPalConfig();
  if (!config) throw new Error("PayPal is not configured yet.");
  const payPalOrderId = requestedPayPalOrderId || order.paypalOrderId;
  if (!payPalOrderId) throw new Error("The PayPal order ID is missing for this guest order.");
  if (order.paypalOrderId && requestedPayPalOrderId && order.paypalOrderId !== requestedPayPalOrderId) {
    throw new Error("This PayPal return does not match the current guest order.");
  }

  const fetched = await fetchPayPalJson(config, `/v2/checkout/orders/${encodeURIComponent(payPalOrderId)}`, {
    method: "GET"
  }, "PayPal order lookup failed");
  let capture = assertPayPalOrderMatchesGuestOrder(order, fetched);
  let payPalOrder = fetched;

  if (capture.status !== "COMPLETED") {
    if (String(fetched.status || "").toUpperCase() !== "APPROVED") {
      throw new Error("PayPal payment has not been approved yet.");
    }
    payPalOrder = await fetchPayPalJson(config, `/v2/checkout/orders/${encodeURIComponent(payPalOrderId)}/capture`, {
      method: "POST",
      body: JSON.stringify({})
    }, "PayPal capture failed");
    capture = assertPayPalOrderMatchesGuestOrder(order, payPalOrder);
  }

  if (capture.status !== "COMPLETED") {
    throw new Error("PayPal payment is not completed yet.");
  }

  const paymentConfirmedAt = order.paymentConfirmedAt || nowIso();
  const updates = {
    paypalOrderId: payPalOrderId,
    paypalCaptureId: capture.captureId,
    paymentStatus: "completed",
    paymentAmount: capture.amount || order.priceValue,
    paymentCurrency: capture.currency || "USD",
    paymentConfirmedAt,
    status: order.result ? order.status : "paid"
  };
  const updated = await updateGuestOrder(order.id, order.accessToken, updates);
  return updated || { ...order, ...updates };
}

async function ensureGuestOrderFulfilled(order, requestedPayPalOrderId = null) {
  let liveOrder = order;
  if (!isGuestOrderPaymentConfirmed(liveOrder)) {
    if (liveOrder.paypalOrderId || requestedPayPalOrderId) {
      liveOrder = await confirmGuestOrderPayment(liveOrder, requestedPayPalOrderId);
    } else if (liveOrder.paypalLink && getHostedPayPalLink(liveOrder.tier) === liveOrder.paypalLink) {
      liveOrder = await confirmHostedLinkGuestOrder(liveOrder);
    } else {
      throw new Error("The PayPal order ID is missing for this guest order.");
    }
  }

  if (!liveOrder.result || !liveOrder.pdfBase64) {
    const result = liveOrder.result || await buildPaidResult(liveOrder.formBody);
    const pdfBuffer = liveOrder.pdfBase64 ? Buffer.from(liveOrder.pdfBase64, "base64") : await buildGuestOrderPdfBytes({ ...liveOrder, result });
    const fulfilledAt = liveOrder.fulfilledAt || nowIso();
    const updates = {
      status: "fulfilled",
      result,
      pdfBase64: pdfBuffer.toString("base64"),
      pdfGeneratedAt: liveOrder.pdfGeneratedAt || fulfilledAt,
      fulfilledAt
    };
    liveOrder = await updateGuestOrder(liveOrder.id, liveOrder.accessToken, updates) || { ...liveOrder, ...updates };
  }

  return liveOrder;
}

async function handleGenerate(req, res) {
  const user = await getAuthenticatedUser(req);
  if (!user) return send(res, 401, { error: "Please sign in before using the naming service." });
  const body = await readJsonBody(req, res);
  if (!body) return;
  const validationError = validateGenerationBody(body);
  if (validationError) return send(res, 422, { error: validationError });
  if (getPayPalConfig() && process.env.ALLOW_UNPAID_GENERATION !== "true") {
    return send(res, 402, { error: "Payment required. Please use the PayPal checkout flow or member credits." });
  }

  const culture = traditionalCulture(body);
  try {
    const result = await requestAiResult(body, culture);
    result.traditionalCulture = culture;
    result.zodiac = {
      ...result.zodiac,
      animal: culture.branch.zodiac,
      animalEn: culture.branch.zodiacEn,
      years: String(culture.basisYear),
      traits: culture.zodiacProfile.personality,
      traitsEn: culture.zodiacProfile.personalityEn
    };
    send(res, 200, result);
  } catch (error) {
    send(res, 502, { error: error.message });
  }
}

async function handlePayPalConfig(req, res) {
  const config = getPayPalConfig();
  const hostedLinks = getHostedPayPalLinks();
  send(res, 200, {
    enabled: Boolean(config),
    clientId: config?.clientId || null,
    currency: "USD",
    mode: config?.mode || null,
    live: config?.mode === "live",
    hostedLinks
  });
}

async function handleGuestOrderStart(req, res) {
  let created = null;
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) return send(res, 401, { error: "Please sign in before starting a naming order." });
    const rawBody = await readJsonBody(req, res);
    if (!rawBody) return;
    const validationError = validateGuestCheckoutBody(rawBody);
    if (validationError) return send(res, 422, { error: validationError });

    const formBody = compactBody(rawBody);
    created = await insertGuestOrder(createGuestOrderRecord(user.id, normalizeEmail(rawBody.deliveryEmail || rawBody.email), formBody));
      const hostedLink = getHostedPayPalLink(created.tier);
      const payPalCheckout = hostedLink
        ? {
            paypalOrderId: null,
            paypalLink: hostedLink,
            paymentStatus: "pending"
          }
        : await createPayPalGuestCheckout(created);
    const order = await updateGuestOrder(created.id, created.accessToken, {
      paypalOrderId: payPalCheckout.paypalOrderId,
      paypalLink: payPalCheckout.paypalLink,
      paymentStatus: payPalCheckout.paymentStatus,
      status: "pending_payment"
    }) || { ...created, ...payPalCheckout, status: "pending_payment" };
    send(res, 201, {
      orderId: order.id,
      accessToken: order.accessToken,
      paypalOrderId: order.paypalOrderId || null,
      tier: order.tier,
      email: order.email,
      approvalUrl: order.paypalLink,
      successUrl: buildGuestOrderSuccessUrl(order),
        deliveryUrl: buildGuestOrderDeliveryUrl(order),
        paymentMode: hostedLink ? "hosted_link" : "paypal_api"
    });
  } catch (error) {
    if (created?.id && created?.accessToken) {
      await updateGuestOrder(created.id, created.accessToken, {
        status: "payment_error",
        paymentStatus: "failed"
      });
    }
    send(res, 500, { error: error.message || "Failed to start guest checkout." });
  }
}

async function handleGuestOrderStatus(req, res, url) {
  const orderId = String(url.searchParams.get("order") || "");
  const token = String(url.searchParams.get("token") || "");
  if (!orderId || !token) return send(res, 422, { error: "Order ID and access token are required." });
  const order = await getGuestOrderByIdAndToken(orderId, token);
  if (!order) return send(res, 404, { error: "Order not found." });
  send(res, 200, {
    orderId: order.id,
    email: order.email,
    tier: order.tier,
    priceValue: order.priceValue,
    status: order.status,
    paymentStatus: order.paymentStatus || "pending",
    paypalOrderId: order.paypalOrderId || null,
    createdAt: order.createdAt,
    fulfilledAt: order.fulfilledAt,
    hasResult: Boolean(order.result),
    hasPdf: Boolean(order.pdfBase64),
    pdfUrl: order.pdfBase64 ? buildGuestOrderPdfUrl(order) : null
  });
}

async function handleGuestOrderLookup(req, res) {
  const body = await readJsonBody(req, res);
  if (!body) return;
  const orderId = String(body.orderId || "").trim();
  const email = normalizeEmail(body.email);
  if (!orderId || !validateEmail(email)) return send(res, 422, { error: "Order ID and a valid email are required." });
  const order = await getGuestOrderByIdAndEmail(orderId, email);
  if (!order) return send(res, 404, { error: "We could not find an order that matches this email and order ID." });
  send(res, 200, {
    orderId: order.id,
    accessToken: order.accessToken,
    status: order.status,
    paymentStatus: order.paymentStatus || "pending",
    successUrl: buildGuestOrderSuccessUrl(order),
    deliveryUrl: buildGuestOrderDeliveryUrl(order),
    pdfUrl: order.pdfBase64 ? buildGuestOrderPdfUrl(order) : null
  });
}

async function handleGuestOrderFulfill(req, res) {
  const body = await readJsonBody(req, res);
  if (!body) return;
  const orderId = String(body.orderId || "").trim();
  const token = String(body.token || "").trim();
  const payPalOrderId = String(body.paypalOrderId || "").trim() || null;
  if (!orderId || !token) return send(res, 422, { error: "Order ID and access token are required." });
  const stored = await getGuestOrderByIdAndToken(orderId, token);
  if (!stored) return send(res, 404, { error: "Order not found." });

  try {
    const fulfilledOrder = await ensureGuestOrderFulfilled(stored, payPalOrderId);
    send(res, 200, {
      orderId: fulfilledOrder.id,
      status: fulfilledOrder.status,
      paymentStatus: fulfilledOrder.paymentStatus || "completed",
      deliveryUrl: buildGuestOrderDeliveryUrl(fulfilledOrder),
      pdfUrl: fulfilledOrder.pdfBase64 ? buildGuestOrderPdfUrl(fulfilledOrder) : null,
      fulfilledAt: fulfilledOrder.fulfilledAt,
      emailSent: fulfilledOrder.emailDeliveryStatus === "sent",
      emailError: fulfilledOrder.emailDeliveryStatus === "failed" ? fulfilledOrder.emailDeliveryError : null
    });
  } catch (error) {
    send(res, 502, { error: error.message });
  }
}

async function handleGuestOrderResult(req, res, url) {
  const orderId = String(url.searchParams.get("order") || "");
  const token = String(url.searchParams.get("token") || "");
  if (!orderId || !token) return send(res, 422, { error: "Order ID and access token are required." });
  const order = await getGuestOrderByIdAndToken(orderId, token);
  if (!order) return send(res, 404, { error: "Order not found." });
  if (!order.result) return send(res, 409, { error: "This order has not been fulfilled yet." });
  send(res, 200, {
    orderId: order.id,
    email: order.email,
    tier: order.tier,
    status: order.status,
    paymentStatus: order.paymentStatus || "pending",
    createdAt: order.createdAt,
    fulfilledAt: order.fulfilledAt,
    pdfUrl: order.pdfBase64 ? buildGuestOrderPdfUrl(order) : null,
    result: order.result
  });
}

async function handleGuestOrderPdf(req, res, url) {
  const orderId = String(url.searchParams.get("order") || "");
  const token = String(url.searchParams.get("token") || "");
  if (!orderId || !token) return send(res, 422, { error: "Order ID and access token are required." });
  const order = await getGuestOrderByIdAndToken(orderId, token);
  if (!order) return send(res, 404, { error: "Order not found." });
  if (!order.result && !order.pdfBase64) return send(res, 409, { error: "This order does not have a saved PDF yet." });
  const fileName = order.pdfFileName || `${order.id}.pdf`;
  const fileBuffer = order.result
    ? await buildGuestOrderPdfBytes(order)
    : Buffer.from(order.pdfBase64, "base64");
  if (order.result) {
    await updateGuestOrder(order.id, order.accessToken, {
      pdfBase64: fileBuffer.toString("base64"),
      pdfGeneratedAt: nowIso()
    });
  }
  send(res, 200, fileBuffer, "application/pdf", {
    "Content-Disposition": `attachment; filename=\"${fileName}\"`,
    "Cache-Control": "private, max-age=60"
  });
}

async function handleAdminLogin(req, res) {
  if (!isAdminConfigured()) return send(res, 503, { error: "Admin login is not configured yet." });
  const body = await readJsonBody(req, res);
  if (!body) return;
  const username = String(body.username || "").trim();
  const password = String(body.password || "");
  if (username !== adminUsername || password !== adminPassword) {
    return send(res, 401, { error: "Incorrect admin username or password." });
  }
  const token = createAdminToken(username);
  send(res, 200, { ok: true, username }, "application/json; charset=utf-8", {
    "Set-Cookie": buildAdminCookie(token, adminSessionLifetimeSeconds)
  });
}

async function handleAdminLogout(req, res) {
  send(res, 200, { ok: true }, "application/json; charset=utf-8", {
    "Set-Cookie": buildAdminCookie("", 0)
  });
}

async function handleAdminSession(req, res) {
  const admin = getAuthenticatedAdmin(req);
  send(res, 200, {
    configured: isAdminConfigured(),
    authenticated: Boolean(admin),
    username: admin?.username || null,
    emailEnabled: isMailConfigured()
  });
}

async function handleAdminGuestOrders(req, res, url) {
  if (!requireAdmin(req, res)) return;
  const status = String(url.searchParams.get("status") || "").trim();
  const emailStatus = String(url.searchParams.get("emailStatus") || "").trim();
  const query = String(url.searchParams.get("q") || "").trim().toLowerCase();
  let orders = await listGuestOrders({ status: status || undefined, limit: url.searchParams.get("limit") || 100 });
  if (emailStatus) {
    orders = orders.filter(order => (order.emailDeliveryStatus || "pending") === emailStatus);
  }
  if (query) {
    orders = orders.filter(order =>
      order.id.toLowerCase().includes(query)
      || order.email.toLowerCase().includes(query)
      || String(order.inputName || "").toLowerCase().includes(query)
    );
  }
  send(res, 200, {
    orders: orders.map(summarizeGuestOrder),
    emailEnabled: isMailConfigured()
  });
}

async function handleAdminGuestOrderDetail(req, res, url) {
  if (!requireAdmin(req, res)) return;
  const orderId = String(url.searchParams.get("order") || "").trim();
  if (!orderId) return send(res, 422, { error: "Order ID is required." });
  const order = await getGuestOrderById(orderId);
  if (!order) return send(res, 404, { error: "Order not found." });
  send(res, 200, {
    order: {
      ...summarizeGuestOrder(order),
      accessToken: order.accessToken,
      formBody: order.formBody,
      result: order.result
    }
  });
}

async function handleAdminGuestOrderSendEmail(req, res) {
  if (!requireAdmin(req, res)) return;
  const body = await readJsonBody(req, res);
  if (!body) return;
  const orderId = String(body.orderId || "").trim();
  if (!orderId) return send(res, 422, { error: "Order ID is required." });
  const order = await getGuestOrderById(orderId);
  if (!order) return send(res, 404, { error: "Order not found." });
  const updated = await sendGuestOrderEmail(order, { force: body.force !== false });
  send(res, 200, {
    ok: true,
    order: summarizeGuestOrder(updated)
  });
}

async function handleCreatePayPalOrder(req, res) {
  const user = await getAuthenticatedUser(req);
  if (!user) return send(res, 401, { error: "Please sign in before starting checkout." });
  const config = getPayPalConfig();
  if (!config) return send(res, 503, { error: "PayPal is not configured yet." });

  const rawBody = await readJsonBody(req, res);
  if (!rawBody) return;
  const body = compactBody(rawBody);
  const validationError = validateGenerationBody(body);
  if (validationError) return send(res, 422, { error: validationError });

  cleanupOrders();
  const tier = normalizeTier(body.tier);
  const pricing = tierPricing[tier];
  try {
    const order = await fetchPayPalJson(config, "/v2/checkout/orders", {
      method: "POST",
      body: JSON.stringify({
        intent: "CAPTURE",
        purchase_units: [{
          description: `Mingyu Chinese Naming - ${pricing.label}`,
          amount: { currency_code: "USD", value: pricing.value }
        }]
      })
    }, "PayPal order creation failed");
    orderStore.set(order.id, { body, tier, createdAt: Date.now(), status: "CREATED" });
    send(res, 200, { id: order.id });
  } catch (error) {
    send(res, 502, { error: error.message });
  }
}

async function handleCapturePayPalOrder(req, res) {
  const user = await getAuthenticatedUser(req);
  if (!user) return send(res, 401, { error: "Please sign in before completing checkout." });
  const config = getPayPalConfig();
  if (!config) return send(res, 503, { error: "PayPal is not configured yet." });

  const body = await readJsonBody(req, res);
  if (!body?.orderID) return send(res, 422, { error: "PayPal order ID is required." });

  const stored = orderStore.get(body.orderID);
  if (!stored) return send(res, 404, { error: "PayPal order not found. Please restart checkout." });
  if (stored.status === "COMPLETED" && stored.result) return send(res, 200, stored.result);

  try {
    const capture = await fetchPayPalJson(config, `/v2/checkout/orders/${body.orderID}/capture`, {
      method: "POST",
      body: JSON.stringify({})
    }, "PayPal capture failed");
    const captureStatus = capture.purchase_units?.[0]?.payments?.captures?.[0]?.status || capture.status;
    if (captureStatus !== "COMPLETED") return send(res, 402, { error: "PayPal payment is not completed yet." });

    const result = await buildPaidResult(stored.body);
    stored.status = "COMPLETED";
    stored.result = result;
    orderStore.set(body.orderID, stored);
    send(res, 200, result);
  } catch (error) {
    send(res, 502, { error: error.message });
  }
}

async function handleRegister(req, res) {
  const body = await readJsonBody(req, res);
  if (!body) return;
  const email = normalizeEmail(body.email);
  const password = String(body.password || "");
  const displayName = String(body.displayName || "").trim() || email.split("@")[0] || "Member";
  if (!validateEmail(email)) return send(res, 422, { error: "A valid email address is required." });
  if (password.length < 8) return send(res, 422, { error: "Password must be at least 8 characters." });
  if (await findUserByEmail(email)) return send(res, 409, { error: "An account with this email already exists." });

  const user = createUserRecord(email, password, displayName);
  if (!useSupabase) {
    database.users.push(user);
    saveDatabase();
  } else {
    await supabaseRpc("app_register_user", {
      p_user_id: user.id,
      p_email: user.email,
      p_display_name: user.displayName,
      p_password_hash: user.passwordHash,
      p_password_salt: user.passwordSalt,
      p_welcome_credits: welcomeCredits
    });
  }
  const sessionToken = await createSession(user.id);
  send(res, 201, {
    user: publicUser(user),
    catalog: getPublicCatalog(),
    message: `Welcome to Mingyu. ${welcomeCredits} credits have been added to your new account.`
  }, "application/json; charset=utf-8", { "Set-Cookie": buildSessionCookie(sessionToken, sessionLifetimeSeconds) });
}

async function handleLogin(req, res) {
  const body = await readJsonBody(req, res);
  if (!body) return;
  const email = normalizeEmail(body.email);
  const password = String(body.password || "");
  const user = await findUserByEmail(email);
  if (!user || !verifyPassword(password, user.passwordHash, user.passwordSalt)) {
    return send(res, 401, { error: "Incorrect email or password." });
  }

  const sessionToken = await createSession(user.id);
  send(res, 200, {
    user: publicUser(user),
    catalog: getPublicCatalog()
  }, "application/json; charset=utf-8", { "Set-Cookie": buildSessionCookie(sessionToken, sessionLifetimeSeconds) });
}

async function handleLogout(req, res) {
  await destroySession(req);
  send(res, 200, { ok: true }, "application/json; charset=utf-8", { "Set-Cookie": buildSessionCookie("", 0) });
}

async function handleSession(req, res) {
  const user = await getAuthenticatedUser(req);
  send(res, 200, {
    loggedIn: Boolean(user),
    user: user ? publicUser(user) : null,
    catalog: getPublicCatalog()
  });
}

async function handleMemberOverview(req, res) {
  const user = await getAuthenticatedUser(req);
  if (!user) return send(res, 401, { error: "Please sign in first." });

  const safeLoad = async loader => {
    try {
      return await loader();
    } catch (error) {
      console.warn("Member overview partial load failed:", error.message);
      return [];
    }
  };

  send(res, 200, {
    user: publicUser(user),
    catalog: getPublicCatalog(),
    ledger: await safeLoad(() => getUserLedger(user.id, 20)),
    reports: await safeLoad(() => getUserReportSummaries(user.id, 12)),
    memberOrders: await safeLoad(async () => (await listUserMemberOrders(user.id, 12)).map(summarizeMemberOrder)),
    serviceOrders: await safeLoad(() => listUserServiceOrders(user.id, 12))
  });
}

async function handleMemberGenerate(req, res) {
  const user = await getAuthenticatedUser(req);
  if (!user) return send(res, 401, { error: "Please sign in to use member credits." });

  const rawBody = await readJsonBody(req, res);
  if (!rawBody) return;
  const body = compactBody(rawBody);
  const validationError = validateGenerationBody(body);
  if (validationError) return send(res, 422, { error: validationError });

  const tier = normalizeTier(body.tier);
  const creditCost = tierCreditCosts[tier];
  if (user.creditsBalance < creditCost) {
    return send(res, 402, { error: `Not enough credits. ${creditCost} credits are required for ${tier}.` });
  }

  try {
    const result = await buildPaidResult(body);
    let remainingCredits;
    let reportId;
    if (!useSupabase) {
      const liveUser = database.users.find(item => item.id === user.id);
      if (!liveUser) return send(res, 404, { error: "Account not found." });

      addLedgerEntry(liveUser, {
        type: "usage",
        source: "generation",
        description: `Used ${creditCost} credits for ${tier} generation`,
        creditsDelta: -creditCost
      });

      const reportRecord = {
        id: nextId("report_"),
        userId: liveUser.id,
        tier,
        inputName: body.name,
        createdAt: nowIso(),
        zodiac: `${result.zodiac.animal} · ${result.zodiac.animalEn}`,
        previewNames: result.names.map(item => item.hanzi),
        result
      };
      database.reports.push(reportRecord);
      liveUser.reportIds = Array.isArray(liveUser.reportIds) ? liveUser.reportIds : [];
      liveUser.reportIds.unshift(reportRecord.id);
      liveUser.reportIds = liveUser.reportIds.slice(0, 50);
      saveDatabase();
      remainingCredits = liveUser.creditsBalance;
      reportId = reportRecord.id;
    } else {
      const consumeResult = await supabaseRpc("app_consume_credits_and_store_report", {
        p_user_id: user.id,
        p_cost: creditCost,
        p_tier: tier,
        p_input_name: body.name,
        p_zodiac: `${result.zodiac.animal} · ${result.zodiac.animalEn}`,
        p_preview_names: result.names.map(item => item.hanzi),
        p_result: result
      });
      remainingCredits = consumeResult.remaining_credits;
      reportId = consumeResult.report_id;
    }

    result.membership = {
      consumedCredits: creditCost,
      remainingCredits,
      reportId,
      resultUrl: buildMemberReportResultUrl(reportId),
      pdfUrl: buildMemberReportPdfUrl(reportId)
    };
    send(res, 200, result);
  } catch (error) {
    send(res, 502, { error: error.message });
  }
}

async function handleMemberReport(req, res, url) {
  const user = await getAuthenticatedUser(req);
  if (!user) return send(res, 401, { error: "Please sign in first." });
  const reportId = url.searchParams.get("id");
  if (!reportId) return send(res, 422, { error: "Report ID is required." });

  if (!useSupabase) {
    const report = database.reports.find(item => item.id === reportId && item.userId === user.id);
    if (!report) return send(res, 404, { error: "Report not found." });
    send(res, 200, {
      report: summarizeMemberReport(report),
      result: report.result
    });
    return;
  }
  const rows = await supabaseRequest("naming_reports", {
    searchParams: {
      select: "id,tier,input_name,created_at,zodiac,preview_names,result",
      id: `eq.${reportId}`,
      user_id: `eq.${user.id}`,
      limit: 1
    }
  });
  if (!rows[0]) return send(res, 404, { error: "Report not found." });
  send(res, 200, {
    report: mapReportSummaryRow(rows[0]),
    result: rows[0].result
  });
}

async function handleMemberReportPdf(req, res, url) {
  const user = await getAuthenticatedUser(req);
  if (!user) return send(res, 401, { error: "Please sign in first." });
  const reportId = String(url.searchParams.get("id") || "").trim();
  if (!reportId) return send(res, 422, { error: "Report ID is required." });

  let report = null;
  if (!useSupabase) {
    const localReport = database.reports.find(item => item.id === reportId && item.userId === user.id);
    if (localReport) {
      report = {
        id: localReport.id,
        tier: localReport.tier,
        inputName: localReport.inputName,
        createdAt: localReport.createdAt,
        result: localReport.result
      };
    }
  } else {
    const rows = await supabaseRequest("naming_reports", {
      searchParams: {
        select: "id,tier,input_name,created_at,result",
        id: `eq.${reportId}`,
        user_id: `eq.${user.id}`,
        limit: 1
      }
    });
    if (rows[0]) {
      report = {
        id: rows[0].id,
        tier: rows[0].tier,
        inputName: rows[0].input_name,
        createdAt: rows[0].created_at,
        result: rows[0].result
      };
    }
  }

  if (!report) return send(res, 404, { error: "Report not found." });
  const fileBuffer = await buildMemberReportPdfBytes(report, user);
  send(res, 200, fileBuffer, "application/pdf", {
    "Content-Disposition": `attachment; filename=\"${report.id}.pdf\"`,
    "Cache-Control": "private, max-age=60"
  });
}

async function handleMemberPurchaseStart(req, res) {
  const user = await getAuthenticatedUser(req);
  if (!user) return send(res, 401, { error: "Please sign in first." });

  let created = null;
  try {
    const body = await readJsonBody(req, res);
    if (!body) return;
    const planId = String(body.planId || "").trim();
    const plan = getMemberPlan(planId);
    if (!plan) return send(res, 422, { error: "Selected plan is invalid." });

    created = await insertMemberOrder(createMemberOrderRecord(user, plan));
    const payPalCheckout = await createPayPalMemberCheckout(created);
    const order = await updateMemberOrder(created.id, {
      paypalOrderId: payPalCheckout.paypalOrderId,
      status: "pending_payment"
    }) || { ...created, paypalOrderId: payPalCheckout.paypalOrderId, status: "pending_payment" };

    send(res, 201, {
      orderId: order.id,
      approvalUrl: payPalCheckout.paypalLink,
      paypalOrderId: payPalCheckout.paypalOrderId,
      order: summarizeMemberOrder(order)
    });
  } catch (error) {
    if (created?.id) {
      await updateMemberOrder(created.id, { status: "payment_error" });
    }
    send(res, 500, { error: error.message || "Failed to start member purchase." });
  }
}

async function handleMemberPurchaseCapture(req, res) {
  const user = await getAuthenticatedUser(req);
  if (!user) return send(res, 401, { error: "Please sign in first." });
  const body = await readJsonBody(req, res);
  if (!body) return;

  const memberOrderId = String(body.memberOrderId || "").trim();
  const payPalOrderId = String(body.payPalOrderId || body.paypalOrderId || "").trim() || null;
  if (!memberOrderId) return send(res, 422, { error: "Member order ID is required." });

  const order = await getMemberOrderById(memberOrderId);
  if (!order || order.userId !== user.id) return send(res, 404, { error: "Member order not found." });

  try {
    const completed = await ensureMemberOrderCompleted(order, payPalOrderId);
    send(res, 200, {
      message: "Purchase completed successfully.",
      user: completed.user,
      remainingCredits: completed.remainingCredits,
      order: summarizeMemberOrder(completed.order)
    });
  } catch (error) {
    send(res, 502, { error: error.message });
  }
}

http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);
  const pathname = url.pathname;

  const task = (() => {
    if (req.method === "GET" && pathname === "/api/paypal-config") return handlePayPalConfig(req, res);
    if (req.method === "POST" && pathname === "/api/guest-orders/start") return handleGuestOrderStart(req, res);
    if (req.method === "GET" && pathname === "/api/guest-orders/status") return handleGuestOrderStatus(req, res, url);
    if (req.method === "POST" && pathname === "/api/guest-orders/lookup") return handleGuestOrderLookup(req, res);
    if (req.method === "POST" && pathname === "/api/guest-orders/fulfill") return handleGuestOrderFulfill(req, res);
    if (req.method === "GET" && pathname === "/api/guest-orders/result") return handleGuestOrderResult(req, res, url);
        if (req.method === "GET" && pathname === "/api/guest-orders/pdf") return handleGuestOrderPdf(req, res, url);
    if (req.method === "POST" && pathname === "/api/admin/login") return handleAdminLogin(req, res);
    if (req.method === "POST" && pathname === "/api/admin/logout") return handleAdminLogout(req, res);
    if (req.method === "GET" && pathname === "/api/admin/session") return handleAdminSession(req, res);
    if (req.method === "GET" && pathname === "/api/admin/guest-orders") return handleAdminGuestOrders(req, res, url);
    if (req.method === "GET" && pathname === "/api/admin/guest-orders/detail") return handleAdminGuestOrderDetail(req, res, url);
    if (req.method === "POST" && pathname === "/api/admin/guest-orders/send-email") return handleAdminGuestOrderSendEmail(req, res);
    if (req.method === "POST" && pathname === "/api/paypal/create-order") return handleCreatePayPalOrder(req, res);
    if (req.method === "POST" && pathname === "/api/paypal/capture-order") return handleCapturePayPalOrder(req, res);
    if (req.method === "POST" && pathname === "/api/generate") return handleGenerate(req, res);

    if (req.method === "POST" && pathname === "/api/auth/register") return handleRegister(req, res);
    if (req.method === "POST" && pathname === "/api/auth/login") return handleLogin(req, res);
    if (req.method === "POST" && pathname === "/api/auth/logout") return handleLogout(req, res);
    if (req.method === "GET" && pathname === "/api/auth/session") return handleSession(req, res);

    if (req.method === "GET" && pathname === "/api/member/overview") return handleMemberOverview(req, res);
    if (req.method === "POST" && pathname === "/api/member/purchase/start") return handleMemberPurchaseStart(req, res);
    if (req.method === "POST" && pathname === "/api/member/purchase/capture") return handleMemberPurchaseCapture(req, res);
    if (req.method === "POST" && pathname === "/api/member/generate") return handleMemberGenerate(req, res);
    if (req.method === "GET" && pathname === "/api/member/report") return handleMemberReport(req, res, url);
    if (req.method === "GET" && pathname === "/api/member/report/pdf") return handleMemberReportPdf(req, res, url);

    const safePath = pathname === "/" ? "/index.html" : pathname;
    const file = path.normalize(path.join(root, safePath));
    if (!file.startsWith(root)) return send(res, 403, "Forbidden", "text/plain; charset=utf-8");
    fs.readFile(file, (error, data) => {
      if (error) return send(res, 404, "Not found", "text/plain; charset=utf-8");
      send(res, 200, data, types[path.extname(file)] || "application/octet-stream");
    });
    return null;
  })();

  Promise.resolve(task).catch(error => {
    console.error(error);
    if (!res.headersSent) send(res, 500, { error: error.message || "Server error" });
  });
}).listen(port, () => console.log(`Mingyu is running at http://localhost:${port}`));
