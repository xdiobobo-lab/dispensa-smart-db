const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path');
const ROOT=(process.env.SITE||require('path').resolve(__dirname,'..'));
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';const f=path.join(ROOT,u);if(!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':u.endsWith('.js')?'text/javascript':u.endsWith('.html')?'text/html':u.endsWith('.css')?'text/css':'application/octet-stream'});r.end(fs.readFileSync(f))});
let ok=0,ko=0;const T=(n,c)=>{console.log((c?'OK  ':'FAIL')+' '+n);c?ok++:ko++};
(async()=>{await new Promise(r=>srv.listen(8813,r));const b=await chromium.launch();
const mk=async(pre)=>{const ctx=await b.newContext({serviceWorkers:'block',viewport:{width:390,height:800}});const p=await ctx.newPage();p.__e=[];p.on('pageerror',x=>p.__e.push(x.message));if(pre)await p.addInitScript(pre);await p.goto('http://localhost:8813/index.html');await p.waitForTimeout(1500);return p};
// 1 utente nuovo: nessuna finestra
let p=await mk(null);
T('utente nuovo: niente finestra, versione memorizzata',await p.evaluate(()=>!document.getElementById("nvo")&&localStorage.getItem("seenv")===APP_VER));
// 2 utente esistente con versione vecchia
p=await mk(()=>{if(!localStorage.getItem("seenv")&&!sessionStorage.getItem("x")){sessionStorage.setItem("x","1");localStorage.setItem("seenv","2.10.0");localStorage.setItem("items",JSON.stringify([{id:"a",name:"Pasta",cat:"Cereali e derivati",q:1,u:"pz",exp:"",loc:""}]))}});
let t=await p.evaluate(()=>document.getElementById("nvo")?document.getElementById("nvo").innerText:"");console.log(t.slice(0,300).replace(/\n/g," | "));
T('aggiornamento: finestra con le novità (2.12.0 e 2.11.0 sì, 2.10.0 no)',/Versione 2\.12\.0/.test(t)&&/Versione 2\.11\.0/.test(t)&&!/Versione 2\.10\.0/.test(t)&&/Novità a ogni aggiornamento/.test(t));
await p.screenshot({path:'nov.png'});
await p.click('#nvo button');
T('«Ho capito» chiude e memorizza',await p.evaluate(()=>!document.getElementById("nvo")&&localStorage.getItem("seenv")===APP_VER));
await p.reload();await p.waitForTimeout(1200);
T('non riappare dopo il ricarico',await p.evaluate(()=>!document.getElementById("nvo")));
await p.evaluate(()=>{S.thp=true;render()});
T('pulsante Novità nelle impostazioni',await p.evaluate(()=>/📣 Novità/.test(document.body.innerText)));
await p.evaluate(()=>novAll());
T('rilettura manuale',await p.evaluate(()=>!!document.getElementById("nvo")&&/Versione 2\.12\.0/.test(document.getElementById("nvo").innerText)));
T('nessun errore JS',p.__e.length===0);if(p.__e.length)console.log(p.__e);
console.log(ok+' ok, '+ko+' ko');await b.close();srv.close()})();
