// Service worker AssurImpôts — ne met en cache que la coquille publique et l'app CHIFFRÉE.
const CACHE_NAME = "assurimpots-202611100618";
const ASSETS = ["./", "./index.html", "./manifest.json", "./icon.svg", "./apple-touch-icon.png", "./data/app.enc.js"];

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS).catch(() => {})));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  // Jamais de cache pour le serveur de documents du Mac ni pour endpoint.json
  if (url.origin !== self.location.origin || url.pathname.endsWith("endpoint.json")) return;
  event.respondWith(
    fetch(event.request)
      .then((res) => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then((c) => c.put(event.request, clone)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(event.request, { ignoreSearch: true }))
  );
});
