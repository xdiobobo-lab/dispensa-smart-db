/* Dispensa Smart - dispensa.js */
const SPEC=[[/sugo|ragù|ragu|passata|pelati|polpa di pomod|salsa|pesto|maionese|ketchup|senape|concentrato|\bdado|brodo|aceto|olio|\bsale\b|\bpepe\b|spezi|origano|curry|paprika|cannella|lievito|zafferano|tahin|capperi|olive|sottaceti|sottolio|bicarbonato|vaniglia|moscata/,"Condimenti e oli"],[/panettone|pandoro|colomba|merendin|biscott|torta|crostata|gelato|budino|nutella|cioccolat|caramell|patatine|noci|nocciol|mandorl|pistacch|arachid|frutta secca/,"Dolci e snack"],[/succo|spremuta|latte di (mandorla|soia|avena|riso)|bevanda (di|vegetale)/,"Bevande"],[/pasta (sfoglia|brisè|brisee|frolla)|pizza/,"Cereali e derivati"]];
const _mig=(()=>{let n=0;S.items.forEach(i=>{if(i&&i.cat==="Altro"){const g=guess(i.name);if(g!=="Altro"){i.cat=g;n++}}});if(n)W("items",S.items);return n})();
function toShop(r,all){window._sr=r;let a=0,s=0;(r.ingredients||[]).forEach(g=>{const it=all?null:matchIt(g),need=(+g.amount||0)-(it?it.q:0);if(it&&need<=0){s++;return}
 const am=Math.round(Math.max(need,0)),ex=S.shop.find(x=>!x.done&&nm(x.name)===nm(g.name)&&x.unit===g.unit);
 if(ex)ex.amount=(+ex.amount||0)+am;else S.shop.push({id:"s"+Date.now()+Math.random().toString(36).slice(2,6),name:g.name,amount:am,unit:g.unit||"",done:false,from:r.title});a++});
 save();const q2=$("q2"),qv=q2&&q2.value;render();if(qv!=null&&$("q2"))$("q2").value=qv;
 toast(a?`🛒 ${a} ingredient${a===1?"e aggiunto":"i aggiunti"} alla lista`+(s?`<br>${s} già in dispensa`:"")+`<br><a href="#" onclick="S.tab='lista';render();return false" style="color:inherit;font-weight:700">Vai alla lista →</a>`:`Hai già tutti gli ingredienti in dispensa.<br><a href="#" onclick="toShop(window._sr,true);return false" style="color:inherit;font-weight:700">Aggiungi comunque alla lista</a>`)}
function shopOne(i){const r=cr(),g=r.ingredients[i],a=avail(g),have=a.it&&a.it.u===g.unit?a.it.q:0,need=Math.round(Math.max((+g.amount||0)-have,0));
 const ex=S.shop.find(x=>!x.done&&nm(x.name)===nm(g.name)&&x.unit===g.unit);
 if(ex)ex.amount=(+ex.amount||0)+need;else S.shop.push({id:"s"+Date.now()+Math.random().toString(36).slice(2,6),name:g.name,amount:need,unit:g.unit||"",done:false,from:r.title});
 save();render();toast(`🛒 ${esc(g.name)} aggiunto alla lista<br><a href="#" onclick="S.tab='lista';render();return false" style="color:inherit;font-weight:700">Vai alla lista →</a>`)}
function shopTot(){const todo=S.shop.filter(x=>!x.done);let tot=0,np=0;const st={};
 todo.forEach(x=>{let p=pNum(x.price),store=x.store||"";if(p==null){const of=offerFor(x.name);if(of&&of.pr!=null){p=of.pr;store=store||of.f.store||""}}
  if(p==null){np++;return}tot+=p;st[store||"Altro"]=(st[store||"Altro"]||0)+p});
 return{n:todo.length,done:S.shop.length-todo.length,tot:Math.round(tot*100)/100,np,st}}
function shopSumHtml(){if(!S.shop.length)return"";const t=shopTot(),stores=Object.entries(t.st);
 return `<div class="card"><div class="row"><b>🧾 Da comprare: ${t.n} articol${t.n===1?"o":"i"}</b>${t.done?`<span class="mu">${t.done} già spuntat${t.done===1?"o":"i"}</span>`:""}</div>${t.tot>0?`<div style="margin-top:6px"><span class="bd ok" style="font-size:14px">Totale stimato: ${eur(t.tot)}</span></div>${stores.length>1?`<div class="mu" style="margin-top:6px">${stores.map(([n,v])=>esc(n)+": "+eur(v)).join(" · ")}</div>`:""}<div class="mu" style="margin-top:4px">Prezzo di una confezione per articolo${t.np?`; ${t.np} senza prezzo non inclus${t.np===1?"o":"i"}`:""}.</div>`:`<div class="mu" style="margin-top:6px">Nessun prezzo disponibile: aggiungi articoli dalle offerte dei volantini per vedere il totale.</div>`}</div>`}
function vShop(){
 const dn=S.shop.filter(x=>x.done&&sxOk("shop",x.name)),td=S.shop.filter(x=>!x.done&&sxOk("shop",x.name));
 let h=`<div class="card"><b>🛒 Cosa devi comprare?</b><div class="row" style="margin-top:8px"><input id="sn" placeholder="Scrivi un prodotto (es. Latte)" onkeydown="if(event.key==='Enter')addShop()"><button class="btn" onclick="addShop()" aria-label="Aggiungi alla lista">＋</button></div></div>`+shopSumHtml();
 if(!S.shop.length)return h+`<div class="card" style="text-align:center"><div style="font-size:34px">🧺</div><b>La lista è vuota</b><div class="mu" style="margin-top:4px">Scrivi qui sopra cosa ti serve, oppure scegli tra le offerte dei volantini o aggiungi gli ingredienti di una ricetta.</div><div class="row" style="gap:8px;flex-wrap:wrap;justify-content:center;margin-top:12px"><button class="btn" onclick="S.tab='negozi';render()">🏷️ Guarda le offerte</button><button class="btn g" onclick="S.tab='ricette';render()">🍽️ Scegli una ricetta</button></div></div>`;
 h+=S.shop.length>=5?sxBox("shop","Cerca nella lista…"):"";
 const hasSt=td.some(x=>x.store),line=x=>{const of=!x.price?offerFor(x.name):null;
  return `<div class="card row" style="padding:14px 18px"><label style="display:flex;gap:12px;align-items:center;flex:1;cursor:pointer;min-width:0"><input type="checkbox" style="width:26px;height:26px;flex:none" ${x.done?"checked":""} onchange="tick('${x.id}')" aria-label="Segna come comprato"><span style="min-width:0;${x.done?"text-decoration:line-through;opacity:.55":""}">${emo(x.name)} <b>${esc(x.name)}</b>${x.amount?" · "+fmt(x.amount,x.unit):""}${x.price?` <span class="bd" style="font-size:13px">${esc(x.price)}</span>`:""}${x.until?` <span class="bd ${x.until<=addDays(2)?"":"ok"}">⏳ ${untilTxt(x.until)}</span>`:""}${x.from?`<div class="mu">${/^Offerta/.test(x.from)?"🏷️ ":"per: "}${esc(x.from)}</div>`:""}${of&&!x.done?`<div class="mu" style="margin-top:4px">🏷️ In offerta${of.f.store?" da <b>"+esc(of.f.store)+"</b>":""}: <b>${esc(of.o.price||of.o.offer)}</b>${of.to?" · "+untilTxt(of.to):""} <a href="#" onclick="useOffer('${x.id}');return false" style="font-weight:700">Usa questa offerta</a></div>`:""}</span></label><button class="x" onclick="rmShop('${x.id}')" aria-label="Elimina">✕</button></div>`};
 h+=`<h2 style="font-size:17px;margin-bottom:0">Da comprare (${td.length})</h2><div class="mu">Tocca il quadratino quando metti un prodotto nel carrello: va in dispensa, e con ✏️ potrai correggere quantità e scadenza.</div>`;
 if(td.length){const so=td.slice().sort((a,b)=>(a.store||"zz").localeCompare(b.store||"zz")||nm(a.name).localeCompare(nm(b.name)));let last=null;
  h+=so.map(x=>{let hd="";if(hasSt&&(x.store||"")!==last){last=x.store||"";hd=`<div style="margin:14px 0 0;font-weight:700">${last?"🏪 "+esc(last):"❔ Senza negozio"}</div>`}return hd+line(x)}).join("")}
 else h+=`<div class="card" style="text-align:center">🎉 Hai comprato tutto!</div>`;
 if(dn.length)h+=`<button class="btn g" style="width:100%;margin-top:14px;text-align:left" onclick="S.sdn=!S.sdn;render()">${S.sdn?"▾":"▸"} ✅ Già comprati (${dn.length})</button>`+(S.sdn||S.sx_shop?dn.map(line).join("")+`<button class="btn g" onclick="S.shop=S.shop.filter(x=>!x.done);save();render()">Rimuovi i comprati dalla lista</button>`:"");
 return h}
function addShop(){const n=$("sn").value.trim();if(!n)return;S.shop.push({id:"s"+Date.now(),name:n,amount:0,unit:"",done:false,from:""});save();render();$("sn").focus()}
const NOEXP=/zucchero|\bsale\b|miele|aceto/i,EXD=[[/pane|pizza/i,3],[/latte|panna/i,7],[/mozzarella|ricotta/i,5],[/yogurt/i,14],[/uova|uovo/i,21]],CD={"Cereali e derivati":180,"Latticini e uova":10,"Carne e pesce":4,"Frutta e verdura":6,"Legumi":365,"Condimenti e oli":240,"Dolci e snack":120,"Bevande":120,"Altro":30};
function tick(id){const x=S.shop.find(s=>s.id===id);if(!x)return;
 if(x.done){x.done=false;save();return render()}
 const u=x.unit||"pz",est=!(+x.amount>0),q=est?(u==="pz"?1:500):+x.amount,cat=guess(x.name),o=EXD.find(([re])=>re.test(x.name)),exp=NOEXP.test(x.name)?"":addDays(o?o[1]:CD[cat]||30);
 const ex=S.items.find(i=>i.u===u&&nm(i.name)===nm(x.name));let pid,merged=null;
 if(ex){merged={q:ex.q,exp:ex.exp};ex.q+=q;ex.exp=!ex.exp||!exp?"":(ex.exp>=today()&&ex.exp<exp?ex.exp:exp);pid=ex.id}
 else{pid="p"+Date.now()+Math.random().toString(36).slice(2,5);S.items.push({id:pid,name:x.name,cat,q,u,exp})}
 S.shop=S.shop.filter(s=>s.id!==id);S.undo={x:{...x},pid,merged};const L0=(LOCS.find(l=>l[0]===locOf(S.items.find(i=>i.id===pid)))||LOCS[0])[1];save();render();
 toast(`✅ ${esc(x.name)} → ${L0} (${fmt(q,u)}, ${exp?"scade "+exp.split("-").reverse().join("/"):"senza scadenza"})${est?"<br>Quantità stimata":""}<br><a href="#" onclick="undoTick();return false" style="color:inherit;font-weight:700">Annulla</a> · <a href="#" onclick="S.tab='dispensa';S.ed='${pid}';render();return false" style="color:inherit;font-weight:700">Modifica</a>`)}
function undoTick(){const u=S.undo;if(!u)return;if(u.merged){const it=S.items.find(i=>i.id===u.pid);if(it){it.q=u.merged.q;it.exp=u.merged.exp}}else S.items=S.items.filter(i=>i.id!==u.pid);S.shop.push(u.x);S.undo=null;save();render();toast("Acquisto annullato.")}
function saveEd(id){const it=S.items.find(i=>i.id===id);if(it){const e=$("ed").value,q=parseFloat($("eq").value);if($("en").checked)it.exp="";else if(e)it.exp=e;if(q>0)it.q=q}S.ed=null;save();render()}
function rmShop(id){const i=S.shop.findIndex(s=>s.id===id);if(i<0)return;const x=S.shop[i];S.shop.splice(i,1);save();render();undoable("🗑️ Articolo tolto dalla lista.",{x,i},u=>{S.shop.splice(Math.min(u.i,S.shop.length),0,u.x)})}
const advOn=()=>lsg("adv","")==="1";
function advTog(on){lss("adv",on?"1":"0");render()}
const RCP_CATS=()=>CATS.join(", ");
async function rcpScan(inp){const fs=[...(inp.files||[])].slice(0,6);if(!fs.length)return;
 S.rcp={busy:1,msg:"Preparo le immagini…",err:"",items:null};render();
 const say=m=>{S.rcp.msg=m;const e=$("rcm");if(e)e.textContent="⏳ "+m},wait=ms=>new Promise(x=>setTimeout(x,ms));
 try{const pages=[];
  for(const f of fs){if(/pdf$/i.test(f.type)||/\.pdf$/i.test(f.name)){const lib=await loadPdf(),pdf=await lib.getDocument({data:await f.arrayBuffer()}).promise;for(let p=1;p<=Math.min(pdf.numPages,6);p++)pages.push(async()=>[await pageJpg(pdf,p)])}else pages.push(()=>fileStrips(f))}
  const all=[];for(const g of pages){say("Preparo le immagini…");all.push(...await g())}
  if(all.length>12)all.length=12;
  const P=`Oggi è ${today()}. Queste sono le immagini (in ordine, dall'alto verso il basso) di uno scontrino della spesa italiano: le parti vicine possono ripetere qualche riga ai bordi. Il tuo compito è TRASCRIVERE, non indovinare. Estrai SOLO i prodotti alimentari e per la casa che finiscono in dispensa, frigo o congelatore; ignora sconti, totale, IVA, resto, punti, sacchetti. REGOLE: 1) NON inventare prodotti: ogni voce deve corrispondere a una riga che leggi davvero. 2) Se una riga è un'abbreviazione che non capisci con certezza, mantieni il testo com'è scritto (sistema solo le abbreviazioni ovvie) e metti conf "bassa". 3) Se una riga è illeggibile, saltala. 4) Non aggiungere prodotti "che di solito si comprano". 5) Se la stessa riga compare identica due volte perché le immagini si sovrappongono, riportala UNA volta; se invece sono due acquisti distinti (quantità 2) usa qty 2. Per ogni prodotto indica: raw (la riga come è stampata, max 40 caratteri), name (nome generico in italiano, senza marca, abbreviazioni sciolte, es. "Latte parzialmente scremato", "Spaghetti"), conf ("alta" se sei sicuro, "bassa" se hai dubbi sul prodotto), qty (quantità TOTALE acquistata come numero: 2 x 500 g → 1000; prodotti a peso: il peso; se manca il numero di pezzi), unit ("g", "ml" o "pz": converti kg in g e l in ml), price (prezzo della riga in euro come numero, o null), cat (UNA tra: ${RCP_CATS()}), days (giorni di conservazione tipici dall'acquisto, numero; null se non scade come sale e zucchero). Indica anche store, date (AAAA-MM-GG) e total (euro) se leggibili, altrimenti null. Rispondi SOLO con JSON: {"store":null,"date":null,"total":null,"items":[{"raw":"","name":"","conf":"alta","qty":1,"unit":"pz","price":null,"cat":"Altro","days":7}]}`;
  const items=[];let store=null,date=null,total=null,fail=0,lastErr=null;const BS_=2,nb=Math.ceil(all.length/BS_);
  for(let bi=0;bi<nb;bi++){say(`Leggo lo scontrino… ${bi+1} di ${nb}`);if(bi)await wait(8000);
   let r=null;
   try{const imgs=all.slice(bi*BS_,bi*BS_+BS_);
    for(let t=0;t<3&&!r;t++){try{r=await claude.vision(P,imgs)}catch(er){lastErr=er;if(/Limite/.test(er.message||"")&&t<2){say(`Limite dell’AI raggiunto: aspetto 30 secondi e riprovo…`);await wait(30000)}else break}}}
   catch(er){lastErr=er}
   if(!r){fail++;continue}
   const o=Array.isArray(r)?{items:r}:(r||{});store=store||o.store||null;date=date||(okD(o.date)?o.date:null);total=total||(+o.total>0?+o.total:null);
   const prev=items.slice(-5).map(x=>nm(x.raw||x.name)+"|"+(x.price||""));
   (o.items||[]).forEach(x=>{if(!x||!x.name)return;const name=String(x.name).trim().slice(0,60);if(!name)return;const raw=String(x.raw||"").trim().slice(0,40),unit=["g","ml","pz"].includes(x.unit)?x.unit:"pz",qty=+x.qty>0?+x.qty:1,cat=CATS.includes(x.cat)?x.cat:guess(name);
    const pr=+x.price>0?+x.price:null;if(bi&&pr&&prev.includes(nm(raw||name)+"|"+pr))return;
    const low=x.conf==="bassa";
    const nex=NOEXP.test(name)||x.days===null||x.days===0;const dd=!nex&&+x.days>0?Math.min(+x.days,730):((EXD.find(([re])=>re.test(name))||[0,CD[cat]||30])[1]);
    items.push({name,raw,low,qty:Math.round(qty*100)/100,unit,cat,price:pr,exp:nex?"":addDays(dd),nex,sel:!low})})}
  if(!items.length){if(lastErr)throw lastErr;throw new Error("Non ho trovato prodotti nello scontrino: prova con una foto più nitida e dritta.")}
  S.rcp={items,store,date,total,fail,nb,nlow:items.filter(x=>x.low).length}}
 catch(e){S.rcp={err:aiErr(e),items:null}}render()}
const PRODP=`Queste sono foto di un prodotto alimentare o per la casa, scattate per metterlo in dispensa: possono mostrare lo stesso prodotto da lati diversi (fronte, etichetta, data di scadenza). Unisci le informazioni in UN solo prodotto, tranne se le foto mostrano chiaramente prodotti diversi (in quel caso uno per prodotto). Leggi la DATA DI SCADENZA stampata («da consumarsi entro», «scad.», «TMC», «best before», «da consumarsi preferibilmente entro»): scrivila in exp come AAAA-MM-GG (gg/mm/aa → 20aa; se c'è solo mese e anno usa l'ultimo giorno del mese; se non è leggibile o non c'è metti null). Per ogni prodotto indica: name (nome generico in italiano, senza marca, es. "Yogurt greco bianco", "Passata di pomodoro"), qty (peso o volume netto della confezione come numero, es. 500; se non è leggibile usa 1), unit ("g", "ml" o "pz": converti kg in g e l in ml; se non leggi il peso usa "pz"), cat (UNA tra: ${RCP_CATS()}), exp (data oppure null), days (se exp è null: giorni di conservazione tipici dall'acquisto, altrimenti null). Non inventare: se non sei sicuro del prodotto scrivi il nome più semplice che vedi. Rispondi SOLO con JSON: {"items":[{"name":"","qty":1,"unit":"pz","cat":"Altro","exp":null,"days":7}]}`;
async function prodScan(inp){const fs=[...(inp.files||[])].slice(0,4);inp.value="";if(!fs.length)return;
 S.rcp={busy:1,msg:"Leggo il prodotto…",err:"",items:null,kind:"prod"};render();
 const wait=ms=>new Promise(x=>setTimeout(x,ms));
 try{const imgs=[];for(const f of fs)imgs.push(await fileJpg(f));
  let r=null,lastErr=null;
  for(let t=0;t<3&&!r;t++){try{r=await claude.vision(PRODP,imgs)}catch(er){lastErr=er;if(/Limite/.test(er.message||"")&&t<2){S.rcp.msg="Limite dell’AI raggiunto: aspetto 30 secondi e riprovo…";render();await wait(30000)}else break}}
  if(!r)throw lastErr||new Error("Non riesco a leggere la foto: riprova.");
  const o=Array.isArray(r)?{items:r}:(r||{}),items=[];
  (o.items||[]).forEach(x=>{if(!x||!x.name)return;const name=String(x.name).trim().slice(0,60);if(!name)return;const unit=["g","ml","pz"].includes(x.unit)?x.unit:"pz",qty=+x.qty>0?+x.qty:1,cat=CATS.includes(x.cat)?x.cat:guess(name);
   const rd=okD(x.exp)&&String(x.exp)>"2000-01-01"&&String(x.exp)<"2100-01-01"?String(x.exp):"";
   const nex=!rd&&(NOEXP.test(name)||x.days===null||x.days===0),dd=!rd&&!nex&&+x.days>0?Math.min(+x.days,730):((EXD.find(([re])=>re.test(name))||[0,CD[cat]||30])[1]);
   items.push({name,qty:Math.round(qty*100)/100,unit,cat,price:null,exp:rd||(nex?"":addDays(dd)),nex,est:!rd&&!nex,sel:true})});
  if(!items.length)throw new Error("Non ho riconosciuto il prodotto: prova con una foto più nitida e ravvicinata.");
  S.rcp={items,store:null,date:null,total:null,fail:0,nb:1,kind:"prod"}}
 catch(e){S.rcp={err:aiErr(e),items:null,kind:"prod"}}render()}
function rcpSet(i,k,v){const x=S.rcp&&S.rcp.items&&S.rcp.items[i];if(!x)return;if(k==="qty")x.qty=+v>0?+v:0;else if(k==="frz"){x.frz=!!v;if(v){x.exp0=x.exp;x.nex0=x.nex;if(!x.nex)x.exp=addDays(frzDays(x));x.est=false}else{x.exp=x.exp0||x.exp;x.nex=!!x.nex0}}else if(k==="nex"){x.nex=!!v;x.est=false;if(v)x.exp="";else if(!x.exp)x.exp=addDays(CD[x.cat]||30)}else{x[k]=v;if(k==="exp")x.est=false}}
function rcpTog(i){const x=S.rcp.items[i];x.sel=!x.sel;render()}
function rcpAll(f){S.rcp.items.forEach(x=>x.sel=f);render()}
function rcpCancel(){S.rcp=null;render()}
function rcpAdd(){const R=S.rcp;if(!R||!R.items)return;let n=0,m=0,rm=0;const snap={items:JSON.parse(JSON.stringify(S.items)),shop:JSON.parse(JSON.stringify(S.shop))};
 R.items.forEach(x=>{if(!x.sel||!String(x.name).trim()||!(+x.qty>0))return;const name=String(x.name).trim(),q=+x.qty,exp=x.nex?"":(x.exp||"");
  const ex=S.items.find(i=>nm(i.name)===nm(name)&&i.u===x.unit&&(!!x.frz===(locOf(i)==="congelatore")));
  if(ex){ex.q=Math.round((+ex.q+q)*100)/100;if(exp&&(!ex.exp||exp<ex.exp))ex.exp=exp;m++}
  else{S.items.push({id:"p"+Date.now()+Math.random().toString(36).slice(2,6),name,cat:x.cat,q,u:x.unit,exp,loc:x.frz?"congelatore":""});n++}
  const tk=toks(name,1);S.shop=S.shop.filter(s=>{if(s.done)return true;const st=toks(s.name,1),hit=st.length&&tk.length&&(st.every(t=>tk.includes(t))||tk.every(t=>st.includes(t)));if(hit)rm++;return !hit})});
 if(!n&&!m)return toast("Seleziona almeno un prodotto con una quantità.");
 S.rcp=null;save();render();undoable(`${R.kind==="prod"?"📷":"🧾"} ${n} nuov${n===1?"o prodotto":"i prodotti"} in dispensa${m?`, ${m} aggiornat${m===1?"o":"i"}`:""}${rm?`, ${rm} tolt${rm===1?"o":"i"} dalla lista della spesa`:""}.`,snap,u=>{S.items=u.items;S.shop=u.shop})}
function rcpHtml(){if(!(window.claude&&claude.vision))return"";const R=S.rcp,fi=`<input type="file" accept="image/*,.pdf,application/pdf" multiple hidden onchange="rcpScan(this)">`;
 const inp="padding:8px;border:1px solid var(--bd);border-radius:10px;background:var(--card);color:var(--tx);font:inherit";
 if(R&&R.busy)return `<div class="card"><b>${R.kind==="prod"?"📷 Prodotto":"🧾 Scontrino"}</b><div class="mu" id="rcm" style="margin-top:8px">⏳ ${esc(R.msg||"Leggo lo scontrino…")}</div></div>`;
 if(R&&R.items){const sel=R.items.filter(x=>x.sel).length;
  return `<div class="card"><b>${R.kind==="prod"?"📷 Controlla il prodotto":"🧾 Controlla lo scontrino"}</b><div class="mu">${R.kind==="prod"?"Controlla nome, quantità e scadenza letti dalla foto, correggi se serve e conferma.":""}${R.store?esc(R.store)+" · ":""}${R.date?fD(R.date)+" · ":""}${R.total?"totale € "+String(R.total.toFixed(2)).replace(".",",")+" · ":""}${R.kind==='prod'?'':R.items.length+' prodotti letti. Correggi nomi, quantità e scadenze, togli la spunta a ciò che non vuoi aggiungere.'}${R.fail?`<br><span style="color:var(--wa)">⚠️ ${R.fail} parte${R.fail>1?"i":""} su ${R.nb} non lett${R.fail>1?"e":"a"}: lo scontrino potrebbe essere incompleto.</span>`:""}${R.nlow?`<br><span style="color:var(--wa)">⚠️ ${R.nlow} righe poco chiare sono deselezionate: controllale prima di aggiungerle.</span>`:""}</div>
  <div style="display:flex;gap:6px;margin-top:8px"><button class="btn g" ${BS} onclick="rcpAll(true)">Seleziona tutti</button><button class="btn g" ${BS} onclick="rcpAll(false)">Nessuno</button></div>
  ${R.items.map((x,i)=>`<div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--bd);${x.sel?"":"opacity:.5"}"><div style="display:flex;gap:8px;align-items:center"><input type="checkbox" style="width:22px;height:22px;flex:none" ${x.sel?"checked":""} onchange="rcpTog(${i})"><span>${emo(x.name,x.cat)}</span><input value="${esc(x.name)}" style="flex:1;${inp}" oninput="rcpSet(${i},'name',this.value)">${x.price?`<span class="bd ok">€ ${String(x.price.toFixed(2)).replace(".",",")}</span>`:""}</div>
  <div style="display:flex;gap:6px;align-items:center;margin-top:6px;flex-wrap:wrap"><input type="number" min="0" step="any" value="${x.qty}" style="width:90px;${inp}" oninput="rcpSet(${i},'qty',this.value)"><select style="width:auto;${inp}" onchange="rcpSet(${i},'unit',this.value)">${["g","ml","pz"].map(u=>`<option ${x.unit===u?"selected":""}>${u}</option>`).join("")}</select><input type="date" value="${x.exp||""}" ${x.nex?"disabled":""} style="width:auto;${inp}" onchange="rcpSet(${i},'exp',this.value)"><label class="mu" style="display:flex;gap:4px;align-items:center;white-space:nowrap"><input type="checkbox" style="width:auto" ${x.nex?"checked":""} onchange="rcpSet(${i},'nex',this.checked);render()"> senza scad.</label>${R.kind==="prod"?"":`<label class="mu" style="display:flex;gap:4px;align-items:center;white-space:nowrap"><input type="checkbox" style="width:auto" ${x.frz?"checked":""} onchange="rcpSet(${i},'frz',this.checked);render()"> ❄️ congela</label>`}${x.raw?`<div class="mu" style="width:100%">Sullo scontrino: «${esc(x.raw)}»</div>`:""}${x.low?`<div class="mu" style="width:100%;color:var(--wa)">⚠️ Riga poco chiara: controlla il nome (è deselezionata finché non la spunti).</div>`:""}${x.est?`<div class="mu" style="width:100%;color:var(--wa)">⚠️ Scadenza non letta: è una stima, controllala.</div>`:""}</div></div>`).join("")}
  <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap"><button class="btn" onclick="rcpAdd()">Aggiungi ${sel} prodott${sel===1?"o":"i"} alla dispensa</button><button class="btn g" onclick="rcpCancel()">Annulla</button></div><div class="mu" style="margin-top:6px">Se un prodotto è già in dispensa la quantità viene sommata; gli articoli corrispondenti vengono tolti dalla lista della spesa.</div></div>`}
 return `<div class="card"><b>🧾 Scansiona lo scontrino</b><div class="mu">Fotografa lo scontrino (o carica un’immagine o un PDF): l’AI legge i prodotti e li aggiunge alla dispensa con quantità e scadenze stimate. Prima di salvare puoi correggere tutto.</div>${R&&R.err?`<div class="al" style="margin-top:8px">${esc(R.err)}</div>`:""}<label class="btn" style="display:block;text-align:center;margin-top:10px;cursor:pointer">📷 Scatta o carica lo scontrino${fi}</label><div class="mu" style="margin-top:6px">Foto nitida, dritta e con tutto lo scontrino visibile. Per scontrini lunghi puoi caricare più foto (fino a 6).</div>
 <div style="margin-top:16px;padding-top:14px;border-top:1px solid var(--bd)"><b>📷 Aggiungi un prodotto con una foto</b><div class="mu">Fotografa il prodotto inquadrando anche la data di scadenza (puoi aggiungere una seconda foto della data): l’AI legge nome, quantità e scadenza e tu confermi.</div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px"><label class="btn" style="cursor:pointer">📷 Scatta una foto<input type="file" accept="image/*" capture="environment" hidden onchange="prodScan(this)"></label><label class="btn g" style="cursor:pointer">🖼️ Carica foto<input type="file" accept="image/*" multiple hidden onchange="prodScan(this)"></label></div></div></div>`}
const vNum=v=>String(v).split(".").reduce((a,x)=>a*1000+(+x||0),0);
const NOVT={Aggiunto:"🆕 Novità",Cambiato:"✏️ Cambiato",Migliorato:"✨ Migliorato",Corretto:"🔧 Sistemato",Rimosso:"🗑️ Rimosso"};
function novHtml(l){return l.map(e=>`<div style="margin:12px 0;padding-top:10px;border-top:1px solid var(--bd)"><b>Versione ${esc(e.v)}</b> <span class="mu">${e.d?e.d.split("-").reverse().join("/"):""}</span>`+e.s.map(([t,a])=>`<div style="margin-top:6px"><b>${NOVT[t]||esc(t)}</b><ul style="margin:4px 0 0 18px;padding:0">${a.map(x=>`<li style="margin:3px 0">${esc(x).replace(/\*\*(.+?)\*\*/g,"<b>$1</b>")}</li>`).join("")}</ul></div>`).join("")+`</div>`).join("")}
function novClose(){const o=$("nvo");if(o)o.remove();lss("seenv",APP_VER)}
function novShow(l,tit){if(!l||!l.length||$("nvo"))return;const o=document.createElement("div");o.id="nvo";o.setAttribute("role","dialog");o.setAttribute("aria-label","Novità dell’app");
 o.style.cssText="position:fixed;inset:0;z-index:70;background:rgba(0,0,0,.55);display:flex;align-items:center;justify-content:center;padding:16px";
 o.innerHTML=`<div style="background:var(--card);color:var(--tx);border:2px solid var(--bd);border-radius:24px;max-width:520px;width:100%;max-height:85vh;display:flex;flex-direction:column;box-shadow:0 10px 40px rgba(0,0,0,.4)"><div style="padding:18px 20px 4px"><b style="font-size:20px">${tit||"🎉 Dispensa Smart si è aggiornata"}</b><div class="mu">Ecco cosa è cambiato:</div></div><div style="overflow:auto;padding:0 20px;flex:1">${novHtml(l)}</div><div style="padding:12px 20px 16px"><button class="btn" style="width:100%" onclick="novClose()">Ho capito</button></div></div>`;
 document.body.appendChild(o)}
function novAll(){S.thp=false;render();novShow((window.NOVITA||[]).slice(0,8),"📣 Novità dell’app")}
function novBoot(){try{if(!window.NOVITA||!NOVITA.length)return;const seen=lsg("seenv","");
 if(seen===APP_VER)return;
 if(!seen){if(S.items.length||S.mine.length||S.shop.length)return novShow(NOVITA.slice(0,1));lss("seenv",APP_VER);return}
 const l=NOVITA.filter(e=>vNum(e.v)>vNum(seen)).slice(0,6);if(l.length)novShow(l);else lss("seenv",APP_VER)}catch(e){}}
const DEMO=[["Latte","Latticini e uova",1000,"ml",1,"frigo"],["Yogurt bianco","Latticini e uova",250,"g",3,"frigo"],["Uova","Latticini e uova",6,"pz",14,"frigo"],["Mozzarella","Latticini e uova",250,"g",2,"frigo"],["Burro","Latticini e uova",200,"g",30,"frigo"],["Petto di pollo","Carne e pesce",500,"g",2,"frigo"],["Pasta penne","Cereali e derivati",500,"g",300,""],["Riso","Cereali e derivati",1000,"g",400,""],["Pomodori","Frutta e verdura",400,"g",4,"frigo"],["Zucchine","Frutta e verdura",300,"g",5,"frigo"],["Cipolla","Frutta e verdura",2,"pz",20,""],["Passata di pomodoro","Condimenti e oli",700,"g",400,""],["Parmigiano","Latticini e uova",150,"g",60,"frigo"],["Olio extravergine","Condimenti e oli",750,"ml",300,""]];
const demoN=()=>S.items.filter(i=>String(i.id).startsWith("demo-")).length;
function demoLoad(){if(demoN())return toast("I dati di esempio sono già presenti.");DEMO.forEach(([name,cat,q,u,d,loc],k)=>S.items.push({id:"demo-"+k,name,cat,q,u,exp:addDays(d),loc}));S.tab="oggi";save();render();toast("🧪 Ho aggiunto 14 prodotti di esempio. Prova «Ricette» per vedere cosa puoi cucinare; quando hai finito li togli con un tocco.")}
function demoClear(){const n=demoN();S.items=S.items.filter(i=>!String(i.id).startsWith("demo-"));save();render();toast(`🧹 Tolti ${n} prodotti di esempio.`)}
const demoBar=()=>demoN()?`<div class="al">🧪 Stai usando dati di esempio. <a href="#" onclick="demoClear();return false"><b>Rimuovili</b></a> quando vuoi iniziare con i tuoi prodotti.</div>`:"";
function reb(n,u){n=String(n);if(!S.shop.some(x=>!x.done&&nm(x.name)===nm(n)))S.shop.push({id:"s"+Date.now()+Math.random().toString(36).slice(2,6),name:n,amount:0,unit:u||"",done:false,from:"Finito in dispensa"});save();render();toast(`🛒 ${esc(n)} è nella lista della spesa.`)}
const ntfOk=()=>"Notification" in window&&"serviceWorker" in navigator&&!!window.caches;
const ntfOn=()=>ntfOk()&&lsg("ntf","")==="1"&&Notification.permission==="granted";
const ntfLocal=()=>iso(new Date(Date.now()-new Date().getTimezoneOffset()*6e4));
function ntfList(){const lim=addDays(1);return S.items.filter(i=>i.exp&&i.exp<=lim&&+i.q>0).sort((a,b)=>a.exp<b.exp?-1:1)}
function ntfMsg(l){const n=l.map(i=>i.name),t=n.length>3?n.slice(0,3).join(", ")+" e altri "+(n.length-3):n.length>1?n.slice(0,-1).join(", ")+" e "+n[n.length-1]:n[0];const sc=l.filter(i=>i.exp<today()).length;return sc===l.length?`${t}: già scadut${l.length>1?"i":"o"}. Controlla prima di usar${l.length>1?"li":"lo"}.`:`${t}: scad${l.length>1?"ono":"e"} oggi o domani. Tocca per trovare una ricetta.`}
function ntfSync(mark){if(!ntfOk())return;if(mark)ntfSync.m=mark;clearTimeout(ntfSync.t);ntfSync.t=setTimeout(async()=>{try{const c=await caches.open("dispensa-ntf");let last="";try{const r=await c.match("ntf");if(r)last=(await r.json()).last||""}catch(e){}
 await c.put("ntf",new Response(JSON.stringify({on:ntfOn(),last:ntfSync.m||last,items:S.items.filter(i=>i.exp&&+i.q>0).map(i=>({n:i.name,e:i.exp}))})))}catch(e){}},700)}
async function ntfCheck(force){if(!ntfOn())return false;const t=ntfLocal();if(!force&&lsg("ntfday","")===t)return false;const l=ntfList();if(!l.length)return false;
 try{const reg=await navigator.serviceWorker.ready;await reg.showNotification("⚠️ Dispensa Smart: in scadenza",{body:ntfMsg(l),tag:"scad",icon:"icon-192.png"});lss("ntfday",t);ntfSync(t);return true}catch(e){return false}}
async function ntfTog(on){if(!ntfOk())return toast("Questo browser non supporta gli avvisi.");
 if(!on){lss("ntf","0");ntfSync();render();return}
 let p=Notification.permission;if(p==="default")try{p=await Notification.requestPermission()}catch(e){}
 if(p!=="granted"){lss("ntf","0");render();return toast("Il telefono non ha dato il permesso. Attivalo dalle impostazioni del browser o dell’app e riprova.")}
 lss("ntf","1");try{const reg=await navigator.serviceWorker.ready;if(reg.periodicSync)await reg.periodicSync.register("scadenze",{minInterval:12*36e5})}catch(e){}
 ntfSync();render();toast("🔔 Avvisi attivati: ti avviso quando qualcosa sta per scadere.");ntfCheck(true)}
function ntfCard(){if(!ntfOk())return"";const on=ntfOn(),den=Notification.permission==="denied";return `<div class="card"><label style="display:flex;gap:10px;align-items:flex-start;cursor:pointer"><input type="checkbox" style="width:auto;margin-top:4px" ${on?"checked":""} ${den?"disabled":""} onchange="ntfTog(this.checked)"><span><b>🔔 Avvisi sulle scadenze</b><span class="mu" style="display:block">Una notifica quando qualcosa scade oggi o domani. Compare quando apri l’app e, su Android con l’app installata sulla schermata Home, anche da sola una volta al giorno.${den?" Hai bloccato le notifiche: riattivale dalle impostazioni del browser.":""}</span></span></label></div>`}
function vAltro(){const t=(e,n,d,a)=>`<button class="card" style="text-align:left;cursor:pointer;margin:0" onclick="${a}"><div style="font-size:30px;line-height:1.1">${e}</div><div style="font-weight:700;margin-top:4px">${n}</div><div class="mu">${d}</div></button>`;
 return `<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin:10px 0">`+t("📅","Piano pasti","Pranzi e cene della settimana","S.tab='piano';render()")+t("⭐","Offerte","Volantini dei tuoi negozi","S.tab='offerte';render()")+t("📣","Novità","Cosa è cambiato nell’app","novAll()")+t("ℹ️","Guida","Cosa puoi fare con l’app","S.tab='guida';render()")+t("⚙️","Impostazioni","Colori, avvisi, opzioni avanzate","S.thp=true;render()")+t("🕘","Cronologia","Le ricette già cucinate","S.tab='cron';render()")+`</div>`}
const DISL=()=>L("dis")||[];
const isDis=t=>DISL().includes(nm(t));
const DIETS=[["veg","🥬 Vegetariano","pollo|tacchino|coniglio|anatra|manzo|maiale|salsiccia|agnello|carne macinata|prosciutto|pancetta|frattaglie|baccalà|tonno|acciughe|salmone|frutti di mare|pesce|gelatina"],["lat","🥛 Senza lattosio","latte|panna|burro|mascarpone|yogurt|ricotta|mozzarella|formaggio|gelato"],["glu","🌾 Senza glutine","pasta|lasagne|gnocchi|pasta ripiena|farro|orzo|farina|pane|semolino|biscotti|savoiardi"],["pig","🐖 Senza maiale","maiale|salsiccia|prosciutto|pancetta"]];
const dietGet=()=>L("diet")||{};
const dietEx=()=>{const d=dietGet();return new Set(DIETS.filter(x=>d[x[0]]).flatMap(x=>x[2].split("|")))};
const dietBadC=c=>{const ex=dietEx();return ex.size>0&&c.some(k=>ex.has(k))};
const dietBad=names=>{const ex=dietEx();return ex.size>0&&names.some(n=>[...pzCanon(n)].some(c=>ex.has(c)))};
const dietTxt=()=>{const d=dietGet(),l=DIETS.filter(x=>d[x[0]]).map(x=>x[1].replace(/^\S+ /,"").toLowerCase());return l.length?` L'utente segue questa dieta: ${l.join(", ")}. Rispettala rigorosamente: nessun ingrediente non adatto.`:""};
const recOk=r=>!isDis(r.title)&&!dietBad((r.ingredients||[]).map(g=>g.name));
function dietTog(k,on){const d=dietGet();d[k]=on?1:0;W("diet",d);S.recs=S.recs.filter(recOk);W("recs",S.recs);render()}
function dislikeT(t,fromCur){window.__dis={key:nm(t),recs:S.recs.slice(),srch:(S.srch||[]).slice()};const l=DISL();if(!l.includes(nm(t))){l.push(nm(t));W("dis",l.slice(-300))}
 S.recs=S.recs.filter(r=>nm(r.title)!==nm(t));S.srch=(S.srch||[]).filter(r=>nm(r.title)!==nm(t));W("recs",S.recs);if(fromCur){S.cur=null;S.tab=S.from||"ricette"}render();
 toast(`👎 «${esc(t)}» non ti verrà più proposta. <a href="#" onclick="disUndo();return false" style="color:inherit;font-weight:700">↩️ Annulla</a>`)}
function disUndo(){const u=window.__dis;if(!u)return;W("dis",DISL().filter(x=>x!==u.key));S.recs=u.recs;S.srch=u.srch;W("recs",S.recs);window.__dis=null;render();toast("Ricetta ripristinata.")}
function disReset(){W("dis",[]);render();toast("Le ricette nascoste possono tornare nei suggerimenti.")}
function dietCard(){const d=dietGet(),n=DISL().length;return `<div class="card"><b>🥗 Preferenze alimentari</b><div class="mu">Le ricette suggerite escluderanno gli ingredienti non adatti. L’AI può sbagliare: controlla sempre gli ingredienti se hai allergie.</div>${DIETS.map(([k,l])=>`<label style="display:flex;gap:10px;align-items:center;margin-top:8px;cursor:pointer"><input type="checkbox" style="width:auto" ${d[k]?"checked":""} onchange="dietTog('${k}',this.checked)"> ${l}</label>`).join("")}${n?`<div class="row" style="margin-top:12px"><span class="mu">👎 Ricette nascoste: ${n}</span><button class="btn g" ${BS} onclick="disReset()">Ripristina</button></div>`:""}</div>`}
const LOCS=[["dispensa","🥫 Dispensa"],["frigo","🧊 Frigo"],["congelatore","❄️ Congelatore"]];
function guessLoc(i){const n=nm(i.name),c=i.cat;
 if(/congelator|freezer/.test(n))return"congelatore";
 if(/frigo/.test(n))return"frigo";
 if(/surgelat|congelat|gelato|sorbett|ghiacciol|bastoncini|findus|4 salti/.test(n))return"congelatore";
 if(/uht|scatol|lattin|conserv|sott'olio|sottolio|pelati|passata|polvere|secc[oa]|barattol|biscott|cioccolat|zucchero|farina|pasta|riso|\bolio|aceto|\bsale\b|miele|cacao|lievito|vanil|amido|gelatina|marmellat|nocciole|patat|cipoll|aglio|banan/.test(n))return"dispensa";
 if(/latte|yogurt|burro|panna|formagg|mozzarella|ricotta|mascarpone|uova|uovo|prosciutto|salame|affettat|besciamella|pollo|manzo|maiale|carne|pesce|salmone|wurstel|speck|pancetta|guanciale/.test(n))return"frigo";
 return ["Latticini e uova","Carne e pesce","Frutta e verdura"].includes(c)?"frigo":"dispensa"}
const locOf=i=>i.loc||guessLoc(i);
const FRZD=[[/pesce|salmone|tonno|merluzz|gamber|calamar|cozze|vongol|polpo|orata|branzin|baccal/i,60],[/pollo|tacchin|manzo|maiale|vitell|agnello|carne|macinat|salsicc|bistecc|hamburger|arrosto|prosciutto|salame|wurstel|pancetta/i,90],[/pane|pizza|focacc|panino|brioche|cornett|piadin/i,60],[/mozzarella|ricotta|latte|panna|yogurt|burro|formagg|mascarpone|besciamella/i,60],[/uova|uovo/i,30],[/sugo|ragù|ragu|zuppa|minestr|brodo|lasagn|pasta cotta|riso cotto|avanzi/i,90],[/spinaci|broccol|piselli|fagiolini|zucchin|carote|verdur|minestrone|peperon|melanzan|funghi|patat/i,180],[/fragol|frutt|mirtill|lamponi|banan|mela|pesca/i,180]];
const frzDays=i=>(FRZD.find(([re])=>re.test(i.name||""))||[0,60])[1];
function frz(id){const it=S.items.find(i=>i.id===id);if(!it)return;const snap={items:JSON.parse(JSON.stringify(S.items))};
 if(locOf(it)==="congelatore"){it.loc="frigo";if(it.exp)it.exp=addDays(2);save();render();return undoable(`🔥 ${esc(it.name)} scongelato: va in frigo e va consumato entro 2 giorni.`,snap,u=>{S.items=u.items})}
 it.loc="congelatore";const d=frzDays(it);if(it.exp)it.exp=addDays(d);save();render();
 undoable(`❄️ ${esc(it.name)} nel congelatore${it.exp?`: scadenza spostata a ${it.exp.split("-").reverse().join("/")} (circa ${d>=60?Math.round(d/30)+" mesi":d+" giorni"})`:""}.`,snap,u=>{S.items=u.items})}
function mv(id,k){const it=S.items.find(i=>i.id===id);if(!it)return;it.loc=k;save();render();toast(`${emo(it.name,it.cat)} ${esc(it.name)} → ${(LOCS.find(l=>l[0]===k)||LOCS[0])[1]}`)}
function autoSort(){const n=S.items.filter(i=>i.loc&&i.loc!==guessLoc(i)).length;
 if(!n)return toast("Tutti i prodotti sono già nella sezione consigliata.");
 if(!S.cf2){S.cf2=1;setTimeout(()=>S.cf2=0,6000);return toast(`${n} prodott${n===1?"o":"i"} che hai spostato a mano torner${n===1?"à":"anno"} nella sezione consigliata. Premi di nuovo “Smista in automatico” entro 6 secondi per confermare.`)}
 S.cf2=0;S.items.forEach(i=>{i.loc=""});save();render();toast(`🔄 ${n} prodott${n===1?"o rimesso":"i rimessi"} nella sezione automatica`)}
const dispRow=i=>{const d=days(i.exp);return `<div class="card"><div class="row"><div><b>${emo(i.name,i.cat)} ${esc(i.name)}</b><div class="mu">${fmt(i.q,i.u)} · ${i.exp?"scade "+i.exp.split("-").reverse().join("/"):"senza scadenza"}</div>${S.ed===i.id?`<div class="row" style="margin-top:6px;gap:6px;flex-wrap:wrap"><input id="ed" type="date" value="${i.exp}"><label class="mu" style="white-space:nowrap"><input id="en" type="checkbox" style="width:auto" ${i.exp?"":"checked"}> senza scad.</label><input id="eq" type="number" min="0" step="any" value="${/^cucchiai/.test(i.u)?i.q:Math.round(i.q)}"><span class="mu">${i.u}</span><button class="btn" style="padding:6px 14px" onclick="saveEd('${i.id}')">OK</button></div>`:""}</div><div>${i.exp?`<span class="bd ${d>3?"ok":""}">${d<0?"scaduto":d===0?"oggi":d+" gg"}</span>`:`<span class="bd ok">senza scad.</span>`} <select style="width:auto;padding:4px 6px;border-radius:99px" onchange="mv('${i.id}',this.value)" aria-label="Posizione" title="Sposta in…">${LOCS.map(([k,n])=>`<option value="${k}" ${locOf(i)===k?"selected":""}>${n}</option>`).join("")}</select><button class="x" onclick="frz('${i.id}')" aria-label="${locOf(i)==='congelatore'?'Scongela':'Congela'}" title="${locOf(i)==='congelatore'?'Scongela (va in frigo, 2 giorni)':'Congela (allunga la scadenza)'}">${locOf(i)==='congelatore'?'🔥':'❄️'}</button><button class="x" onclick="pfavTog('${i.id}')" aria-label="${isFav(i.name)?'Togli dai preferiti':'Aggiungi ai preferiti'}">${isFav(i.name)?'❤️':'🤍'}</button><button class="x" onclick="S.ed='${i.id}';render()" aria-label="Modifica">✏️</button><button class="x" onclick="del('${i.id}')" aria-label="Elimina">✕</button></div></div>${offStarHtml(i.name)}</div>`};
function dcat(c){S.dc=c;S.sx_disp="";render();window.scrollTo(0,0)}
function vDisp(){
 if(S.dc&&!CATS.includes(S.dc))S.dc="";
 if(S.dc){const c=S.dc,lf0=S.lf||"all",l=S.items.filter(i=>i.cat===c&&(lf0==="all"||locOf(i)===lf0)).sort((a,b)=>(a.exp||"9")<(b.exp||"9")?-1:1);
  return `<div class="row" style="margin:4px 0 12px"><button class="btn g" style="padding:8px 14px" onclick="dcat('')">← Categorie</button><b style="font-size:18px">${CE[c]} ${c}</b></div>`+(l.length?l.map(dispRow).join(""):`<p class="mu">Non c’è niente in questa categoria.</p>`)}
 const s=soon();let h=s.length?`<div class="al">⚠️ In scadenza: <b>${s.map(i=>esc(i.name)).join(", ")}</b>. <a href="#" onclick="S.tab='ricette';render();return false">Trova ricette per evitare sprechi →</a></div>`:"";
 const lf=S.lf||"all",cnt=k=>S.items.filter(i=>locOf(i)===k).length;
 h+=`<div style="display:flex;gap:6px;flex-wrap:wrap;margin:8px 0">${[["all","Tutto ("+S.items.length+")"],...LOCS.map(([k,n])=>[k,n+" ("+cnt(k)+")"])].map(([k,n])=>`<button class="btn ${lf===k?"":"g"}" style="padding:6px 12px;font-size:14px" onclick="S.lf='${k}';render()">${n}</button>`).join("")}<button class="btn g" style="padding:6px 12px;font-size:14px" onclick="autoSort()">🔄 Smista in automatico</button></div>`;
 if(!S.items.length)return h+`<p class="mu">La dispensa è vuota. Aggiungi la spesa dalla scheda “Aggiungi prodotto”.</p><button class="btn g" onclick="demoLoad()">🧪 Prova con dati di esempio</button>`;
 const inLoc=i=>lf==="all"||locOf(i)===lf,byExp=(a,b)=>(a.exp||"9")<(b.exp||"9")?-1:1;
 h+=sxBox("disp","Cerca un prodotto in dispensa…");
 if(S.sx_disp){let n=0;CATS.forEach(c=>{const l=S.items.filter(i=>i.cat===c&&inLoc(i)&&sxOk("disp",i.name)).sort(byExp);if(!l.length)return;n+=l.length;h+=`<h2>${CE[c]} ${c}</h2>`+l.map(dispRow).join("")});
  return h+(n?"":`<p class="mu">Nessun prodotto trovato per “${esc(S.sx_disp)}”.</p>`)}
 h+=`<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin:10px 0">`+CATS.map(c=>{const l=S.items.filter(i=>i.cat===c&&inLoc(i)),sc=l.filter(i=>i.exp&&days(i.exp)<=3).length;
  return `<button class="card" style="text-align:left;cursor:pointer;margin:0;position:relative;${l.length?"":"opacity:.5"}" onclick="dcat('${c}')" aria-label="${c}: ${l.length} prodotti"><div style="font-size:30px;line-height:1.1">${CE[c]}</div><div style="font-weight:700;margin-top:4px">${c}</div><div class="mu">${l.length} prodott${l.length===1?"o":"i"}</div>${sc?`<span class="bd" style="position:absolute;top:8px;right:8px">⚠️ ${sc}</span>`:""}</button>`}).join("")+`</div>`;
 return h+(S.items.some(inLoc)?"":`<p class="mu">Non c’è ancora niente in questa sezione.</p>`)}
function del(id){const i=S.items.findIndex(x=>x.id===id);if(i<0)return;const x=S.items[i];S.items.splice(i,1);save();render();undoable(`🗑️ Prodotto eliminato. <a href="#" onclick="reb(${esc(JSON.stringify(x.name))},'${x.u==="pz"?"pz":""}');return false" style="color:inherit;font-weight:700">🛒 Ricompra</a> ·`,{x,i},u=>{S.items.splice(Math.min(u.i,S.items.length),0,u.x)})}
const COMUNI=["Pasta","Spaghetti","Penne","Riso","Farina 00","Pane","Latte","Uova","Burro","Yogurt","Mozzarella","Parmigiano","Ricotta","Mascarpone","Gorgonzola","Pecorino","Panna","Pomodori","Passata di pomodoro","Pelati","Zucchine","Melanzane","Patate","Cipolle","Carote","Insalata","Spinaci","Peperoni","Funghi","Broccoli","Cavolfiore","Zucca","Fagiolini","Cetrioli","Aglio","Basilico","Prezzemolo","Mele","Pere","Banane","Arance","Limoni","Fragole","Uva","Kiwi","Pesche","Pollo","Petto di pollo","Macinato di manzo","Salsiccia","Prosciutto cotto","Prosciutto crudo","Tonno in scatola","Salmone","Merluzzo","Fagioli","Ceci","Lenticchie","Piselli","Olio extravergine","Aceto","Sale","Zucchero","Biscotti","Cioccolato","Marmellata","Miele","Caffè","Tè","Acqua","Succo di frutta","Birra","Vino","Cornflakes","Fette biscottate","Pangrattato","Brodo","Dado","Pesto","Maionese","Ketchup","Senape","Gnocchi","Tortellini","Cous cous","Orzo","Farro","Polenta","Pizza surgelata","Gelato","Piselli surgelati","Spinaci surgelati"];
const DU_CAT={"Cereali e derivati":"g","Latticini e uova":"g","Carne e pesce":"g","Frutta e verdura":"g","Legumi":"g","Condimenti e oli":"g","Dolci e snack":"g","Bevande":"l","Altro":"pz"};
const DEXP={"Cereali e derivati":180,"Latticini e uova":10,"Carne e pesce":3,"Frutta e verdura":5,"Legumi":365,"Condimenti e oli":365,"Dolci e snack":90,"Bevande":180,"Altro":30};
function addDef(name,cat){let u=DU_CAT[cat]||"pz",d=DEXP[cat]||30;const t=nm(name);
 if(/\buov/.test(t)){u="pz";d=21}else if(/yogurt/.test(t)){u="pz";d=14}else if(/mozzarella|burrata|stracchino/.test(t)){u="g";d=7}else if(/\blatte\b/.test(t)){u="l";d=7}else if(/panna/.test(t)){u="ml";d=14}else if(/olio|aceto/.test(t)){u="l";d=540}else if(/\bpane\b|pancarr/.test(t)){d=5}else if(/parmigiano|grana|pecorino/.test(t)){d=60}else if(/surgelat|gelato/.test(t)){d=180}
 return{u,d}}
const QSTEP={kg:.5,g:50,l:.5,ml:50,pz:1,cucchiaio:1,"mezzo cucchiaio":1,cucchiaino:1};
const QPRE={pz:[1,2,3,4,6,12],g:[100,200,250,500],kg:[.5,1,2],ml:[250,500,750],l:[.5,1,1.5,2],cucchiaio:[1,2,3],"mezzo cucchiaio":[1,2],cucchiaino:[1,2]};
const EXPC=[["Domani",1],["3 giorni",3],["1 settimana",7],["2 settimane",14],["1 mese",30],["3 mesi",90],["6 mesi",180],["Nessuna",0]];
const addT=()=>S.addT||(S.addT={});
function qChips(){const el=$("qc");if(!el)return;const u=$("u").value;el.innerHTML=(QPRE[u]||[]).map(v=>`<button type="button" class="btn g" style="padding:5px 11px;font-size:14px" onclick="qSet(${v})">${String(v).replace(".",",")}</button>`).join("")}
function qSet(v){$("q").value=v;addT().q=1}
function qStep(k){const u=$("u").value,st=QSTEP[u]||1,v=Math.max(0,Math.round(((parseFloat($("q").value)||0)+k*st)*100)/100);$("q").value=v||"";addT().q=1}
function expMark(){const ne=$("ne").checked,e=$("e").value;document.querySelectorAll("#ec button").forEach(b=>{const d=+b.dataset.d,on=d===0?ne:(!ne&&e===addDays(d));b.className="btn "+(on?"":"g")})}
function expChip(d){addT().e=1;if(d===0){$("ne").checked=true;$("e").disabled=true}else{$("ne").checked=false;$("e").disabled=false;$("e").value=addDays(d)}$("eh").textContent="";expMark()}
function expManual(){addT().e=1;$("eh").textContent="";expMark()}
function addName(el){const v=el.value,T=addT();if(v.trim().length<3)return;if(!T.c)$("c").value=guess(v);const df=addDef(v,$("c").value);
 if(!T.u){$("u").value=df.u;qChips()}if(!T.e&&!$("ne").checked){$("e").value=addDays(df.d);$("eh").textContent="Scadenza suggerita: controlla la confezione e cambiala se serve.";expMark()}}
function recentHtml(){const l=(S.recent||[]).map(id=>S.items.find(i=>i.id===id)).filter(Boolean);if(!l.length)return"";
 return `<div class="card"><b>✅ Appena aggiunti</b>${l.map(i=>`<div class="row" style="margin-top:8px"><span>${emo(i.name,i.cat)} <b>${esc(i.name)}</b> <span class="mu">${fmt(Math.round(i.q*100)/100,i.u)}${i.exp?" · scade "+dl2(i.exp):" · senza scadenza"}</span></span><button class="x" onclick="del('${i.id}')" aria-label="Elimina">✕</button></div>`).join("")}</div>`}
const dl2=e=>{const p=String(e).split("-");return p.length===3?p[2]+"/"+p[1]:e};
function vAdd(){return bcCard()+rcpHtml()+vAdd0()+recentHtml()}
const bcCard=()=>`<div class="card"><button class="btn" style="width:100%;font-size:18px;padding:14px" onclick="bcStart()">📷 Scansiona il codice a barre</button><div class="mu" style="margin-top:8px">Inquadra il codice sulla confezione: compilo nome, categoria e quantità, tu scegli solo la scadenza.</div></div>`;
function vAdd0(){const hist=(L("pnames")||[]),names=[...new Set([...hist,...S.items.map(i=>i.name),...COMUNI])].slice(0,400);
 return `<div class="card"><h2 style="margin-top:0;font-size:18px">✍️ Oppure inserisci a mano</h2><div class="f">
<div class="w"><input id="n" list="dl" autocomplete="off" placeholder="Prodotto (es. Pasta penne)" oninput="addName(this)"><datalist id="dl">${names.map(n=>`<option value="${esc(n)}">`).join("")}</datalist></div>
<div class="w"><select id="c" onchange="addT().c=1">${CATS.map(c=>`<option>${c}</option>`).join("")}</select></div>
<div class="w"><label class="mu">Quantità</label><div style="display:flex;gap:6px;align-items:center"><button type="button" class="btn g" style="padding:8px 16px;font-size:20px" onclick="qStep(-1)" aria-label="Meno">−</button><input id="q" type="number" min="0" step="any" placeholder="0" style="text-align:center;flex:1;min-width:0" oninput="addT().q=1"><button type="button" class="btn g" style="padding:8px 16px;font-size:20px" onclick="qStep(1)" aria-label="Più">+</button><select id="u" style="width:auto" onchange="addT().u=1;qChips()"><option>kg</option><option>g</option><option>l</option><option>ml</option><option selected>pz</option><option>cucchiaio</option><option>mezzo cucchiaio</option><option>cucchiaino</option></select></div><div id="qc" style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px"></div></div>
<div class="w"><label class="mu">Scadenza</label><div id="ec" style="display:flex;gap:6px;flex-wrap:wrap;margin:4px 0 8px">${EXPC.map(([l,d])=>`<button type="button" class="btn g" data-d="${d}" style="padding:5px 11px;font-size:14px" onclick="expChip(${d})">${l}</button>`).join("")}</div><input id="e" type="date" value="${addDays(7)}" onchange="expManual()"><input id="ne" type="checkbox" hidden onchange="$('e').disabled=this.checked"><div class="mu" id="eh" style="margin-top:4px"></div></div>
<div class="w"><select id="loc"><option value="">Dove lo metti? Automatico</option>${LOCS.map(([k,n])=>`<option value="${k}">${n}</option>`).join("")}</select></div>
<div class="w"><button class="btn" style="width:100%" onclick="add()">Aggiungi alla dispensa</button><button class="btn g" style="width:100%;margin-top:8px" onclick="add(1)">➕ Aggiungi e scansiona il prossimo</button></div></div></div>`}
function add(next){const n=$("n").value.trim(),q=parseFloat($("q").value),u=$("u").value,e=$("e").value;
 if(!n||!(q>0)||(!e&&!$("ne").checked))return toast("Compila nome, quantità e scadenza.");
 const it={id:"p"+Date.now(),name:n,cat:$("c").value,q:q*U[u][1],u:U[u][0],exp:$("ne").checked?"":e,loc:$("loc").value};S.items.push(it);
 (S.recent=S.recent||[]).unshift(it.id);S.recent=S.recent.slice(0,6);
 const h=(L("pnames")||[]).filter(x=>nm(x)!==nm(n));h.unshift(n);W("pnames",h.slice(0,60));
 if(S.bcCur){const m=L("bc")||{};m[S.bcCur]={n,c:it.cat,q,u};W("bc",m);S.bcCur=null}
 S.addT={};save();toast("Aggiunto: "+esc(n)+" → "+(LOCS.find(l=>l[0]===locOf(it))||LOCS[0])[1]);render();
 if(next)bcStart();else setTimeout(()=>{const x=$("n");if(x)x.focus()},50)}
/* ---------- codice a barre ---------- */
function eanOk(c){c=String(c||"");if(!/^\d{8}$|^\d{12,13}$/.test(c))return false;const d=c.split("").map(Number),k=d.pop();let s=0;d.reverse().forEach((x,i)=>s+=x*(i%2?1:3));return (10-s%10)%10===k}
let bcLibP=null;
function bcLib(){if(window.Html5Qrcode)return Promise.resolve();return bcLibP||(bcLibP=new Promise((ok,ko)=>{const s=document.createElement("script");s.src="html5-qrcode.min.js?v="+APP_VER;s.onload=()=>window.Html5Qrcode?ok():ko(new Error("lib"));s.onerror=()=>{bcLibP=null;ko(new Error("lib"))};document.head.appendChild(s)}))}
function bcMsg(t){const m=$("bcm");if(m)m.textContent=t}
async function bcStart(){if($("bco"))return;S.tab="add";S.thp=false;render();
 const o=document.createElement("div");o.id="bco";o.setAttribute("role","dialog");o.setAttribute("aria-label","Scansione codice a barre");o.style.cssText="position:fixed;inset:0;z-index:80;background:#000;display:flex;flex-direction:column";
 o.innerHTML=`<div style="padding:12px 16px;display:flex;justify-content:space-between;align-items:center;color:#fff"><b>📷 Inquadra il codice a barre</b><button class="btn g" onclick="bcStop()">✕ Chiudi</button></div><div id="bcr" style="flex:1;min-height:0;display:flex;align-items:center;justify-content:center;color:#fff"></div><div style="padding:12px 16px 16px;background:var(--card);color:var(--tx)"><div class="mu" id="bcm">Avvicina il telefono al codice, con buona luce.</div><div style="display:flex;gap:8px;margin-top:8px"><input id="bcn" inputmode="numeric" placeholder="Oppure scrivi il numero" style="flex:1;min-width:0"><button class="btn" onclick="bcManual()">Cerca</button></div><div class="mu" style="margin-top:6px;font-size:12px">Dati dei prodotti: Open Food Facts (licenza ODbL)</div></div>`;
 document.body.appendChild(o);
 try{await bcLib();if(!$("bco"))return;const F=window.Html5QrcodeSupportedFormats||{};const h=new Html5Qrcode("bcr",{formatsToSupport:[F.EAN_13,F.EAN_8,F.UPC_A,F.UPC_E].filter(x=>x!==undefined),useBarCodeDetectorIfSupported:true,verbose:false});S.bcH=h;
  await h.start({facingMode:"environment"},{fps:10,qrbox:(w,hh)=>({width:Math.max(120,Math.min(w-40,320)),height:Math.max(80,Math.min(hh-40,160))})},c=>bcHit(c),()=>{})}
 catch(e){bcMsg("Non riesco ad aprire la fotocamera (permesso negato o non disponibile). Scrivi qui sotto il numero del codice.")}}
async function bcStop(){const h=S.bcH;S.bcH=null;try{if(h){await h.stop();h.clear()}}catch(e){}const o=$("bco");if(o)o.remove()}
function bcHit(code){if(S.bcBusy||!eanOk(code))return;S.bcBusy=true;try{navigator.vibrate&&navigator.vibrate(60)}catch(e){}bcStop().then(()=>bcLookup(code)).finally(()=>{S.bcBusy=false})}
function bcManual(){const c=($("bcn")||{}).value;const v=String(c||"").replace(/\D/g,"");if(!eanOk(v))return bcMsg("Numero non valido: controlla le cifre sotto il codice a barre (8 o 13 cifre).");bcStop().then(()=>bcLookup(v))}
const BCEN=[[/milk|yogurt|yoghurt|cheese|butter|egg|cream|dairy/,"Latticini e uova"],[/meat|chicken|beef|pork|fish|tuna|sausage|ham|salami|seafood|poultry/,"Carne e pesce"],[/legume|bean|lentil|chickpea|pea/,"Legumi"],[/fruit|vegetable|salad|tomato|potato/,"Frutta e verdura"],[/pasta|rice|bread|cereal|flour|noodle|couscous/,"Cereali e derivati"],[/sauce|oil|vinegar|spice|salt|condiment|seasoning/,"Condimenti e oli"],[/chocolate|sweet|candy|biscuit|cookie|cake|snack|dessert|jam/,"Dolci e snack"],[/beverage|water|juice|beer|wine|soda|coffee|tea/,"Bevande"]];
function bcCat(name,tags){let c=guess(name);if(c!=="Altro")return c;const t=(tags||[]).join(" ").toLowerCase();const m=BCEN.find(([r])=>r.test(t));return m?m[1]:"Altro"}
function bcQty(p){let q=0,u="";const t=String(p.quantity||"").toLowerCase().replace(",",".");
 let m=t.match(/(\d+)\s*[x×]\s*(\d+(?:\.\d+)?)\s*(kg|g|l|cl|ml)\b/);
 if(m){q=+m[1]*+m[2];u=m[3]}else{m=t.match(/(\d+(?:\.\d+)?)\s*(kg|g|l|cl|ml)\b/);if(m){q=+m[1];u=m[2]}}
 if(!q&&+p.product_quantity>0){q=+p.product_quantity;u=String(p.product_quantity_unit||"g").toLowerCase()}
 if(!q)return{q:1,u:"pz"};
 if(u==="cl"){q*=10;u="ml"}
 if(u==="g"&&q>=1000){q/=1000;u="kg"}else if(u==="ml"&&q>=1000){q/=1000;u="l"}
 return{q:Math.round(q*100)/100,u:["kg","g","l","ml"].includes(u)?u:"pz"}}
async function bcOff(code){const ac=new AbortController(),tm=setTimeout(()=>ac.abort(),8000);
 try{const r=await fetch("https://world.openfoodfacts.org/api/v2/product/"+code+".json?fields=product_name,product_name_it,generic_name_it,quantity,product_quantity,product_quantity_unit,categories_tags",{signal:ac.signal});if(!r.ok)return null;const j=await r.json();if(j.status!==1||!j.product)return null;
  const p=j.product,name=String(p.product_name_it||p.product_name||p.generic_name_it||"").trim().slice(0,60);if(!name)return null;const q=bcQty(p);return{n:name,c:bcCat(name,p.categories_tags),q:q.q,u:q.u}}
 finally{clearTimeout(tm)}}
async function bcLookup(code){S.bcCur=code;const loc=(L("bc")||{})[code];toast("🔎 Cerco il prodotto…");let r=loc||null,src=loc?"tuo elenco":"Open Food Facts";
 if(!r){try{r=await bcOff(code)}catch(e){r=null}}
 S.tab="add";render();
 if(!r){toast("Prodotto non trovato nel database: inserisci i dati a mano. La prossima volta lo riconosco io.");const x=$("n");if(x)x.focus();return}
 bcFill(r,src)}
function bcFill(r,src){const T=S.addT={};$("n").value=r.n;$("c").value=r.c;$("u").value=r.u;$("q").value=r.q;T.c=T.u=T.q=1;qChips();
 const df=addDef(r.n,r.c);$("e").value=addDays(df.d);$("eh").textContent="Scadenza suggerita: scegli quella stampata sulla confezione.";expMark();
 toast("✅ "+esc(r.n)+" ("+src+"). Scegli la scadenza e tocca Aggiungi.");const e=$("ec");if(e)e.scrollIntoView({block:"center",behavior:"smooth"})}
const CEM={"":"✨",Antipasto:"🥖",Primo:"🍝",Secondo:"🥩",Contorno:"🥗",Dolce:"🍰",Altro:"🍽️"};
const rcN=k=>S.recs.filter(r=>!k||r.course===k).length;
function rcPick(k){S.gc=k;S.rv=1;S.err="";S.note="";if(!rcN(k)&&S.items.length&&!S.busy){render();window.scrollTo(0,0);return gen()}render();window.scrollTo(0,0)}
function rcBack(){S.rv=0;S.err="";S.note="";render();window.scrollTo(0,0)}
