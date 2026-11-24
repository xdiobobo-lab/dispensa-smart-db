// Controlla che versione, cache e novità siano coerenti: una release incoerente fa uscire l'avviso di aggiornamento all'infinito.
const fs=require('fs'),path=require('path');const R=process.env.SITE||path.resolve(__dirname,'..');
const rd=f=>fs.readFileSync(path.join(R,f),'utf8');let ko=0;const T=(n,c)=>{console.log((c?'OK  ':'FAIL')+' '+n);if(!c)ko++};
const v=(rd('core.js').match(/APP_VER="([0-9.]+)"/)||[])[1];
T('core.js ha APP_VER ('+v+')',!!v);
T('versione.json = APP_VER',JSON.parse(rd('versione.json')).v===v);
T('sw.js usa la stessa versione',rd('sw.js').includes('dispensa-v'+v)&&rd('sw.js').includes('?v='+v));
T('index.html usa la stessa versione',rd('index.html').includes('var V="'+v+'"')&&rd('index.html').includes('core.js?v='+v));
global.window={};eval(rd('novita.js'));
T('novita.js ha le note della versione '+v,window.NOVITA.length>0&&window.NOVITA[0].v===v&&window.NOVITA[0].s.length>0);
T('CHANGELOG.md ha la versione '+v,rd('CHANGELOG.md').includes('## ['+v+']'));
console.log(ko?ko+' ko':'0 ko');process.exit(ko?1:0);
