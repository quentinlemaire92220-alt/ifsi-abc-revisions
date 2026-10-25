import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import assert from 'node:assert/strict';
import {spawn,execFileSync} from 'node:child_process';

const base=process.cwd();
const read=(file)=>fs.readFileSync(path.join(base,file));
const html=read('index.html').toString('utf8');
assert.ok(html.includes('./course-navigation-ui-v2.js?v='+JSON.parse(read('build-meta.json')).build),'Le module réellement publié doit être testé');
const injected='<script src="./tests/fixtures/course-navigation-v2-full-app.js"></script>';
const rafShim='<script>window.requestAnimationFrame=function(callback){return setTimeout(function(){callback(performance.now())},16)};</script>';
const testPage=html.replace('</head>',rafShim+'\n</head>').replace('</body>',injected+'\n</body>');
assert.notEqual(testPage,html,'Impossible de préparer le test de l’application complète');
const types={'.html':'text/html','.js':'text/javascript','.mjs':'text/javascript','.json':'application/json','.txt':'text/plain','.css':'text/css','.svg':'image/svg+xml','.webmanifest':'application/manifest+json','.jpg':'image/jpeg','.png':'image/png','.webp':'image/webp','.b64':'text/plain'};
const server=http.createServer((req,res)=>{
 let name;
 try{name=decodeURIComponent(new URL(req.url,'http://localhost').pathname)}catch{return res.writeHead(400).end()}
 if(name==='/'||name==='/index.html'){
   res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}).end(testPage);return;
 }
 if(name.includes('\0')||name.split('/').includes('..'))return res.writeHead(400).end();
 const abs=path.resolve(base,'.'+name);
 if(!abs.startsWith(base+path.sep))return res.writeHead(403).end();
 try{
   const contents=fs.readFileSync(abs);
   const mime=types[path.extname(abs)]||'application/octet-stream';
   res.writeHead(200,{'Content-Type':mime,'Cache-Control':'no-store'}).end(contents);
 }catch{return res.writeHead(404).end()}
});
const binaries=[process.env.CHROME_BIN,...(process.platform==='win32'?['C:/Program Files/Google/Chrome/Application/chrome.exe']:[]),'google-chrome','google-chrome-stable','chromium','chromium-browser'].filter(Boolean);
let chrome;
for(const name of binaries){try{if(fs.existsSync(name)){chrome=name;break}chrome=execFileSync('which',[name],{encoding:'utf8'}).trim();if(chrome)break}catch{}}
assert.ok(chrome,'Le navigateur Chromium est obligatoire pour les tests de démarrage réel');
await new Promise((resolve,reject)=>server.listen(0,'127.0.0.1',e=>e?reject(e):resolve()));
const port=server.address().port;
async function testViewport(width,height){
 const url='http://127.0.0.1:'+port+'/?test=ui-v2-anti-freeze';
 const args=['--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--no-first-run','--no-default-browser-check',
 '--disable-background-timer-throttling','--disable-renderer-backgrounding','--run-all-compositor-stages-before-draw','--virtual-time-budget=25000',
 '--window-size='+width+','+height,'--dump-dom',url];
 const {stdout,stderr,code}=await new Promise((resolve,reject)=>{
   const child=spawn(chrome,args,{stdio:['ignore','pipe','pipe']});
   let stdout='',stderr='';
   const timeout=setTimeout(()=>{child.kill('SIGKILL');reject(Error('Chrome figé au lancement >75 secondes pour largeur '+width))},75000);
   child.stdout.on('data',d=>{if(stdout.length<12000000)stdout+=d.toString()});
   child.stderr.on('data',d=>{if(stderr.length<40000)stderr+=d.toString()});
   child.on('error',e=>{clearTimeout(timeout);reject(e)});
   child.on('close',code=>{clearTimeout(timeout);resolve({stdout,stderr,code})});
 });
 if(code!==0)throw Error('Chrome '+width+' px quitte avec '+code+' '+stderr.slice(-1500));
 const match=stdout.match(/<output\b[^>]*id="ifsiRealAppTest"[^>]*data-result="([^"]+)"[^>]*>([\s\S]*?)<\/output>/i);
 assert.ok(match,'Aucun résultat de lancement complet à '+width+' px, DOM '+stdout.slice(-400));
 const clean=match[2].replace(/<[^>]+>/g,'').replaceAll('&gt;','>').replaceAll('&lt;','<');
 assert.equal(match[1],'pass','Echec du lancement complet '+width+' px : '+clean.slice(0,2200));
 console.log('✅ Vue '+width+'x'+height+' : '+clean);
}
try{
 await testViewport(1380,920);
 await testViewport(390,844);
}finally{await new Promise(resolve=>server.close(resolve))}
