const CACHE_NAME = 'medova-legenda-v1';
const ASSETS = [
  '/',
  '/index.html',
  '/main.css',
  '/js/script.js',
  '/img/logo_medova_legenda.png',
  '/favicon.ico',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/apple-touch-icon.png',
  '/site.webmanifest'
];

// Встановлення service worker — кешування файлів
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 Кешуємо файли...');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting(); // активує відразу
});

// Активуємо нову версію та чистимо старий кеш
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('🧹 Видаляємо старий кеш:', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Перехоплення fetch-запитів — спочатку кеш, потім мережа
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      return cachedResponse || fetch(event.request);
    })
  );
});