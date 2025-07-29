// Service Worker per Mini-ePackPro HACCP PWA
// Versione cache - aggiorna quando modifichi l'app
const CACHE_NAME = 'mini-epackpro-v1.0.0'
const STATIC_CACHE = 'mini-epackpro-static-v1.0.0'
const DYNAMIC_CACHE = 'mini-epackpro-dynamic-v1.0.0'

// Determina il path di base dell'applicazione (utile quando è servita da una sottocartella)
const BASE_PATH = self.location.pathname.replace(/\/[^\/]*$/, '/');

// File da cachare immediatamente (prefetch)
const STATIC_FILES = [
  BASE_PATH,
  `${BASE_PATH}index.html`,
  `${BASE_PATH}manifest.json`,
  `${BASE_PATH}icons/icon-192x192.png`,
  `${BASE_PATH}icons/icon-512x512.png`,
  // I file JS e CSS verranno aggiunti dinamicamente
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
    (async () => {
      try {
        const cache = await caches.open(STATIC_CACHE)
        console.log('[SW] Caching static files')
        await cache.addAll(STATIC_FILES)
        console.log('[SW] Static files cached successfully')
      } catch (error) {
        console.error('[SW] Error caching static files:', error)
      } finally {
        // Procede comunque con l'attivazione, anche se alcuni file non sono stati cache-ati
        await self.skipWaiting()
      }
    })()
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
      console.log('[SW] Serving from cache:', request.url)
      return cachedResponse
    }
    
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, networkResponse.clone())
      console.log('[SW] Cached new resource:', request.url)
    }
    return networkResponse
  } catch (error) {
    console.error('[SW] Cache first failed:', error)
    return new Response('Offline - Resource not available', { 
      status: 503,
      statusText: 'Service Unavailable'
    })
  }
}

// Strategia Network First
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE)
      cache.put(request, networkResponse.clone())
      console.log('[SW] Updated cache from network:', request.url)
    }
    return networkResponse
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url)
    const cachedResponse = await caches.match(request)
    if (cachedResponse) {
      return cachedResponse
    }
    return new Response('Offline - API not available', { 
      status: 503,
      statusText: 'Service Unavailable'
    })
  }
}

// Strategia Stale While Revalidate
async function staleWhileRevalidate(request) {
  const cache = await caches.open(DYNAMIC_CACHE)
  const cachedResponse = await cache.match(request)
  
  const fetchPromise = fetch(request).then(networkResponse => {
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone())
      console.log('[SW] Updated cache in background:', request.url)
    }
    return networkResponse
  }).catch(error => {
    console.log('[SW] Background fetch failed:', error)
    return cachedResponse
  })
  
  return cachedResponse || fetchPromise
}

// Utility functions
function isStaticResource(request) {
  const url = new URL(request.url)
  const staticExtensions = ['.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.ico', '.woff', '.woff2']
  return staticExtensions.some(ext => url.pathname.endsWith(ext)) ||
         url.pathname.includes('/icons/') ||
         url.pathname.includes('/assets/')
}

function isApiRequest(request) {
  const url = new URL(request.url)
  return url.pathname.startsWith('/api/') || 
         url.pathname.includes('firebase') ||
         url.pathname.includes('googleapis')
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

// Pulizia cache
async function clearAllCaches() {
  const cacheNames = await caches.keys()
  return Promise.all(
    cacheNames.map(cacheName => caches.delete(cacheName))
  )
}

// Gestione errori
self.addEventListener('error', event => {
  console.error('[SW] Service Worker error:', event.error)
})

self.addEventListener('unhandledrejection', event => {
  console.error('[SW] Unhandled promise rejection:', event.reason)
})

// Notifiche push (per future implementazioni)
self.addEventListener('push', event => {
  console.log('[SW] Push message received')
  
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body || 'Nuova notifica HACCP',
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      vibrate: [200, 100, 200],
      data: data.data || {},
      actions: [
        {
          action: 'view',
          title: 'Visualizza',
          icon: '/icons/icon-96x96.png'
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
      clients.openWindow('/')
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

// Funzione di sincronizzazione dati HACCP
async function syncHACCPData() {
  try {
    // Qui implementeresti la logica di sincronizzazione
    // con il server quando la connessione è disponibile
    console.log('[SW] Syncing HACCP data...')
    
    // Esempio: invia dati localStorage al server
    const clients = await self.clients.matchAll()
    clients.forEach(client => {
      client.postMessage({
        type: 'SYNC_REQUEST',
        timestamp: Date.now()
      })
    })
    
    return Promise.resolve()
  } catch (error) {
    console.error('[SW] Sync failed:', error)
    return Promise.reject(error)
  }
}

console.log('[SW] Service Worker loaded successfully')