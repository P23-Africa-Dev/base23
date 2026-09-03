// Minimal no-op service worker — prevents browser probes from hitting the Next.js proxy
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', () => self.clients.claim());
