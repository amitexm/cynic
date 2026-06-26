const CACHE_NAME = 'cynicos-cache-v2';

// Explicitly cache index.html (removed the ambiguous './' path)
const ASSETS_TO_CACHE = [
  'index.html',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css',
  'https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;600&family=Orbitron:wght@500;700&family=Share+Tech+Mono&display=swap',
  'https://unpkg.com/vis-timeline/standalone/umd/vis-timeline-graph2d.min.css',
  'https://unpkg.com/vis-timeline/standalone/umd/vis-timeline-graph2d.min.js',
  'https://cdn.tailwindcss.com',
  'https://code.jquery.com/jquery-3.7.1.min.js'
];

// Install Event: Cache everything and force activation
self.addEventListener('install', event => {
  self.skipWaiting(); // Force the waiting service worker to become the active one
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS_TO_CACHE))
  );
});

// Activate Event: Purge old illusions (v1 cache)
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) return caches.delete(cache);
        })
      );
    }).then(() => self.clients.claim()) // Take control of all open pages immediately
  );
});

// Fetch Event: The Aggressive Offline Fallback
self.addEventListener('fetch', event => {
  event.respondWith(
    // 1. Try to find an exact match in the cache
    caches.match(event.request, { ignoreSearch: true }).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;
      
      // 2. If not in cache, try the network
      return fetch(event.request).catch(() => {
        // 3. THE FIX: If the network fails (offline) AND the browser is trying 
        // to load a webpage (navigate mode), force-serve the cached index.html
        if (event.request.mode === 'navigate' || event.request.headers.get('accept').includes('text/html')) {
          return caches.match('index.html');
        }
      });
    })
  );
});
