// TALA offline helper. Upload this to GitHub next to index.html and config.js.
// It keeps a copy of the page so TALA opens even without internet.
const CACHE = 'tala-v13';
self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(['./', './index.html', './config.js', './manifest.json', './icon-192.png', './icon-512.png', './apple-touch-icon.png', './pmcf-template.xlsm', './mwa-template.xlsm', './sf2-template.xlsx', './sf4-template.xlsx', './leave-template.xlsx', './locator-template.docx', './travel-template.docx', './leave-form.pdf', './locator-slip.pdf', './travel-authority.pdf']).catch(() => {})));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (/script\.google|googleusercontent|drive\.google|youtube|ytimg|googlevideo/.test(url.hostname)) return; // TALA data and videos always go online
  if (req.mode === 'navigate' || url.origin === self.location.origin) {
    // Page files: try the internet first, use the saved copy when offline
    e.respondWith(fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res; })
      .catch(() => caches.match(req).then(r => r || caches.match('./index.html'))));
  } else {
    // Fonts and reader tools: use the saved copy first
    e.respondWith(caches.match(req).then(r => r || fetch(req).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); return res; })));
  }
});
