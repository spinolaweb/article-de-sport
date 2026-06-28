// Service Worker — Champions League Landing Page
// Cache-first strategy for images, network-first for HTML

const CACHE_NAME = 'cl-lp-v1';
const STATIC_ASSETS = [
  '/hero.jpg',
  '/ProblemSolution.jpg',
  '/Benefits.jpg',
  '/offer.jpg',
  '/logo.jpeg'
];

// Pre-cache hero image on install
self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      // Only cache hero immediately, others lazily
      return cache.add('/hero.jpg').catch(function() {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(key) { return key !== CACHE_NAME; })
            .map(function(key) { return caches.delete(key); })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  var url = event.request.url;

  // Cache-first for images
  if (/\.(jpg|jpeg|png|gif|webp|svg|ico)$/.test(url)) {
    event.respondWith(
      caches.open(CACHE_NAME).then(function(cache) {
        return cache.match(event.request).then(function(cached) {
          if (cached) return cached;
          return fetch(event.request).then(function(response) {
            if (response && response.status === 200) {
              cache.put(event.request, response.clone());
            }
            return response;
          }).catch(function() { return cached; });
        });
      })
    );
    return;
  }

  // Network-first for everything else (HTML, API calls)
  // Just let them pass through
});
