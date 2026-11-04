// Actual Chromium media playback: no mocked audio element or synthetic ended event.
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import os from 'node:os';
import {spawn} from 'node:child_process';
import assert from 'node:assert/strict';
const root=process.cwd(),series=JSON.parse(fs.readFileSync('audio-series-v1.json','utf8')).series.find(s=>s.reviewContract==='provided_audio_series_v1');
if(!series){console.log('No provided series to test');process.exit(0)}
const ranges=[];
const server=http.createServer((req,res)=>{
 let name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(name==='/')name='/index.html';
 const p=path.resolve(root,'.'+name);if(!p.startsWith(root+path.sep)||!fs.existsSync(p)||!fs.statSync(p).isFile())return res.writeHead(404).end();
 const size=fs.statSync(p).size,mime={'.html':'text/html','.js':'text/javascript','.json':'application/json','.mp3':'audio/mpeg','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.webmanifest':'application/manifest+json'}[path.extname(p)]||'application/octet-stream';
 const range=req.headers.range?.match(/^bytes=(\d+)-(\d*)$/);
 if(range){const start=Number(range[1]),end=Math.min(size-1,range[2]?Number(range[2]):size-1);ranges.push(name);res.writeHead(206,{'Content-Type':mime,'Content-Range':`bytes ${start}-${end}/${size}`,'Accept-Ranges':'bytes','Content-Length':end-start+1});return fs.createReadStream(p,{start,end}).pipe(res)}
 res.writeHead(200,{'Content-Type':mime,'Content-Length':size,'Cache-Control':'no-store','Accept-Ranges':'bytes'});fs.createReadStream(p).pipe(res);
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
// Chromium's service-worker database needs a short profile path on Windows.
// The test runner's nested log directory can exceed the native path limit.
const profileRoot=process.platform==='win32'&&process.env.LOCALAPPDATA
 ?path.join(process.env.LOCALAPPDATA,'Temp'):os.tmpdir();
const profile=fs.mkdtempSync(path.join(profileRoot,'ifsi-audio-'));
const bins=[process.env.CHROME_BIN,'C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe','/usr/bin/google-chrome','/usr/bin/chromium'];
const chrome=bins.find(p=>p&&fs.existsSync(p));assert.ok(chrome,'Chromium required');
const child=spawn(chrome,['--headless=new','--no-sandbox','--disable-gpu','--no-first-run','--no-default-browser-check','--autoplay-policy=no-user-gesture-required','--mute-audio','--remote-debugging-port=0','--user-data-dir='+profile,'about:blank'],{stdio:'ignore',windowsHide:true});
const pause=ms=>new Promise(r=>setTimeout(r,ms));let ws;
try{
 let port;for(let i=0;i<100;i++){const p=path.join(profile,'DevToolsActivePort');if(fs.existsSync(p)){port=Number(fs.readFileSync(p,'utf8').split('\n')[0]);break}await pause(100)}assert.ok(port,'Debug port missing');
 const tabs=await (await fetch('http://127.0.0.1:'+port+'/json')).json();const tab=tabs.find(t=>t.type==='page');
 ws=new WebSocket(tab.webSocketDebuggerUrl);await new Promise((r,j)=>{ws.onopen=r;ws.onerror=j});let seq=0;const pending=new Map();
 ws.onmessage=e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);m.error?p?.reject(Error(m.error.message)):p?.resolve(m.result)}};
 const cmd=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,{resolve,reject});ws.send(JSON.stringify({id,method,params}))});
 await cmd('Runtime.enable');await cmd('Page.enable');
 await cmd('Page.navigate',{url:'http://127.0.0.1:'+server.address().port+'/'});
 // First installation claims the page and reloads it. Wait for the controlled
 // application to settle before running an uninterrupted playback scenario.
 let stable=0;
 for(let i=0;i<900&&stable<10;i++){
  try{
   const ready=await cmd('Runtime.evaluate',{expression:"document.readyState==='complete'&&!!navigator.serviceWorker.controller&&!!window.IFSI_V73?.getVocals?.().length&&!!window.IFSI_V741?.getRegistry?.()",returnByValue:true});
   stable=ready.result?.value===true?stable+1:0;
  }catch(error){
   if(!/navigated or closed|context.*(?:destroyed|not found)|Cannot find context/i.test(error.message))throw error;
   stable=0;
  }
  await pause(100);
 }
 assert.equal(stable,10,'Controlled application did not settle after service worker installation');
 const expr=`(async()=>{
 const sleep=ms=>new Promise(r=>setTimeout(r,ms));const until=async(fn,msg)=>{for(let i=0;i<250;i++){if(fn())return;await sleep(100)}throw Error(msg)};
 await until(()=>window.IFSI_V73?.getVocals?.().some(v=>v.courseId==='psychologie_sociale')&&window.IFSI_V741?.getRegistry?.(),'Application boot');
 const api=window.IFSI_V73,all=api.getVocals(),rows=all.filter(v=>v.courseId==='psychologie_sociale');if(rows.length!==18)throw Error('Expected 18 active audios');
 window.IFSI_V74.openCourse('Psychologie sociale');await sleep(200);
 if(document.querySelectorAll('#v74CourseDetail [data-vocal74]').length!==18)throw Error('Course page does not expose all 18 audio buttons');
 if(window.IFSI_V741.resourcesForCourse('psychologie_sociale').questions.length!==64)throw Error('Course questions lost');
 const links=[...document.querySelectorAll('.v74-approved-downloads a')].map(a=>a.getAttribute('href'));if(links.length!==2||!links.every(p=>p.endsWith('.zip')))throw Error('Student downloads missing');
 const other=all.find(v=>v.courseId!=='psychologie_sociale'&&v.localAudio&&v.mime==='audio/mpeg');if(!other)throw Error('Other theme media missing');
 for(const v of [rows[0],other,rows[17]]){const b=document.querySelector('[data-playlist-add="'+v.id+'"]');if(!b)throw Error('Playlist button missing');b.click();}
 document.getElementById('vocalPlaylistPlay').click();const audio=document.getElementById('vocalAudio');
 await until(()=>!audio.paused&&audio.currentTime>.25,'First track does not play');if(!audio.currentSrc.includes('Psychologie_sociale_Vocal_01.mp3'))throw Error('Wrong direct source');
 await until(()=>audio.readyState>=2&&Number.isFinite(audio.duration),'Duration unavailable');audio.currentTime=audio.duration-.4;await audio.play();
 await until(()=>api.getCurrentId()===other.id&&audio.currentTime>.15&&!audio.paused,'Real ended event did not advance to other theme');
 document.getElementById('vocalPlaylistNext').click();await until(()=>api.getCurrentId()===rows[17].id&&audio.readyState>=2,'Next failed');
 audio.currentTime=12;await sleep(400);document.getElementById('vocalPlaylistPrev').click();await until(()=>api.getCurrentId()===other.id&&audio.readyState>=2,'Previous failed');
 document.getElementById('vocalPlaylistNext').click();await until(()=>api.getCurrentId()===rows[17].id&&audio.currentTime>=11,'Position not restored');
 audio.pause();return {status:'PASS',activeAudios:rows.length,downloadLinks:links,realPlayback:true,realEndedToOtherTheme:true,nextPreviousResume:true,otherTheme:other.course,phoneLockedTest:false};})()`;
 const result=await cmd('Runtime.evaluate',{expression:expr,awaitPromise:true,userGesture:true,returnByValue:true});
 if(result.exceptionDetails)throw Error(result.exceptionDetails.exception?.description||result.exceptionDetails.text);
 assert.equal(result.result.value.status,'PASS');assert.ok(ranges.some(p=>p.includes('Psychologie_sociale_Vocal_01.mp3')),'No HTTP range request');console.log(JSON.stringify({...result.result.value,rangeRequests:ranges.length}));
}finally{ws?.close();child.kill();await new Promise(r=>server.close(r));}
