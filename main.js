const STORAGE_KEY = "worktrack-prototype-state";

const requiredDocs = [
  { id: "contract", title: "Employment contract", detail: "Signed work agreement" },
  { id: "payslip", title: "Pay slips", detail: "Monthly wage evidence" },
  { id: "workProof", title: "Clock-in/out record", detail: "Photo, handwritten note, or time log" },
  { id: "id", title: "National ID / passport", detail: "Identity document" },
  { id: "bank", title: "Salary bank statement", detail: "Deposit history" },
  { id: "health", title: "Health certificate", detail: "May be requested for official process" }
];

const defaultState = {
  user: { name: "Will", country: "Nepal", payday: 15, language: "English" },
  isLoggedIn: false,
  activeTab: "home",
  selectedDate: toDateKey(new Date()),
  shift: { active: false, startedAt: null, elapsedBefore: 0 },
  logs: {},
  documents: {
    contract: { uploaded: true, date: "2026-04-12" },
    workProof: { uploaded: true, date: "2026-04-15" },
    id: { uploaded: true, date: "2026-04-10" }
  },
  categories: ["Normal day", "Overtime", "Late wage"]
};

let state = loadState();
let toastTimer = null;
let clockTimer = null;

const screens = [...document.querySelectorAll(".screen")];
const bottomNav = document.getElementById("bottomNav");
const calendarGrid = document.getElementById("calendarGrid");
const documentList = document.getElementById("documentList");
const checklist = document.getElementById("checklist");
const readinessList = document.getElementById("readinessList");
const sidePanel = document.getElementById("sidePanel");

document.addEventListener("DOMContentLoaded", () => {
  bindEvents();
  render();
  clockTimer = window.setInterval(renderTimer, 1000);
});

function bindEvents() {
  document.querySelectorAll("[data-go]").forEach((button) => {
    button.addEventListener("click", () => showScreen(button.dataset.go));
  });

  document.querySelectorAll("[data-go-tab]").forEach((button) => {
    button.addEventListener("click", () => setTab(button.dataset.goTab));
  });

  document.querySelectorAll(".nav-item").forEach((button) => {
    button.addEventListener("click", () => setTab(button.dataset.tab));
  });

  document.getElementById("loginButton").addEventListener("click", () => {
    state.isLoggedIn = true;
    saveState();
    setTab("home");
    showToast("Logged in locally. No data leaves this browser.");
  });

  document.getElementById("createProfileButton").addEventListener("click", () => {
    state.user.name = document.getElementById("signupName").value.trim() || "Worker";
    state.user.country = document.getElementById("signupCountry").value;
    state.user.payday = clamp(Number(document.getElementById("signupPayday").value), 1, 31);
    state.isLoggedIn = true;
    saveState();
    setTab("home");
    showToast("Profile created for this device.");
  });

  document.getElementById("shiftButton").addEventListener("click", toggleShift);
  document.getElementById("todayButton").addEventListener("click", () => {
    state.selectedDate = toDateKey(new Date());
    saveState();
    renderCalendar();
    renderLogPanel();
  });
  document.getElementById("saveLogButton").addEventListener("click", saveLog);
  document.getElementById("addCategoryButton").addEventListener("click", addCategory);
  document.getElementById("addDocumentButton").addEventListener("click", addCustomDocument);
  document.getElementById("prepareReportButton").addEventListener("click", () => {
    showToast("Summary prepared locally. Bring these records when asking for support.");
  });
  document.getElementById("saveDraftButton").addEventListener("click", () => {
    showToast("Draft saved in this browser.");
  });

  document.getElementById("menuButton").addEventListener("click", openMenu);
  document.getElementById("closeMenuButton").addEventListener("click", closeMenu);
  document.getElementById("languageButton").addEventListener("click", cycleLanguage);

  document.querySelectorAll("[data-side-action]").forEach((button) => {
    button.addEventListener("click", () => handleSideAction(button.dataset.sideAction));
  });
}

function render() {
  showScreen(state.isLoggedIn ? state.activeTab : "login");
  renderHome();
  renderCalendar();
  renderLogPanel();
  renderDocuments();
  renderReport();
  document.getElementById("languageLabel").textContent = state.user.language;
}

function showScreen(name) {
  screens.forEach((screen) => {
    screen.classList.toggle("active", screen.dataset.screen === name);
  });

  const appTabs = ["home", "calendar", "vault", "report"];
  bottomNav.classList.toggle("visible", appTabs.includes(name));
  document.querySelectorAll(".nav-item").forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === name);
  });
}

function setTab(tab) {
  state.activeTab = tab;
  saveState();
  showScreen(tab);
  if (tab === "report") renderReport();
}

function renderHome() {
  const today = new Date();
  document.getElementById("todayLabel").textContent = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric"
  });
  document.getElementById("homeGreeting").textContent = `${greeting()}, ${state.user.name}!`;
  renderTimer();

  const days = daysUntilPayday(today, state.user.payday);
  document.getElementById("paydayTitle").textContent =
    days === 0 ? "Paycheck day is today" : `Next payment in ${days} day${days === 1 ? "" : "s"}`;
  document.getElementById("paydaySubtitle").textContent =
    days === 0 ? "Upload your payslip after you receive it." : `Expected day ${state.user.payday} of this month.`;
}

function renderTimer() {
  const elapsed = getShiftElapsed();
  document.getElementById("timerDisplay").textContent = formatDuration(elapsed);
  document.getElementById("statusDot").classList.toggle("on", state.shift.active);
  document.getElementById("shiftStatus").textContent = state.shift.active ? "On shift" : "Off shift";
  document.getElementById("shiftIcon").textContent = state.shift.active ? "■" : "▶";
  document.getElementById("shiftActionLabel").textContent = state.shift.active ? "Tap to end work" : "Tap to start work";
}

function renderCalendar() {
  calendarGrid.innerHTML = "";
  const selected = parseDateKey(state.selectedDate);
  document.getElementById("monthLabel").textContent = selected.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric"
  });

  ["S", "M", "T", "W", "T", "F", "S"].forEach((day) => {
    const cell = document.createElement("div");
    cell.className = "weekday";
    cell.textContent = day;
    calendarGrid.appendChild(cell);
  });

  const first = new Date(selected.getFullYear(), selected.getMonth(), 1);
  const total = new Date(selected.getFullYear(), selected.getMonth() + 1, 0).getDate();
  for (let i = 0; i < first.getDay(); i += 1) {
    calendarGrid.appendChild(document.createElement("div"));
  }

  for (let day = 1; day <= total; day += 1) {
    const date = new Date(selected.getFullYear(), selected.getMonth(), day);
    const key = toDateKey(date);
    const button = document.createElement("button");
    button.type = "button";
    button.className = "calendar-day";
    button.textContent = String(day);
    button.classList.toggle("selected", key === state.selectedDate);
    button.classList.toggle("has-log", Boolean(state.logs[key]));
    button.classList.toggle("payday", day === state.user.payday);
    button.addEventListener("click", () => {
      state.selectedDate = key;
      saveState();
      renderCalendar();
      renderLogPanel();
    });
    calendarGrid.appendChild(button);
  }
}

function renderLogPanel() {
  const key = state.selectedDate;
  const log = state.logs[key] || {};
  document.getElementById("selectedDateLabel").textContent = parseDateKey(key).toLocaleDateString("en-US", {
    weekday: "long",
    month: "short",
    day: "numeric"
  });
  document.getElementById("workStartInput").value = log.start || "";
  document.getElementById("workEndInput").value = log.end || "";
  document.getElementById("payNoteInput").value = log.payNote || "";
  document.getElementById("diaryInput").value = log.diary || "";

  const savedChip = document.getElementById("savedChip");
  savedChip.textContent = state.logs[key] ? "Saved" : "Not saved";
  savedChip.classList.toggle("saved", Boolean(state.logs[key]));

  const selectedCategories = new Set(log.categories || []);
  const categoryRow = document.getElementById("categoryRow");
  categoryRow.innerHTML = "";
  state.categories.forEach((category) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "category-chip";
    button.textContent = category;
    button.classList.toggle("active", selectedCategories.has(category));
    button.addEventListener("click", () => button.classList.toggle("active"));
    categoryRow.appendChild(button);
  });
}

function renderDocuments() {
  documentList.innerHTML = "";
  Object.entries(getDocumentMap()).forEach(([id, doc]) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "document-card";
    button.setAttribute("aria-label", doc.uploaded ? `${doc.title} uploaded` : `Upload ${doc.title}`);
    button.innerHTML = `
      <span class="doc-icon">▤</span>
      <span>
        <h2>${doc.title}</h2>
        <p>${doc.uploaded ? `Uploaded on ${formatShortDate(doc.date)}` : doc.detail}</p>
      </span>
      <span class="doc-state ${doc.uploaded ? "done" : ""}">${doc.uploaded ? "Verified" : "Upload"}</span>
    `;
    button.addEventListener("click", () => toggleDocument(id));
    documentList.appendChild(button);
  });

  checklist.innerHTML = "";
  requiredDocs.forEach((doc) => {
    const row = document.createElement("div");
    const uploaded = Boolean(state.documents[doc.id]?.uploaded);
    row.className = `check-row ${uploaded ? "done" : ""}`;
    row.innerHTML = `<span>${uploaded ? "✓" : "○"}</span><strong>${doc.title}</strong>`;
    checklist.appendChild(row);
  });
}

function renderReport() {
  const checks = getReadinessChecks();
  const done = checks.filter((check) => check.done).length;
  const score = Math.round((done / checks.length) * 100);
  document.getElementById("readinessScore").textContent = `${score}%`;
  document.getElementById("taskDoneLabel").textContent = `${done} of ${checks.length} tasks done`;
  document.getElementById("progressFill").style.width = `${score}%`;

  const guidanceTitle = document.getElementById("guidanceTitle");
  const guidanceText = document.getElementById("guidanceText");
  const next = checks.find((check) => !check.done);
  if (next) {
    guidanceTitle.textContent = "Next useful step";
    guidanceText.textContent = next.nextStep;
  } else {
    guidanceTitle.textContent = "Record set looks ready";
    guidanceText.textContent = "You have enough local records to discuss the case with a support worker.";
  }

  readinessList.innerHTML = "";
  checks.forEach((check) => {
    const item = document.createElement("article");
    item.className = `readiness-item ${check.done ? "" : "warning"}`;
    item.innerHTML = `
      <span class="doc-icon">${check.done ? "✓" : "!"}</span>
      <span>
        <h2>${check.title}</h2>
        <p>${check.detail}</p>
      </span>
      <span class="doc-state ${check.done ? "done" : ""}">${check.done ? "Done" : "Needed"}</span>
    `;
    readinessList.appendChild(item);
  });
}

function saveLog() {
  const activeChips = [...document.querySelectorAll(".category-chip.active")].map((chip) => chip.textContent);
  state.logs[state.selectedDate] = {
    start: document.getElementById("workStartInput").value,
    end: document.getElementById("workEndInput").value,
    payNote: document.getElementById("payNoteInput").value.trim(),
    diary: document.getElementById("diaryInput").value.trim(),
    categories: activeChips,
    savedAt: new Date().toISOString()
  };
  saveState();
  renderCalendar();
  renderLogPanel();
  renderReport();
  showToast("Daily entry saved.");
}

function toggleShift() {
  if (state.shift.active) {
    const elapsed = getShiftElapsed();
    state.shift = { active: false, startedAt: null, elapsedBefore: elapsed };
    const todayKey = toDateKey(new Date());
    const now = new Date();
    state.logs[todayKey] = {
      ...(state.logs[todayKey] || {}),
      start: state.logs[todayKey]?.start || inferStartTime(now, elapsed),
      end: toTimeValue(now),
      categories: [...new Set([...(state.logs[todayKey]?.categories || []), "Normal day"])],
      savedAt: new Date().toISOString()
    };
    showToast("Shift ended. Today's time was saved.");
  } else {
    state.shift = { active: true, startedAt: Date.now(), elapsedBefore: 0 };
    showToast("Shift started.");
  }
  saveState();
  render();
}

function addCategory() {
  const nextName = window.prompt("Category name", "Employer asked overtime");
  if (!nextName) return;
  const clean = nextName.trim();
  if (!clean || state.categories.includes(clean)) return;
  state.categories.push(clean);
  saveState();
  renderLogPanel();
}

function addCustomDocument() {
  const title = window.prompt("Document name", "Chat screenshot");
  if (!title) return;
  const id = `custom-${Date.now()}`;
  state.documents[id] = {
    title: title.trim(),
    detail: "Additional supportive document",
    uploaded: true,
    date: toDateKey(new Date()),
    custom: true
  };
  saveState();
  renderDocuments();
  renderReport();
  showToast("Document added locally.");
}

function toggleDocument(id) {
  const map = getDocumentMap();
  const doc = map[id];
  if (!state.documents[id]) {
    state.documents[id] = { uploaded: true, date: toDateKey(new Date()) };
  } else {
    state.documents[id].uploaded = !state.documents[id].uploaded;
    state.documents[id].date = toDateKey(new Date());
  }
  state.documents[id].title = doc.title;
  state.documents[id].detail = doc.detail;
  saveState();
  renderDocuments();
  renderReport();
}

function cycleLanguage() {
  const languages = ["English", "한국어", "नेपाली", "Tiếng Việt"];
  const current = languages.indexOf(state.user.language);
  state.user.language = languages[(current + 1) % languages.length];
  saveState();
  document.getElementById("languageLabel").textContent = state.user.language;
  showToast(`Language preview: ${state.user.language}`);
}

function openMenu() {
  sidePanel.classList.add("open");
  sidePanel.setAttribute("aria-hidden", "false");
}

function closeMenu() {
  sidePanel.classList.remove("open");
  sidePanel.setAttribute("aria-hidden", "true");
}

function handleSideAction(action) {
  closeMenu();
  if (action === "language") {
    cycleLanguage();
    return;
  }
  if (action === "logout") {
    localStorage.removeItem(STORAGE_KEY);
    state = structuredClone(defaultState);
    render();
    showToast("Local prototype data cleared.");
    return;
  }
  const messages = {
    notifications: "Notification settings are represented in the payday reminder.",
    profile: "Profile is intentionally lightweight for this prototype.",
    support: "Chatbot is out of scope until the evidence workflow is tested."
  };
  showToast(messages[action] || "Prototype action.");
}

function getDocumentMap() {
  const map = {};
  requiredDocs.forEach((doc) => {
    map[doc.id] = { ...doc, ...(state.documents[doc.id] || {}) };
  });
  Object.entries(state.documents).forEach(([id, doc]) => {
    if (!map[id]) map[id] = { detail: "Additional supportive document", ...doc };
  });
  return map;
}

function getReadinessChecks() {
  const logCount = Object.keys(state.logs).length;
  const hasContract = Boolean(state.documents.contract?.uploaded);
  const hasPayEvidence = Boolean(state.documents.payslip?.uploaded || state.documents.bank?.uploaded);
  const hasWorkProof = Boolean(state.documents.workProof?.uploaded || logCount >= 2);
  const hasIssueNote = Object.values(state.logs).some((log) => {
    return (log.diary && log.diary.length > 20) || (log.payNote && log.payNote.length > 8);
  });

  return [
    {
      title: "Employment contract",
      detail: hasContract ? "Contract is stored." : "Upload or photograph your contract.",
      done: hasContract,
      nextStep: "Upload your employment contract or save a photo of it."
    },
    {
      title: "Work time record",
      detail: hasWorkProof ? "Work proof is available." : "Save at least two daily logs or upload clock-in proof.",
      done: hasWorkProof,
      nextStep: "Add work start and end time for today and one recent day."
    },
    {
      title: "Pay evidence",
      detail: hasPayEvidence ? "Pay evidence is available." : "Upload a payslip or bank salary statement.",
      done: hasPayEvidence,
      nextStep: "Upload your payslip or salary bank statement."
    },
    {
      title: "Problem note",
      detail: hasIssueNote ? "A written note is saved." : "Write what happened in one daily entry.",
      done: hasIssueNote,
      nextStep: "Write a short diary note about what happened, when, and who was there."
    }
  ];
}

function loadState() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return structuredClone(defaultState);
    return mergeState(structuredClone(defaultState), JSON.parse(stored));
  } catch {
    return structuredClone(defaultState);
  }
}

function mergeState(base, stored) {
  return {
    ...base,
    ...stored,
    user: { ...base.user, ...(stored.user || {}) },
    shift: { ...base.shift, ...(stored.shift || {}) },
    logs: { ...base.logs, ...(stored.logs || {}) },
    documents: { ...base.documents, ...(stored.documents || {}) },
    categories: stored.categories || base.categories
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2500);
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function toDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseDateKey(key) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function toTimeValue(date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function inferStartTime(endDate, elapsedMs) {
  return toTimeValue(new Date(endDate.getTime() - elapsedMs));
}

function formatShortDate(dateKey) {
  return parseDateKey(dateKey).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatDuration(ms) {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds].map((value) => String(value).padStart(2, "0")).join(":");
}

function getShiftElapsed() {
  if (!state.shift.active) return state.shift.elapsedBefore || 0;
  return (state.shift.elapsedBefore || 0) + (Date.now() - state.shift.startedAt);
}

function daysUntilPayday(date, payday) {
  const today = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  let target = new Date(date.getFullYear(), date.getMonth(), Math.min(payday, daysInMonth(date)));
  if (target < today) {
    const nextMonth = new Date(date.getFullYear(), date.getMonth() + 1, 1);
    target = new Date(nextMonth.getFullYear(), nextMonth.getMonth(), Math.min(payday, daysInMonth(nextMonth)));
  }
  return Math.round((target - today) / 86400000);
}

function daysInMonth(date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

function clamp(value, min, max) {
  if (Number.isNaN(value)) return min;
  return Math.max(min, Math.min(max, value));
}
