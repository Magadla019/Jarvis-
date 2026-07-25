// Minimal service worker — required by Chrome's install criteria on Android
// (a fetch handler must exist, even a pass-through one, for the
// "Add to Home Screen" prompt to treat this as a real installable app).
// Intentionally does NOT cache anything — Jarvis needs live network access
// for Gemini/ElevenLabs, so offline caching would be actively unhelpful.

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
