// Service worker do Capela. Existe por dois motivos: deixar o app instalável
// (o Android só oferece "instalar" quando há um SW controlando a página) e dar
// um mínimo de offline. Trocar a versão do cache invalida o anterior.
const CACHE = 'capela-v1';
const APP_SHELL = ['/', '/index.html'];

self.addEventListener('install', (evento) => {
  evento.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE);
      await cache.addAll(APP_SHELL);
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener('activate', (evento) => {
  evento.waitUntil(
    (async () => {
      // Limpa caches de versões antigas.
      const chaves = await caches.keys();
      await Promise.all(chaves.filter((k) => k !== CACHE).map((k) => caches.delete(k)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (evento) => {
  const req = evento.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // Só mexe no próprio domínio — a API (outra origem) passa direto, sem cache.
  if (url.origin !== self.location.origin) return;

  // Navegação (SPA): rede primeiro; sem rede, cai no app shell guardado.
  if (req.mode === 'navigate') {
    evento.respondWith(
      (async () => {
        try {
          const fresca = await fetch(req);
          const cache = await caches.open(CACHE);
          cache.put('/index.html', fresca.clone());
          return fresca;
        } catch {
          const cache = await caches.open(CACHE);
          return (
            (await cache.match('/index.html')) ||
            (await cache.match('/')) ||
            Response.error()
          );
        }
      })(),
    );
    return;
  }

  // Assets com hash no nome (JS/CSS/imagens): cache primeiro, busca se faltar.
  evento.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const cacheada = await cache.match(req);
      if (cacheada) return cacheada;
      try {
        const fresca = await fetch(req);
        if (fresca.ok) cache.put(req, fresca.clone());
        return fresca;
      } catch {
        return cacheada || Response.error();
      }
    })(),
  );
});
