// L'avviso "nuova versione" legge la versione da core.js (con ripiego su versione.json)
const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path');
const ROOT=(process.env.SITE||require('path').resolve(__dirname,'..'));
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';const f=path.join(ROOT,u);if(!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':u.endsWith('.js')?'text/javascript':u.endsWith('.html')?'text/html':'application/octet-stream'});r.end(fs.readFileSync(f))});
let ok=0,ko=0;const T=(n,c)=>{console.log((c?'OK  ':'FAIL')+' '+n);c?ok++:ko++};
(async()=>{await new Promise(r=>srv.listen(8819,r));const b=await chromium.launch();
const run=async(ver)=>{const p=await(await b.newContext({serviceWorkers:'block'})).newPage();
 if(ver)await p.route(/core\.js\?t=/,r=>r.fulfill({status:200,contentType:'text/javascript',body:'const APP_VER="'+ver+'";'}));
 await p.goto('http://localhost:8819/index.html');await p.waitForTimeout(5500);const s=await p.evaluate(()=>!!document.getElementById('nv'));await p.context().close();return s};
T('versione uguale: nessun avviso',!(await run(null)));
const cur=(fs.readFileSync(path.join(ROOT,'core.js'),'utf8').match(/APP_VER="([0-9.]+)"/)||[])[1];
ko+=0;
T('versione diversa online: compare l’avviso',await run('99.0.0'));
console.log(ok+' ok, '+ko+' ko');await b.close();srv.close()})();
