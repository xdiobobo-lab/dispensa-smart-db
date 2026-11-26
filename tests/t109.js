// Ricette da Wikibooks (API simulata): ricerca per nome, ricette dalla dispensa, protezione dalle invenzioni
const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path');
const ROOT=(process.env.SITE||require('path').resolve(__dirname,'..'));
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';const f=u==='/config.js'?path.join(__dirname,'fixtures','config-vuoto.js'):path.join(ROOT,u);if(!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':u.endsWith('.js')?'text/javascript':u.endsWith('.html')?'text/html':'application/octet-stream'});r.end(fs.readFileSync(f))});
let ok=0,ko=0;const T=(n,c)=>{console.log((c?'OK  ':'FAIL')+' '+n);c?ok++:ko++};
const WT="== Ingredienti ==\n* 1 kg di farina\n* 40 g di lievito di birra\n* 2 dl di olio di oliva\n* 2 bicchieri di vino bianco\n* [[miele]]\n* cannella\n== Preparazione ==\n# Si unisce la farina con il lievito sciolto in acqua\n# Si uniscono olio e vino bianco e si impasta\n# Si lascia lievitare tre ore\n# Si friggono le sfoglie e si condiscono con miele e cannella\n{{Template|x}}\n[[Categoria:Ricette]]";
(async()=>{await new Promise(r=>srv.listen(8821,r));const b=await chromium.launch(),p=await(await b.newContext({serviceWorkers:'block',viewport:{width:390,height:800}})).newPage();const E=[];p.on('pageerror',x=>x&&E.push(x.message));
let mode="ok",calls=[];
await p.route('https://it.wikibooks.org/**',r=>{const u=r.request().url();calls.push(u);if(mode==="down")return r.abort();
 const h={'access-control-allow-origin':'*','content-type':'application/json'};
 if(/list=search/.test(u))return r.fulfill({status:200,headers:h,body:JSON.stringify({query:{search:[{title:"Libro di cucina/Ricette/Carteddàte"},{title:"Libro di cucina/Ricette-Dolci"},{title:"Utente:Prova"}]}})});
 if(/action=parse/.test(u))return r.fulfill({status:200,headers:h,body:JSON.stringify({parse:{title:"Libro di cucina/Ricette/Carteddàte",wikitext:WT}})});
 r.fulfill({status:404,body:""})});
await p.goto('http://localhost:8821/index.html');await p.waitForTimeout(800);
await p.evaluate(()=>{window.WB_OFF=false;S.items=[{id:"p1",name:"Farina 00",cat:"Cereali e derivati",q:1000,u:"g",exp:"",loc:""},{id:"p2",name:"Lievito di birra",cat:"Altro",q:40,u:"g",exp:"",loc:""},{id:"p3",name:"Vino bianco",cat:"Bevande",q:700,u:"ml",exp:"",loc:""},{id:"p4",name:"Olio di oliva",cat:"Condimenti e oli",q:500,u:"ml",exp:"",loc:""}];
 window.__sys=[];window.__wb=1;
 claude.use=async()=>({json:async(pr)=>{window.__sys.push(pr);
  if(/Libro di cucina di Wikibooks/.test(pr)){const good=window.__wb===1;
   return [{n:0,emoji:"🥨",time:"3 ore",course:"Dolce",ingredients:good?[{id:"p1",name:"farina 00",amount:500,unit:"g"},{id:"p2",name:"lievito di birra",amount:20,unit:"g"},{id:"p4",name:"olio di oliva",amount:100,unit:"ml"},{id:"p3",name:"vino bianco",amount:250,unit:"ml"},{id:null,name:"miele",amount:30,unit:"g"},{id:null,name:"cannella",amount:2,unit:"g"}]:[{id:null,name:"tartufo nero",amount:20,unit:"g"},{id:null,name:"caviale",amount:30,unit:"g"},{id:null,name:"zafferano",amount:1,unit:"g"}],steps:["Impasta","Lascia lievitare","Stendi","Friggi e condisci"]}]}
  return[{title:"Dolce di ripiego",course:"Dolce",ingredients:[{id:"p1",name:"farina",amount:100,unit:"g"},{id:"p2",name:"lievito di birra",amount:5,unit:"g"}],steps:["a","b","c","d"]}]}})});
// 1 ricerca fuori catalogo
await p.evaluate(()=>{S.tab="ricette";document.body.insertAdjacentHTML("beforeend",'<input id="q2" value="carteddate">');return srch()});
await p.waitForFunction(()=>!S.sb,null,{timeout:20000});
let R=await p.evaluate(()=>({t:S.srch.map(x=>x.title+"|"+x.src+"|"+x.wb),pr:window.__sys[0]||"",e:S.serr}));console.log(JSON.stringify(R.t));
T('ricerca: ricetta da Wikibooks (solo pagine Libro di cucina/Ricette/)',R.t.length===1&&/^Carteddàte\|wb\|Libro di cucina\/Ricette\/Carteddàte$/.test(R.t[0]));
T('il testo inviato all’AI è pulito (niente modelli né categorie) e contiene gli ingredienti',/1 kg di farina/.test(R.pr)&&!/Template|Categoria/.test(R.pr)&&/miele/.test(R.pr)&&!/\[\[/.test(R.pr));
await p.evaluate(()=>{S.cur=S.srch[0];S.step=0;S.done={};S.from="cerca";S.tab="ricette";render()});
const h=await p.evaluate(()=>document.getElementById('v').innerHTML);
T('scheda: fonte Wikibooks con link, licenza CC BY-SA e autori',/it\.wikibooks\.org\/wiki\/Libro_di_cucina\/Ricette\/Carted/.test(h)&&/CC BY-SA/.test(h)&&/action=history/.test(h)&&/Wikibooks \(CC BY-SA\)/.test(h));
// 2 anti-invenzione
await p.evaluate(()=>{window.__wb=0;S.srch=[];return srch()});await p.waitForFunction(()=>!S.sb,null,{timeout:20000});
R=await p.evaluate(()=>S.srch.map(x=>x.title+"|"+x.src));
T('ingredienti non presenti nel testo → ricetta scartata, ripiego sull’AI',R.length===1&&/\|web$/.test(R[0]));
// 3 gen dalla dispensa
await p.evaluate(()=>{window.__wb=1;S.recs=[];S.gc="Dolce";S.rv=1;window.__sys=[]});
await p.evaluate(()=>gen());await p.waitForFunction(()=>!S.busy,null,{timeout:30000});
R=await p.evaluate(()=>({t:S.recs.map(x=>x.title+"|"+x.src),note:S.note,err:S.err}));console.log(JSON.stringify(R));
T('suggerimenti: ricette Wikibooks dalla dispensa con avviso',R.t.some(x=>/\|wb$/.test(x))&&/Wikibooks/.test(R.note));
// 4 diete
await p.evaluate(()=>{W("diet",{lat:0,veg:0,glu:1,pig:0});window.__wb=1;S.recs=[]});
await p.evaluate(()=>gen());await p.waitForFunction(()=>!S.busy,null,{timeout:30000});
T('senza glutine: la ricetta con farina non passa',await p.evaluate(()=>S.recs.every(x=>x.src!=="wb")));
await p.evaluate(()=>W("diet",{}));
// 5 non mi piace
await p.evaluate(()=>{dislikeT("Carteddàte")});
T('«Non mi piace» esclude la pagina anche da Wikibooks',await p.evaluate(()=>isDis("Carteddàte")));
// 6 rete assente
mode="down";await p.evaluate(()=>{W("dis",[]);S.recs=[];S.srch=[]});
await p.evaluate(()=>gen());await p.waitForFunction(()=>!S.busy,null,{timeout:30000});
R=await p.evaluate(()=>({t:S.recs.map(x=>x.src),err:S.err}));
T('Wikibooks non raggiungibile: nessun errore, funziona il ripiego AI',R.t.length>=1&&R.t.every(x=>x!=="wb")&&!R.err);
T('nessun errore JS',E.length===0);if(E.length)console.log(E);console.log(ok+' ok, '+ko+' ko');await b.close();srv.close()})();
