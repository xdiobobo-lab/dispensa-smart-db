const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path');
const ROOT=(process.env.SITE||require('path').resolve(__dirname,'..'));
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';const f=path.join(ROOT,u);if(!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':{'.html':'text/html','.js':'text/javascript','.css':'text/css'}[path.extname(f)]||'application/octet-stream'});r.end(fs.readFileSync(f))});
let ok=0,ko=0;const T=(n,c)=>{console.log((c?'OK  ':'FAIL')+' '+n);c?ok++:ko++};
(async()=>{await new Promise(r=>srv.listen(8801,r));const b=await chromium.launch(),p=await(await b.newContext({serviceWorkers:'block',viewport:{width:390,height:900}})).newPage();const E=[];p.on('pageerror',x=>E.push(x.message));
await p.goto('http://localhost:8801/index.html');await p.waitForTimeout(600);
await p.evaluate(()=>{window.PR=[];
 window.aiJson=async pr=>{PR.push(pr);if(/Riassumi SOLO/.test(pr))return{sintesi:"1800 kcal, pesce 3 volte a settimana, niente zuccheri",kcal:1800,evitare:["dolci"],preferire:["pesce"]};
  const m=pr.match(/Pasti da pianificare: (\[.*?\])\./);const sl=JSON.parse(m[1]);let n=PR.length;return sl.map((s,i)=>({day:s.day,meal:s.meal,title:"Piatto "+n+"-"+i,emoji:"🍝",time:"20 min",ingredients:[{id:null,name:"sale",amount:1,unit:"g"},{id:null,name:"riso",amount:80,unit:"g"}],steps:["a","b","c"]}))};
 claude.vision=async()=>({sintesi:"Dieta letta da foto: proteine alte",kcal:2400,evitare:[],preferire:["pollo"]});
 S.items=[{id:"p1",name:"Riso",cat:"Pasta e cereali",q:500,u:"g",exp:"",loc:"dispensa"}];S.tab="piano";render()});
await p.waitForTimeout(300);
let t=await p.evaluate(()=>document.getElementById('v').innerText);
T('sottomenu presente',/I miei piani/.test(t)&&/Diete/.test(t));
await p.evaluate(()=>{S.pset=true;render()});t=await p.evaluate(()=>document.getElementById('v').innerText);
await p.screenshot({path:'sf5.png',fullPage:true});T('schermata prima di generare',/Prima di generare/.test(t)&&/Solo primi/.test(t)&&/Solo secondi/.test(t)&&/mese/.test(t)&&/Tutta la famiglia/.test(t));
// famiglia settimanale con pranzo solo primi
await p.evaluate(()=>{pcSet('pranzo','primi');pcSet('cena','secondi')});
await p.evaluate(()=>planGen());await p.waitForTimeout(400);
let r=await p.evaluate(()=>({n:Object.keys(S.plan.days).length,pr:PR[0],sav:S.plans.length}));
T('piano famiglia generato in S.plan (5 giorni)',r.n===5&&r.sav===0);
T('prompt: pranzo solo primi e cena solo secondi',/Pranzo: SOLO primi/.test(r.pr)&&/Cena: SOLO secondi/.test(r.pr));
// dieta
await p.evaluate(()=>{S.pv="prof";render();pfNew()});await p.evaluate(()=>{pfReadTxt&&0});
await p.evaluate(()=>{document.getElementById('pf_n').value='Marco';document.getElementById('pf_t').value='Colazione: yogurt e frutta. Pranzo 80 g di pasta integrale con verdure. Cena pesce o carne bianca 150 g con contorno. Evitare dolci e bibite zuccherate.'});
await p.evaluate(()=>pfReadTxt());await p.waitForTimeout(400);
t=await p.evaluate(()=>document.getElementById('pf_s').value);T('dieta letta dal testo → riassunto',/1800 kcal/.test(t));
await p.evaluate(()=>pfSave());T('persona salvata',await p.evaluate(()=>S.prof.length===1&&S.prof[0].name==='Marco'&&S.prof[0].kcal===1800));
// lettura da foto
await p.evaluate(()=>{pfNew();});await p.evaluate(()=>{window.pageJpg;});
const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==','base64');fs.writeFileSync('/tmp/w/d.png',png);
await p.setInputFiles('input[type=file][onchange^="pfRead"]','/tmp/w/d.png');await p.waitForTimeout(800);
t=await p.evaluate(()=>S.pfe&&S.pfe.sintesi);T('dieta letta da foto',/proteine alte/.test(t||''));
await p.evaluate(()=>{S.pfe=null;render()});
// piano mensile per Marco
await p.evaluate(()=>{S.pv="cur";pcSet('for',S.prof[0].id);pcSet('dur','mese');pcSet('pranzo','completo');pcSet('cena','secondi');window.PR.length=0;window.pwait=()=>Promise.resolve();S.pset=true;render()});
await p.evaluate(()=>planGen());await p.waitForTimeout(800);
r=await p.evaluate(()=>({pl:S.plans.length,w:S.plans[0]&&S.plans[0].weeks.length,pv:S.pv,pr:PR.slice(),nm:S.plans[0]&&S.plans[0].name,k:S.plans[0]&&S.plans[0].kind}));
T('piano mensile salvato (4 settimane)',r.pl===1&&r.w===4&&r.k==='mese'&&r.pv==='saved');
T('4 chiamate AI',r.pr.length===4);
T('prompt con dieta e priorità medico',/1800 kcal/.test(r.pr[0])&&/PRIORITÀ/.test(r.pr[0])&&/DA EVITARE: dolci/.test(r.pr[0])&&/1 person/.test(r.pr[0]));
T('prompt: completo e secondi',/primo E un secondo/.test(r.pr[0])&&/Cena: SOLO secondi/.test(r.pr[0]));
T('settimane successive evitano ripetizioni',/Piatto 1-0/.test(r.pr[1])&&/né questi già fatti/.test(r.pr[1])&&/puoi aggiungere altri ingredienti/.test(r.pr[1]));
t=await p.evaluate(()=>document.getElementById('v').innerText);T('schermata piani: nome e settimane',/Marco · Mese/.test(t)&&/Sett\. 4/.test(t)&&/Lunedì/.test(t));
// modifica manuale
await p.evaluate(()=>spEd('lun','pranzo'));await p.evaluate(()=>{document.getElementById('pe_t').value='Pasta al forno';document.getElementById('pe_m').value='40 min'});await p.evaluate(()=>spEdSave());
T('modifica manuale titolo',await p.evaluate(()=>S.plans[0].weeks[0].days.lun.pranzo.r.title==='Pasta al forno'));
await p.evaluate(()=>{S.mine=[{id:"m1",title:"Frittata",emoji:"🍳",time:"10 min",ingredients:[{name:"uova",amount:3,unit:"pz"}],steps:["x"],src:"manual"}];spWk(1);spEd('mar','cena');spBook()});
await p.evaluate(()=>spPick(0));T('piatto dal ricettario',await p.evaluate(()=>S.plans[0].weeks[1].days.mar.cena.r.title==='Frittata'));
await p.evaluate(()=>{spEd('mer','pranzo')});await p.evaluate(()=>spRegen());await p.waitForTimeout(400);
T('rigenera singolo pasto',await p.evaluate(()=>/^Piatto/.test(S.plans[0].weeks[1].days.mer.pranzo.r.title)&&PR[PR.length-1].includes('Pranzo: pasto completo')));
await p.evaluate(()=>spShop());T('spesa dal piano salvato',await p.evaluate(()=>S.shop.length>0));
// salva piano famiglia
await p.evaluate(()=>{S.pv="cur";render();spSaveCur()});T('salva piano famiglia',await p.evaluate(()=>S.plans.length===2&&S.plans[0].prof===''));
await p.evaluate(()=>{S.pv='saved';spOpenPlan(S.plans[0].id);spUse()});T('usa come piano settimana',await p.evaluate(()=>S.plan&&S.plan.start===weekStart()&&S.pv==='cur'));
// sync/backup roundtrip
const bk=await p.evaluate(()=>JSON.stringify(bkData()));
await p.evaluate(b=>{S.plans=[];S.prof=[];bkApply(JSON.parse(b))},bk);T('backup: piani e diete ripristinati',await p.evaluate(()=>S.plans.length===2&&S.prof.length===1));
await p.evaluate(()=>{spDel(S.plans[0].id);spDel(S.plans[0].id)});T('elimina piano',await p.evaluate(()=>S.plans.length===1&&S.pdel.length===1));
await p.evaluate(b=>{bkApply(JSON.parse(b))},bk);T('piano eliminato non risorge dal backup vecchio',await p.evaluate(()=>S.plans.length===1));
await p.evaluate(()=>{S.pv='saved';render()});await p.screenshot({path:'sf4.png',fullPage:true});
T('nessun errore JS',E.length===0);if(E.length)console.log(E);console.log(ok+' ok, '+ko+' ko');await b.close();srv.close()})();
