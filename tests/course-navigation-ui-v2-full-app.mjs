import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
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
 // Observe the real asynchronous startup clock. A virtual-time dump can run
 // its deadline while service-worker/network tasks are still pending.
 const profileRoot=process.platform==='win32'&&process.env.LOCALAPPDATA?path.join(process.env.LOCALAPPDATA,'Temp'):os.tmpdir();
 const profile=fs.mkdtempSync(path.join(profileRoot,'ifsi-nav-'));
 const args=['--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--no-first-run','--no-default-browser-check',
 '--disable-background-timer-throttling','--disable-renderer-backgrounding','--remote-debugging-port=0','--user-data-dir='+profile,'--window-size='+width+','+height,'about:blank'];
 const child=spawn(chrome,args,{stdio:['ignore','ignore','pipe'],windowsHide:true});let stderr='',launchError,ws,clean;
 child.stderr.on('data',d=>{stderr=(stderr+d).slice(-16000)});child.on('error',e=>{launchError=e});
 const pause=ms=>new Promise(r=>setTimeout(r,ms));
 try{
  let debugPort;
  for(let i=0;i<300;i++){
   const p=path.join(profile,'DevToolsActivePort');if(fs.existsSync(p)){debugPort=Number(fs.readFileSync(p,'utf8').split('\n')[0]);break}
   if(launchError||child.exitCode!==null||child.signalCode)throw Error('Chromium startup failed: '+(launchError?.message||child.exitCode||child.signalCode)+' '+stderr);
   await pause(100);
  }
  assert.ok(debugPort,'Debug port missing after 30 seconds: '+stderr);
  const tabs=await (await fetch('http://127.0.0.1:'+debugPort+'/json')).json(),tab=tabs.find(t=>t.type==='page');
  ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j});let seq=0;const pending=new Map();
  ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);clearTimeout(p?.timer);m.error?p?.reject(Error(m.error.message)):p?.resolve(m.result)}};
  const cmd=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>{pending.delete(id);reject(Error('Chromium command timed out: '+method))},10000);pending.set(id,{resolve,reject,timer});ws.send(JSON.stringify({id,method,params}))});
  await cmd('Page.enable');await cmd('Page.navigate',{url});
  let observed;const deadline=Date.now()+90000;
  while(Date.now()<deadline){
   try{const r=await cmd('Runtime.evaluate',{expression:"(()=>{const e=document.getElementById('ifsiRealAppTest');return e?{result:e.dataset.result,text:e.textContent}:null})()",returnByValue:true});observed=r.result?.value;if(observed&&observed.result!=='pending')break}
   catch(e){if(!/context.*(?:destroyed|not found)|navigated or closed|Cannot find context|Chromium command timed out: Runtime.evaluate/i.test(e.message))throw e}
   await pause(100);
  }
  assert.ok(observed,'Aucun résultat de lancement complet à '+width+' px');
  clean=observed.text;assert.equal(observed.result,'pass','Echec du lancement complet '+width+' px : '+clean);
 }finally{
  if(ws)ws.close();child.kill();
  // Close only this test profile, including on a failed startup.
  await new Promise(resolve=>{if(child.exitCode!==null||child.signalCode)return resolve();child.once('close',resolve);setTimeout(resolve,3000)});
  try{fs.rmSync(profile,{recursive:true,force:true,maxRetries:3,retryDelay:100})}catch{}
 }
 console.log('✅ Vue '+width+'x'+height+' : '+clean);
}
try{
 await testViewport(1380,920);
 await testViewport(390,844);
}finally{server.closeAllConnections();await new Promise(resolve=>server.close(resolve))}
