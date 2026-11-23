
const cacheName = 'flight-ui-4b22b0efdafe238b'
const files = ["./DefaultImage.jpg","./DefaultVideo.mp4","./assets/index-C4i2T-cr.css","./assets/index-D0GHjG2N.js","./favicon.svg","./icon-192.png","./icon-512.png","./index.html","./manifest.webmanifest","./mock/catering.jpg","./mock/catering.mp4","./mock/gpu.jpg","./mock/gpu.mp4","./mock/jet-fuel.jpg","./mock/jet-fuel.mp4","./mock/tug.jpg","./mock/tug.mp4"]
self.addEventListener('install', event => {
  event.waitUntil(caches.open(cacheName).then(cache => cache.addAll(files)))
})
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys
    .filter(key => key.startsWith('flight-ui-') && key !== cacheName)
    .map(key => caches.delete(key)))))
})
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.registration.scope)) return
  event.respondWith(caches.open(cacheName).then(async cache =>
    await cache.match(event.request.mode === 'navigate' ? './index.html' : event.request) || fetch(event.request)))
})
