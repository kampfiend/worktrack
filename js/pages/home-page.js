(function (window) {
  const WorkTrack = window.WorkTrack;
  
  // Dev key logic
  let devKeyClicks = 0;
  let devKeyTimeout = null;

  document.addEventListener("DOMContentLoaded", () => {
    if (!WorkTrack.shell.init()) return;
    render();
    document.addEventListener("worktrack:language-changed", render);
    document.addEventListener("worktrack:data-reset", render);
    
    // Dev key listener
    const greeting = WorkTrack.dom.$("#homeGreeting");
    if (greeting) {
      greeting.addEventListener("click", () => {
        devKeyClicks++;
        if (devKeyTimeout) window.clearTimeout(devKeyTimeout);
        
        if (devKeyClicks >= 3) {
          devKeyClicks = 0;
          const currentState = WorkTrack.state.get();
          if (!currentState.shift.active && currentState.shift.lastSummary) {
            // Reset to state 1
            WorkTrack.state.update((s) => {
              s.shift.lastSummary = null;
            });
          } else {
            const wasActive = currentState.shift.active;
            WorkTrack.features.timer.toggle();
            
            // If we just clocked out via Dev Key, mock an 07:58 shift so the calendar reflects the UI
            if (wasActive) {
              WorkTrack.state.update((s) => {
                const todayKey = WorkTrack.date.toDateKey(new Date());
                s.logs[todayKey] = {
                  ...(s.logs[todayKey] || {}),
                  start: "09:00",
                  end: "16:58",
                  categories: ["normal"]
                };
                if (s.shift.lastSummary) {
                  s.shift.lastSummary.start = "09:00";
                  s.shift.lastSummary.end = "16:58";
                  s.shift.lastSummary.durationMs = (7 * 3600 + 58 * 60) * 1000;
                }
              });
            }
          }
          render();
        } else {
          devKeyTimeout = window.setTimeout(() => { devKeyClicks = 0; }, 500);
        }
      });
    }
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
    
    WorkTrack.dom.setHTML("#trackingMount", renderTrackingUI(state));
  }

  function renderTrackingUI(state) {
    const active = state.shift.active;
    const summary = state.shift.lastSummary;
    const now = new Date();
    
    let timeToDisplay, titleKey, workplaceText, cardClass, iconContent, showPin = false;
    
    if (active) {
      cardClass = "checked-in";
      iconContent = "✓";
      titleKey = "youAreCheckedIn";
      workplaceText = WorkTrack.i18n.t("workplace") || "Workplace";
      showPin = true;
      timeToDisplay = state.shift.startedAt ? new Date(state.shift.startedAt) : now;
    } else if (summary) {
      cardClass = "checked-out";
      iconContent = "✓";
      titleKey = "shiftCompleted";
      // Hardcoded realistic time for the prototype presentation
      workplaceText = WorkTrack.i18n.t("workedDuration", { time: "07:58" }) || `Worked 07:58`;
      showPin = false;
      timeToDisplay = now; // Or use summary end time if needed
    } else {
      cardClass = "looking";
      iconContent = "...";
      titleKey = "lookingForLocation";
      workplaceText = WorkTrack.i18n.t("waiting") || "Waiting...";
      showPin = true;
      timeToDisplay = now;
    }
    
    const timeString = WorkTrack.date.formatDate(timeToDisplay, { hour: "numeric", minute: "2-digit" });
    const dateString = WorkTrack.date.formatDate(timeToDisplay, { month: "short", day: "numeric" });
    
    // For prototype, we mock weekly hours
    const weeklyHours = "32h 15m";
    const weekRange = "May 11 - May 17"; // Static for prototype

    return `
      <div class="tracking-indicator">
        <div class="tracking-indicator-header">
          <div class="tracking-status-text"><span class="tracking-dot"></span><span data-i18n="autoTrackingOn">${WorkTrack.i18n.t("autoTrackingOn")}</span></div>
          <div class="tracking-how-it-works"><span class="info-icon" aria-hidden="true">i</span><span data-i18n="howItWorks">${WorkTrack.i18n.t("howItWorks")}</span></div>
        </div>
        <div class="tracking-indicator-subtext">
          <div class="pin-icon-wrapper"><span class="pin-icon" aria-hidden="true"></span></div><span data-i18n="autoTrackingDesc">${WorkTrack.i18n.t("autoTrackingDesc")}</span>
        </div>
      </div>

      <article class="status-card ${cardClass}">
        <div class="status-card-icon">
          ${iconContent}
        </div>
        <h2 class="status-card-title">${WorkTrack.i18n.t(titleKey)}</h2>
        
        <div class="status-card-details">
          ${workplaceText ? `
          <div class="status-detail-row">
            ${showPin ? `<div class="pin-icon-wrapper-grey"><span class="pin-icon-grey" aria-hidden="true"></span></div>` : ""}
            <span class="status-detail-text">${workplaceText}</span>
          </div>
          ` : ""}
          <div class="status-detail-row">
            <span class="clock-icon-grey" aria-hidden="true"></span>
            <span class="status-detail-text">${timeString} • ${dateString}</span>
          </div>
        </div>
        
        <button class="status-footer-button" type="button" onclick="location.href='./calendar.html'">
          <span data-i18n="viewTimeline">${WorkTrack.i18n.t("viewTimeline")}</span>
          <span class="arrow-right">&gt;</span>
        </button>
      </article>

      <article class="this-week-card">
        <div class="this-week-icon">
          <span class="calendar-outline-icon" aria-hidden="true"></span>
        </div>
        <div class="this-week-content">
          <strong data-i18n="thisWeek">${WorkTrack.i18n.t("thisWeek")}</strong>
          <small>${weekRange}</small>
        </div>
        <div class="this-week-stats">
          <small data-i18n="hoursLogged">${WorkTrack.i18n.t("hoursLogged")}</small>
          <strong class="hours-logged">${weeklyHours}</strong>
        </div>
        <div class="this-week-arrow">-&gt;</div>
      </article>
    `;
  }
})(window);




