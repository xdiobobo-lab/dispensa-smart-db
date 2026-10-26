/* Modalità file locale: l'AI usa la tua chiave API (GroqCloud o Anthropic), salvata solo in questo browser. */
if(typeof claude==="undefined"){(function(){
const KEY="akey",DEF={groq:"openai/gpt-oss-120b",ant:"claude-sonnet-5-5"};
const PREF=["openai/gpt-oss-120b","llama-3.3-70b-versatile","openai/gpt-oss-20b","llama-3.1-8b-instant"];
const NOCHAT=/whisper|guard|tts|orpheus|playai|embed|safeguard|compound/i;
const prov=k=>String(k).startsWith("sk-ant")?"ant":"groq";
try{const hm=location.hash.match(/[#&]ai=([^&]+)/);if(hm){const o=JSON.parse(decodeURIComponent(escape(atob(decodeURIComponent(hm[1])))));if(o&&o.u&&o.c){localStorage.setItem("aproxy",JSON.stringify({u:String(o.u),c:String(o.c)}));history.replaceState(null,"",location.pathname+location.search)}}}catch(e){}
const PX=()=>{try{const p=JSON.parse(localStorage.getItem("aproxy")||"null");return p&&p.u&&p.c?p:null}catch(e){return null}};
const EP=path=>PX()?PX().u.replace(/\/+$/,"")+"/v1"+path:"https://api.groq.com/openai/v1"+path;
const HD=key=>PX()?{"content-type":"application/json","x-access-code":PX().c}:{"content-type":"application/json",authorization:"Bearer "+key};
const model=p=>localStorage.getItem("amodel_"+p)||DEF[p];
const SYS="Rispondi sempre e solo con JSON valido, senza testo prima o dopo e senza blocchi di codice.";
async function groqModels(key){
 try{const r=await fetch(EP("/models"),{headers:HD(key)});const d=await r.json();
  return (d.data||[]).map(m=>m.id).filter(id=>id&&!NOCHAT.test(id))}catch(e){return[]}
}
async function pick(key){
 const ids=await groqModels(key);if(!ids.length)return null;
 return PREF.find(m=>ids.includes(m))||ids[0];
}
async function ask(prompt,retry,mtx){
 const key=localStorage.getItem(KEY)||"";
 if(!key&&!PX())throw new Error("Per usare l’AI serve la tua chiave API: tocca “🔑 Chiave AI” in alto.");
 const p=PX()?"groq":prov(key),m=model(p);let r;
 try{
  if(p==="ant")r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"content-type":"application/json","x-api-key":key,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:m,max_tokens:8000,system:SYS,messages:[{role:"user",content:prompt}]})});
  else{
   const est=Math.ceil((prompt.length+SYS.length)/2.8),mt=mtx||Math.max(1200,Math.min(8000,7400-est));
   const body={model:m,temperature:0.4,max_tokens:mt,messages:[{role:"system",content:SYS},{role:"user",content:prompt}]};
   if(/gpt-oss/i.test(m))body.reasoning_effort="low";
   r=await fetch(EP("/chat/completions"),{method:"POST",headers:HD(key),body:JSON.stringify(body)});
  }
 }catch(e){throw new Error("Connessione non riuscita: controlla internet.")}
 const d=await r.json().catch(()=>({}));
 if(!r.ok){
  const msg=(d.error&&d.error.message)||"";
  if(p==="groq"&&!retry&&(r.status===404||(/model/i.test(msg)&&/exist|access|decommission|not found|deprecat/i.test(msg)))){
   const nm=await pick(key);
   if(nm&&nm!==m){localStorage.setItem("amodel_groq",nm);return ask(prompt,1)}
  }
  const tm=msg.match(/Limit\s+(\d+),\s*Requested\s+(\d+)/i);
  if(p==="groq"&&tm&&!mtx){const lim=+tm[1],req=+tm[2],cur=Math.max(1200,Math.min(8000,7400-Math.ceil((prompt.length+SYS.length)/2.8))),nm2=cur-(req-lim)-300;
   if(nm2>=900)return ask(prompt,retry,nm2);
   throw new Error("La richiesta è troppo grande per il limite di token al minuto del tuo piano Groq ("+lim+"). Riduci i dati (meno offerte o meno prodotti) oppure passa a un piano con limiti più alti.")}
  if(r.status===401)throw new Error(PX()?"Codice di accesso non valido: chiedi un nuovo link a chi te l’ha dato.":"Chiave API non valida: controllala con “🔑 Chiave AI”.");
  if(r.status===429)throw new Error("Limite di richieste raggiunto: attendi un minuto e riprova.");
  throw new Error(msg||"Errore AI ("+r.status+"). Prova a cambiare modello con ⚙️.");
 }
 let t=p==="ant"?(d.content||[]).filter(b=>b.type==="text").map(b=>b.text).join(""):(((d.choices||[])[0]||{}).message||{}).content||"";
 t=t.replace(/<think>[\s\S]*?<\/think>/g,"");
 const a=t.search(/[\[{]/),z=Math.max(t.lastIndexOf("]"),t.lastIndexOf("}"));
 try{return JSON.parse(t.slice(a,z+1))}catch(e){throw new Error("Risposta AI non leggibile, riprova.")}
}
async function vision(prompt,images){
 const key=localStorage.getItem(KEY)||"";
 if(!key&&!PX())throw new Error("Per usare l’AI serve la tua chiave API: tocca “🔑 Chiave AI” in alto.");
 const p=PX()?"groq":prov(key);let r;
 const m=localStorage.getItem("amodel_vision")||(p==="ant"?DEF.ant:"qwen/qwen3.8-27b");
 try{
  if(p==="ant"){
   const content=images.map(u=>({type:"image",source:{type:"base64",media_type:"image/jpeg",data:u.split(",")[1]}}));content.push({type:"text",text:prompt});
   r=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"content-type":"application/json","x-api-key":key,"anthropic-version":"2023-06-01","anthropic-dangerous-direct-browser-access":"true"},body:JSON.stringify({model:m,max_tokens:8000,system:SYS,messages:[{role:"user",content}]})});
  }else{
   const content=[{type:"text",text:prompt},...images.map(u=>({type:"image_url",image_url:{url:u}}))];
   r=await fetch(EP("/chat/completions"),{method:"POST",headers:HD(key),body:JSON.stringify({model:m,temperature:0.2,max_tokens:8000,messages:[{role:"system",content:SYS},{role:"user",content}]})});
  }
 }catch(e){throw new Error("Connessione non riuscita: controlla internet.")}
 const d=await r.json().catch(()=>({}));
 if(!r.ok){const msg=(d.error&&d.error.message)||"";
  if(r.status===401)throw new Error(PX()?"Codice di accesso non valido: chiedi un nuovo link a chi te l’ha dato.":"Chiave API non valida: controllala con “🔑 Chiave AI”.");
  if(r.status===429)throw new Error("Limite di richieste raggiunto: attendi un minuto e riprova.");
  if(r.status===413||/too large|payload/i.test(msg))throw new Error("Le immagini sono troppo pesanti per il modello: riprova con meno pagine.");
  throw new Error(msg||"Errore AI nella lettura delle immagini ("+r.status+"). Il modello "+m+" potrebbe non supportare le immagini.")}
 let t=p==="ant"?(d.content||[]).filter(x=>x.type==="text").map(x=>x.text).join(""):(((d.choices||[])[0]||{}).message||{}).content||"";
 t=t.replace(/<think>[\s\S]*?<\/think>/g,"");
 const a=t.search(/[\[{]/),z=Math.max(t.lastIndexOf("]"),t.lastIndexOf("}"));
 try{return JSON.parse(t.slice(a,z+1))}catch(e){throw new Error("Risposta AI non leggibile, riprova.")}
}
window.claude={use:async n=>n==="sample"?{json:ask}:null,vision};
function upd(){const b=document.getElementById("kb");if(b){const k=localStorage.getItem(KEY);b.textContent=PX()?"🔑 Accesso famiglia ✓":k?"🔑 Chiave AI ✓ ("+(prov(k)==="ant"?"Claude":"Groq")+")":"🔑 Chiave AI"}}
window.setKey=()=>{const k=prompt("Incolla la tua chiave API: GroqCloud (inizia con gsk_) oppure Anthropic (sk-ant-). Se hai ricevuto un accesso dalla famiglia, incolla invece il testo indirizzo|codice (oppure apri il link che ti hanno mandato). Resta salvato solo in questo browser. Lascia vuoto per rimuovere.",PX()?PX().u+"|"+PX().c:(localStorage.getItem(KEY)||""));if(k===null)return;const t=k.trim();
 if(/^https:\/\/[^|\s]+\|\S+$/.test(t)){const i=t.indexOf("|");localStorage.setItem("aproxy",JSON.stringify({u:t.slice(0,i),c:t.slice(i+1)}));localStorage.removeItem(KEY)}
 else if(t){localStorage.setItem(KEY,t);localStorage.removeItem("aproxy")}else{localStorage.removeItem(KEY);localStorage.removeItem("aproxy")}upd()};
window.setModel=async()=>{
 const key=localStorage.getItem(KEY)||"",p=prov(key);let extra="";
 if(key&&p==="groq"){const ids=await groqModels(key);if(ids.length)extra="\n\nModelli disponibili con la tua chiave:\n"+ids.join("\n")}
 const m=prompt("Nome del modello da usare ("+(p==="ant"?"Claude":"GroqCloud")+"). Lascia vuoto per il predefinito ("+DEF[p]+")."+extra,model(p));
 if(m===null)return;m.trim()?localStorage.setItem("amodel_"+p,m.trim()):localStorage.removeItem("amodel_"+p)};
document.querySelector("h1").insertAdjacentHTML("afterend",'<div style="display:flex;gap:6px;flex-wrap:wrap"><button id="kb" class="btn g" style="padding:5px 12px;font-size:13px" onclick="setKey()"></button><button class="btn g" style="padding:5px 12px;font-size:13px" onclick="setModel()" aria-label="Cambia modello">⚙️ Modello</button></div>');upd();
})()}
