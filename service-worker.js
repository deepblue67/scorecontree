// ScoreContrée — Service Worker
// Version du cache : incrémenter à chaque déploiement majeur
const CACHE_NAME = 'scorecontree-v1';

// Fichiers à mettre en cache au premier chargement
const ASSETS = [
  '/scorecontree/',
  '/scorecontree/index.html'
];

// Installation : mise en cache des assets
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Activation : suppression des anciens caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    )
  );
  self.clients.claim();
});

// Fetch : cache en priorité, réseau en fallback
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Mettre en cache les nouvelles ressources valides
        if (response && response.status === 200 && response.type === 'basic') {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // En cas d'échec réseau, retourner la page principale depuis le cache
        return caches.match('/scorecontree/index.html');
      });
    })
  );
});
