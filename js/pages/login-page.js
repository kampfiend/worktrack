(function (window) {
  const WorkTrack = window.WorkTrack;

  document.addEventListener("DOMContentLoaded", () => {
    WorkTrack.shell.init({ requireAuth: false });
    const form = WorkTrack.dom.$("#loginForm");
    form?.addEventListener("submit", (event) => {
      event.preventDefault();
      WorkTrack.features.auth.loginFromForm(form);
    });
  });
})(window);
