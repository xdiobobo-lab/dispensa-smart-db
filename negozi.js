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
function flyRe(id){const f=S.fly.find(x=>x.id===id),t=f&&FT[f.tid||f.id];if(!t)return toast("Il testo di questo volantino non è salvato su questo dispositivo.");
 const L=flyLocal(t.text);f.offers=L.offers.map(o=>({item:o.item,offer:o.offer,price:o.price,from:null,to:null}));f.eng="local";if(L.dates){f.from=L.dates.from;f.to=L.dates.to}save();render();toast(`🔄 ${f.offers.length} offerte rielaborate dal testo salvato`)}
async function pageJpg(pdf,p){const pg=await pdf.getPage(p),v0=pg.getViewport({scale:1}),sc=Math.min(2.2,1400/v0.width),vp=pg.getViewport({scale:sc}),cv=document.createElement("canvas");cv.width=Math.round(vp.width);cv.height=Math.round(vp.height);const g=cv.getContext("2d");g.fillStyle="#fff";g.fillRect(0,0,cv.width,cv.height);await pg.render({canvasContext:g,viewport:vp}).promise;const u=cv.toDataURL("image/jpeg",.82);cv.width=cv.height=1;return u}
async function fileJpg(f){const bm=await createImageBitmap(f),sc=Math.min(1,1600/Math.max(bm.width,bm.height)),cv=document.createElement("canvas");cv.width=Math.round(bm.width*sc);cv.height=Math.round(bm.height*sc);const g=cv.getContext("2d");g.fillStyle="#fff";g.fillRect(0,0,cv.width,cv.height);g.drawImage(bm,0,0,cv.width,cv.height);const u=cv.toDataURL("image/jpeg",.85);cv.width=cv.height=1;return u}
async function flyVision(inp,retryId,so,meta){const fs=[...(inp.files||[])];if(!fs.length)return;const RF=retryId?S.fly.find(x=>x.id===retryId):null,store=RF?RF.store:(so!=null?so:($("of")?$("of").value:""));if(!RF)S.ofs=store;
 S.fb=1;S.ferr="";S.fp=null;S.fmsg="Preparo le pagine del volantino…";render();
 const say=(m,d,t)=>{S.fmsg=m;if(t!=null)S.fp=[d,t];flyPaint()},wait=ms=>new Promise(x=>setTimeout(x,ms));
 try{const pages=[];
  for(const f of fs){if(/pdf$/i.test(f.type)||/\.pdf$/i.test(f.name)){const lib=await loadPdf(),pdf=await lib.getDocument({data:await f.arrayBuffer()}).promise;for(let p=1;p<=Math.min(pdf.numPages,24);p++)pages.push(()=>pageJpg(pdf,p))}else pages.push(()=>fileJpg(f))}
  if(pages.length>24)pages.length=24;
  const P=flyPrompt("",store).replace(/TESTO:[\s\S]*$/,"").replace("Questo è il testo estratto da un volantino","Queste sono immagini delle pagine di un volantino").replace(" (le colonne possono essere mescolate)","")+" Leggi direttamente le immagini.";
  let from=null,to=null,offers=[],fail=0,lastErr=null;const idx=RF&&RF.bad&&RF.bad.length?RF.bad.filter(n=>n>=1&&n<=pages.length).map(n=>n-1):pages.map((_,i)=>i),nb=Math.ceil(idx.length/3),bad=[],t0=Date.now();if(!idx.length)throw new Error("Le pagine da riprovare non sono in questo file: scegli lo stesso file di prima.");
  for(let bi=0;bi<nb;bi++){const ids=idx.slice(bi*3,bi*3+3),pn=ids.map(k=>k+1),pa=pn[0],pb=pn[pn.length-1],pg=pn.length===1?"la pagina "+pa:"le pagine "+badTxt(pn),rem=bi?Math.ceil((Date.now()-t0)/bi*(nb-bi)/60000):0;say(`Sto leggendo ${pg} di ${idx.length}`+(offers.length?` · ${offers.length} offerte trovate finora`:"")+(rem?` · mancano circa ${rem<=1?"1 minuto":rem+" minuti"}`:""),bi*3,idx.length);if(bi)await wait(8000);
   let r=null;
   try{const imgs=[];for(const k of ids)imgs.push(await pages[k]());
    for(let t=0;t<3&&!r;t++){try{r=await claude.vision(P,imgs)}catch(er){lastErr=er;if(/Limite/.test(er.message||"")&&t<2){say(`Pausa di 30 secondi: l’AI gratuita ha un limite di richieste. Poi riprendo da sola (${pg})`);await wait(30000)}else break}}}
   catch(er){lastErr=er}
   if(!r){fail++;pn.forEach(n=>bad.push(n));continue}
   const o=Array.isArray(r)?{offers:r}:(r||{});if(!from&&okD(o.from))from=o.from;if(!to&&okD(o.to))to=o.to;
   (o.offers||[]).forEach(x=>{if(x&&(x.item||x.offer))offers.push({item:String(x.item||x.offer).slice(0,90),main:String(x.main||"").slice(0,50),offer:String(x.offer||"").slice(0,160),price:String(x.price||"").slice(0,30),from:okD(x.from)?x.from:null,to:okD(x.to)?x.to:null})})}
  const seen=new Set();offers=offers.filter(o=>{const k=nm(o.item)+"|"+o.price;if(seen.has(k))return false;seen.add(k);return true});
  if(!offers.length&&!RF){if(lastErr)throw lastErr;throw new Error("Non ho trovato offerte nelle immagini.")}
  if(RF&&!offers.length&&fail===idx.length&&lastErr)throw lastErr;
  if(RF){const have=new Set(RF.offers.map(o=>nm(o.item)+"|"+o.price));const nw=offers.filter(o=>!have.has(nm(o.item)+"|"+o.price));RF.offers=[...RF.offers,...nw];RF.bad=bad;if(!RF.from&&from)RF.from=from;if(!RF.to&&to)RF.to=to;S.fopen=RF.id;save();toast(nw.length?`🔁 Recuperate ${nw.length} offerte`+(bad.length?`. Restano non lette le pagine ${badTxt(bad)}`:". Volantino completo"):(bad.length?`Nessuna offerta nuova: restano non lette le pagine ${badTxt(bad)}`:"Pagine rilette: nessuna offerta in più. Volantino completo"));S.fb=0;render();return}
  const id="f"+Date.now(),nmf=(meta&&meta.nome)||(fs.length===1?fs[0].name.replace(/\.[^.]+$/,""):"Volantino (immagini)");
  if(meta&&meta.nome)S.fly=S.fly.filter(x=>!(x.name===meta.nome&&(x.store||"")===(store||"")));
  S.fly.unshift({id,eng:"vision",store:store||"",regione:(meta&&meta.regione)||"",name:nmf,added:today(),from,to,offers,bad});if(S.fly.length>12)S.fly.length=12;S.fopen=id;save();
  toast(`🏷️ ${offers.length} offerte lette dalle immagini`+(to?`, valide fino al ${fD(to)}`:". Data di scadenza non indicata")+(fail?`. ⚠️ Non sono riuscito a leggere ${bad.length>1?"le pagine":"la pagina"} ${badTxt(bad)}: puoi riprovarle dalla scheda del volantino`:""))}
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
function priceWarn(o){const t=String(o.price||"").trim();if(!t)return"";const p=pNum(t);if(p==null)return"prezzo non riconosciuto";if(p<=0)return"prezzo a zero";if(p<0.1)return"prezzo molto basso";if(p>=100)return"prezzo molto alto";return""}
function offEd(f,i){S.oed={f,i};render()}
function offEdForm(f,x){const o=x.o;return `<div style="padding:12px 0;border-top:1px solid var(--bd)"><b>✏️ Correggi l’offerta</b><div class="f" style="margin-top:8px"><div class="w"><input id="oe_i" value="${esc(o.item)}" placeholder="Prodotto"></div><div><input id="oe_p" value="${esc(o.price||"")}" placeholder="Prezzo (es. 1,99 €)"></div><div><input id="oe_t" type="date" value="${o.to||f.to||""}"></div><div class="w"><input id="oe_o" value="${esc(o.offer||"")}" placeholder="Dettagli (es. 3x80g, 2x1)"></div></div><div class="row" style="gap:6px;flex-wrap:wrap;justify-content:flex-start;margin-top:8px"><button class="btn" ${BS} onclick="offEdSave('${f.id}',${x.ix})">Salva</button><button class="btn g" ${BS} onclick="S.oed=null;render()">Annulla</button><button class="btn g" ${BS} onclick="offEdDel('${f.id}',${x.ix})">🗑️ Elimina offerta</button></div></div>`}
function offEdSave(fid,ix){const f=S.fly.find(x=>x.id===fid),o=f&&f.offers[ix];if(!o)return;const it=($("oe_i").value||"").trim();if(!it)return toast("Scrivi il nome del prodotto.");
 if(nm(o.item)!==nm(it))o.main="";o.item=it.slice(0,90);o.price=($("oe_p").value||"").trim().slice(0,30);o.offer=($("oe_o").value||"").trim().slice(0,160);const t=$("oe_t").value;o.to=okD(t)?t:null;o.edit=true;S.oed=null;save();render();toast("✏️ Offerta corretta.")}
function offEdDel(fid,ix){const f=S.fly.find(x=>x.id===fid);if(!f||!f.offers[ix])return;const o=f.offers.splice(ix,1)[0];S.oed=null;save();render();undoable("🗑️ Offerta eliminata.",{fid,ix,o},u=>{const g=S.fly.find(x=>x.id===u.fid);if(g)g.offers.splice(Math.min(u.ix,g.offers.length),0,u.o)})}
const badTxt=a=>{a=[...a].sort((x,y)=>x-y);const o=[];for(let i=0;i<a.length;){let j=i;while(j+1<a.length&&a[j+1]===a[j]+1)j++;o.push(j>i?a[i]+"-"+a[j]:""+a[i]);i=j+1}return o.join(", ")};
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
async function flyIdx(){
 if(!sbOn()){S.fidx=false;S.fno="login";if(S.tab==="negozi"&&!S.fb&&!S.fv)render();return}
 try{const r=await sbRest("volantini_catalogo?select=chiave,nome,regione,citta,url,volantini,aggiornato&order=nome.asc");
  if(!r.ok)throw new Error("HTTP "+r.status);const a=await r.json();
  S.fidx={aggiornato:a.reduce((m,x)=>x.aggiornato>m?x.aggiornato:m,""),negozi:a.map(x=>({chiave:x.chiave,nome:x.nome,regione:x.regione||"",citta:x.citta||"",url:x.url,volantini:Array.isArray(x.volantini)?x.volantini:[]}))};S.fno="";
  try{await vcSign(S.fidx.negozi.flatMap(n=>n.volantini.map(v=>v.pagine&&v.pagine[0]).filter(Boolean)))}catch(e){}
 }catch(e){S.fidx=false;S.fno="err"}
 if(S.tab==="negozi"&&!S.fb&&!S.fv)render()}
async function vcSign(ps){S.sig=S.sig||{};ps=[...new Set(ps)].filter(p=>p&&!(S.sig[p]&&S.sig[p].e>Date.now()));if(!ps.length)return;
 const c=sbCfg(),t=await sbToken();
 for(let i=0;i<ps.length;i+=100){const r=await fetch(c.url+"/storage/v1/object/sign/volantini",{method:"POST",headers:{apikey:c.key,authorization:"Bearer "+t,"content-type":"application/json"},body:JSON.stringify({expiresIn:3600,paths:ps.slice(i,i+100)})});
  if(!r.ok)throw new Error("Non riesco ad aprire le immagini (HTTP "+r.status+").");
  for(const x of await r.json())if(x.signedURL&&!x.error)S.sig[x.path]={u:c.url+"/storage/v1"+x.signedURL,e:Date.now()+3000000}}}
function vcImg(p){const s=S.sig&&S.sig[p];return s?s.u:""}
async function vcTogli(k){if(S.vdel!==k){S.vdel=k;setTimeout(()=>{if(S.vdel===k){S.vdel=null;render()}},6000);render();return toast("Premi di nuovo per togliere questo supermercato dai tuoi volantini.")}
 S.vdel=null;try{const r=await sbRest("miei_volantini?chiave=eq."+encodeURIComponent(k),{method:"DELETE"});if(!r.ok)throw new Error("x");S.vcf="";S.vcr=null;await flyIdx();toast("Tolto dai tuoi volantini.")}catch(e){toast("Non riesco a toglierlo: riprova.")}}
const VC_REG={"Abruzzo":"Pescara","Basilicata":"Potenza","Calabria":"Catanzaro","Campania":"Napoli","Emilia-Romagna":"Bologna","Friuli-Venezia Giulia":"Trieste","Lazio":"Roma","Liguria":"Genova","Lombardia":"Milano","Marche":"Ancona","Molise":"Campobasso","Piemonte":"Torino","Puglia":"Bari","Sardegna":"Cagliari","Sicilia":"Palermo","Toscana":"Firenze","Trentino-Alto Adige":"Trento","Umbria":"Perugia","Valle d'Aosta":"Aosta","Veneto":"Venezia"};
const VC_CAT=["Conad","Lidl","Eurospin","Coop","Carrefour","Esselunga","MD","Pam","Tigros","Despar","Iper","Penny","Aldi","Bennet","Famila"];
const vcSlug=s=>String(s||"").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g,"").replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
function vcSet(k,v){S.vc={...(S.vc||{}),[k]:v};if(k==="regione")S.vc.citta=S.vc.citta||"";try{localStorage.setItem("vc",JSON.stringify({regione:S.vc.regione||"",catena:S.vc.catena||"",citta:S.vc.citta||""}))}catch(e){}}
function vcPick(r,c,ci){S.vc={regione:r,catena:c,citta:ci||""};S.vcr=null;vcCerca()}
function vcFind(){const j=S.fidx,q=S.vc||{};if(!j||!q.catena)return[];const ci=vcSlug(q.citta),key=vcSlug(q.catena)+"|"+vcSlug(q.citta||VC_REG[q.regione]||"");
 return j.negozi.map((n,si)=>({n,si,v:(n.volantini||[]).map((v,fi)=>({v,fi})).filter(x=>x.v.pagine&&x.v.pagine.length)})).filter(x=>x.v.length&&(x.n.chiave?x.n.chiave===key:(vcSlug(x.n.nome)===vcSlug(q.catena)&&(!q.regione||!x.n.regione||x.n.regione===q.regione)&&(!ci||!x.n.citta||vcSlug(x.n.citta)===ci))))}
async function vcCerca(){const f=S.vc||{};
 for(const [id,k] of [["vc_r","regione"],["vc_c","catena"],["vc_t","citta"]]){const e=$(id);if(e)f[k]=e.value.trim()}S.vc=f;
 try{localStorage.setItem("vc",JSON.stringify({regione:f.regione||"",catena:f.catena||"",citta:f.citta||""}))}catch(e){}
 if(!f.catena)return toast("Scrivi il nome del supermercato.");if(!f.regione)return toast("Scegli la regione.");
 if(!sbOn()){S.vcr={n:0,login:1};return render()}
 S.vcr={q:1};render();
 try{const r0=await sbRest("miei_volantini",{method:"POST",headers:{Prefer:"return=minimal"},body:JSON.stringify({chiave:vcSlug(f.catena)+"|"+vcSlug(f.citta||VC_REG[f.regione]||"")})});
  if(!r0.ok&&r0.status!==409){S.vcr={n:0,err:(r0.status===404?"I volantini privati non sono ancora attivi: esegui di nuovo supabase-setup.sql in Supabase.":"Non riesco ad aggiungere il supermercato: "+sbBad(r0))};return render()}
 }catch(e){S.vcr={n:0,err:e.message};return render()}
 await flyIdx();
 const trov=vcFind();S.vcr={n:trov.length};if(trov.length)S.vcf=trov[0].n.nome;
 if(!trov.length){const citta=f.citta||VC_REG[f.regione]||"";
  if(sbOn()){try{const r=await sbRest("richieste_volantini",{method:"POST",headers:{Prefer:"return=minimal"},body:JSON.stringify({catena:f.catena,regione:f.regione,citta,chiave:vcSlug(f.catena)+"|"+vcSlug(citta)})});
    if(!r.ok&&r.status!==409){let j=null;try{j=await r.json()}catch(e){}const m=(j&&(j.message||j.msg||j.hint))||"",cod=(j&&j.code)||"";S.vcr={n:0,err:(r.status===404||cod==="PGRST205"||cod==="42P01")?"La ricerca non è ancora attiva: la tabella delle richieste non esiste ancora in Supabase (esegui il blocco SQL, poi attendi un minuto).":cod==="42501"?"Supabase rifiuta la richiesta: "+(m||"permessi insufficienti")+" ["+cod+"]":"Non riesco a salvare la richiesta: "+(m||sbBad(r))+(cod?" ["+cod+"]":"")}}else S.vcr={n:0,ric:1,citta}}catch(e){S.vcr={n:0,err:e.message}}}
  else S.vcr={n:0,login:1}}
 render();if(S.vcr&&S.vcr.ric)vcAvvia()}
function vcPx(){try{const p=window.__PX&&window.__PX();if(p)return p;const A=window.AI_PROXY;return A&&A.u&&A.c?{u:String(A.u).trim(),c:String(A.c).trim()}:null}catch(e){return null}}
async function vcApi(path,m){const p=vcPx();if(!p)throw new Error("Accesso all'AI non attivo su questo dispositivo.");const r=await fetch(p.u.replace(/\/+$/,"")+"/v1/volantini/"+path,{method:m||"GET",headers:{"x-access-code":p.c}});const j=await r.json().catch(()=>({}));if(!r.ok)throw new Error((j.error&&j.error.message)||"Errore "+r.status);return j}
async function vcAvvia(){const R=S.vcr;if(!R)return;if(!vcPx()){R.warn="Avvio immediato non disponibile: manca AI_PROXY in config.js.";return render()}R.att=1;render();
 try{const j=await vcApi("avvia","POST");R.t0=(j.t||Date.now())-15000;R.gia=!!j.gia;R.again=!!j.gia;vcPoll(Date.now())}
 catch(e){if(S.vcr===R){R.att=0;R.warn=e.message;render()}}}
async function vcPoll(t){const R=S.vcr;if(!R||!R.att)return;
 if(Date.now()-t>15*60000){R.att=0;R.warn="La ricerca sta durando più del previsto: riprova tra poco.";return render()}
 try{const j=await vcApi("stato"),u=j.ultima;
  if(u&&u.stato==="completed"&&(R.gia||new Date(u.creata).getTime()>=R.t0)){
   if(R.again){R.again=false;R.gia=false;const k=await vcApi("avvia","POST");R.t0=(k.t||Date.now())-15000;R.gia=!!k.gia;R.again=!!k.gia;render();return setTimeout(()=>vcPoll(t),8000)}
   await flyIdx();const trov=vcFind();R.fin=(R.fin||0)+1;
   if(trov.length){S.vcr={n:trov.length};S.vcf=trov[0].n.nome;return render()}
   if(R.fin<10&&u.conclusione==="success"){R.pub=1;render();return setTimeout(()=>vcPoll(t),20000)}
   R.att=0;R.fine=1;R.ok=u.conclusione==="success";return render()}
 }catch(e){R.warn=e.message}
 if(S.vcr===R){render();setTimeout(()=>vcPoll(t),8000)}}
function vcChip(n){S.vcf=n;if(S.vcr&&S.vcr.n)S.vcr=null;render()}
function vcCard(x,y){const v=y.v,n=x.n,np=v.pagine.length,sub=[n.nome,n.citta||n.regione].filter(Boolean).join(" · ");
 return `<div style="background:var(--card);border:1px solid var(--bd);border-radius:16px;overflow:hidden;display:flex;flex-direction:column"><div onclick="flyOpen(${x.si},${y.fi})" style="position:relative;aspect-ratio:3/4;background:var(--bd);cursor:pointer;display:flex;align-items:center;justify-content:center"><img src="${esc(vcImg(v.pagine[0]))}" alt="Copertina di ${esc(v.nome||n.nome)}" loading="lazy" style="width:100%;height:100%;object-fit:cover" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"><div style="display:none;flex-direction:column;align-items:center;gap:6px;padding:10px;text-align:center"><span style="font-size:36px">🛒</span><b>${esc(n.nome)}</b><span class="mu" style="font-size:12px">Anteprima non disponibile</span></div><span style="position:absolute;top:8px;left:8px;background:rgba(0,0,0,.65);color:#fff;border-radius:999px;padding:3px 10px;font-size:12px;font-weight:600">${np} pagin${np===1?"a":"e"}</span></div>
<div style="padding:10px;display:flex;flex-direction:column;gap:6px;flex:1"><div style="font-weight:600;font-size:14px;line-height:1.25">${esc(v.nome||"Volantino")}</div><div class="mu" style="font-size:12px">${esc(sub)}${v.validita?" · "+esc(v.validita):""}</div><div style="margin-top:auto;display:flex;flex-direction:column;gap:6px"><button class="btn" style="width:100%;padding:10px;font-size:14px" onclick="flyOpen(${x.si},${y.fi})">📖 Sfoglia</button><button class="btn g" style="width:100%;padding:9px;font-size:13px;${S.fb?"opacity:.5;pointer-events:none":""}" onclick="flyAiRead(${x.si},${y.fi})">🤖 Leggi le offerte</button></div></div></div>`}
function vcFlyers(trov){return `<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(125px,1fr));gap:12px;margin-top:12px">${trov.map(x=>x.v.map(y=>vcCard(x,y)).join("")).join("")}</div>`}
function vSfoglia(){if(S.fidx===undefined){S.fidx=null;flyIdx()}
 if(!S.vc){try{S.vc=JSON.parse(localStorage.getItem("vc"))||{}}catch(e){S.vc={}}}
 const f=S.vc,j=S.fidx,r=S.vcr,all=j?j.negozi.map((n,si)=>({n,si,v:(n.volantini||[]).map((v,fi)=>({v,fi})).filter(x=>x.v.pagine&&x.v.pagine.length)})).filter(x=>x.v.length):[];
 const nomi=[...new Set(all.map(x=>x.n.nome))].sort((a,b)=>a.localeCompare(b));if(S.vcf&&!nomi.includes(S.vcf))S.vcf="";
 const tot=all.reduce((a,x)=>a+x.v.length,0);
 let res="";
 if(r&&r.q)res=`<div class="mu" style="margin-top:12px">Cerco…</div>`;
 else if(r&&r.n)res=`<div style="margin-top:12px;padding:10px 12px;border-radius:12px;background:var(--bd)">✅ Ho trovato i volantini di <b>${esc(f.catena)}</b>: li vedi qui sotto.</div>`;
 else if(r&&r.ric&&r.att)res=`<div class="card" style="margin-top:12px;border-color:var(--ac)"><b>⏳ ${r.pub?"Sto pubblicando i volantini di ":"Sto cercando i volantini di "}${esc(f.catena)}…</b><div style="margin-top:4px">${r.pub?"Li ho trovati: sul sito ci vuole ancora uno o due minuti perché compaiano.":"Ci vogliono circa 5 minuti. Puoi restare qui: appena li trovo compaiono."}${r.warn?`<div class="mu" style="margin-top:6px">${esc(r.warn)}</div>`:""}</div></div>`;
 else if(r&&r.ric&&r.fine)res=`<div class="al" style="margin-top:12px">${r.ok?"La ricerca è finita, ma non ho trovato volantini di <b>"+esc(f.catena)+"</b> per "+esc(r.citta)+". Controlla il nome del supermercato e la città (potrebbe non averli).":"La ricerca ha avuto un problema e non è andata a buon fine. Riprova più tardi."}</div>`;
 else if(r&&r.ric)res=`<div class="card" style="margin-top:12px;border-color:var(--ac)"><b>✅ Richiesta registrata</b><div style="margin-top:4px">Non avevo ancora i volantini di <b>${esc(f.catena)}</b> (${esc(r.citta)}). Li cerco entro qualche ora: riprova più tardi e li trovi qui.${r.warn?`<div class="mu" style="margin-top:6px">${esc(r.warn)}</div>`:""}</div></div>`;
 else if(r&&r.login)res=`<div class="al" style="margin-top:12px">Non ho ancora i volantini di ${esc(f.catena)} per questa zona. Per chiederli accedi al tuo account (⚙️ Impostazioni).</div>`;
 else if(r&&r.err)res=`<div class="al" style="margin-top:12px">${esc(r.err)}</div>`;
 const inp="width:100%;margin-top:4px",ag=j&&j.aggiornato?new Date(j.aggiornato).toLocaleDateString("it-IT",{day:"numeric",month:"long"}):"";
 const lista=(r&&r.n)?vcFind():(S.vcf?all.filter(x=>x.n.nome===S.vcf):all);
 const chip=(n,l)=>`<button class="btn ${(S.vcf||"")===n?"":"g"}" style="padding:8px 14px;font-size:14px;white-space:nowrap" onclick="vcChip('${esc(n).replace(/'/g,"\\'")}')">${esc(l)}</button>`;
 return `<div class="card"><b>📚 Volantini disponibili</b><div class="mu">${tot?tot+" volantin"+(tot===1?"o":"i")+" nei tuoi supermercati"+(ag?" (aggiornati il "+ag+")":"")+". Scegli il supermercato, tocca un volantino per sfogliarlo oppure fai leggere le offerte all’intelligenza artificiale.":(S.fno==="login"?"I volantini sono personali: accedi al tuo account (⚙️ Impostazioni) per vederli e cercarli.":S.fno==="err"?"Non riesco a caricare i tuoi volantini: se non l’hai già fatto, esegui di nuovo supabase-setup.sql in Supabase.":j===null?"Carico i volantini…":"Non hai ancora supermercati: cerca il tuo qui sotto.")}</div>
${tot?`<div style="display:flex;gap:8px;overflow-x:auto;padding:12px 0 2px">${chip("","Tutti")}${nomi.map(n=>chip(n,n)).join("")}</div>${vcFlyers(lista)}${S.vcf?[...new Map(lista.filter(x=>x.n.chiave).map(x=>[x.n.chiave,x.n])).values()].map(n=>`<button class="btn g" style="width:100%;margin-top:10px;font-size:13px" onclick="vcTogli('${esc(n.chiave)}')">${S.vdel===n.chiave?"Premi di nuovo per confermare":"🗑️ Togli "+esc(n.nome)+(n.citta?" ("+esc(n.citta)+")":"")+" dai miei volantini"}</button>`).join(""):""}`:""}</div>
<div class="card"><b>🔎 Cerca i volantini nella tua zona!</b><div class="mu">Non trovi il tuo supermercato? Scegli la regione e scrivi il nome: lo cerco e lo aggiungo all’elenco.</div>
<div style="margin-top:10px"><div class="mu" style="font-size:12px">Regione</div><select id="vc_r" style="${inp}" onchange="vcSet('regione',this.value)"><option value="">Scegli la regione</option>${Object.keys(VC_REG).map(x=>`<option ${f.regione===x?"selected":""}>${esc(x)}</option>`).join("")}</select></div>
<div style="margin-top:8px"><div class="mu" style="font-size:12px">Supermercato</div><input id="vc_c" list="vc_l" style="${inp}" placeholder="Es. Conad, Lidl, Eurospin…" value="${esc(f.catena||"")}" oninput="vcSet('catena',this.value)"><datalist id="vc_l">${VC_CAT.map(x=>`<option value="${x}">`).join("")}</datalist></div>
<div style="margin-top:8px"><div class="mu" style="font-size:12px">Città (facoltativa)</div><input id="vc_t" style="${inp}" placeholder="Se vuota uso il capoluogo della regione" value="${esc(f.citta||"")}" oninput="vcSet('citta',this.value)"></div>
<button class="btn" style="width:100%;margin-top:10px" onclick="vcCerca()">🔎 Cerca i volantini</button>${res}</div>`}
async function flyOpen(si,fi){const v=S.fidx&&S.fidx.negozi[si]&&S.fidx.negozi[si].volantini[fi];if(!v||!v.pagine.length)return;try{await vcSign(v.pagine)}catch(e){return toast(e.message)}S.fv={si,fi,p:0};drawFv();if(!window.__fvk){window.__fvk=1;document.addEventListener("keydown",e=>{if(!S.fv)return;if(e.key==="ArrowRight")flyPg(1);else if(e.key==="ArrowLeft")flyPg(-1);else if(e.key==="Escape")flyClose()})}}
function flyPg(d){const f=S.fv;if(!f)return;const v=S.fidx.negozi[f.si].volantini[f.fi],n=v.pagine.length;f.p=Math.max(0,Math.min(n-1,f.p+d));drawFv()}
function flyClose(){S.fv=null;drawFv()}
function drawFv(){let p=$("fv");if(!S.fv){if(p){p.style.display="none";p.innerHTML=""}document.body.style.overflow="";return}
 if(!p){p=document.createElement("div");p.id="fv";document.body.appendChild(p)}
 const f=S.fv,n0=S.fidx.negozi[f.si],v=n0.volantini[f.fi],n=v.pagine.length,bt="border:0;border-radius:12px;padding:12px 18px;font:600 16px system-ui;background:#a78bfa;color:#15111f";
 p.style.cssText="position:fixed;inset:0;z-index:50;background:#111;color:#fff;display:flex;flex-direction:column";document.body.style.overflow="hidden";
 p.innerHTML=`<div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:calc(env(safe-area-inset-top,0px) + 10px) 12px 8px"><div style="min-width:0"><div style="font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(n0.nome)} · ${esc(v.nome||"Volantino")}</div><div style="opacity:.7;font-size:13px">Pagina ${f.p+1} di ${n}</div></div><button style="${bt}" onclick="flyClose()" aria-label="Chiudi">✕ Chiudi</button></div>
<div id="fvi" style="flex:1;min-height:0;overflow:auto;display:flex;align-items:flex-start;justify-content:center;touch-action:pan-x pan-y pinch-zoom"><img src="${esc(vcImg(v.pagine[f.p]))}" alt="Pagina ${f.p+1}" style="max-width:100%;max-height:100%;object-fit:contain;margin:auto"></div>
<div style="display:flex;gap:10px;justify-content:space-between;align-items:center;padding:10px 12px calc(env(safe-area-inset-bottom,0px) + 12px)"><button style="${bt};${f.p?"":"opacity:.35"}" ${f.p?"":"disabled"} onclick="flyPg(-1)">← Indietro</button><button style="${bt};background:#2b2540;color:#fff" onclick="flyClose();flyAiRead(${f.si},${f.fi})">🤖 Leggi le offerte</button><button style="${bt};${f.p<n-1?"":"opacity:.35"}" ${f.p<n-1?"":"disabled"} onclick="flyPg(1)">Avanti →</button></div>`;
 p.style.display="flex";const im=$("fvi");let x0=null;im.ontouchstart=e=>{x0=e.touches.length===1?e.touches[0].clientX:null};im.ontouchend=e=>{if(x0==null)return;const dx=e.changedTouches[0].clientX-x0;x0=null;if(Math.abs(dx)>70)flyPg(dx<0?1:-1)}}
async function flyAiRead(si,fi){const n=S.fidx&&S.fidx.negozi[si],v=n&&n.volantini[fi];if(!v||S.fb)return;
 if(!(window.claude&&claude.vision))return toast("La lettura con AI non è attiva su questo dispositivo.");
 S.fb=1;S.ferr="";S.fp=null;S.fmsg="Scarico le pagine del volantino…";render();
 try{const lista=v.pagine.slice(0,24),files=[];await vcSign(lista);
  for(const [i,pg] of lista.entries()){const r=await fetch(vcImg(pg),{cache:"force-cache"});if(!r.ok)throw new Error("Non riesco a scaricare la pagina "+(i+1)+".");const b=await r.blob();files.push(new File([b],"p"+(i+1)+"."+(pg.split(".").pop()||"jpg"),{type:b.type||"image/webp"}))}
  if(v.pagine.length>24)toast("Leggo le prime 24 pagine su "+v.pagine.length+".");
  await flyVision({files},null,n.nome,{nome:v.nome||("Volantino "+n.nome),regione:n.regione||""})
 }catch(e){S.fb=0;S.ferr=aiErr?aiErr(e):String(e.message||e);render()}}
function vFlyers(){
 const stores=S.geo.stores,ta="width:100%;margin-top:8px;padding:10px;border:1px solid var(--bd);border-radius:22px;background:var(--card);color:var(--tx);font:inherit";
 const V=!!(window.claude&&claude.vision),dis=S.fb?"opacity:.5;pointer-events:none":"",bt="display:block;text-align:center;margin-top:8px;cursor:pointer;"+dis;
 let h=vSfoglia()+`<div class="card"><b>🏷️ Offerte dei volantini</b><div class="mu">Carica il volantino del tuo supermercato: l’app trova le offerte, i prezzi e le date di scadenza, e ti mostra quali ti servono davvero.</div>
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
  h+=`<div class="card"><div class="row"><div><b>🏪 ${esc(f.store||"Negozio non indicato")}</b><div class="mu">${f.regione?esc(f.regione)+" · ":""}${esc(f.name||"")} · ${f.offers.length} offerte</div></div><button class="x" onclick="flyDel('${f.id}')" aria-label="Elimina volantino">🗑️</button></div><div style="margin-top:6px"><span class="bd ${act?"":"ok"}">${act?(f.to?"valido fino al "+fD(f.to)+" ("+(dd===0?"oggi":dd===1?"ancora 1 giorno":"ancora "+dd+" giorni")+")":"scadenza non indicata"):"⚠️ scaduto il "+fD(f.to)}</span>${(()=>{const n=f.offers.filter(priceWarn).length;return n?` <span class="bd">⚠️ ${n} prezzi da controllare</span>`:""})()}</div>${f.bad&&f.bad.length?`<div class="al" style="margin-top:8px">Pagine non lette: <b>${badTxt(f.bad)}</b>. Il volantino può essere incompleto.<label class="btn" ${BS} style="display:inline-block;margin-top:6px;cursor:pointer;${S.fb?"opacity:.5;pointer-events:none":""}">🔁 Riprova solo queste pagine<input type="file" accept=".pdf,application/pdf,image/*" multiple hidden onchange="flyVision(this,'${f.id}')"></label><div class="mu" style="margin-top:4px">Scegli di nuovo lo stesso file (o le stesse foto, nello stesso ordine).</div></div>`:""}<details style="margin-top:8px" ${S.fopen===f.id||mine||qs||(fi===0&&S.fly.length===1)?"open":""}><summary style="cursor:pointer;font-weight:600">${rows.length===f.offers.length?"Mostra le "+rows.length+" offerte":"Mostra "+rows.length+" offerte su "+f.offers.length}</summary>${rows.slice(0,120).map(x=>S.oed&&S.oed.f===f.id&&S.oed.i===x.ix?offEdForm(f,x):`<div style="display:flex;gap:12px;justify-content:space-between;align-items:flex-start;padding:12px 0;border-top:1px solid var(--bd);${x.exp?"opacity:.5":""}"><div style="min-width:0;flex:1">${emo(x.o.item)} <b>${esc(x.o.item)}</b><div class="mu">${esc(x.o.offer)}</div><div style="margin-top:4px">${priceWarn(x.o)?`<span class="bd">⚠️ ${priceWarn(x.o)}</span> `:""}${x.o.edit?`<span class="bd ok">✏️ corretta</span> `:""}${x.fr?`<span class="bd ok">⭐ la usi spesso</span> `:""}${x.onL?`<span class="bd ok">🛒 è nella tua lista</span> `:""}${x.to?`<span class="bd ${x.exp||(dd!=null&&dd<=2)?"":"ok"}">⏳ ${x.exp?"scaduta il "+fD(x.to):untilTxt(x.to)}</span>`:""}</div></div><div style="text-align:right;flex:none">${x.o.price?`<div style="font-size:19px;font-weight:800;line-height:1.1">${esc(x.o.price)}</div>`:""}${x.exp?"":`<button class="btn ${x.inS?"g":""}" ${BS} style="margin-top:6px" onclick="offShop('${f.id}',${x.ix})">${x.inS?"✓ In lista":"🛒 Aggiungi"}</button>`}<div><button class="x" style="font-size:14px" onclick="offEd('${f.id}',${x.ix})" aria-label="Correggi offerta">✏️ Correggi</button></div></div></div>`).join("")||`<div class="mu" style="margin-top:8px">Nessuna offerta corrisponde${mine?" ai tuoi prodotti":""}${qs?" alla ricerca":""} in questo volantino.</div>`}</details></div>`});
 return h}
