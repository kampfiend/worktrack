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
    const merged = {
      ...base,
      ...(input || {}),
      version: WorkTrack.config.appVersion,
      profile: { ...base.profile, ...(input?.profile || {}) },
      shift: { ...base.shift, ...(input?.shift || {}) },
      logs: input && Object.prototype.hasOwnProperty.call(input, "logs") ? (input.logs || {}) : base.logs,
      documents: input && Object.prototype.hasOwnProperty.call(input, "documents") ? (input.documents || {}) : base.documents,
      categories: Array.isArray(input?.categories) ? input.categories : base.categories,
      ui: { ...base.ui, ...(input?.ui || {}) }
    };
    merged.profile.language = supportedLanguage(merged.profile.language);
    return merged;
  }

  function supportedLanguage(language) {
    return WorkTrack.config.languages.some((item) => item.code === language) ? language : "en";
  }

  function createSeedState(language) {
    const today = new Date();
    const yesterday = addDays(today, -1);
    const threeDaysAgo = addDays(today, -3);
    const fortyDaysAgo = addDays(today, -40);
    const todayKey = toDateKey(today);
    const yesterdayKey = toDateKey(yesterday);
    const threeDaysKey = toDateKey(threeDaysAgo);

    return {
      version: WorkTrack.config.appVersion,
      isLoggedIn: false,
      profile: {
        name: "Will",
        nationality: "Nepal",
        email: "worker@example.com",
        residentId: "M123456789",
        birthDate: "1998-05-13",
        payday: 15,
        language: supportedLanguage(language || "en")
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
        }
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



