import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(p,'utf8');
const inline=read('index.html');
const between=(source,start,end)=>source.slice(source.indexOf(start),source.indexOf(end,source.indexOf(start)));
// Execute real refresh/validation functions with legacy controls removed by the modern UI.
const cls=()=>({values:new Set(),add(x){this.values.add(x)},remove(x){this.values.delete(x)},toggle(x,on){if(on)this.add(x);else this.remove(x)},contains(x){return this.values.has(x)}});
const nodes=new Map();
const node=()=>({classList:cls(),textContent:'',innerHTML:'',children:[],append(...xs){this.children.push(...xs)},style:{}});
for(const id of ['nq','na','ne','rate','exp','valid','next'])nodes.set(id,node());
for(let j=0;j<4;j++){const n=node(),input={disabled:false};n.querySelector=()=>input;nodes.set('c'+j,n)}
const q={id:'sample',course:'Respiratoire',theme:'Ventilation',choices:['A','B','C','D'],answers:[0,1],explanation:'Deux bonnes réponses.'};
let saved={answered:0,correct:0,errors:[],themes:{}};
const ctx={Q:[q],session:[q],i:0,done:false,res:[],$:id=>nodes.get(id)||null,st:()=>saved,save:x=>{saved=x},uniq:a=>[...new Set(a)],same:(a,b)=>JSON.stringify(a)===JSON.stringify(b),document:{querySelectorAll:()=>[{value:'0'},{value:'1'}],createElement:node},alert:()=>{throw Error('Unexpected alert')}};
vm.createContext(ctx);
vm.runInContext(between(inline,'function fill(){','function qTheme('),ctx);
vm.runInContext(between(inline,'function answerLettersBase(','function nextQ('),ctx);
vm.runInContext('validateQ()',ctx);
assert.equal(saved.answered,1);assert.equal(saved.correct,1);assert.deepEqual(ctx.res,[true]);
assert.equal(nodes.get('na').textContent,1);
assert.ok(nodes.get('c0').querySelector().disabled);
vm.runInContext('validateQ()',ctx);assert.equal(saved.answered,1,'Double validation comptée deux fois');
// Navigation must hide every direct screen, including extensions unknown to the old lists.
const screens=['home','quiz','course74','courses74','favorites74','v8338Flashcards','v8355Vocabulary','settings87','futureExtension'].map(id=>({id,classList:cls()}));
const w={show:id=>screens.find(s=>s.id===id)?.classList.remove('hidden')};
const navctx={window:w,$74:id=>screens.find(s=>s.id===id),document:{querySelectorAll:s=>s==='.app > section'?screens:[]},showPatched74:false,renderDashboard74:()=>{}};
vm.createContext(navctx);vm.runInContext(between(read('v74-pack.js'),'function patchShow74(){','function injectSearch74(){'),navctx);vm.runInContext('patchShow74()',navctx);
for(const target of ['course74','quiz','home']){screens.forEach(s=>s.classList.remove('hidden'));w.show(target);assert.deepEqual(screens.filter(s=>!s.classList.contains('hidden')).map(s=>s.id),[target])}
// Real flashcard engine: the same QCM is indexed by its parent and sub-course.
const courses=[{id:'parent',label:'Cours parent'},{id:'child',label:'Sous-cours'}];
const question={id:'shared',question:'Que signifie la dyspnée ?',courseId:'child',course:'Sous-cours',theme:'Respiration',difficulty:'easy',choices:['Une gêne respiratoire ressentie','Un arrêt cardiaque','Une hausse de température','Une anomalie osseuse'],answers:[0],explanation:'La dyspnée est une gêne respiratoire ressentie par la personne.'};
const window={IFSI_V741:{getRegistry:()=>({courses}),resourcesForCourse:()=>({questions:[question],sheets:[]})},IFSI_V79:{themeOf:q=>q.theme,difficultyOf:q=>q.difficulty}};
const fcctx={window,localStorage:{getItem:()=>null,setItem:()=>{}},document:{getElementById:()=>null,querySelector:()=>null,querySelectorAll:()=>[]},setInterval:()=>0,clearInterval:()=>{},setTimeout:()=>0,clearTimeout:()=>{},scrollTo:()=>{},MutationObserver:class{observe(){}},console};
vm.createContext(fcctx);vm.runInContext(read('v8338-flashcards.js'),fcctx);
const deck=window.IFSI_V8338_FLASHCARDS.rebuild();assert.ok(deck.length,'Fixture must generate cards');
assert.equal(new Set(deck.map(c=>c.id)).size,deck.length,'Identifiants flashcards dupliqués');
for(const card of deck){assert.equal(card.id,'fc:shared','Clé historique de progression modifiée');assert.deepEqual(Array.from(card.courseIds).sort(),['child','parent'])}
// Changelog classification and dates must use the current release metadata.
const news=read('v8312-home-revision.js');
const newsctx={window:{IFSI_APP_VERSION:'8.30.64'},document:{getElementById:()=>null}};vm.createContext(newsctx);
vm.runInContext(news.slice(0,news.indexOf('let newsExpanded')).replace("(()=>{'use strict';",''),newsctx);
vm.runInContext(between(news,'function inferMeta(','function badgeHtml('),newsctx);
assert.equal(vm.runInContext("inferMeta('v8362Change','Flashcards et notions atomiques').type",newsctx),'app');
assert.equal(vm.runInContext("inferMeta('v8359Change','8 fiches de maths').type",newsctx),'resource');
assert.equal(vm.runInContext("dateForTitle('V8.30.63 — Fiabilité des QCM')",newsctx),'09/10/2026');
console.log('✅ Parcours : validation sans champs legacy, navigation exclusive, flashcards multi-cours uniques, dates et classement des nouveautés');

// Modern search has replaced both legacy buttons; the old timer must leave it alone.
const searchContext={document:{getElementById:id=>id==='v76Home'?{}:id==='v86Tools'?{dataset:{v813:'1'}}:null}};
vm.createContext(searchContext);vm.runInContext("const $=id=>document.getElementById(id);"+between(read('v86-home-clean.js'),'function tools(){','function dialog(){'),searchContext);vm.runInContext('tools()',searchContext);
assert.equal(vm.runInContext("inferMeta('v8339Change','Flashcards et objectifs mieux intégrés. Vocaux disponibles').type",newsctx),'app');
console.log('✅ Recherche moderne conservée, ancien panneau vocaux classé dans les évolutions');

// A query entered before registry readiness must refresh without another keystroke.
const searchNodes=new Map([['v813css',{}],['v86Tools',{dataset:{v813:'1'}}],['v813Search',{value:'respiratoire'}],['v813Results',{innerHTML:''}],['v813Quick',{innerHTML:''}]]);
let loadedCourses=[];const events={};
const discoveryWindow={IFSI_V741:{getRegistry:()=>({courses:loadedCourses}),resourcesForCourse:()=>({questions:[{}],vocals:[{},{}]})},addEventListener:(name,fn)=>events[name]=fn};
const discoveryContext={window:discoveryWindow,document:{getElementById:id=>searchNodes.get(id),querySelectorAll:()=>[]},setInterval:()=>0,clearInterval:()=>{},requestAnimationFrame:fn=>fn()};
vm.createContext(discoveryContext);vm.runInContext(read('v813-home-discovery.js'),discoveryContext);
discoveryWindow.IFSI_V813.apply();assert.match(searchNodes.get('v813Results').innerHTML,/Aucun cours/);
loadedCourses=[{id:'resp',label:'Système respiratoire'}];events['ifsi:v741-ready']();
assert.equal(searchNodes.get('v813Search').value,'respiratoire');
assert.match(searchNodes.get('v813Results').innerHTML,/Système respiratoire/);
assert.match(searchNodes.get('v813Results').innerHTML,/2 vocaux/);
assert.doesNotMatch(searchNodes.get('v813Results').innerHTML,/vocalaux|Aucun cours/);
console.log('✅ Recherche saisie avant chargement actualisée et pluriel vocaux correct');

// Result observers re-enter rendering after DOM updates: the existing report must survive.
let report=null,reportWrites=0;const bumps=[];const reportButtons={v81Errors:{},v81Low:{},v81HubBtn:{}};
const resultCard={querySelector:()=>report,appendChild:n=>{report=n;reportWrites++}};
const resultContext={session:[{id:'test',theme:'Respiration',difficulty:'easy'}],res:[true],last:'',bump:(...x)=>bumps.push(x),document:{querySelector:()=>resultCard,createElement:()=>({dataset:{},remove(){report=null}})},$:id=>reportButtons[id],T:q=>q.theme,D:q=>q.difficulty,E:s=>s,showHub:()=>{},start:()=>{},SH:a=>a,pick:a=>a,QQ:()=>[]};
vm.createContext(resultContext);vm.runInContext(between(read('v81-suite.js'),'function result(){','function homeMini(){'),resultContext);
vm.runInContext('result()',resultContext);const firstReport=report,firstHandler=reportButtons.v81HubBtn.onclick;
for(let i=0;i<10;i++)vm.runInContext('result()',resultContext);
assert.equal(reportWrites,1,'Le bilan se reconstruit en boucle');assert.equal(report,firstReport);assert.equal(reportButtons.v81HubBtn.onclick,firstHandler);assert.equal(bumps.length,2,'Session recomptée');
resultContext.res=[false];vm.runInContext('result()',resultContext);
assert.equal(reportWrites,2,'Un résultat réellement modifié doit être recalculé');assert.match(report.innerHTML,/Mes erreurs \(1\)/);
console.log('✅ Bilan stable lors des notifications DOM, boutons conservés, résultat modifié recalculé');
