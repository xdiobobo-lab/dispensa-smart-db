const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path');
const ROOT=(process.env.SITE||require('path').resolve(__dirname,'..')),MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webmanifest':'application/json'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';const f=path.join(ROOT,u);if(!f.startsWith(ROOT)||!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':MIME[path.extname(f)]||'text/plain'});r.end(fs.readFileSync(f))});
// ---- finto Supabase ----
const DB={users:{},tokens:{},dati:{},copie:{},fam:{},mem:{},fdati:{}};let confirmMail=false,rateLimit=false,seq=0;
const b64u=o=>Buffer.from(JSON.stringify(o)).toString('base64url');
function sess(u){const at='h.'+b64u({sub:u.id,email:u.email})+'.s'+(++seq),rt='rt'+(++seq);DB.tokens[at]=u.id;DB.tokens[rt]=u.id;return{access_token:at,refresh_token:rt,expires_in:3600,expires_at:Math.floor(Date.now()/1000)+3600,token_type:'bearer',user:{id:u.id,email:u.email,identities:[{}]}}}
const J=(st,o)=>({status:st,contentType:'application/json',headers:{'access-control-allow-origin':'*'},body:JSON.stringify(o)});
async function fake(route){const req=route.request(),url=new URL(req.url()),p=url.pathname,m=req.method();
 if(m==='OPTIONS')return route.fulfill({status:204,headers:{'access-control-allow-origin':'*','access-control-allow-headers':'*','access-control-allow-methods':'*'}});
 let body={};try{body=JSON.parse(req.postData()||'{}')}catch(e){}
 const bearer=(req.headers()['authorization']||'').replace('Bearer ','');
 if(p==='/auth/v1/signup'){if(rateLimit)return route.fulfill(J(429,{error_code:'over_email_send_rate_limit',msg:'email rate limit exceeded'}));
  if(body.password.length<8)return route.fulfill(J(422,{error_code:'weak_password',msg:'Password should be at least 8 characters.'}));
  const ex=Object.values(DB.users).find(u=>u.email===body.email);
  if(ex){return confirmMail?route.fulfill(J(200,{id:ex.id,email:ex.email,identities:[]})):route.fulfill(J(422,{error_code:'user_already_exists',msg:'User already registered'}))}
  const u={id:'u'+(++seq),email:body.email,pw:body.password};DB.users[u.id]=u;
  return route.fulfill(J(200,confirmMail?{id:u.id,email:u.email,identities:[{}]}:sess(u)))}
 if(p==='/auth/v1/token'){const g=url.searchParams.get('grant_type');
  if(g==='password'){const u=Object.values(DB.users).find(u=>u.email===body.email&&u.pw===body.password);return u?route.fulfill(J(200,sess(u))):route.fulfill(J(400,{error_code:'invalid_credentials',msg:'Invalid login credentials'}))}
  if(g==='refresh_token'){const id=DB.tokens[body.refresh_token];return id?route.fulfill(J(200,sess(DB.users[id]))):route.fulfill(J(400,{error_code:'refresh_token_not_found',msg:'Invalid Refresh Token'}))}}
 if(p==='/auth/v1/recover'){DB.recover=body.email;return route.fulfill(J(200,{}))}
 if(p==='/auth/v1/user'&&m==='PUT'){const id=DB.tokens[bearer];if(!id)return route.fulfill(J(401,{msg:'bad jwt'}));if(DB.users[id].pw===body.password)return route.fulfill(J(422,{error_code:'same_password',msg:'New password should be different from the old password.'}));DB.users[id].pw=body.password;return route.fulfill(J(200,{id}))}
 if(p==='/auth/v1/logout'){delete DB.tokens[bearer];return route.fulfill({status:204,headers:{'access-control-allow-origin':'*'}})}

 if(p.startsWith('/rest/v1/rpc/')||p==='/rest/v1/famiglia_dati'){const id=DB.tokens[bearer];if(!id)return route.fulfill(J(401,{message:'JWT'}));
  const fn=p.split('/').pop();
  const info=()=>{const fid=DB.mem[id];if(!fid)return null;const f=DB.fam[fid];return{id:fid,codice:f.codice,nome:f.nome,n:Object.values(DB.mem).filter(x=>x===fid).length}};
  if(fn==='info_famiglia')return route.fulfill(J(200,info()));
  if(fn==='crea_famiglia'){if(DB.mem[id])return route.fulfill(J(400,{message:'Fai già parte di una famiglia.'}));const fid='F'+(++seq);DB.fam[fid]={codice:'ABCDE'+seq+'XYZ'.slice(0,2),nome:body.p_nome||'La mia famiglia'};DB.mem[id]=fid;return route.fulfill(J(200,info()))}
  if(fn==='entra_famiglia'){if(DB.mem[id])return route.fulfill(J(400,{message:'Fai già parte di una famiglia: esci prima da quella.'}));const c=String(body.p_codice).toUpperCase().replace(/[^A-Z0-9]/g,'');const fid=Object.keys(DB.fam).find(k=>DB.fam[k].codice===c);if(!fid)return route.fulfill(J(400,{message:'Codice non valido: controlla di averlo scritto giusto.'}));DB.mem[id]=fid;return route.fulfill(J(200,info()))}
  if(fn==='esci_famiglia'){const fid=DB.mem[id];delete DB.mem[id];if(fid&&!Object.values(DB.mem).includes(fid)){delete DB.fam[fid];delete DB.fdati[fid]}return route.fulfill(J(200,null))}
  if(fn==='famiglia_dati'){const fid=DB.mem[id];const q=(url.searchParams.get('famiglia_id')||'eq.'+body.famiglia_id).replace('eq.','');if(!fid||fid!==q)return m==='GET'?route.fulfill(J(200,[])):route.fulfill(J(403,{}));const row=DB.fdati[fid];
   if(m==='GET')return route.fulfill(J(200,row?[{data:row.data,updated_at:row.updated_at}]:[]));
   if(m==='POST'){if(row)return route.fulfill(J(409,{code:'23505'}));DB.fdati[fid]={data:body.data,updated_at:body.updated_at};return route.fulfill(J(201,[{...DB.fdati[fid]}]))}
   if(m==='PATCH'){const eq=url.searchParams.get('updated_at').replace(/^eq\./,'');if(!row||row.updated_at!==eq)return route.fulfill(J(200,[]));DB.fdati[fid]={data:body.data,updated_at:body.updated_at};return route.fulfill(J(200,[{...DB.fdati[fid]}]))}}
  return route.fulfill(J(404,{}))}
 if(p.startsWith('/rest/v1/')){const id=DB.tokens[bearer];if(!id)return route.fulfill(J(401,{message:'JWT'}));const t=p.split('/').pop(),tab=t==='dispensa_dati'?DB.dati:t==='dispensa_copie'?DB.copie:null;if(!tab)return route.fulfill(J(404,{code:'PGRST205'}));
  const key=t==='dispensa_dati'?id:null;
  if(t==='dispensa_dati'){const row=tab[id];
   if(m==='GET')return route.fulfill(J(200,row?[{data:row.data,updated_at:row.updated_at}]:[]));
   if(m==='POST'){if(body.user_id!==id)return route.fulfill(J(403,{}));if(row)return route.fulfill(J(409,{code:'23505'}));tab[id]={data:body.data,updated_at:body.updated_at};return route.fulfill(J(201,[{...tab[id]}]))}
   if(m==='PATCH'){const eq=url.searchParams.get('updated_at').replace(/^eq\./,'');if(!row||row.updated_at!==eq)return route.fulfill(J(200,[]));tab[id]={data:body.data,updated_at:body.updated_at};return route.fulfill(J(200,[{...tab[id]}]))}}
  else{const mine=tab[id]=tab[id]||{};
   if(m==='POST'){if(body.user_id!==id)return route.fulfill(J(403,{}));mine[body.giorno]=body.data;return route.fulfill({status:201,headers:{'access-control-allow-origin':'*'}})}
   if(m==='GET'){const g=url.searchParams.get('giorno');if(g)return route.fulfill(J(200,mine[g.replace('eq.','')]?[{data:mine[g.replace('eq.','')]}]:[]));return route.fulfill(J(200,Object.keys(mine).sort().reverse().slice(0,+url.searchParams.get('limit')||99).map(g=>({giorno:g}))))}
   if(m==='DELETE'){const lt=url.searchParams.get('giorno').replace('lt.','');Object.keys(mine).filter(g=>g<lt).forEach(g=>delete mine[g]);return route.fulfill({status:204,headers:{'access-control-allow-origin':'*'}})}}}
 return route.fulfill(J(404,{}))}

const out=[];const ok=(n,c,x)=>{out.push((c?'OK  ':'KO  ')+n+(x?' → '+x:''));};
(async()=>{await new Promise(r=>srv.listen(8792,r));const br=await chromium.launch();
 const mk=async()=>{const ctx=await br.newContext({viewport:{width:390,height:800},serviceWorkers:'block'});const pg=await ctx.newPage();pg.errs=[];pg.on('pageerror',e=>pg.errs.push(e.message));
  await pg.route('https://fake.supabase.co/**',fake);
  await pg.route('**/config.js',r=>r.fulfill({contentType:'text/javascript',body:'window.SB_CONFIG={url:"https://fake.supabase.co",key:"anon"};'}));
  await pg.goto('http://localhost:8792/index.html');await pg.waitForTimeout(500);return{ctx,pg}};
 const reg=async(pg,email)=>{await pg.click('#acct button:has-text("Registrati")');await pg.fill('#ae',email);await pg.fill('#ap','password123');await pg.fill('#ap2','password123');await pg.click('#agb');await pg.waitForTimeout(900)};
 const wait=ms=>new Promise(r=>setTimeout(r,ms));
 const A=await mk(),a=A.pg;await reg(a,'anna@t.it');
 await a.evaluate(()=>{S.items.push({id:'i1',name:'Latte',cat:'Latticini e uova',q:1000,u:'ml',exp:''},{id:'i2',name:'Pasta',cat:'Cereali e derivati',q:500,u:'g',exp:''});S.shop.push({id:'s1',name:'Pane',amount:1,unit:"pz",done:false});save()});await a.waitForTimeout(500);
 ok('1) crea famiglia: RPC e dati condivisi',await a.evaluate(async()=>{await famRpc("info_famiglia");document.querySelector('.gear').click();return true}));
 await a.waitForTimeout(200);await a.fill('#fn','Casa Rossi');await a.click('button:has-text("Crea una famiglia")');await a.waitForTimeout(1500);
 const fid=Object.keys(DB.fam)[0];
 ok('   famiglia creata, anna membro',!!fid&&DB.mem[Object.keys(DB.users)[0]]===fid&&DB.fam[fid].nome==='Casa Rossi');
 ok('   dati condivisi pubblicati (2 prodotti, 1 spesa)',DB.fdati[fid]&&DB.fdati[fid].data.items.length===2&&DB.fdati[fid].data.shop.length===1);
 const code=await a.evaluate(()=>famGet().codice);
 await a.waitForTimeout(3600);
 const ud=DB.dati[Object.keys(DB.users)[0]];
 ok('2) riga personale senza items/shop/plan',ud&&!('items' in ud.data)&&!('shop' in ud.data)&&!('plan' in ud.data),ud?Object.keys(ud.data).join(','):'nessuna');
 // madre: stesso account no, account diverso, dispositivo nuovo vuoto
 const B=await mk(),b=B.pg;await reg(b,'mamma@t.it');
 await b.evaluate(()=>{S.items.push({id:'m1',name:'Uova',cat:'Latticini e uova',q:6,u:'pz',exp:''});save()});await b.waitForTimeout(300);
 await b.click('.gear');await b.waitForTimeout(200);await b.fill('#fc','codice-sbagliato');await b.click('button:has-text("Entra con il codice")');await b.waitForTimeout(600);
 ok('3) codice sbagliato: messaggio chiaro',(await b.evaluate(()=>document.getElementById('thp').innerText)).includes('Codice non valido'));
 await b.fill('#fc',code.slice(0,5)+'-'+code.slice(5).toLowerCase());await b.click('button:has-text("Entra con il codice")');await b.waitForTimeout(1800);
 ok('4) entra col codice (minuscole/trattino ok): vede i prodotti di Anna + i suoi',await b.evaluate(()=>['Latte','Pasta','Uova'].every(n=>S.items.some(i=>i.name===n))&&S.shop.some(x=>x.name==='Pane')),await b.evaluate(()=>S.items.map(i=>i.name).join(',')));
 ok('   famiglia con 2 persone',await b.evaluate(()=>famGet().n===2));
 // anna riceve Uova
 await a.evaluate(()=>famSync(true));await a.waitForTimeout(1000);
 ok('5) Anna riceve “Uova” dalla mamma',await a.evaluate(()=>S.items.some(i=>i.name==='Uova')));
 // modifiche in parallelo: anna aggiunge, mamma cancella Pasta e modifica Latte
 await a.evaluate(()=>{S.items.push({id:'a9',name:'Tonno',cat:'Carne e pesce',q:3,u:'pz',exp:''});S.shop.push({id:'s2',name:'Burro',amount:1,unit:'pz',done:false});save()});
 await b.evaluate(()=>{S.items=S.items.filter(i=>i.name!=='Pasta');S.items.find(i=>i.name==='Latte').q=500;S.shop.find(x=>x.id==='s1').done=true;save()});
 await wait(4500);
 await a.evaluate(()=>famSync());await b.evaluate(()=>famSync());await wait(1500);await a.evaluate(()=>famSync());await wait(800);await b.evaluate(()=>famSync());await wait(800);
 const sa=await a.evaluate(()=>({i:S.items.map(i=>i.name+':'+i.q).sort().join(','),s:S.shop.map(x=>x.name+':'+x.done).sort().join(',')}));
 const sb=await b.evaluate(()=>({i:S.items.map(i=>i.name+':'+i.q).sort().join(','),s:S.shop.map(x=>x.name+':'+x.done).sort().join(',')}));
 ok('6) unione modifiche parallele (stesso risultato per tutti)',sa.i===sb.i&&sa.s===sb.s,JSON.stringify(sa));
 ok('   Pasta cancellata da mamma propagata, Tonno aggiunto, Latte 500, Pane fatto',!sa.i.includes('Pasta')&&sa.i.includes('Tonno')&&sa.i.includes('Latte:500')&&sa.s.includes('Pane:true')&&sa.s.includes('Burro'));
 // nuovo dispositivo di anna: recupera famiglia
 const C=await mk(),c=C.pg;await c.click('#acct button:has-text("Accedi")').catch(()=>{});await c.fill('#ae','anna@t.it');await c.fill('#ap','password123');await c.click('#agb');await c.waitForTimeout(2500);
 ok('7) nuovo dispositivo di Anna: famiglia riconosciuta e dati completi',await c.evaluate(()=>!!famGet()&&S.items.some(i=>i.name==='Tonno')&&S.items.some(i=>i.name==='Uova')),await c.evaluate(()=>S.items.length+' prodotti'));
 // esci
 await b.evaluate(()=>{S.thp=true;render()});await b.waitForTimeout(200);await b.click('button:has-text("Esci dalla famiglia")');await b.waitForTimeout(300);await b.click('button:has-text("Conferma: esci dalla famiglia")');await b.waitForTimeout(1500);
 ok('8) mamma esce: famiglia assente ma dati rimasti',await b.evaluate(()=>!famGet()&&S.items.length>=3),'membri: '+Object.keys(DB.mem).length);
 await b.evaluate(()=>{S.items.push({id:'z1',name:'Solo mia',cat:'Altro',q:1,u:'pz',exp:''});save()});await wait(4200);
 await a.evaluate(()=>famSync());await wait(800);
 ok('9) dopo l’uscita le modifiche della mamma non arrivano ad Anna',await a.evaluate(()=>!S.items.some(i=>i.name==='Solo mia')));
 const errs=[A,B,C].flatMap(x=>x.pg.errs);ok('errori JavaScript',errs.length===0,errs.join(' | '));
 console.log(out.join('\n'));await br.close();srv.close();process.exit(0)})().catch(e=>{console.log(out.join('\n'));console.log('ERR',e.stack);process.exit(1)});
