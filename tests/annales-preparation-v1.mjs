import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {validateAnnales} from '../tools/check-annales-import.mjs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const qcm=read('v8357-qcm-access.js'),flash=read('v8338-flashcards.js');
for(const token of ["source:'all'","sourceOf(q)===state.source",'v8357Source','Annales Paris-Saclay 2025','source:state.source'])
 assert.ok(qcm.includes(token),'Filtre annales incomplet : '+token);
for(const token of ["sourceKind:q.sourceKind||null","sourceCaption:q.sourceCaption||null","q.sourceKind==='annales_privees_2025'?false",'selectCards(normalCards,40)','selectCards(annalesCards,annalesCards.length)','card.sourceCaption'])
 assert.ok(flash.includes(token),'Cartes issues des annales absentes : '+token);
const source=qcm.split('\n').find(x=>x.trim().startsWith('const sourceOf=q=>'));
const pool=qcm.split('\n').find(x=>x.startsWith('function pool(){'));
assert.ok(source&&pool,'Sélection QCM introuvable');
const examples=[{id:'ancien',courseId:'cours',sourceKind:null},{id:'annale',courseId:'cours',sourceKind:'annales_privees_2025'}];
const context={questions:()=>examples,state:{course:'all',theme:'all',difficulty:'all',domain:'all',source:'annales2025'},courseIdOf:q=>q.courseId,themeOf:()=> 'Général',difficultyOf:()=> 'medium',domainOf:()=> 'B'};
vm.runInNewContext(source+'\n'+pool+'\nthis.result=pool().map(x=>x.id)',context);
assert.deepEqual(Array.from(context.result),['annale'],'Le filtre origine mélange des sources');
const registry={courses:[{id:'cours'}]};
const valid={id:'ann25_21_001',sourceKind:'annales_privees_2025',sourceOriginalId:'ANN2025_UE21_001',sourceCaption:'Inspiré des annales Paris-Saclay 2025',sourcePage:2,courseId:'cours',theme:'Biologie cellulaire',question:'Quelle proposition est correcte ?',choices:['A définition','B contexte','C contrôle','D erreur','E comparaison'],answers:[0],explanation:'La première proposition est correcte et les autres ne conviennent pas.',reviewState:'validated',distractorFeedbackVerified:true,releaseApproved:true};
const check=q=>validateAnnales({items:[q]},registry,{publish:true});
assert.equal(check(valid).publishable,true,'Lot validé injustement refusé');
for(const bad of [{...valid,releaseApproved:false},{...valid,courseId:'absent'},{...valid,answers:[0,1,2,3]},{...valid,choices:['X','X','Y','Z','W']},{...valid,reviewState:'draft'},{...valid,theme:'Annales 2025'}])
 assert.equal(check(bad).publishable,false,'Import invalide non bloqué');
console.log('✅ Provenance QCM, sélection des flashcards et refus de publication non validée');
