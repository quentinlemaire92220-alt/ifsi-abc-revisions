import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const src=fs.readFileSync('v74-pack.js','utf8');
const registry=JSON.parse(fs.readFileSync('course-registry-v741.json','utf8')).courses;
const untouched=JSON.stringify(registry);
const grouping=src.slice(src.indexOf('function catalogUe74('),src.indexOf('function ueOrder74('));
const render=src.slice(src.indexOf('function renderCourses74('),src.indexOf('function showCourses74('));
const grid={innerHTML:'',querySelectorAll:()=>[]};
let term='';
const items=[...registry];
const context={Map,window:{},$74:id=>id==='v74CourseGrid'?grid:{get value(){return term;}},
 allCourses74:()=>items.map(c=>c.label),
 registryCourse74:label=>items.find(c=>c.label===label),
 courseMeta74:label=>{const c=items.find(c=>c.label===label);return {ue:c.ue,domain:c.domain,id:c.id};},
 courseData74:()=>({qs:[{}],sheets:[],infos:[],vs:[],rate:null,err:0}),
 domainName74:x=>x,ueOrder74:x=>['B1','B2','B3'].indexOf(x),norm74:x=>x.toLowerCase(),esc74:x=>String(x)};
vm.createContext(context);vm.runInContext(grouping+render,context);
for(const [input,expected] of [['B1.3','B1'],['B2.1.1','B2'],['B3.2.1.7','B3'],
 [' b1.7 ','B1'],['C1.1','C1'],['D1.1.2','D1'],['B10.1','B10'],['B1x3','B1X3'],['','Autres']])
 assert.equal(context.catalogUe74(input),expected,input);
for(const c of registry.filter(c=>c.domain==='B'))
 assert.ok(['B1','B2','B3'].includes(context.catalogUe74(c.ue)),
  'Un nouveau cours B doit rejoindre B1, B2 ou B3 : '+c.id+' / '+c.ue);
context.renderCourses74();
function domainB(){return grid.innerHTML.match(/<section class="v74-domain-group">[\s\S]*?DOMAINE B<\/span>([\s\S]*?)<\/section>/)?.[1];}
assert.deepEqual([...domainB().matchAll(/class="v74-ue-code">UE ([^<]+)/g)].map(x=>x[1]),['B1','B2','B3']);
assert.equal((grid.innerHTML.match(/data-course74=/g)||[]).length,registry.length,'Chaque cours une fois');
const bCount=registry.filter(c=>c.domain==='B').length;
assert.match(domainB(),new RegExp(bCount+' cours • '+bCount+' QCM'));
for(const [i,ue] of ['B1.8.9','B2.7.6','B3.4.2'].entries())items.push({id:'future'+i,label:'Futur cours '+i,domain:'B',ue});
context.renderCourses74();
assert.deepEqual([...domainB().matchAll(/class="v74-ue-code">UE ([^<]+)/g)].map(x=>x[1]),['B1','B2','B3']);
assert.equal((domainB().match(/data-course74=/g)||[]).length,bCount+3);
term='b2.1.1';context.renderCourses74();
assert.match(grid.innerHTML,/Psychologie sociale/,'Recherche par code détaillé conservée');
assert.match(grid.innerHTML,/UE B2<\/span>/);
assert.doesNotMatch(grid.innerHTML,/UE B2\.1\.1<\/span>/);
assert.equal(JSON.stringify(registry),untouched,'Aucune normalisation destructive du registre');
console.log('PASS : rendu réel B1/B2/B3, futurs codes imbriqués, recherche détaillée, cours et comptages conservés.');
