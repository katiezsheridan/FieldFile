// FieldFile service worker — minimal, hand-rolled (no Workbox).
//
// Goal: make the app installable and let the shell + static assets load with no
// connection, WITHOUT ever touching auth or uploads:
//   - Only GET requests are handled; POSTs (photo uploads) always hit the network.
//   - /api/* and cross-origin requests (Clerk, Supabase, map tiles) bypass the
//     cache entirely, so authentication and data writes behave normally.
// Offline *capture* is handled at the app layer (IndexedDB queue), not here.

const CACHE = "fieldfile-shell-v1";
const PRECACHE = ["/offline.html", "/manifest.webmanifest", "/icons/icon-192.png"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;

  // Never interfere with uploads or any non-GET request.
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  // Same-origin only. Cross-origin (Clerk, Supabase Storage, Esri tiles) → network.
  if (url.origin !== self.location.origin) return;

  // Never cache API routes — they're auth-scoped and signed-URL backed.
  if (url.pathname.startsWith("/api/")) return;

  // Build artifacts and static images: cache-first (immutable, safe to keep).
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/images/") ||
    url.pathname.startsWith("/icons/")
  ) {
    event.respondWith(
      caches.match(req).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(req, copy));
            return res;
          })
      )
    );
    return;
  }

  // Page navigations: network-first, falling back to the offline page so a
  // cold load with no signal shows something instead of a browser error.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req).catch(() =>
        caches.match(req).then((hit) => hit || caches.match("/offline.html"))
      )
    );
    return;
  }
});
