const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path');
const ROOT=(process.env.SITE||require('path').resolve(__dirname,'..'));
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';const f=path.join(ROOT,u);if(!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.css':'text/css'}[path.extname(f)]||'application/octet-stream'});r.end(fs.readFileSync(f))});
let ok=0,ko=0;const T=(n,c)=>{console.log((c?'OK  ':'FAIL')+' '+n);c?ok++:ko++};
const H={'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'*'};const J=(o,st)=>({status:st||200,contentType:'application/json',headers:H,body:JSON.stringify(o)});
(async()=>{await new Promise(r=>srv.listen(8805,r));const b=await chromium.launch(),p=await(await b.newContext({serviceWorkers:'block',viewport:{width:390,height:900}})).newPage();const E=[];p.on('pageerror',x=>E.push(x.message));
const reqs=[];
await p.route('**/config.js',r=>r.fulfill({contentType:'text/javascript',body:'window.SB_CONFIG={url:"https://fake.supabase.co",key:"anon"};'}));
await p.route('https://fake.supabase.co/**',async route=>{const q=route.request(),u=new URL(q.url());if(q.method()==='OPTIONS')return route.fulfill({status:204,headers:H});
 if(u.pathname==='/rest/v1/volantini_catalogo')return route.fulfill(J([{chiave:'conad|roma',nome:'Conad',regione:'Lazio',citta:'roma',url:'x',aggiornato:'2026-10-01T10:00:00Z',volantini:[{id:'1',nome:'Vol ottobre',pagine:['conad__roma/1/p01.png']}]},{chiave:'lidl|milano',nome:'Lidl',regione:'Lombardia',citta:'milano',url:'y',aggiornato:'2026-10-01T10:00:00Z',volantini:[{id:'2',nome:'Lidl ott',pagine:['lidl__milano/2/p01.png']}]}]));
 if(u.pathname==='/rest/v1/volantini_nascosti')return route.fulfill(J([]));
 if(u.pathname==='/rest/v1/richieste_volantini'){reqs.push(JSON.parse(q.postData()));return route.fulfill({status:201,headers:H})}
 if(u.pathname==='/storage/v1/object/sign/volantini'){return route.fulfill(J(JSON.parse(q.postData()).paths.map(x=>({path:x,signedURL:'/object/sign/volantini/'+x+'?token=T'}))))}
 route.fulfill(J({},404))});
await p.addInitScript(()=>{try{localStorage.setItem('sbs',JSON.stringify({at:'tok1',rt:'r',exp:Math.floor(Date.now()/1000)+3000,uid:'u1',email:'a@b.it'}));localStorage.removeItem('vagg')}catch(e){}});
await p.goto('http://localhost:8805/index.html');await p.waitForTimeout(600);
await p.evaluate(()=>{window.vcAvvia=async()=>{};S.tab="negozi";render()});await p.waitForTimeout(1200);
let t=await p.evaluate(()=>document.getElementById('v').innerText);
T('tasto Aggiorna volantini presente',/Aggiorna volantini/.test(t));
await p.evaluate(()=>vcAggiorna());await p.waitForTimeout(600);
T('una richiesta di aggiornamento per ogni supermercato',reqs.length===2&&reqs.every(x=>/\|agg$/.test(x.chiave))&&reqs.some(x=>x.chiave==='conad|roma|agg'&&x.catena==='Conad'));
t=await p.evaluate(()=>document.getElementById('v').innerText);T('messaggio di attesa',/Sto aggiornando i volantini/.test(t));
await p.evaluate(()=>{S.vcr={agg:1,done:1};render()});t=await p.evaluate(()=>document.getElementById('v').innerText);T('messaggio finale',/Volantini aggiornati/.test(t));
await p.evaluate(()=>{S.vcr=null;vcAggiorna()});await p.waitForTimeout(300);T('limite: non rimanda entro 6 ore',reqs.length===2);
T('nessun errore JS',E.length===0);if(E.length)console.log(E);console.log(ok+' ok, '+ko+' ko');await b.close();srv.close()})();
