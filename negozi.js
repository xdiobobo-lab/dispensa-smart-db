/* Dispensa Smart - negozi.js */
function flyPaint(){const e=$("fmsg");if(e)e.textContent="⏳ "+(S.fmsg||"");const b=$("fbar");if(b&&S.fp&&S.fp[1])b.style.width=Math.max(4,Math.round(S.fp[0]/S.fp[1]*100))+"%"}
function fSearch(v){S.fsr=v;render();const e=$("fsr");if(e){e.focus();try{e.setSelectionRange(v.length,v.length)}catch(x){}}}
function useOffer(id){const x=S.shop.find(s=>s.id===id);if(!x)return;const of=offerFor(x.name);if(!of)return toast("Questa offerta non è più valida.");x.price=of.o.price||"";x.store=of.f.store||x.store||"";x.until=of.to||"";x.from=(x.from?x.from+" · ":"")+"Offerta del volantino";save();render();toast(`🏷️ Offerta applicata: ${esc(x.name)}${x.price?" · "+esc(x.price):""}${x.store?" · "+esc(x.store):""}`)}
const gl=s=>"https://www.google.com/search?q="+encodeURIComponent("volantino "+s+" "+S.geo.city+" "+S.geo.zone);
function geoSave(q){const v=id=>($(id).value||"").trim();S.geo={city:v("gc"),zone:v("gz"),stores:[...new Set(v("gs").split(",").map(x=>x.trim()).filter(Boolean))]};W("geo",S.geo);if(!q){render();toast("📍 Salvato")}}
async function geoFind(){geoSave(1);if(!S.geo.city)return toast("Scrivi prima la città.");S.gb="f";S.gerr="";render();
 try{const r=await aiJson(`Elenca fino a 8 supermercati o catene di alimentari che è probabile trovare a ${S.geo.city}${S.geo.zone?", zona "+S.geo.zone:""} (Italia). Non inventare negozi o indirizzi di cui non sei sicuro: se non conosci la zona indica le catene presenti in città. Rispondi SOLO con un array JSON: [{"name":"","type":"discount|supermercato|ipermercato|biologico|altro","note":"breve"}].`);
  S.stl=(Array.isArray(r)?r:r.stores||[]).filter(x=>x&&x.name);if(!S.stl.length)throw new Error("Nessun suggerimento, riprova.")}catch(e){S.gerr=aiErr(e)}
 S.gb="";render()}
function geoAdd(i){const n=S.stl[i].name;if(!S.geo.stores.includes(n))S.geo.stores.push(n);W("geo",S.geo);render()}
function setStore(id,v){const x=S.shop.find(s=>s.id===id);if(x){x.store=v;save();render()}}
async function geoSort(){const open=S.shop.filter(x=>!x.done);if(!S.geo.stores.length)return toast("Aggiungi prima i tuoi supermercati e premi Salva.");if(!open.length)return toast("La lista della spesa è vuota.");
 S.gb="s";S.gerr="";render();
 try{const r=await aiJson(`Assegna ogni prodotto della lista a UNO dei supermercati indicati, dove è più probabile trovarlo bene (discount per i prodotti base, supermercato per una scelta ampia, biologico per il bio). Usa solo i nomi dei negozi dati; se non sei sicuro lascia "". Negozi: ${JSON.stringify(S.geo.stores)}. Prodotti: ${JSON.stringify(open.map(x=>({id:x.id,nome:x.name})))}. Rispondi SOLO con un array JSON: [{"id":"","store":""}].`);
  const arr=Array.isArray(r)?r:r.assegnazioni||[];let n=0;arr.forEach(a=>{const x=open.find(o=>o.id===a.id);if(x&&S.geo.stores.includes(a.store)){x.store=a.store;n++}});save();toast(`🤖 ${n} prodotti assegnati ai negozi`)}catch(e){S.gerr=aiErr(e)}
 S.gb="";render()}
async function offFind(){const st=$("of").value,tx=($("ot").value||"").trim(),names=S.shop.filter(x=>!x.done).map(x=>x.name);
 if(!tx)return toast("Incolla il testo del volantino.");if(!names.length)return toast("La lista della spesa è vuota.");
 S.gb="o";S.gerr="";S.ot=tx;S.ofs=st;S.ofdone=0;render();
 try{const r=await aiJson(`Questo è il testo di un volantino${st?" di "+st:""}. Trova SOLO le offerte relative ai prodotti di questa lista: ${JSON.stringify(names)}. Usa esclusivamente ciò che è scritto nel testo: non inventare offerte, prezzi o date; se non ce ne sono rispondi []. Rispondi SOLO con un array JSON: [{"item":"prodotto della lista","offer":"descrizione dell'offerta","price":"prezzo come scritto","validity":"validità se indicata"}].\nTESTO:\n"""${tx.slice(0,12000)}"""`);
  S.off=(Array.isArray(r)?r:r.offers||[]).filter(x=>x&&x.offer);S.ofdone=1}catch(e){S.gerr=aiErr(e)}
 S.gb="";render()}
function vStores(){const g=S.geo,stores=g.stores,open=S.shop.filter(x=>!x.done),busy=!!S.gb;
 const opt=v=>`<option value="">Nessun negozio</option>`+stores.map(s=>`<option ${v===s?"selected":""}>${esc(s)}</option>`).join("");
 const ta="width:100%;margin-top:8px;padding:10px;border:1px solid var(--bd);border-radius:22px;background:var(--card);color:var(--tx);font:inherit";
 let h=`<details class="card" ${stores.length?"":"open"}><summary style="cursor:pointer"><b>📍 I tuoi supermercati e la tua zona</b></summary><div class="row" style="gap:6px;margin-top:8px"><input id="gc" placeholder="Città" value="${esc(g.city)}"><input id="gz" placeholder="Zona o quartiere (facoltativo)" value="${esc(g.zone)}"></div><div class="mu" style="margin:8px 0 4px">I tuoi supermercati (separati da virgola)</div><input id="gs" placeholder="es. Conad, Lidl, Eurospin" value="${esc(stores.join(", "))}"><div class="row" style="gap:6px;flex-wrap:wrap;margin-top:8px"><button class="btn" onclick="geoSave()">Salva</button><button class="btn g" ${busy?"disabled":""} onclick="geoFind()">${S.gb==="f"?"Cerco…":"🔎 Suggerisci supermercati in zona"}</button></div><div class="mu" style="margin-top:8px">⚠️ L’AI non ha un elenco aggiornato dei negozi: i suggerimenti vengono dalle sue conoscenze e possono essere imprecisi. Controlla sempre che il negozio esista e sia aperto.</div></details>`;
 if(S.gerr)h+=`<div class="al">${esc(S.gerr)}</div>`;
 if(S.stl.length)h+=`<div class="card"><b>Suggeriti per ${esc(g.city)}${g.zone?" – "+esc(g.zone):""}</b>`+S.stl.map((s,i)=>`<div class="row" style="margin-top:8px"><div><b>${esc(s.name)}</b><div class="mu">${esc(s.type||"")}${s.note?" · "+esc(s.note):""}</div></div><button class="btn g" style="padding:5px 12px" onclick="geoAdd(${i})" aria-label="Aggiungi ai miei supermercati">＋</button></div>`).join("")+`</div>`;
 h+=`<div class="card"><b>🛒 Lista della spesa per supermercato</b><div class="mu">${open.length} prodotti da comprare</div><button class="btn" style="margin-top:8px" ${busy?"disabled":""} onclick="geoSort()">${S.gb==="s"?"Smisto…":"🤖 Smista con l’AI"}</button></div>`;
 const row=x=>`<div class="row" style="margin-top:6px"><span>${emo(x.name)} ${esc(x.name)}${x.amount?` <span class="mu">· ${fmt(x.amount,x.unit)}</span>`:""}</span><select style="width:auto;max-width:50%;padding:4px 8px;border-radius:99px" onchange="setStore('${x.id}',this.value)">${opt(x.store)}</select></div>`;
 stores.forEach(s=>{const it=open.filter(x=>x.store===s);if(it.length)h+=`<div class="card"><div class="row"><b>🏪 ${esc(s)}</b><a href="${esc(gl(s))}" target="_blank" rel="noopener noreferrer">Volantino ↗</a></div>${it.map(row).join("")}</div>`});
 const un=open.filter(x=>!x.store||!stores.includes(x.store));
 if(un.length)h+=`<div class="card"><b>❔ Senza negozio</b>${un.map(row).join("")}</div>`;
 if(0)h+=`<div class="card"><b>🏷️ Offerte da volantino</b><div class="mu">L’AI non può leggere i volantini online. Apri il volantino del negozio (link “Volantino ↗” sopra), copia il testo delle offerte e incollalo qui: l’AI trova quelle utili per la tua lista, usando solo ciò che è scritto.</div><select id="of" style="margin-top:8px"><option value="">Quale negozio?</option>${stores.map(s=>`<option ${S.ofs===s?"selected":""}>${esc(s)}</option>`).join("")}</select><textarea id="ot" rows="5" placeholder="Incolla qui il testo del volantino…" style="${ta}">${esc(S.ot||"")}</textarea><button class="btn" style="margin-top:8px" ${busy?"disabled":""} onclick="offFind()">${S.gb==="o"?"Leggo il volantino…":"Trova offerte utili"}</button></div>`;
 if(S.ofdone)h+=S.off.length?S.off.map(o=>`<div class="card"><b>${emo(o.item)} ${esc(o.item||"")}</b>${o.price?` <span class="bd">${esc(o.price)}</span>`:""}<div>${esc(o.offer)}</div>${o.validity?`<div class="mu">${esc(o.validity)}</div>`:""}</div>`).join(""):`<p class="mu">Nessuna offerta del testo riguarda i prodotti della tua lista.</p>`;
 return vFlyers()+h}
function offerFor(name){const qt=toks(name,1);if(!qt.length)return null;let best=null;
 S.fly.filter(flyAct).forEach(f=>f.offers.forEach((o,ix)=>{const to=offTo(o,f);if(to&&to<today())return;if(!offMatch(qt,o))return;const pr=pNum(o.price);if(!best||(pr!=null&&(best.pr==null||pr<best.pr)))best={o,f,ix,to,pr}}));return best}
function unitPrice(o){const p=pNum(o.price);if(p==null)return null;const t=String((o.item||"")+" "+(o.offer||"")).toLowerCase().replace(/,/g,".");
 let n=1,q,u,m=t.match(/(\d+)\s*x\s*(\d+(?:\.\d+)?)\s*(kg|g|ml|cl|l)\b/);
 if(m){n=+m[1];q=+m[2];u=m[3]}else{m=t.match(/(\d+(?:\.\d+)?)\s*(kg|g|ml|cl|l)\b/);if(!m)return null;q=+m[1];u=m[2]}
 const f={kg:1000,g:1,l:1000,ml:1,cl:10}[u],d=/g$/.test(u)?"w":"v",tot=n*q*f;if(!(tot>0))return null;
 return{v:p/tot*1000,d,txt:eur(p/tot*1000)+(d==="w"?"/kg":"/l")}}
function cmpGroups(srt,qs,mine){const act=S.fly.filter(flyAct),lst=S.shop.filter(x=>!x.done).map(x=>toks(x.name,1)),fq=freqIng(),G={};
 act.forEach(f=>f.offers.forEach((o,ix)=>{const to=offTo(o,f);if(to&&to<today())return;const hd=offHead(o).join(" ")||nm(o.item);if(!hd)return;
  const onL=lst.some(t=>offMatch(t,o)),fr=fq.some(q=>offMatch(q.toks,o));if(mine&&!onL&&!fr)return;if(qs&&!nm(o.item+" "+o.offer).includes(qs))return;
  (G[hd]=G[hd]||{key:hd,name:o.main||o.item,rows:[]}).rows.push({o,ix,f,to,pr:pNum(o.price),up:unitPrice(o),store:f.store||"Negozio non indicato"})}));
 return Object.values(G).map(g=>{const pr=g.rows.filter(r=>r.pr!=null),byU=pr.length>1&&pr.every(r=>r.up&&r.up.d===pr[0].up.d),met=r=>byU?r.up.v:r.pr;
  const rows=g.rows.slice().sort((a,b)=>(a.pr==null)-(b.pr==null)||(pr.length?met(a)-met(b):0)),best=pr.length?rows[0]:null,worst=pr.length>1?rows[pr.length-1]:null,
   stores=new Set(g.rows.map(r=>r.store)).size,pct=best&&worst&&met(worst)>0?Math.round((met(worst)-met(best))/met(worst)*100):0;
  return{...g,rows,best,worst,stores,pct,byU,min:best?best.pr:1e9,max:best?Math.max(...pr.map(r=>r.pr)):-1,exp:g.rows.reduce((a,r)=>r.to&&r.to<a?r.to:a,"9999")}})
 .sort((a,b)=>srt==="priceD"?b.max-a.max:srt==="name"?nm(a.name).localeCompare(nm(b.name)):srt==="exp"?(a.exp<b.exp?-1:1):srt==="price"?a.min-b.min:b.pct-a.pct||b.stores-a.stores)}
function cmpHtml(srt,qs,mine){const act=S.fly.filter(flyAct),all=cmpGroups(srt,qs,mine),multi=all.filter(g=>g.stores>1),single=all.filter(g=>g.stores<2);
 const row=(g,r)=>`<div style="display:flex;gap:12px;justify-content:space-between;align-items:flex-start;padding:10px 0;border-top:1px solid var(--bd)"><div style="min-width:0;flex:1"><b>🏪 ${esc(r.store)}</b>${g.best===r&&g.stores>1?` <span class="bd">🏆 Più conveniente</span>`:""}<div class="mu">${esc(r.o.item)}${r.o.offer?" · "+esc(r.o.offer):""}</div>${r.to?`<div class="mu">⏳ ${untilTxt(r.to)}</div>`:""}</div><div style="text-align:right;flex:none">${r.o.price?`<div style="font-size:19px;font-weight:800;line-height:1.1">${esc(r.o.price)}</div>`:""}${r.up?`<div class="mu">${r.up.txt}</div>`:""}<button class="btn ${g.best===r?"":"g"}" ${BS} style="margin-top:6px" onclick="offShop('${r.f.id}',${r.ix})">🛒 Aggiungi</button></div></div>`;
 const card=g=>`<div class="card"><div class="row"><b>${emo(g.name)} ${esc(g.name)}</b><span class="bd ok">${g.stores} negozi</span></div>${g.pct>0&&g.stores>1?`<div style="margin-top:4px"><span class="bd ok">Scegliendo ${esc(g.best.store)} spendi circa il ${g.pct}% in meno${g.byU?" (confronto al kg/litro)":""}</span></div>`:""}${g.rows.map(r=>row(g,r)).join("")}</div>`;
 let h="";
 if(new Set(act.map(f=>f.store||"")).size<2)h+=`<div class="al">Per confrontare i prezzi servono i volantini di almeno due negozi: carica quello di un altro supermercato.</div>`;
 h+=`<h2 style="font-size:17px;margin-bottom:0">Confronto tra negozi (${multi.length})</h2><div class="mu">Lo stesso prodotto trovato in più volantini. Controlla sempre il formato: se è indicato il peso, il confronto è fatto al kg o al litro.</div>`;
 h+=multi.length?multi.map(card).join(""):`<div class="card mu">Nessun prodotto in offerta in più di un negozio${qs||mine?" con questi filtri":""}.</div>`;
 if(single.length)h+=`<div class="card"><details><summary style="cursor:pointer"><b>Offerte presenti in un solo negozio (${single.length})</b></summary>${single.map(g=>`<div style="margin-top:10px"><b>${emo(g.name)} ${esc(g.name)}</b>${g.rows.map(r=>row(g,r)).join("")}</div>`).join("")}</details></div>`;
 return h}
const flyAct=f=>!f.to||f.to>=today();
const offTo=(o,f)=>o.to||f.to||null;
let pdfP=null;
function loadPdf(){if(window.pdfjsLib)return Promise.resolve(window.pdfjsLib);if(pdfP)return pdfP;
 pdfP=new Promise((res,rej)=>{const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
  s.onload=()=>{try{window.pdfjsLib.GlobalWorkerOptions.workerSrc="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";res(window.pdfjsLib)}catch(e){pdfP=null;rej(e)}};
  s.onerror=()=>{pdfP=null;rej(new Error("Impossibile caricare il lettore PDF: serve la connessione a internet."))};document.head.appendChild(s)});return pdfP}
let ocrP=null,ocrW=null;
function loadOcr(){if(window.Tesseract)return Promise.resolve(window.Tesseract);if(ocrP)return ocrP;ocrP=new Promise((res,rej)=>{const s=document.createElement("script");s.src="https://cdnjs.cloudflare.com/ajax/libs/tesseract.js/5.0.5/tesseract.min.js";s.onload=()=>res(window.Tesseract);s.onerror=()=>{ocrP=null;rej(new Error("impossibile caricare il lettore OCR"))};document.head.appendChild(s)});return ocrP}
async function ocrWorker(){if(ocrW)return ocrW;const T=await loadOcr();ocrW=await T.createWorker("ita");return ocrW}
async function pdfText(file,lib,prog){const buf=await file.arrayBuffer();const pdf=await lib.getDocument({data:buf}).promise;const N=Math.min(pdf.numPages,24),out=[],layer=[];let ocrN=0,w=null,fail=null;
 for(let p=1;p<=N;p++){const pg=await pdf.getPage(p);
  try{const c=await pg.getTextContent();layer.push(c.items.map(i=>i.str+(i.hasEOL?"\n":" ")).join(""))}catch(e){layer.push("")}
  if(prog)prog(`Converto in immagine e leggo la pagina ${p} di ${N}…`);
  try{w=w||await ocrWorker();const vp=pg.getViewport({scale:2.5}),cv=document.createElement("canvas");cv.width=Math.round(vp.width);cv.height=Math.round(vp.height);const g=cv.getContext("2d");g.fillStyle="#fff";g.fillRect(0,0,cv.width,cv.height);await pg.render({canvasContext:g,viewport:vp}).promise;
   const im=g.getImageData(0,0,cv.width,cv.height),d=im.data;for(let i=0;i<d.length;i+=4){let y=0.299*d[i]+0.587*d[i+1]+0.114*d[i+2];y=Math.max(0,Math.min(255,(y-128)*1.25+128));d[i]=d[i+1]=d[i+2]=y}g.putImageData(im,0,0);
   const r=await w.recognize(cv);out.push((r.data&&r.data.text)||"");ocrN++;cv.width=cv.height=1}
  catch(e){ocrW=null;w=null;fail=e;out.push("")}}
 const ocrTxt=out.join("\n\n"),layTxt=layer.join("\n\n"),nz=t=>t.replace(/\s/g,"").length;
 if(nz(ocrTxt)>=nz(layTxt)*0.5&&nz(ocrTxt)>0)return{text:ocrTxt,ocr:ocrN};
 if(nz(layTxt)>0)return{text:layTxt,ocr:0};
 throw new Error("Il riconoscimento del testo dalle immagini non è riuscito"+(fail?" ("+(fail.message||"errore")+")":"")+". Serve internet per scaricare il lettore e la lingua italiana. Puoi incollare il testo del volantino.")}
const flyPrompt=(chunk,store)=>`Oggi è ${today()}. Questo è il testo estratto da un volantino${store?" di "+store:""} (le colonne possono essere mescolate).${S.focr?" Il testo viene da un riconoscimento di immagini (OCR) e può contenere errori di lettura: se un prodotto o un prezzo non è chiaro, omettilo.":""} Estrai le offerte di prodotti che compaiono (fino a 60), alimentari per prime. Usa SOLO ciò che è scritto: non inventare prodotti, prezzi o date. Per ogni offerta indica: item (prodotto, con marca e formato se presenti), offer (descrizione, per esempio 2x1, -30%, sottocosto), price (prezzo come scritto), from e to (validità di quella offerta). Le date vanno in formato AAAA-MM-GG solo se sono scritte nel testo (se manca l'anno usa l'anno di oggi), altrimenti null. In from e to di primo livello metti il periodo di validità generale del volantino, se scritto. Per ogni offerta indica anche main: il prodotto vero e proprio in 1-3 parole, SENZA il liquido di conservazione, il condimento o l'ingrediente di accompagnamento (esempi: "Tonno Rio Mare all'olio di oliva" -> main "tonno"; "Filetti di sgombro in olio" -> "sgombro"; "Carciofi in olio" -> "carciofi"; "Pasta al pomodoro" -> "pasta"; "Olio extravergine di oliva" -> "olio extravergine di oliva"). Rispondi SOLO con JSON: {"from":null,"to":null,"offers":[{"item":"","main":"","offer":"","price":"","from":null,"to":null}]}.\nTESTO:\n"""${chunk}"""`;
let FT=(()=>{try{return JSON.parse(localStorage.getItem("ftx")||"{}")}catch(e){return{}}})();
const FTP="volantini.json";let ftSha=null,ftT;
function ftSave(){try{localStorage.setItem("ftx",JSON.stringify(FT))}catch(e){}}
async function ftPush(retry){if(!ghOn())return;try{const body={message:"Dispensa Smart: testi dei volantini",content:b64e(JSON.stringify({app:"dispensa-smart-volantini",saved:new Date().toISOString(),texts:FT}))};if(ftSha)body.sha=ftSha;const r=await ghApi("PUT","/contents/"+FTP,body);if(r.ok)ftSha=(await r.json()).content.sha;else if((r.status===409||r.status===422)&&!retry){await ftPull();return ftPush(1)}}catch(e){}}
async function ftPull(){if(!ghOn())return;try{const r=await ghApi("GET","/contents/"+FTP);if(!r.ok)return;const m=await r.json();ftSha=m.sha;let txt;if(m.content&&m.encoding==="base64")txt=b64d(m.content);else{const br=await ghApi("GET","/git/blobs/"+m.sha);if(!br.ok)return;txt=b64d((await br.json()).content)}
 const d=JSON.parse(txt);let c=0;Object.entries(d.texts||{}).forEach(([k,v])=>{if(!FT[k]&&v&&v.text){FT[k]=v;c++}});if(c){try{localStorage.setItem("ftx",JSON.stringify(FT))}catch(e){}}}catch(e){}}
const MESI={gen:1,feb:2,mar:3,apr:4,mag:5,giu:6,lug:7,ago:8,set:9,ott:10,nov:11,dic:12};
function flyDates(t){const m=String(t).match(/dal\s+(\d{1,2})\s*(?:[\/.\-]\s*(\d{1,2})|([a-zà]{3,9}))?\s*(?:(\d{4}))?\s*(?:al|a|fino\s+al)\s+(\d{1,2})\s*(?:[\/.\-]\s*(\d{1,2})|([a-zà]{3,9}))(?:[\s\/.\-]+(\d{4}))?/i);if(!m)return null;
 const mo=(n,w)=>n?+n:(w?MESI[w.toLowerCase().slice(0,3)]:0),d1=+m[1],d2=+m[5],m2=mo(m[6],m[7]),m1=mo(m[2],m[3])||m2,y=+(m[8]||0)||+today().slice(0,4);
 if(!m2||m1>12||m2>12||d1>31||d2>31||d1<1||d2<1)return null;
 const p=n=>String(n).padStart(2,"0"),to=`${y}-${p(m2)}-${p(d2)}`,from=`${m1>m2?y-1:y}-${p(m1)}-${p(d1)}`;return okD(from)&&okD(to)?{from,to}:null}
function flyLocal(txt){const lines=String(txt).split(/\n+/).map(l=>l.replace(/[|_~=*•·■□●◆►]/g," ").replace(/\s+/g," ").trim()).filter(Boolean);
 const PR=/(?:€\s*)?(\d{1,3})\s*[.,]\s*(\d{2})(?!\d)(?!\s*(?:kg|gr?|lt?|ml|cl|pz|%|x\b))\s*(?:€|euro)?/i,OFF=/(\b\d\s*[x+]\s*\d\b|-\s*\d{1,2}\s*%|\b\d{1,2}\s*%|sottocosto|prezzo\s+bomba|risparmi\w*)/i;
 const lt=s=>(s.match(/[a-zà-ù]/gi)||[]).length,out=[],seen=new Set();let buf=[];
 for(const ln of lines){const m=ln.match(PR);
  if(m){const price=+(m[1]+"."+m[2]),before=ln.slice(0,m.index).replace(/[€]/g,"").trim(),after=ln.slice(m.index+m[0].length).trim();
   let item=lt(before)>=4?before:buf.slice(-2).join(" ");item=item.replace(PR,"").replace(/\s+/g," ").trim().slice(0,90);
   const raw=[...buf.slice(-3),ln].join(" / "),om=(raw.match(OFF)||[])[0]||"",k=nm(item)+"|"+m[1]+m[2];
   if(price>=0.1&&price<200&&lt(item)>=4&&!seen.has(k)){seen.add(k);out.push({item,offer:om,price:"€ "+m[1]+","+m[2],from:null,to:null,_raw:raw})}
   buf=lt(after)>=4&&!PR.test(after)?[after]:[]}
  else if(lt(ln)>=3){buf.push(ln.slice(0,80));if(buf.length>3)buf.shift()}}
 return{offers:out,dates:flyDates(txt)}}
async function flyBuild(txt,store,name,key){S.fb=1;S.ferr="";S.fmsg="Leggo il volantino…";render();
 try{let src=txt;
  if(txt.length>25000){try{const L=flyLocal(txt);if(L.offers.length>=15){const dm=txt.match(/.{0,40}\bdal\s+\d{1,2}.{0,80}\bal\s+\d{1,2}.{0,40}/i);src=(dm?dm[0]+"\n":"")+L.offers.map(o=>o._raw).join("\n")}}catch(e){}}
  const chunks=[];for(let i=0;i<src.length&&chunks.length<14;i+=5000)chunks.push(src.slice(i,i+5000));
  let from=null,to=null,offers=[],fail=0,lastErr=null;const wait=ms=>new Promise(x=>setTimeout(x,ms));
  for(let ci=0;ci<chunks.length;ci++){const say=m=>{S.fmsg=m;S.fp=[ci,chunks.length];flyPaint()};say(`Sto cercando le offerte nel volantino… ${Math.round(ci/chunks.length*100)}%`);
   if(ci)await wait(6000);
   let r=null;
   for(let t=0;t<3&&!r;t++){try{r=await aiJson(flyPrompt(chunks[ci],store))}catch(er){lastErr=er;if(/Limite/.test(er.message||"")&&t<2){say("Pausa di 30 secondi: l’AI gratuita ha un limite di richieste. Poi riprendo da sola");await wait(30000)}else break}}
   if(!r){fail++;continue}
   const o=Array.isArray(r)?{offers:r}:(r||{});if(!from&&okD(o.from))from=o.from;if(!to&&okD(o.to))to=o.to;
   (o.offers||[]).forEach(x=>{if(x&&(x.item||x.offer))offers.push({item:String(x.item||x.offer).slice(0,90),main:String(x.main||"").slice(0,50),offer:String(x.offer||"").slice(0,160),price:String(x.price||"").slice(0,30),from:okD(x.from)?x.from:null,to:okD(x.to)?x.to:null})})}
  const seen=new Set();offers=offers.filter(o=>{const k=nm(o.item)+"|"+o.price;if(seen.has(k))return false;seen.add(k);return true});
  if(!offers.length){if(lastErr)throw lastErr;throw new Error("Non ho trovato offerte nel testo del volantino.")}
  const id="f"+Date.now();FT[id]={name:name||"Volantino",store:store||"",added:today(),key:key||"",text:txt};Object.keys(FT).sort().slice(0,-12).forEach(k=>delete FT[k]);ftSave();
  S.fly.unshift({id,tid:id,eng:"ai",store:store||"",name:name||"Volantino",added:today(),from,to,offers});if(S.fly.length>12)S.fly.length=12;S.fopen=id;save();
  toast(`🏷️ ${offers.length} offerte trovate`+(to?`, valide fino al ${fD(to)}`:". Data di scadenza non indicata nel volantino")+(fail?`. ⚠️ ${fail} parte${fail>1?"i":""} su ${chunks.length} non lett${fail>1?"e":"a"}: il volantino potrebbe essere incompleto`:""))}
 catch(e){S.ferr=aiErr(e)}S.fb=0;render()}
async function flyAI(id){const f=S.fly.find(x=>x.id===id),t=f&&FT[f.tid||f.id];if(!t)return toast("Il testo di questo volantino non è salvato su questo dispositivo: ricarica il volantino.");
 S.fb=1;S.ferr="";S.fmsg="Migliorare con l’AI… (leggo solo le righe con i prezzi)";render();
 try{S.focr=true;const L=flyLocal(t.text),src=L.offers.length>=3?L.offers.map(o=>o._raw).join("\n"):t.text,chunks=[];
  for(let i=0;i<src.length&&chunks.length<4;i+=7000)chunks.push(src.slice(i,i+7000));
  let from=null,to=null,offers=[];
  for(let ci=0;ci<chunks.length;ci++){S.fmsg=`Migliorare con l’AI… parte ${ci+1} di ${chunks.length}`;const e=$("fmsg");if(e)e.textContent="⏳ "+S.fmsg;
   let r;try{r=await aiJson(flyPrompt(chunks[ci],f.store))}catch(er){if(/Limite/.test(er.message||"")){await new Promise(x=>setTimeout(x,20000));r=await aiJson(flyPrompt(chunks[ci],f.store))}else throw er}
   const o=Array.isArray(r)?{offers:r}:(r||{});if(!from&&okD(o.from))from=o.from;if(!to&&okD(o.to))to=o.to;
   (o.offers||[]).forEach(x=>{if(x&&(x.item||x.offer))offers.push({item:String(x.item||x.offer).slice(0,90),offer:String(x.offer||"").slice(0,160),price:String(x.price||"").slice(0,30),from:okD(x.from)?x.from:null,to:okD(x.to)?x.to:null})})}
  const seen=new Set();offers=offers.filter(o=>{const k=nm(o.item)+"|"+o.price;if(seen.has(k))return false;seen.add(k);return true});
  if(!offers.length)throw new Error("L’AI non ha trovato offerte: tengo quelle già estratte.");
  f.offers=offers;f.eng="ai";if(from)f.from=from;if(to)f.to=to;S.fopen=id;save();toast(`✨ ${offers.length} offerte migliorate dall’AI`)}
 catch(e){S.ferr=aiErr(e)}S.fb=0;render()}
async function autoFly(manual){let d=null;
 try{if(ghOn()){const r=await ghApi("GET","/contents/volantini-auto.json");if(r.ok){const m=await r.json();let t;if(m.content&&m.encoding==="base64")t=b64d(m.content);else{const br=await ghApi("GET","/git/blobs/"+m.sha);t=b64d((await br.json()).content)}d=JSON.parse(t)}}
  if(!d){const r=await fetch("volantini-auto.json",{cache:"no-store"});if(r.ok)d=await r.json()}}catch(e){}
 if(!d||!Array.isArray(d.fly)){if(manual)toast("Nessun volantino automatico trovato: configura prima l’automazione su GitHub.");return}
 const before=JSON.stringify(S.fly.filter(f=>f.auto).map(f=>f.id));
 const ok=d.fly.filter(f=>f&&f.id&&Array.isArray(f.offers)&&(!f.to||f.to>=today()));
 S.fly=[...ok.map(f=>({...f,auto:true})),...S.fly.filter(f=>!f.auto)];
 Object.entries(d.texts||{}).forEach(([k,v])=>{if(v&&v.text&&!FT[k])FT[k]=v});try{localStorage.setItem("ftx",JSON.stringify(FT))}catch(e){}
 if(JSON.stringify(ok.map(f=>f.id))!==before){save();render();if(manual)toast(`🔄 ${ok.length} volantini aggiornati automaticamente`)}else if(manual)toast("Volantini già aggiornati.")}
function flyRe(id){const f=S.fly.find(x=>x.id===id),t=f&&FT[f.tid||f.id];if(!t)return toast("Il testo di questo volantino non è salvato su questo dispositivo.");
 const L=flyLocal(t.text);f.offers=L.offers.map(o=>({item:o.item,offer:o.offer,price:o.price,from:null,to:null}));f.eng="local";if(L.dates){f.from=L.dates.from;f.to=L.dates.to}save();render();toast(`🔄 ${f.offers.length} offerte rielaborate dal testo salvato`)}
async function pageJpg(pdf,p){const pg=await pdf.getPage(p),v0=pg.getViewport({scale:1}),sc=Math.min(2.2,1400/v0.width),vp=pg.getViewport({scale:sc}),cv=document.createElement("canvas");cv.width=Math.round(vp.width);cv.height=Math.round(vp.height);const g=cv.getContext("2d");g.fillStyle="#fff";g.fillRect(0,0,cv.width,cv.height);await pg.render({canvasContext:g,viewport:vp}).promise;const u=cv.toDataURL("image/jpeg",.82);cv.width=cv.height=1;return u}
async function fileJpg(f){const bm=await createImageBitmap(f),sc=Math.min(1,1600/Math.max(bm.width,bm.height)),cv=document.createElement("canvas");cv.width=Math.round(bm.width*sc);cv.height=Math.round(bm.height*sc);const g=cv.getContext("2d");g.fillStyle="#fff";g.fillRect(0,0,cv.width,cv.height);g.drawImage(bm,0,0,cv.width,cv.height);const u=cv.toDataURL("image/jpeg",.85);cv.width=cv.height=1;return u}
async function flyVision(inp){const fs=[...(inp.files||[])];if(!fs.length)return;const store=$("of")?$("of").value:"";S.ofs=store;
 S.fb=1;S.ferr="";S.fp=null;S.fmsg="Preparo le pagine del volantino…";render();
 const say=(m,d,t)=>{S.fmsg=m;if(t!=null)S.fp=[d,t];flyPaint()},wait=ms=>new Promise(x=>setTimeout(x,ms));
 try{const pages=[];
  for(const f of fs){if(/pdf$/i.test(f.type)||/\.pdf$/i.test(f.name)){const lib=await loadPdf(),pdf=await lib.getDocument({data:await f.arrayBuffer()}).promise;for(let p=1;p<=Math.min(pdf.numPages,24);p++)pages.push(()=>pageJpg(pdf,p))}else pages.push(()=>fileJpg(f))}
  if(pages.length>24)pages.length=24;
  const P=flyPrompt("",store).replace(/TESTO:[\s\S]*$/,"").replace("Questo è il testo estratto da un volantino","Queste sono immagini delle pagine di un volantino").replace(" (le colonne possono essere mescolate)","")+" Leggi direttamente le immagini.";
  let from=null,to=null,offers=[],fail=0,lastErr=null;const nb=Math.ceil(pages.length/3),bad=[],t0=Date.now();
  for(let bi=0;bi<nb;bi++){const pa=bi*3+1,pb=Math.min(pages.length,bi*3+3),pg=pa===pb?"la pagina "+pa:"le pagine "+pa+"-"+pb,rem=bi?Math.ceil((Date.now()-t0)/bi*(nb-bi)/60000):0;say(`Sto leggendo ${pg} di ${pages.length}`+(offers.length?` · ${offers.length} offerte trovate finora`:"")+(rem?` · mancano circa ${rem<=1?"1 minuto":rem+" minuti"}`:""),bi*3,pages.length);if(bi)await wait(8000);
   let r=null;
   try{const imgs=[];for(const g of pages.slice(bi*3,bi*3+3))imgs.push(await g());
    for(let t=0;t<3&&!r;t++){try{r=await claude.vision(P,imgs)}catch(er){lastErr=er;if(/Limite/.test(er.message||"")&&t<2){say(`Pausa di 30 secondi: l’AI gratuita ha un limite di richieste. Poi riprendo da sola (${pg})`);await wait(30000)}else break}}}
   catch(er){lastErr=er}
   if(!r){fail++;bad.push(pa===pb?""+pa:pa+"-"+pb);continue}
   const o=Array.isArray(r)?{offers:r}:(r||{});if(!from&&okD(o.from))from=o.from;if(!to&&okD(o.to))to=o.to;
   (o.offers||[]).forEach(x=>{if(x&&(x.item||x.offer))offers.push({item:String(x.item||x.offer).slice(0,90),main:String(x.main||"").slice(0,50),offer:String(x.offer||"").slice(0,160),price:String(x.price||"").slice(0,30),from:okD(x.from)?x.from:null,to:okD(x.to)?x.to:null})})}
  const seen=new Set();offers=offers.filter(o=>{const k=nm(o.item)+"|"+o.price;if(seen.has(k))return false;seen.add(k);return true});
  if(!offers.length){if(lastErr)throw lastErr;throw new Error("Non ho trovato offerte nelle immagini.")}
  const id="f"+Date.now(),nmf=fs.length===1?fs[0].name.replace(/\.[^.]+$/,""):"Volantino (immagini)";
  S.fly.unshift({id,eng:"vision",store:store||"",name:nmf,added:today(),from,to,offers});if(S.fly.length>12)S.fly.length=12;S.fopen=id;save();
  toast(`🏷️ ${offers.length} offerte lette dalle immagini`+(to?`, valide fino al ${fD(to)}`:". Data di scadenza non indicata")+(fail?`. ⚠️ Non sono riuscito a leggere ${bad.length>1?"le pagine":"la pagina"} ${bad.join(", ")}: il volantino potrebbe essere incompleto`:""))}
 catch(e){S.ferr=aiErr(e)}S.fb=0;render()}
async function flyPdf(inp){const f=inp.files&&inp.files[0];if(!f)return;const store=$("of")?$("of").value:"";S.ofs=store;
 S.fb=1;S.ferr="";S.fmsg="Apro il PDF…";render();
 try{const key=f.name+"|"+f.size,old=Object.values(FT).find(v=>v.key===key);
  if(old){toast("Testo già salvato per questo PDF: non rifaccio la lettura.");return await flyBuild(old.text,store,f.name.replace(/\.pdf$/i,""),key)}
  const lib=await loadPdf(),R=await pdfText(f,lib,m=>{S.fmsg=m;const e=$("fmsg");if(e)e.textContent="⏳ "+m}),txt=R.text;S.focr=R.ocr>0;
  if(txt.replace(/\s/g,"").length<200)throw new Error("Non sono riuscito a leggere testo da questo PDF, neanche dalle immagini. Prova con un altro file, oppure incolla il testo copiato dal volantino.");
  await flyBuild(txt,store,f.name.replace(/\.pdf$/i,""),key)}
 catch(e){S.ferr=aiErr(e);S.fb=0;render()}}
async function flyImg(inp){const fs=[...(inp.files||[])].slice(0,16);if(!fs.length)return;const store=$("of")?$("of").value:"";S.ofs=store;
 S.fb=1;S.ferr="";S.fmsg="Preparo le immagini…";render();
 try{const w=await ocrWorker();const out=[];
  for(let i=0;i<fs.length;i++){const m=`Riconosco il testo dalle immagini… ${i+1} di ${fs.length}`;S.fmsg=m;const e=$("fmsg");if(e)e.textContent="⏳ "+m;
   const url=URL.createObjectURL(fs[i]);try{const r=await w.recognize(url);out.push((r.data&&r.data.text)||"")}finally{URL.revokeObjectURL(url)}}
  const txt=out.join("\n\n");S.focr=true;
  if(txt.replace(/\s/g,"").length<100)throw new Error("Non sono riuscito a leggere testo dalle immagini. Prova con foto più nitide e dritte, oppure incolla il testo.");
  await flyBuild(txt,store,fs.length>1?"Volantino (foto)":fs[0].name.replace(/\.[^.]+$/,""))}
 catch(e){ocrW=null;S.ferr=aiErr(e);S.fb=0;render()}}
function flyPaste(){const tx=($("ot").value||"").trim(),store=$("of")?$("of").value:"";S.ofs=store;if(tx.length<60)return toast("Incolla il testo del volantino.");flyBuild(tx,store,"Volantino incollato")}
function flyDel(id){const _f=S.fly.find(x=>x.id===id);if(S.fdel!==id){S.fdel=id;setTimeout(()=>{S.fdel=null},6000);return toast("Eliminare questo volantino? Premi di nuovo 🗑️ entro 6 secondi.")}S.fdel=null;const fi=S.fly.findIndex(f=>f.id===id),ft=_f?FT[_f.tid||_f.id]:null;S.fly=S.fly.filter(f=>f.id!==id);if(_f)delete FT[_f.tid||_f.id];ftSave();save();render();undoable("🗑️ Volantino eliminato.",{_f,fi,ft},u=>{S.fly.splice(Math.min(u.fi,S.fly.length),0,u._f);if(u.ft){FT[u._f.tid||u._f.id]=u.ft;ftSave()}})}
function untilTxt(to){if(!to)return"";const d=Math.round((new Date(to)-new Date(today()))/864e5);return d<0?"scaduta":d===0?"scade oggi":d===1?"scade domani":"scade tra "+d+" giorni"}
function offShop(fid,ix){const f=S.fly.find(x=>x.id===fid),o=f&&f.offers[ix];if(!o)return;const to=offTo(o,f)||"";
 if(S.shop.some(y=>!y.done&&nm(y.name)===nm(o.item)&&(y.store||"")===(f.store||"")))return toast("Questa offerta è già nella lista.");
 S.shop.push({id:"s"+Date.now()+Math.random().toString(36).slice(2,6),name:o.item,amount:0,unit:"",done:false,from:"Offerta del volantino"+(o.offer?": "+o.offer:""),store:f.store||"",price:o.price||"",until:to});
 save();render();toast(`🛒 ${esc(o.item)} aggiunto${o.price?" · "+esc(o.price):""}${to?" · "+untilTxt(to):""}<br><a href="#" onclick="S.tab='lista';render();return false" style="color:inherit;font-weight:700">Vai alla lista →</a>`)}
const PRES=/(?:^|\s)(?:all|alla|alle|ai|al|in|con|sott|sotto|nel|nello|senza)(?:['’]|\s)/i;
function offHead(o){const t=String(o.item||o.offer||""),m=t.match(PRES),h=m&&m.index>0?t.slice(0,m.index):t;return toks(o.main||h,1)}
function offMatch(qt,o){const ot=toks(o.item||o.offer||"",1);return !!qt.length&&qt.every(t=>ot.includes(t))&&!ot.some(t=>VAR.has(t)&&!qt.includes(t))&&qt.some(t=>offHead(o).includes(t))}
function freqIng(){const m={};const add=(r,use)=>{const seen=new Set(),t=String(r.title||"").toLowerCase();(r.ingredients||[]).forEach(g=>{if(BASIC.test(g.name||""))return;const tk=toks(g.name,1),k=tk.join(" ");if(!k||seen.has(k))return;seen.add(k);const e=m[k]=m[k]||{name:g.name,toks:tk,rec:new Set(),use:0};e.rec.add(t);if(use)e.use++})};
 S.mine.forEach(r=>add(r,0));S.hist.forEach(h=>h.r&&add(h.r,1));
 return Object.values(m).map(e=>({name:e.name,toks:e.toks,n:e.rec.size,use:e.use,score:e.rec.size+e.use})).filter(e=>e.n>=2||e.use>=3).sort((a,b)=>b.score-a.score).slice(0,40)}
function offHits(){const act=S.fly.filter(flyAct);if(!act.length)return[];const out=[];
 freqIng().forEach(q=>{const hits=[];act.forEach(f=>f.offers.forEach((o,ix)=>{const to=offTo(o,f);if(to&&to<today())return;if(offMatch(q.toks,o))hits.push({o,store:f.store,to,fid:f.id,ix})}));if(hits.length)out.push({q,hits:hits.slice(0,3)})});return out}
function offAlertHtml(){const hs=offHits();if(!hs.length)return"";
 return `<div class="al">🔥 <b>Ingredienti che usi spesso, ora in offerta</b>${hs.map(x=>`<div style="margin-top:8px">${emo(x.q.name)} <b>${esc(x.q.name)}</b> <span class="mu">(in ${x.q.n} ricett${x.q.n===1?"a":"e"}${x.q.use?", cucinato "+x.q.use+" volt"+(x.q.use===1?"a":"e"):""})</span><br>${x.hits.map(h=>`<div style="margin-top:4px">${esc(h.o.item)}${h.o.price?" · <b>"+esc(h.o.price)+"</b>":""}${h.store?" · "+esc(h.store):""}${h.to?" · "+untilTxt(h.to):""} <button class="btn g" ${BS} onclick="offShop('${h.fid}',${h.ix})">🛒 Aggiungi</button></div>`).join("")}</div>`).join("")}</div>`}
function offBanner(){const hs=offHits();if(!hs.length)return"";return `<div class="al" style="cursor:pointer" onclick="S.tab='negozi';render()">🔥 In offerta ciò che usi spesso: <b>${hs.slice(0,4).map(x=>esc(x.q.name)).join(", ")}</b> — tocca per i dettagli</div>`}
function vFlyers(){
 const stores=S.geo.stores,ta="width:100%;margin-top:8px;padding:10px;border:1px solid var(--bd);border-radius:22px;background:var(--card);color:var(--tx);font:inherit";
 const V=!!(window.claude&&claude.vision),dis=S.fb?"opacity:.5;pointer-events:none":"",bt="display:block;text-align:center;margin-top:8px;cursor:pointer;"+dis;
 let h=`<div class="card"><b>🏷️ Offerte dei volantini</b><div class="mu">Carica il volantino del tuo supermercato: l’app trova le offerte, i prezzi e le date di scadenza, e ti mostra quali ti servono davvero.</div>
 <div style="margin-top:14px"><b>1. Scegli il negozio</b><select id="of" style="margin-top:6px" onchange="S.ofs=this.value;render()"><option value="">Quale negozio?</option>${stores.map(s=>`<option ${S.ofs===s?"selected":""}>${esc(s)}</option>`).join("")}</select>${stores.length?"":`<div class="mu" style="margin-top:4px">Aggiungi prima i tuoi supermercati nella sezione “I tuoi supermercati” qui sotto.</div>`}</div>
 ${S.ofs?`<div style="margin-top:14px"><b>2. Procurati il volantino</b><div class="mu" style="margin-top:2px">Cercalo online e scaricalo (PDF), oppure fai uno screenshot delle pagine.</div><a class="btn g" style="display:block;text-align:center;margin-top:8px;text-decoration:none" target="_blank" rel="noopener" href="https://www.google.com/search?q=${encodeURIComponent("volantino "+S.ofs+" "+(S.geo.city||"")+" pdf")}">🔎 Cerca il volantino di ${esc(S.ofs)}</a><a class="btn g" style="display:block;text-align:center;margin-top:8px;text-decoration:none" target="_blank" rel="noopener" href="https://www.doveconviene.it/volantino/${encodeURIComponent(nm(S.ofs).replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''))}">🛍️ Apri su DoveConviene</a></div>`:""}
 <div style="margin-top:14px"><b>${S.ofs?"3":"2"}. Caricalo qui</b><label class="btn" style="${bt}">📄 Carica PDF del volantino<input type="file" accept=".pdf,application/pdf" hidden onchange="${V?"flyVision":"flyPdf"}(this)"></label><label class="btn g" style="${bt}">🖼️ Oppure carica le foto delle pagine<input type="file" accept="image/*" multiple hidden onchange="${V?"flyVision":"flyImg"}(this)"></label><div class="mu" style="margin-top:6px">${V?"L’app legge le pagine una alla volta (fino a 24) e ti dice a che punto è. Per un volantino lungo servono alcuni minuti: non chiudere la pagina finché non ha finito.":"Le pagine vengono convertite in immagini e lette con il riconoscimento del testo (qualche secondo a pagina)."}</div></div>
 <details style="margin-top:12px"><summary class="mu" style="cursor:pointer">Altre opzioni</summary>${V?`<label class="btn g" style="${bt}">📄 PDF con testo selezionabile (lettura alternativa)<input type="file" accept=".pdf,application/pdf" hidden onchange="flyPdf(this)"></label>`:""}<div class="mu" style="margin-top:10px">Oppure incolla il testo copiato dal volantino:</div><textarea id="ot" rows="5" placeholder="Incolla qui il testo…" style="${ta}"></textarea><button class="btn g" style="margin-top:8px" ${S.fb?"disabled":""} onclick="flyPaste()">Estrai offerte dal testo</button></details>
 ${S.fb?`<div style="margin-top:14px"><div class="mu" id="fmsg">⏳ ${esc(S.fmsg||"Leggo il volantino…")}</div><div style="height:10px;border-radius:99px;background:var(--bd);margin-top:8px;overflow:hidden"><div id="fbar" style="height:100%;width:${S.fp&&S.fp[1]?Math.max(4,Math.round(S.fp[0]/S.fp[1]*100)):4}%;background:var(--ac);border-radius:99px;transition:width .4s"></div></div></div>`:""}</div>`;

 if(S.ferr)h+=`<div class="al">${esc(S.ferr)}</div>`;
 h+=offAlertHtml();
 if(!S.fly.length)return h+`<p class="mu">Nessun volantino caricato.</p>`;
 const mine=S.fo==="mine",qs=nm(S.fsr||""),lst=S.shop.filter(x=>!x.done).map(x=>toks(x.name,1)),fq=freqIng(),cmp=lsg("fcmp","")==="1",srt=lsg("fsort",""),sf=lsg("fstore",""),
  cmpRows=(a,b)=>srt==="priceD"?((b.pr==null?-1:b.pr)-(a.pr==null?-1:a.pr)):srt==="price"?((a.pr==null?1e9:a.pr)-(b.pr==null?1e9:b.pr)):srt==="name"?nm(a.o.item).localeCompare(nm(b.o.item)):srt==="exp"?((a.to||"9")<(b.to||"9")?-1:(a.to||"9")>(b.to||"9")?1:0):0,
  so=[["","Come nel volantino"],["price","Prezzo: dal più basso"],["priceD","Prezzo: dal più alto"],["exp","Scadenza più vicina"],["name","Nome A–Z"],...(cmp?[["save","Risparmio maggiore"]]:[])];
 h+=`<div class="card"><b>Le offerte trovate</b><label style="display:flex;gap:12px;align-items:center;margin-top:10px;cursor:pointer"><input type="checkbox" style="width:26px;height:26px;flex:none" ${cmp?"checked":""} onchange="fcSet('fcmp',this.checked?'1':'')"><span><b>Confronta prezzo con altri negozi</b><div class="mu">Mette a confronto lo stesso prodotto nei vari volantini e segnala il più conveniente.</div></span></label><div class="f" style="margin-top:12px"><div><div class="mu">Ordina per</div><select onchange="fcSet('fsort',this.value)">${so.map(([k,n])=>`<option value="${k}" ${srt===k?"selected":""}>${n}</option>`).join("")}</select></div>${cmp?"":`<div><div class="mu">Negozio</div><select onchange="fcSet('fstore',this.value)"><option value="">Tutti i negozi</option>${[...new Set(S.fly.map(f=>f.store).filter(Boolean))].map(s=>`<option ${sf===s?"selected":""}>${esc(s)}</option>`).join("")}</select></div>`}</div><div class="row" style="gap:6px;flex-wrap:wrap;margin:12px 0 8px;justify-content:flex-start"><button class="btn ${mine?"g":""}" ${BS} onclick="S.fo='all';render()">Tutte le offerte</button><button class="btn ${mine?"":"g"}" ${BS} onclick="S.fo='mine';render()">⭐ Solo quelle utili per me</button></div><input id="fsr" placeholder="🔎 Cerca un prodotto (es. tonno)" value="${esc(S.fsr||"")}" oninput="fSearch(this.value)">${mine?`<div class="mu" style="margin-top:6px">Vedi le offerte dei prodotti che hai in lista e di quelli che usi spesso nelle tue ricette.</div>`:""}</div>`;
 if(cmp)return h+cmpHtml(srt,qs,mine);
 S.fly.forEach((f,fi)=>{if(sf&&f.store!==sf)return;const act=flyAct(f),dd=f.to?Math.round((new Date(f.to)-new Date(today()))/864e5):null;
  const rows=f.offers.map((o,ix)=>{const to=offTo(o,f),exp=!!to&&to<today(),onL=lst.some(t=>offMatch(t,o)),fr=fq.some(q=>offMatch(q.toks,o));return{o,ix,to,exp,onL,fr,pr:pNum(o.price),inS:S.shop.some(y=>!y.done&&nm(y.name)===nm(o.item)&&(y.store||"")===(f.store||""))}}).filter(x=>(!mine||x.onL||x.fr)&&(!qs||nm(x.o.item+" "+x.o.offer).includes(qs))).sort(cmpRows);
  h+=`<div class="card"><div class="row"><div><b>🏪 ${esc(f.store||"Negozio non indicato")}</b><div class="mu">${esc(f.name||"")} · ${f.offers.length} offerte</div></div><button class="x" onclick="flyDel('${f.id}')" aria-label="Elimina volantino">🗑️</button></div><div style="margin-top:6px"><span class="bd ${act?"":"ok"}">${act?(f.to?"valido fino al "+fD(f.to)+" ("+(dd===0?"oggi":dd===1?"ancora 1 giorno":"ancora "+dd+" giorni")+")":"scadenza non indicata"):"⚠️ scaduto il "+fD(f.to)}</span></div><details style="margin-top:8px" ${S.fopen===f.id||mine||qs||(fi===0&&S.fly.length===1)?"open":""}><summary style="cursor:pointer;font-weight:600">${rows.length===f.offers.length?"Mostra le "+rows.length+" offerte":"Mostra "+rows.length+" offerte su "+f.offers.length}</summary>${rows.slice(0,120).map(x=>`<div style="display:flex;gap:12px;justify-content:space-between;align-items:flex-start;padding:12px 0;border-top:1px solid var(--bd);${x.exp?"opacity:.5":""}"><div style="min-width:0;flex:1">${emo(x.o.item)} <b>${esc(x.o.item)}</b><div class="mu">${esc(x.o.offer)}</div><div style="margin-top:4px">${x.fr?`<span class="bd ok">⭐ la usi spesso</span> `:""}${x.onL?`<span class="bd ok">🛒 è nella tua lista</span> `:""}${x.to?`<span class="bd ${x.exp||(dd!=null&&dd<=2)?"":"ok"}">⏳ ${x.exp?"scaduta il "+fD(x.to):untilTxt(x.to)}</span>`:""}</div></div><div style="text-align:right;flex:none">${x.o.price?`<div style="font-size:19px;font-weight:800;line-height:1.1">${esc(x.o.price)}</div>`:""}${x.exp?"":`<button class="btn ${x.inS?"g":""}" ${BS} style="margin-top:6px" onclick="offShop('${f.id}',${x.ix})">${x.inS?"✓ In lista":"🛒 Aggiungi"}</button>`}</div></div>`).join("")||`<div class="mu" style="margin-top:8px">Nessuna offerta corrisponde${mine?" ai tuoi prodotti":""}${qs?" alla ricerca":""} in questo volantino.</div>`}</details></div>`});
 return h}
