(function (window) {
  const WorkTrack = window.WorkTrack;

  document.addEventListener("DOMContentLoaded", () => {
    WorkTrack.shell.init({ requireAuth: false });
    renderNationalityOptions();
    fillProfileDefaults();
    document.addEventListener("worktrack:language-changed", () => {
      renderNationalityOptions();
    });
    const form = WorkTrack.dom.$("#signupForm");
    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      WorkTrack.features.auth.signupFromForm(form);
    });
  });

  function fillProfileDefaults() {
    const profile = WorkTrack.state.get().profile;
    const nationality = countryCodeFromValue(profile.nationality, profile.language) || defaultCountryCode(profile.language);
    setValue("signupName", profile.name);
    setValue("signupNationality", nationality);
    setValue("signupEmail", profile.email);
    setValue("signupResidentId", profile.residentId);
    setValue("signupBirthDate", profile.birthDate);
    setValue("signupPayday", profile.payday);
  }

  function renderNationalityOptions() {
    const select = document.getElementById("signupNationality");
    if (!select) return;
    const language = WorkTrack.state.get().profile.language;
    const selected = countryCodeFromValue(select.value, language) || countryCodeFromValue(WorkTrack.state.get().profile.nationality, language) || defaultCountryCode(language);
    select.innerHTML = WorkTrack.config.countries.map((item) => {
      const value = WorkTrack.dom.esc(item.code);
      const label = WorkTrack.dom.esc(countryName(item, language));
      return `<option value="${value}">${label}</option>`;
    }).join("");
    select.value = selected;
    if (select.value !== selected) select.value = WorkTrack.config.countries[0]?.code || "";
  }

  function countryName(country, language) {
    return country.names?.[language] || country.names?.en || country.code;
  }

  function countryCodeFromValue(value, language) {
    const normalized = String(value || "").trim();
    if (!normalized) return "";
    const country = WorkTrack.config.countries.find((item) => {
      if (item.code === normalized) return true;
      return Object.values(item.names || {}).some((name) => name === normalized);
    });
    if (country) return country.code;
    const matchingLanguage = WorkTrack.config.languages.find((item) => item.code === normalized || item.label === normalized);
    if (matchingLanguage) return defaultCountryCode(matchingLanguage.code);
    return language ? defaultCountryCode(language) : "";
  }

  function defaultCountryCode(language) {
    return WorkTrack.config.countries.find((item) => item.languageCode === language)?.code || WorkTrack.config.countries[0]?.code || "";
  }

  function setValue(id, value) {
    const node = document.getElementById(id);
    if (node) node.value = value || "";
  }
})(window);
