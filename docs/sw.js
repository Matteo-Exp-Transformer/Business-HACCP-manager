const CACHE_NAME = 'mini-epack-pro-v1.1.0-strategic';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './asset/index-BjvKARtX.js',
  './asset/index-BHgQLqRx.css',
  './icons/icon-72x72.png',
  './icons/icon-96x96.png',
  './icons/icon-128x128.png',
  './icons/icon-144x144.png',
  './icons/icon-152x152.png',
  './icons/icon-192x192.png',
  './icons/icon-384x384.png',
  './icons/icon-512x512.png',
  './favicon.ico'
];

self.addEventListener('install', function(event) {
  console.log('🔧 [SW] Installazione Service Worker in corso...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('📦 [SW] Cache aperta, aggiungendo file...');
        return cache.addAll(urlsToCache);
      })
      .then(function() {
        console.log('✅ [SW] Tutti i file cachati con successo');
        return self.skipWaiting();
      })
      .catch(function(error) {
        console.error('❌ [SW] Errore durante il caching:', error);
      })
  );
});

self.addEventListener('activate', function(event) {
  console.log('🚀 [SW] Attivazione Service Worker...');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ [SW] Rimozione cache obsoleta:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      console.log('✅ [SW] Service Worker attivato');
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event) {
  // Ignora richieste non HTTP/HTTPS
  if (!event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        if (response) {
          console.log('💾 [SW] Servendo da cache:', event.request.url);
          return response;
        }
        
        console.log('🌐 [SW] Fetching da rete:', event.request.url);
        return fetch(event.request)
          .then(function(response) {
            // Verifica che la risposta sia valida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clona la risposta per il cache
            var responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(function(error) {
            console.error('❌ [SW] Fetch fallito:', error);
            // Ritorna una risposta offline se disponibile
            return caches.match('./index.html');
          });
      })
  );
});

