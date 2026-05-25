(function (window) {
  const WorkTrack = (window.WorkTrack = window.WorkTrack || {});
  WorkTrack.features = WorkTrack.features || {};

  function selectedDate() {
    return WorkTrack.state.get().ui.selectedDate;
  }

  function selectDate(dateKey) {
    WorkTrack.state.update((state) => {
      state.ui.selectedDate = dateKey;
      state.ui.selectedMonth = WorkTrack.date.toMonthKey(WorkTrack.date.parseDateKey(dateKey));
    });
  }

  function changeMonth(offset) {
    WorkTrack.state.update((state) => {
      const current = WorkTrack.date.parseMonthKey(state.ui.selectedMonth);
      const next = new Date(current.getFullYear(), current.getMonth() + offset, 1);
      state.ui.selectedMonth = WorkTrack.date.toMonthKey(next);
      state.ui.selectedDate = WorkTrack.date.toDateKey(next);
    });
  }

  function saveFromForm(form) {
    const data = new FormData(form);
    const dateKey = String(data.get("date") || selectedDate());
    const categories = [...form.querySelectorAll(".category-option.active")].map((button) => button.dataset.category);
    WorkTrack.state.update((state) => {
      state.logs[dateKey] = {
        ...(state.logs[dateKey] || {}),
        start: String(data.get("start") || ""),
        end: String(data.get("end") || ""),
        payNote: String(data.get("payNote") || "").trim(),
        diary: String(data.get("diary") || "").trim(),
        categories,
        savedAt: new Date().toISOString()
      };
    });
    WorkTrack.shell.showToast(WorkTrack.i18n.t("entrySavedToast"));
  }

  function normalizeCategoryLabel(label) {
    return String(label || "").trim().replace(/\s+/g, " ").toLocaleLowerCase();
  }

  function categoryDisplayName(category) {
    return category.labelKey ? WorkTrack.i18n.t(category.labelKey) : category.label;
  }

  function categoryExists(label) {
    const normalized = normalizeCategoryLabel(label);
    if (!normalized) return false;
    return WorkTrack.state.get().categories.some((category) => normalizeCategoryLabel(categoryDisplayName(category)) === normalized);
  }

  function addCategory(label) {
    const trimmed = String(label || "").trim().replace(/\s+/g, " ");
    if (!trimmed || categoryExists(trimmed)) return null;
    const id = `custom-${Date.now()}`;
    WorkTrack.state.update((state) => {
      state.categories.push({ id, label: trimmed, custom: true });
    });
    WorkTrack.shell.showToast(WorkTrack.i18n.t("categoryAddedToast"));
    return id;
  }

  function categoryLabel(id) {
    const category = WorkTrack.state.get().categories.find((item) => item.id === id);
    if (!category) return id;
    return categoryDisplayName(category);
  }

  function deleteLog(dateKey = selectedDate()) {
    WorkTrack.state.update((state) => {
      delete state.logs[dateKey];
    });
    WorkTrack.shell.showToast(WorkTrack.i18n.t("logDeletedToast"));
  }

  function recent(limit = 3) {
    return Object.entries(WorkTrack.state.get().logs)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, limit);
  }

  WorkTrack.features.logs = { selectedDate, selectDate, changeMonth, saveFromForm, addCategory, categoryExists, categoryLabel, deleteLog, recent };
})(window);
