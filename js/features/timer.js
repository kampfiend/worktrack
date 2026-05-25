(function (window) {
  const WorkTrack = (window.WorkTrack = window.WorkTrack || {});
  WorkTrack.features = WorkTrack.features || {};

  function elapsed() {
    const shift = WorkTrack.state.get().shift;
    if (!shift.active) return shift.elapsedBefore || 0;
    return (shift.elapsedBefore || 0) + (Date.now() - shift.startedAt);
  }

  function toggle() {
    const now = new Date();
    const current = WorkTrack.state.get();
    if (current.shift.active) {
      const durationMs = elapsed();
      const todayKey = WorkTrack.date.toDateKey(now);
      const previousLog = current.logs[todayKey] || {};
      const start = previousLog.start || WorkTrack.date.inferStartTime(now, durationMs);
      const end = WorkTrack.date.toTimeValue(now);

      WorkTrack.state.update((state) => {
        state.shift = {
          active: false,
          startedAt: null,
          elapsedBefore: 0,
          lastSummary: { date: todayKey, start, end, durationMs }
        };
        state.logs[todayKey] = {
          ...previousLog,
          start,
          end,
          categories: [...new Set([...(previousLog.categories || []), "normal"])],
          diary: previousLog.diary || "",
          payNote: previousLog.payNote || "",
          savedAt: now.toISOString()
        };
      });
      WorkTrack.shell.showToast(WorkTrack.i18n.t("shiftEndedToast"));
    } else {
      WorkTrack.state.update((state) => {
        state.shift = {
          ...state.shift,
          active: true,
          startedAt: Date.now(),
          elapsedBefore: 0,
          lastSummary: null
        };
      });
      WorkTrack.shell.showToast(WorkTrack.i18n.t("shiftStartedToast"));
    }
  }

  function shouldShowTodaySummary() {
    const summary = WorkTrack.state.get().shift.lastSummary;
    return !WorkTrack.state.get().shift.active && summary?.date === WorkTrack.date.toDateKey(new Date());
  }

  WorkTrack.features.timer = { elapsed, toggle, shouldShowTodaySummary };
})(window);
