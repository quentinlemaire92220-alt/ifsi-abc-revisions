import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const sw=fs.readFileSync('sw.js','utf8');
const workerSource=sw.slice(0,sw.indexOf("self.addEventListener('install'"));
let transientFailure=true;
const calls=new Map();
const worker={
 Response,Blob,DecompressionStream,TextDecoder,Uint8Array,atob,
 console:{log(){},error(){},warn(){}},
 caches:{match:async()=>null},
 fetch:async name=>{
  name=String(name);calls.set(name,(calls.get(name)||0)+1);
  if(name==='./qextra-17.txt'&&transientFailure)throw Error('coupure réseau transitoire');
  return new Response(JSON.stringify([{id:'fixture_'+name.replace(/\W/g,'_'),choices:['A','B','C','D'],answers:[0],explanation:'Explication autonome suffisamment claire.'}]));
 }
};
vm.createContext(worker);vm.runInContext(workerSource,worker);
const expected=vm.runInContext('ALL_EXTRA_NAMES.length',worker);
const first=await vm.runInContext('loadExtras()',worker);
assert.equal(first.status,'partial');
assert.equal(first.expected,expected);
assert.equal(first.loaded,expected-1);
assert.deepEqual(Array.from(first.failed),['./qextra-17.txt']);
for(const [name,count] of calls)assert.equal(count,1,`Premier chargement répété pour ${name}`);

transientFailure=false;
const second=await vm.runInContext('loadExtras()',worker);
assert.equal(second.status,'ready');
assert.equal(second.loaded,expected);
assert.deepEqual(Array.from(second.failed),[]);
assert.equal(calls.get('./qextra-17.txt'),2,'Le pack en échec doit être retenté');
for(const [name,count] of calls)if(name!=='./qextra-17.txt')assert.equal(count,1,`Le pack déjà chargé ne doit pas être retéléchargé : ${name}`);
await vm.runInContext('loadExtras()',worker);
assert.equal(calls.get('./qextra-17.txt'),2,'La banque complète ne doit pas être rechargée');
for(const token of ["X-IFSI-QCM-Status","X-IFSI-QCM-Failed-Packs","X-IFSI-QCM-Loaded-Packs","X-IFSI-QCM-Expected-Packs"])assert.ok(sw.includes(token),`En-tête de diagnostic absent : ${token}`);
assert.match(sw,/BASE_ASSETS\.filter\(name=>!ALL_EXTRA_NAMES\.includes\(name\)\)/,'Les packs QCM optionnels ne doivent pas bloquer l’installation du Service Worker');
assert.match(sw,/Promise\.all\(ALL_EXTRA_NAMES\.map\(async name=>\{try\{await cache\.add\(name\)\}catch/,'Le préchargement des packs optionnels doit tolérer un échec isolé');

const index=fs.readFileSync('index.html','utf8');
const boot=index.slice(index.indexOf('window.IFSI_QCM_LOAD={'),index.indexOf('\nfunction fill(){'));
let extrasPartial=true;
const page={
 Q:[],S:[],I:[],console:{warn(){}},
 CustomEvent:class{constructor(type,options){this.type=type;this.detail=options.detail}},
 window:{dispatchEvent(e){this.last=e.detail}},$(){return null},fill(){},renderSheets(){},renderInfographics(){},
 fetch:async path=>{
  const match=/questions-(\d+)\.json/.exec(path);
  if(!match)throw Error('ressource annexe indisponible dans le fixture');
  const n=Number(match[1]),headers=new Headers();
  if(n===5){headers.set('X-IFSI-QCM-Status',extrasPartial?'partial':'ready');headers.set('X-IFSI-QCM-Failed-Packs',extrasPartial?'qextra-17.txt':'')}
  return new Response(JSON.stringify([{id:'base_'+n,course:'Cours',theme:'Thème',choices:['A','B','C','D'],answers:[0],explanation:'Correction'}]),{headers});
 }
};
vm.createContext(page);vm.runInContext(boot,page);
await vm.runInContext('boot()',page);
assert.equal(page.window.IFSI_QCM_LOAD.status,'partial');
assert.deepEqual(Array.from(page.window.IFSI_QCM_LOAD.failed),['qextra-17.txt']);
extrasPartial=false;
await vm.runInContext('window.IFSI_QCM_RELOAD()',page);
assert.equal(page.window.IFSI_QCM_LOAD.status,'ready');
assert.deepEqual(Array.from(page.window.IFSI_QCM_LOAD.failed),[]);

const access=fs.readFileSync('v8357-qcm-access.js','utf8');
assert.match(access,/\.v8357-qcm-footer \[hidden\]\{display:none!important\}/,'Le bouton de reprise masqué ne doit pas être réaffiché par le style .btn');
const element=()=>({innerHTML:'',value:'all',textContent:'',disabled:false,hidden:true});
const elements=new Map();
for(const id of ['v8357QcmCard','v8357Domain','v8357Course','v8357Theme','v8357Difficulty','v8357Count','v8357Mode','v8357Available','v8357Launch','v8357Retry'])elements.set(id,element());
const ui={
 Q:[{id:'q1',courseId:'c1',course:'Cours',theme:'Thème',difficulty:'easy',choices:['A','B','C','D'],answers:[0]}],
 window:{IFSI_QCM_LOAD:{status:'partial',count:1,failed:['qextra-17.txt']},IFSI_V741:{getRegistry:()=>({courses:[]})},IFSI_V79:{themeOf:q=>q.theme,difficultyOf:q=>q.difficulty}},
 document:{getElementById:id=>elements.get(id)},console
};
vm.createContext(ui);
vm.runInContext(access.slice(0,access.indexOf('function css(){')).replace("(()=>{'use strict';","'use strict';"),ui);
vm.runInContext('populate()',ui);
assert.match(elements.get('v8357Available').textContent,/banque partielle : 1 pack à récupérer/);
assert.equal(elements.get('v8357Retry').hidden,false);
assert.equal(elements.get('v8357Launch').disabled,false,'Les QCM déjà chargés restent utilisables');

console.log('✅ QCM partiels : état visible, en-têtes SW et reprise ciblée du seul pack en échec');
