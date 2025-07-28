// Service Worker per Mini-ePackPro HACCP PWA
// Versione cache - aggiorna quando modifichi l'app
const CACHE_NAME = 'mini-epackpro-v1.0.0'
const STATIC_CACHE = 'mini-epackpro-static-v1.0.0'
const DYNAMIC_CACHE = 'mini-epackpro-dynamic-v1.0.0'

// File da cachare immediatamente
const STATIC_FILES = [
  '/docs/',
  '/docs/index.html',
  '/docs/manifest.json',
  '/docs/asset/index-BjvKARtX.js',
  '/docs/asset/index-BHgQLqRx.css',
  '/docs/icons/icon-192x192.png',
  '/docs/icons/icon-512x512.png'
]

// File che non devono essere cachati
const EXCLUDE_FROM_CACHE = [
  '/api/',
  '/admin/',
  'chrome-extension://',
  'moz-extension://'
]

// Installazione Service Worker
self.addEventListener('install', event => {
  console.log('[SW] Installing Service Worker...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('[SW] Caching static files')
        return cache.addAll(STATIC_FILES)
      })
      .then(() => {
        console.log('[SW] Static files cached successfully')
        return self.skipWaiting()
      })
      .catch(error => {
        console.error('[SW] Error caching static files:', error)
      })
  )
})

// Attivazione Service Worker
self.addEventListener('activate', event => {
  console.log('[SW] Activating Service Worker...')
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            // Rimuovi cache vecchie
            if (cacheName !== STATIC_CACHE && 
                cacheName !== DYNAMIC_CACHE && 
                cacheName !== CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('[SW] Service Worker activated')
        return self.clients.claim()
      })
  )
})

// Intercettazione richieste
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url)
  
  // Ignora richieste non HTTP/HTTPS
  if (!event.request.url.startsWith('http')) {
    return
  }
  
  // Ignora file esclusi
  if (EXCLUDE_FROM_CACHE.some(exclude => event.request.url.includes(exclude))) {
    return
  }
  
  // Strategia Cache First per risorse statiche
  if (isStaticResource(event.request)) {
    event.respondWith(cacheFirst(event.request))
  }
  // Strategia Network First per API e dati dinamici
  else if (isApiRequest(event.request)) {
    event.respondWith(networkFirst(event.request))
  }
  // Strategia Stale While Revalidate per pagine HTML
  else {
    event.respondWith(staleWhileRevalidate(event.request))
  }
})

// Strategia Cache First
async function cacheFirst(request) {
  try {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    
    const networkResponse = await fetch(request)
    const cache = await caches.open(DYNAMIC_CACHE)
    cache.put(request, networkResponse.clone())
    return networkResponse
  } catch (error) {
    console.error('[SW] Cache first failed:', error)
    // Fallback per risorse critiche
    if (request.url.includes('/docs/')) {
      return caches.match('/docs/index.html')
    }
  }
}

// Strategia Network First
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request)
    const cache = await caches.open(DYNAMIC_CACHE)
    cache.put(request, networkResponse.clone())
    return networkResponse
  } catch (error) {
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    throw error
  }
}

// Strategia Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE)
  const cachedResponse = await cache.match(request)
  
  const networkResponsePromise = fetch(request).then(response => {
    cache.put(request, response.clone())
    return response
  }).catch(error => {
    console.log('[SW] Background fetch failed:', error)
  })
  
  return cachedResponse || networkResponsePromise
}

// Funzioni di utilità
function isStaticResource(request) {
  return request.url.includes('/docs/asset/') ||
         request.url.includes('/docs/icons/') ||
         request.url.includes('/docs/manifest.json')
}

function isApiRequest(request) {
  return request.url.includes('/api/') ||
         request.url.includes('/admin/')
}

// Gestione errori
self.addEventListener('error', event => {
  console.error('[SW] Service Worker error:', event.error)
})

self.addEventListener('unhandledrejection', event => {
  console.error('[SW] Unhandled promise rejection:', event.reason)
})

// Funzioni per la gestione dei dati HACCP
async function clearAllCaches() {
  const cacheNames = await caches.keys()
  return Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  )
}

// Sincronizzazione dati HACCP
async function syncHACCPData() {
  try {
    // Qui puoi implementare la sincronizzazione con un server
    // Per ora, salviamo solo localmente
    const clients = await self.clients.matchAll()
    clients.forEach(client => {
      client.postMessage({
        type: 'HACCP_DATA_SYNC',
        timestamp: new Date().toISOString()
      })
    })
  } catch (error) {
    console.error('[SW] Sync failed:', error)
    return Promise.reject(error)
  }
}

// Gestione messaggi dal client
self.addEventListener('message', event => {
  console.log('[SW] Message received:', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME })
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    clearAllCaches().then(() => {
      event.ports[0].postMessage({ success: true })
    })
  }
})

// Notifiche push (per future implementazioni)
self.addEventListener('push', event => {
  console.log('[SW] Push message received')
  
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body || 'Nuova notifica HACCP',
      icon: '/docs/icons/icon-192x192.png',
      badge: '/docs/icons/icon-72x72.png',
      vibrate: [200, 100, 200],
      data: data.data || {},
      actions: [
        {
          action: 'view',
          title: 'Visualizza',
          icon: '/docs/icons/icon-96x96.png'
        },
        {
          action: 'dismiss',
          title: 'Ignora'
        }
      ]
    }
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'Mini-ePackPro', options)
    )
  }
})

// Click su notifiche
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notification clicked:', event.notification.tag)
  
  event.notification.close()
  
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow('/docs/')
    )
  }
})

// Sincronizzazione in background
self.addEventListener('sync', event => {
  console.log('[SW] Background sync:', event.tag)
  
  if (event.tag === 'haccp-data-sync') {
    event.waitUntil(syncHACCPData())
  }
})

console.log('[SW] Service Worker loaded successfully')

