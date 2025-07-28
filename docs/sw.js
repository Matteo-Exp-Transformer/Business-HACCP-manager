const CACHE_NAME = 'mini-epack-pro-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './asset/index-BjvKARtX.js',
  './asset/index-BHgQLqRx.css',
  './pdf-export-temperature.js',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});

