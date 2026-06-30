// Service worker minimale — permette l'installazione PWA.
// Non fa caching aggressivo per evitare di servire versioni vecchie dell'app:
// i dati sono comunque su Google Drive, quindi serve sempre rete per funzionare bene.
const CACHE_NAME = 'sev4s3d-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// Network-first: prova sempre la rete, usa la cache solo come fallback offline
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
