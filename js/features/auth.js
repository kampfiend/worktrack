(function (window) {
  const WorkTrack = (window.WorkTrack = window.WorkTrack || {});
  WorkTrack.features = WorkTrack.features || {};

  function loginFromForm(form) {
    const data = new FormData(form);
    WorkTrack.state.update((state) => {
      state.profile.email = String(data.get("email") || state.profile.email).trim();
      state.isLoggedIn = true;
    });
    WorkTrack.shell.showToast(WorkTrack.i18n.t("loggedInToast"));
    window.location.href = WorkTrack.config.pages.home;
  }

  function signupFromForm(form) {
    const data = new FormData(form);
    WorkTrack.state.update((state) => {
      state.profile.name = String(data.get("name") || "Worker").trim();
      state.profile.nationality = supportedCountryCode(data.get("nationality"), state.profile.language);
      state.profile.email = String(data.get("email") || "").trim();
      state.profile.residentId = String(data.get("residentId") || "").trim();
      state.profile.birthDate = String(data.get("birthDate") || "");
      state.profile.payday = clamp(Number(data.get("payday")), 1, 31);
      state.isLoggedIn = true;
    });
    WorkTrack.shell.showToast(WorkTrack.i18n.t("profileCreatedToast"));
    window.location.href = WorkTrack.config.pages.home;
  }

  function logoutToDemo() {
    WorkTrack.state.reset({ keepLanguage: true, loggedIn: false });
    window.location.href = WorkTrack.config.pages.login;
  }

  function clamp(value, min, max) {
    if (Number.isNaN(value)) return min;
    return Math.max(min, Math.min(max, value));
  }

  function supportedCountryCode(value, language) {
    const normalized = String(value || "").trim();
    if (WorkTrack.config.countries.some((item) => item.code === normalized)) return normalized;
    return WorkTrack.config.countries.find((item) => item.languageCode === language)?.code || WorkTrack.config.countries[0]?.code || "us";
  }

  WorkTrack.features.auth = { loginFromForm, signupFromForm, logoutToDemo };
})(window);
