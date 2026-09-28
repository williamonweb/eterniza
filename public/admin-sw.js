// Somente suporte à instalação. Dados do painel e respostas da API jamais são armazenados.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || event.request.mode !== 'navigate') return;
  event.respondWith(fetch(event.request, { cache: 'no-store' }).catch(() =>
    new Response('<!doctype html><html lang="pt-BR"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Eterniza CMS</title><body style="background:#0c1110;color:#f5e8cc;font:16px Arial;padding:32px"><h1>Sem conexão</h1><p>Conecte-se à internet para acessar o painel.</p><button onclick="location.reload()" style="padding:14px 24px">Tentar novamente</button></body></html>',
      { status: 503, headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } })
  ));
});
