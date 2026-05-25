(function (window) {
  const WorkTrack = window.WorkTrack;
  let timerInterval = null;

  document.addEventListener("DOMContentLoaded", () => {
    if (!WorkTrack.shell.init()) return;
    render();
    document.addEventListener("worktrack:language-changed", render);
    document.addEventListener("worktrack:data-reset", render);
    WorkTrack.dom.$("#timerMount")?.addEventListener("click", (event) => {
      if (!event.target.closest("[data-home-action='toggle-shift']")) return;
      WorkTrack.features.timer.toggle();
      render();
    });
    timerInterval = window.setInterval(updateTimerText, 1000);
  });

  function render() {
    const state = WorkTrack.state.get();
    const today = new Date();
    const hour = today.getHours();
    const greetingKey = hour < 12 ? "goodMorning" : hour < 18 ? "goodAfternoon" : "goodEvening";
    const days = WorkTrack.date.daysUntilPayday(today, Number(state.profile.payday) || 15);
    const payTitle = days === 0 ? WorkTrack.i18n.t("nextPaymentToday") : days === 1 ? WorkTrack.i18n.t("nextPaymentOne") : WorkTrack.i18n.t("nextPaymentIn", { days });

    WorkTrack.dom.setText("#homeGreeting", `${WorkTrack.i18n.t(greetingKey)}, ${state.profile.name || "Worker"}!`);
    WorkTrack.dom.setText("#todayLabel", WorkTrack.date.formatDate(today, { weekday: "long", month: "long", day: "numeric" }));
    WorkTrack.dom.setText("#payTitle", payTitle);
    WorkTrack.dom.setText("#paySubtitle", WorkTrack.i18n.t("expectedPayday", { day: state.profile.payday || 15 }));
    WorkTrack.dom.setHTML("#timerMount", WorkTrack.features.timer.shouldShowTodaySummary() ? renderSummaryCard(state.shift.lastSummary) : renderTimerCard());
    updateTimerText();
  }

  function renderTimerCard() {
    const active = WorkTrack.state.get().shift.active;
    return `
      <article class="timer-card">
        <div class="status-chip ${active ? "on" : ""}"><span class="status-dot"></span>${active ? WorkTrack.i18n.t("onShift") : WorkTrack.i18n.t("offShift")}</div>
        <div><div class="timer-time" id="timerDisplay">${WorkTrack.date.formatDuration(WorkTrack.features.timer.elapsed())}</div><p class="timer-label">${WorkTrack.i18n.t("shiftDuration")}</p></div>
        <button class="round-action" type="button" data-home-action="toggle-shift" aria-label="${active ? WorkTrack.i18n.t("tapEndWork") : WorkTrack.i18n.t("tapStartWork")}"><span class="timer-control-icon ${active ? "pause-icon" : "play-icon"}" aria-hidden="true"></span></button>
        <strong class="timer-action-label">${active ? WorkTrack.i18n.t("tapEndWork") : WorkTrack.i18n.t("tapStartWork")}</strong>
      </article>
    `;
  }

  function renderSummaryCard(summary) {
    return `
      <article class="summary-card">
        <h2>${WorkTrack.i18n.t("shiftSummary")}</h2>
        <div class="timer-time">${WorkTrack.date.formatDuration(summary.durationMs)}</div>
        <div class="time-pair">
          <div class="time-box"><span class="time-icon" aria-hidden="true"></span><small>${WorkTrack.i18n.t("startTime")}</small><strong>${summary.start}</strong></div>
          <div class="time-box"><span class="time-icon" aria-hidden="true"></span><small>${WorkTrack.i18n.t("endTime")}</small><strong>${summary.end}</strong></div>
        </div>
        <button class="primary wide" type="button" data-home-action="toggle-shift">${WorkTrack.i18n.t("startAnotherShift")}</button>
      </article>
    `;
  }

  function updateTimerText() {
    const display = WorkTrack.dom.$("#timerDisplay");
    if (display) display.textContent = WorkTrack.date.formatDuration(WorkTrack.features.timer.elapsed());
  }

  window.addEventListener("beforeunload", () => window.clearInterval(timerInterval));
})(window);




