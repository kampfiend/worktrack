(function (window) {
  const WorkTrack = (window.WorkTrack = window.WorkTrack || {});

  function read(key) {
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch {
      return null;
    }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }

  function remove(key) {
    localStorage.removeItem(key);
  }

  function loadRawState() {
    return read(WorkTrack.config.storageKey) || read(WorkTrack.config.legacyStorageKey);
  }

  WorkTrack.storage = { read, write, remove, loadRawState };
})(window);
