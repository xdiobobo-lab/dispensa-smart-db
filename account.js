/* Dispensa Smart - account.js: registrazione, accesso e sincronizzazione online (Supabase) */
/* Si attiva solo se config.js contiene l'indirizzo e la chiave pubblica del progetto. */
function sbCfg(){const w=window.SB_CONFIG;if(w&&w.url&&w.key)return{url:String(w.url).trim().replace(/\/+$/,""),key:String(w.key).trim()};return null}
function sbSess(){try{const s=JSON.parse(localStorage.getItem("sbs"));return s&&s.at&&s.rt?s:null}catch(e){return null}}
function sbOn(){return !!(sbCfg()&&sbSess())}
function cloudOn(){return sbOn()||ghOn()}
let sbVer=null,sbT,sbBusy=false,sbAgain=false,sbRef=null,sbPulling=false,sbVis=false;
function sbStore(j){const u=j.user||{},old=sbSess()||{},s={at:j.access_token,rt:j.refresh_token,exp:j.expires_at||Math.floor(Date.now()/1000)+(+j.expires_in||3600),uid:u.id||old.uid,email:u.email||old.email};try{localStorage.setItem("sbs",JSON.stringify(s))}catch(e){}return s}
function sbClear(){localStorage.removeItem("sbs");localStorage.removeItem("sbsynced");sbVer=null;S.sbst=null}
function sbWipe(){["items","lib","hist","ph","mine","shop","plan","pold","geo","recs","coll","cdel","fly","ftx","lm","synced","ghsynced","sbsynced","ghbk","sbbk","fam","fbase"].forEach(k=>localStorage.removeItem(k));try{Object.keys(localStorage).filter(k=>k.startsWith("snap_")).forEach(k=>localStorage.removeItem(k))}catch(e){}}
function sbMsg(j,st){const c=(j&&(j.error_code||j.code))||"",m=String((j&&(j.msg||j.message||j.error_description||j.error))||"").toLowerCase();
 if(c==="invalid_credentials"||m.includes("invalid login"))return "Email o password non corretti.";
 if(c==="user_already_exists"||m.includes("already registered")||m.includes("already been registered"))return "Esiste già un account con questa email: accedi.";
 if(c==="weak_password"||m.includes("password should be")||m.includes("weak password"))return "Password troppo debole: usa almeno 8 caratteri, meglio con lettere e numeri.";
 if(c==="email_not_confirmed"||m.includes("not confirmed"))return "Devi prima confermare l’email: apri il messaggio che ti abbiamo inviato.";
 if(c==="over_email_send_rate_limit"||c==="over_request_rate_limit"||st===429)return "Troppe richieste: aspetta qualche minuto e riprova.";
 if(c==="signup_disabled"||m.includes("signups not allowed"))return "Le nuove registrazioni sono disattivate.";
 if(c==="validation_failed"||m.includes("valid email")||m.includes("unable to validate email"))return "Indirizzo email non valido.";
 if(c==="same_password"||m.includes("different from the old"))return "La nuova password deve essere diversa da quella vecchia.";
 return "Operazione non riuscita"+(st?" ("+st+")":"")+"."}
async function sbAuth(path,body,method,token){const c=sbCfg();let r;
 try{r=await fetch(c.url+"/auth/v1/"+path,{method:method||"POST",headers:{apikey:c.key,authorization:"Bearer "+(token||c.key),"content-type":"application/json"},body:JSON.stringify(body||{})})}catch(e){throw new Error("Non riesco a collegarmi: controlla la connessione.")}
 let j=null;try{j=await r.json()}catch(e){}if(!r.ok)throw new Error(sbMsg(j,r.status));return j}
async function sbToken(){const s=sbSess();if(!s)throw new Error("Non hai effettuato l’accesso.");if(s.exp-60>Date.now()/1000)return s.at;
 if(!sbRef)sbRef=(async()=>{try{const c=sbCfg(),r=await fetch(c.url+"/auth/v1/token?grant_type=refresh_token",{method:"POST",headers:{apikey:c.key,"content-type":"application/json"},body:JSON.stringify({refresh_token:s.rt})});
  if(r.status>=400&&r.status<500){sbClear();S.acct={mode:"login",err:"La sessione è scaduta: accedi di nuovo."};render();throw new Error("Sessione scaduta: accedi di nuovo.")}
  if(!r.ok)throw new Error("Il servizio non risponde ("+r.status+").");
  return sbStore(await r.json()).at}finally{sbRef=null}})();
 return sbRef}
async function sbRest(path,opt){const c=sbCfg(),t=await sbToken();return fetch(c.url+"/rest/v1/"+path,{...(opt||{}),headers:{apikey:c.key,authorization:"Bearer "+t,"content-type":"application/json",...((opt&&opt.headers)||{})},cache:"no-store"})}
function sbBad(r){if(r.status===401||r.status===403)return "Accesso non autorizzato: esci e accedi di nuovo.";if(r.status===404)return "Il database online non è pronto: manca lo script SQL (vedi le istruzioni).";return "Il servizio ha risposto "+r.status+"."}
/* ---------- stato e sincronizzazione dei dati ---------- */
const sbTxt=()=>{const s=S.sbst;if(!s)return "In attesa della prima sincronizzazione…";return s.s==="ok"?"☁️ Sincronizzato alle "+new Date(s.t).toLocaleTimeString("it-IT",{hour:"2-digit",minute:"2-digit"}):"⚠️ "+s.m};
function sbSt(s,m){S.sbst={s,m,t:Date.now()};const e=$("sbs");if(e)e.textContent=sbTxt();const y=$("sy");if(y&&sbOn())y.textContent=s==="ok"?"☁️ Account sincronizzato":"⚠️ Account: errore"}
async function sbGet(){const r=await sbRest("dispensa_dati?select=data,updated_at&limit=1");if(!r.ok)throw new Error(sbBad(r));const a=await r.json();return a.length?{d:a[0].data,ver:a[0].updated_at}:null}
function sbSched(){clearTimeout(sbT);sbT=setTimeout(()=>sbPush(),3000);famSched()}
async function sbPush(retry){if(!sbOn())return;if(sbBusy){sbAgain=true;return}sbBusy=true;
 try{const s=sbSess(),lm=+localStorage.getItem("lm")||Date.now(),body={data:{...sbData(),saved:new Date(lm).toISOString()},updated_at:new Date().toISOString()};let r,conflict=false;
  if(sbVer){r=await sbRest("dispensa_dati?user_id=eq."+s.uid+"&updated_at=eq."+encodeURIComponent(sbVer),{method:"PATCH",headers:{Prefer:"return=representation"},body:JSON.stringify(body)});
   if(r.ok){const a=await r.json();if(a.length)sbVer=a[0].updated_at;else conflict=true}}
  else{r=await sbRest("dispensa_dati",{method:"POST",headers:{Prefer:"return=representation"},body:JSON.stringify({user_id:s.uid,...body})});
   if(r.status===409)conflict=true;else if(r.ok){const a=await r.json();sbVer=a[0]?a[0].updated_at:body.updated_at}}
  if(conflict){if(retry)throw new Error("I dati online sono cambiati da un altro dispositivo: riprova tra poco.");const g=await sbGet();sbVer=g?g.ver:null;if(g){sbApply(g.d,false)}sbBusy=false;return sbPush(1)}
  if(!r.ok)throw new Error(sbBad(r));
  sbSt("ok");sbBackup()
 }catch(e){sbSt("err",e.message)}
 sbBusy=false;if(sbAgain){sbAgain=false;sbSched()}}
async function sbPull(manual){if(!sbOn()||sbPulling)return;sbPulling=true;
 try{const g=await sbGet(),has=S.items.length||S.mine.length;
  if(!g){sbPulling=false;if(has)await sbPush();else if(manual)toast("Account collegato: non c’è ancora nessun dato online.");sbSt("ok");return}
  sbVer=g.ver;const rs=Date.parse(g.d&&g.d.saved)||0,lm=+localStorage.getItem("lm")||0,synced=localStorage.getItem("sbsynced");
  if(!has||(synced&&rs>lm)){sbApply(g.d,true);localStorage.setItem("lm",rs);localStorage.setItem("sbsynced","1");sbSt("ok");render();if(manual)toast("✅ Dati aggiornati dall’account.")}
  else if(!synced){sbApply(g.d,false);localStorage.setItem("sbsynced","1");localStorage.setItem("lm",Date.now());sbPulling=false;await sbPush();render()}
  else if(lm>rs){sbPulling=false;await sbPush();if(manual)toast("✅ Dati salvati online.")}
  else{sbSt("ok");if(manual)toast("Tutto già aggiornato.")}
 }catch(e){sbSt("err",e.message);if(manual)toast("⚠️ "+esc(e.message))}
 sbPulling=false}
function sbInit(){if(!sbVis&&document.addEventListener){sbVis=true;document.addEventListener("visibilitychange",()=>{if(!document.hidden&&sbOn()){sbPull();famSync()}})}return sbPull().then(()=>famInit())}
/* ---------- copie di sicurezza online ---------- */
async function sbBackup(force){if(!sbOn())return false;const day=today();if(!force&&lsg("sbbk","")===day)return true;
 try{const s=sbSess(),d=bkData();delete d.ph;const r=await sbRest("dispensa_copie",{method:"POST",headers:{Prefer:"resolution=merge-duplicates,return=minimal"},body:JSON.stringify({user_id:s.uid,giorno:day,data:d})});
  if(!r.ok)return false;lss("sbbk",day);sbPrune();return true}catch(e){return false}}
async function sbBackups(){try{const r=await sbRest("dispensa_copie?select=giorno&order=giorno.desc&limit=14");if(!r.ok)return[];return(await r.json()).map(x=>({name:"dispensa-"+x.giorno+".json"}))}catch(e){return[]}}
async function sbBackupGet(name){const day=(String(name).match(/(\d{4}-\d{2}-\d{2})/)||[])[1];if(!day)throw new Error("Copia non valida.");const r=await sbRest("dispensa_copie?select=data&giorno=eq."+day+"&limit=1");if(!r.ok)throw new Error(sbBad(r));const a=await r.json();if(!a.length)throw new Error("Copia non trovata.");return a[0].data}
async function sbPrune(){try{const r=await sbRest("dispensa_copie?select=giorno&order=giorno.desc&limit=15");if(!r.ok)return;const a=await r.json();if(a.length>14)await sbRest("dispensa_copie?giorno=lt."+a[13].giorno,{method:"DELETE"})}catch(e){}}
/* ---------- accesso: azioni ---------- */
const acctBase=()=>location.origin+location.pathname;
const acctNeeded=()=>!!sbCfg()&&!sbSess()&&!localStorage.getItem("sbskip");
function acctSet(o){const e=$("ae");S.acct={...(S.acct||{mode:"login"}),...(e?{email:e.value}:{}),...o};S.acctK=null;render()}
function acctOpen(mode){localStorage.removeItem("sbskip");S.acct={mode:mode||"login"};S.acctK=null;render()}
function acctSkip(){try{localStorage.setItem("sbskip","1")}catch(e){}S.acct=null;S.acctK=null;render()}
function acctShow(on){["ap","ap2"].forEach(i=>{const e=$(i);if(e)e.type=on?"text":"password"})}
async function acctGo(){const a=S.acct||{},m=a.mode,email=(($("ae")||{}).value||"").trim().toLowerCase(),pw=($("ap")||{}).value||"",pw2=($("ap2")||{}).value;
 const bad=x=>acctSet({busy:false,err:x,email:email||a.email,msg:""});
 if(m!=="newpw"&&!/^\S+@\S+\.\S+$/.test(email))return bad("Scrivi un indirizzo email valido.");
 if(m!=="reset"&&!pw)return bad("Scrivi la password.");
 if((m==="signup"||m==="newpw")&&pw.length<8)return bad("La password deve avere almeno 8 caratteri.");
 if((m==="signup"||m==="newpw")&&pw!==pw2)return bad("Le due password non coincidono.");
 acctSet({busy:true,err:"",msg:"",email});
 try{
  if(m==="login"){sbAfterLogin(await sbAuth("token?grant_type=password",{email,password:pw}))}
  else if(m==="signup"){const j=await sbAuth("signup?redirect_to="+encodeURIComponent(acctBase()),{email,password:pw});
   if(j&&j.access_token)sbAfterLogin(j);
   else if(j&&j.identities&&j.identities.length===0)acctSet({busy:false,mode:"login",email,err:"Esiste già un account con questa email: accedi."});
   else acctSet({busy:false,mode:"login",email,msg:"Ti abbiamo mandato un’email a "+email+". Aprila e conferma l’indirizzo, poi torna qui e accedi."})}
  else if(m==="reset"){await sbAuth("recover?redirect_to="+encodeURIComponent(acctBase()),{email});acctSet({busy:false,mode:"login",email,msg:"Se l’email è registrata, riceverai un messaggio con il link per scegliere una nuova password."})}
  else if(m==="newpw"){await sbAuth("user",{password:pw},"PUT",await sbToken());toast("🔑 Password aggiornata.");sbPostLogin(true)}
 }catch(e){acctSet({busy:false,err:e.message,email})}}
function sbAfterLogin(j){sbStore(j);sbPostLogin()}
function sbPostLogin(quiet){const s=sbSess();if(!s)return;const prev=localStorage.getItem("sbuid");
 if(prev&&prev!==s.uid){sbWipe();try{localStorage.setItem("sbuid",s.uid)}catch(e){}location.reload();return}
 try{localStorage.setItem("sbuid",s.uid);localStorage.removeItem("sbskip")}catch(e){}
 S.acct=null;S.acctK=null;S.sbst=null;sbVer=null;render();if(!quiet)toast("👋 Accesso effettuato: "+esc(s.email||""));sbInit()}
async function acctOut(wipe){const s=sbSess();if(!s)return;
 if(wipe&&!S.acctWipe){S.acctWipe=true;setTimeout(()=>{S.acctWipe=false;if(S.thp)render()},6000);render();return toast("Premi di nuovo entro 6 secondi: i dati verranno cancellati da questo dispositivo (restano online nel tuo account).")}
 S.acctWipe=false;
 if(wipe){toast("Salvo i dati online prima di cancellarli…");await famSync();await sbPush();if(!S.sbst||S.sbst.s!=="ok")return toast("⚠️ Non riesco a salvare i dati online, quindi non li cancello. Controlla la connessione e riprova.")}
 try{const c=sbCfg();fetch(c.url+"/auth/v1/logout",{method:"POST",headers:{apikey:c.key,authorization:"Bearer "+s.at}}).catch(()=>{})}catch(e){}
 clearTimeout(sbT);sbClear();
 if(wipe){sbWipe();localStorage.removeItem("sbuid");location.reload();return}
 S.thp=false;S.acct={mode:"login"};S.acctK=null;render()}
/* ---------- famiglia: dispensa, lista e piano condivisi ---------- */
const FSH=["items","shop","plan"];let famBusy=false,famAgain=false,famT,famMute=false;
const famGet=()=>{try{const f=JSON.parse(localStorage.getItem("fam"));return f&&f.id?f:null}catch(e){return null}};
const famOn=()=>sbOn()&&!!famGet();
const famJs=x=>JSON.stringify(x===undefined?null:x);
function sbData(){const d=bkData();if(famOn())FSH.forEach(k=>delete d[k]);return d}
function sbApply(d,rep){ghMute=true;try{if(famOn()){const keep={items:S.items,shop:S.shop,plan:S.plan};d={...d};FSH.forEach(k=>delete d[k]);bkApply(d,rep);S.items=keep.items;S.shop=keep.shop;S.plan=keep.plan}else bkApply(d,rep)}finally{ghMute=false}}
function famMergeArr(b,l,r){const mp=a=>{const m=new Map();(Array.isArray(a)?a:[]).forEach(x=>{if(x&&x.id!=null)m.set(String(x.id),x)});return m};
 const B=mp(b),Lm=mp(l),R=mp(r),out=[],seen=new Set();
 [...(Array.isArray(l)?l:[]),...(Array.isArray(r)?r:[])].forEach(x=>{if(!x||x.id==null)return;const id=String(x.id);if(seen.has(id))return;seen.add(id);
  const lo=Lm.get(id),ro=R.get(id),bo=B.get(id);
  if(lo&&ro)out.push(bo&&famJs(lo)===famJs(bo)?ro:lo);
  else if(lo){if(!bo||famJs(lo)!==famJs(bo))out.push(lo)}
  else if(ro){if(!bo||famJs(ro)!==famJs(bo))out.push(ro)}});
 return out}
function famMergePlan(b,l,r){if(!l)return r===undefined?null:r;if(b!==undefined&&famJs(l)===famJs(b))return r===undefined?l:r;return l}
function famSt(s,m){S.fst={s,m,t:Date.now()};const e=$("fst");if(e)e.textContent=famTxt()}
const famTxt=()=>{const s=S.fst;if(!s)return "In attesa della prima sincronizzazione…";return s.s==="ok"?"👨‍👩‍👧 Condivisa e aggiornata alle "+new Date(s.t).toLocaleTimeString("it-IT",{hour:"2-digit",minute:"2-digit"}):"⚠️ "+s.m};
function famSched(){if(famMute||!famOn())return;clearTimeout(famT);famT=setTimeout(()=>famSync(),3500)}
async function famSync(manual){if(!famOn())return;if(famBusy){famAgain=true;return}famBusy=true;
 try{let done=false;
  for(let n=0;n<4&&!done;n++){const f=famGet();if(!f)break;
   const r=await sbRest("famiglia_dati?famiglia_id=eq."+f.id+"&select=data,updated_at");if(!r.ok)throw new Error(sbBad(r));
   const a=await r.json(),rem=a[0]||null,rd=(rem&&rem.data)||{};let base={};try{base=JSON.parse(localStorage.getItem("fbase"))||{}}catch(e){}
   const m={items:famMergeArr(base.items,S.items,rd.items),shop:famMergeArr(base.shop,S.shop,rd.shop),plan:famMergePlan(base.plan,S.plan,rd.plan)};
   if(famJs(m)!==famJs({items:S.items,shop:S.shop,plan:S.plan})){famMute=true;ghMute=true;try{S.items=m.items;S.shop=m.shop;S.plan=m.plan;save()}finally{ghMute=false;famMute=false}render()}
   if(famJs(m.items)===famJs(rd.items||[])&&famJs(m.shop)===famJs(rd.shop||[])&&famJs(m.plan)===famJs(rd.plan)){localStorage.setItem("fbase",JSON.stringify(m));done=true;break}
   const body={data:{...m,saved:new Date().toISOString()},updated_at:new Date().toISOString()};let w;
   if(rem){w=await sbRest("famiglia_dati?famiglia_id=eq."+f.id+"&updated_at=eq."+encodeURIComponent(rem.updated_at),{method:"PATCH",headers:{Prefer:"return=representation"},body:JSON.stringify(body)});
    if(w.ok){const b2=await w.json();if(b2.length)done=true}else throw new Error(sbBad(w))}
   else{w=await sbRest("famiglia_dati",{method:"POST",headers:{Prefer:"return=representation"},body:JSON.stringify({famiglia_id:f.id,...body})});
    if(w.status===409)continue;if(!w.ok)throw new Error(sbBad(w));done=true}
   if(done)localStorage.setItem("fbase",JSON.stringify(m))}
  if(!done)throw new Error("La lista condivisa è cambiata nel frattempo: riprova tra poco.");
  famSt("ok");if(manual)toast("✅ Famiglia aggiornata.")
 }catch(e){famSt("err",e.message);if(manual)toast("⚠️ "+esc(e.message))}
 famBusy=false;if(famAgain){famAgain=false;famSched()}}
async function famRpc(name,args){const r=await sbRest("rpc/"+name,{method:"POST",body:JSON.stringify(args||{})});let j=null;try{j=await r.json()}catch(e){}
 if(!r.ok){const m=(j&&(j.message||j.msg))||"";if(r.status===404||/Could not find the function/i.test(m))throw new Error("La condivisione in famiglia non è ancora attiva: esegui di nuovo supabase-setup.sql in Supabase.");throw new Error(m||sbBad(r))}
 return j}
async function famInfo(){if(!sbOn())return;try{const j=await famRpc("info_famiglia"),had=famGet();
  if(j&&j.id){localStorage.setItem("fam",JSON.stringify(j));if(!had){S.fst=null}}
  else if(had){localStorage.removeItem("fam");localStorage.removeItem("fbase");toast("Non fai più parte della famiglia: i dati restano su questo dispositivo.")}
  if(S.thp)render()}catch(e){if(famGet())famSt("err",e.message)}}
async function famInit(){if(!sbOn())return;await famInfo();if(famOn())return famSync()}
function famBusyUi(on,err){S.fbz=on;S.ferr=err||"";if(S.thp)render()}
async function famCreate(){if(S.fbz)return;const n=(($("fn")||{}).value||"").trim().slice(0,40)||"La mia famiglia";famBusyUi(true);
 try{const j=await famRpc("crea_famiglia",{p_nome:n});localStorage.setItem("fam",JSON.stringify(j));localStorage.removeItem("fbase");S.fst=null;famBusyUi(false);toast("👨‍👩‍👧 Famiglia creata. Dai il codice alle persone che vuoi invitare.");await famSync()}
 catch(e){famBusyUi(false,e.message)}}
async function famJoin(){if(S.fbz)return;const c=(($("fc")||{}).value||"").trim();if(!c)return famBusyUi(false,"Scrivi il codice che ti hanno dato.");famBusyUi(true);
 try{const j=await famRpc("entra_famiglia",{p_codice:c});localStorage.setItem("fam",JSON.stringify(j));localStorage.removeItem("fbase");S.fst=null;famBusyUi(false);toast("👨‍👩‍👧 Sei entrato nella famiglia.");await famSync()}
 catch(e){famBusyUi(false,e.message)}}
async function famLeave(){if(S.fbz)return;if(!S.famQ){S.famQ=true;setTimeout(()=>{S.famQ=false;if(S.thp)render()},6000);if(S.thp)render();return toast("Premi di nuovo entro 6 secondi per uscire dalla famiglia.")}
 S.famQ=false;famBusyUi(true);
 try{await famSync();await famRpc("esci_famiglia");localStorage.removeItem("fam");localStorage.removeItem("fbase");S.fst=null;famBusyUi(false);toast("Sei uscito dalla famiglia: i dati restano su questo dispositivo.");sbSched()}
 catch(e){famBusyUi(false,e.message)}}
function famCopy(){const f=famGet();if(!f)return;const t=f.codice;try{navigator.clipboard.writeText(t).then(()=>toast("📋 Codice copiato: "+t),()=>toast("Codice: "+t))}catch(e){toast("Codice: "+t)}}
function vFamiglia(){const f=famGet(),err=S.ferr?`<div class="al" style="margin-top:8px">${esc(S.ferr)}</div>`:"";
 if(f)return `<div class="card"><b>👨‍👩‍👧 ${esc(f.nome||"Famiglia")}</b><div class="mu" style="margin-top:4px">Dispensa, lista della spesa e piano della settimana sono condivisi con ${f.n>1?"le altre "+(f.n-1)+" persone":"chi entrerà"}. Le ricette e il resto restano tuoi.</div><div style="margin-top:8px">Codice invito: <b style="letter-spacing:.08em;font-size:18px">${esc(f.codice||"")}</b></div><div class="mu" id="fst" style="margin-top:4px">${esc(famTxt())}</div><div class="row" style="gap:8px;flex-wrap:wrap;justify-content:flex-start;margin-top:10px"><button class="btn" onclick="famCopy()">📋 Copia il codice</button><button class="btn g" onclick="famSync(true)">🔄 Aggiorna</button><button class="btn g" ${S.fbz?"disabled":""} onclick="famLeave()">${S.famQ?"Conferma: esci dalla famiglia":"Esci dalla famiglia"}</button></div>${err}</div>`;
 return `<div class="card"><b>👨‍👩‍👧 Famiglia</b><div class="mu" style="margin-top:4px">Condividi dispensa, lista della spesa e piano con chi vive con te: ognuno ha il proprio account e vede gli stessi dati. I dati che hai già su questo dispositivo vengono uniti a quelli della famiglia.</div><div style="margin-top:10px"><input id="fn" placeholder="Nome della famiglia (facoltativo)" maxlength="40"><button class="btn" style="margin-top:6px" ${S.fbz?"disabled":""} onclick="famCreate()">Crea una famiglia</button></div><div style="margin-top:12px"><input id="fc" placeholder="Hai un codice invito? Scrivilo qui" autocapitalize="characters" maxlength="14"><button class="btn g" style="margin-top:6px" ${S.fbz?"disabled":""} onclick="famJoin()">Entra con il codice</button></div>${err}</div>`}
/* ---------- schermate ---------- */
function vAccount(){if(!sbCfg())return"";const s=sbSess();
 if(!s)return `<div class="card"><b>👤 Account</b><div class="mu" style="margin-top:4px">Non hai effettuato l’accesso: i dati restano solo su questo dispositivo.</div><button class="btn" style="margin-top:10px" onclick="S.thp=false;acctOpen('login')">Accedi o crea un account</button></div>`;
 return vFamiglia()+`<div class="card"><b>👤 Il tuo account</b><div style="margin-top:4px;word-break:break-all">${esc(s.email||"")}</div><div class="mu" id="sbs" style="margin-top:4px">${esc(sbTxt())}</div><div class="row" style="gap:8px;flex-wrap:wrap;justify-content:flex-start;margin-top:10px"><button class="btn" onclick="sbPull(true)">🔄 Sincronizza ora</button><button class="btn g" onclick="acctOut(false)">Esci</button><button class="btn g" onclick="S.thp=false;acctOpen('newpw')">Cambia password</button></div><button class="btn g" style="margin-top:8px" onclick="acctOut(true)">${S.acctWipe?"Conferma: cancella i dati da questo dispositivo":"Esci e cancella i dati da questo dispositivo"}</button><div class="mu" style="margin-top:8px">Con “Esci” i dati restano su questo dispositivo e online. Con la cancellazione restano solo online: utile su un telefono che non è tuo.</div></div>`}
function drawAccount(){let p=$("acct");if(!p){p=document.createElement("div");p.id="acct";document.body.appendChild(p)}
 const hide=()=>{p.style.display="none";p.innerHTML="";S.acctK=null};
 if(!sbCfg())return hide();
 let a=S.acct;if(!a&&acctNeeded())a=S.acct={mode:"login"};
 if(!a||!a.mode)return hide();
 const key=JSON.stringify([a.mode,a.msg||"",a.err||"",a.busy?1:0,a.email||""]);if(S.acctK===key&&p.style.display!=="none")return;S.acctK=key;
 const m=a.mode,pwf=m!=="reset",two=m==="signup"||m==="newpw",lg=acctNeeded()||!sbSess(),
  sub={login:"Accedi per ritrovare la tua dispensa su ogni dispositivo.",signup:"Crea un account gratuito: la dispensa sarà tua e la ritroverai su telefono e computer.",reset:"Scrivi l’email dell’account: ti mandiamo un link per scegliere una nuova password.",newpw:"Scegli una nuova password per il tuo account."}[m],
  btn={login:"Accedi",signup:"Crea account",reset:"Invia il link",newpw:"Salva la nuova password"}[m],kd='onkeydown="if(event.key===\'Enter\')acctGo()"';
 p.style.cssText="position:fixed;inset:0;z-index:30;background:var(--bg);color:var(--tx);overflow:auto;padding:calc(env(safe-area-inset-top,0px) + 24px) 16px 40px";
 p.innerHTML=`<div style="max-width:420px;margin:0 auto"><div style="text-align:center"><div style="font-size:46px">🥫</div><h1 style="margin:4px 0;padding:0">Dispensa Smart</h1><div class="mu">${sub}</div></div><div class="card">
 ${m==="login"||m==="signup"?`<div class="row" style="gap:6px;margin-bottom:12px"><button class="btn ${m==="login"?"":"g"}" style="flex:1" onclick="acctSet({mode:'login',err:'',msg:''})">Accedi</button><button class="btn ${m==="signup"?"":"g"}" style="flex:1" onclick="acctSet({mode:'signup',err:'',msg:''})">Registrati</button></div>`:`<b>${m==="reset"?"Recupera la password":"Nuova password"}</b>`}
 ${m!=="newpw"?`<label class="mu" for="ae">Email</label><input id="ae" type="email" autocomplete="email" inputmode="email" autocapitalize="none" placeholder="nome@esempio.it" value="${esc(a.email||"")}" ${kd}>`:""}
 ${pwf?`<label class="mu" for="ap" style="display:block;margin-top:10px">${m==="newpw"?"Nuova password":"Password"}</label><input id="ap" type="password" autocomplete="${m==="login"?"current-password":"new-password"}" placeholder="${m==="login"?"La tua password":"Almeno 8 caratteri"}" ${kd}>`:""}
 ${two?`<label class="mu" for="ap2" style="display:block;margin-top:10px">Ripeti la password</label><input id="ap2" type="password" autocomplete="new-password" ${kd}>`:""}
 ${pwf?`<label class="mu" style="display:flex;gap:8px;align-items:center;margin-top:10px;cursor:pointer"><input type="checkbox" style="width:auto" onchange="acctShow(this.checked)"> Mostra la password</label>`:""}
 ${a.err?`<div class="al" style="margin-top:12px">${esc(a.err)}</div>`:""}${a.msg?`<div style="margin-top:12px;padding:10px 12px;border-radius:12px;background:var(--bd)">${esc(a.msg)}</div>`:""}
 <button id="agb" class="btn" style="width:100%;margin-top:14px" ${a.busy?"disabled":""} onclick="acctGo()">${a.busy?"Attendi…":btn}</button>
 ${m==="login"?`<div style="text-align:center;margin-top:12px"><a href="#" style="color:var(--ac);font-weight:600" onclick="acctSet({mode:'reset',err:'',msg:''});return false">Password dimenticata?</a></div>`:""}
 ${m==="reset"?`<div style="text-align:center;margin-top:12px"><a href="#" style="color:var(--ac);font-weight:600" onclick="acctSet({mode:'login',err:'',msg:''});return false">← Torna all’accesso</a></div>`:""}
 </div>${m==="signup"?`<div class="mu" style="text-align:center">Se su questo dispositivo ci sono già dati, verranno salvati nel tuo account.</div>`:""}
 <div style="text-align:center;margin-top:18px">${lg?`<a href="#" class="mu" onclick="acctSkip();return false">Continua senza account (i dati restano solo su questo dispositivo)</a>`:`<a href="#" class="mu" onclick="S.acct=null;S.acctK=null;render();return false">Annulla</a>`}</div></div>`;
 p.style.display="block";const f=$(m==="newpw"?"ap":"ae");if(f&&!a.busy){try{f.focus()}catch(e){}}}
/* ---------- avvio ---------- */
let acctHc=false;
function acctBoot(){const cfg=sbCfg();if(!cfg){if(ghOn())ghInit();return}
 if(!acctHc){acctHc=true;window.addEventListener("hashchange",()=>{if(/access_token=|error_code=/.test(location.hash))acctBoot()})}
 const hs=location.hash||"";
 if(/access_token=|error_code=|error=/.test(hs)){const q=new URLSearchParams(hs.replace(/^#/,""));try{history.replaceState(null,"",location.pathname+location.search)}catch(e){}
  if(q.get("access_token")&&q.get("refresh_token")){let u={};try{const pl=JSON.parse(atob(q.get("access_token").split(".")[1].replace(/-/g,"+").replace(/_/g,"/")));u={id:pl.sub,email:pl.email}}catch(e){}
   sbStore({access_token:q.get("access_token"),refresh_token:q.get("refresh_token"),expires_at:+q.get("expires_at")||Math.floor(Date.now()/1000)+(+q.get("expires_in")||3600),user:u});
   if(q.get("type")==="recovery"){S.acct={mode:"newpw"};render();return}
   return sbPostLogin()}
  if(q.get("error_description")||q.get("error")){S.acct={mode:"login",err:q.get("error_code")==="otp_expired"?"Il link è scaduto o è già stato usato: richiedine uno nuovo.":"Il link non è valido: riprova ad accedere."}}}
 if(sbSess()&&!(S.acct&&S.acct.mode==="newpw")){const s=sbSess();try{localStorage.setItem("sbuid",s.uid||localStorage.getItem("sbuid")||"")}catch(e){}return sbInit()}
 render()}
