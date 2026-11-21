import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const index=fs.readFileSync('index.html','utf8');
const access=fs.readFileSync('v8357-qcm-access.js','utf8');
const worker=fs.readFileSync('sw.js','utf8');
const boot=index.slice(index.indexOf("window.IFSI_QCM_LOAD={"),index.indexOf('\nfunction fill(){'));
assert.ok(boot.startsWith('window.IFSI_QCM_LOAD='),'Initialisation du statut des QCM absente');
assert.match(worker,/async function fetchQcmPacks\(names,label\)/,'Chargement des packs en parallèle manquant');
assert.match(worker,/offset\+=6/,'La concurrence des chargements doit être limitée');
assert.match(access,/window.addEventListener\('ifsi:qcm-load'/,'Le formulaire doit réagir à la fin du chargement');
assert.match(access,/window.IFSI_QCM_RELOAD\?\.\(\)/,'Le bouton doit permettre un nouvel essai');
let finishPack5;
const pack5=new Promise(resolve=>finishPack5=resolve);
let missingPack3=true,updates=0;
const timers=new Map(),requests=[];
const nextTurn=()=>new Promise(resolve=>setImmediate(resolve));
const ctx={
 Q:[],S:[],I:[],console:{warn(){}},
 setTimeout(fn,delay){timers.set(delay,fn);return delay},clearTimeout(id){timers.delete(id)},
 CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail}},
 window:{dispatchEvent(e){updates++;this.last=e.detail}},
 $:()=>null,
 fill:()=>{},
 renderSheets:()=>{},
 renderInfographics:()=>{},
 fetch:async(path)=>{
   const q=/questions-(\d+)\.json/.exec(path);
   if(q){
     requests.push(path);
     const n=Number(q[1]);
     if(n===5)await pack5;
     if(n===3&&missingPack3)throw Error('Connexion momentanément coupée');
     return {ok:true,json:async()=>[{id:'qcm_'+n,course:'Cours '+n,theme:'Cours '+n,choices:['a','b','c','d'],answers:[0],explanation:'Explication'}]};
   }
   throw Error('Ressource pédagogique indisponible');
 }
};
vm.createContext(ctx);vm.runInContext(boot,ctx);
await vm.runInContext('boot()',ctx);
assert.deepEqual(requests,[],'Les packs QCM ne doivent pas partir avec les fiches');
assert.equal(timers.size,1);
const fallback=[...timers.values()][0];
fallback();
const pending=ctx.window.IFSI_QCM_ENSURE();
assert.equal(timers.size,0);
await nextTurn();
assert.equal(requests.length,5,'Le secours et les appels explicites partagent le même chargement');
assert.equal(ctx.window.IFSI_QCM_LOAD.status,'loading');
assert.equal(ctx.Q.length,3,'Les QCM disponibles doivent apparaître AVANT la fin du pack lent');
assert.ok(updates>=3,'Le nombre de QCM doit être rafraîchi au fil de l’eau');
finishPack5();await pending;
assert.equal(ctx.window.IFSI_QCM_LOAD.status,'partial');
assert.equal(ctx.Q.length,4,'Les fiches et infographies indisponibles ne doivent pas masquer les QCM');
assert.deepEqual(Array.from(ctx.window.IFSI_QCM_LOAD.failed),[3]);
missingPack3=false;
await vm.runInContext('window.IFSI_QCM_RELOAD()',ctx);
assert.equal(ctx.window.IFSI_QCM_LOAD.status,'ready');
assert.equal(ctx.Q.length,5,'Le bouton de reprise doit retrouver les questions manquantes');
assert.equal(new Set(ctx.Q.map(q=>q.id)).size,5);
console.log('✅ Chargement progressif : affichage avant la fin du pack 5, ressources indépendantes et reprise réussie');

// Simuler les trois signaux dans des ordres différents et un clic pendant le délai.
for(const [idleAvailable,explicit] of [[true,false],[false,false],[true,true]]){
 const callbacks=new Map(),events=new Map(),paths=[];
 let sheetsReady, idle, searchReady=false, registryReady=false;
 const sheets=new Promise(resolve=>sheetsReady=resolve);
 const window={
  addEventListener:(name,fn)=>events.set(name,fn),
  IFSI_V741:{getRegistry:()=>registryReady?{courses:[{}]}:null}
 };
 if(idleAvailable){
  window.requestIdleCallback=fn=>{idle=fn;return 1};
  window.cancelIdleCallback=()=>{idle=null};
 }
 const context={
  window,Q:[],I:[],S:[],console,$:id=>id==='v813Search'&&searchReady?{oninput(){}}:null,
  fill(){},renderSheets(){},renderInfographics(){},
  setTimeout(fn,delay){callbacks.set(delay,fn);return delay},clearTimeout(id){callbacks.delete(id)},
  fetch:async path=>{
   if(path.includes('questions'))paths.push(path);
   if(path.includes('sheets'))await sheets;
   return {ok:true,json:async()=>[{id:path}]};
  }
 };
 vm.createContext(context);vm.runInContext(boot,context);
 const resources=vm.runInContext('boot()',context);
 const fallbackDelay=Math.max(...callbacks.keys());
 if(explicit){sheetsReady();await resources}
 registryReady=true;events.get('ifsi:v741-ready')();
 searchReady=true;events.get('ifsi:search-mounted')();
 if(!explicit){assert.equal(callbacks.size,1);sheetsReady();await resources}
 assert.deepEqual(paths,[]);assert.equal(callbacks.size,2);
 const grace=Math.min(...callbacks.keys());callbacks.get(grace)();
 if(idleAvailable){
  assert.deepEqual(paths,[]);
  if(explicit){window.IFSI_QCM_ENSURE();assert.equal(idle,null)}
  else idle();
 }
 await window.IFSI_QCM_ENSURE();
 assert.equal(callbacks.has(fallbackDelay),false);
 assert.equal(paths.length,5);assert.equal(window.IFSI_QCM_LOAD.status,'ready');
}
console.log('✅ Priorité aux fiches, démarrage en arrière-plan et priorité à la demande');

const elements=new Map(),element=()=>({innerHTML:'',value:'all',textContent:'',disabled:false});
for(const id of ['v8357QcmCard','v8357Domain','v8357Course','v8357Theme','v8357Difficulty','v8357Source','v8357Count','v8357Mode','v8357Available','v8357Launch'])elements.set(id,element());
const ui={
 Q:[],
 window:{IFSI_QCM_LOAD:{status:'loading',count:0,failed:[]},IFSI_V741:{getRegistry:()=>({courses:[]})},IFSI_V79:{themeOf:q=>q.theme,difficultyOf:q=>q.difficulty}},
 document:{getElementById:id=>elements.get(id)},
 console
};
vm.createContext(ui);
const beforeCss=access.slice(0,access.indexOf('function css(){')).replace("(()=>{'use strict';","'use strict';");
vm.runInContext(beforeCss,ui);
vm.runInContext('populate()',ui);
assert.match(elements.get('v8357Available').textContent,/Chargement des QCM/);
assert.match(elements.get('v8357Launch').textContent,/Chargement/);
assert.equal(elements.get('v8357Launch').disabled,true);
ui.Q=[{id:'loaded',courseId:'resp',course:'Respiration',theme:'Ventilation',difficulty:'easy',choices:['a','b','c','d'],answers:[0]}];
ui.window.IFSI_QCM_LOAD={status:'ready',count:1,failed:[]};
vm.runInContext('populate()',ui);
assert.equal(elements.get('v8357Available').textContent,'1 question disponible');
assert.equal(elements.get('v8357Launch').disabled,false);
ui.Q=[];ui.window.IFSI_QCM_LOAD={status:'error',count:0,failed:[1,2,3,4,5]};
vm.runInContext('populate()',ui);
assert.match(elements.get('v8357Launch').textContent,/Réessayer/);
assert.equal(elements.get('v8357Launch').disabled,false);
console.log('✅ UI Android : chargement ≠ 0 question, bouton activé dès disponibilité et reprise visible');
