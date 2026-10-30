// Erste Version: Seite nach dem ersten Besuch auch ohne Netz öffnen.
// Bei Änderungen am Portal die Versionsnummer erhöhen.
var CACHE = "ksu-portal-v6";
var DATEIEN = ["./", "index.html", "manifest.webmanifest", "icon-192.png", "icon-512.png", "apple-touch-icon.png", "hero.jpg"];

self.addEventListener("install", function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(DATEIEN); }));
  self.skipWaiting();
});
self.addEventListener("activate", function (e) {
  e.waitUntil(caches.keys().then(function (keys) {
    return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
  }));
  self.clients.claim();
});
// Netz zuerst, damit neue Einträge sofort erscheinen; ohne Netz kommt die gespeicherte Seite.
self.addEventListener("fetch", function (e) {
  if (e.request.method !== "GET" || new URL(e.request.url).origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(function (r) {
    var kopie = r.clone();
    caches.open(CACHE).then(function (c) { c.put(e.request, kopie); });
    return r;
  }).catch(function () { return caches.match(e.request).then(function (r) { return r || caches.match("index.html"); }); }));
});
