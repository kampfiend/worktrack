(function (window) {
  const WorkTrack = window.WorkTrack;
  let selectedDocumentId = null;

  document.addEventListener("DOMContentLoaded", () => {
    if (!WorkTrack.shell.init()) return;
    render();
    bindEvents();
    document.addEventListener("worktrack:language-changed", render);
    document.addEventListener("worktrack:data-reset", render);
  });

  function bindEvents() {
    WorkTrack.dom.$("#documentList")?.addEventListener("click", (event) => {
      const card = event.target.closest("[data-doc-id]");
      if (!card) return;
      selectedDocumentId = card.dataset.docId;
      WorkTrack.dom.$("#documentInput").value = "";
      WorkTrack.dom.$("#documentInput").click();
    });
    WorkTrack.dom.$("#documentInput")?.addEventListener("change", (event) => {
      const file = event.target.files?.[0];
      if (!file || !selectedDocumentId) return;
      WorkTrack.features.documents.saveMetadata(selectedDocumentId, file);
      render();
    });
    WorkTrack.dom.$("#customDocArea")?.addEventListener("submit", (event) => {
      event.preventDefault();
      WorkTrack.features.documents.addCustom(new FormData(event.target).get("title") || "");
      event.target.reset();
      render();
    });
  }

  function render() {
    const progress = WorkTrack.features.documents.requiredProgress();
    WorkTrack.dom.setText("#vaultTitle", WorkTrack.i18n.t("documentVault"));
    WorkTrack.dom.setText("#vaultSubtitle", WorkTrack.i18n.t("vaultSubtitle"));
    WorkTrack.dom.setText("#requiredStatusTitle", WorkTrack.i18n.t("requiredStatus"));
    WorkTrack.dom.setHTML("#requiredList", progress.docs.map((doc) => `<div class="required-row ${doc.uploaded ? "done" : ""}"><span class="check-mark">${doc.uploaded ? "OK" : ""}</span><span>${WorkTrack.dom.esc(doc.title)}</span></div>`).join(""));
    WorkTrack.dom.setText("#progressText", `${progress.percent}%`);
    const progressFill = WorkTrack.dom.$("#progressFill");
    if (progressFill) progressFill.style.width = `${progress.percent}%`;
    WorkTrack.dom.setHTML("#documentList", WorkTrack.features.documents.all().map(renderDocumentCard).join(""));
    WorkTrack.i18n.translateDocument();
  }

  function renderDocumentCard(doc) {
    const uploaded = Boolean(doc.uploaded);
    const date = doc.uploadedAt || doc.date || WorkTrack.date.toDateKey(new Date());
    const detail = uploaded ? WorkTrack.i18n.t("uploadedOn", { date: WorkTrack.date.formatDate(WorkTrack.date.parseDateKey(date), { month: "short", day: "numeric", year: "numeric" }) }) : doc.detail;
    return `
      <button class="document-card ${uploaded ? "done" : ""}" type="button" data-doc-id="${doc.id}">
        <span class="doc-icon">${WorkTrack.dom.esc(doc.icon || "DOC")}</span>
        <span><h3>${WorkTrack.dom.esc(doc.title)}</h3><p>${WorkTrack.dom.esc(uploaded && doc.filename ? `${detail} - ${doc.filename}` : detail)}</p></span>
        <span class="state-pill ${uploaded ? "done" : ""}">${uploaded ? WorkTrack.i18n.t("saved") : WorkTrack.i18n.t("required")}</span>
      </button>
    `;
  }
})(window);




