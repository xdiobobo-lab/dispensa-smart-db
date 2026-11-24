const C="dispensa-v2.12.0";
const FILES=["./","index.html","style.css","ai.js","config.js","piatti.js","novita.js","core.js","dispensa.js","ricette.js","piano.js","negozi.js","account.js","dati.js","manifest.webmanifest","icon-192.png","icon-512.png"];
self.addEventListener("install",e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(FILES.map(f=>f==="./"||f==="config.js"?f:f+"?v=2.12.0"))));self.skipWaiting()});
self.addEventListener("activate",e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C&&x!=="dispensa-ntf").map(x=>caches.delete(x)))));self.clients.claim()});
self.addEventListener("fetch",e=>{
 const u=new URL(e.request.url);
 if(e.request.method!=="GET"||u.origin!==location.origin||u.pathname.endsWith(".json")||u.pathname.indexOf("/volantini/")>=0)return;
 e.respondWith(fetch(e.request).then(r=>{const cp=r.clone();caches.open(C).then(c=>c.put(e.request,cp));return r}).catch(()=>caches.match(e.request,{ignoreSearch:true}).then(x=>x||caches.match("index.html",{ignoreSearch:true}))));
});
self.addEventListener("periodicsync",e=>{if(e.tag==="scadenze")e.waitUntil(ntf())});
async function ntf(){try{const c=await caches.open("dispensa-ntf"),r=await c.match("ntf");if(!r)return;const d=await r.json();if(!d.on)return;const t=new Date(Date.now()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,10),lim=new Date(Date.now()-new Date().getTimezoneOffset()*6e4+864e5).toISOString().slice(0,10);if(d.last===t)return;
 const l=(d.items||[]).filter(i=>i.e<=lim);if(!l.length)return;const n=l.map(i=>i.n),tx=n.length>3?n.slice(0,3).join(", ")+" e altri "+(n.length-3):n.join(", ");d.last=t;await c.put("ntf",new Response(JSON.stringify(d)));
 await self.registration.showNotification("⚠️ Dispensa Smart: in scadenza",{body:tx+(n.length>1?": scadono":": scade")+" oggi o domani. Tocca per trovare una ricetta.",tag:"scad",icon:"icon-192.png"})}catch(e){}}
self.addEventListener("notificationclick",e=>{e.notification.close();e.waitUntil(clients.matchAll({type:"window"}).then(l=>l.length?l[0].focus():clients.openWindow("./")))});
