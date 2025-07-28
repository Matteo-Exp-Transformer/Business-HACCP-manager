const CACHE_NAME = 'mini-epack-pro-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './asset/index-BjvKARtX.js',
  './asset/index-BHgQLqRx.css',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('[SW] Caching files:', urlsToCache);
        return cache.addAll(urlsToCache);
      })
      .catch(function(error) {
        console.error('[SW] Error caching files:', error);
      })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
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
      })
      .catch(function(error) {
        console.error('[SW] Fetch failed:', error);
        // Return a fallback response for navigation requests
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      })
  );
});

