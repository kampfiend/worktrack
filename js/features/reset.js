(function (window) {
  const WorkTrack = (window.WorkTrack = window.WorkTrack || {});
  WorkTrack.features = WorkTrack.features || {};

  function resetDocuments() {
    WorkTrack.state.update((state) => {
      state.documents = emptyDocumentState();
      state.ui.summaryOpen = false;
    });
    WorkTrack.shell.showToast(WorkTrack.i18n.t("resetDocumentsToast"));
  }

  function resetCalendarEntries() {
    const today = new Date();
    WorkTrack.state.update((state) => {
      const seed = WorkTrack.state.createSeedState(state.profile.language);
      state.logs = seed.logs;
      state.categories = seed.categories;
      state.shift = {
        active: false,
        startedAt: null,
        elapsedBefore: 0,
        lastSummary: null
      };
      state.ui.selectedDate = WorkTrack.date.toDateKey(today);
      state.ui.selectedMonth = WorkTrack.date.toMonthKey(today);
      state.ui.summaryOpen = false;
    });
    WorkTrack.shell.showToast(WorkTrack.i18n.t("resetCalendarToast"));
  }

  function resetReadinessView() {
    WorkTrack.state.update((state) => {
      state.ui.summaryOpen = false;
      delete state.ui.summaryDraftSavedAt;
    });
    WorkTrack.shell.showToast(WorkTrack.i18n.t("resetReadinessToast"));
  }

  function emptyDocumentState() {
    return WorkTrack.config.documentDefinitions.reduce((documents, definition) => {
      documents[definition.id] = { uploaded: false };
      return documents;
    }, {});
  }

  WorkTrack.features.reset = { resetDocuments, resetCalendarEntries, resetReadinessView };
})(window);
