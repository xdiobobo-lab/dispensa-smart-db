const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path');
const ROOT=(process.env.SITE||require('path').resolve(__dirname,'..'));
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';const f=path.join(ROOT,u);if(!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':u.endsWith('.js')?'text/javascript':u.endsWith('.html')?'text/html':'application/octet-stream'});r.end(fs.readFileSync(f))});
let ok=0,ko=0;const T=(n,c)=>{console.log((c?'OK  ':'FAIL')+' '+n);c?ok++:ko++};
(async()=>{await new Promise(r=>srv.listen(8809,r));const b=await chromium.launch(),p=await(await b.newContext({serviceWorkers:'block',viewport:{width:390,height:900}})).newPage();const E=[];p.on('pageerror',x=>E.push(x.message));
await p.goto('http://localhost:8809/index.html');await p.waitForTimeout(700);
T('catalogo caricato (>=230 piatti)',await p.evaluate(()=>window.PIATTI&&window.PIATTI.d.length>=230));
const it=(id,name,q,exp)=>({id,name,cat:"Altro",q,u:"g",exp:exp||"",loc:""});
const setP=(arr)=>p.evaluate(a=>{S.items=a;S.gc=""},arr);
T('fiori di zucca non richiedono "zucca"',await p.evaluate(()=>{const d=PIATTI.d.find(x=>/Fiori di zucca/.test(x.n));return d&&!d.i.includes("zucca")&&d.i.includes("fiori di zucca")}));
// 1 dispensa riso/cacao/burro/formaggio/cipolla/brodo
await setP([it("p1","Riso",500),it("p2","Cacao amaro",100),it("p3","Burro",200),it("p4","Parmigiano",100),it("p5","Cipolla",2),it("p6","Brodo vegetale",500)]);
let r=await p.evaluate(()=>{S.gc="Primo";return pzSuggest("Primo",new Set(),6).map(x=>x.d.n+"|"+x.miss)});console.log(r.join("; "));
T('suggerisce Risotto alla parmigiana con riso, burro, formaggio, cipolla, brodo',r.some(x=>/^Risotto alla parmigiana\|0/.test(x)));
T('nessun piatto col cacao tra i primi',!r.some(x=>/cacao|cioccolat/i.test(x)));
const dol=await p.evaluate(()=>pzSuggest("Dolce",new Set(),6).map(x=>x.d.n));console.log("dolci:",dol.join("; "));
// 2 carbonara quasi
await setP([it("p1","Spaghetti",500),it("p2","Uova",6),it("p3","Pecorino",100)]);
r=await p.evaluate(()=>pzSuggest("Primo",new Set(),60).map(x=>x.d.n+"|"+x.miss));console.log(r.slice(0,6).join("; "));
T('carbonara con 1 ingrediente mancante (guanciale)',r.some(x=>/carbonara\|1/.test(x)));
T('cacio e pepe compatibile (0 mancanti)',r.some(x=>/Cacio e pepe\|0/.test(x)));
// 3 nulla di compatibile
await setP([it("p1","Cacao amaro",100)]);
T('con solo cacao nessun primo del catalogo',(await p.evaluate(()=>pzSuggest("Primo",new Set(),6).length))===0);
// gen end-to-end con AI simulata
await p.evaluate(()=>{S.items=[{id:"p1",name:"Riso",cat:"Cereali e derivati",q:500,u:"g",exp:"",loc:""},{id:"p3",name:"Burro",cat:"Latticini e uova",q:200,u:"g",exp:addDays(2),loc:""},{id:"p4",name:"Parmigiano",cat:"Latticini e uova",q:100,u:"g",exp:"",loc:""},{id:"p5",name:"Cipolla",cat:"Frutta e verdura",q:2,u:"pz",exp:"",loc:""},{id:"p6",name:"Brodo vegetale",cat:"Altro",q:500,u:"ml",exp:"",loc:""},{id:"p7",name:"Funghi",cat:"Frutta e verdura",q:200,u:"g",exp:"",loc:""}];S.gc="Primo";window.__calls=[];
 claude.use=async()=>({json:async(pr)=>{window.__calls.push(pr);if(/Scrivi la ricetta COMPLETA/.test(pr)){const ids=[...pr.matchAll(/\[n=(\d+)\] ([^\n(]+)/g)].map(m=>({n:+m[1],t:m[2].trim()}));
  return ids.map(x=>({n:x.n,emoji:"🍚",time:"30 min",ingredients:[{id:"p1",name:"riso",amount:160,unit:"g"},{id:"p3",name:"burro",amount:20,unit:"g"},{id:"p4",name:"parmigiano",amount:30,unit:"g"},{id:"p5",name:"cipolla",amount:1,unit:"pz"},{id:"p6",name:"brodo",amount:500,unit:"ml"},{id:"p7",name:"funghi",amount:150,unit:"g"}],steps:["a","b","c","d"]}))}
  return[{title:"Insalata di riso e burro",course:"Primo",ingredients:[{id:"p1",name:"riso",amount:100,unit:"g"}],steps:["a","b","c","d"]}]}})});
await p.evaluate(()=>gen());await p.waitForFunction(()=>!S.busy,null,{timeout:30000});
let R=await p.evaluate(()=>({t:S.recs.map(x=>x.title+"|"+x.src+"|"+x.pz),calls:window.__calls.length,note:S.note,err:S.err}));console.log(JSON.stringify(R));
T('gen scrive ricette dai piatti del catalogo (src pz)',R.t.filter(x=>x.includes("|pz|")).length>=1);
T('se la AI dimentica un ingrediente obbligatorio la ricetta è scartata',await p.evaluate(()=>S.recs.filter(x=>x.src==="pz").every(x=>{const d=PIATTI.d.find(y=>y.id===x.pz);const got=new Set(x.ingredients.flatMap(g=>[...pzCanon(g.name)]));return d.i.every(c=>got.has(c))})));
// scarto: AI che omette gli ingredienti
await p.evaluate(()=>{claude.use=async()=>({json:async(pr)=>{if(/Scrivi la ricetta COMPLETA/.test(pr)){return [...pr.matchAll(/\[n=(\d+)\]/g)].map(m=>({n:+m[1],ingredients:[{id:null,name:"acqua",amount:100,unit:"ml"}],steps:["a","b","c"]}))}return[{title:"Risotto semplice in bianco",course:"Primo",ingredients:[{id:"p1",name:"riso",amount:160,unit:"g"},{id:"p3",name:"burro",amount:20,unit:"g"}],steps:["a","b","c","d"]}]}})});
await p.evaluate(()=>{S.recs=[];gen()});await p.waitForFunction(()=>!S.busy,null,{timeout:30000});
R=await p.evaluate(()=>({t:S.recs.map(x=>x.title+"|"+x.src),note:S.note}));console.log(JSON.stringify(R));
T('ricette del catalogo non valide scartate, ripiego sull’AI con avviso',R.t.length>=1&&R.t.every(x=>/\|ai$/.test(x))&&/abbinamenti/.test(R.note));
// nessun piatto compatibile -> AI crea
await p.evaluate(()=>{S.items=[{id:"p2",name:"Cacao amaro",cat:"Altro",q:100,u:"g",exp:"",loc:""},{id:"p1",name:"Caffè",cat:"Bevande",q:500,u:"g",exp:"",loc:""}];S.recs=[];S.gc="Primo";window.__pr="";claude.use=async()=>({json:async(pr)=>{window.__pr=pr;return[{title:"Riso in bianco",course:"Primo",ingredients:[{id:"p1",name:"riso",amount:160,unit:"g"}],steps:["a","b","c","d"]}]}})});
await p.evaluate(()=>gen());await p.waitForFunction(()=>!S.busy,null,{timeout:30000});
R=await p.evaluate(()=>({t:S.recs.map(x=>x.title+"|"+x.src),note:S.note,pr:window.__pr}));
T('senza piatti compatibili l’AI propone abbinamenti e lo dice',R.t.length>=1&&/Nessun piatto classico/.test(R.note)&&/REGOLA FONDAMENTALE/.test(R.pr));
// ricerca
await p.evaluate(()=>{S.tab="ricette";document.body.insertAdjacentHTML("beforeend",'<input id="q2" value="carbonara">');window.__pr="";claude.use=async()=>({json:async(pr)=>{window.__pr=pr;return[...pr.matchAll(/\[n=(\d+)\]/g)].map(m=>({n:+m[1],emoji:"🍝",time:"20 min",ingredients:[{id:null,name:"spaghetti",amount:200,unit:"g"},{id:null,name:"guanciale",amount:100,unit:"g"},{id:null,name:"uova",amount:3,unit:"pz"},{id:null,name:"pecorino",amount:50,unit:"g"}],steps:["a","b","c","d"]}))}});return srch()});
await p.waitForFunction(()=>!S.sb,null,{timeout:30000});
R=await p.evaluate(()=>({t:S.srch.map(x=>x.title+"|"+x.src),pr:window.__pr}));console.log(JSON.stringify(R.t));
T('ricerca «carbonara» usa il catalogo',R.t.length===1&&/Spaghetti alla carbonara\|pz/.test(R.t[0])&&/guanciale/.test(R.pr));
// ricerca fuori catalogo
await p.evaluate(()=>{document.getElementById("q2").value="strudel di mele";window.__web=0;claude.use=async()=>({json:async(pr)=>{window.__web=/Scrivi la ricetta COMPLETA/.test(pr)?0:1;return[{title:"Strudel di mele",course:"Dolce",ingredients:[{id:null,name:"mele",amount:500,unit:"g"},{id:null,name:"farina",amount:200,unit:"g"}],steps:["a","b","c","d"]}]}});return srch()});
await p.waitForFunction(()=>!S.sb,null,{timeout:30000});
T('ricerca fuori catalogo: ripiego sull’AI con badge «Proposta dall’AI»',await p.evaluate(()=>window.__web===1&&S.srch[0].src==="web"&&SRC.web[1]==="Proposta dall’AI"));
// senza X
T('«senza uova» esclude i piatti con uova',await p.evaluate(()=>{document.getElementById("q2").value="torta senza uova";return pzFind("torta senza uova").every(x=>!x.d.i.includes("uova"))}));
// scheda con link
await p.evaluate(()=>{S.tab="ricette";S.cur={title:"Spaghetti alla carbonara",src:"pz",pz:1,origin:"Piatto classico italiano · Lazio",course:"Primo",ingredients:[{id:null,name:"spaghetti",amount:200,unit:"g"}],steps:["a","b"],time:"20 min"};S.step=0;S.done={};S.from="ricette";render()});
const t=await p.evaluate(()=>document.getElementById('v').innerText+document.getElementById('v').innerHTML);
T('scheda: origine e link di confronto',/Piatto classico italiano/.test(t)&&/GialloZafferano/.test(t)&&/Benedetta Rossi/.test(t));
T('nessun errore JS',E.length===0);if(E.length)console.log(E);console.log(ok+' ok, '+ko+' ko');await b.close();srv.close()})();
