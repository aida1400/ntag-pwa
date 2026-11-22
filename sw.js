// N-tag Progressive Web App Service Worker v4.3.3
const CACHE_NAME = 'ntag-pwa-v4.3.3';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  // Never intercept external APIs, Bale, or GitHub
  if (
    event.request.url.includes('bale.ai') ||
    event.request.url.includes('github') ||
    event.request.url.includes('googleapis') ||
    event.request.url.includes('gstatic')
  ) {
    return;
  }

  // Network First for HTML and version.json to ensure immediate updates
  if (event.request.mode === 'navigate' || event.request.url.includes('index.html') || event.request.url.includes('version.json')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          return response;
        })
        .catch(() => caches.match(event.request))
    );
    return;
  }

  // Cache First for icons and static assets
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
