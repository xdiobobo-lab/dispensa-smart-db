// Aggiungi prodotto: codice a barre (Open Food Facts simulato) e nuova schermata
const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path');
const ROOT=(process.env.SITE||require('path').resolve(__dirname,'..'));
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';const f=u==='/config.js'?path.join(__dirname,'fixtures','config-vuoto.js'):path.join(ROOT,u);if(!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':u.endsWith('.js')?'text/javascript':u.endsWith('.html')?'text/html':'application/octet-stream'});r.end(fs.readFileSync(f))});
let ok=0,ko=0;const T=(n,c)=>{console.log((c?'OK  ':'FAIL')+' '+n);c?ok++:ko++};
(async()=>{await new Promise(r=>srv.listen(8822,r));const b=await chromium.launch(),p=await(await b.newContext({serviceWorkers:'block',viewport:{width:390,height:800}})).newPage();const E=[];p.on('pageerror',x=>x&&E.push(x.message));
let off="ok",offCalls=[];
await p.route('https://world.openfoodfacts.org/**',r=>{const u=r.request().url();offCalls.push(u);if(off==="down")return r.abort();const h={'access-control-allow-origin':'*','content-type':'application/json'};
 if(/4006381333931/.test(u))return r.fulfill({status:200,headers:h,body:JSON.stringify({status:1,product:{product_name:"Penne rigate n.73",quantity:"500 g",categories_tags:["en:pastas"]}})});
 if(/5449000000996/.test(u))return r.fulfill({status:200,headers:h,body:JSON.stringify({status:1,product:{product_name:"Coca-Cola",quantity:"6 x 33 cl",categories_tags:["en:beverages"]}})});
 r.fulfill({status:200,headers:h,body:JSON.stringify({status:0})})});
await p.goto('http://localhost:8822/index.html');await p.waitForTimeout(800);
await p.evaluate(()=>{S.items=[];S.tab="add";S.addT={};S.recent=[];localStorage.removeItem("bc");localStorage.removeItem("pnames");render()});
const v=()=>p.evaluate(()=>document.getElementById('v').innerText);
let t=await v();
T('schermata: pulsante scansiona, scadenze rapide, inserimento a mano',/Scansiona il codice a barre/.test(t)&&/Domani/.test(t)&&/1 settimana/.test(t)&&/Nessuna/.test(t)&&/Oppure inserisci a mano/.test(t));
T('suggerimenti dei nomi (datalist)',await p.evaluate(()=>document.querySelectorAll('#dl option').length>=80));
// autocompilazione
await p.fill('#n','Latte intero');await p.waitForTimeout(100);
let f=await p.evaluate(()=>({c:$("c").value,u:$("u").value,e:$("e").value,exp7:addDays(7),h:$("eh").textContent,chips:document.querySelectorAll('#qc button').length}));
T('nome → categoria, unità e scadenza suggerite',f.c==="Latticini e uova"&&f.u==="l"&&f.e===f.exp7&&/suggerita/.test(f.h)&&f.chips>0);
await p.selectOption('#u','ml');await p.fill('#n','Latte parzialmente scremato');
T('se cambi l’unità a mano, non la ricalcolo',await p.evaluate(()=>$("u").value==="ml"));
await p.evaluate(()=>{$("u").value="g";$("u").dispatchEvent(new Event("change"))});
T('tasti rapidi quantità per l’unità scelta',await p.evaluate(()=>[...document.querySelectorAll('#qc button')].map(x=>x.innerText).join(",")==="100,200,250,500"));
await p.click('#qc button:nth-child(4)');await p.click('button[aria-label="Più"]');
T('tasti rapidi e +/−',await p.evaluate(()=>+$("q").value===550));
await p.click('#ec button[data-d="3"]');
T('scadenza rapida «3 giorni»',await p.evaluate(()=>$("e").value===addDays(3)&&document.querySelector('#ec button[data-d="3"]').className==="btn "));
await p.click('#ec button[data-d="0"]');
T('«Nessuna» = senza scadenza',await p.evaluate(()=>$("ne").checked===true&&$("e").disabled===true));
await p.click('#ec button[data-d="7"]');
T('torno a una data dopo «Nessuna»',await p.evaluate(()=>$("ne").checked===false&&$("e").value===addDays(7)));
await p.click('text=Aggiungi alla dispensa');await p.waitForTimeout(150);
let s=await p.evaluate(()=>({n:S.items.length,it:S.items[0],h:L("pnames"),rec:(S.recent||[]).length,field:$("n").value,txt:document.getElementById('v').innerText}));
T('la cronologia delle ricette cucinate non viene toccata',await p.evaluate(()=>Array.isArray(S.hist)&&(L('hist')||[]).every(x=>typeof x==='object')));
T('aggiunta: prodotto salvato, form svuotato, elenco «Appena aggiunti»',s.n===1&&s.it.name==="Latte parzialmente scremato"&&s.it.q===550&&s.it.u==="g"&&s.field===""&&/Appena aggiunti/.test(s.txt)&&s.h[0]==="Latte parzialmente scremato");
// checksum
T('controllo cifra di controllo EAN',await p.evaluate(()=>eanOk("4006381333931")&&eanOk("5449000000996")&&!eanOk("4006381333932")&&!eanOk("123")&&!eanOk("abcdefgh")));
T('lettura quantità: 6 x 33 cl, 1,5 l, 500 ml, 1 kg, mancante',await p.evaluate(()=>{const a=bcQty({quantity:"6 x 33 cl"}),b=bcQty({quantity:"1,5 l"}),c=bcQty({quantity:"500 ml"}),d=bcQty({quantity:"1 kg"}),e=bcQty({}),g=bcQty({product_quantity:"250",product_quantity_unit:"g"});return a.q===1.98&&a.u==="l"&&b.q===1.5&&b.u==="l"&&c.q===500&&c.u==="ml"&&d.q===1&&d.u==="kg"&&e.q===1&&e.u==="pz"&&g.q===250&&g.u==="g"}));
// lookup da Open Food Facts
await p.evaluate(()=>bcLookup("4006381333931"));await p.waitForTimeout(300);
f=await p.evaluate(()=>({n:$("n").value,c:$("c").value,q:$("q").value,u:$("u").value,e:$("e").value,cur:S.bcCur}));
T('codice → nome, categoria, quantità e unità compilati',f.n==="Penne rigate n.73"&&f.c==="Cereali e derivati"&&f.q==="500"&&f.u==="g"&&f.cur==="4006381333931");
T('la scadenza resta da scegliere (suggerita, con avviso)',await p.evaluate(()=>/suggerita/.test($("eh").textContent)));
await p.evaluate(()=>{$("n").value="Penne rigate";add()});await p.waitForTimeout(100);
off="down";offCalls=[];
await p.evaluate(()=>bcLookup("4006381333931"));await p.waitForTimeout(300);
f=await p.evaluate(()=>({n:$("n").value,q:$("q").value}));
T('prodotto già inserito una volta: riconosciuto anche senza Internet, col tuo nome',f.n==="Penne rigate"&&f.q==="500"&&offCalls.length===0);
off="ok";
await p.evaluate(()=>bcLookup("5449000000996"));await p.waitForTimeout(300);
f=await p.evaluate(()=>({n:$("n").value,c:$("c").value,q:$("q").value,u:$("u").value}));
T('bibita: categoria da nome/categorie, multipack in litri',f.n==="Coca-Cola"&&f.c==="Bevande"&&f.q==="1.98"&&f.u==="l");
// non trovato
await p.evaluate(()=>{S.bcCur=null;return bcLookup("8000500310427")});await p.waitForTimeout(300);
T('non trovato: messaggio e codice ricordato per dopo',await p.evaluate(()=>S.bcCur==="8000500310427"&&/non trovato/i.test(document.getElementById('t').innerText)&&$("n").value===""));
await p.evaluate(()=>{$("n").value="Nutella";$("q").value=400;$("u").value="g";add()});
T('dopo l’inserimento a mano il codice è ricordato',await p.evaluate(()=>(L("bc")||{})["8000500310427"]&&L("bc")["8000500310427"].n==="Nutella"));
off="down";
await p.evaluate(()=>bcLookup("1234567890128"));await p.waitForTimeout(300);
T('Internet assente: nessun errore, si inserisce a mano',await p.evaluate(()=>/non trovato/i.test(document.getElementById('t').innerText)));
off="ok";
// scansione con fotocamera simulata
await p.evaluate(()=>{window.__ok=null;window.Html5Qrcode=class{constructor(id,cfg){window.__cfg=cfg}start(cam,conf,ok){window.__ok=ok;window.__cam=cam;return Promise.resolve()}stop(){window.__stopped=1;return Promise.resolve()}clear(){}};window.Html5QrcodeSupportedFormats={EAN_13:9,EAN_8:10,UPC_A:14,UPC_E:15}});
await p.evaluate(()=>{S.tab="add";render();bcStart()});await p.waitForTimeout(300);
T('si apre la schermata della fotocamera posteriore',await p.evaluate(()=>!!document.getElementById('bco')&&window.__cam.facingMode==="environment"&&__cfg.useBarCodeDetectorIfSupported===true&&__cfg.formatsToSupport.length===4));
await p.evaluate(()=>__ok("4006381333932"));await p.waitForTimeout(100);
T('lettura sbagliata (cifra di controllo) ignorata',await p.evaluate(()=>!!document.getElementById('bco')));
await p.evaluate(()=>__ok("4006381333931"));await p.waitForTimeout(500);
T('codice letto: fotocamera chiusa e modulo compilato',await p.evaluate(()=>!document.getElementById('bco')&&window.__stopped===1&&$("n").value==="Penne rigate"));
// permesso negato
await p.evaluate(()=>{window.Html5Qrcode=class{start(){return Promise.reject(new Error("denied"))}stop(){return Promise.resolve()}clear(){}};bcStart()});await p.waitForTimeout(300);
T('fotocamera non disponibile: messaggio e inserimento del numero',await p.evaluate(()=>/Non riesco ad aprire la fotocamera/.test(document.getElementById('bcm').textContent)&&!!document.getElementById('bcn')));
await p.evaluate(()=>{$("bcn").value="4006381333931";bcManual()});await p.waitForTimeout(400);
T('numero scritto a mano: funziona come la scansione',await p.evaluate(()=>!document.getElementById('bco')&&$("n").value==="Penne rigate"));
// la libreria vera si carica
await p.evaluate(()=>{delete window.Html5Qrcode;window.__lp=bcLib()});await p.waitForTimeout(1500);
T('la libreria di lettura (html5-qrcode) si carica e funziona',await p.evaluate(()=>typeof Html5Qrcode==="function"&&typeof Html5Qrcode.getCameras==="function"&&Html5QrcodeSupportedFormats.EAN_13!==undefined));
T('crediti Open Food Facts nelle impostazioni',await p.evaluate(()=>{S.thp=true;render();return /Open Food Facts/.test(document.body.innerText)}));
T('nessun errore JS',E.length===0);if(E.length)console.log(E);console.log(ok+' ok, '+ko+' ko');await b.close();srv.close()})();
