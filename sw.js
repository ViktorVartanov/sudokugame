// Старая версия игры (Sudoku Prime) ставила service worker с офлайн-кэшем.
// Этот файл заменяет его: чистит старый кэш и удаляет себя, чтобы у всех открывалась новая игра.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
    await self.registration.unregister();
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach((c) => c.navigate(c.url));
  })());
});
