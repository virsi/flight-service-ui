import { readdir, writeFile, readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'

const files = (await readdir('dist', { recursive: true, withFileTypes: true }))
  .filter(entry => entry.isFile())
  .map(entry => entry.parentPath.slice(4) + '/' + entry.name)
  .sort()
const hash = createHash('sha256')
for (const file of files) hash.update(file).update(await readFile('dist' + file))
await writeFile('dist/sw.js', `
const cacheName = 'flight-ui-${hash.digest('hex').slice(0, 16)}'
const files = ${JSON.stringify(files.map(file => '.' + file))}
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
`)
