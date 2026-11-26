/* Dispensa Smart - ricette.js */
const srcLinks=r=>{const q=encodeURIComponent("ricetta "+r.title),a=u=>`<a href="https://www.google.com/search?q=${q}${u}" target="_blank" rel="noopener noreferrer">`;return `<div class="mu" style="margin-top:8px">${r.origin?"🌍 Origine: "+esc(r.origin)+"<br>":""}📚 Fonte: elaborata dall’AI, non copiata da un sito. Confrontala con le fonti reali: ${a("")}Google ↗</a> · ${a("+site:giallozafferano.it")}GialloZafferano ↗</a> · ${a("+site:cucchiaio.it")}Cucchiaio d’Argento ↗</a></div>`};
const BASIC=/^(acqua|sale|pepe|ghiaccio)\b/i;
const inList=g=>S.shop.some(x=>!x.done&&nm(x.name)===nm(g.name));
const miss=r=>r.ingredients.filter(g=>avail(g).st!=="ok").length;
const avTxt=r=>{const m=miss(r);return m?`🛒 mancano ${m} ingredient${m===1?"e":"i"}`:"✅ hai tutto"};
const ingList=r=>r.ingredients.map(g=>avail(g).st==="ok"?esc(g.name):`<span style="color:var(--mu);opacity:.6">${esc(g.name)}</span>`).join(", ");
function vSearch(){
 let h=`<div class="card"><p style="margin:0 0 10px">Cerca una ricetta specifica (es. “carbonara” o “tiramisù senza uova”).</p><div class="row"><input id="q2" value="${esc(S.q)}" placeholder="Cosa vuoi cucinare?" onkeydown="if(event.key==='Enter')srch()"><button class="btn" ${S.sb?"disabled":""} onclick="srch()">${S.sb?"…":"Cerca"}</button></div>${S.q?`<p class="mu" style="margin:10px 0 0"><a href="https://www.google.com/search?q=${encodeURIComponent("ricetta "+S.q)}" target="_blank" rel="noopener noreferrer">Cerca anche sul web ↗</a></p>`:""}</div>`;
 if(S.serr)h+=`<div class="al">${esc(S.serr)}</div>`;
 return h+S.srch.map((r,i)=>`<div class="card"><div class="row" style="cursor:pointer" onclick="openS(${i})">${th(r)}<div style="flex:1"><b>${esc(r.title)}</b> ${srcB(r)}${r.course?` <span class="bd">${esc(r.course)}</span>`:""}<div class="mu">${r.time||""} · ${r.steps.length} step · ${ingList(r)}<br>${avTxt(r)}</div></div><span>›</span></div>${srcLinks(r)}<div style="margin-top:10px"><button class="btn g" onclick="toShop(S.srch[${i}])">🛒 Aggiungi alla lista della spesa</button> <button class="btn g" onclick="saveR(S.srch[${i}])">💾 Salva nel ricettario</button></div></div>`).join("")}
async function srch(){const q=$("q2").value.trim();if(!q)return;S.q=q;S.sb=true;S.serr="";render();
 try{const cs=window.PIATTI?pzFind(q):[];
  if(cs.length){const w=await pzWrite(cs,false,/senza/i.test(q)?q:"");if(w.length){S.srch=w;S.sb=false;render();return}}
  try{const ts=await wbSearch(q,3).then(l=>l.filter(t=>!isDis(wbTitle(t)))),pg=(await Promise.all(ts.map(async t=>({t,txt:await wbText(t).catch(()=>"")})))).filter(p=>p.txt.length>150);
   if(pg.length){const w=(await wbWrite(pg,false,"")).filter(recSane).filter(recOk);if(w.length){S.srch=w;S.sb=false;render();return}}}catch(e){}
  const sm=await claude.use("sample");if(!sm)throw new Error("L’agente AI non è disponibile in questa vista.");
  const r=await sm.json(`Sei uno chef italiano esperto di cucina tradizionale. ${REALP}${dietTxt()} L'utente cerca ricette per: "${q}". Proponi 3 ricette diverse e complete (versioni tradizionali o varianti note e pertinenti); se la richiesta non corrisponde a un piatto reale, proponi i piatti reali più vicini. Quantità per 2 persone. Ogni ingrediente: {"id":null,"name","amount","unit"} con unit solo "g","ml" o "pz" (converti kg in g e l in ml; amount 0 se q.b.). Rispondi SOLO con un array JSON: [{"title":"","emoji":"🍝","origin":"es. Tradizionale romana","course":"Antipasto|Primo|Secondo|Contorno|Dolce","time":"30 min","ingredients":[{"id":null,"name":"","amount":0,"unit":"g","alt":["alternativa"]}],"steps":["..."]}]. Da 4 a 8 step chiari, in italiano. In origin indica in poche parole la tradizione o la regione della ricetta; non inventare nomi di siti, libri o autori. Nei nomi degli ingredienti usa nomi generici senza marche e senza aggettivi di stato o temperatura (scrivi «latte», non «latte tiepido»), ma per le farine indica sempre il tipo (00, 0, manitoba, integrale…); indica in alt 1-2 alternative valide, tranne che per le farine.`,{modelTier:"default"});
  S.srch=(Array.isArray(r)?r:r.recipes||[]).filter(x=>x&&x.title&&x.steps&&x.ingredients).map(x=>({...x,src:"web",course:COURSES.includes(x.course)?x.course:""})).filter(recSane).filter(recOk);
  if(!S.srch.length)throw new Error("Nessun risultato, riprova.")
 }catch(e){S.serr=e.code==="not_granted"?"Permesso AI negato.":(e.message||"Errore, riprova.")}
 S.sb=false;render()}
function openS(i){S.cur=S.srch[i];S.step=0;S.done={};S.from="cerca";S.tab="ricette";render()}
const NROW=`<div class="f" style="grid-template-columns:2fr 1fr 1fr;margin-bottom:6px"><input class="in" placeholder="Ingrediente"><input class="ia" type="number" min="0" step="any" placeholder="Qtà"><select class="iu"><option>g</option><option>kg</option><option>ml</option><option>l</option><option>pz</option><option>cucchiaio</option><option>mezzo cucchiaio</option><option>cucchiaino</option></select><input class="ial" placeholder="Alternative (facoltativo, separate da virgola)" style="grid-column:1/-1"></div>`;
function vNew(){
 return `<div class="card">${(S.impLink="","")}<h2 style="margin-top:0">🔗 Inserisci ricetta da link</h2><input id="lk" type="url" placeholder="https://… (link della ricetta)"><textarea id="lt" rows="3" placeholder="Facoltativo: se il link non si apre, incolla qui il testo della ricetta" style="width:100%;margin-top:8px;padding:10px;border:1px solid var(--bd);border-radius:22px;background:var(--card);color:var(--tx);font:inherit"></textarea><button class="btn" id="lb" style="width:100%;margin-top:8px" onclick="imp()">Estrai ricetta con l’AI</button><p class="mu" style="margin:8px 0 0">L’AI compila il modulo qui sotto: controllalo e poi salva.</p></div><div class="card"><h2 style="margin-top:0">${S.edId?"✏️ Modifica ricetta":"✍️ Inserisci una ricetta"}</h2><div class="f"><div class="w"><input id="mt" placeholder="Titolo della ricetta"></div><div class="w"><input id="mp" type="number" min="1" step="1" placeholder="Per quante persone è la ricetta? (vuoto = 2)"></div><div class="w"><select id="mc"><option value="">Tipo di portata…</option><option>Antipasto</option><option>Primo</option><option>Secondo</option><option>Contorno</option><option>Dolce</option><option>Altro</option></select></div><input id="mm" placeholder="Preparazione (es. 20 min)"><input id="mk" placeholder="Cottura (es. 30 min)"></div><h2 style="font-size:15px">Ingredienti</h2><div id="ig">${NROW+NROW+NROW}</div><button class="btn g" onclick="$('ig').insertAdjacentHTML('beforeend',NROW)">＋ Ingrediente</button><h2 style="font-size:15px">Procedimento</h2><textarea id="ms" rows="6" placeholder="Un passaggio per riga" style="width:100%;padding:10px;border:1px solid var(--bd);border-radius:22px;background:var(--card);color:var(--tx);font:inherit"></textarea><h2 style="font-size:15px">Note</h2><textarea id="mn" rows="3" placeholder="Eventuali note (consigli, varianti, conservazione…)" style="width:100%;padding:10px;border:1px solid var(--bd);border-radius:22px;background:var(--card);color:var(--tx);font:inherit"></textarea><p class="mu">Verrà salvata nel Ricettario, segnata come “inserita manualmente” (o “importata da link”).</p><button class="btn" style="width:100%" onclick="saveNew()">${S.edId?"Salva modifiche":"Salva ricetta"}</button>${S.edId?`<button class="btn g" style="width:100%;margin-top:8px" onclick="S.edId=null;S.tab='ricettario';render()">Annulla</button>`:""}</div>`+(0?`<h2>Le tue ricette</h2>`+S.mine.map((r,i)=>`<div class="card row" style="cursor:pointer" onclick="openM(${i})">${th(r)}<div style="flex:1"><b>${esc(r.title)}</b> ${srcB(r)}<div class="mu">${esc(r.time||"")} · ${r.steps.length} step · ${r.ingredients.length} ingredienti</div></div><button class="x" onclick="event.stopPropagation();delM(${i})" aria-label="Elimina">✕</button></div>`).join(""):"")}
const REALP="REGOLA FONDAMENTALE: proponi SOLO piatti realmente esistenti della cucina italiana (o internazionale nota), con il loro nome vero e di cui conosci la tradizione o la regione. NON inventare abbinamenti nuovi o strani. Cacao, cioccolato, vaniglia e zucchero a velo vanno SOLO nei dolci, mai in piatti salati; un primo è pasta, riso, gnocchi, polenta o zuppa; i dolci non contengono carne, pesce, aglio, cipolla o pomodoro.";
const RC_SWEET=/cacao|cioccolat|nutella|vanill|savoiard|zucchero a velo|gocce di|crema pasticcera|canditi|pan di spagna/,RC_SAVORY=/carne|manzo|maiale|pollo|tacchino|vitello|pesce|tonno|salmone|prosciutto|pancetta|speck|salsiccia|\baglio\b|cipoll|passata|pelati|pomodor|brodo|spaghetti|pecorino|parmigiano|acciug|\bsalame\b/,RC_BASE=/riso|pasta|spaghetti|penne|fusilli|tagliat|rigaton|maccheron|lasagn|gnocch|farina|semolin|orzo|farro|cuscus|couscous|polenta|pane|legum|lenticch|ceci|fagiol|zuppa|minestr|crespell|crepes|cannellon|ravioli|tortellin|cappelletti|pastina|vellutata|passato|verdur|patat|zucca|zucchin|carot|funghi|spinaci|cavol|bietol/;
const RC_TIT={risotto:/riso/,"gnocchi":/gnocch|patat|farina|semolin/,"frittata":/uov/,"omelette":/uov/,"pizza":/farina|impasto|pane/,"focaccia":/farina|impasto|pane/,"lasagn":/lasagn|pasta|besciamella|farina/,"carbonara":/pasta|spaghetti|rigaton|bucatini|penne|tagliat|maccheron/,"amatriciana":/pasta|spaghetti|rigaton|bucatini|penne|maccheron/,"cacio e pepe":/pasta|spaghetti|tonnarell|bucatini|rigaton|maccheron/,"pasta ":/pasta|spaghetti|penne|fusilli|tagliat|rigaton|maccheron|bucatini|linguine|farfalle|orecchiette|paccher|ditalin|tortigl|conchigl/,"torta":/farina|amido|savoiardi|biscott|pan di spagna|pasta (frolla|sfoglia|brisè|brisee)|riso|polenta|mandorle|nocciole|pane/,"crostata":/farina|pasta (frolla|sfoglia|brisè|brisee)/,"biscott":/farina|mandorle|nocciole|amido/,"plumcake":/farina/,"ciambell":/farina/,"muffin":/farina/,"tiramis":/savoiardi|biscott|mascarpone/};
function recSane(r){if(!r||!r.title)return false;const t=String(r.title).toLowerCase(),c=r.course||"",ings=(r.ingredients||[]).map(g=>String(g&&g.name||"").toLowerCase());
 if(ings.some(n=>!n))return false;
 const all=ings.join(" | "),dolceT=/dolce|torta|crostata|biscott|budino|tiramis|panna cotta|cheesecake|plumcake|ciambell|muffin|crema|mousse|semifreddo|gelato|cioccolat|brownie|zabaglione|panettone|cannol|bign/.test(t);
 if(c!=="Dolce"&&RC_SWEET.test(all.replace(/pan di spagna/g,""))&&!((c===""||c==="Altro")&&dolceT))return false;
 if(c==="Dolce"&&RC_SAVORY.test(all.replace(/pasta (frolla|sfoglia|brisè|brisee|di mandorle)/g,"")))return false;
 if(c&&c!=="Dolce"&&c!=="Altro"&&/torta di (mele|ricotta|nocciol|carote|limone)|crostata di|biscott|tiramis|panna cotta|cheesecake|plumcake|brownie/.test(t))return false;
 if(c==="Primo"&&!(ings.some(n=>RC_BASE.test(n))||/zuppa|minestr|vellutata|crema di|passato|pappa|ribollita|panzanella|brodo/.test(t)))return false;
 if(c==="Secondo"&&/risotto|^pasta |spaghetti|lasagn/.test(t))return false;
 for(const k in RC_TIT)if(t.includes(k)&&!ings.some(n=>RC_TIT[k].test(n)))return false;
 return true}
const COURSES=["Antipasto","Primo","Secondo","Contorno","Dolce","Altro"],CDEF={Antipasto:"piccolo piatto freddo o caldo da inizio pasto, per esempio bruschette, tartine, sformatini",Primo:"pasta, riso, gnocchi, zuppe o minestre",Secondo:"piatto principale a base di carne, pesce, uova, formaggi o legumi, SENZA pasta o riso come base e senza dolci",Contorno:"verdure, patate o insalate che accompagnano un secondo",Dolce:"dessert, torte, biscotti, creme, budini"};
async function imp(){const lk=$("lk").value.trim(),tx=$("lt").value.trim();
 if(!lk&&!tx)return toast("Inserisci un link o incolla il testo della ricetta.");
 if(lk&&!/^https?:\/\/\S+$/i.test(lk))return toast("Il link deve iniziare con http:// o https://");
 const b=$("lb");b.disabled=true;b.textContent="Sto leggendo la ricetta…";
 try{const sm=await claude.use("sample");if(!sm)throw new Error("L’agente AI non è disponibile in questa vista.");
  const src=tx?`Testo della pagina:\n"""${tx.slice(0,12000)}"""`:`Link: ${lk}\nLeggi la pagina SOLO se riesci davvero ad aprirla. Se non puoi accedere al contenuto, rispondi {"error":"non_accessibile"}. Non inventare e non ricostruire la ricetta dal titolo o dall'URL.`;
  const r=await sm.json(`Estrai la ricetta dal contenuto seguente senza aggiungere nulla che non sia presente. ${src}\nRispondi SOLO con JSON: {"title":"","course":"Antipasto|Primo|Secondo|Contorno|Dolce|Altro","time":"tempo di preparazione","cook":"tempo di cottura","servings":0,"notes":"note presenti nel testo, altrimenti vuoto","ingredients":[{"name":"","amount":0,"unit":"g|ml|pz"}],"steps":["..."]}. Converti kg in g e l in ml (amount 0 se q.b.). Se nel contenuto non c'è una ricetta rispondi {"error":"nessuna_ricetta"}.`,{modelTier:"default"});
  if(r.error)throw new Error(r.error==="non_accessibile"?"Non riesco ad aprire questo link. Incolla qui sotto il testo della ricetta e riprova.":"Non ho trovato una ricetta in questo contenuto.");
  if(!r.title||!r.steps||!r.steps.length||!r.ingredients||!r.ingredients.length)throw new Error("Estrazione non riuscita, riprova.");
  $("mt").value=r.title;$("mp").value=r.servings>0?r.servings:"";$("mm").value=r.time||"";$("mk").value=r.cook||"";$("mn").value=r.notes||"";$("mc").value=COURSES.includes(r.course)?r.course:"";$("ms").value=r.steps.join("\n");
  $("ig").innerHTML=r.ingredients.map(()=>NROW).join("");
  [...document.querySelectorAll("#ig .f")].forEach((f,i)=>{const g=r.ingredients[i];f.querySelector(".in").value=g.name||"";f.querySelector(".ia").value=g.amount||"";f.querySelector(".iu").value=["g","ml","pz"].includes(g.unit)?g.unit:"g"});
  S.impLink=lk;toast("✅ Ricetta estratta: controlla ingredienti e passaggi nel modulo qui sotto, poi salva.");$("mt").scrollIntoView({behavior:"smooth"})
 }catch(e){toast(esc(e.code==="not_granted"?"Permesso AI negato.":e.message||"Errore, riprova."))}
 b.disabled=false;b.textContent="Estrai ricetta con l’AI"}
function saveNew(){const t=$("mt").value.trim(),st=$("ms").value.split("\n").map(s=>s.trim()).filter(Boolean);
 const ig2=[...document.querySelectorAll("#ig .f")].map(f=>{const n=f.querySelector(".in").value.trim(),a=parseFloat(f.querySelector(".ia").value)||0,u=f.querySelector(".iu").value;return n&&{id:null,name:n,amount:a*U[u][1],unit:U[u][0],alt:((f.querySelector(".ial")||{}).value||"").split(",").map(x=>x.trim()).filter(Boolean)}}).filter(Boolean);
 if(!t||!ig2.length||!st.length)return toast("Servono titolo, almeno un ingrediente e un passaggio.");
 const e=emo(t);const ob=({id:"m"+Date.now(),title:t,emoji:e==="🛒"?"📖":e,base:Math.max(1,parseInt($("mp").value)||2),time:$("mm").value.trim(),cook:$("mk").value.trim(),course:$("mc").value,notes:$("mn").value.trim(),ingredients:ig2,steps:st,src:S.impLink?"link":"manual",link:S.impLink||""});S.impLink="";const k=S.edId?S.mine.findIndex(m=>m.id===S.edId):-1;
 if(k>=0){const o=S.mine[k];S.mine[k]={...o,...ob,id:o.id,src:o.src||ob.src,link:o.link||ob.link,emoji:o.emoji||ob.emoji};if(o.title!==ob.title)moveMeta(o.title,ob.title);S.cur=null}else S.mine.unshift(ob);S.edId=null;
 save();S.tab="ricettario";render();toast(k>=0?"✅ Modifiche salvate":"✅ Ricetta salvata nel Ricettario")}
function vBook(){
 const f=S.rf||"all",L2=S.mine.map((r,i)=>[r,i]).filter(([r])=>(f==="all"||(r.src||"ai")===f)&&(!S.rc||r.course===S.rc)&&inColl(r)&&sxOk("book",r.title+" "+(r.ingredients||[]).map(g=>g.name).join(" ")));
 const chips=[["all","Tutte"],["ai","🤖 AI"],["web","🔎 Cercate"],["link","🔗 Da link"],["manual","✍️ Manuali"]].map(([k,n])=>`<button class="btn ${f===k?"":"g"}" style="padding:6px 12px;font-size:14px" onclick="S.rf='${k}';render()">${n}</button>`).join(" ");
 let h=`<div class="card"><b>📖 Il tuo Ricettario</b><div class="mu">${S.mine.length} ricett${S.mine.length===1?"a salvata":"e salvate"}. Qui salvi le ricette tue, così restano separate dai suggerimenti della scheda Ricette AI.</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px">${chips}</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px">${["",...COURSES].map(k=>`<button class="btn ${(S.rc||"")===k?"":"g"}" style="padding:6px 12px;font-size:14px" onclick="S.rc='${k}';render()">${k||"Tutte le portate"}</button>`).join(" ")}</div></div>`;h+=collBar();h+=sxBox("book","Cerca una ricetta o un ingrediente…");
 if(!L2.length)return h+`<p class="mu">Nessuna ricetta${f==="all"?" salvata":" in questa categoria"}. Apri una ricetta e tocca “💾 Salva nel ricettario”, oppure creane una da “Nuova ricetta”.</p>`;
 return h+L2.map(([r,i])=>{const l=S.lib[r.title]||{};return `<div class="card row" style="cursor:pointer" onclick="openM(${i})">${th(r)}<div style="flex:1"><b>${esc(r.title)}</b> ${srcB(r)}${r.course?` <span class="bd">${esc(r.course)}</span>`:""}<div class="mu">${esc(r.time||"")} · ${r.steps.length} step · ${r.ingredients.length} ingredienti · ${avTxt(r)}${l.stars?" · "+"★".repeat(l.stars):""}</div></div><button class="x" onclick="event.stopPropagation();S.cm=S.cm==='${r.id}'?null:'${r.id}';render()" aria-label="Raccolte">📁</button><button class="x" onclick="event.stopPropagation();editM(${i})" aria-label="Modifica">✏️</button><button class="x" onclick="event.stopPropagation();delM(${i})" aria-label="Elimina">✕</button></div>${S.cm&&S.cm===r.id?collPick(r):""}`}).join("")}
function inBook(r){return S.mine.some(m=>m.title===r.title)}
function saveR(r){if(inBook(r))return toast("Questa ricetta è già nel Ricettario.");const c=JSON.parse(JSON.stringify(r));delete c.exp;c.id="m"+Date.now();S.mine.unshift(c);save();const q2=$("q2"),qv=q2&&q2.value;render();if(qv!=null&&$("q2"))$("q2").value=qv;
 toast(`💾 Salvata nel Ricettario<br><a href="#" onclick="S.tab='ricettario';render();return false" style="color:inherit;font-weight:700">Apri il Ricettario →</a>`)}
function openR(r,from){S.cur=r;S.step=0;S.done={};S.from=from;S.tab="ricette";render()}
function fillForm(r){$("mt").value=r.title;$("mp").value=r.base||"";$("mm").value=r.time||"";$("mk").value=r.cook||"";$("mn").value=r.notes||"";$("mc").value=COURSES.includes(r.course)?r.course:"";$("ms").value=r.steps.join("\n");
 $("ig").innerHTML=r.ingredients.map(()=>NROW).join("");
 [...document.querySelectorAll("#ig .f")].forEach((f,i)=>{const g=r.ingredients[i];let a=+g.amount||0,u=g.unit||"g";if(u==="g"&&a>=1000&&a%1000===0){a/=1000;u="kg"}else if(u==="ml"&&a>=1000&&a%1000===0){a/=1000;u="l"}else if(u==="cucchiai"){if(a===.5){a=1;u="mezzo cucchiaio"}else u="cucchiaio"}else if(u==="cucchiaini")u="cucchiaino"
  f.querySelector(".in").value=g.name||"";{const al=f.querySelector(".ial");if(al)al.value=(g.alt||[]).join(", ")}f.querySelector(".ia").value=a||"";f.querySelector(".iu").value=["g","kg","ml","l","pz"].includes(u)?u:"g"})}
function moveMeta(a,b){if(S.ph[a]){S.ph[b]=S.ph[a];delete S.ph[a];W("ph",S.ph);phDel(a);phPush(b)}if(S.lib[a]){S.lib[b]={...S.lib[a]};if(S.lib[b].r)S.lib[b].r={...S.lib[b].r,title:b};delete S.lib[a]}}
function editM(i){const r=S.mine[i];if(!r)return;S.edId=r.id;S.tab="nuova";render();fillForm(r);window.scrollTo(0,0)}
function openM(i){S.cur=S.mine[i];S.step=0;S.done={};S.from="ricettario";S.tab="ricette";render()}
function delM(i){const r=S.mine[i];if(!r)return;const cs=S.coll.map(c=>[c.id,c.ids.slice(),c.u]);S.mine.splice(i,1);save();render();undoable("🗑️ Ricetta eliminata.",{r,i,cs},u=>{S.mine.splice(Math.min(u.i,S.mine.length),0,u.r);u.cs.forEach(([id,ids,uu])=>{const c=S.coll.find(x=>x.id===id);if(c){c.ids=ids;c.u=uu}})})}
function vOggi(){const g=welcomeHtml();return g+demoBar()+vOggi0()+(g?"":`<div style="text-align:center;margin:14px 0"><button class="btn g" ${BS} onclick="S.tab='guida';render()">ℹ️ Cosa puoi fare con l’app</button></div>`)}
function vOggi0(){
 const s=soon(),ids=new Set(s.map(i=>i.id)),op=S.shop.filter(x=>!x.done).length;
 const info=S.mine.map((r,i)=>({r,i,k:"m"})).map(o=>({...o,m:miss(o.r),ex:o.r.ingredients.some(g=>{const a=avail(g);return a.it&&ids.has(a.it.id)})}));
 const now=info.filter(o=>o.m===0).sort((a,b)=>b.ex-a.ex).slice(0,6),almost=info.filter(o=>o.m>0&&o.m<=2).sort((a,b)=>a.m-b.m).slice(0,4);
 const tile=o=>`<div class="card row" style="cursor:pointer" onclick="${o.k==="m"?`openM(${o.i})`:`open_(${o.i})`}">${th(o.r)}<div style="flex:1"><b>${esc(o.r.title)}</b>${o.ex?' <span class="bd">usa prodotti in scadenza</span>':""}<div class="mu">${esc(o.r.time||"")}${o.r.course?" · "+esc(o.r.course):""}<br>${avTxt(o.r)}</div></div><span>›</span></div>`;
 let h=`<div class="card"><b style="font-size:18px">${new Date().toLocaleDateString("it-IT",{weekday:"long",day:"numeric",month:"long"})}</b><div class="mu" style="margin-top:4px">🥫 ${S.items.length} prodotti · ⚠️ ${s.length} in scadenza · 🛒 ${op} da comprare</div></div>`;
 h+=scadHtml();
 const dk=["dom","lun","mar","mer","gio","ven","sab"][new Date().getDay()],PL=S.plan&&S.plan.start===weekStart()?S.plan:null,tm=PL&&PL.days[dk];
 h+=offBanner();if(tm&&(tm.pranzo||tm.cena))h+=`<h2>📅 Oggi a tavola</h2>`+["pranzo","cena"].filter(k=>tm[k]).map(k=>`<div class="card row" style="cursor:pointer" onclick="planOpen('${dk}','${k}')">${th(tm[k].r)}<div style="flex:1"><div class="mu">${k==="pranzo"?"☀️ Pranzo":"🌙 Cena"}</div><b>${esc(tm[k].r.title)}</b>${tm[k].done?' <span class="bd ok">✅ completato</span>':""}</div><span>›</span></div>`).join("");
 h+=`<h2>🍽️ Puoi cucinarle ora</h2>`+(now.length?now.map(tile).join(""):`<p class="mu">Nessuna ricetta del Ricettario è realizzabile con la dispensa di adesso.</p>`);
 if(almost.length)h+=`<h2>🛒 Quasi pronte</h2>`+almost.map(tile).join("");
 if(S.recs.length)h+=`<h2>✨ Suggerite dall’AI</h2>`+S.recs.map((r,i)=>tile({r,i,k:"a",ex:r.exp})).join("");
 return h+`<div class="row" style="gap:8px;flex-wrap:wrap;margin-top:14px"><button class="btn" onclick="S.tab='ricette';render()">✨ Nuove ricette dall’AI</button><button class="btn g" onclick="S.tab='add';render()">➕ Aggiungi prodotto</button><button class="btn g" onclick="S.tab='lista';render()">🛒 Lista spesa</button></div>`}
function byName(name,unit,any){const rt=toks(name,1);if(!rt.length)return null;let best=null,bs=Infinity;
 S.items.forEach(i=>{if(!any&&i.u!==unit)return;const pt=toks(i.name);if(!rt.every(t=>pt.includes(t)))return;const ex=pt.filter(t=>!rt.includes(t));if(ex.some(t=>VAR.has(t)))return;const sc=ex.length*1e6-i.q;if(sc<bs){bs=sc;best=i}});return best}
const SUBS=[["lievito di birra",["lievito secco","lievito istantaneo"]],["lievito secco",["lievito di birra"]],["burro",["margarina"]],["latte",["latte vegetale","latte di soia"]],["panna",["panna vegetale"]],["zucchero",["zucchero di canna"]],["olio di semi",["olio di girasole","olio di mais"]],["olio extravergine",["olio di oliva"]],["parmigiano",["grana padano"]],["grana padano",["parmigiano"]],["passata",["pelati","polpa di pomodoro"]],["pancetta",["guanciale","speck"]],["guanciale",["pancetta"]],["cipolla",["scalogno"]]];
const altOf=g=>{const rt=toks(g.name,1);if(rt.includes("farin"))return[];const out=[...(Array.isArray(g.alt)?g.alt:[])];
 SUBS.forEach(([k,v])=>{const kt=toks(k,1);if(!kt.length||!kt.every(t=>rt.includes(t))||rt.some(t=>VAR.has(t)&&!kt.includes(t)))return;v.forEach(x=>{if(!out.includes(x))out.push(x)})});
 return out.filter(x=>x&&nm(x)!==nm(g.name))};
function find(g){let it=null,note=false,via="";
 if(g.id){it=S.items.find(i=>i.id===g.id)||null;if(it&&/farin/.test(nm(g.name))){const rt=toks(g.name,1),pt=toks(it.name);if(!rt.every(t=>pt.includes(t)))it=null}}
 if(!it)it=byName(g.name,g.unit,false);
 if(!it){it=byName(g.name,g.unit,true);note=!!it}
 if(!it)for(const a of altOf(g)){let x=byName(a,g.unit,false),n=false;if(!x){x=byName(a,g.unit,true);n=!!x}if(x){it=x;via=a;note=n;break}}
 return{it,note,via}}
const matchIt=g=>{const f=find(g);return f.note?undefined:f.it||undefined};
function avail(g){if(BASIC.test(g.name||""))return{st:"ok"};const f=find(g),it=f.it,amt=+g.amount||0;
 if(!it)return{st:"no"};
 if(f.note)return{st:"ok",it,note:true,via:f.via};
 return amt>0&&it.u===g.unit&&it.q<amt?{st:"part",it,via:f.via}:{st:"ok",it,via:f.via}}
/* ===== porzioni ===== */
const baseOf=r=>+r.base>0?+r.base:2;
const sc1=(a,f,u)=>{const v=(+a||0)*f;if(u==="pz")return Math.max(.5,Math.round(v*2)/2);return v>=10?Math.round(v):Math.round(v*10)/10};
function cr(){const r=S.cur;if(!r)return r;const b=baseOf(r);if(S.porFor!==r.title){S.porFor=r.title;S.por=b}if(!(S.por>0))S.por=b;
 if(S.por===b)return r;const f=S.por/b;return{...r,base:S.por,ingredients:r.ingredients.map(g=>({...g,amount:g.amount?sc1(g.amount,f,g.unit):g.amount}))}}
function setPor(d){cr();S.por=Math.max(1,Math.min(24,S.por+d));render()}
const porUI=()=>{const b=baseOf(S.cur);return `<div class="card row"><div><b>👥 Porzioni</b><div class="mu">${S.por===b?"Quantità originali della ricetta (per "+b+")":"Ricalcolate da "+b+" a "+S.por}</div></div><div style="display:flex;gap:10px;align-items:center"><button class="btn g" style="padding:4px 14px" onclick="setPor(-1)" aria-label="Meno porzioni">−</button><b style="font-size:20px">${S.por}</b><button class="btn g" style="padding:4px 14px" onclick="setPor(1)" aria-label="Più porzioni">＋</button></div></div>`};
S.mine.forEach(r=>{if(!r.id)r.id="m"+Date.now()+Math.random().toString(36).slice(2,6)});

/* ===== raccolte (come le playlist) ===== */
const cid=()=>"c"+Date.now()+Math.random().toString(36).slice(2,5),ctouch=c=>{c.u=Date.now();return c};
const inColl=r=>{if(!S.rcoll)return true;const c=S.coll.find(x=>x.id===S.rcoll);return !!c&&c.ids.includes(r.id)};
const collN=c=>S.mine.filter(r=>c.ids.includes(r.id)).length;
function collBar(){
 let h=`<div class="card"><b>📁 Raccolte</b><div class="mu">Come le playlist: crea una raccolta e mettici le ricette che vuoi. Una ricetta può stare in più raccolte.</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:10px"><button class="btn ${S.rcoll?"g":""}" ${BS} onclick="S.rcoll='';render()">Tutte (${S.mine.length})</button>${S.coll.map(c=>`<button class="btn ${S.rcoll===c.id?"":"g"}" ${BS} onclick="S.rcoll='${c.id}';render()">📁 ${esc(c.name)} (${collN(c)})</button>`).join("")}<button class="btn g" ${BS} onclick="S.cnew=!S.cnew;render()">＋ Nuova raccolta</button></div>`;
 if(S.cnew)h+=`<div style="margin-top:10px"><input id="cn" placeholder="Nome (es. Ricettario dei Pao)"><label class="mu" style="display:flex;gap:8px;align-items:center;margin-top:6px"><input id="cna" type="checkbox" style="width:auto"> Aggiungi subito tutte le ricette inserite manualmente</label><div style="display:flex;gap:6px;margin-top:8px"><button class="btn" onclick="collNew()">Crea</button><button class="btn g" onclick="S.cnew=false;render()">Annulla</button></div></div>`;
 const c=S.coll.find(x=>x.id===S.rcoll);
 if(c)h+=`<div style="margin-top:12px;border-top:2px dashed var(--bd);padding-top:10px"><div class="row" style="gap:6px"><input id="crn" value="${esc(c.name)}"><button class="btn g" ${BS} onclick="collRename('${c.id}')">Salva nome</button></div><div class="mu" style="margin:10px 0 4px">Aggiungi in blocco a questa raccolta:</div><div style="display:flex;gap:6px;flex-wrap:wrap">${[["manual","✍️ manuali"],["link","🔗 da link"],["web","🔎 cercate"],["ai","🤖 AI"]].map(([k,n])=>`<button class="btn g" ${BS} onclick="collBulk('${c.id}','${k}')">＋ ${n}</button>`).join("")}</div><div style="margin-top:10px"><button class="btn g" ${BS} onclick="collDel('${c.id}')">🗑️ Elimina raccolta</button></div></div>`;
 return h+`</div>`}
const collPick=r=>`<div class="card"><b>📁 Raccolte per “${esc(r.title)}”</b>${S.coll.length?S.coll.map(c=>`<label style="display:flex;gap:10px;align-items:center;margin-top:8px;cursor:pointer"><input type="checkbox" style="width:22px;height:22px;flex:none" ${c.ids.includes(r.id)?"checked":""} onchange="collTog('${c.id}','${r.id}')">📁 ${esc(c.name)}</label>`).join(""):`<div class="mu" style="margin-top:6px">Non hai ancora raccolte.</div>`}<div class="row" style="margin-top:10px;gap:6px"><input id="cq" placeholder="Nuova raccolta…"><button class="btn" onclick="collMake('${r.id}')">Crea e aggiungi</button></div></div>`;
function collNew(){const n=($("cn").value||"").trim();if(!n)return toast("Dai un nome alla raccolta.");const c=ctouch({id:cid(),name:n,ids:[]});if($("cna").checked)c.ids=S.mine.filter(r=>(r.src||"ai")==="manual").map(r=>r.id);S.coll.push(c);S.rcoll=c.id;S.cnew=false;save();render();toast(`📁 Raccolta “${esc(n)}” creata (${c.ids.length} ricette)`)}
function collRename(id){const c=S.coll.find(x=>x.id===id),n=($("crn").value||"").trim();if(!c||!n)return;c.name=n;ctouch(c);save();render();toast("Nome salvato")}
function collDel(id){const c=S.coll.find(x=>x.id===id);if(!c)return;if(S.cd!==id){S.cd=id;setTimeout(()=>{S.cd=null},6000);return toast("Eliminare la raccolta? Le ricette restano nel Ricettario. Premi di nuovo 🗑️ entro 6 secondi.")}
 S.cd=null;const ci=S.coll.findIndex(x=>x.id===id),cs=JSON.parse(JSON.stringify(c));S.coll=S.coll.filter(x=>x.id!==id);S.cdel=[...S.cdel.filter(x=>x.id!==id),{id,u:Date.now()}].slice(-50);S.rcoll="";save();render();undoable("🗑️ Raccolta eliminata.",{cs,ci},u=>{S.cdel=S.cdel.filter(x=>x.id!==u.cs.id);u.cs.u=Date.now();S.coll.splice(Math.min(u.ci,S.coll.length),0,u.cs)})}
function collBulk(id,k){const c=S.coll.find(x=>x.id===id);if(!c)return;let n=0;S.mine.forEach(r=>{if((r.src||"ai")===k&&!c.ids.includes(r.id)){c.ids.push(r.id);n++}});if(n)ctouch(c);save();render();toast(n?`📁 ${n} ricette aggiunte`:"Nessuna ricetta nuova da aggiungere.")}
function collTog(cidv,rid){const c=S.coll.find(x=>x.id===cidv);if(!c)return;const i=c.ids.indexOf(rid);if(i>=0)c.ids.splice(i,1);else c.ids.push(rid);ctouch(c);save();render()}
function collMake(rid){const n=($("cq").value||"").trim();if(!n)return toast("Scrivi il nome della nuova raccolta.");S.coll.push(ctouch({id:cid(),name:n,ids:[rid]}));save();render();toast(`📁 Raccolta “${esc(n)}” creata`)}

/* ===== volantini ===== */
function scadHtml(){const L=S.items.filter(i=>i.exp&&days(i.exp)<=3).sort((a,b)=>a.exp<b.exp?-1:1);if(!L.length)return"";
 const G=[["Scaduti",i=>days(i.exp)<0],["Scadono oggi",i=>days(i.exp)===0],["Scadono domani",i=>days(i.exp)===1],["Entro 3 giorni",i=>days(i.exp)>=2]];
 return `<div class="card" style="border-color:var(--wa)"><b>⏰ Da consumare presto</b>${G.map(([t,f])=>{const a=L.filter(f);return a.length?`<div style="margin-top:8px"><span class="bd">${t}</span> ${a.map(i=>esc(i.name)+" ("+fmt(i.q,i.u)+")").join(" · ")}</div>`:""}).join("")}<div class="row" style="gap:6px;flex-wrap:wrap;justify-content:flex-start;margin-top:10px"><button class="btn" ${BS} onclick="S.tab='ricette';render()">🍽️ Ricette per consumarli</button><button class="btn g" ${BS} onclick="S.tab='dispensa';render()">Apri la dispensa</button></div></div>`}
const isCook=()=>S.cook===undefined?(S.cook=lsg("cook","")==="1"):S.cook;
async function cookWake(on){try{if(on&&navigator.wakeLock){S.wl=await navigator.wakeLock.request("screen");S.wl.addEventListener("release",()=>{S.wl=null})}else if(S.wl){const w=S.wl;S.wl=null;await w.release()}}catch(e){}}
function cookSync(){const want=isCook()&&S.tab==="ricette"&&!!S.cur;if(want&&!S.wl&&!S.wlb){S.wlb=true;cookWake(true).finally(()=>{S.wlb=false})}else if(!want&&S.wl)cookWake(false);
 if(!window.__cwv&&document.addEventListener){window.__cwv=1;document.addEventListener("visibilitychange",()=>{if(!document.hidden)cookSync()})}}
function cookTog(){S.cook=!isCook();lss("cook",S.cook?"1":"");render();toast(S.cook?"👨‍🍳 Modalità cucina: testo grande e schermo sempre acceso.":"Modalità cucina disattivata.")}
function vRic(){
 if(S.cur)return vCur();
 const s=soon();
 if(!S.rv){let h=`<div class="card"><p style="margin:0">${s.length?`⚠️ ${s.length} prodott${s.length>1?"i":"o"} in scadenza: le ricette che li usano compaiono per prime.`:"Ricette consigliate in base a ciò che hai in dispensa."}</p><div class="mu" style="margin-top:6px">Che cosa vuoi preparare?</div></div>`;
  if(!S.items.length)h+=`<p class="mu">Aggiungi prima qualche prodotto alla dispensa.</p>`;
  return h+`<div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin:10px 0">`+["Primo","Secondo","Contorno","Antipasto","Dolce",""].map(k=>`<button class="card" style="text-align:left;cursor:pointer;margin:0" onclick="rcPick('${k}')" aria-label="${k||"Qualsiasi portata"}"><div style="font-size:30px;line-height:1.1">${CEM[k]}</div><div style="font-weight:700;margin-top:4px">${k||"Qualsiasi"}</div><div class="mu">${rcN(k)?rcN(k)+" ricett"+(rcN(k)===1?"a":"e")+" pront"+(rcN(k)===1?"a":"e"):"Tocca per ricevere idee"}</div></button>`).join("")+`</div>`}
 const k=S.gc||"";let h=`<div class="row" style="margin:6px 0 12px"><button class="btn g" style="padding:8px 14px" onclick="rcBack()">← Portate</button><b style="font-size:18px">${CEM[k]} ${k||"Tutte le portate"}</b></div>`;
 if(S.err)h+=`<div class="al">${esc(S.err)}</div>`;
 if(S.note&&!S.err)h+=`<div class="mu" style="margin:8px 4px">${esc(S.note)}</div>`;
 if(S.busy&&!rcN(k))h+=`<div class="card" style="text-align:center">⏳ Sto pensando a qualche idea…</div>`;
 const l=S.recs.map((r,i)=>[r,i]).filter(([r])=>!k||r.course===k);
 if(!l.length&&!S.busy&&!S.err)h+=`<div class="card" style="text-align:center"><div class="mu">Nessuna ricetta ancora.</div><button class="btn" style="margin-top:8px" ${S.items.length?"":"disabled"} onclick="gen()">✨ Suggeriscimi ricette</button></div>`;
 return h+l.map(([r,i])=>card(r,i)).join("")+(l.length?`<button class="btn g" style="width:100%;margin-top:6px" ${S.busy?"disabled":""} onclick="gen(true)">${S.busy?"Sto pensando…":"➕ Mostra altre ricette"}</button>`:"")}
function card(r,i){return `<div class="card row" style="cursor:pointer" onclick="open_(${i})">${th(r)}<div style="flex:1"><b>${esc(r.title)}</b> ${srcB(r)}${r.course?` <span class="bd">${esc(r.course)}</span>`:""}${r.exp?` <span class="bd">usa prodotti in scadenza</span>`:""}<div class="mu">${r.time||""} · ${r.steps.length} step · ${ingList(r)}<br>${avTxt(r)}</div></div><button class="x" onclick="event.stopPropagation();dislikeT(${esc(JSON.stringify(r.title))})" aria-label="Non mi piace" title="Non mi piace: non riproporla">👎</button><span>›</span></div>`}
const PZRX=()=>window.PIATTI._rx||(window.PIATTI._rx=window.PIATTI.ing.map(([c,r,m])=>[c,new RegExp(r,"i"),m]));
function pzCanon(name){const t=String(name||"").toLowerCase(),o=new Set();PZRX().forEach(([c,rx])=>{if(rx.test(t))o.add(c)});return o}
function pzSuggest(course,skip,n){const have=new Set(),soonC=new Set();
 S.items.forEach(i=>{if(!(+i.q>0))return;pzCanon(i.name).forEach(c=>{have.add(c);if(i.exp&&days(i.exp)<=3)soonC.add(c)})});
 const sc=[];
 window.PIATTI.d.forEach(d=>{if(skip.has(d.id)||(course&&d.c!==course)||isDis(d.n)||dietBadC(d.i))return;
  const hv=d.i.filter(c=>have.has(c)),miss=d.i.length-hv.length;if(miss>1||!hv.length)return;
  const sn=hv.some(c=>soonC.has(c));
  sc.push({d,miss,sn,v:10-miss*6+hv.length*0.3+(sn?3:0)+(!course&&(d.c==="Primo"||d.c==="Secondo")?1.5:0)+Math.random()*2})});
 return sc.sort((a,b)=>b.v-a.v).slice(0,n)}
const PZ_STOP=new Set(["ricetta","ricette","come","fare","cucinare","preparare","con","senza","alla","allo","alle","agli","dei","del","della","delle","dello","per","una","uno","che","tipo","facile","veloce","classico","classica","piatto"]);
function pzFind(q){const t=String(q||"").toLowerCase().replace(/[^a-zàèéìòù0-9 ]/g," "),ws=t.split(/\s+/).filter(w=>w.length>2&&!PZ_STOP.has(w));if(!ws.length)return[];
 const no=[...t.matchAll(/senza\s+([a-zàèéìòù]+)/g)].flatMap(m=>[...pzCanon(m[1])]),wc=ws.map(w=>pzCanon(w)),sc=[];
 window.PIATTI.d.forEach(d=>{if(no.some(c=>d.i.includes(c))||isDis(d.n)||dietBadC(d.i))return;const tt=d.n.toLowerCase();let v=0;
  ws.forEach((w,k)=>{const st=w.length>5?w.slice(0,-1):w;if(tt.includes(st))v+=3;else if(d.i.some(c=>wc[k].has(c)))v+=0.5});
  if(v>=3)sc.push({d,miss:0,v})});
 return sc.sort((a,b)=>b.v-a.v).slice(0,3)}
async function pzWrite(cs,usePantry,req){
 const sm=await claude.use("sample");if(!sm)throw new Error("L’agente AI non è disponibile in questa vista.");
 const want=new Set(cs.flatMap(x=>x.d.i)),pantry=usePantry?S.items.filter(i=>+i.q>0&&[...pzCanon(i.name)].some(c=>want.has(c))).map(i=>({id:i.id,nome:i.name,quantita:Math.round(i.q),unita:i.u,giorni_a_scadenza:i.exp?days(i.exp):null})):[];
 const txt=cs.map(x=>`[n=${x.d.id}] ${x.d.n} (${x.d.c}${x.d.r&&x.d.r!=="Italia"?", "+x.d.r:""})\nIngredienti obbligatori: ${x.d.k.join(", ")}\n${x.d.u?"Ingredienti tipici (facoltativi): "+x.d.u.replace(/,/g,", ")+"\n":""}Procedimento tradizionale in breve: ${x.d.t}`).join("\n\n");
 const r=await sm.json(`Sei uno chef italiano. Scrivi la ricetta COMPLETA e moderna dei piatti classici qui sotto. Per ogni piatto ti do il nome, gli ingredienti obbligatori, quelli tipici facoltativi e un riassunto del procedimento tradizionale. REGOLE: 1) deve essere proprio quel piatto: usa TUTTI gli ingredienti obbligatori e segui il procedimento indicato, senza stravolgerlo e senza abbinamenti insoliti; 2) dosi per 2 persone con quantità realistiche; 3) ingredienti con unità soltanto g, ml o pz (q.b. = amount 0); 4) da 4 a 7 passaggi chiari con tempi e temperature; 5) puoi usare gli ingredienti tipici solo se servono alla versione classica; 6) ${pantry.length?"per ogni ingrediente presente nella dispensa dell'utente indica l'id esatto e la quantità nella stessa unità, senza superare quella disponibile; per gli altri id null. DISPENSA (JSON): "+JSON.stringify(pantry):"usa id null per tutti gli ingredienti"}.${req?" L'utente ha chiesto: «"+req+"»: rispettalo (per esempio «senza uova» → ingrediente alternativo)":""}
PIATTI:
${txt}
Rispondi SOLO con un array JSON, una voce per piatto, nello stesso ordine: [{"n":0,"emoji":"🍝","time":"30 min","ingredients":[{"id":"p123"|null,"name":"","amount":0,"unit":"g|ml|pz","alt":["alternativa"]}],"steps":["..."]}]. Nei nomi degli ingredienti usa nomi generici senza marche e senza aggettivi di stato (scrivi «latte», non «latte tiepido»), ma per le farine indica sempre il tipo (00, 0, manitoba, integrale, di mais…); indica in alt 1-2 alternative valide, tranne che per le farine.`,{modelTier:"default"});
 const arr=Array.isArray(r)?r:r.recipes||[],ids=new Set(soon().map(i=>i.id)),out=[];
 cs.forEach((c,k)=>{const x=arr.find(y=>y&&+y.n===c.d.id)||arr[k];if(!x||!Array.isArray(x.steps)||x.steps.length<2||!Array.isArray(x.ingredients))return;
  const ing=x.ingredients.filter(g=>g&&g.name).map(g=>{let a=+g.amount>0?+g.amount:0,u=g.unit;if(u==="kg"){a*=1000;u="g"}else if(u==="l"){a*=1000;u="ml"}else if(!["g","ml","pz"].includes(u))u="pz";return{...g,amount:Math.round(a*100)/100,unit:u}});
  const got=new Set(ing.flatMap(g=>[...pzCanon(g.name)]));if(!ing.length||c.d.i.some(k2=>!got.has(k2))||dietBad(ing.map(g=>g.name)))return;
  out.push({...x,title:c.d.n,ingredients:ing,src:"pz",pz:c.d.id,course:c.d.c,origin:"Piatto classico italiano"+(c.d.r&&c.d.r!=="Italia"?" · "+c.d.r:""),exp:ing.some(g=>ids.has(g.id))})});
 return out}
const WBP="Libro di cucina/Ricette/";
const wbTitle=t=>String(t).slice(WBP.length);
const wbUrl=(t,h)=>"https://it.wikibooks.org/"+(h?"w/index.php?action=history&title="+encodeURIComponent(String(t).replace(/ /g,"_")):"wiki/"+encodeURIComponent(String(t).replace(/ /g,"_")).replace(/%2F/g,"/"));
async function wbApi(q){if(window.WB_OFF)throw new Error("Wikibooks disattivato");const r=await fetch("https://it.wikibooks.org/w/api.php?"+q+"&format=json&formatversion=2&origin=*");if(!r.ok)throw new Error("Wikibooks non raggiungibile");return r.json()}
async function wbSearch(q,n){const f=async s=>{const j=await wbApi("action=query&list=search&srnamespace=0&srlimit=30&srsearch="+encodeURIComponent(s));return(((j.query||{}).search)||[]).map(x=>x.title).filter(t=>t.startsWith(WBP)&&t.length>WBP.length)};
 let l=await f('prefix:"'+WBP+'" '+q);if(!l.length)l=await f('"Libro di cucina" '+q);return l.slice(0,n)}
async function wbText(t){const j=await wbApi("action=parse&prop=wikitext&redirects=1&page="+encodeURIComponent(t));let w=String((j.parse||{}).wikitext||"");
 for(let k=0;k<3;k++)w=w.replace(/\{\{[^{}]*\}\}/g,"");
 return w.replace(/\[\[(?:Categoria|File|Immagine)[^\]]*\]\]/gi,"").replace(/\[\[(?:[^|\]]*\|)?([^\]]*)\]\]/g,"$1").replace(/<ref[^>]*>.*?<\/ref>|<[^>]+>/g,"").replace(/'{2,}/g,"").replace(/\n{3,}/g,"\n\n").trim().slice(0,3800)}
const WB_STAPLE=/^(acqua|sale|pepe|olio)/i;
const wbFold=s=>String(s||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"");
const wbIn=(name,txt)=>{const ts=toks(name).filter(t=>t.length>=3);return !ts.length||ts.some(t=>txt.includes(t))};
async function wbWrite(pages,usePantry,req){
 const sm=await claude.use("sample");if(!sm)throw new Error("L’agente AI non è disponibile in questa vista.");
 const pantry=usePantry?S.items.filter(i=>+i.q>0).map(i=>({id:i.id,nome:i.name,quantita:Math.round(i.q),unita:i.u})):[];
 const txt=pages.map((p,k)=>`[n=${k}] TITOLO: ${wbTitle(p.t)}\n${p.txt}`).join("\n\n=====\n\n");
 const r=await sm.json(`Sei uno chef italiano. Qui sotto trovi il testo di ricette tratte dal Libro di cucina di Wikibooks. Per ognuna scrivi la ricetta nel formato richiesto. REGOLE: 1) usa SOLO gli ingredienti e i passaggi presenti nel testo: non aggiungere ingredienti e non inventare nulla; 2) se le dosi sono per più persone, riportale a 2 persone; se non ci sono dosi usa amount 0; 3) unità solo g, ml o pz (kg→g, l→ml, dl e cl→ml); 4) da 3 a 8 passaggi chiari in italiano, riscritti con parole tue; 5) se il testo non è una ricetta completa, omettila; 6) course: Antipasto, Primo, Secondo, Contorno o Dolce; 7) ${pantry.length?"per ogni ingrediente presente nella dispensa dell'utente indica l'id esatto e una quantità nella stessa unità, senza superare quella disponibile; per gli altri id null. DISPENSA (JSON): "+JSON.stringify(pantry):"usa id null per tutti gli ingredienti"}.${req?" L'utente ha chiesto: «"+req+"».":""}${dietTxt()}
TESTI:
${txt}
Rispondi SOLO con un array JSON, una voce per ricetta: [{"n":0,"emoji":"🍝","time":"30 min","course":"Primo","ingredients":[{"id":null,"name":"","amount":0,"unit":"g|ml|pz","alt":["alternativa"]}],"steps":["..."]}]. Nei nomi degli ingredienti usa nomi generici senza marche e senza aggettivi di stato; per le farine indica sempre il tipo (00, 0, manitoba, integrale…).`,{modelTier:"default"});
 const arr=Array.isArray(r)?r:r.recipes||[],ids=new Set(soon().map(i=>i.id)),out=[];
 arr.forEach(x=>{const p=x&&pages[+x.n];if(!p||!Array.isArray(x.steps)||x.steps.length<2||!Array.isArray(x.ingredients))return;
  const ing=x.ingredients.filter(g=>g&&g.name).map(g=>{let a=+g.amount>0?+g.amount:0,u=g.unit;if(u==="kg"){a*=1000;u="g"}else if(u==="l"){a*=1000;u="ml"}else if(!["g","ml","pz"].includes(u))u="pz";return{...g,amount:Math.round(a*100)/100,unit:u}});
  const src=wbFold(p.txt),chk=ing.filter(g=>!WB_STAPLE.test(g.name));
  if(ing.length<2||(chk.length&&chk.filter(g=>wbIn(g.name,src)).length<chk.length*0.8))return;
  out.push({...x,title:wbTitle(p.t),ingredients:ing,src:"wb",wb:p.t,course:COURSES.includes(x.course)?x.course:"",origin:"Wikibooks",exp:ing.some(g=>ids.has(g.id))})});
 return out}
async function wbPantry(course,have){
 const hv=new Set((have||[]).map(nm)),sn=new Set(soon().map(i=>i.id)),its=S.items.filter(i=>+i.q>0&&!/condiment|bevand/i.test(i.cat||"")&&!/^(sale|pepe|olio|acqua|zucchero)/i.test(i.name)).sort((a,b)=>(sn.has(b.id)-sn.has(a.id))||(+b.q-+a.q)).slice(0,3);
 if(!its.length)return[];
 const lists=await Promise.all(its.map(i=>wbSearch(String(i.name).split(/\s+/).slice(0,2).join(" ")+(course==="Dolce"?" dolce":""),6).catch(()=>[]))),cnt=new Map();
 lists.forEach(l=>l.forEach((t,k)=>cnt.set(t,(cnt.get(t)||0)+10-k)));
 const ts=[...cnt.entries()].sort((a,b)=>b[1]-a[1]).map(x=>x[0]).filter(t=>!isDis(wbTitle(t))&&!hv.has(nm(wbTitle(t)))).slice(0,4);
 if(!ts.length)return[];
 const pg=(await Promise.all(ts.map(async t=>({t,txt:await wbText(t).catch(()=>"")})))).filter(p=>p.txt.length>150);
 if(!pg.length)return[];
 const w=await wbWrite(pg,true);
 return w.filter(x=>(!course||x.course===course)&&x.ingredients.filter(g=>!g.id&&!WB_STAPLE.test(g.name)).length<=2).filter(recSane).filter(recOk)}
async function gen(more){
 S.busy=true;S.err="";S.note="";render();let got=0;
 try{const skip=new Set((more?S.recs:[]).map(x=>x.pz).filter(Boolean)),cs=pzSuggest(S.gc,skip,4);
  if(cs.length){const nr=await pzWrite(cs,true),have=new Set((more?S.recs:[]).map(x=>nm(x.title))),add=nr.filter(x=>!have.has(nm(x.title)));got=add.length;
   if(got){S.recs=(more?S.recs:[]).concat(add).sort((a,b)=>b.exp-a.exp);W("recs",S.recs)}}
 }catch(e){S.err=e.code==="not_granted"?"Permesso AI negato.":(e.message||"Errore, riprova.");S.busy=false;return render()}
 let wbn=0;
 if(got<3){try{const w=await wbPantry(S.gc,S.recs.map(x=>x.title)),base=(got>0||more)?S.recs:[],have=new Set(base.map(x=>nm(x.title))),add=w.filter(x=>!have.has(nm(x.title)));
  if(add.length){S.recs=base.concat(add).sort((a,b)=>b.exp-a.exp);W("recs",S.recs);wbn=add.length;got+=add.length}}catch(e){}}
 if(got>=3){S.note=wbn?`📚 ${wbn} ricett${wbn>1?"e":"a"} dal Libro di cucina di Wikibooks, riscritt${wbn>1?"e":"a"} in italiano dall’AI.`:"";S.busy=false;return render()}
 S.note=wbn?`📚 ${wbn} ricett${wbn>1?"e":"a"} dal Libro di cucina di Wikibooks, riscritt${wbn>1?"e":"a"} dall’AI; per le altre l’AI propone degli abbinamenti (controlla che ti piacciano).`:got?`🍝 ${got} piat${got>1?"ti classici":"to classico"} compatibil${got>1?"i":"e"} con la tua dispensa; per gli altri l’AI propone degli abbinamenti (controlla che ti piacciano).`:"🍝 Nessun piatto classico del catalogo è compatibile con la tua dispensa: l’AI propone degli abbinamenti (controlla che ti piacciano).";
 await genAi(got>0||!!more,Math.max(1,4-got));
 if(got&&S.err)S.err="";
 S.busy=false;render()}
async function genAi(more,want){
 S.busy=true;S.err="";render();
 try{const sm=await claude.use("sample");if(!sm)throw new Error("L’agente AI non è disponibile in questa vista.");
  const pantry=S.items.map(i=>({id:i.id,nome:i.name,cat:i.cat,quantita:Math.round(i.q),unita:i.u,giorni_a_scadenza:i.exp?days(i.exp):null,posizione:locOf(i)}));
  const r=await sm.json(`Sei uno chef italiano esperto di cucina tradizionale. Dispensa (JSON): ${JSON.stringify(pantry)}
${REALP}${dietTxt()}
Proponi ${want?want+2:10} ricette${S.gc?", tutte e solo della portata «"+S.gc+"» ("+CDEF[S.gc]+"); non proporre ricette di altre portate":""}${more&&S.recs.length?"; non riproporre queste già suggerite: "+S.recs.map(x=>x.title).join(", "):""}. Usa i prodotti della dispensa come ingredienti principali (anche solo alcuni) e le basi non tracciate (acqua, sale, pepe); se la ricetta vera richiede 1-3 ingredienti comuni che NON sono in dispensa, includili con id null: è meglio una ricetta autentica con un ingrediente da comprare che una ricetta inventata fatta solo con la dispensa. Se con questi prodotti non esistono ricette autentiche, proponine meno (anche 2 o 3) invece di forzare abbinamenti. Dai priorità alle ricette che usano prodotti con giorni_a_scadenza <= 3. Per 2 persone. Per ogni ingrediente della dispensa indica l'id esatto e la quantità nella stessa unità (g, ml o pz) senza superare la quantità disponibile; per gli altri usa id null.
Rispondi SOLO con un array JSON: [{"title":"nome vero del piatto","emoji":"🍝","origin":"tradizione o regione, es. Tradizionale romana","course":"Antipasto|Primo|Secondo|Contorno|Dolce","time":"25 min","ingredients":[{"id":"p123"|null,"name":"","amount":0,"unit":"g|ml|pz","alt":["alternativa"]}],"steps":["..."]}]. Da 4 a 7 step chiari, in italiano. Il campo course deve riportare la portata reale della ricetta. Nei nomi degli ingredienti usa nomi generici senza marche e senza aggettivi di stato o temperatura (scrivi «latte», non «latte tiepido»: lo stato va nei passaggi), ma per le farine indica sempre il tipo (00, 0, manitoba, integrale, di mais…); indica in alt 1-2 alternative valide, tranne che per le farine.`,{modelTier:"default"});
  const ids=new Set(soon().map(i=>i.id));
  let nr=(Array.isArray(r)?r:r.recipes||[]).filter(x=>x&&x.title&&x.steps&&x.ingredients).map(x=>({...x,src:"ai",course:COURSES.includes(x.course)?x.course:"",exp:x.ingredients.some(g=>ids.has(g.id))}));
  nr=nr.filter(recSane).filter(recOk).slice(0,want||8);
  if(S.gc)nr=nr.filter(x=>x.course===S.gc);
  const have=new Set((more?S.recs:[]).map(x=>nm(x.title)));nr=nr.filter(x=>!have.has(nm(x.title)));
  S.recs=(more?S.recs:[]).concat(nr).sort((a,b)=>b.exp-a.exp);W("recs",S.recs);
  if(!nr.length)throw new Error(S.gc?"L’AI non ha trovato altre ricette di questa portata con i tuoi prodotti: prova un’altra portata o aggiungi ingredienti.":"Nessuna ricetta valida, riprova.");
 }catch(e){S.err=e.code==="not_granted"?"Permesso AI negato.":(e.message||"Errore, riprova.")}
 S.busy=false;render()}
function open_(i){S.cur=S.recs[i];S.step=0;S.done={};S.from="ricette";render()}
function vCur(){const r=cr(),n=r.steps.length,last=S.step===n-1,l=S.lib[r.title]||{};
 return `<button class="btn g" onclick="S.cur=null;S.tab=S.from||'ricette';render()">← Indietro</button> <button class="btn ${isCook()?"":"g"}" style="float:right" onclick="cookTog()">${isCook()?"✅ Modalità cucina":"👨‍🍳 Modalità cucina"}</button><h2 style="font-size:20px">${esc(r.title)}</h2>${r.src&&r.src!=="manual"&&r.src!=="link"&&!S.mine.some(m=>m.title===r.title)?`<div style="margin:-4px 0 6px"><button class="btn g" ${BS} onclick="dislikeT(${esc(JSON.stringify(r.title))},1)">👎 Non mi piace</button></div>`:""}<div>${srcB(r)}${r.course?` <span class="bd">🍽️ ${esc(r.course)}</span>`:""}</div>${(r.time||r.cook)?`<div class="mu" style="margin-top:6px">${r.time?"⏱️ "+(r.cook?"Preparazione":"Tempo")+": "+esc(r.time):""}${r.time&&r.cook?" · ":""}${r.cook?"🔥 Cottura: "+esc(r.cook):""}</div>`:""}${r.src==="web"?srcLinks(r):""}${r.src==="wb"&&r.wb?`<div class="mu" style="margin-top:6px">📚 Fonte: <a href="${esc(wbUrl(r.wb))}" target="_blank" rel="noopener noreferrer">${esc(wbTitle(r.wb))} su Wikibooks ↗</a> · testo con licenza CC BY-SA, adattato dall’AI · <a href="${esc(wbUrl(r.wb,1))}" target="_blank" rel="noopener noreferrer">autori ↗</a></div>`:""}${(r.src==="ai"||r.src==="pz")&&r.origin?`<div class="mu" style="margin-top:6px">${r.src==="pz"?"🍝":"📖"} ${esc(r.origin)}</div>`:""}${r.src==="pz"?`<div class="mu" style="margin-top:6px">Confronta con altre versioni: <a href="https://www.google.com/search?q=${encodeURIComponent(r.title+" ricetta site:giallozafferano.it")}" target="_blank" rel="noopener noreferrer">GialloZafferano ↗</a> · <a href="https://www.google.com/search?q=${encodeURIComponent(r.title+" site:fattoincasadabenedetta.it")}" target="_blank" rel="noopener noreferrer">Benedetta Rossi ↗</a></div>`:""}${r.src==="link"&&r.link?`<div class="mu" style="margin-top:6px;word-break:break-all">🔗 Fonte: <a href="${esc(r.link)}" target="_blank" rel="noopener noreferrer">${esc(r.link)}</a></div>`:""}${photoBlock(r)}
${porUI()}<div class="card"><b>Ingredienti</b><ul style="margin:6px 0 0;padding-left:18px">${r.ingredients.map((g,gi)=>{const a=avail(g),ok=a.st==="ok";return `<li style="${ok?"":"color:var(--mu);opacity:.7"}">${emo(g.name)} ${esc(g.name)} — ${g.amount?g.amount+" "+esc(g.unit):"q.b."}${g.id||(r.src&&r.src!=="ai")?"":' <span class="mu">(base)</span>'}${ok?(a.it&&(a.note||a.via||nm(a.it.name)!==nm(g.name))?` <span class="mu">(${a.via?"alternativa: ":"in dispensa: "}${esc(a.it.name)}, ${fmt(a.it.q,a.it.u)})</span>`:""):(a.st==="part"?` (hai solo ${fmt(a.it.q,a.it.u)})`:" (non disponibile)"+(altOf(g).length?" — oppure: "+altOf(g).slice(0,3).map(esc).join(", "):""))+" "+(inList(g)?`<span class="bd ok">✅ in lista</span>`:`<button class="btn g" style="padding:2px 10px;font-size:12px" onclick="shopOne(${gi})">🛒 Aggiungi alla lista</button>`)}</li>`}).join("")}</ul><button class="btn g" style="margin-top:10px" onclick="toShop(cr())">🛒 Aggiungi alla lista della spesa</button> <button class="btn g" style="margin-top:10px" onclick="saveR(S.cur)">${inBook(r)?"✅ Nel ricettario":"💾 Salva nel ricettario"}</button>${inBook(r)?` <button class="btn g" style="margin-top:10px" onclick="editM(S.mine.findIndex(m=>m.title===S.cur.title))">✏️ Modifica ricetta</button>`:""}</div>
${r.notes?`<div class="card"><b>📝 Note</b><div style="white-space:pre-wrap">${esc(r.notes)}</div></div>`:""}<div class="dots">${r.steps.map((_,i)=>`<button class="${i===S.step?"on":S.done[i]?"d":""}" onclick="S.step=${i};render()" aria-label="Step ${i+1}">${i+1}</button>`).join("")}</div>
<div class="card"><div class="mu">STEP ${S.step+1} DI ${n}</div><p style="font-size:${isCook()?"28px;line-height:1.35":"18px"};margin:6px 0">${esc(r.steps[S.step])}</p></div>
<div class="row"><button class="btn g" ${S.step?"":"disabled"} style="${isCook()?"padding:18px 24px;font-size:20px":""}" onclick="go(-1)">← Indietro</button>
${last?`<button class="btn" onclick="${S.from==="piano"?"planFinish()":"finish()"}">✅ Segna ricetta completata</button>`:`<button class="btn" style="${isCook()?"padding:18px 28px;font-size:20px":""}" onclick="go(1)">Avanti →</button>`}</div>
<div class="card" style="margin-top:14px"><div class="row"><div>${[1,2,3,4,5].map(k=>`<button class="st ${(l.stars||0)>=k?"on":""}" onclick="rate(${k})" aria-label="${k} stelle">★</button>`).join("")}</div><button class="btn g" onclick="fav()">${l.fav?"♥ Nei preferiti":"♡ Aggiungi ai preferiti"}</button></div></div>`}
function photoBlock(r){const p=S.ph[r.title];
 return p?`<div class="card" style="padding:0;overflow:hidden"><img src="${esc(p)}" alt="${esc(r.title)}" style="width:100%;max-height:300px;object-fit:cover;display:block"><div class="row" style="padding:8px 12px"><label class="btn g" style="cursor:pointer">Cambia foto<input type="file" accept="image/*" hidden onchange="pick(this)"></label><button class="btn g" onclick="rmPh()">Rimuovi</button></div></div>`
 :`<label class="card" style="display:block;text-align:center;cursor:pointer;border-style:dashed"><div style="font-size:44px">${esc(r.emoji||"🍽️")}</div><div class="mu">📷 Aggiungi la foto del tuo piatto</div><input type="file" accept="image/*" hidden onchange="pick(this)"></label>`}
function pick(inp){const f=inp.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{const im=new Image();im.onload=()=>{const k=Math.min(1,640/Math.max(im.width,im.height)),c=document.createElement("canvas");c.width=Math.round(im.width*k);c.height=Math.round(im.height*k);c.getContext("2d").drawImage(im,0,0,c.width,c.height);const t=S.cur.title,old=S.ph[t];S.ph[t]=c.toDataURL("image/jpeg",.7);try{localStorage.setItem("ph",JSON.stringify(S.ph))}catch(e){if(old)S.ph[t]=old;else delete S.ph[t];toast("Spazio esaurito: rimuovi qualche foto.")}phPush(t);render()};im.onerror=()=>toast("Immagine non valida.");im.src=rd.result};rd.readAsDataURL(f)}
function rmPh(){const t=S.cur.title;delete S.ph[t];W("ph",S.ph);phDel(t);render()}
function go(d){S.done[S.step]=true;S.step+=d;render()}
function lib(){const r=S.cur;S.lib[r.title]=S.lib[r.title]||{};S.lib[r.title].r=r;return S.lib[r.title]}
function rate(k){lib().stars=k;save();render()}
function fav(){const l=lib();l.fav=!l.fav;save();render()}
function finish(){const r=cr(),m=[];
 r.ingredients.forEach(g=>{const it=matchIt(g);if(!it)return;
  it.q=Math.round((it.q-Math.max(0,+g.amount||0))*100)/100;
  if(it.q<=0){S.items=S.items.filter(i=>i!==it);m.push(`${esc(it.name)} esaurito e rimosso`)}
  else if(FRESH.test(it.name)||it.cat==="Latticini e uova"&&/latte|panna|yogurt|ricotta|mozzarella/i.test(it.name)){const ne=addDays(3);if(it.exp>ne){it.exp=ne;m.push(`${esc(it.name)}: scadenza accorciata al ${ne.split("-").reverse().join("/")}`)}}});
 S.hist.unshift({at:Date.now(),r:JSON.parse(JSON.stringify(r)),stars:(S.lib[r.title]||{}).stars||0});save();S.recs=S.recs.filter(x=>x.title!==r.title);W("recs",S.recs);S.cur=null;S.tab="dispensa";render();
 toast("🎉 Ricetta completata!"+(m.length?"<br>"+m.join("<br>"):""))}
function vHist(){
 if(!S.hist.length)return `<p class="mu">Nessuna ricetta completata finora. Quando ne segnerai una come completata, comparirà qui.</p>`;
 return `<p class="mu">${S.hist.length} ricett${S.hist.length>1?"e completate":"a completata"}</p>`+(S.hist.length>3?sxBox("hist","Cerca tra le ricette cucinate…"):"")+S.hist.map((h,i)=>!sxOk("hist",h.r.title)?"":`<div class="card"><div class="row"><div style="display:flex;gap:10px;align-items:center">${th(h.r)}<div><b>${esc(h.r.title)}</b> ${srcB(h.r)}<div class="mu">${new Date(h.at).toLocaleDateString("it-IT",{day:"numeric",month:"long",year:"numeric"})} · ${new Date(h.at).toLocaleTimeString("it-IT",{hour:"2-digit",minute:"2-digit"})}</div></div></div><button class="x" onclick="delH(${i})" aria-label="Elimina dalla cronologia">✕</button></div><div class="row"><div>${[1,2,3,4,5].map(k=>`<button class="st ${(h.stars||0)>=k?"on":""}" style="font-size:24px" onclick="rateH(${i},${k})" aria-label="${k} stelle">★</button>`).join("")}</div><button class="btn g" onclick="redo(${i})">Rifai</button></div></div>`).join("")}
function rateH(i,k){const h=S.hist[i];h.stars=k;if(S.lib[h.r.title])S.lib[h.r.title].stars=k;save();render()}
function delH(i){const x=S.hist[i];if(!x)return;S.hist.splice(i,1);save();render();undoable("🗑️ Voce eliminata dalla cronologia.",{x,i},u=>{S.hist.splice(Math.min(u.i,S.hist.length),0,u.x)})}
function redo(i){openR(S.hist[i].r,"cron")}
function vPref(){const all=Object.values(S.lib).filter(l=>l.fav),f=all.filter(l=>sxOk("pref",l.r.title));
 if(!all.length)return `<p class="mu">Nessun preferito. Apri una ricetta e tocca “Aggiungi ai preferiti”.</p>`;
 return (all.length>3?sxBox("pref","Cerca tra i preferiti…"):"")+(f.length?f.map(l=>`<div class="card row" style="cursor:pointer" onclick="S.sv=S.recs;S.recs=[S.lib['${esc(l.r.title).replace(/'/g,"\\'")}'].r];S.tab='ricette';open_(0);S.from='pref';S.recs=S.sv">${th(l.r)}<div style="flex:1"><b>${esc(l.r.title)}</b> ${srcB(l.r)}<div class="mu">${"★".repeat(l.stars||0)||"Non valutata"}</div></div><span>›</span></div>`).join(""):`<p class="mu">Nessun preferito corrisponde alla ricerca.</p>`)}
function ing(id,d){
 if(K.includes(id)){if(d.v===undefined||pend||wr)return 0;const s=JSON.stringify(d.v);if(s===last[id])return 0;S[id]=JSON.parse(s);last[id]=s;return 1}
 if(id.startsWith("ph_")&&d.t&&S.ph[d.t]!==d.d){S.ph[d.t]=d.d;return 1}
 return 0}
