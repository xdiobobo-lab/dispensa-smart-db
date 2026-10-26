/* Dispensa Smart - core.js */
const CATS=["Cereali e derivati","Latticini e uova","Carne e pesce","Frutta e verdura","Legumi","Condimenti e oli","Dolci e snack","Bevande","Altro"];
const KW={"Cereali e derivati":"pasta riso farina pane couscous orzo farro avena cereali fette polenta","Latticini e uova":"latte yogurt burro panna uova uovo formaggio mozzarella ricotta parmigiano","Carne e pesce":"pollo manzo maiale tonno salmone prosciutto salame pesce carne","Frutta e verdura":"mela banana pomodor insalata zucchin carot patat cipolla limon arancia spinaci verdur frutta","Legumi":"ceci fagioli lenticchie piselli fave","Condimenti e oli":"olio aceto sale pepe salsa passata spezie","Dolci e snack":"biscott cioccolat zucchero marmellata nutella merendin","Bevande":"acqua succo birra vino caffè tè bibita"};
const FRESH=/latte|panna|yogurt|ricotta|mozzarella|burro|succo/i;
const U={kg:["g",1000],g:["g",1],l:["ml",1000],ml:["ml",1],pz:["pz",1],cucchiaio:["cucchiai",1],"mezzo cucchiaio":["cucchiai",.5],cucchiaino:["cucchiaini",1]};
const L=k=>{try{return JSON.parse(localStorage.getItem(k))}catch(e){return null}};
const W=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v))}catch(e){}};
let S={tab:"oggi",items:L("items")||[],lib:L("lib")||{},hist:L("hist")||[],ph:L("ph")||{},mine:L("mine")||[],shop:L("shop")||[],srch:[],impLink:"",q:"",sb:false,serr:"",plan:L("plan")||null,pold:L("pold")||[],th:L("theme")||{mode:"auto",preset:"viola"},pp:2,pbz:false,perr:"",geo:L("geo")||{city:"",zone:"",stores:[]},stl:[],off:[],gb:"",recs:L("recs")||[],coll:L("coll")||[],cdel:L("cdel")||[],fly:L("fly")||[],cur:null,step:0,done:{},busy:false,err:""};
const $=id=>document.getElementById(id);
const esc=s=>String(s??"").replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const iso=d=>d.toISOString().slice(0,10);
const today=()=>iso(new Date());
const days=d=>d?Math.round((new Date(d)-new Date(today()))/864e5):Infinity;
const addDays=n=>{const d=new Date();d.setDate(d.getDate()+n);return iso(d)};
const save=()=>{if(S.hist.length>60)S.hist.length=60;W("items",S.items);W("lib",S.lib);W("hist",S.hist);W("mine",S.mine);W("shop",S.shop);W("plan",S.plan);W("pold",S.pold);W("coll",S.coll);W("cdel",S.cdel);W("fly",S.fly);if(!ghMute){try{localStorage.setItem("lm",Date.now())}catch(e){}if(ghOn())ghSched()}push()};
const fmt=(q,u)=>u==="cucchiai"?(q===.5?"mezzo cucchiaio":q===1?"1 cucchiaio":+q.toFixed(2)+" cucchiai"):u==="cucchiaini"?(q===1?"1 cucchiaino":+q.toFixed(2)+" cucchiaini"):u==="pz"?q+" pz":q>=1000?(q/1000).toFixed(q%1000?2:0).replace(/\.?0+$/,"")+(u==="g"?" kg":" l"):Math.round(q)+" "+u;
const guess=n=>{n=n.toLowerCase();for(const c in KW)if(KW[c].split(" ").some(k=>n.includes(k)))return c;return "Altro"};
const soon=()=>S.items.filter(i=>days(i.exp)<=3);
function toast(m){$("t").innerHTML=`<div class="toast">${m}</div>`;setTimeout(()=>$("t").innerHTML="",8000)}
const HELP={
oggi:["Cosa puoi fare qui","Il riepilogo di oggi: i prodotti che stanno per scadere, il pasto del piano e le ricette del tuo Ricettario che puoi preparare subito con quello che hai in casa.<br>• Tocca una ricetta per leggerla passo per passo.<br>• Con i pulsanti in fondo chiedi nuove ricette all’AI, aggiungi la spesa o apri la lista."],
colori:["Cosa puoi fare qui","Cambia l’aspetto dell’app: tema chiaro o scuro e colori. Scegli un tema già pronto o personalizza i colori: le modifiche si salvano da sole."],
dispensa:["Cosa puoi fare qui","L’elenco di tutto ciò che hai in casa, diviso per tipo di prodotto.<br>• Usa i pulsanti in alto per vedere solo frigo, dispensa o freezer.<br>• Tocca ✏️ vicino a un prodotto per correggere quantità e scadenza.<br>• I prodotti in scadenza sono segnalati in alto: tocca il link per trovare ricette che li usano.<br>• In fondo trovi le copie di sicurezza e il salvataggio dei dati."],
add:["Cosa puoi fare qui","Qui metti in dispensa quello che hai comprato.<br>• Scrivi nome e quantità del prodotto e salvalo.<br>• Oppure fotografa lo scontrino: l’app legge i prodotti da sola e prima di salvare puoi correggere tutto."],
ricette:["Cosa puoi fare qui","L’AI propone ricette in base a ciò che hai in dispensa: quelle che usano prodotti in scadenza compaiono per prime.<br>• Scegli che portata vuoi (primo, secondo, dolce…).<br>• Tocca una ricetta per vedere ingredienti e passaggi.<br>• Gli ingredienti che mancano li puoi aggiungere alla lista della spesa con un tocco."],
cerca:["Cosa puoi fare qui","Cerchi un piatto preciso? Scrivi il nome (per esempio “carbonara” o “tiramisù senza uova”) e l’AI ti propone 3 versioni.<br>• Aggiungi alla lista della spesa gli ingredienti che ti mancano.<br>• Salva nel Ricettario quella che ti piace."],
nuova:["Cosa puoi fare qui","Scrivi una ricetta tua, oppure incolla il link di una ricetta trovata online: l’AI compila il modulo e tu controlli prima di salvare.<br>• La ricetta salvata finisce nel Ricettario."],
ricettario:["Cosa puoi fare qui","Le ricette che hai salvato o scritto tu.<br>• Tocca una ricetta per aprirla, cucinarla o modificarla.<br>• Puoi raggrupparle in raccolte (per esempio “Cene veloci”) per ritrovarle più facilmente.<br>• Se hai quasi tutti gli ingredienti, l’app te lo segnala nella schermata Oggi."],
pref:["Cosa puoi fare qui","Le ricette che ti sono piaciute di più. Dai le stelle dopo aver cucinato: quelle preferite restano qui, pronte da rifare."],
cron:["Cosa puoi fare qui","Le ricette che hai già cucinato, dalla più recente.<br>• Puoi cambiare le stelle o rifare una ricetta con un tocco."],
piano:["Cosa puoi fare qui","Organizza i pranzi e le cene della settimana, da lunedì a venerdì oppure fino a domenica.<br>• Scegli i giorni con “Settimana lavorativa” o “Settimana intera”.<br>• Scegli come generare il piano: usando solo ciò che hai in dispensa, oppure partendo dalle offerte dei volantini con un budget minimo e massimo.<br>• Tocca un pasto per vedere la ricetta e segnarlo come fatto.<br>• Gli ingredienti da comprare, con prezzo e scadenza dell’offerta, finiscono nella lista della spesa."],
lista:["Cosa puoi fare qui","La lista di ciò che devi comprare.<br>• Scrivi un prodotto e tocca ＋ per aggiungerlo.<br>• Quando lo compri, tocca il quadratino: il prodotto va in dispensa, con quantità e scadenza stimate che puoi correggere.<br>• Se un prodotto è in offerta in un volantino, lo vedi sotto il suo nome.<br>• In alto trovi il totale stimato della spesa."],
negozi:["Cosa puoi fare qui","Qui trovi le offerte dei volantini e organizzi la spesa per negozio.<br>• Carica il volantino del tuo supermercato: l’app legge le offerte e ti mostra quali ti servono davvero.<br>• Spunta “Confronta prezzo con altri negozi” per vedere lo stesso prodotto nei vari volantini e trovare il più conveniente; puoi ordinare per prezzo o scadenza.<br>• Con “Aggiungi” metti un’offerta nella lista della spesa, con prezzo, negozio e scadenza.<br>• Più sotto vedi la lista divisa per supermercato; in “I tuoi supermercati” scegli zona e negozi."]
};
function hcGet(){try{return JSON.parse(lsg("hc","{}"))}catch(e){return{}}}
function helpTog(t){const m=hcGet();m[t]=m[t]?0:1;lss("hc",JSON.stringify(m));render()}
function helpBox(t){const x=HELP[t];if(!x)return"";
 return hcGet()[t]?`<div style="margin:0 0 6px"><button class="btn g" ${BS} onclick="helpTog('${t}')">ℹ️ Cosa puoi fare qui</button></div>`:`<div class="card" style="padding:12px 20px;margin-top:0"><div class="row"><b>ℹ️ ${x[0]}</b><button class="x" onclick="helpTog('${t}')" aria-label="Nascondi la spiegazione">✕</button></div><div class="mu" style="margin-top:4px">${x[1]}</div></div>`}
function render(){if(S.tab!=="nuova")S.edId=null;
 const tabs=[["oggi","🏠 Oggi"],["dispensa","Dispensa"],["add","Aggiungi spesa"],["ricette","Ricette AI"],["cerca","Cerca online"],["nuova","Nuova ricetta"],["ricettario","Ricettario"],["lista","Lista spesa"+(S.shop.filter(x=>!x.done).length?" ("+S.shop.filter(x=>!x.done).length+")":"")],["negozi","📍 Dove comprare"],["pref","Preferiti"],["cron","Cronologia"]];
 drawNav();try{drawThemePanel()}catch(e){}
 $("v").innerHTML=(S.tab==="ricette"&&S.cur?"":helpBox(S.tab))+({oggi:vOggi,dispensa:vDisp,add:vAdd,ricette:vRic,cerca:vSearch,nuova:vNew,ricettario:vBook,lista:vShop,negozi:vStores,piano:vPlan,colori:vTheme,guida:vGuida,pref:vPref,cron:vHist})[S.tab]()+(S.tab==="dispensa"?vBackup()+bkCard()+(window.setKey?ghCard():""):"");
}
const EM=[["uov","🥚"],["pasta","🍝"],["spaghet","🍝"],["riso","🍚"],["farina","🌾"],["pane","🍞"],["latte","🥛"],["yogurt","🥛"],["panna","🥛"],["formagg","🧀"],["parmigiano","🧀"],["mozzarella","🧀"],["ricotta","🧀"],["burro","🧈"],["pollo","🍗"],["manzo","🥩"],["maiale","🥩"],["carne","🥩"],["prosciutto","🥓"],["salame","🥓"],["tonno","🐟"],["salmone","🐟"],["pesce","🐟"],["pomodor","🍅"],["passata","🍅"],["insalata","🥬"],["spinaci","🥬"],["zucchin","🥒"],["carot","🥕"],["patat","🥔"],["cipolla","🧅"],["aglio","🧄"],["limon","🍋"],["melanzan","🍆"],["mela","🍎"],["banana","🍌"],["arancia","🍊"],["fragol","🍓"],["uva","🍇"],["peperon","🫑"],["funghi","🍄"],["fagioli","🫘"],["ceci","🫘"],["lenticch","🫘"],["piselli","🌱"],["olio","🫒"],["sale","🧂"],["zucchero","🍬"],["miele","🍯"],["cioccolat","🍫"],["biscott","🍪"],["acqua","💧"],["succo","🧃"],["vino","🍷"],["birra","🍺"],["caffè","☕"]];
const CE={"Cereali e derivati":"🌾","Latticini e uova":"🥛","Carne e pesce":"🥩","Frutta e verdura":"🥦","Legumi":"🫘","Condimenti e oli":"🫒","Dolci e snack":"🍪","Bevande":"🥤","Altro":"🛒"};
const emo=(n,c)=>{n=(n||"").toLowerCase();const m=EM.find(([k])=>n.includes(k));return m?m[1]:CE[c||guess(n)]||"🛒"};
const SRC={ai:["🤖","Consigliata dall’AI"],web:["🔎","Cercata online con l’AI"],manual:["✍️","Inserita manualmente"],link:["🔗","Importata da link"]};
const srcB=r=>{const s=SRC[r.src||"ai"]||SRC.ai;return `<span class="bd ok">${s[0]} ${s[1]}</span>`};
const nm=s=>String(s||"").toLowerCase().trim();
const eur=v=>"€ "+v.toFixed(2).replace(".",",");
let UNDO=null;
function undoable(label,snap,restore){UNDO={snap,restore};toast(`${label} <a href="#" onclick="doUndo();return false" style="color:inherit;font-weight:700">↩️ Annulla</a>`)}
function doUndo(){if(!UNDO)return;const u=UNDO;UNDO=null;try{u.restore(u.snap)}catch(e){}save();render();toast("↩️ Ripristinato")}
async function aiJson(p){const sm=await claude.use("sample");if(!sm)throw new Error("L’agente AI non è disponibile in questa vista.");return sm.json(p,{modelTier:"default"})}
const aiErr=e=>e.code==="not_granted"?"Permesso AI negato.":(e.message||"Errore, riprova.");
const GR=[["🏠","Oggi",[["oggi","Oggi"],["guida","ℹ️ Cosa puoi fare"]]],["🥫","Dispensa",[["dispensa","Dispensa"],["add","Aggiungi spesa"]]],["🍽️","Ricette",[["ricette","Consigliate AI"],["cerca","Cerca online"],["nuova","Nuova ricetta"],["ricettario","Ricettario"],["pref","Preferiti"],["cron","Cronologia"]]],["📅","Piano",[["piano","Settimana"]]],["🛒","Spesa",[["lista","Lista della spesa"],["negozi","Negozi e offerte"]]]];
function drawNav(){const gi=Math.max(0,GR.findIndex(g=>g[2].some(t=>t[0]===S.tab))),g=GR[gi],n=S.shop.filter(x=>!x.done).length;S.gt=S.gt||{};S.gt[gi]=S.tab;
 $("nav").innerHTML=g[2].length>1?g[2].map(([k,t])=>`<button class="${S.tab===k?"on":""}" onclick="S.tab='${k}';render()">${t}</button>`).join(""):"";
 $("nav").style.display=g[2].length>1?"flex":"none";
 $("bar").innerHTML=GR.map((x,i)=>`<button class="${i===gi?"on":""}" onclick="S.tab=(S.gt&&S.gt[${i}])||'${x[2][0][0]}';render()"><span>${x[0]}</span>${x[1]}${x[1]==="Spesa"&&n?" ("+n+")":""}</button>`).join("")}
const TP={
 verde:{n:"Verde",light:{bg:"#f1f8f1",card:"#ffffff",tx:"#14281a",mu:"#5f7a66",ac:"#2e9e57",acx:"#ffffff",bd:"#cfe6d4"},dark:{bg:"#0f1a13",card:"#17261c",tx:"#e6f3ea",mu:"#8fb09a",ac:"#4cc77a",acx:"#06210f",bd:"#27402f"}},
 oceano:{n:"Oceano",light:{bg:"#eef6fb",card:"#ffffff",tx:"#10253a",mu:"#5b7791",ac:"#1d7fd1",acx:"#ffffff",bd:"#cfe2f1"},dark:{bg:"#0e1822",card:"#162533",tx:"#e5eff8",mu:"#8aa6bf",ac:"#4aa8f0",acx:"#06203a",bd:"#26394c"}},
 tramonto:{n:"Tramonto",light:{bg:"#fff4ec",card:"#ffffff",tx:"#331a10",mu:"#8a6a58",ac:"#e8590c",acx:"#ffffff",bd:"#f6d9c6"},dark:{bg:"#1f130d",card:"#2b1b13",tx:"#f8ece4",mu:"#b99a88",ac:"#ff8a4c",acx:"#2a1005",bd:"#472d20"}},
 rosa:{n:"Rosa",light:{bg:"#fff0f6",card:"#ffffff",tx:"#331424",mu:"#8d6479",ac:"#d6336c",acx:"#ffffff",bd:"#f6cfe0"},dark:{bg:"#1d0f16",card:"#2a1721",tx:"#f9e8f0",mu:"#bb93a7",ac:"#f06595",acx:"#2e0818",bd:"#45283a"}},
 grafite:{n:"Grafite",light:{bg:"#f2f3f5",card:"#ffffff",tx:"#1b1d21",mu:"#6b7280",ac:"#374151",acx:"#ffffff",bd:"#dcdfe4"},dark:{bg:"#111315",card:"#1b1e21",tx:"#eceef0",mu:"#9aa1ab",ac:"#9ca3af",acx:"#111315",bd:"#2d3238"}}};
const hx2=h=>{h=String(h||"").replace("#","");if(h.length===3)h=h.split("").map(c=>c+c).join("");return/^[0-9a-f]{6}$/i.test(h)?[0,2,4].map(i=>parseInt(h.slice(i,i+2),16)):null};
const rgb2=a=>"#"+a.map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,"0")).join("");
const lumi=a=>(0.299*a[0]+0.587*a[1]+0.114*a[2])/255,mixc=(a,b,t)=>a.map((v,i)=>v*(1-t)+b[i]*t);
function thEff(){const m=(S.th&&S.th.mode)||"auto";return m==="auto"?(window.matchMedia&&matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):m}
function thVars(){const t=S.th||{},eff=thEff(),v={},p=TP[t.preset];if(p)Object.assign(v,p[eff]);
 const bg=hx2(t.bg),ac=hx2(t.ac);
 if(bg){const L=lumi(bg),tx=L>.5?[27,27,31]:[241,241,244];v.bg=rgb2(bg);v.card=rgb2(L>.5?mixc(bg,[255,255,255],.65):mixc(bg,[255,255,255],.07));v.tx=rgb2(tx);v.mu=rgb2(mixc(tx,bg,.5));v.bd=rgb2(mixc(tx,bg,.14))}
 if(ac){v.ac=rgb2(ac);v.acx=lumi(ac)>.6?"#111111":"#ffffff";if(!bg&&!p){const bgc=hx2(getComputedStyle(document.documentElement).getPropertyValue("--bg"));if(bgc)v.bd=rgb2(mixc(ac,bgc,.82))}}
 return v}
function applyTheme(){try{const r=document.documentElement,t=S.th||{};["bg","card","tx","mu","ac","acx","bd"].forEach(k=>r.style.removeProperty("--"+k));
 if(t.mode==="light"||t.mode==="dark")r.setAttribute("data-theme",t.mode);else r.removeAttribute("data-theme");
 Object.entries(thVars()).forEach(([k,x])=>r.style.setProperty("--"+k,x))}catch(e){}}
function thSet(k,v){S.th=S.th||{};if(k==="preset"){S.th.preset=v;delete S.th.ac;delete S.th.bg}else if(k==="mode")S.th.mode=v;else S.th[k]=v;W("theme",S.th);applyTheme();save();render()}
function thReset(){S.th={mode:"auto",preset:"viola"};W("theme",S.th);applyTheme();save();render();toast("🎨 Colori ripristinati")}
function vTheme(){const t=S.th||{},eff=thEff(),base=(TP[t.preset]||{})[eff]||(eff==="dark"?{ac:"#a78bfa",bg:"#17121f"}:{ac:"#7c3aed",bg:"#f7f3ff"}),sw=(a,b)=>`<span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${a};border:1px solid rgba(0,0,0,.15)"></span><span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${b};border:1px solid rgba(0,0,0,.15);margin-left:-5px"></span>`;
 const all=[["viola","Viola",{ac:"#7c3aed",bg:"#f7f3ff"}],...Object.entries(TP).map(([k,p])=>[k,p.n,{ac:p.light.ac,bg:p.light.bg}])],md=(t.mode||"auto");
 return `<div class="card"><b>🎨 Colori dell’applicazione</b><div class="mu">Scegli un tema oppure personalizza i colori. Le scelte restano salvate su questo dispositivo e nel backup.</div>
 <div class="mu" style="margin:12px 0 4px">Aspetto</div><div style="display:flex;gap:6px;flex-wrap:wrap">${[["auto","🌓 Automatico"],["light","☀️ Chiaro"],["dark","🌙 Scuro"]].map(([k,n])=>`<button class="btn ${md===k?"":"g"}" style="padding:8px 14px" onclick="thSet('mode','${k}')">${n}</button>`).join("")}</div>
 <div class="mu" style="margin:12px 0 4px">Temi pronti</div><div style="display:flex;gap:6px;flex-wrap:wrap">${all.map(([k,n,c])=>`<button class="btn ${(t.preset||"viola")===k&&!t.ac&&!t.bg?"":"g"}" style="padding:8px 14px;display:flex;gap:8px;align-items:center" onclick="thSet('preset','${k}')">${sw(c.ac,c.bg)} ${n}</button>`).join("")}</div>
 <div class="mu" style="margin:12px 0 4px">Colori personalizzati</div>
 <div style="display:flex;gap:16px;flex-wrap:wrap;align-items:center"><label class="mu" style="display:flex;gap:8px;align-items:center">Colore principale <input type="color" style="width:56px;height:40px;padding:2px" value="${t.ac||base.ac}" onchange="thSet('ac',this.value)"></label><label class="mu" style="display:flex;gap:8px;align-items:center">Sfondo <input type="color" style="width:56px;height:40px;padding:2px" value="${t.bg||base.bg}" onchange="thSet('bg',this.value)"></label></div>
 <button class="btn g" style="margin-top:12px" onclick="thReset()">↩️ Ripristina i colori originali</button></div>
 <div class="card"><b>Anteprima</b><div class="mu">Così appaiono schede, testi e pulsanti.</div><div style="margin-top:8px"><button class="btn">Pulsante</button> <span class="bd">in scadenza</span> <span class="bd ok">ok</span></div></div>`}
const lsg=(k,d)=>{try{return localStorage.getItem(k)||d}catch(e){return d}},lss=(k,v)=>{try{localStorage.setItem(k,v)}catch(e){}};
const pNum=p=>{const m=String(p||"").replace(",",".").match(/\d+(?:\.\d+)?/);return m?+m[0]:null};
function sx(k,v){S["sx_"+k]=v;render();const e=$("sx_"+k);if(e){e.focus();try{e.setSelectionRange(v.length,v.length)}catch(x){}}}
const sxBox=(k,ph)=>`<input id="sx_${k}" type="search" placeholder="🔎 ${ph}" value="${esc(S["sx_"+k]||"")}" oninput="sx('${k}',this.value)" style="margin:8px 0">`;
const sxOk=(k,txt)=>{const q=nm(S["sx_"+k]||"");return !q||nm(txt).includes(q)};
function fcSet(k,v){lss(k,v);render()}
function drawThemePanel(){let p=$("thp");if(!p){p=document.createElement("div");p.id="thp";document.body.appendChild(p)}
 if(!S.thp){p.style.display="none";p.innerHTML="";return}
 p.style.cssText="position:fixed;inset:0;z-index:20;background:rgba(0,0,0,.5);overflow:auto;padding:calc(env(safe-area-inset-top,0px) + 14px) 14px 40px";
 p.innerHTML=`<div style="max-width:560px;margin:0 auto" onclick="event.stopPropagation()"><div class="row" style="margin-bottom:4px"><b style="color:#fff;font-size:18px">⚙️ Impostazioni</b><button class="btn" onclick="S.thp=false;render()">Chiudi ✕</button></div>${vTheme()}</div>`;
 p.onclick=()=>{S.thp=false;render()}}
const STOP=new Set("di da del della dei degli delle dello al alla allo ai agli alle il lo la i gli le un uno una e con in per a d q b qb".split(" "));
const QUAL=new Set("fresco fresca freschi fresche secco secca secchi intero intera scremato parzialmente tritato tritata grattugiato grattugiata fine fino grosso grossa bianco bianca nero nera extra vergine biologico bio tipo dolci torte tiepido tiepida tiepidi tiepide caldo calda caldi calde freddo fredda freddi fredde ghiacciato ghiacciata temperatura ambiente sciolto sciolta fuso fusa morbido morbida ammorbidito ammorbidita liquido liquida cubetti pezzi fette affettato affettata sbucciato sbucciata lavato lavata sgocciolato sgocciolata tagliato tagliata 00 0 1 2".split(" "));
const sk=t=>t.length>=4&&/[aeio]$/.test(t)?t.slice(0,-1):t;
const VAR=new Set(["velo","integrale","canna","cocco","soia","avena","mandorla","mandorle","vegetale","senza","lattosio","glutine","manitoba","mais","riso","farro","kamut","segale","ceci","castagne","farina"].map(sk));
const toks=(s,rec)=>{const x=nm(s);return x.normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\([^)]*\)/g," ").replace(/[^a-z0-9 ]/g," ").split(/\s+/).filter(t=>t&&!STOP.has(t)&&!(rec&&QUAL.has(t)&&!(/farin/.test(x)&&/^(0|00|1|2)$/.test(t)))).map(sk)};
const BS='style="padding:6px 12px;font-size:14px"';
const fD=d=>d?String(d).split("-").reverse().join("/"):"";
const okD=d=>typeof d==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(d)&&!isNaN(new Date(d));
function vGuida(){
 const sec=(t,s,rows)=>`<div class="card"><h2 style="margin-top:0">${t}</h2><div class="mu" style="margin-bottom:8px">${s}</div>${rows.map(([a,b])=>`<div style="padding:10px 0;border-top:1px solid var(--bd)"><b>${a}</b><div class="mu" style="margin-top:2px">${b}</div></div>`).join("")}</div>`;
 return `<div class="card"><h2 style="margin-top:0">👋 Benvenuto in Dispensa Smart</h2><div class="mu">Sai cosa hai in casa, cosa cucinare e cosa comprare: dispensa, ricette, spesa e volantini nello stesso posto, anche dal telefono.</div><div class="row" style="gap:8px;flex-wrap:wrap;margin-top:12px"><button class="btn" onclick="S.tab='add';render()">➕ Aggiungi la prima spesa</button><button class="btn g" onclick="S.tab='oggi';S.guide=true;render()">Guida di primo avvio</button></div></div>`
 +sec("Ogni giorno","Per decidere cosa cucinare.",[
 ["🥫 Dispensa","L’elenco di ciò che hai in casa, con quantità e scadenze. Tra le unità ci sono anche cucchiaio, mezzo cucchiaio e cucchiaino."],
 ["🍽️ Ricette","Ricette proposte dall’AI in base a ciò che hai, ricerca online e inserimento a mano o da link. Le preferite le salvi nel Ricettario e le raggruppi in raccolte."],
 ["📅 Piano della settimana","Genera i pasti dei giorni a venire. Scegli se usare solo ciò che hai in dispensa oppure partire dalle offerte dei volantini, con un budget minimo e massimo: gli ingredienti in offerta mostrano prezzo e scadenza. I piani passati restano nell’archivio."]])
 +sec("Quando fai la spesa","Per spendere meno e non dimenticare nulla.",[
 ["🛒 Lista della spesa","Aggiungi gli articoli e vedi il totale. Gli ingredienti che usi spesso hanno un pulsante carrello per metterli in lista con un tocco."],
 ["📍 Volantini e offerte","Carica il PDF o le foto del volantino: l’AI legge le offerte e le collega a ciò che ti serve. Con un tocco le aggiungi alla lista, con prezzo, negozio e giorni alla scadenza."],
 ["🧾 Scontrino","Fotografa lo scontrino: i prodotti finiscono in dispensa con quantità e scadenze stimate. Prima di salvare puoi correggere tutto."]])
 +sec("Per stare tranquilli","Se sbagli o cambi telefono non perdi niente.",[
 ["↩️ Annulla","Dopo una cancellazione compare il pulsante Annulla."],
 ["💾 Copie di sicurezza","Ogni giorno l’app salva una copia dei dati sul dispositivo e, se hai collegato GitHub, anche nel tuo repository. Le trovi in “Dispensa”."],
 ["☁️ Sincronizzazione","Facoltativa: con GitHub puoi ritrovare gli stessi dati su telefono e computer."],
 ["⚙️ Colori e impostazioni","Con la rotella in alto a destra, in qualsiasi schermata, scegli tema chiaro o scuro e i colori che preferisci."],
 ["📲 Come app","Dal browser scegli “Aggiungi a schermata Home”: l’app si apre a tutto schermo."]])
 +`<div class="card"><b>🔒 I tuoi dati restano tuoi</b><div class="mu" style="margin-top:4px">Dispensa, ricette e liste sono salvate su questo dispositivo e non sono visibili ad altre persone. Le immagini di volantini e scontrini vengono inviate al servizio AI solo per essere lette.</div></div>`}
function welcomeHtml(){if(!window.setKey)return"";const done=lsg("welcomed","");if(done&&!S.guide)return"";let px=false;try{px=!!JSON.parse(localStorage.getItem("aproxy")||"null")}catch(e){}
 const ai=px?`<div class="mu" style="margin-top:4px">✅ L’accesso all’AI è già attivo su questo dispositivo: non devi creare nessuna chiave.</div>`:`<div class="mu" style="margin-top:4px">Per ricette, volantini e piano serve una chiave gratuita di Groq:<br>1. Apri <a href="https://console.groq.com/keys" target="_blank" rel="noopener">console.groq.com/keys</a> e accedi (con Google va bene).<br>2. Tocca “Create API Key”, dai un nome e copia la chiave (inizia con <b>gsk_</b>).<br>3. Torna qui, tocca <b>🔑 Chiave AI</b> in alto e incollala.<br>La chiave resta solo su questo dispositivo e non va condivisa. Se qualcuno ti ha mandato un link di accesso, aprilo e basta.</div>`;
 return `<div class="card"><div class="row"><b>👋 Benvenuto in Dispensa Smart</b><button class="x" onclick="wDone()" aria-label="Chiudi">✕</button></div>
 <div class="mu">Quattro passi per partire:</div>
 <div style="margin-top:10px"><b>1. 📲 Mettila sul telefono</b><div class="mu" style="margin-top:4px">iPhone: apri il sito con Safari, tocca Condividi e poi “Aggiungi alla schermata Home”.<br>Android: apri il sito con Chrome, tocca ⋮ e poi “Installa app” o “Aggiungi a schermata Home”.</div></div>
 <div style="margin-top:10px"><b>2. 🔑 Attiva l’AI</b>${ai}</div>
 <div style="margin-top:10px"><b>3. 🥫 Riempi la dispensa</b><div class="mu" style="margin-top:4px">In “Aggiungi spesa” inserisci i prodotti uno a uno, oppure scansiona uno scontrino. Poi vai su Ricette per farti suggerire cosa cucinare.</div></div>
 <div style="margin-top:10px"><b>4. 💾 I tuoi dati</b><div class="mu" style="margin-top:4px">Restano su questo dispositivo. In “Dispensa” trovi le copie di sicurezza automatiche e “Salva file JSON” per un backup.</div></div>
 <button class="btn" style="margin-top:14px" onclick="wDone()">Ho capito, iniziamo</button></div>`}
function wDone(){lss("welcomed","1");S.guide=false;render()}
const th=r=>`<span class="th">${S.ph[r.title]?`<img src="${esc(S.ph[r.title])}" alt="">`:esc(r.emoji||"🍽️")}</span>`;
const setSy=m=>{const e=$("sy");if(e)e.textContent=m==="on"?"☁️ sincronizzato":"📴 solo su questo dispositivo"};
const hid=t=>{let h=5381;for(const c of t)h=((h*33)^c.charCodeAt(0))>>>0;return "ph_"+h.toString(36)};
const cache=()=>{W("items",S.items);W("lib",S.lib);W("hist",S.hist);W("mine",S.mine);W("shop",S.shop);W("ph",S.ph);W("coll",S.coll);W("cdel",S.cdel);W("fly",S.fly);W("plan",S.plan);W("pold",S.pold)};
function err(){if(!warned++)toast("Sincronizzazione non riuscita: i dati restano su questo dispositivo.")}
