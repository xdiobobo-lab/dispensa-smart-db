/* Dispensa Smart - dispensa.js */
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
 if(dn.length)h+=`<h2 style="font-size:17px;margin-bottom:0">Già comprati (${dn.length})</h2>`+dn.map(line).join("")+`<button class="btn g" onclick="S.shop=S.shop.filter(x=>!x.done);save();render()">Rimuovi i comprati dalla lista</button>`;
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
const RCP_CATS=()=>CATS.join(", ");
async function rcpScan(inp){const fs=[...(inp.files||[])].slice(0,6);if(!fs.length)return;
 S.rcp={busy:1,msg:"Preparo le immagini…",err:"",items:null};render();
 const say=m=>{S.rcp.msg=m;const e=$("rcm");if(e)e.textContent="⏳ "+m},wait=ms=>new Promise(x=>setTimeout(x,ms));
 try{const pages=[];
  for(const f of fs){if(/pdf$/i.test(f.type)||/\.pdf$/i.test(f.name)){const lib=await loadPdf(),pdf=await lib.getDocument({data:await f.arrayBuffer()}).promise;for(let p=1;p<=Math.min(pdf.numPages,6);p++)pages.push(()=>pageJpg(pdf,p))}else pages.push(()=>fileJpg(f))}
  if(pages.length>6)pages.length=6;
  const P=`Oggi è ${today()}. Queste sono le immagini di uno scontrino della spesa italiano (anche più parti dello stesso scontrino). Estrai SOLO i prodotti alimentari e per la casa che finiscono in dispensa, frigo o congelatore; ignora sconti, totale, IVA, resto, punti, sacchetti e voci non leggibili: se non sei sicuro di una riga, omettila. Per ogni prodotto indica: name (nome generico in italiano, senza marca, abbreviazioni sciolte, es. "Latte parzialmente scremato", "Spaghetti", "Passata di pomodoro"), qty (quantità TOTALE acquistata come numero: se è scritto 2 x 500 g allora 1000; per i prodotti a peso usa il peso; se manca usa il numero di pezzi), unit ("g", "ml" o "pz": converti kg in g e l in ml), price (prezzo della riga in euro come numero, o null), cat (UNA tra: ${RCP_CATS()}), days (giorni di conservazione tipici dall'acquisto, numero; null se non scade come sale e zucchero). Indica anche store (negozio), date (AAAA-MM-GG) e total (totale in euro) se leggibili, altrimenti null. Rispondi SOLO con JSON: {"store":null,"date":null,"total":null,"items":[{"name":"","qty":1,"unit":"pz","price":null,"cat":"Altro","days":7}]}`;
  const items=[];let store=null,date=null,total=null,fail=0,lastErr=null;const nb=Math.ceil(pages.length/3);
  for(let bi=0;bi<nb;bi++){say(`Leggo lo scontrino… ${bi+1} di ${nb}`);if(bi)await wait(8000);
   let r=null;
   try{const imgs=[];for(const g of pages.slice(bi*3,bi*3+3))imgs.push(await g());
    for(let t=0;t<3&&!r;t++){try{r=await claude.vision(P,imgs)}catch(er){lastErr=er;if(/Limite/.test(er.message||"")&&t<2){say(`Limite dell’AI raggiunto: aspetto 30 secondi e riprovo…`);await wait(30000)}else break}}}
   catch(er){lastErr=er}
   if(!r){fail++;continue}
   const o=Array.isArray(r)?{items:r}:(r||{});store=store||o.store||null;date=date||(okD(o.date)?o.date:null);total=total||(+o.total>0?+o.total:null);
   (o.items||[]).forEach(x=>{if(!x||!x.name)return;const name=String(x.name).trim().slice(0,60);if(!name)return;const unit=["g","ml","pz"].includes(x.unit)?x.unit:"pz",qty=+x.qty>0?+x.qty:1,cat=CATS.includes(x.cat)?x.cat:guess(name);
    const nex=NOEXP.test(name)||x.days===null||x.days===0;const dd=!nex&&+x.days>0?Math.min(+x.days,730):((EXD.find(([re])=>re.test(name))||[0,CD[cat]||30])[1]);
    items.push({name,qty:Math.round(qty*100)/100,unit,cat,price:+x.price>0?+x.price:null,exp:nex?"":addDays(dd),nex,sel:true})})}
  if(!items.length){if(lastErr)throw lastErr;throw new Error("Non ho trovato prodotti nello scontrino: prova con una foto più nitida e dritta.")}
  S.rcp={items,store,date,total,fail,nb}}
 catch(e){S.rcp={err:aiErr(e),items:null}}render()}
function rcpSet(i,k,v){const x=S.rcp&&S.rcp.items&&S.rcp.items[i];if(!x)return;if(k==="qty")x.qty=+v>0?+v:0;else if(k==="nex"){x.nex=!!v;if(v)x.exp="";else if(!x.exp)x.exp=addDays(CD[x.cat]||30)}else x[k]=v}
function rcpTog(i){const x=S.rcp.items[i];x.sel=!x.sel;render()}
function rcpAll(f){S.rcp.items.forEach(x=>x.sel=f);render()}
function rcpCancel(){S.rcp=null;render()}
function rcpAdd(){const R=S.rcp;if(!R||!R.items)return;let n=0,m=0,rm=0;const snap={items:JSON.parse(JSON.stringify(S.items)),shop:JSON.parse(JSON.stringify(S.shop))};
 R.items.forEach(x=>{if(!x.sel||!String(x.name).trim()||!(+x.qty>0))return;const name=String(x.name).trim(),q=+x.qty,exp=x.nex?"":(x.exp||"");
  const ex=S.items.find(i=>nm(i.name)===nm(name)&&i.u===x.unit);
  if(ex){ex.q=Math.round((+ex.q+q)*100)/100;if(exp&&(!ex.exp||exp<ex.exp))ex.exp=exp;m++}
  else{S.items.push({id:"p"+Date.now()+Math.random().toString(36).slice(2,6),name,cat:x.cat,q,u:x.unit,exp,loc:""});n++}
  const tk=toks(name,1);S.shop=S.shop.filter(s=>{if(s.done)return true;const st=toks(s.name,1),hit=st.length&&tk.length&&(st.every(t=>tk.includes(t))||tk.every(t=>st.includes(t)));if(hit)rm++;return !hit})});
 if(!n&&!m)return toast("Seleziona almeno un prodotto con una quantità.");
 S.rcp=null;save();render();undoable(`🧾 ${n} nuov${n===1?"o prodotto":"i prodotti"} in dispensa${m?`, ${m} aggiornat${m===1?"o":"i"}`:""}${rm?`, ${rm} tolt${rm===1?"o":"i"} dalla lista della spesa`:""}.`,snap,u=>{S.items=u.items;S.shop=u.shop})}
function rcpHtml(){if(!(window.claude&&claude.vision))return"";const R=S.rcp,fi=`<input type="file" accept="image/*,.pdf,application/pdf" multiple hidden onchange="rcpScan(this)">`;
 const inp="padding:8px;border:1px solid var(--bd);border-radius:10px;background:var(--card);color:var(--tx);font:inherit";
 if(R&&R.busy)return `<div class="card"><b>🧾 Scontrino</b><div class="mu" id="rcm" style="margin-top:8px">⏳ ${esc(R.msg||"Leggo lo scontrino…")}</div></div>`;
 if(R&&R.items){const sel=R.items.filter(x=>x.sel).length;
  return `<div class="card"><b>🧾 Controlla lo scontrino</b><div class="mu">${R.store?esc(R.store)+" · ":""}${R.date?fD(R.date)+" · ":""}${R.total?"totale € "+String(R.total.toFixed(2)).replace(".",",")+" · ":""}${R.items.length} prodotti letti. Correggi nomi, quantità e scadenze, togli la spunta a ciò che non vuoi aggiungere.${R.fail?`<br><span style="color:var(--wa)">⚠️ ${R.fail} parte${R.fail>1?"i":""} su ${R.nb} non lett${R.fail>1?"e":"a"}: lo scontrino potrebbe essere incompleto.</span>`:""}</div>
  <div style="display:flex;gap:6px;margin-top:8px"><button class="btn g" ${BS} onclick="rcpAll(true)">Seleziona tutti</button><button class="btn g" ${BS} onclick="rcpAll(false)">Nessuno</button></div>
  ${R.items.map((x,i)=>`<div style="margin-top:10px;padding-top:10px;border-top:1px solid var(--bd);${x.sel?"":"opacity:.5"}"><div style="display:flex;gap:8px;align-items:center"><input type="checkbox" style="width:22px;height:22px;flex:none" ${x.sel?"checked":""} onchange="rcpTog(${i})"><span>${emo(x.name,x.cat)}</span><input value="${esc(x.name)}" style="flex:1;${inp}" oninput="rcpSet(${i},'name',this.value)">${x.price?`<span class="bd ok">€ ${String(x.price.toFixed(2)).replace(".",",")}</span>`:""}</div>
  <div style="display:flex;gap:6px;align-items:center;margin-top:6px;flex-wrap:wrap"><input type="number" min="0" step="any" value="${x.qty}" style="width:90px;${inp}" oninput="rcpSet(${i},'qty',this.value)"><select style="width:auto;${inp}" onchange="rcpSet(${i},'unit',this.value)">${["g","ml","pz"].map(u=>`<option ${x.unit===u?"selected":""}>${u}</option>`).join("")}</select><input type="date" value="${x.exp||""}" ${x.nex?"disabled":""} style="width:auto;${inp}" onchange="rcpSet(${i},'exp',this.value)"><label class="mu" style="display:flex;gap:4px;align-items:center;white-space:nowrap"><input type="checkbox" style="width:auto" ${x.nex?"checked":""} onchange="rcpSet(${i},'nex',this.checked);render()"> senza scad.</label></div></div>`).join("")}
  <div style="display:flex;gap:8px;margin-top:14px;flex-wrap:wrap"><button class="btn" onclick="rcpAdd()">Aggiungi ${sel} prodott${sel===1?"o":"i"} alla dispensa</button><button class="btn g" onclick="rcpCancel()">Annulla</button></div><div class="mu" style="margin-top:6px">Se un prodotto è già in dispensa la quantità viene sommata; gli articoli corrispondenti vengono tolti dalla lista della spesa.</div></div>`}
 return `<div class="card"><b>🧾 Scansiona lo scontrino</b><div class="mu">Fotografa lo scontrino (o carica un’immagine o un PDF): l’AI legge i prodotti e li aggiunge alla dispensa con quantità e scadenze stimate. Prima di salvare puoi correggere tutto.</div>${R&&R.err?`<div class="al" style="margin-top:8px">${esc(R.err)}</div>`:""}<label class="btn" style="display:block;text-align:center;margin-top:10px;cursor:pointer">📷 Scatta o carica lo scontrino${fi}</label><div class="mu" style="margin-top:6px">Foto nitida, dritta e con tutto lo scontrino visibile. Per scontrini lunghi puoi caricare più foto (fino a 6).</div></div>`}
const LOCS=[["dispensa","🥫 Dispensa"],["frigo","🧊 Frigo"],["congelatore","❄️ Congelatore"]];
function guessLoc(i){const n=nm(i.name),c=i.cat;
 if(/congelator|freezer/.test(n))return"congelatore";
 if(/frigo/.test(n))return"frigo";
 if(/surgelat|congelat|gelato|sorbett|ghiacciol|bastoncini|findus|4 salti/.test(n))return"congelatore";
 if(/uht|scatol|lattin|conserv|sott'olio|sottolio|pelati|passata|polvere|secc[oa]|barattol|biscott|cioccolat|zucchero|farina|pasta|riso|\bolio|aceto|\bsale\b|miele|cacao|lievito|vanil|amido|gelatina|marmellat|nocciole|patat|cipoll|aglio|banan/.test(n))return"dispensa";
 if(/latte|yogurt|burro|panna|formagg|mozzarella|ricotta|mascarpone|uova|uovo|prosciutto|salame|affettat|besciamella|pollo|manzo|maiale|carne|pesce|salmone|wurstel|speck|pancetta|guanciale/.test(n))return"frigo";
 return ["Latticini e uova","Carne e pesce","Frutta e verdura"].includes(c)?"frigo":"dispensa"}
const locOf=i=>i.loc||guessLoc(i);
function mv(id,k){const it=S.items.find(i=>i.id===id);if(!it)return;it.loc=k;save();render();toast(`${emo(it.name,it.cat)} ${esc(it.name)} → ${(LOCS.find(l=>l[0]===k)||LOCS[0])[1]}`)}
function autoSort(){const n=S.items.filter(i=>i.loc&&i.loc!==guessLoc(i)).length;
 if(!n)return toast("Tutti i prodotti sono già nella sezione consigliata.");
 if(!S.cf2){S.cf2=1;setTimeout(()=>S.cf2=0,6000);return toast(`${n} prodott${n===1?"o":"i"} che hai spostato a mano torner${n===1?"à":"anno"} nella sezione consigliata. Premi di nuovo “Smista in automatico” entro 6 secondi per confermare.`)}
 S.cf2=0;S.items.forEach(i=>{i.loc=""});save();render();toast(`🔄 ${n} prodott${n===1?"o rimesso":"i rimessi"} nella sezione automatica`)}
function vDisp(){
 const s=soon();let h=s.length?`<div class="al">⚠️ In scadenza: <b>${s.map(i=>esc(i.name)).join(", ")}</b>. <a href="#" onclick="S.tab='ricette';render();return false">Trova ricette per evitare sprechi →</a></div>`:"";
 const lf=S.lf||"all",cnt=k=>S.items.filter(i=>locOf(i)===k).length;
 h+=`<div style="display:flex;gap:6px;flex-wrap:wrap;margin:8px 0">${[["all","Tutto ("+S.items.length+")"],...LOCS.map(([k,n])=>[k,n+" ("+cnt(k)+")"])].map(([k,n])=>`<button class="btn ${lf===k?"":"g"}" style="padding:6px 12px;font-size:14px" onclick="S.lf='${k}';render()">${n}</button>`).join("")}<button class="btn g" style="padding:6px 12px;font-size:14px" onclick="autoSort()">🔄 Smista in automatico</button></div>`;
 if(!S.items.length)return h+`<p class="mu">La dispensa è vuota. Aggiungi la spesa dalla scheda “Aggiungi spesa”.</p>`;
 h+=sxBox("disp","Cerca un prodotto in dispensa…");CATS.forEach(c=>{const l=S.items.filter(i=>i.cat===c&&(lf==="all"||locOf(i)===lf)&&sxOk("disp",i.name)).sort((a,b)=>(a.exp||"9")<(b.exp||"9")?-1:1);if(!l.length)return;
  h+=`<h2>${CE[c]} ${c}</h2>`+l.map(i=>{const d=days(i.exp);return `<div class="card row"><div><b>${emo(i.name,i.cat)} ${esc(i.name)}</b><div class="mu">${fmt(i.q,i.u)} · ${i.exp?"scade "+i.exp.split("-").reverse().join("/"):"senza scadenza"}</div>${S.ed===i.id?`<div class="row" style="margin-top:6px;gap:6px;flex-wrap:wrap"><input id="ed" type="date" value="${i.exp}"><label class="mu" style="white-space:nowrap"><input id="en" type="checkbox" style="width:auto" ${i.exp?"":"checked"}> senza scad.</label><input id="eq" type="number" min="0" step="any" value="${/^cucchiai/.test(i.u)?i.q:Math.round(i.q)}"><span class="mu">${i.u}</span><button class="btn" style="padding:6px 14px" onclick="saveEd('${i.id}')">OK</button></div>`:""}</div><div>${i.exp?`<span class="bd ${d>3?"ok":""}">${d<0?"scaduto":d===0?"oggi":d+" gg"}</span>`:`<span class="bd ok">senza scad.</span>`} <select style="width:auto;padding:4px 6px;border-radius:99px" onchange="mv('${i.id}',this.value)" aria-label="Posizione" title="Sposta in…">${LOCS.map(([k,n])=>`<option value="${k}" ${locOf(i)===k?"selected":""}>${n}</option>`).join("")}</select><button class="x" onclick="S.ed='${i.id}';render()" aria-label="Modifica">✏️</button><button class="x" onclick="del('${i.id}')" aria-label="Elimina">✕</button></div></div>`}).join("")});
 if(S.sx_disp&&!h.includes('class="card row"'))h+=`<p class="mu">Nessun prodotto trovato per “${esc(S.sx_disp)}”.</p>`;
 return h+(S.items.some(i=>lf==="all"||locOf(i)===lf)?"":`<p class="mu">Non c’è ancora niente in questa sezione.</p>`)}
function del(id){const i=S.items.findIndex(x=>x.id===id);if(i<0)return;const x=S.items[i];S.items.splice(i,1);save();render();undoable("🗑️ Prodotto eliminato dalla dispensa.",{x,i},u=>{S.items.splice(Math.min(u.i,S.items.length),0,u.x)})}
function vAdd(){return rcpHtml()+vAdd0()}
function vAdd0(){return `<div class="card"><div class="f">
<div class="w"><input id="n" placeholder="Prodotto (es. Pasta penne)" oninput="$('c').value=guess(this.value)"></div>
<div class="w"><select id="c">${CATS.map(c=>`<option>${c}</option>`).join("")}</select></div><div class="w"><select id="loc"><option value="">Dove lo metti? Automatico</option>${LOCS.map(([k,n])=>`<option value="${k}">${n}</option>`).join("")}</select></div>
<input id="q" type="number" min="0" step="any" placeholder="Quantità"><select id="u"><option>kg</option><option>g</option><option>l</option><option>ml</option><option>pz</option><option>cucchiaio</option><option>mezzo cucchiaio</option><option>cucchiaino</option></select>
<div class="w"><label class="mu">Data di scadenza</label><input id="e" type="date" value="${addDays(7)}"><label class="mu" style="display:flex;gap:8px;align-items:center;margin-top:6px"><input id="ne" type="checkbox" style="width:auto" onchange="$('e').disabled=this.checked"> Senza scadenza</label></div>
<div class="w"><button class="btn" style="width:100%" onclick="add()">Aggiungi alla dispensa</button></div></div></div>`}
function add(){const n=$("n").value.trim(),q=parseFloat($("q").value),u=$("u").value,e=$("e").value;
 if(!n||!(q>0)||(!e&&!$("ne").checked))return toast("Compila nome, quantità e scadenza.");
 S.items.push({id:"p"+Date.now(),name:n,cat:$("c").value,q:q*U[u][1],u:U[u][0],exp:$("ne").checked?"":e,loc:$("loc").value});save();toast("Aggiunto: "+esc(n)+" → "+(LOCS.find(l=>l[0]===locOf(S.items[S.items.length-1]))||LOCS[0])[1]);
 $("n").value="";$("q").value="";$("c").value="Altro";$("loc").value="";$("ne").checked=false;$("e").disabled=false}
