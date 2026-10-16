import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const glossary=JSON.parse(read('vocabulaire-v1.json'));
const registry=JSON.parse(read('course-registry-v741.json'));
const listeners=new Map(),begun=[],storage=new Map();
const window={IFSI_V741:{getRegistry:()=>registry,rebuildResourceIndex(){}},addEventListener:(n,f)=>listeners.set(n,f),dispatchEvent(){}};
const context={window,Q:[],S:[],I:[],console,Event,CustomEvent:class{},
 document:{getElementById:id=>['v8355Vocab','v8355VocabCss'].includes(id)?{classList:{contains:()=>true},addEventListener(){}}:null},
 localStorage:{getItem:k=>storage.get(k),setItem:(k,v)=>storage.set(k,v)},
 fetch:async()=>({ok:true,json:async()=>glossary}),begin:qs=>begun.push(qs),shuffle:qs=>qs,fill(){}};
vm.createContext(context);
vm.runInContext(read('v8355-vocabulary.js'),context);
await window.IFSI_VOCAB.refresh();
const qs=window.IFSI_VOCAB.questions();
assert.equal(qs.length,glossary.entries.filter(t=>!t.qcmQuestionId).reduce((n,t)=>n+t.courseIds.filter(id=>!t.qcmQuestionIdsByCourse?.[id]).length,0));
assert.equal(new Set(qs.map(q=>q.id)).size,qs.length);
for(const q of qs){
 assert.equal(q.theme,'Vocabulaire');assert.equal(q.difficulty,'easy');
 assert.equal(q.choices.length,4);assert.equal(new Set(q.choices).size,4);
 assert.equal(q.answers.length,1);assert.ok(q.explanation.includes(q.choices[q.answers[0]]));
 assert.equal(q.course,registry.courses.find(c=>c.id===q.courseId).label);
}
// Both async arrival orders and retries must keep vocabulary and classic questions once.
const source=read('index.html');
vm.runInContext(source.slice(source.indexOf('function announceQcmLoad'),source.indexOf('async function loadQcmData')),context);
context.qcmPackData=new Map([[1,[{id:'classic',courseId:'systeme_urinaire'}]]]);
vm.runInContext('hydrateQcm()',context);
assert.equal(context.Q.length,qs.length+1);
vm.runInContext('hydrateQcm();hydrateQcm()',context);
assert.equal(context.Q.length,qs.length+1);
window.IFSI_VOCAB.startCourseQuiz('systeme_urinaire');
assert.ok(begun[0].length>0);assert.ok(begun[0].every(q=>q.courseId==='systeme_urinaire'&&q.theme==='Vocabulaire'));
assert.equal(storage.get('ifsiabc_v7_mode'),'train');
// Standard theme resolver and common filter can discover every associated course.
vm.runInContext(read('qcm-subthemes-v1.js'),context);
for(const courseId of new Set(glossary.entries.flatMap(t=>t.courseIds))){
 const pool=context.Q.filter(q=>q.courseId===courseId&&window.IFSI_QCM_SUBTHEMES.resolve(q)==='Vocabulaire');
 assert.equal(pool.length,glossary.entries.filter(t=>t.courseIds.includes(courseId)&&!t.qcmQuestionId&&!t.qcmQuestionIdsByCourse?.[courseId]).length);
}
// Late glossary arrival must not discard or duplicate classic packs.
const api=window.IFSI_VOCAB;window.IFSI_VOCAB=undefined;
vm.runInContext('hydrateQcm()',context);assert.equal(context.Q.length,1);
window.IFSI_VOCAB=api;vm.runInContext('hydrateQcm()',context);assert.equal(context.Q.length,qs.length+1);
const module=read('v8355-vocabulary.js');
assert.ok(module.includes('id="vgCourseSheet"'));assert.ok(module.includes('id="vgCourseQuiz"'));
assert.ok(!module.includes('vgCourseFlash'));assert.ok(!module.includes('data-vg="flashcards"'));
assert.ok(!module.includes('ifsiabc_vocab_scores_v1'));
console.log(`✅ ${qs.length} QCM de vocabulaire, 45 cours, moteur commun, filtres et hydratation idempotente`);
