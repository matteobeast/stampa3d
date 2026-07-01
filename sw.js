// Stampa3D Service Worker — v1.1
const CACHE = 'stampa3d-v1';

// File da mettere in cache per uso offline
const PRECACHE = [
  './stampa3d_drive.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  // jsPDF dalla CDN — verrà cachato al primo accesso
  'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js'
];

// Installazione: pre-carica le risorse locali
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => {
      // Prima carichiamo le risorse locali (critiche)
      const local = PRECACHE.filter(u => u.startsWith('./'));
      return cache.addAll(local).catch(() => {});
    })
  );
  self.skipWaiting();
});

// Attivazione: rimuovi vecchie cache
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: Network First per le API Google, Cache First per il resto
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // Le chiamate Google Drive/OAuth vanno sempre in rete
  if (url.includes('googleapis.com') || url.includes('accounts.google.com')) {
    return; // lascia passare direttamente
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      const network = fetch(event.request).then(response => {
        // Salva in cache le risorse riuscite (solo GET)
        if (response.ok && event.request.method === 'GET') {
          const clone = response.clone();
          caches.open(CACHE).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => null);

      // Restituisce cache se disponibile, altrimenti aspetta la rete
      return cached || network;
    })
  );
});
