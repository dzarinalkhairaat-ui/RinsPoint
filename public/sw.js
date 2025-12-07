const CACHE_NAME = 'rinspoint-v1';
const urlsToCache = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/index.js',
  '/js/whatsapp.js',
  '/js/loading.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// 1. Install Service Worker
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. Fetch Data
self.addEventListener('fetch', event => {
  // PENTING: Jangan cache request ke API (/api/...)
  // Agar harga dan produk selalu Real-Time dari database
  if (event.request.url.includes('/api/')) {
    return; 
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Jika ada di cache, pakai cache (biar cepat)
        if (response) {
            return response;
        }
        // Jika tidak, ambil dari internet
        return fetch(event.request);
      })
  );
});

// 3. Update Cache (Hapus cache lama jika ada update versi)
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});