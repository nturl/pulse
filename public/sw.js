// Minimal service worker: network-first with a cache fallback so the app
// shell still opens offline. Never caches /api/* or /login (behind the auth
// cookie gate), and never intercepts navigations, so a logged-out visitor
// (or one who has just logged out) is never served a cached authed page.
const CACHE = "pulse-v1";

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("fetch", (e) => {
  const { request } = e;
  if (request.method !== "GET") return;
  if (request.mode === "navigate") return;
  const url = new URL(request.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.startsWith("/api/") || url.pathname === "/login") return;

  e.respondWith(
    fetch(request)
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(request, copy));
        return res;
      })
      .catch(() => caches.match(request)),
  );
});
