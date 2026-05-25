(function (window) {
  const WorkTrack = (window.WorkTrack = window.WorkTrack || {});
  WorkTrack.features = WorkTrack.features || {};

  function go(pageName) {
    const target = WorkTrack.config.pages[pageName] || pageName;
    window.location.href = target;
  }

  WorkTrack.features.navigation = { go };
})(window);
