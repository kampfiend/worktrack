(function (window) {
  const WorkTrack = window.WorkTrack;

  document.addEventListener("DOMContentLoaded", () => {
    WorkTrack.shell.init({ requireAuth: false });
    fillProfileDefaults();
    const form = WorkTrack.dom.$("#signupForm");
    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      WorkTrack.features.auth.signupFromForm(form);
    });
  });

  function fillProfileDefaults() {
    const profile = WorkTrack.state.get().profile;
    setValue("signupName", profile.name);
    setValue("signupNationality", profile.nationality);
    setValue("signupEmail", profile.email);
    setValue("signupResidentId", profile.residentId);
    setValue("signupBirthDate", profile.birthDate);
    setValue("signupPayday", profile.payday);
  }

  function setValue(id, value) {
    const node = document.getElementById(id);
    if (node) node.value = value || "";
  }
})(window);
