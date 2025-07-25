self.addEventListener("install", event => {
  event.waitUntil(
    caches.open("mini-epackpro-cache").then(cache => {
      return cache.addAll([
        "/",
        "/index.html",
        "/manifest.json",
        "/assets/index-CCfqFBtM.css",
        "/assets/index-1-vZa4Ks.js",
        "/icons/icon-72x72.png",
        "/icons/icon-96x96.png",
        "/icons/icon-128x128.png",
        "/icons/icon-144x144.png",
        "/icons/icon-152x152.png",
        "/icons/icon-192x192.png",
        "/icons/icon-384x384.png",
        "/icons/icon-512x512.png"
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
