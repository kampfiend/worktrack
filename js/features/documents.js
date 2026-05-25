(function (window) {
  const WorkTrack = (window.WorkTrack = window.WorkTrack || {});
  WorkTrack.features = WorkTrack.features || {};

  function getDocument(id) {
    const definition = WorkTrack.config.documentDefinitions.find((doc) => doc.id === id);
    const stored = WorkTrack.state.get().documents[id] || {};
    if (definition) {
      return {
        ...definition,
        ...stored,
        id,
        title: WorkTrack.i18n.t(definition.titleKey),
        detail: WorkTrack.i18n.t(definition.detailKey),
        icon: definition.icon
      };
    }
    return {
      id,
      title: stored.title || WorkTrack.i18n.t("docVisa"),
      detail: stored.detail || WorkTrack.i18n.t("docVisaDetail"),
      icon: stored.icon || "DOC",
      ...stored
    };
  }

  function all() {
    const map = new Map();
    WorkTrack.config.documentDefinitions.forEach((doc) => map.set(doc.id, getDocument(doc.id)));
    Object.keys(WorkTrack.state.get().documents).forEach((id) => {
      if (!map.has(id)) map.set(id, getDocument(id));
    });
    return [...map.values()];
  }

  function requiredProgress() {
    const docs = WorkTrack.config.requiredDocumentIds.map(getDocument);
    const done = docs.filter((doc) => doc.uploaded).length;
    return { docs, done, total: docs.length, percent: Math.round((done / docs.length) * 100) };
  }

  function saveMetadata(id, file) {
    const metadata = {
      filename: file.name,
      mimeType: file.type || "unknown",
      uploaded: true,
      uploadedAt: WorkTrack.date.toDateKey(new Date())
    };
    WorkTrack.state.update((state) => {
      state.documents[id] = { ...(state.documents[id] || {}), ...metadata };
    });
    WorkTrack.shell.showToast(WorkTrack.i18n.t("docUploadedToast"));
  }

  function savePaycheckMetadata(dateKey, file) {
    const metadata = {
      filename: file.name,
      mimeType: file.type || "unknown",
      uploaded: true,
      uploadedAt: WorkTrack.date.toDateKey(new Date())
    };
    WorkTrack.state.update((state) => {
      state.documents.payEvidence = { ...(state.documents.payEvidence || {}), ...metadata };
      state.logs[dateKey] = {
        ...(state.logs[dateKey] || {}),
        paycheckFile: metadata,
        payNote: state.logs[dateKey]?.payNote || WorkTrack.i18n.t("paycheckUploadedNote"),
        savedAt: new Date().toISOString()
      };
    });
    WorkTrack.shell.showToast(WorkTrack.i18n.t("docUploadedToast"));
  }

  function addCustom(title) {
    if (!title.trim()) return;
    const id = `custom-${Date.now()}`;
    WorkTrack.state.update((state) => {
      state.documents[id] = {
        id,
        title: title.trim(),
        detail: WorkTrack.i18n.t("docVisaDetail"),
        icon: "ADD",
        custom: true,
        uploaded: false,
        createdAt: new Date().toISOString()
      };
    });
    WorkTrack.shell.showToast(WorkTrack.i18n.t("customDocAddedToast"));
  }

  WorkTrack.features.documents = { getDocument, all, requiredProgress, saveMetadata, savePaycheckMetadata, addCustom };
})(window);
