const CACHE='whowins-v4';
const CORE=['./who-wins.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/apple-touch-icon.png','../assets/logo-wide.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting()));});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));});
self.addEventListener('fetch',e=>{
  if(e.request.method!=='GET')return;
  e.respondWith(caches.match(e.request,{ignoreSearch:true}).then(hit=>{
    const net=fetch(e.request).then(res=>{if(res&&res.ok&&(e.request.url.startsWith(self.location.origin)||/fonts\.(googleapis|gstatic)\.com/.test(e.request.url))){caches.open(CACHE).then(c=>c.put(e.request,res.clone()));}return res;}).catch(()=>hit);
    return hit||net;
  }));
});
