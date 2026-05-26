(function (window) {
  const WorkTrack = (window.WorkTrack = window.WorkTrack || {});
  let state = normalize(WorkTrack.storage.loadRawState());
  WorkTrack.storage.write(WorkTrack.config.storageKey, state);

  function get() {
    return state;
  }

  function set(nextState) {
    state = normalize(nextState);
    save();
    return state;
  }

  function update(mutator) {
    mutator(state);
    state = normalize(state);
    save();
    return state;
  }

  function save() {
    WorkTrack.storage.write(WorkTrack.config.storageKey, state);
  }

  function reset({ keepLanguage = true, loggedIn = true } = {}) {
    const language = keepLanguage ? supportedLanguage(state.profile.language) : "en";
    state = createSeedState(language);
    state.isLoggedIn = loggedIn;
    save();
    return state;
  }

  function normalize(input) {
    const base = createSeedState(supportedLanguage(input?.profile?.language || "en"));
    const inputHasLogs = input && Object.prototype.hasOwnProperty.call(input, "logs");
    const inputVersion = Number(input?.version) || 0;
    const logs = inputHasLogs ? { ...(input.logs || {}) } : base.logs;
    if (inputHasLogs && inputVersion < 4) {
      addDefaultMayFifteenthLog(logs);
    }
    const merged = {
      ...base,
      ...(input || {}),
      version: WorkTrack.config.appVersion,
      profile: { ...base.profile, ...(input?.profile || {}) },
      shift: { ...base.shift, ...(input?.shift || {}) },
      logs,
      documents: input && Object.prototype.hasOwnProperty.call(input, "documents") ? (input.documents || {}) : base.documents,
      categories: Array.isArray(input?.categories) ? input.categories : base.categories,
      ui: { ...base.ui, ...(input?.ui || {}) }
    };
    merged.profile.language = supportedLanguage(merged.profile.language);
    merged.profile.nationality = supportedCountry(merged.profile.nationality, merged.profile.language);
    return merged;
  }

  function supportedLanguage(language) {
    return WorkTrack.config.languages.some((item) => item.code === language) ? language : "en";
  }

  function supportedCountry(value, language) {
    const normalized = String(value || "").trim();
    const country = WorkTrack.config.countries.find((item) => {
      if (item.code === normalized) return true;
      return Object.values(item.names || {}).some((name) => name === normalized);
    });
    if (country) return country.code;
    const matchingLanguage = WorkTrack.config.languages.find((item) => item.code === normalized || item.label === normalized);
    if (matchingLanguage) return defaultCountryCode(matchingLanguage.code);
    return defaultCountryCode(language);
  }

  function defaultCountryCode(language) {
    return WorkTrack.config.countries.find((item) => item.languageCode === language)?.code || WorkTrack.config.countries[0]?.code || "us";
  }

  function createSeedState(language) {
    const today = new Date();
    const yesterday = addDays(today, -1);
    const threeDaysAgo = addDays(today, -3);
    const fortyDaysAgo = addDays(today, -40);
    const todayKey = toDateKey(today);
    const yesterdayKey = toDateKey(yesterday);
    const threeDaysKey = toDateKey(threeDaysAgo);
    const profileLanguage = supportedLanguage(language || "en");
    const profileNationality = defaultCountryCode(profileLanguage);
    const mayFifteenth = defaultMayFifteenthDate(today);
    const mayFifteenthKey = toDateKey(mayFifteenth);

    return {
      version: WorkTrack.config.appVersion,
      isLoggedIn: false,
      profile: {
        name: "Will",
        nationality: profileNationality,
        email: "worker@example.com",
        residentId: "M123456789",
        birthDate: "1998-05-13",
        payday: 15,
        language: profileLanguage
      },
      shift: {
        active: false,
        startedAt: null,
        elapsedBefore: 0,
        lastSummary: null
      },
      logs: {
        [threeDaysKey]: {
          start: "08:00",
          end: "17:30",
          categories: ["normal"],
          diary: "Today I worked with my co-workers and saved the start and end time after the shift.",
          payNote: "",
          savedAt: threeDaysAgo.toISOString()
        },
        [yesterdayKey]: {
          start: "08:10",
          end: "20:20",
          categories: ["overtime", "lateWage"],
          diary: "The supervisor asked the team to stay late. I wrote down who was present and what time we left.",
          payNote: "Payslip has not arrived yet.",
          savedAt: yesterday.toISOString()
        },
        [mayFifteenthKey]: createMayFifteenthLog(mayFifteenth)
      },
      documents: {
        contract: {
          uploaded: true,
          filename: "employment-contract.pdf",
          mimeType: "application/pdf",
          uploadedAt: toDateKey(fortyDaysAgo)
        },
        passport: {
          uploaded: true,
          filename: "passport-resident-card.pdf",
          mimeType: "application/pdf",
          uploadedAt: toDateKey(addDays(today, -39))
        },
        workProof: {
          uploaded: true,
          filename: "clock-record-photo.jpg",
          mimeType: "image/jpeg",
          uploadedAt: threeDaysKey
        },
        payEvidence: { uploaded: false },
        health: { uploaded: false }
      },
      categories: [
        { id: "normal", labelKey: "catNormal" },
        { id: "overtime", labelKey: "catOvertime" },
        { id: "lateWage", labelKey: "catLateWage" }
      ],
      ui: {
        selectedDate: todayKey,
        selectedMonth: toMonthKey(today),
        summaryOpen: false
      }
    };
  }

  function addDefaultMayFifteenthLog(logs) {
    const mayFifteenth = defaultMayFifteenthDate(new Date());
    const mayFifteenthKey = toDateKey(mayFifteenth);
    if (!logs[mayFifteenthKey]) {
      logs[mayFifteenthKey] = createMayFifteenthLog(mayFifteenth);
    }
  }

  function createMayFifteenthLog(date) {
    return {
      start: "09:00",
      end: "17:00",
      categories: ["lateWage"],
      diary: "I felt a little annoyed and sad because my wages were delayed. I wrote this down so I can explain what happened if I need support.",
      payNote: "Salary delayed.",
      savedAt: date.toISOString()
    };
  }

  function defaultMayFifteenthDate(referenceDate) {
    return new Date(referenceDate.getFullYear(), 4, 15, 12, 0, 0);
  }

  function toDateKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  }

  function toMonthKey(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  }

  function addDays(date, amount) {
    const next = new Date(date);
    next.setDate(next.getDate() + amount);
    return next;
  }

  WorkTrack.state = { get, set, update, save, reset, createSeedState };
})(window);



