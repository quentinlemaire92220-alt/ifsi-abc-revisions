// Real Chromium + production SW. Only the local static server can be contacted.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {chromium} from 'playwright';
const repo=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const root=path.resolve(process.env.IFSI_TEST_ROOT||repo);
const out=path.resolve(process.env.IFSI_BROWSER_OUTPUT||path.join(repo,'test-results/browser-p1'));
const recordOnly=process.argv.includes('--record-only');
fs.mkdirSync(out,{recursive:true});
let releasePack=null,holdPack=false,failFirst=false;
const types={'.html':'text/html','.js':'application/javascript','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.jpg':'image/jpeg','.webmanifest':'application/manifest+json'};
const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost'),name=decodeURIComponent(url.pathname).replace(/^\//,'')||'index.html';
  if(name==='questions-5.json'&&holdPack)await new Promise(resolve=>releasePack=resolve);
  if(name==='questions-1.json'&&failFirst){failFirst=false;res.writeHead(503);res.end('fixture unavailable');return;}
  const target=path.resolve(root,name);
  if(!target.startsWith(root+path.sep)||name.split('/').some(x=>x.startsWith('.'))){res.writeHead(403);res.end();return;}
  const body=await fs.promises.readFile(target);res.writeHead(200,{'Content-Type':types[path.extname(target)]||'text/plain','Cache-Control':'no-store'});res.end(body);
 }catch{res.writeHead(404);res.end();}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port;
let browser,context;
const results=[],external=[],errors=[];
async function check(name,fn){try{const detail=await fn();results.push({name,pass:true,detail});}catch(error){results.push({name,pass:false,error:error.message});}}
async function bank(page){return page.evaluate(()=>({version:window.IFSI_APP_VERSION,total:Q.length,missing:Q.filter(q=>!q.courseId).length,vocabulary:Q.filter(q=>q.kind==='Vocabulaire').length,cards:window.IFSI_V8338_FLASHCARDS.getDeck().length,entryCount:document.querySelector('.fc-entry-actions .fc-pill')?.textContent}));}
const contrast=([r,g,b],[R,G,B])=>{
 const lum=x=>x.map(v=>v/255).map(v=>v<=.04045?v/12.92:((v+.055)/1.055)**2.4).reduce((n,v,i)=>n+v*[.2126,.7152,.0722][i],0);
 const a=lum([r,g,b]),b_=lum([R,G,B]);return (Math.max(a,b_)+.05)/(Math.min(a,b_)+.05);
};
try{
 browser=await chromium.launch({headless:true,...(process.env.IFSI_BROWSER_CHANNEL?{channel:process.env.IFSI_BROWSER_CHANNEL}:{}),chromiumSandbox:true});
 context=await browser.newContext({serviceWorkers:'allow',viewport:{width:375,height:812}});
 await context.route('**/*',route=>{
  const request=route.request();if(new URL(request.url()).origin===origin)return route.continue();
  if(request.url().includes('/rest/v1/analytics_events')){try{external.push(request.postDataJSON());}catch{}}
  // No Drive, Supabase or other external request leaves this isolated browser.
  return route.fulfill({status:204,body:''});
 });
 const page=await context.newPage();page.setDefaultTimeout(10000);page.on('pageerror',e=>errors.push(e.message));
 await page.goto(origin,{waitUntil:'load'});
 await page.waitForFunction(()=>navigator.serviceWorker.controller&&window.IFSI_QCM_LOAD?.status==='ready'&&Q.length===3038&&window.IFSI_V741?.getRegistry?.(),null,{timeout:60000});
 // Use an already active SW, then hold bank 5 until the registry has booted.
 holdPack=true;await page.reload({waitUntil:'domcontentloaded'});
 await page.waitForFunction(()=>window.IFSI_V741?.getRegistry?.()&&Q.length>0&&Q.length<1000,null,{timeout:30000});
 await page.waitForFunction(()=>window.IFSI_QCM_LOAD?.status==='loading');
 assert.ok(releasePack,'Le serveur doit avoir retenu le cinquième pack');
 holdPack=false;releasePack();releasePack=null;
 await page.waitForFunction(()=>window.IFSI_QCM_LOAD?.status==='ready'&&Q.length===3038,null,{timeout:60000});
 await page.locator('#v87Center').click();await page.locator('#fcOpen').waitFor();
 await check('late-bank-full-index',async()=>{
  await page.waitForFunction(()=>window.IFSI_V8338_FLASHCARDS.getDeck().length>1000);
  const state=await bank(page);fs.writeFileSync(path.join(out,'late-bank.json'),JSON.stringify(state,null,2));
  assert.equal(state.missing,0);assert.equal(state.cards,1355);assert.match(state.entryCount,/1355/);return state;
 });
 await page.screenshot({path:path.join(out,'revision.png'),fullPage:true});
 await check('partial-bank-retry',async()=>{
  failFirst=true;await page.reload({waitUntil:'load'});
  await page.waitForFunction(()=>window.IFSI_QCM_LOAD?.status==='partial',null,{timeout:60000});
  await page.locator('#v87Center').click();await page.locator('#v8357Toggle').click();await page.locator('#v8357Retry').click();
  await page.waitForFunction(()=>window.IFSI_QCM_LOAD?.status==='ready'&&Q.length===3038,null,{timeout:60000});
  await page.waitForFunction(()=>window.IFSI_V8338_FLASHCARDS.getDeck().length>1000);
  const state=await bank(page);assert.equal(state.missing,0);assert.equal(state.cards,1355);return state;
 });
 await check('urinary-exercises-visible-and-return',async()=>{
  await page.locator('#v87Home').click();await page.screenshot({path:path.join(out,'home.png'),fullPage:true});
  assert.equal(await page.locator('#ifsiExerciseOpen').isVisible(),true,'Entrée exercices masquée');
  await page.locator('#ifsiExerciseOpen').click();
  for(const [n,value] of [[1,'kidney-right'],[2,'kidney-left'],[3,'ureters'],[4,'bladder'],[5,'urethra']])await page.locator('#ifsi-slot-'+n).selectOption(value);
  await page.locator('#ifsiExSubmit').click();assert.match(await page.locator('#ifsiExResult').innerText(),/5 \/ 5/);
  await page.locator('#ifsiExMatch').click();
  for(const id of ['kidneys','ureters','bladder','urethra']){await page.locator('[data-exleft="'+id+'"]').click();await page.locator('[data-exright="'+id+'"]').click();}
  await page.locator('#ifsiExSubmit').click();assert.match(await page.locator('#ifsiExResult').innerText(),/4 \/ 4/);
  await page.screenshot({path:path.join(out,'exercises.png'),fullPage:true});
  await page.locator('#ifsiExBack').click();assert.equal(await page.locator('#v82Continue').isVisible(),true);return {diagram:5,associations:4};
 });
 await check('settings-dark-contrast-and-widths',async()=>{
  await page.locator('#v87Settings').click();await page.locator('#v87Dark').click();
  const ratios=[];
  for(const width of [320,375,768]){
   await page.setViewportSize({width,height:900});await page.locator('.v87-head').scrollIntoViewIfNeeded();
   const palette=await page.locator('.v87-head').evaluate(el=>{
    const css=getComputedStyle(el),numbers=s=>(s.match(/[\d.]+/g)||[]).map(Number).slice(0,3);
    // The fixed theme uses a solid background. The legacy gradient starts at #f7f3ff.
    const bg=css.backgroundImage!=='none'?[247,243,255]:numbers(css.backgroundColor);
    return {background:bg,title:numbers(getComputedStyle(el.querySelector('h2')).color),copy:numbers(getComputedStyle(el.querySelector('.small')).color)};
   });
   ratios.push({width,title:contrast(palette.title,palette.background),copy:contrast(palette.copy,palette.background)});
   await page.screenshot({path:path.join(out,'dark-'+width+'.png'),fullPage:false});
  }
  await page.setViewportSize({width:320,height:900});await page.evaluate(()=>document.body.style.zoom='2');
  await page.locator('#v87Dark').scrollIntoViewIfNeeded();assert.equal(await page.locator('#v87Dark').isVisible(),true);
  await page.screenshot({path:path.join(out,'dark-zoom200.png')});await page.evaluate(()=>document.body.style.zoom='');
  for(const ratio of ratios){assert.ok(ratio.title>=4.5,JSON.stringify(ratio));assert.ok(ratio.copy>=4.5,JSON.stringify(ratio));}
  await page.locator('#v87Dark').click();return ratios;
 });
 await check('unavailable-drive-links-all-catalogues',async()=>{
  await page.setViewportSize({width:375,height:812});
  const refs=['1mlwgSvyVXpjGpHD3R08nfofWnUJ3MCCy','1jmXbi76eucP42lg4pJLU6MpApjIf1M8e','1dx5oEeYoqkxMMhjT7CFrFW3g98hydUje','1c0LUu4JhXGSO6GeLZCPlWiXb1heS3bL8'];
  await page.evaluate(()=>{showSheets();document.querySelector('#search').value='';renderSheets();});
  await page.waitForFunction(()=>document.querySelector('#sheetList').childElementCount>0);
  // MutationObserver callbacks run before this browser task reads the DOM.
  const state=await page.evaluate(ids=>({broken:ids.filter(id=>document.querySelector('a[href*="'+id+'"]')),notes:document.querySelectorAll('#sheetList [data-resource-unavailable]').length,available:document.querySelectorAll('#sheetList a[href]').length}),refs);
  await page.screenshot({path:path.join(out,'resource-availability.png'),fullPage:true});assert.equal(state.broken.length,0);assert.equal(state.notes,4);assert.ok(state.available>0);
  // Repeat after real course rendering and a dynamic search result.
  await page.evaluate(()=>window.IFSI_V74.openCourse('Compétences psychosociales'));
  assert.equal(await page.locator('#v74CourseDetail a[href*="1dx5oEeYoqkxMMhjT7CFrFW3g98hydUje"]').count(),0);
  return {...state,externalSharingChanged:false};
 });
 await check('math-results-local-only',async()=>{
  external.length=0;await page.evaluate(()=>{window.IFSI_MATH_CASES.startCase(window.IFSI_MATH_CASES.getCatalog()[0].id);window.IFSI_MATH_CASES.open();});
  await page.locator('#ifsiMathSubmit').click();
  // Drain the request task, without a live analytics endpoint.
  await page.evaluate(()=>new Promise(resolve=>setTimeout(resolve,100)));
  const leaks=external.filter(x=>x.event_type==='math_case_complete'||JSON.stringify(x.metadata||{}).match(/"(?:correct|total|score|result)"/));
  fs.writeFileSync(path.join(out,'math-network.json'),JSON.stringify({requests:external,leaks},null,2));assert.equal(leaks.length,0,'Un résultat individuel est préparé pour le réseau');
  return {leaks:leaks.length,localProgress:await page.evaluate(()=>Boolean(localStorage.getItem('ifsiabc_math_cases_progress_v1')))};
 });
 await check('offline-cached-revisions',async()=>{
  await context.setOffline(true);
  try{
   await page.reload({waitUntil:'load'});
   await page.waitForFunction(()=>window.IFSI_QCM_LOAD?.status==='ready'&&Q.length===3038,null,{timeout:60000});
   assert.equal(await page.evaluate(()=>navigator.onLine),false);
   await page.locator('#v87Center').click();await page.locator('#fcOpen').waitFor({state:'visible'});
   const state=await bank(page);assert.equal(state.missing,0);assert.equal(state.cards,1355);
   await page.locator('#v87Home').click();await page.locator('#ifsiExerciseOpen').waitFor({state:'visible'});
   return {total:state.total,cards:state.cards,missing:state.missing,exerciseParent:await page.locator('#ifsiExerciseEntry').evaluate(el=>el.parentElement.id)};
  }finally{await context.setOffline(false);}
 });
 await check('no-runtime-errors',async()=>{assert.deepEqual(errors,[]);return {count:errors.length};});
}catch(error){results.push({name:'browser-harness',pass:false,error:error.stack});}
finally{
 if(releasePack)releasePack();await context?.close();await browser?.close();await new Promise(resolve=>server.close(resolve));
 const report={source:JSON.parse(fs.readFileSync(path.join(root,'build-meta.json'),'utf8')).version,browser:'Chromium',serviceWorker:true,externalRequestsSent:0,results,pageErrors:errors};
 fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));
 console.log(JSON.stringify(report,null,2));
 if(!recordOnly&&results.some(x=>!x.pass))process.exitCode=1;
}
