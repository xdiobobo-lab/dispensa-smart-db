const {chromium}=require('playwright'),http=require('http'),fs=require('fs'),path=require('path');
const ROOT=(process.env.SITE||require('path').resolve(__dirname,'..')),MIME={'.html':'text/html','.js':'text/javascript','.css':'text/css','.png':'image/png','.webmanifest':'application/json'};
const srv=http.createServer((q,r)=>{let u=decodeURIComponent(q.url.split('?')[0]);if(u==='/')u='/index.html';const f=path.join(ROOT,u);if(!f.startsWith(ROOT)||!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':MIME[path.extname(f)]||'text/plain'});r.end(fs.readFileSync(f))});
// ---- finto Supabase ----
const DB={users:{},tokens:{},dati:{},copie:{}};let confirmMail=false,rateLimit=false,seq=0;
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
(async()=>{await new Promise(r=>srv.listen(8791,r));const br=await chromium.launch();
 const mk=async(cfg=true)=>{const ctx=await br.newContext({viewport:{width:390,height:800},serviceWorkers:'block'});const pg=await ctx.newPage();pg.errs=[];pg.on('pageerror',e=>pg.errs.push(e.message));
  await pg.route('https://fake.supabase.co/**',fake);
  await pg.route('**/config.js',r=>r.fulfill({contentType:'text/javascript',body:cfg?'window.SB_CONFIG={url:"https://fake.supabase.co",key:"anon"};':'window.SB_CONFIG={url:"",key:""};'}));
  await pg.goto('http://localhost:8791/index.html');await pg.waitForTimeout(500);return{ctx,pg}};
 const vis=pg=>pg.evaluate(()=>{const e=document.getElementById('acct');return !!e&&e.style.display!=='none'&&e.innerHTML.length>0});
 const txt=pg=>pg.evaluate(()=>(document.getElementById('acct')||{}).innerText||'');
 const fill=async(pg,o)=>{for(const[k,v]of Object.entries(o))await pg.fill('#'+k,v)};
 const click=(pg,t)=>pg.click(`#acct button:has-text("${t}")`);
 // 0) senza config: nessun login
 {const{ctx,pg}=await mk(false);ok('senza config.js compilato: nessuna schermata di accesso',!(await vis(pg)));ok('gear panel senza Account',!(await pg.evaluate(()=>vAccount()))); await ctx.close()}
 // dispositivo 1
 const A=await mk(),p1=A.pg;
 ok('1) all’avvio compare l’accesso',await vis(p1),(await txt(p1)).split('\n').slice(0,3).join(' | '));
 await click(p1,'Registrati');await fill(p1,{ae:'Anna@Test.it',ap:'corta',ap2:'corta'});await click(p1,'Crea account');await p1.waitForTimeout(200);
 ok('2) password corta rifiutata',(await txt(p1)).includes('almeno 8 caratteri'));
 await fill(p1,{ap:'password123',ap2:'diversa123'});await click(p1,'Crea account');await p1.waitForTimeout(200);
 ok('   password diverse rifiutate',(await txt(p1)).includes('non coincidono'));
 await fill(p1,{ap:'password123',ap2:'password123'});await click(p1,'Crea account');await p1.waitForTimeout(800);
 ok('3) registrazione (senza conferma email): entra e chiude l’accesso',!(await vis(p1)) && await p1.evaluate(()=>sbOn()),'email: '+await p1.evaluate(()=>sbSess().email));
 await p1.evaluate(()=>{S.items.push({id:'a1',name:'Latte',cat:'Latticini e uova',q:1000,u:'ml',exp:''});save()});await p1.waitForTimeout(3600);
 ok('4) il dato locale viene salvato online dopo ~3 s',Object.values(DB.dati).length===1&&DB.dati[Object.keys(DB.dati)[0]].data.items.length===1);
 // dispositivo 2 stesso account
 const B=await mk(),p2=B.pg;await fill(p2,{ae:'anna@test.it',ap:'sbagliata1'});await p2.click('#agb');await p2.waitForTimeout(500);
 ok('5) password errata',(await txt(p2)).includes('Email o password non corretti'));
 await fill(p2,{ap:'password123'});await p2.keyboard.press('Enter');await p2.waitForTimeout(1200);
 ok('6) dispositivo 2: accesso e dati scaricati',!(await vis(p2)) && await p2.evaluate(()=>S.items.some(i=>i.name==='Latte')),'prodotti: '+await p2.evaluate(()=>S.items.length));
 await p2.evaluate(()=>{S.items.push({id:'b1',name:'Pasta',cat:'Cereali e derivati',q:500,u:'g',exp:''});save()});await p2.waitForTimeout(3600);
 await p1.evaluate(()=>sbPull(true));await p1.waitForTimeout(600);
 ok('7) dispositivo 1 riceve la modifica del 2',await p1.evaluate(()=>S.items.some(i=>i.name==='Pasta')));
 // conflitto: entrambi modificano senza sincronizzare
 await p1.evaluate(()=>{ghMute=false;S.items.push({id:'c1',name:'Riso',cat:'Cereali e derivati',q:1,u:'pz',exp:''});localStorage.setItem('lm',Date.now());clearTimeout(sbT)});
 await p2.evaluate(()=>{S.items.push({id:'c2',name:'Tonno',cat:'Carne e pesce',q:1,u:'pz',exp:''});save()});await p2.waitForTimeout(3600);
 await p1.evaluate(()=>sbPush());await p1.waitForTimeout(1500);
 const names=Object.values(DB.dati)[0].data.items.map(i=>i.name).sort().join(',');
 ok('8) conflitto: unione senza perdere dati',names.includes('Riso')&&names.includes('Tonno')&&names.includes('Latte')&&names.includes('Pasta'),names+' | stato: '+await p1.evaluate(()=>S.sbst&&S.sbst.s));
 // copie online
 await p1.evaluate(()=>sbBackup(true));await p1.waitForTimeout(400);
 const bl=await p1.evaluate(async()=>(await ghBackups()).map(x=>x.name));ok('9) copia online creata e elencata',bl.length===1&&/dispensa-\d{4}-\d{2}-\d{2}\.json/.test(bl[0]),bl.join());
 const got=await p1.evaluate(async n=>{const d=await sbBackupGet(n);return d.items.length},bl[0]);ok('   copia leggibile',got>=3,'prodotti: '+got);
 // pannello rotella
 await p1.click('.gear');await p1.waitForTimeout(250);const pan=await p1.evaluate(()=>document.getElementById('thp').innerText);
 ok('10) rotella: card account con email e Sincronizza',pan.includes('anna@test.it')&&pan.includes('Sincronizza ora')&&pan.includes('Cambia password'));
 ok('    stato sync visibile',/Sincronizzato alle/.test(pan),pan.match(/☁️[^\n]*/)||'');
 // cambia password dalla rotella
 await p1.evaluate(()=>{S.thp=false;acctOpen('newpw')});await p1.waitForTimeout(250);await fill(p1,{ap:'nuovaPass99',ap2:'nuovaPass99'});await click(p1,'Salva la nuova password');await p1.waitForTimeout(800);
 ok('11) cambio password',Object.values(DB.users)[0].pw==='nuovaPass99'&&!(await vis(p1)));
 // esci
 await p1.click('.gear');await p1.waitForTimeout(200);await p1.click('#thp button:has-text("Esci")>> nth=0');await p1.waitForTimeout(400);
 ok('12) Esci: torna l’accesso, dati locali ancora presenti',await vis(p1)&&await p1.evaluate(()=>S.items.length>=4&&!sbOn()));
 // altro utente sullo stesso dispositivo
 await click(p1,'Registrati');await fill(p1,{ae:'bruno@test.it',ap:'password456',ap2:'password456'});await Promise.all([p1.waitForNavigation({timeout:8000}).catch(()=>{}),click(p1,'Crea account')]);await p1.waitForTimeout(1500);
 const left=await p1.evaluate(()=>({n:S.items.length,on:sbOn(),em:sbSess()&&sbSess().email}));
 ok('13) altro utente: i dati del primo NON passano al secondo',left.n===0&&left.on&&left.em==='bruno@test.it',JSON.stringify(left));
 ok('    i dati di Anna sono ancora online',Object.values(DB.dati)[0].data.items.length>=4);
 // password dimenticata + link di recupero
 const C=await mk(),p3=C.pg;await click(p3,'Accedi');await p3.click('#acct a:has-text("Password dimenticata")');await fill(p3,{ae:'anna@test.it'});await click(p3,'Invia il link');await p3.waitForTimeout(500);
 ok('14) recupero: richiesta inviata',DB.recover==='anna@test.it'&&(await txt(p3)).includes('Se l’email è registrata'));
 const uA=Object.values(DB.users)[0],tok=sess(uA);
 await p3.goto('http://localhost:8791/index.html?r=1#access_token='+tok.access_token+'&refresh_token='+tok.refresh_token+'&expires_in=3600&type=recovery');await p3.waitForTimeout(700);
 ok('15) link di recupero: schermata nuova password',(await txt(p3)).includes('nuova password')||(await txt(p3)).includes('Nuova password'),'hash pulito: '+await p3.evaluate(()=>location.hash===''));
 await fill(p3,{ap:'terzaPass77',ap2:'terzaPass77'});await click(p3,'Salva la nuova password');await p3.waitForTimeout(1200);
 ok('16) nuova password salvata e accesso effettuato',uA.pw==='terzaPass77'&&!(await vis(p3)));
 // ospite
 const D=await mk(),p4=D.pg;await p4.click('#acct a:has-text("Continua senza account")');await p4.waitForTimeout(300);
 ok('17) ospite: l’app si usa senza account',!(await vis(p4))&&await p4.evaluate(()=>!sbOn()&&document.getElementById('v').innerText.length>10));
 await p4.click('.gear');await p4.waitForTimeout(200);ok('    rotella propone di accedere',(await p4.evaluate(()=>document.getElementById('thp').innerText)).includes('Accedi o crea un account'));
 // errori: già registrato, offline, rate limit
 const E=await mk(),p5=E.pg;await click(p5,'Registrati');await fill(p5,{ae:'anna@test.it',ap:'password123',ap2:'password123'});await click(p5,'Crea account');await p5.waitForTimeout(500);
 ok('18) email già registrata',(await txt(p5)).includes('Esiste già un account'));
 rateLimit=true;await click(p5,'Registrati');await fill(p5,{ae:'x@test.it',ap:'password123',ap2:'password123'});await click(p5,'Crea account');await p5.waitForTimeout(400);ok('19) troppe richieste',(await txt(p5)).includes('Troppe richieste'));rateLimit=false;
 await p5.route('https://fake.supabase.co/**',r=>r.abort());await click(p5,'Accedi');await fill(p5,{ae:'anna@test.it',ap:'password123'});await p5.click('#agb');await p5.waitForTimeout(500);
 ok('20) offline: messaggio chiaro',(await txt(p5)).includes('potrebbe essere in pausa'));
 // conferma email accesa
 confirmMail=true;const F=await mk(),p6=F.pg;await click(p6,'Registrati');await fill(p6,{ae:'carla@test.it',ap:'password789',ap2:'password789'});await click(p6,'Crea account');await p6.waitForTimeout(500);
 ok('21) con conferma email: avviso di controllare la posta',(await txt(p6)).includes('Ti abbiamo mandato un’email')&&await vis(p6));
 await click(p6,'Registrati');await fill(p6,{ae:'anna@test.it',ap:'password123',ap2:'password123'});await click(p6,'Crea account');await p6.waitForTimeout(500);
 ok('    email già esistente (risposta mascherata)',(await txt(p6)).includes('Esiste già un account'));
 const errs=[A,B,C,D,E,F].flatMap(x=>x.pg.errs);ok('errori JavaScript nella pagina',errs.length===0,errs.join(' | '));
 console.log(out.join('\n'));await br.close();srv.close();process.exit(0)})().catch(e=>{console.log(out.join('\n'));console.log('ERR',e.stack);process.exit(1)});
