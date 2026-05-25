(function (window) {
  const WorkTrack = window.WorkTrack;
  let selectedPaycheckDate = null;

  document.addEventListener("DOMContentLoaded", () => {
    if (!WorkTrack.shell.init()) return;
    render();
    bindEvents();
    document.addEventListener("worktrack:language-changed", render);
    document.addEventListener("worktrack:data-reset", render);
  });

  function bindEvents() {
    WorkTrack.dom.$("#calendarGrid")?.addEventListener("click", (event) => {
      const day = event.target.closest("[data-date]");
      if (!day) return;
      WorkTrack.features.logs.selectDate(day.dataset.date);
      render();
    });
    WorkTrack.dom.$("#monthPrev")?.addEventListener("click", () => {
      WorkTrack.features.logs.changeMonth(-1);
      render();
    });
    WorkTrack.dom.$("#monthNext")?.addEventListener("click", () => {
      WorkTrack.features.logs.changeMonth(1);
      render();
    });
    WorkTrack.dom.$("#logPanel")?.addEventListener("click", handleLogPanelClick);
    WorkTrack.dom.$("#paycheckInput")?.addEventListener("change", handlePaycheckFile);
  }

  function render() {
    const state = WorkTrack.state.get();
    const monthDate = WorkTrack.date.parseMonthKey(state.ui.selectedMonth);
    WorkTrack.dom.setText("#journeyTitle", WorkTrack.i18n.t("yourJourney"));
    WorkTrack.dom.setText("#journeySubtitle", WorkTrack.i18n.t("trackingStatus", { month: WorkTrack.date.formatDate(monthDate, { month: "long" }) }));
    WorkTrack.dom.setText("#monthLabel", WorkTrack.date.formatDate(monthDate, { month: "long", year: "numeric" }));
    WorkTrack.dom.setHTML("#calendarGrid", renderCalendarGrid(monthDate));
    WorkTrack.dom.setHTML("#logPanel", renderSelectedLog());
  }

  function renderCalendarGrid(monthDate) {
    const weekdays = WorkTrack.date.weekdayLabels("short");
    const state = WorkTrack.state.get();
    const cells = weekdays.map((day) => `<div class="weekday">${day}</div>`);
    const year = monthDate.getFullYear();
    const month = monthDate.getMonth();
    const first = new Date(year, month, 1);
    const total = new Date(year, month + 1, 0).getDate();
    const previousTotal = new Date(year, month, 0).getDate();
    const todayKey = WorkTrack.date.toDateKey(new Date());

    for (let i = first.getDay() - 1; i >= 0; i -= 1) cells.push(`<div class="calendar-day outside">${previousTotal - i}</div>`);
    for (let day = 1; day <= total; day += 1) {
      const key = WorkTrack.date.toDateKey(new Date(year, month, day));
      const classes = ["calendar-day"];
      if (key === state.ui.selectedDate) classes.push("selected");
      if (key === todayKey) classes.push("today");
      if (state.logs[key]) classes.push("has-log");
      if (day === Number(state.profile.payday)) classes.push("payday");
      cells.push(`<button type="button" class="${classes.join(" ")}" data-date="${key}">${day}</button>`);
    }
    while ((cells.length - 7) % 7 !== 0) cells.push(`<div class="calendar-day outside"></div>`);
    return cells.join("");
  }

  function renderSelectedLog() {
    const dateKey = WorkTrack.features.logs.selectedDate();
    const log = WorkTrack.state.get().logs[dateKey];
    const dateLabel = WorkTrack.date.formatDate(WorkTrack.date.parseDateKey(dateKey), { month: "long", day: "numeric", year: "numeric" });
    if (!log) {
      return `
        <article class="selected-log-card">
          <p class="eyebrow">${WorkTrack.i18n.t("selectedDay")}</p>
          <h2>${dateLabel}</h2>
          <div class="empty-state"><strong>${WorkTrack.i18n.t("noLogTitle")}</strong><p>${WorkTrack.i18n.t("noLogText")}</p></div>
          <button class="primary wide" type="button" data-log-action="edit">${WorkTrack.i18n.t("addWorkLog")}</button>
        </article>
      `;
    }
    return `
      <article class="selected-log-card">
        <p class="eyebrow">${WorkTrack.i18n.t("savedLog")}</p>
        <h2>${dateLabel}</h2>
        <div class="log-meta">
          <div><small>${WorkTrack.i18n.t("startTime")}</small><strong>${log.start || "--:--"}</strong></div>
          <div><small>${WorkTrack.i18n.t("endTime")}</small><strong>${log.end || "--:--"}</strong></div>
        </div>
        <div class="category-list">${(log.categories || []).map((id) => `<span class="category-chip">${WorkTrack.dom.esc(WorkTrack.features.logs.categoryLabel(id))}</span>`).join("")}</div>
        <p class="muted" style="margin-top:16px;">${WorkTrack.dom.esc(log.diary || log.payNote || WorkTrack.i18n.t("noLogText"))}</p>
        <button class="primary wide" type="button" data-log-action="edit">${WorkTrack.i18n.t("editLog")}</button>
        <button class="secondary wide delete-log-button" type="button" data-log-action="delete-log">${WorkTrack.i18n.t("deleteLog")}</button>
      </article>
    `;
  }

  function renderEditor(draft = null) {
    const dateKey = WorkTrack.features.logs.selectedDate();
    const savedLog = WorkTrack.state.get().logs[dateKey] || {};
    const log = { ...savedLog, ...(draft || {}) };
    const categoryInput = draft?.categoryInput || "";
    const categoryError = draft?.categoryError || "";
    const paycheck = log.paycheckFile || WorkTrack.state.get().documents.payEvidence;
    const uploaded = Boolean(paycheck?.uploaded || paycheck?.filename);
    WorkTrack.dom.setHTML("#logPanel", `
      <article class="log-editor">
        <form id="logForm">
          <input type="hidden" name="date" value="${dateKey}" />
          <div class="section-title-row"><h2>${WorkTrack.i18n.t("addWorkLog")}</h2><span class="muted">${WorkTrack.date.formatDate(WorkTrack.date.parseDateKey(dateKey), { month: "short", day: "numeric", year: "numeric" })}</span></div>
          <div class="upload-card ${uploaded ? "uploaded" : ""}">
            <div class="upload-icon ${uploaded ? "check-icon" : "document-icon"}" aria-hidden="true"></div>
            <h3>${WorkTrack.i18n.t("paycheckRecord")}</h3>
            <p class="muted">${uploaded && paycheck.filename ? WorkTrack.i18n.t("fileName", { name: paycheck.filename }) : WorkTrack.i18n.t("uploadPaycheck")}</p>
            <button class="${uploaded ? "pill-button active" : "secondary"}" type="button" data-log-action="pick-paycheck">${uploaded ? WorkTrack.i18n.t("uploaded") : WorkTrack.i18n.t("selectFile")}</button>
          </div>
          <div class="field-grid">
            <label>${WorkTrack.i18n.t("startTime")}<input name="start" type="time" value="${WorkTrack.dom.esc(log.start || "")}" /></label>
            <label>${WorkTrack.i18n.t("endTime")}<input name="end" type="time" value="${WorkTrack.dom.esc(log.end || "")}" /></label>
          </div>
          <label>${WorkTrack.i18n.t("payNote")}<input name="payNote" type="text" value="${WorkTrack.dom.esc(log.payNote || "")}" placeholder="${WorkTrack.i18n.t("payNotePlaceholder")}" /></label>
          <section class="category-panel">
            <div class="card-title-row"><span class="eyebrow" style="margin:0;">${WorkTrack.i18n.t("myCategories")}</span></div>
            <div class="category-add-row ${categoryError ? "has-error" : ""}"><input id="customCategoryInput" type="text" value="${WorkTrack.dom.esc(categoryInput)}" placeholder="${WorkTrack.i18n.t("categoryPlaceholder")}" aria-describedby="${categoryError ? "categoryError" : ""}" aria-invalid="${categoryError ? "true" : "false"}" /><button class="pill-button" type="button" data-log-action="add-category">${WorkTrack.i18n.t("add")}</button></div>
            <p class="category-error" id="categoryError" ${categoryError ? "" : "hidden"}>${WorkTrack.dom.esc(categoryError)}</p>
            <div class="category-list">${renderCategoryOptions(log.categories || [])}</div>
          </section>
          <label>${WorkTrack.i18n.t("diaryFeelings")}<textarea name="diary" placeholder="${WorkTrack.i18n.t("diaryPlaceholder")}">${WorkTrack.dom.esc(log.diary || "")}</textarea></label>
          <div class="button-row" style="margin-top:24px;"><button class="primary" type="submit">${WorkTrack.i18n.t("saveEntry")}</button><button class="secondary" type="button" data-log-action="discard">${WorkTrack.i18n.t("discard")}</button></div>
        </form>
      </article>
    `);
    WorkTrack.dom.$("#logForm")?.addEventListener("submit", (event) => {
      event.preventDefault();
      WorkTrack.features.logs.saveFromForm(event.currentTarget);
      render();
    });
  }

  function renderCategoryOptions(selected) {
    const selectedSet = new Set(selected || []);
    return WorkTrack.state.get().categories.map((category) => `
      <button class="category-option ${selectedSet.has(category.id) ? "active" : ""}" type="button" data-category="${category.id}">${WorkTrack.dom.esc(WorkTrack.features.logs.categoryLabel(category.id))}</button>
    `).join("");
  }

  function readEditorDraft() {
    const form = WorkTrack.dom.$("#logForm");
    if (!form) return null;
    const data = new FormData(form);
    return {
      start: String(data.get("start") || ""),
      end: String(data.get("end") || ""),
      payNote: String(data.get("payNote") || ""),
      diary: String(data.get("diary") || ""),
      categories: [...form.querySelectorAll(".category-option.active")].map((button) => button.dataset.category)
    };
  }

  function handleLogPanelClick(event) {
    const action = event.target.closest("[data-log-action]")?.dataset.logAction;
    if (action === "edit") renderEditor();
    if (action === "discard") render();
    if (action === "delete-log") {
      WorkTrack.features.logs.deleteLog();
      render();
    }
    if (action === "pick-paycheck") {
      selectedPaycheckDate = WorkTrack.features.logs.selectedDate();
      WorkTrack.dom.$("#paycheckInput").value = "";
      WorkTrack.dom.$("#paycheckInput").click();
    }
    if (action === "add-category") {
      const input = WorkTrack.dom.$("#customCategoryInput");
      const label = input?.value || "";
      const trimmed = label.trim().replace(/\s+/g, " ");
      const draft = readEditorDraft() || {};
      if (trimmed && WorkTrack.features.logs.categoryExists(trimmed)) {
        draft.categoryInput = label;
        draft.categoryError = WorkTrack.i18n.t("tagAlreadyExists", { name: trimmed });
        renderEditor(draft);
        return;
      }
      const categoryId = WorkTrack.features.logs.addCategory(trimmed);
      if (categoryId) {
        draft.categories = [...new Set([...(draft.categories || []), categoryId])];
        renderEditor(draft);
      }
    }
    if (event.target.classList.contains("category-option")) event.target.classList.toggle("active");
  }

  function handlePaycheckFile(event) {
    const file = event.target.files?.[0];
    if (!file || !selectedPaycheckDate) return;
    const draft = readEditorDraft();
    WorkTrack.features.documents.savePaycheckMetadata(selectedPaycheckDate, file);
    renderEditor(draft);
  }
})(window);



