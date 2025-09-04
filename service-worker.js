const CACHE_NAME = 'my-pwa-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './index.tsx',
  './components/App.tsx',
  './types.ts',
  './services/geminiService.ts',
  './components/VerbInput.tsx',
  './components/ResultDisplay.tsx',
  './components/icons.tsx',
  './components/ExampleVerbs.tsx',
  './components/ConjugationTable.tsx',
  './components/SearchHistory.tsx',
  './data/verbs.json',
  './favicon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request);
      })
  );
});

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