/* Silver Creek Wayfinder – offline support.
   Online: always fetches the newest page. Offline: uses the saved copy.
   After uploading a new index.html you no longer need to change anything here,
   but bumping the version number below also clears every phone's saved files. */
const CACHE = 'sc-wayfinder-v7';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './apple-touch-icon.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL.map(u => new Request(u, {cache: 'reload'})))).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin) return;
  /* network first (always the newest copy), saved copy only if offline */
  e.respondWith(
    fetch(e.request, {cache: 'no-cache'}).then(res => {
      if (res && res.ok){ const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); }
      return res;
    }).catch(() => caches.match(e.request, {ignoreSearch: true}).then(m => m || caches.match('./index.html')))
  );
});
