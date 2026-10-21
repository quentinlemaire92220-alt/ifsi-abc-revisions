import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const core=read('pathologies-module-v1.js'),privateJs=read('pathologies-private-review-v1.js');
function between(a,b){const i=core.indexOf(a),j=core.indexOf(b,i+a.length);assert.ok(i>=0&&j>i,'Missing function: '+a);return core.slice(i,j);}
let elements={},navigationToCourses=0,catalogShown=0;
function makeElement(id){
 const e={id,dataset:{},files:[],onclick:null,onchange:null,textContent:'',addEventListener(ev,fn){this['on'+ev]=fn;},
  querySelectorAll(selector){
   if(selector==='[data-patho-course]')return [];
   if(selector==='[data-private-tab]'){
    return [...(this.innerHTML.matchAll(/data-private-tab="([^"]+)"/g))].map(m=>({dataset:{privateTab:m[1]},onclick:null}));
   }
   if(selector==='[data-private-move]'){
    return [...(this.innerHTML.matchAll(/data-private-move="([^"]+)"/g))].map(m=>({dataset:{privateMove:m[1]},onclick:null}));
   }
   return [];
  }
 };
 let html='';
 Object.defineProperty(e,'innerHTML',{get(){return html;},set(v){
  html=String(v);
  for(const m of html.matchAll(/id="([^"]+)"/g)){
   elements[m[1]]=makeElement(m[1]);
   if(m[1]==='pathoReviewImport'){
    const attr=html.slice(m.index,m.index+110).match(/data-patho-id="([^"]+)"/);
    elements[m[1]].dataset.pathoId=attr?.[1]||'';
   }
  }
 }});
 return e;
}
const host=makeElement('ifsiPathologiesBody');elements.ifsiPathologiesBody=host;
const document={getElementById(id){return elements[id]||null;}};
const window={document,IFSI_PATHOLOGIES:{showCatalog(){catalogShown++;}},IFSI_V82:{openSystem(){navigationToCourses++;}}};
const ctx={window,root:window,console};
vm.createContext(ctx);
vm.runInContext(privateJs,ctx);
const p1="const P1_CATALOG=[{id:'bpco',title:'BPCO',system:'Respiratoire',courseId:'systeme_respiratoire'},{id:'hta',title:'HTA',system:'Cardiovasculaire',courseId:'systeme_cardiovasculaire'},{id:'dt2',title:'Diabète de type 2',system:'Endocrinien',courseId:'systeme_endocrinien'}];";
const utility="let pendingId=null,state={id:null};const esc=x=>String(x);const action=(label,attr)=>'<button '+attr+'>'+label+'</button>';function byId(id){return root.document.getElementById(id);}function list(){}function openLinkedCourse(id){root.IFSI_V82.openSystem(id);}globalThis.showDraft=showPending;";
vm.runInContext(p1+'\n'+between('function showPending(id){','function list(){')+'\n'+utility,ctx);
const keys=['definition','physiopathologie','riskFactors','clinicalSigns','diagnosis','treatments','nursingCare','monitoring','complications','keywords'];
const fictive=id=>({id,title:'Fictive '+id,sections:Object.fromEntries(keys.map(k=>[k,'Texte de test fictif'])),
 posterPages:Array.from({length:6},(_,i)=>({number:i+1,title:'Fictive '+(i+1),alt:'Illustration fictive',image:'data:image/webp;base64,AAAA'})),
 qcm:Array.from({length:24},(_,i)=>({id:'q'+i,prompt:'Fictif ?',options:['A','B','C','D'],correct:[1],explanation:'Fictif',feedback:['A','B','C','D']})),
 flashcards:Array.from({length:20},(_,i)=>({id:'f'+i,front:'Fictive ?',back:'Réponse de test'})),
 cases:[{id:'c1',title:'Situation fictive',context:'Situation fictive',steps:Array.from({length:8},(_,i)=>({id:'s'+i,prompt:'Fictif ?',options:['A','B','C','D'],correct:1,explanation:'Test'}))}]
});
const pack={schema:'ifsi-abc-private-pathologies-p1-v1',reviewOnly:true,publicationPermitted:false,clinicalReview:'pending',items:['bpco','hta','dt2'].map(fictive)};
assert.equal(window.IFSI_PATHOLOGIES_REVIEW.valid(pack),true);
ctx.showDraft('bpco');
assert.ok(host.innerHTML.includes('Ouvrir mes supports Pathologies'),'The real disease page must offer import, not send users to courses');
assert.ok(host.innerHTML.includes('pathoReviewImport'),'Import missing inside BPCO page');
assert.ok(host.innerHTML.includes('<details'),'The course link must be a collapsed secondary action');
assert.equal(navigationToCourses,0);
const fileInput=elements.pathoPrivateFile;
assert.ok(typeof fileInput?.onchange==='function','File picker not connected');
const json=JSON.stringify(pack);
fileInput.files=[{size:json.length,text:async()=>json}];
await fileInput.onchange();
assert.equal(window.IFSI_PATHOLOGIES_REVIEW.has('bpco'),true);
assert.ok(host.innerHTML.includes('Aperçu personnel — NON VALIDÉ MÉDICALEMENT'),'Imported BPCO must open on the same page');
assert.ok(host.innerHTML.includes('Planche 1 / 6'),'First master sheet not displayed');
assert.ok(host.innerHTML.includes('data:image/webp;base64,AAAA'),'Imported graphics must render from local data');
assert.equal(navigationToCourses,0,'Import must not navigate to the IFSI course');
ctx.showDraft('hta');
assert.ok(host.innerHTML.includes('Fictive hta'),'Clicking HTA after import must open the HTA page');
assert.ok(!host.innerHTML.includes('Ouvrir le cours IFSI'),'No course link should replace the private content');
ctx.showDraft('dt2');
assert.ok(host.innerHTML.includes('Fictive dt2'),'DT2 must also open its own page');
assert.equal(navigationToCourses,0);
assert.equal(catalogShown,0,'Importing from a disease page must not redirect back to catalog');
console.log('✅ Parcours simulé import JSON → BPCO/HTA/DT2 → planches : aucun renvoi vers les cours.');
