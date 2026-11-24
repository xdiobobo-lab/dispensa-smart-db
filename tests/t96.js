const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path');
const ROOT=(process.env.SITE||require('path').resolve(__dirname,'..'));
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';const f=u==='/config.js'?path.join(__dirname,'fixtures','config-vuoto.js'):path.join(ROOT,u);if(!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':u.endsWith('.js')?'text/javascript':u.endsWith('.html')?'text/html':'application/octet-stream'});r.end(fs.readFileSync(f))});
let ok=0,ko=0;const T=(n,c)=>{console.log((c?'OK  ':'FAIL')+' '+n);c?ok++:ko++};
(async()=>{await new Promise(r=>srv.listen(8807,r));const b=await chromium.launch(),p=await(await b.newContext({serviceWorkers:'block',viewport:{width:390,height:900}})).newPage();const E=[];p.on('pageerror',x=>E.push(x.message));
await p.goto('http://localhost:8807/index.html');await p.waitForTimeout(700);
const R=(title,course,ings)=>({title,course,ingredients:ings.map(n=>({name:n,amount:100,unit:"g"}))});
const cases=[
 ["risotto al cacao amaro (Primo)",R("Risotto al cacao amaro","Primo",["riso","cacao amaro","burro"]),false],
 ["risotto alla milanese",R("Risotto alla milanese","Primo",["riso","zafferano","burro","brodo"]),true],
 ["primo con cacao senza titolo risotto",R("Pasta al cacao","Primo",["pasta","cacao"]),false],
 ["pasta e ceci",R("Pasta e ceci","Primo",["pasta","ceci","rosmarino"]),true],
 ["carbonara senza pasta",R("Carbonara","Primo",["uova","guanciale","pecorino"]),false],
 ["carbonara ok",R("Spaghetti alla carbonara","Primo",["spaghetti","uova","guanciale","pecorino"]),true],
 ["torta al cioccolato dolce",R("Torta al cioccolato","Dolce",["farina 00","cioccolato fondente","uova","zucchero"]),true],
 ["dolce con pollo",R("Torta al pollo","Dolce",["farina","pollo"]),false],
 ["dolce con aglio",R("Crema dolce","Dolce",["latte","aglio"]),false],
 ["secondo che è un risotto",R("Risotto ai funghi","Secondo",["riso","funghi"]),false],
 ["frittata di zucchine",R("Frittata di zucchine","Secondo",["uova","zucchine"]),true],
 ["frittata senza uova",R("Frittata di zucchine","Secondo",["zucchine","farina"]),false],
 ["primo senza base",R("Insalata strana","Primo",["mela","noci"]),false],
 ["zuppa di verdure",R("Zuppa di verdure","Primo",["cipolla","carote","sedano"]),true],
 ["torta di mele",R("Torta di mele","Dolce",["farina 00","mele","uova","zucchero"]),true],
 ["tiramisù",R("Tiramisù","Dolce",["savoiardi","mascarpone","uova","caffè","cacao amaro"]),true],
 ["cacao in secondo salato",R("Brasato al cacao","Secondo",["manzo","cacao"]),false],
];
for(const [n,r,e] of cases){T(n,await p.evaluate(x=>recSane(x),r)===e)}
T('prompt contiene la regola dei piatti reali',await p.evaluate(()=>/SOLO piatti realmente esistenti/.test(REALP)));
// gen end-to-end con AI simulata
await p.evaluate(()=>{S.items=[{id:"p1",name:"Riso",cat:"Cereali e derivati",q:500,u:"g",exp:"",loc:""},{id:"p2",name:"Cacao amaro",cat:"Altro",q:100,u:"g",exp:"",loc:""},{id:"p3",name:"Burro",cat:"Latticini e uova",q:200,u:"g",exp:addDays(2),loc:""}];S.gc="Primo";window.__pr="";
 claude.use=async()=>({json:async(pr)=>{window.__pr=pr;return[{title:"Risotto al cacao amaro",course:"Primo",ingredients:[{id:"p1",name:"riso",amount:160,unit:"g"},{id:"p2",name:"cacao amaro",amount:20,unit:"g"}],steps:["a","b","c","d"]},{title:"Risotto in bianco",origin:"Tradizione lombarda",course:"Primo",ingredients:[{id:"p1",name:"riso",amount:160,unit:"g"},{id:"p3",name:"burro",amount:20,unit:"g"},{name:"brodo vegetale",id:null,amount:500,unit:"ml"}],steps:["a","b","c","d"]}]}})});
await p.evaluate(()=>genAi());await p.waitForFunction(()=>!S.busy,null,{timeout:20000});
const rec=await p.evaluate(()=>({t:S.recs.map(x=>x.title),pr:window.__pr,err:S.err}));
T('gen scarta il risotto al cacao e tiene quello vero',rec.t.length===1&&rec.t[0]==="Risotto in bianco");
T('prompt di gen permette ingredienti da comprare e chiede ricette vere',/id null/.test(rec.pr)&&/NON inventare abbinamenti/.test(rec.pr)&&/origin/.test(rec.pr));
T('nessun errore JS',E.length===0);if(E.length)console.log(E);console.log(ok+' ok, '+ko+' ko');await b.close();srv.close()})();
