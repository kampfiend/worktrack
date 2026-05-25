(function (window) {
  const WorkTrack = window.WorkTrack;

  document.addEventListener("DOMContentLoaded", () => {
    if (!WorkTrack.shell.init()) return;
    render();
    bindEvents();
    document.addEventListener("worktrack:language-changed", render);
    document.addEventListener("worktrack:data-reset", render);
  });

  function bindEvents() {
    WorkTrack.dom.$("#reportRoot")?.addEventListener("click", (event) => {
      const action = event.target.closest("[data-report-action]")?.dataset.reportAction;
      if (action === "summary") {
        WorkTrack.state.update((state) => {
          state.ui.summaryOpen = true;
        });
        WorkTrack.shell.showToast(WorkTrack.i18n.t("summaryPrepared"));
        render();
      }
      if (action === "back") {
        WorkTrack.state.update((state) => {
          state.ui.summaryOpen = false;
        });
        render();
      }
      if (action === "draft") {
        WorkTrack.state.update((state) => {
          state.ui.summaryDraftSavedAt = new Date().toISOString();
        });
        WorkTrack.shell.showToast(WorkTrack.i18n.t("draftSaved"));
      }
    });
  }

  function render() {
    WorkTrack.dom.setHTML("#reportRoot", WorkTrack.state.get().ui.summaryOpen ? renderSummary() : renderReadiness());
  }

  function renderReadiness() {
    const readiness = WorkTrack.features.report.readiness();
    const next = readiness.next;
    return `
      <article class="readiness-card">
        <p class="eyebrow">${WorkTrack.i18n.t("currentStatus")}</p>
        <h1>${WorkTrack.i18n.t("reportReadiness")}</h1>
        <p>${WorkTrack.i18n.t("reportDescription")}</p>
        <div class="score-line"><strong>${readiness.score}%</strong><span>${WorkTrack.i18n.t("tasksDone", { done: readiness.done, total: readiness.total })}</span></div>
        <div class="progress-track"><span style="width:${readiness.score}%"></span></div>
      </article>
      <article class="guidance-card">
        <span class="guidance-icon" aria-hidden="true"></span>
        <div><h2>${next ? WorkTrack.i18n.t("nextUsefulStep") : WorkTrack.i18n.t("recordSetReady")}</h2><p>${WorkTrack.dom.esc(next ? next.nextStep : WorkTrack.i18n.t("recordSetReadyText"))}</p></div>
      </article>
      <section class="readiness-list">
        ${readiness.checks.map((check) => `<article class="readiness-item ${check.done ? "done" : "warning"}"><span class="doc-icon">${check.done ? "OK" : "!"}</span><span><h3>${WorkTrack.dom.esc(check.title)}</h3><p>${WorkTrack.dom.esc(check.detail)}</p></span><span class="state-pill ${check.done ? "done" : ""}">${check.done ? WorkTrack.i18n.t("done") : WorkTrack.i18n.t("needed")}</span></article>`).join("")}
      </section>
      <section class="report-actions">
        <h2>${WorkTrack.i18n.t("prepareSummary")}</h2>
        <p class="muted">${WorkTrack.i18n.t("reportCaution")}</p>
        <button class="primary wide" type="button" data-report-action="summary">${WorkTrack.i18n.t("prepareSummary")}</button>
        <button class="secondary wide" type="button" data-report-action="draft">${WorkTrack.i18n.t("saveDraft")}</button>
      </section>
    `;
  }

  function renderSummary() {
    const missing = WorkTrack.features.report.checks().filter((check) => !check.done);
    const recentLogs = WorkTrack.features.logs.recent(3);
    return `
      <article class="summary-panel">
        <p class="eyebrow">${WorkTrack.i18n.t("navReport")}</p>
        <h1>${WorkTrack.i18n.t("summaryTitle")}</h1>
        <p class="muted">${WorkTrack.i18n.t("summaryIntro")}</p>
        <h2>${WorkTrack.i18n.t("recentLogs")}</h2>
        <div class="summary-list">${recentLogs.length ? recentLogs.map(renderLogSummary).join("") : `<div class="summary-item"><p>${WorkTrack.i18n.t("noRecentLogs")}</p></div>`}</div>
        <h2 style="margin-top:26px;">${WorkTrack.i18n.t("missingItems")}</h2>
        <div class="summary-list">${missing.length ? missing.map((item) => `<div class="summary-item"><strong>${WorkTrack.dom.esc(item.title)}</strong><p>${WorkTrack.dom.esc(item.nextStep)}</p></div>`).join("") : `<div class="summary-item"><p>${WorkTrack.i18n.t("noMissingItems")}</p></div>`}</div>
        <h2 style="margin-top:26px;">${WorkTrack.i18n.t("nextSteps")}</h2>
        <div class="summary-item"><p>${WorkTrack.i18n.t("reportCaution")}</p></div>
        <button class="primary wide" type="button" data-report-action="draft">${WorkTrack.i18n.t("saveDraft")}</button>
        <button class="secondary wide" type="button" data-report-action="back">${WorkTrack.i18n.t("backToReadiness")}</button>
      </article>
    `;
  }

  function renderLogSummary([date, log]) {
    return `<div class="summary-item"><strong>${WorkTrack.date.formatDate(WorkTrack.date.parseDateKey(date), { month: "long", day: "numeric", year: "numeric" })}</strong><p>${WorkTrack.dom.esc(`${log.start || "--:--"} - ${log.end || "--:--"}`)}</p><p>${WorkTrack.dom.esc(log.diary || log.payNote || "")}</p></div>`;
  }
})(window);



