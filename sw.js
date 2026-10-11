/* PWA shell: network-first navigation, no caching of profile data or user documents. */
const CACHE='teaching-portal-static-v1';
const ROOT='/teaching-portal/';
const ASSETS=[ROOT+'index.html',ROOT+'assets/style.css',ROOT+'assets/app-icon.svg'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('teaching-portal-static-')&&k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()]))});
self.addEventListener('fetch',event=>{
 const request=event.request;
 if(request.method!=='GET'||new URL(request.url).origin!==self.location.origin)return;
 if(request.mode==='navigate'){
  event.respondWith(fetch(request).catch(()=>caches.match(request).then(hit=>hit||Response.error())));
  return;
 }
 // Only explicitly defined static assets are cached. Do not cache encrypted vaults or backups.
 if(ASSETS.includes(new URL(request.url).pathname)){
  event.respondWith(caches.match(request).then(hit=>hit||fetch(request)));
 }
});