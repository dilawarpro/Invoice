// sw.js
const CACHE_NAME = 'app-cache-v2'; // bump this string every time you deploy changes

// List every file your app needs to run with ZERO network.
// Use paths relative to where sw.js is registered (usually root).
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './manifest.json',
  './dukanslip.png'
  // add any other CSS/JS/image/font files your app actually loads
];

// Install: cache all core assets. Cache each one individually so
// one failing file doesn't break the whole install.
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.all(
        ASSETS.map((url) =>
          cache.add(url).catch((err) => console.warn('Failed to cache:', url, err))
        )
      );
    })
  );
});

// Activate: delete old caches, take control immediately.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

// Fetch: cache-first, fall back to network, fall back to cached index.html.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return; // don't intercept POST etc.

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;

      return fetch(event.request)
        .then((response) => {
          if (response && response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => caches.match('./index.html'));
    })
  );
});
