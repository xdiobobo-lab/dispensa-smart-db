const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path');
const ROOT=(process.env.SITE||require('path').resolve(__dirname,'..'));
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';const f=path.join(ROOT,u);if(!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.css':'text/css'}[path.extname(f)]||'application/octet-stream'});r.end(fs.readFileSync(f))});
let ok=0,ko=0;const T=(n,c)=>{console.log((c?'OK  ':'FAIL')+' '+n);c?ok++:ko++};
(async()=>{await new Promise(r=>srv.listen(8804,r));const b=await chromium.launch(),p=await(await b.newContext({serviceWorkers:'block',viewport:{width:390,height:900}})).newPage();const E=[];p.on('pageerror',x=>E.push(x.message));
await p.goto('http://localhost:8804/index.html');await p.waitForTimeout(600);
await p.evaluate(()=>{window.PR=[];window.pwait=()=>Promise.resolve();
 window.aiJson=async pr=>{PR.push(pr);const m=pr.match(/Pasti da pianificare: (\[.*?\])\./);const sl=JSON.parse(m[1]);return sl.map((s,i)=>({day:s.day,meal:s.meal,title:"P"+PR.length+"-"+i,emoji:"🍝",time:"20 min",ingredients:[{id:null,name:"sale",amount:1,unit:"g"},{id:null,name:"riso",amount:80,unit:"g"},{id:null,name:"zucchine",amount:200,unit:"g"}],steps:["a","b","c"]}))};
 S.items=[{id:"p1",name:"Riso",cat:"Pasta e cereali",q:5000,u:"g",exp:"",loc:"dispensa"}];S.shop=[];S.tab="piano";S.pset=true;render()});
let t=await p.evaluate(()=>document.getElementById('v').innerText);
T('scelta dispensa nella schermata',/Non usare la dispensa/.test(t)&&/Usa quello che ho in dispensa/.test(t));
await p.evaluate(()=>pcSet('usa','0'));t=await p.evaluate(()=>document.getElementById('v').innerText);T('casella carrello compare',/Aggiungi subito gli ingredienti/.test(t));
await p.evaluate(()=>S.items=[]);
await p.evaluate(()=>planGen());await p.waitForTimeout(500);
let r=await p.evaluate(()=>({pr:PR[0],nop:S.plan&&S.plan.nop,shop:S.shop.map(x=>[x.name,x.amount,x.unit])}));
T('si può generare con dispensa vuota',r.nop===true);
T('prompt senza dispensa',/SENZA vincoli di dispensa/.test(r.pr)&&!/Dispensa \(elenco/.test(r.pr)&&!/usa SOLO prodotti/.test(r.pr));
const riso=r.shop.find(x=>/riso/i.test(x[0])),zu=r.shop.find(x=>/zucchine/i.test(x[0]));
T('ingredienti aggiunti al carrello (10 pasti)',riso&&riso[1]===800&&zu&&zu[1]===2000&&!r.shop.some(x=>/sale/i.test(x[0])));
// anche se il riso è in dispensa, lo compro: non si usa la dispensa
await p.evaluate(()=>{S.items=[{id:"p1",name:"Riso",cat:"Pasta e cereali",q:5000,u:"g",exp:"",loc:"dispensa"}];S.shop=[];S.plan=null;planGen()});await p.waitForTimeout(500);
T('con dispensa piena ma non usata: compro comunque',await p.evaluate(()=>{const x=S.shop.find(y=>/riso/i.test(y.name));return x&&x.amount===800}));
// senza carrello automatico
await p.evaluate(()=>{pcSet('cart','0');S.shop=[];S.plan=null;planGen()});await p.waitForTimeout(500);
T('senza spunta carrello: lista vuota ma pulsante manuale',await p.evaluate(()=>S.shop.length===0&&planCalc(S.plan).short.length>0));
await p.evaluate(()=>planShop());T('pulsante aggiungi alla lista',await p.evaluate(()=>S.shop.length>0));
// mensile, profilo non serve: 4 settimane sommate
await p.evaluate(()=>{pcSet('cart','1');pcSet('dur','mese');S.shop=[];PR.length=0;planGen()});await p.waitForTimeout(500);await p.waitForFunction(()=>!S.pbz,null,{timeout:40000});
r=await p.evaluate(()=>({n:PR.length,riso:(S.shop.find(y=>/riso/i.test(y.name))||{}).amount,w:S.plans[0]&&S.plans[0].weeks.length,nop:S.plans[0]&&S.plans[0].weeks.every(w=>w.nop)}));
T('mese: 4 settimane, quantità sommate (40 pasti × 80 g)',r.n===4&&r.w===4&&r.nop&&r.riso===3200);
// modalità con dispensa ripristinata
await p.evaluate(()=>{pcSet('usa','1');pcSet('dur','sett');S.shop=[];S.plan=null;PR.length=0;planGen()});await p.waitForTimeout(500);
T('con dispensa: prompt usa la dispensa',await p.evaluate(()=>/usa SOLO prodotti della dispensa/.test(PR[0])&&S.plan.nop===false));
T('nessun errore JS',E.length===0);if(E.length)console.log(E);console.log(ok+' ok, '+ko+' ko');await b.close();srv.close()})();
