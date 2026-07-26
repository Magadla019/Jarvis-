const CACHE_NAME = 'jarvis-v6.2';
const urlsToCache = [
  '/',
  '/index.html',
  '/style.css',
  '/app.js',
  '/hud_outer.svg',
  '/hud_middle.svg',
  '/hud_inner.svg',
  '/scan_ring.svg',
  '/energy_ring.svg',
  '/hex_grid.svg',
  '/data_streams.svg',
  '/target_lock.svg',
  '/circuit_ring.svg',
  '/core_glow.svg',
  '/core.svg',
  '/jarvis_logo.svg',
  '/jarvis_hud.svg'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache))
  );
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response;
      return fetch(event.request);
    })
  );
});
