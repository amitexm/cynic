const CACHE_NAME = 'cynicos-cache-v3';

// Core assets that MUST cache for the site to load
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// External assets (We will try to cache these, but won't let them crash the install if they fail)
const EXTERNAL_ASSETS = [
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css',
  'https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;600&family=Orbitron:wght@500;700&family=Share+Tech+Mono&display=swap',
  'https://unpkg.com/vis-timeline/standalone/umd/vis-timeline-graph2d.min.css',
  'https://unpkg.com/vis-timeline/standalone/umd/vis-timeline-graph2d.min.js',
  'https://cdn.tailwindcss.com',
  'https://code.jquery.com/jquery-3.7.1.min.js'
];

// INSTALL: Force wait skip, safely cache local files first
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // First, guarantee the core files are cached
      cache.addAll(CORE_ASSETS);
      // Then try the external files, but catch any errors so it doesn't abort the SW
      return cache.addAll(EXTERNAL_ASSETS).catch(err => console.warn('External cache skip:', err));
    })
  );
});

// ACTIVATE: Purge any old, broken caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) return caches.delete(cache);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// FETCH: Aggressive Offline Fallback
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then(cachedResponse => {
      // 1. Return cached version if found
      if (cachedResponse) return cachedResponse;
      
      // 2. Otherwise, fetch from network
      return fetch(event.request).catch(() => {
        // 3. IF OFFLINE: Force route all page navigations directly to the cached index.html
        if (event.request.mode === 'navigate' || (event.request.headers.get('accept') && event.request.headers.get('accept').includes('text/html'))) {
          return caches.match('./index.html');
        }
      });
    })
  );
});
