// Service worker minimale — permette l'installazione PWA.
// Non fa caching aggressivo per evitare di servire versioni vecchie dell'app:
// i dati sono comunque su Google Drive, quindi serve sempre rete per funzionare bene.
const CACHE_NAME = 'sev4s3d-v2';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.map((n) => n !== CACHE_NAME ? caches.delete(n) : null))
    ).then(() => self.clients.claim())
  );
});

// Network-first con timeout: se la rete non risponde entro 3s, usa la cache.
// Se la rete risponde (anche con errore HTTP) usiamo sempre quella, mai la cache.
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
