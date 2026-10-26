/* Dispensa Smart - dati.js */
function syncSite(){if(!S.cf){S.cf=1;setTimeout(()=>S.cf=0,6000);return toast("Questo sostituisce i dati di questo dispositivo con quelli del sito. Premi di nuovo “Aggiorna dal sito” entro 6 secondi per confermare.")}S.cf=0;autoLoad(true)}
const GHP="dispensa-smart-dati.json";let ghMute=false,ghT,ghBusy=false,ghAgain=false,ghSha=null;
const ghCfg=()=>{try{return JSON.parse(localStorage.getItem("gh"))}catch(e){return null}};
const ghOn=()=>{const c=ghCfg();return !!(c&&c.owner&&c.repo&&c.token)};
const ghTxt=()=>{const s=S.ghst;if(!ghOn())return "Non collegato.";if(!s)return "Collegato. In attesa della prima sincronizzazione…";return s.s==="ok"?"☁️ Sincronizzato alle "+new Date(s.t).toLocaleTimeString("it-IT",{hour:"2-digit",minute:"2-digit"}):"⚠️ "+s.m};
function ghSt(s,m){S.ghst={s,m,t:Date.now()};const e=$("ghs");if(e)e.textContent=ghTxt();const y=$("sy");if(y&&ghOn())y.textContent=s==="ok"?"☁️ GitHub sincronizzato":"⚠️ GitHub: errore"}
const ghApi=(method,url,body)=>{const c=ghCfg();if(c.branch&&url.startsWith("/contents/")){if(method==="GET")url+=(url.includes("?")?"&":"?")+"ref="+encodeURIComponent(c.branch);else if(body)body={...body,branch:c.branch}}return fetch("https://api.github.com/repos/"+c.owner+"/"+c.repo+url,{method,headers:{authorization:"Bearer "+c.token,accept:"application/vnd.github+json","content-type":"application/json"},body:body?JSON.stringify(body):undefined,cache:"no-store"})};
const b64e=s=>{const b=new TextEncoder().encode(s);let o="";for(let i=0;i<b.length;i+=8192)o+=String.fromCharCode.apply(null,b.subarray(i,i+8192));return btoa(o)};
const b64d=s=>{const o=atob(s.replace(/\s/g,"")),u=new Uint8Array(o.length);for(let i=0;i<o.length;i++)u[i]=o.charCodeAt(i);return new TextDecoder().decode(u)};
async function ghGet(){const r=await ghApi("GET","/contents/"+GHP);
 if(r.status===404){const rr=await ghApi("GET","");if(!rr.ok)throw new Error("Repository non trovato: controlla utente, nome del repository e permessi del token.");return null}
 if(r.status===401||r.status===403)throw new Error("Token non valido o senza permessi (serve Contents: Read and write su questo repository).");
 if(!r.ok)throw new Error("GitHub ha risposto "+r.status+".");
 const m=await r.json();let txt;
 if(m.content&&m.encoding==="base64")txt=b64d(m.content);
 else{const br=await ghApi("GET","/git/blobs/"+m.sha);if(!br.ok)throw new Error("Lettura del file non riuscita ("+br.status+").");txt=b64d((await br.json()).content)}
 return{d:JSON.parse(txt),sha:m.sha}}
function ghSched(){clearTimeout(ghT);ghT=setTimeout(()=>ghPush(),3000)}
async function ghPush(retry){if(!ghOn())return;if(ghBusy){ghAgain=true;return}ghBusy=true;
 try{const lm=+localStorage.getItem("lm")||Date.now();
  const body={message:"Dispensa Smart: aggiornamento dati",content:b64e(JSON.stringify({...bkData(),saved:new Date(lm).toISOString()}))};
  if(ghSha)body.sha=ghSha;
  const r=await ghApi("PUT","/contents/"+GHP,body);
  if(r.ok){ghSha=(await r.json()).content.sha;ghSt("ok");ghBackup()}
  else if((r.status===409||r.status===422)&&!retry){const g=await ghGet();ghSha=g?g.sha:null;if(g){ghMute=true;try{bkApply(g.d,false)}finally{ghMute=false}}ghBusy=false;return ghPush(1)}
  else if(r.status===401||r.status===403)throw new Error("Il token non ha il permesso di scrittura (Contents: Read and write).");
  else throw new Error("Salvataggio su GitHub non riuscito ("+r.status+").");
 }catch(e){ghSt("err",e.message)}
 ghBusy=false;if(ghAgain){ghAgain=false;ghSched()}}
async function ghPull(manual){if(!ghOn()||ghBusy)return;
 try{const g=await ghGet(),has=S.items.length||S.mine.length;
  if(!g){if(has)await ghPush();else if(manual)toast("Sul repository non c’è ancora nessun file dati.");ghSt("ok");return}
  ghSha=g.sha;const rs=Date.parse(g.d.saved)||0,lm=+localStorage.getItem("lm")||0,synced=localStorage.getItem("ghsynced");
  if(!has||(synced&&rs>lm)){ghMute=true;try{bkApply(g.d,true)}finally{ghMute=false}localStorage.setItem("lm",rs);localStorage.setItem("ghsynced","1");ghSt("ok")}
  else if(!synced){ghMute=true;try{bkApply(g.d,false)}finally{ghMute=false}localStorage.setItem("ghsynced","1");localStorage.setItem("lm",Date.now());await ghPush()}
  else if(lm>rs)await ghPush();
  else ghSt("ok");
 }catch(e){ghSt("err",e.message)}}
function ghInit(){if(document.addEventListener&&!window.__ghv){window.__ghv=1;document.addEventListener("visibilitychange",()=>{if(!document.hidden)ghPull()})}return ghPull()}
function ghSave(){const c=x=>($(x).value||"").trim().replace(/[\s\/]/g,"");
 const cfg={owner:c("gho"),repo:c("ghr"),token:($("ght").value||"").trim()},br=($("ghb").value||"").trim();if(br){if(/\s|\.\.|[~^:?*\[\\]/.test(br))return toast("Il nome del branch non può contenere spazi né caratteri speciali: controlla il nome esatto su GitHub (per esempio testing-DB).");cfg.branch=br}
 if(!cfg.owner||!cfg.repo||!cfg.token)return toast("Compila utente, repository e token.");
 localStorage.setItem("gh",JSON.stringify(cfg));localStorage.removeItem("ghsynced");ghSha=null;S.ghst=null;toast("Collegamento in corso…");ghInit()}
function ghOff(){localStorage.removeItem("gh");localStorage.removeItem("ghsynced");ghSha=null;S.ghst=null;render();toast("Sincronizzazione GitHub disattivata. I dati restano su questo dispositivo.")}
function ghCard(){const c=ghCfg()||{};return `<div class="card"><b>☁️ Sincronizzazione automatica con GitHub</b><div class="mu">Dati, ricette e foto vengono salvati da soli nel file dispensa-smart-dati.json del tuo repository e riletti quando apri l’app, su telefono e computer. Il token resta solo in questo browser.</div><input id="gho" placeholder="Utente GitHub (es. mario-rossi)" value="${esc(c.owner||"")}" style="margin-top:8px"><input id="ghr" placeholder="Nome del repository (es. dispensa-dati)" value="${esc(c.repo||"")}" style="margin-top:6px"><input id="ght" type="password" placeholder="Token personale (github_pat_…)" value="${esc(c.token||"")}" style="margin-top:6px"><input id="ghb" placeholder="Branch (facoltativo, vuoto = quello principale)" value="${esc(c.branch||"")}" style="margin-top:6px"><div class="mu">Se scrivi un branch, dati e copie di sicurezza vengono salvati solo lì e il branch principale non viene toccato. Il branch deve esistere già.</div><div class="row" style="margin-top:8px;gap:6px;flex-wrap:wrap"><button class="btn" onclick="ghSave()">Collega</button><button class="btn g" onclick="ghPull(true)">Sincronizza ora</button><button class="btn g" onclick="ghOff()">Scollega</button></div><div class="mu" id="ghs" style="margin-top:8px">${esc(ghTxt())}</div><details style="margin-top:8px"><summary class="mu" style="cursor:pointer">Come creare il token</summary><div class="mu">1. Su github.com: foto profilo → Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token.<br>2. Repository access: “Only select repositories” e scegli il repository dei dati.<br>3. Repository permissions → Contents: Read and write.<br>4. Genera il token, copialo e incollalo qui sopra.</div></details></div>`}
const snapKeys=()=>{try{const a=[];for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith("snap_"))a.push(k)}return a.sort()}catch(e){return[]}};
function snapLocal(force,tag){try{const day=today(),key="snap_"+day+(tag||"");if(!force&&localStorage.getItem(key))return false;const d=bkData();delete d.ph;localStorage.setItem(key,JSON.stringify(d));snapKeys().slice(0,-7).forEach(k=>localStorage.removeItem(k));return true}catch(e){return false}}
async function ghBackup(force){if(!ghOn())return false;const day=today();if(!force&&lsg("ghbk","")===day)return true;
 try{const d=bkData();delete d.ph;const path="/contents/backup/dispensa-"+day+".json";let sha=null;const g0=await ghApi("GET",path);if(g0.ok)sha=(await g0.json()).sha;
  const body={message:"Dispensa Smart: copia di sicurezza del "+day,content:b64e(JSON.stringify(d))};if(sha)body.sha=sha;const r=await ghApi("PUT",path,body);
  if(r.ok){lss("ghbk",day);ghPrune();return true}}catch(e){}return false}
async function ghBackups(){try{const r=await ghApi("GET","/contents/backup");if(!r.ok)return[];const l=await r.json();return(Array.isArray(l)?l:[]).filter(f=>/dispensa-\d{4}-\d{2}-\d{2}\.json$/.test(f.name)).sort((a,b)=>a.name<b.name?1:-1)}catch(e){return[]}}
async function ghPrune(){try{const l=await ghBackups();for(const f of l.slice(14))await ghApi("DELETE","/contents/backup/"+f.name,{message:"Rimuovo una vecchia copia di sicurezza",sha:f.sha})}catch(e){}}
function bkRestore(d){if(!d||!(d.items||d.mine))return toast("Copia non valida.");snapLocal(true,"~pre");const ph=S.ph;bkApply(d,true);S.ph={...ph,...S.ph};W("ph",S.ph);save();render();toast("✅ Copia ripristinata. Lo stato di prima è salvato come “prima del ripristino”.")}
function bkAsk(id){if(S.bkc!==id){S.bkc=id;setTimeout(()=>{S.bkc=null},6000);toast("Ripristinare questa copia? I dati attuali verranno sostituiti (ne tengo una copia). Premi di nuovo entro 6 secondi.");return false}S.bkc=null;return true}
function bkRestoreLocal(k){if(!bkAsk(k))return;try{bkRestore(JSON.parse(localStorage.getItem(k)))}catch(e){toast("Copia non leggibile.")}}
async function bkRestoreGh(name){if(!bkAsk(name))return;toast("Scarico la copia…");try{const r=await ghApi("GET","/contents/backup/"+name);if(!r.ok)throw 0;const m=await r.json();let t;if(m.content&&m.encoding==="base64")t=b64d(m.content);else{const br=await ghApi("GET","/git/blobs/"+m.sha);t=b64d((await br.json()).content)}bkRestore(JSON.parse(t))}catch(e){toast("Non sono riuscito a scaricare la copia.")}}
async function bkList(){S.bkl=await ghBackups();if(!S.bkl.length)toast("Nessuna copia trovata su GitHub (la prima viene creata al prossimo salvataggio).");render()}
async function bkNow(){snapLocal(true);let ok=true;if(ghOn()){toast("Salvo la copia…");ok=await ghBackup(true);if(S.bkl)S.bkl=await ghBackups()}render();toast(ok?"💾 Copia di sicurezza creata.":"Copia salvata solo su questo dispositivo: GitHub non ha risposto.")}
const bkLab=k=>{const m=k.match(/snap_(\d{4})-(\d{2})-(\d{2})(~pre)?/);return m?m[3]+"/"+m[2]+"/"+m[1]+(m[4]?" (prima del ripristino)":""):k};
function bkCard(){const sn=snapKeys().reverse(),gh=S.bkl||[];
 return `<div class="card"><b>🛟 Copie di sicurezza automatiche</b><div class="mu">Ogni giorno l’app salva una copia dei dati${ghOn()?" anche nel tuo repository GitHub (cartella backup, ultime 14)":""}; sul dispositivo ne restano le ultime 7, senza foto. Se qualcosa si rovina puoi ripristinarla da qui.</div>
 <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:8px"><button class="btn g" onclick="bkNow()">💾 Crea copia ora</button>${ghOn()?`<button class="btn g" onclick="bkList()">☁️ Mostra copie su GitHub</button>`:""}</div>
 ${sn.length?`<div class="mu" style="margin-top:10px">Su questo dispositivo</div>${sn.map(k=>`<div class="row" style="margin-top:6px"><span>${bkLab(k)}</span><button class="btn g" ${BS} onclick="bkRestoreLocal('${k}')">${S.bkc===k?"Conferma":"Ripristina"}</button></div>`).join("")}`:`<div class="mu" style="margin-top:10px">Nessuna copia su questo dispositivo: la prima viene creata alla prossima apertura.</div>`}
 ${gh.length?`<div class="mu" style="margin-top:10px">Su GitHub</div>${gh.map(f=>`<div class="row" style="margin-top:6px"><span>${f.name.replace(/dispensa-(\d{4})-(\d{2})-(\d{2})\.json/,"$3/$2/$1")}</span><button class="btn g" ${BS} onclick="bkRestoreGh('${f.name}')">${S.bkc===f.name?"Conferma":"Ripristina"}</button></div>`).join("")}`:""}</div>`}
function vBackup(){return `<div class="card"><b>💾 Backup e importazione dati</b><div class="mu">“Copia i miei dati” mette tutto in questo riquadro. Per importare, incolla qui un backup e premi Importa: i dati già presenti non vengono cancellati.</div><textarea id="bk" rows="4" placeholder="Incolla qui il backup…" style="width:100%;margin-top:8px;padding:10px;border:1px solid var(--bd);border-radius:22px;background:var(--card);color:var(--tx);font:inherit"></textarea><div class="row" style="margin-top:8px"><button class="btn g" onclick="bkCopy()">Copia i miei dati</button><button class="btn" onclick="bkImp()">Importa</button></div><div class="row" style="margin-top:8px;gap:6px;flex-wrap:wrap"><button class="btn g" onclick="bkFile()">⬇️ Salva file JSON</button><label class="btn g" style="cursor:pointer">📂 Carica file JSON<input type="file" accept=".json,application/json" hidden onchange="bkLoad(this)"></label><button class="btn g" onclick="syncSite()">🔄 Aggiorna dal sito</button></div><div class="mu" style="margin-top:8px">Il file <b>dispensa-smart-dati.json</b> contiene prodotti, ricette, lista, cronologia e foto. Se lo metti accanto all’HTML su un sito, puoi caricarlo con “Aggiorna dal sito”: non viene più caricato in automatico, così chi apre il sito non vede i tuoi dati.</div></div>`}
const bkData=()=>({app:"dispensa-smart",saved:new Date().toISOString(),items:S.items,mine:S.mine,shop:S.shop,hist:S.hist,lib:S.lib,ph:S.ph,geo:S.geo,plan:S.plan,coll:S.coll.map(c=>({...c,names:c.ids.map(i=>{const r=S.mine.find(m=>m.id===i);return r?r.title:""})})),cdel:S.cdel,fly:S.fly,pold:S.pold,theme:S.th});
function bkFile(){const t=JSON.stringify(bkData());const ta=$("bk");if(ta)ta.value=t.length<150000?t:"";
 try{const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([t],{type:"application/json"}));a.download="dispensa-smart-dati.json";document.body.appendChild(a);a.click();a.remove();
  toast(window.setKey?"⬇️ File dispensa-smart-dati.json salvato: lo trovi nella cartella Download.":"⬇️ Download avviato. Se il file non compare, qui il browser lo blocca: usa “Copia i miei dati”.")}catch(e){toast("Download non disponibile qui: usa “Copia i miei dati”.")}}
function bkLoad(inp){const f=inp.files[0];if(!f)return;const rd=new FileReader();rd.onload=()=>{let d;try{d=JSON.parse(rd.result)}catch(e){return toast("File JSON non valido.")}bkApply(d)};rd.readAsText(f)}
async function autoLoad(force){if(!force&&(S.items.length||S.mine.length))return;
 try{const r=await fetch("dispensa-smart-dati.json",{cache:"no-store"});if(!r.ok)throw 0;const d=await r.json();if(d&&(d.items||d.mine))bkApply(d,force);else if(force)toast("Il file sul sito è vuoto o non valido.")}catch(e){if(force)toast("Nessun file dispensa-smart-dati.json trovato sul sito (funziona solo dalla versione pubblicata online).")}}
function bkCopy(){const t=$("bk");t.value=JSON.stringify({items:S.items,mine:S.mine,shop:S.shop,hist:S.hist,lib:S.lib});try{t.select();navigator.clipboard.writeText(t.value)}catch(e){}toast("Dati inseriti nel riquadro: copiali da lì se non sono già negli appunti.")}
function bkImp(){let d;try{d=JSON.parse($("bk").value)}catch(e){return toast("Testo non valido: incolla il backup completo, senza modifiche.")}return bkApply(d)}
function bkApply(d,rep){if(rep&&(d.items||d.mine)){S.items=[];S.mine=[];S.shop=[];S.hist=[];S.lib={};S.ph={};S.plan=null;S.coll=[];S.fly=[];S.pold=[];S.cdel=[]}
 if(Array.isArray(d))d={items:d};
 const g=k=>{let v=d&&d[k];if(typeof v==="string"){try{v=JSON.parse(v)}catch(e){v=null}}return v};
 let ni=0,nm2=0,ns=0;
 const it=g("items");if(Array.isArray(it)){const ids=new Set(S.items.map(i=>i.id));it.forEach(i=>{if(i&&i.id&&i.name&&!ids.has(i.id)){S.items.push({id:String(i.id),name:String(i.name),cat:CATS.includes(i.cat)?i.cat:guess(String(i.name)),q:+i.q>0?+i.q:1,u:["g","ml","pz","cucchiai","cucchiaini"].includes(i.u)?i.u:"pz",exp:i.exp||"",loc:["dispensa","frigo","congelatore"].includes(i.loc)?i.loc:""});ni++}})}
 const mi=g("mine");if(Array.isArray(mi)){const ts=new Set(S.mine.map(m=>nm(m.title)));mi.forEach(r=>{if(r&&r.title&&Array.isArray(r.steps)&&Array.isArray(r.ingredients)&&!ts.has(nm(r.title))){S.mine.push({...r,id:r.id||"m"+Date.now()+nm2,src:r.src||"manual"});nm2++}})}
 const sh=g("shop");if(Array.isArray(sh)){const ids=new Set(S.shop.map(i=>i.id));sh.forEach(x=>{if(x&&x.id&&x.name&&!ids.has(x.id)){S.shop.push({id:String(x.id),name:String(x.name),amount:+x.amount||0,unit:x.unit||"",done:!!x.done,from:x.from||"",store:x.store||"",price:x.price||"",until:x.until||""});ns++}})}
 const hi=g("hist");if(Array.isArray(hi)){const ats=new Set(S.hist.map(h=>h.at));hi.forEach(h=>{if(h&&h.at&&h.r&&!ats.has(h.at))S.hist.push(h)});S.hist.sort((a,b)=>b.at-a.at)}
 const lb=g("lib");if(lb&&typeof lb==="object"&&!Array.isArray(lb))S.lib={...lb,...S.lib};
 const ph=g("ph");let np=0;if(ph&&typeof ph==="object"&&!Array.isArray(ph)){Object.keys(ph).forEach(t=>{if(!S.ph[t]){S.ph[t]=ph[t];np++;phPush(t)}});W("ph",S.ph)}
 const ge=g("geo");if(ge&&typeof ge==="object"&&!Array.isArray(ge)&&!S.geo.city){S.geo={city:ge.city||"",zone:ge.zone||"",stores:Array.isArray(ge.stores)?ge.stores:[]};W("geo",S.geo)}
 const pl=g("plan");if(pl&&pl.start&&pl.days&&(!S.plan||(rep&&pl.start>=S.plan.start)))S.plan=pl;
 const po=g("pold");if(Array.isArray(po)){const have=new Set(S.pold.map(x=>x.start));po.forEach(x=>{if(x&&x.start&&x.days&&!have.has(x.start)&&(!S.plan||S.plan.start!==x.start))S.pold.push(x)});S.pold.sort((a,b)=>b.start<a.start?-1:1);S.pold.length=Math.min(S.pold.length,8)}
 const th=g("theme");if(th&&typeof th==="object"&&(rep||!L("theme"))){S.th=th;W("theme",S.th);applyTheme()}
 const cd=g("cdel");if(Array.isArray(cd))cd.forEach(t=>{if(t&&t.id&&!S.cdel.some(x=>x.id===t.id&&x.u>=t.u))S.cdel=[...S.cdel.filter(x=>x.id!==t.id),{id:String(t.id),u:+t.u||0}].slice(-50)});
 const cl=g("coll");if(Array.isArray(cl)){const fixIds=c=>{const nms=Array.isArray(c.names)?c.names:[];return c.ids.map((i,k)=>{i=String(i);if(S.mine.some(m=>m.id===i))return i;const r=nms[k]&&S.mine.find(m=>nm(m.title)===nm(nms[k]));return r?r.id:i})};
  cl.forEach(c=>{if(!(c&&c.id&&c.name&&Array.isArray(c.ids)))return;const id=String(c.id),ids=[...new Set(fixIds(c))],u=+c.u||0;
   const tb=S.cdel.find(x=>x.id===id);if(tb&&tb.u>=u&&!rep)return;
   const ex=S.coll.find(x=>x.id===id);
   if(!ex)S.coll.push({id,name:String(c.name),ids,u});
   else if(u>(+ex.u||0)){ex.name=String(c.name);ex.ids=ids;ex.u=u}
   else if(u===(+ex.u||0))ids.forEach(i=>{if(!ex.ids.includes(i))ex.ids.push(i)})});
  S.coll=S.coll.filter(c=>{const tb=S.cdel.find(x=>x.id===c.id);return !(tb&&tb.u>(+c.u||0))})}
 const fl=g("fly");if(Array.isArray(fl)){const fi=new Set(S.fly.map(f=>f.id));fl.forEach(f=>{if(f&&f.id&&Array.isArray(f.offers)&&!fi.has(f.id))S.fly.push(f)});S.fly.sort((a,b)=>String(b.id).localeCompare(String(a.id)))}

 if(!(ni||nm2||ns||np)&&!hi&&!lb)return toast("Non ho trovato dati nuovi da importare.");
 save();render();toast(`✅ Importati: ${ni} prodotti, ${nm2} ricette, ${ns} voci della lista`)}
let col=null,last={},tm,warned=0,pend=false,wr=false;const K=["items","lib","hist","mine","shop","coll","cdel","fly","plan","pold"];
function push(){pend=true;clearTimeout(tm);tm=setTimeout(flush,500)}
async function flush(){pend=false;if(!col)return;wr=true;try{for(const k of K){const v=S[k],s=JSON.stringify(v);if(s===last[k])continue;try{await col.doc(k).set({v});last[k]=s}catch(e){err()}}}finally{wr=false}}
async function phPush(t){if(!col||!S.ph[t])return;try{await col.doc(hid(t)).set({t,d:S.ph[t]})}catch(e){err()}}
async function phDel(t){if(!col)return;try{await col.doc(hid(t)).delete()}catch(e){err()}}
async function sync(){
 try{
  const db=await claude.use("db"),us=await claude.use("user"),uid=us?await us.id():null;
  if(!db||!uid)return setSy("local");
  col=db.collection("data/users/"+uid);
  const A={items:S.items,lib:S.lib,hist:S.hist,mine:S.mine,shop:S.shop,ph:S.ph},first=!L("synced");
  const snap=await col.get();let ch=0;
  snap.docs.forEach(d=>{if(d.exists)ch|=ing(d.id,d.data())});
  if(first){
   const ids=new Set(S.items.map(i=>i.id));A.items.forEach(i=>ids.has(i.id)||S.items.push(i));
   const ats=new Set(S.hist.map(h=>h.at));A.hist.forEach(h=>ats.has(h.at)||S.hist.push(h));S.hist.sort((a,b)=>b.at-a.at);
   S.lib={...A.lib,...S.lib};S.ph={...A.ph,...S.ph};
   const mi=new Set(S.mine.map(m=>m.id));A.mine.forEach(m=>mi.has(m.id)||S.mine.push(m));const si=new Set(S.shop.map(m=>m.id));A.shop.forEach(m=>si.has(m.id)||S.shop.push(m));
   W("synced",1);save();for(const t in S.ph)await phPush(t);ch=1}
  cache();setSy("on");if(ch&&S.tab!=="add"&&S.tab!=="nuova")render();
  col.onSnapshot(s=>{if(s.metadata.hasPendingWrites)return;let c=0;
   s.docChanges().forEach(x=>{const d=x.doc;if(x.type==="removed"){const t=d.data()&&d.data().t;if(t&&S.ph[t]){delete S.ph[t];c=1}}else c|=ing(d.id,d.data())});
   if(c){cache();if(S.tab!=="add"&&S.tab!=="nuova")render()}},()=>setSy("local"));
 }catch(e){setSy("local")}
}
if(S.items.length||S.mine.length)snapLocal();applyTheme();try{matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>{if(((S.th||{}).mode||"auto")==="auto")applyTheme()})}catch(e){}
render();sync();(ghOn()?ghInit():0);

