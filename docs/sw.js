const BASE_URL = '/Business-HACCP-manager'; // Assicurati che questo corrisponda al nome del tuo repository

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open("mini-epackpro-cache").then(cache => {
      return cache.addAll([
        BASE_URL + '/',
        BASE_URL + '/index.html',
        BASE_URL + '/manifest.json',
        BASE_URL + '/asset/index-CCfqFBtM.css',
        BASE_URL + '/asset/index-1-vZa4Ks.js',
        BASE_URL + '/icons/icon-72x72.png',
        BASE_URL + '/icons/icon-96x96.png',
        BASE_URL + '/icons/icon-128x128.png',
        BASE_URL + '/icons/icon-144x144.png',
        BASE_URL + '/icons/icon-152x152.png',
        BASE_URL + '/icons/icon-192x192.png',
        BASE_URL + '/icons/icon-384x384.png',
        BASE_URL + '/icons/icon-512x512.png'
      ]);
    })
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
