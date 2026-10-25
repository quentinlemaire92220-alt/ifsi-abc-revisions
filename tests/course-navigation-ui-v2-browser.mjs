import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {resolve} from 'node:path';
import {pathToFileURL} from 'node:url';
const fixture=pathToFileURL(resolve('tests/fixtures/course-navigation-v2-browser.html')).href;
const binNames=['google-chrome','google-chrome-stable','chromium','chromium-browser'];
let browser='';
for(const candidate of binNames){
  try{const where=execFileSync('which',[candidate],{encoding:'utf8'}).trim();if(where){browser=where;break}}catch{}
}
assert.ok(browser,'Aucun Chromium/Chrome disponible sur le runner : test navigateur non exécuté');
const opts=[
  '--headless=new','--no-sandbox','--disable-dev-shm-usage','--disable-gpu','--no-first-run',
  '--allow-file-access-from-files','--disable-background-timer-throttling','--disable-renderer-backgrounding',
  '--run-all-compositor-stages-before-draw','--virtual-time-budget=7000','--dump-dom',fixture
];
let html;
try{
  html=execFileSync(browser,opts,{encoding:'utf8',timeout:40000,maxBuffer:8*1024*1024,stdio:['ignore','pipe','pipe']});
}catch(e){
  throw new Error('Contrôle Chrome bloqué : '+String(e.message).slice(0,350)+
    '\n'+String(e.stderr||'').slice(-1200));
}
const result=html.match(/<output\b[^>]*id="testResult"[^>]*data-result="([^"]+)"[^>]*>([\s\S]*?)<\/output>/i);
assert.ok(result,'Le résultat du test de rendu Chrome est absent');
assert.equal(result[1],'pass','Le navigateur signale une régression : '+result[2].replace(/<[^>]+>/g,'').slice(0,1500));
console.log('✅ Navigateur réel : '+result[2].replace(/<[^>]+>/g,'').trim());
