(function (window) {
  const WorkTrack = (window.WorkTrack = window.WorkTrack || {});
  let toastTimer = null;
  let shortcutsBound = false;
  let documentHandlersBound = false;

  function init({ requireAuth = true } = {}) {
    ensureSupportedLanguage();
    if (requireAuth && !WorkTrack.state.get().isLoggedIn) {
      window.location.href = WorkTrack.config.pages.login;
      return false;
    }

    renderLanguage();
    renderNav();
    renderMenu();
    bindShell();
    bindResetShortcuts();
    WorkTrack.i18n.translateDocument();
    return true;
  }

  function ensureSupportedLanguage() {
    const current = WorkTrack.state.get().profile.language;
    if (WorkTrack.config.languages.some((item) => item.code === current)) return;
    WorkTrack.state.update((state) => {
      state.profile.language = "en";
    });
  }

  function bindShell() {
    WorkTrack.dom.$("#menuButton")?.addEventListener("click", openMenu);
    WorkTrack.dom.$("#backdrop")?.addEventListener("click", () => {
      closeMenu();
      closeLanguageDropdown();
    });
    WorkTrack.dom.$("#languageButton")?.addEventListener("click", (event) => {
      event.stopPropagation();
      toggleLanguageDropdown();
    });
    WorkTrack.dom.$("#languageDropdown")?.addEventListener("click", handleLanguageDropdownClick);
    WorkTrack.dom.$("#sidePanel")?.addEventListener("click", handleMenuClick);
    bindDocumentHandlers();
  }

  function bindDocumentHandlers() {
    if (documentHandlersBound) return;
    documentHandlersBound = true;
    document.addEventListener("click", closeLanguageDropdown);
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeLanguageDropdown();
    });
  }

  function renderLanguage() {
    const button = WorkTrack.dom.$("#languageButton");
    const label = WorkTrack.dom.$("#languageLabel");
    const marker = WorkTrack.dom.$("#languageButton .language-dot");
    const current = WorkTrack.i18n.languageMeta(WorkTrack.state.get().profile.language);

    if (button) {
      button.setAttribute("aria-haspopup", "listbox");
      button.setAttribute("aria-expanded", "false");
      button.setAttribute("aria-controls", "languageDropdown");
    }
    if (marker) {
      marker.classList.add("language-flag");
      marker.textContent = current.flag || "";
    }
    if (label) label.textContent = current.label;
    renderLanguageDropdown();
  }

  function renderLanguageDropdown() {
    const button = WorkTrack.dom.$("#languageButton");
    if (!button) return;
    let dropdown = WorkTrack.dom.$("#languageDropdown");
    if (!dropdown) {
      dropdown = document.createElement("div");
      dropdown.id = "languageDropdown";
      dropdown.className = "language-dropdown";
      dropdown.setAttribute("role", "listbox");
      dropdown.hidden = true;
      button.insertAdjacentElement("afterend", dropdown);
    }

    const current = WorkTrack.state.get().profile.language;
    dropdown.innerHTML = WorkTrack.config.languages.map((item) => `
      <button class="language-option ${item.code === current ? "active" : ""}" type="button" role="option" aria-selected="${item.code === current}" data-language="${item.code}">
        <span class="language-option-flag" aria-hidden="true">${item.flag}</span>
        <span>${WorkTrack.dom.esc(item.label)}</span>
      </button>
    `).join("");
  }

  function toggleLanguageDropdown() {
    const dropdown = WorkTrack.dom.$("#languageDropdown");
    const button = WorkTrack.dom.$("#languageButton");
    if (!dropdown || !button) return;
    const isOpen = !dropdown.hidden;
    dropdown.hidden = isOpen;
    button.setAttribute("aria-expanded", String(!isOpen));
  }

  function closeLanguageDropdown() {
    const dropdown = WorkTrack.dom.$("#languageDropdown");
    const button = WorkTrack.dom.$("#languageButton");
    if (dropdown) dropdown.hidden = true;
    if (button) button.setAttribute("aria-expanded", "false");
  }

  function handleLanguageDropdownClick(event) {
    const option = event.target.closest("[data-language]");
    if (!option) return;
    event.stopPropagation();
    setLanguage(option.dataset.language);
  }

  function renderNav() {
    const nav = WorkTrack.dom.$("#bottomNav");
    if (!nav) return;
    const active = WorkTrack.dom.pageName();
    nav.innerHTML = WorkTrack.config.tabs.map((tab) => `
      <a class="nav-item ${active === tab.id ? "active" : ""}" href="${tab.page}" aria-label="${WorkTrack.i18n.t(tab.labelKey)}">
        <span class="nav-icon" aria-hidden="true">${navIconSvg(tab.icon)}</span>${WorkTrack.i18n.t(tab.labelKey)}
      </a>
    `).join("");
  }

  function navIconSvg(icon) {
    const icons = {
      home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11.5 12 5l8 6.5"></path><path d="M6.5 10.5V20h11v-9.5"></path><path d="M10 20v-5h4v5"></path></svg>',
      calendar: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5" width="16" height="15" rx="2"></rect><path d="M8 3v4M16 3v4M4 10h16"></path><path d="M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01"></path></svg>',
      vault: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="9" width="14" height="11" rx="2"></rect><path d="M8 9V7a4 4 0 0 1 8 0v2"></path><circle cx="12" cy="14.5" r="1.5"></circle><path d="M12 16v1.5"></path></svg>',
      report: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3h7l4 4v14H7z"></path><path d="M14 3v5h5"></path><path d="M9.5 15.5l2 2 4-5"></path><path d="M9 11h4"></path></svg>'
    };
    return icons[icon] || icons.home;
  }

  function renderMenu() {
    const panel = WorkTrack.dom.$("#sidePanel");
    if (!panel) return;
    const language = WorkTrack.state.get().profile.language;
    panel.innerHTML = `
      <div class="side-head">
        <span>WorkTrack</span>
        <button class="close-button" type="button" data-shell-action="close-menu" aria-label="${WorkTrack.i18n.t("menuClose")}">x</button>
      </div>
      <button class="side-row" type="button" data-shell-action="notifications">${WorkTrack.i18n.t("notifications")}</button>
      <button class="side-row" type="button" data-shell-action="profile">${WorkTrack.i18n.t("myPage")}</button>
      <p class="eyebrow" style="margin-top:22px;">${WorkTrack.i18n.t("selectLanguage")}</p>
      <div class="language-list">
        ${WorkTrack.config.languages.map((item) => `
          <button class="language-choice ${item.code === language ? "active" : ""}" type="button" data-language="${item.code}"><span aria-hidden="true">${item.flag}</span>${WorkTrack.dom.esc(item.label)}</button>
        `).join("")}
      </div>
      <button class="side-row" type="button" data-shell-action="support">${WorkTrack.i18n.t("supportChatbot")}</button>
      <p class="eyebrow" style="margin-top:22px;">${WorkTrack.i18n.t("demoResetControls")}</p>
      <button class="side-row" type="button" data-shell-action="reset-documents">${WorkTrack.i18n.t("resetDocumentsOnly")}</button>
      <button class="side-row" type="button" data-shell-action="reset-calendar">${WorkTrack.i18n.t("resetCalendarOnly")}</button>
      <button class="side-row" type="button" data-shell-action="reset-readiness">${WorkTrack.i18n.t("resetReadinessOnly")}</button>
      <p class="muted" style="font-size:12px;margin:10px 0 14px;">${WorkTrack.i18n.t("resetShortcutHint")}</p>
      <button class="side-row" type="button" data-shell-action="reset-demo">${WorkTrack.i18n.t("resetDemo")}</button>
      <button class="side-row danger" type="button" data-shell-action="clear-local">${WorkTrack.i18n.t("clearLocalData")}</button>
    `;
  }

  function handleMenuClick(event) {
    const languageButton = event.target.closest("[data-language]");
    if (languageButton) {
      setLanguage(languageButton.dataset.language);
      closeMenu();
      return;
    }

    const actionButton = event.target.closest("[data-shell-action]");
    if (!actionButton) return;
    const action = actionButton.dataset.shellAction;

    if (action === "close-menu") closeMenu();
    if (action === "notifications") notifyAndClose("notificationsToast");
    if (action === "profile") notifyAndClose("profileToast");
    if (action === "support") notifyAndClose("supportToast");
    if (action === "reset-documents") runResetAndRefresh("resetDocuments");
    if (action === "reset-calendar") runResetAndRefresh("resetCalendarEntries");
    if (action === "reset-readiness") runResetAndRefresh("resetReadinessView");
    if (action === "reset-demo") {
      WorkTrack.state.reset({ keepLanguage: true, loggedIn: true });
      closeMenu();
      showToast(WorkTrack.i18n.t("demoResetToast"));
      window.location.reload();
    }
    if (action === "clear-local") {
      WorkTrack.storage.remove(WorkTrack.config.storageKey);
      WorkTrack.storage.remove(WorkTrack.config.legacyStorageKey);
      WorkTrack.state.reset({ keepLanguage: true, loggedIn: false });
      window.location.href = WorkTrack.config.pages.login;
    }
  }

  function notifyAndClose(key) {
    closeMenu();
    showToast(WorkTrack.i18n.t(key));
  }

  function bindResetShortcuts() {
    if (shortcutsBound) return;
    shortcutsBound = true;
    document.addEventListener("keydown", (event) => {
      if (!event.ctrlKey || !event.altKey) return;
      if (isTextInput(event.target)) return;
      const key = event.key.toLowerCase();
      if (key === "d") {
        event.preventDefault();
        runResetAndRefresh("resetDocuments");
      }
      if (key === "c") {
        event.preventDefault();
        runResetAndRefresh("resetCalendarEntries");
      }
      if (key === "r") {
        event.preventDefault();
        runResetAndRefresh("resetReadinessView");
      }
    });
  }

  function runResetAndRefresh(methodName) {
    WorkTrack.features.reset?.[methodName]?.();
    closeMenu();
    closeLanguageDropdown();
    document.dispatchEvent(new CustomEvent("worktrack:data-reset"));
  }

  function isTextInput(target) {
    return ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName);
  }

  function setLanguage(code) {
    const next = WorkTrack.i18n.languageMeta(code);
    WorkTrack.state.update((state) => {
      state.profile.language = next.code;
    });
    WorkTrack.i18n.translateDocument();
    renderLanguage();
    renderNav();
    renderMenu();
    closeLanguageDropdown();
    showToast(WorkTrack.i18n.t("languageChangedToast", { language: next.label }));
    document.dispatchEvent(new CustomEvent("worktrack:language-changed"));
  }

  function openMenu() {
    closeLanguageDropdown();
    WorkTrack.dom.$("#sidePanel")?.classList.add("open");
    WorkTrack.dom.$("#sidePanel")?.setAttribute("aria-hidden", "false");
    const backdrop = WorkTrack.dom.$("#backdrop");
    if (backdrop) backdrop.hidden = false;
  }

  function closeMenu() {
    WorkTrack.dom.$("#sidePanel")?.classList.remove("open");
    WorkTrack.dom.$("#sidePanel")?.setAttribute("aria-hidden", "true");
    const backdrop = WorkTrack.dom.$("#backdrop");
    if (backdrop) backdrop.hidden = true;
  }

  function showToast(message) {
    const toast = WorkTrack.dom.$("#toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2500);
  }

  WorkTrack.shell = { init, showToast, setLanguage, renderLanguage, renderNav, renderMenu };
})(window);
