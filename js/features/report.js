(function (window) {
  const WorkTrack = (window.WorkTrack = window.WorkTrack || {});
  WorkTrack.features = WorkTrack.features || {};

  function checks() {
    const state = WorkTrack.state.get();
    const logs = Object.values(state.logs || {});
    const hasContract = Boolean(state.documents.contract?.uploaded);
    const hasPayEvidence = Boolean(state.documents.payEvidence?.uploaded || state.documents.bank?.uploaded);
    const hasWorkTime = Boolean(state.documents.workProof?.uploaded || logs.filter((log) => log.start && log.end).length >= 2);
    const hasDailyNote = logs.some((log) => (log.diary && log.diary.length >= 20) || (log.payNote && log.payNote.length >= 8));

    return [
      {
        icon: "file-text",
        title: WorkTrack.i18n.t("checkContract"),
        done: hasContract,
        detail: hasContract ? WorkTrack.i18n.t("checkContractDone") : WorkTrack.i18n.t("checkContractNeed"),
        nextStep: WorkTrack.i18n.t("checkContractNext")
      },
      {
        icon: "clock",
        title: WorkTrack.i18n.t("checkWorkTime"),
        done: hasWorkTime,
        detail: hasWorkTime ? WorkTrack.i18n.t("checkWorkTimeDone") : WorkTrack.i18n.t("checkWorkTimeNeed"),
        nextStep: WorkTrack.i18n.t("checkWorkTimeNext")
      },
      {
        icon: "cash",
        title: WorkTrack.i18n.t("checkPay"),
        done: hasPayEvidence,
        detail: hasPayEvidence ? WorkTrack.i18n.t("checkPayDone") : WorkTrack.i18n.t("checkPayNeed"),
        nextStep: WorkTrack.i18n.t("checkPayNext")
      },
      {
        icon: "file-text",
        title: WorkTrack.i18n.t("checkNote"),
        done: hasDailyNote,
        detail: hasDailyNote ? WorkTrack.i18n.t("checkNoteDone") : WorkTrack.i18n.t("checkNoteNeed"),
        nextStep: WorkTrack.i18n.t("checkNoteNext")
      }
    ];
  }

  function readiness() {
    const items = checks();
    const done = items.filter((item) => item.done).length;
    return {
      checks: items,
      done,
      total: items.length,
      score: Math.round((done / items.length) * 100),
      next: items.find((item) => !item.done) || null
    };
  }

  WorkTrack.features.report = { checks, readiness };
})(window);
