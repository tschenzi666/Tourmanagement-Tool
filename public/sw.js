const CACHE_NAME = "tourmanager-v2";

// Only cache truly static assets (icons, images)
const STATIC_ASSETS = [
  "/icons/icon-192.svg",
  "/manifest.json",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate event - clean ALL old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// Fetch event - only cache static assets, never HTML/navigation
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  if (!event.request.url.startsWith("http")) return;

  // Never cache navigation requests (HTML pages) - this prevents
  // stale Server Action IDs after deployments
  if (event.request.mode === "navigate") return;

  // Only cache requests for _next/static assets (JS/CSS bundles)
  const url = new URL(event.request.url);
  if (!url.pathname.startsWith("/_next/static")) return;

  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      });
    })
  );
});
