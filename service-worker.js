/* ============================================================================
   VOTEZ BIEN ! — service-worker.js
   ---------------------------------------------------------------------------
   1) Le numéro de version vit UNIQUEMENT dans CACHE_VERSION ci-dessous, plus
      dans les noms de fichiers (qui devaient être renommés à chaque mise à
      jour dans V5.1 — fragile, source d'oublis). Pour publier une mise à
      jour : changer CACHE_VERSION, rien d'autre.
   2) Un gestionnaire 'activate' supprime les anciens caches. La V5.1 n'en
      avait pas : chaque nouvelle version s'ajoutait au stockage du
      navigateur sans jamais nettoyer les précédentes.
   3) Stratégie "network-first" : les visites connectées reçoivent la
      dernière version publiée ; le cache prend le relais en cas de coupure.
   4) La précharge esttolérante : un fichier absent (ou en erreur réseau)
      n'empêche plus l'installation du service worker. L'ancienne version
      échouait en bloc dès qu'une seule ressource manquait.
   5) Seules les requêtes de même origine sont interceptées : les polices
      Google sont laissées au réseau, comme les appels vers un autre site.
   ========================================================================= */
const CACHE_VERSION = 'v7.10.4';
const CACHE_NAME = 'votez-bien-' + CACHE_VERSION;
const ASSETS = [
  './',
  './index.html',
  './styles.css',
  './data.js',
  './themes-and-polls.js',
  './scoring.js',
  './app.js',
  './manifest.json',
  './embleme-solidaire-180.png',
  './embleme-solidaire-192.png',
  './embleme-solidaire-512.png',
  './assets/css/content-pages.css',
  './a-propos/',
  './methode/',
  './mentions-legales/',
  './confidentialite/'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      /* Chaque ressource est préchargée indépendamment : une ressource
         manquante n'annule pas les autres. */
      .then((cache) => Promise.all(
        ASSETS.map((asset) => cache.add(asset).catch(() => null))
      ))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  let sameOrigin = false;
  try {
    sameOrigin = new URL(event.request.url).origin === self.location.origin;
  } catch (e) {
    sameOrigin = false;
  }
  if (!sameOrigin) return; // ressources tierces : réseau direct, sans cache

  event.respondWith(
    caches.open(CACHE_NAME).then((cache) =>
      fetch(event.request)
        .then((response) => {
          if (response && response.ok) cache.put(event.request, response.clone());
          return response;
        })
        .catch(() => cache.match(event.request, { ignoreSearch: true })
          .then((cached) => cached || new Response('Hors ligne', {
            status: 503,
            statusText: 'Offline',
            headers: { 'Content-Type': 'text/plain; charset=utf-8' }
          })))
    )
  );
});
