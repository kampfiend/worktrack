(function (window) {
  const WorkTrack = (window.WorkTrack = window.WorkTrack || {});
  const escapeMap = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };

  function $(selector, root = document) {
    return root.querySelector(selector);
  }

  function $all(selector, root = document) {
    return [...root.querySelectorAll(selector)];
  }

  function esc(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => escapeMap[char]);
  }

  function setText(selector, value, root = document) {
    const node = $(selector, root);
    if (node) node.textContent = value;
  }

  function setHTML(selector, value, root = document) {
    const node = $(selector, root);
    if (node) node.innerHTML = value;
  }

  function pageName() {
    return document.body.dataset.page || "login";
  }

  WorkTrack.dom = { $, $all, esc, setText, setHTML, pageName };
})(window);
