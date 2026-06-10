// ScoreContrée — Service Worker
// IMPORTANT : CACHE_NAME est synchronisé avec la version de l'appli
// Il change automatiquement à chaque déploiement → mise à jour propre sans vider le cache
const CACHE_NAME = 'scorecontree-v20260610_1105';

const ASSETS = [
  '/scorecontree/',
  '/scorecontree/index.html'
];

// Installation : mise en cache
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  // Force l'activation immédiate sans attendre la fermeture des onglets
  self.skipWaiting();
});

// Activation : suppression des ANCIENS caches uniquement
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(k => k.startsWith('scorecontree-') && k !== CACHE_NAME)
          .map(k => {
            console.log('SW: suppression ancien cache', k);
            return caches.delete(k);
          })
      )
    )
  );
  // Prend le contrôle immédiatement de tous les onglets ouverts
  self.clients.claim();
});

// Fetch : réseau en priorité, cache en fallback
// "Network first" = toujours la version la plus récente si connecté
self.addEventListener('fetch', event => {
  // On ne gère que les requêtes GET vers notre domaine
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Mise en cache de la réponse fraîche
        if (response && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      })
      .catch(() => {
        // Hors réseau : on sert depuis le cache
        return caches.match(event.request)
          .then(cached => cached || caches.match('/scorecontree/index.html'));
      })
  );
});

// Reçoit l'ordre de s'activer immédiatement depuis le client
self.addEventListener('message', event => {
  if (event.data?.type === 'SKIP_WAITING') self.skipWaiting();
});
