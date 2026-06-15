const CACHE_NAME = 'worktrack-v1';
const ASSETS = [
  './',
  './index.html',
  './home.html',
  './signup.html',
  './calendar.html',
  './vault.html',
  './report.html',
  './css/base.css',
  './css/components.css',
  './css/layout.css',
  './css/pages.css',
  './js/core/config.js',
  './js/core/date.js',
  './js/core/dom.js',
  './js/core/i18n.js',
  './js/core/shell.js',
  './js/core/state.js',
  './js/core/storage.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  );
});
