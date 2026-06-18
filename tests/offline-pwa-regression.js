const fs = require('fs');
const path = require('path');
const vm = require('vm');

const root = path.resolve(__dirname, '..');
const indexHtml = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const sw = fs.readFileSync(path.join(root, 'service-worker.js'), 'utf8');

const failures = [];
let checks = 0;

function check(condition, message) {
  checks += 1;
  if (!condition) failures.push(message);
}

function matchOne(text, regex, message) {
  const match = text.match(regex);
  check(Boolean(match), message);
  return match;
}

const htmlVersion = matchOne(
  indexHtml,
  /<div[^>]*>\s*(v\d{8}_\d{4})\s*<\/div>/,
  'Version visible introuvable dans index.html'
)?.[1];

const cacheName = matchOne(
  sw,
  /const\s+CACHE_NAME\s*=\s*'scorecontree-(v\d{8}_\d{4})';/,
  'CACHE_NAME introuvable dans service-worker.js'
)?.[1];

check(htmlVersion === cacheName, 'Version index.html et CACHE_NAME non synchronisees');

const assetsBlock = matchOne(
  sw,
  /const\s+ASSETS\s*=\s*\[([\s\S]*?)\];/,
  'Liste ASSETS introuvable dans service-worker.js'
)?.[1] || '';

check(assetsBlock.includes("'/scorecontree/'"), 'Racine PWA absente du cache');
check(assetsBlock.includes("'/scorecontree/index.html'"), 'index.html absent du cache');

check(
  indexHtml.includes("navigator.serviceWorker.register('/scorecontree/service-worker.js')"),
  'Chemin register service worker inattendu'
);

check(sw.includes("caches.match('/scorecontree/index.html')"), 'Fallback offline index.html absent');
check(sw.includes("event.request.method !== 'GET'"), 'Filtre GET absent dans le service worker');
check(sw.includes("event.data?.type === 'SKIP_WAITING'"), 'Activation controlee par message absente');
check(!/install[\s\S]{0,300}skipWaiting\(\)/.test(sw), 'skipWaiting appele pendant installation');
check(sw.includes("k.startsWith('scorecontree-') && k !== CACHE_NAME"), 'Nettoyage des anciens caches inattendu');

const forbiddenAssetPatterns = [
  /<script[^>]+src=["']https?:\/\//i,
  /<link[^>]+href=["']https?:\/\/(?!github\.com\/deepblue67\/scorecontree)/i,
  /<img[^>]+src=["']https?:\/\//i,
  /<iframe[^>]+src=["']https?:\/\//i,
  /@import\s+url\(["']?https?:\/\//i
];

forbiddenAssetPatterns.forEach(pattern => {
  check(!pattern.test(indexHtml), 'Ressource externe bloquante detectee : ' + pattern);
});

check(!/qrcode(?:\.min)?\.js|new\s+QRCode|cdnjs/i.test(indexHtml), 'Dependance QR Code externe encore presente');
check(/https:\/\/api\.github\.com\/gists/.test(indexHtml), 'Point reseau GitHub Gist attendu absent');
check(/https:\/\/api\.anthropic\.com\/v1\/messages/.test(indexHtml), 'Point reseau IA attendu absent');

const swClientScript = matchOne(
  indexHtml,
  /<script>\s*\/\/ Enregistrement du Service Worker \(PWA offline\)([\s\S]*?)<\/script>/,
  'Script client service worker introuvable'
)?.[1] || '';

check(swClientScript.includes("if ('serviceWorker' in navigator)"), 'Feature detection serviceWorker absente');
check(swClientScript.includes('let pendingUpdateWorker = null'), 'Worker de mise a jour en attente non memorise');
check(swClientScript.includes('let updateReloadRequested = false'), 'Drapeau reload utilisateur absent');
check(swClientScript.includes('function showUpdatePrompt(worker)'), 'Prompt de mise a jour absent');
check(swClientScript.includes('update-prompt-modal'), 'Identifiant modal mise a jour absent');
check(swClientScript.includes('Nouvelle version disponible.'), 'Texte nouvelle version absent');
check(swClientScript.includes('Mettre à jour') || swClientScript.includes('Mettre Ã  jour'), 'Bouton mettre a jour absent');
check(swClientScript.includes('Plus tard'), 'Bouton plus tard absent');
check(swClientScript.includes("navigator.serviceWorker.register('/scorecontree/service-worker.js')"), 'Register service worker absent');
check(swClientScript.includes('reg.waiting && navigator.serviceWorker.controller'), 'Detection worker deja en attente absente');
check(swClientScript.includes("reg.addEventListener('updatefound'"), 'Detection updatefound absente');
check(swClientScript.includes("newSW.addEventListener('statechange'"), 'Detection changement etat update absente');
check(swClientScript.includes("newSW.state === 'installed' && navigator.serviceWorker.controller"), 'Prompt limite aux mises a jour controlees absent');
check(swClientScript.includes('pendingUpdateWorker.postMessage({ type: \'SKIP_WAITING\' })'), 'SKIP_WAITING non envoye par le bouton update');
check(swClientScript.includes("navigator.serviceWorker.addEventListener('controllerchange'"), 'Ecoute controllerchange absente');
check(swClientScript.includes('if(updateReloadRequested) window.location.reload()'), 'Reload non limite a la validation utilisateur');

const okHandlerIndex = swClientScript.indexOf("document.getElementById('update-prompt-ok').onclick");
const laterHandlerIndex = swClientScript.indexOf("document.getElementById('update-prompt-later').onclick");
const controllerChangeIndex = swClientScript.indexOf("navigator.serviceWorker.addEventListener('controllerchange'");
check(okHandlerIndex > -1 && laterHandlerIndex > okHandlerIndex, 'Ordre handlers prompt mise a jour inattendu');
check(controllerChangeIndex > laterHandlerIndex, 'controllerchange defini avant les handlers du prompt');

const okHandlerBlock = swClientScript.slice(okHandlerIndex, laterHandlerIndex);
const laterHandlerBlock = swClientScript.slice(laterHandlerIndex, controllerChangeIndex);
check(okHandlerBlock.includes('updateReloadRequested = true'), 'Bouton update ne demande pas le reload');
check(okHandlerBlock.includes("postMessage({ type: 'SKIP_WAITING' })"), 'Bouton update ne declenche pas SKIP_WAITING');
check(laterHandlerBlock.includes('modal.remove()'), 'Bouton plus tard ne ferme pas le prompt');
check(!laterHandlerBlock.includes('SKIP_WAITING'), 'Bouton plus tard active la mise a jour');
check(!laterHandlerBlock.includes('updateReloadRequested = true'), 'Bouton plus tard demande un reload');

async function verifyServiceWorkerOfflineFallback() {
  const listeners = {};
  const stores = new Map();
  const deletedCaches = [];
  let skipWaitingCalled = false;
  let clientsClaimCalled = false;
  let offline = false;

  function response(url) {
    return { url, status: 200, clone() { return response(url); } };
  }

  const cachesMock = {
    async open(name) {
      if (!stores.has(name)) stores.set(name, new Map());
      const store = stores.get(name);
      return {
        async addAll(assets) {
          assets.forEach(asset => store.set(asset, response(asset)));
        },
        async put(request, res) {
          store.set(request.url || request, res);
        }
      };
    },
    async keys() {
      return Array.from(stores.keys());
    },
    async delete(name) {
      deletedCaches.push(name);
      return stores.delete(name);
    },
    async match(request) {
      const key = request.url || request;
      for (const store of stores.values()) {
        if (store.has(key)) return store.get(key);
      }
      return undefined;
    }
  };

  const selfMock = {
    clients: { claim() { clientsClaimCalled = true; } },
    skipWaiting() { skipWaitingCalled = true; },
    addEventListener(type, handler) { listeners[type] = handler; }
  };

  const context = {
    self: selfMock,
    caches: cachesMock,
    fetch: async request => {
      if (offline) throw new Error('offline');
      return response(request.url || request);
    },
    Promise
  };

  vm.runInNewContext(sw, context);

  check(typeof listeners.install === 'function', 'Handler install absent');
  check(typeof listeners.activate === 'function', 'Handler activate absent');
  check(typeof listeners.fetch === 'function', 'Handler fetch absent');
  check(typeof listeners.message === 'function', 'Handler message absent');

  const installPromises = [];
  listeners.install({ waitUntil: promise => installPromises.push(promise) });
  await Promise.all(installPromises);
  check(stores.has('scorecontree-' + cacheName), 'Cache courant non cree a installation');
  check(stores.get('scorecontree-' + cacheName).has('/scorecontree/'), 'Racine non stockee a installation');
  check(stores.get('scorecontree-' + cacheName).has('/scorecontree/index.html'), 'index.html non stocke a installation');

  stores.set('scorecontree-old-version', new Map());
  const activatePromises = [];
  listeners.activate({ waitUntil: promise => activatePromises.push(promise) });
  await Promise.all(activatePromises);
  check(deletedCaches.includes('scorecontree-old-version'), 'Ancien cache non supprime a activation');
  check(clientsClaimCalled, 'clients.claim non appele a activation');

  let networkResponse;
  listeners.fetch({
    request: { method: 'GET', url: '/scorecontree/live-check' },
    respondWith: promise => { networkResponse = promise; }
  });
  const onlineResult = await networkResponse;
  check(onlineResult.url === '/scorecontree/live-check', 'Reponse reseau non retournee en ligne');
  check(stores.get('scorecontree-' + cacheName).has('/scorecontree/live-check'), 'Reponse reseau non ajoutee au cache');

  offline = true;
  let offlineResponse;
  listeners.fetch({
    request: { method: 'GET', url: '/scorecontree/unknown-route' },
    respondWith: promise => { offlineResponse = promise; }
  });
  const offlineResult = await offlineResponse;
  check(offlineResult.url === '/scorecontree/index.html', 'Fallback offline index.html non retourne');

  let ignored = true;
  listeners.fetch({
    request: { method: 'POST', url: '/scorecontree/post' },
    respondWith: () => { ignored = false; }
  });
  check(ignored, 'Requete POST interceptee par erreur');

  listeners.message({ data: { type: 'SKIP_WAITING' } });
  check(skipWaitingCalled, 'Message SKIP_WAITING non traite');
}

verifyServiceWorkerOfflineFallback().then(() => {
  if (failures.length) {
    console.error('FAIL ' + failures.join(' | '));
    process.exit(1);
  }

  console.log('PASS ' + checks);
}).catch(error => {
  console.error('ERROR ' + error.message);
  process.exit(1);
});
