/* Tiene una copia del gioco sul telefono: così parte anche senza internet. */
const CACHE = 'alta-pressione-v7';
const FILES = ['./', 'index.html', 'manifest.webmanifest', 'icon-180.png', 'icon-192.png', 'icon-512.png'];
const FONTS = 'https://fonts.googleapis.com/css2?family=Fredoka:wght@500;600;700&family=Nunito:wght@500;600;700;800&display=swap';
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES).then(() => fetch(FONTS).then(r => c.put(FONTS, r)).catch(() => {}))).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const path = new URL(e.request.url).pathname, page = e.request.mode === 'navigate' || path.endsWith('/') || path.endsWith('/index.html');
  e.respondWith(caches.open(CACHE).then(c => c.match(e.request, { ignoreSearch: page }).then(hit => {
    const net = (page ? fetch(e.request.url, { cache: 'no-cache' }) : fetch(e.request)).then(r => { if (r && (r.ok || r.type === 'opaque')) c.put(e.request, r.clone()); return r; });
    if (!page) return hit || net.catch(() => hit);          // icone e caratteri: copia salvata
    // la pagina del gioco: prima internet, per avere sempre l'ultima versione; se non risponde in 4 secondi, la copia salvata
    return Promise.race([net, new Promise((res, rej) => setTimeout(() => hit ? res(hit) : rej(new Error('lento')), 4000))]).catch(() => hit || net);
  })));
});
