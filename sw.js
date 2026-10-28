const C="dispensa-v2.4.1";
const FILES=["./","index.html","style.css","ai.js","config.js","core.js","dispensa.js","ricette.js","piano.js","negozi.js","account.js","dati.js","manifest.webmanifest","icon-192.png","icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(FILES.map(f=>f==="./"||f==="config.js"?f:f+"?v=2.4.1"))));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C).map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener("fetch",e=>{
 const u=new URL(e.request.url);
 if(e.request.method!=="GET"||u.origin!==location.origin||u.pathname.endsWith(".json")||u.pathname.indexOf("/volantini/")>=0)return;
 e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));return r}).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(x=>x||caches.match("index.html",{ignoreSearch:true}))));
});
