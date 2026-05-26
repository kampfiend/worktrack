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
        icon: documentIcon(definition.icon, "file-text")
      };
    }
    return {
      id,
      ...stored,
      title: stored.title || WorkTrack.i18n.t("docVisa"),
      detail: stored.detail || WorkTrack.i18n.t("docVisaDetail"),
      icon: documentIcon(stored.icon, stored.custom ? "plus" : "file-text")
    };
  }

  function documentIcon(icon, fallback = "file-text") {
    const legacyIcons = {
      ADD: "plus",
      DOC: "file-text",
      ID: "id-card",
      MED: "medical",
      PAY: "cash",
      TIME: "clock"
    };
    const normalized = legacyIcons[String(icon || "").toUpperCase()] || icon;
    return Object.prototype.hasOwnProperty.call(iconRegistry, normalized) ? normalized : fallback;
  }

  const iconRegistry = {
    "cash": '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="2"></rect><circle cx="12" cy="12" r="3"></circle><path d="M6 9h2M16 15h2"></path></svg>',
    "clock": '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"></circle><path d="M12 8v5l3 2"></path></svg>',
    "file-text": '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l4 4v14H7z"></path><path d="M14 3v5h5M9 12h6M9 16h6"></path></svg>',
    "id-card": '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="2"></rect><circle cx="9" cy="11" r="2"></circle><path d="M6 16c.6-1.8 5.4-1.8 6 0M14 10h4M14 14h4"></path></svg>',
    "medical": '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="4" width="6" height="16" rx="1"></rect><rect x="4" y="9" width="16" height="6" rx="1"></rect></svg>',
    "plus": '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8"></circle><path d="M12 8v8M8 12h8"></path></svg>'
  };

  function iconSvg(icon) {
    return iconRegistry[documentIcon(icon)] || iconRegistry["file-text"];
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
        icon: "plus",
        custom: true,
        uploaded: false,
        createdAt: new Date().toISOString()
      };
    });
    WorkTrack.shell.showToast(WorkTrack.i18n.t("customDocAddedToast"));
  }

  WorkTrack.features.documents = { getDocument, all, requiredProgress, saveMetadata, savePaycheckMetadata, addCustom, iconSvg };
})(window);
