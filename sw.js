const CACHE_NAME = 'cynicos-cache-v1';

// We must cache the HTML and all external CDNs we rely on
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css',
  'https://fonts.googleapis.com/css2?family=Chakra+Petch:wght@400;600&family=Orbitron:wght@500;700&family=Share+Tech+Mono&display=swap',
  'https://unpkg.com/vis-timeline/standalone/umd/vis-timeline-graph2d.min.css',
  'https://unpkg.com/vis-timeline/standalone/umd/vis-timeline-graph2d.min.js',
  'https://cdn.tailwindcss.com',
  'https://code.jquery.com/jquery-3.7.1.min.js'
];

// Install Event: Cache everything immediately
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// Fetch Event: Serve from cache first, fallback to network
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
          return cachedResponse || fetch(event.request);
      })
  );
});
