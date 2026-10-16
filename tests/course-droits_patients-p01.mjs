import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {runtimeDeck} from './flashcards-runtime-fixture.mjs';

const read=p=>JSON.parse(fs.readFileSync(p));
const bank=read('qextra-55.txt'),ids=new Set(bank.map(q=>q.id));
const {questions,deck,registry}=await runtimeDeck();
assert.equal(bank.length,85);
assert.equal(ids.size,85);
for(const q of bank){
 const live=questions.find(x=>x.id===q.id);
 assert.ok(live,q.id);
 for(const k of ['question','choices','answers','explanation'])
  assert.deepEqual(JSON.parse(JSON.stringify(live[k])),q[k]);
 for(const c of q.flashcards||[]){
  const actual=deck.find(x=>x.qid===q.id&&x.front===c.front);
  assert.ok(actual,q.id+' carte perdue');
  assert.deepEqual(JSON.parse(JSON.stringify(actual.answers)),c.answers);
  assert.equal(actual.explanation,c.explanation);
 }
}
assert.equal(deck.filter(c=>ids.has(c.qid)).length,69,'Cartes rédigées tronquées');
const termIds=new Set(bank.flatMap(q=>q.vocabularyTermIds||[]));
assert.equal(termIds.size,34);
const terms=read('vocabulaire-v1.json').entries.filter(t=>termIds.has(t.id));
assert.equal(terms.length,34);
for(const term of terms){
 assert.ok(term.courseIds.includes('droits_patients'));
 const qid=term.qcmQuestionIdsByCourse?.droits_patients||term.qcmQuestionId;
 assert.ok(bank.find(q=>q.id===qid)?.vocabularyTermIds.includes(term.id));
 assert.ok(deck.some(c=>c.id==='voc:'+term.id&&c.courseIds.includes('droits_patients')));
}

// Run the real vocabulary module: authored questions must not be duplicated,
// while the shared terms retain their questions in existing courses.
const glossary=read('vocabulaire-v1.json'),started=[];
const win={IFSI_V741:{getRegistry:()=>registry,rebuildResourceIndex(){}},addEventListener(){},dispatchEvent(){}};
const ctx={window:win,Q:bank,console,Event,CustomEvent:class{},
 document:{getElementById:id=>['v8355Vocab','v8355VocabCss'].includes(id)?{classList:{contains:()=>true},addEventListener(){}}:null},
 localStorage:{getItem:()=>null,setItem(){}},fetch:async()=>({ok:true,json:async()=>glossary}),
 begin:q=>started.push(q),shuffle:q=>q,fill(){}};
vm.createContext(ctx);
vm.runInContext(fs.readFileSync('v8355-vocabulary.js','utf8'),ctx);
await win.IFSI_VOCAB.refresh();
const generated=win.IFSI_VOCAB.questions();
assert.equal(generated.filter(q=>q.courseId==='droits_patients').length,0);
for(const id of ['jurisprudence','secret-professionnel','consentement-libre-et-eclaire'])
 assert.ok(generated.some(q=>q.courseId==='introduction_droit'&&q.vocabularyTermId===id));
win.IFSI_VOCAB.startCourseQuiz('droits_patients');
assert.equal(started.length,1);
assert.equal(started[0].length,10);
assert.ok(started[0].every(q=>ids.has(q.id)&&q.vocabularyTermIds?.some(id=>termIds.has(id))));

// Scope the preservation snapshot to first publication, so later approved
// deliveries may update other courses without a frozen global question count.
const base=process.env.IFSI_BASE_SHA||'HEAD^';
const oldRegistry=JSON.parse(execFileSync('git',['show',base+':course-registry-v741.json'],{encoding:'utf8'}));
if(!oldRegistry.courses.some(c=>c.id==='droits_patients')){
 const baseline=read('tests/course-droits_patients-p01-baseline.json');
 for(const [course,expected]of Object.entries(baseline)){
  const qs=questions.filter(q=>q.courseId===course).map(q=>({id:q.id,question:q.question,choices:q.choices,answers:q.answers,explanation:q.explanation})).sort((a,b)=>a.id.localeCompare(b.id));
  assert.equal(qs.length,expected.count,course);
  assert.equal(createHash('sha256').update(JSON.stringify(qs)).digest('hex'),expected.sha256,course+' modifié');
 }
 const oldTerms=JSON.parse(execFileSync('git',['show',base+':vocabulaire-v1.json'],{encoding:'utf8'})).entries;
 for(const id of ['jurisprudence','secret-professionnel','consentement-libre-et-eclaire']){
  const old=oldTerms.find(t=>t.id===id),current=terms.find(t=>t.id===id);
  for(const key of ['term','definition','distinction','etymologie','theme','sourceType'])
   assert.deepEqual(current[key],old[key],id+' métadonnée commune modifiée');
  for(const course of old.courseIds)assert.ok(current.courseIds.includes(course));
 }
}
assert.ok(!/PLAUD|transcriptions?|Sources privées|C:[\\/]Users/i.test(JSON.stringify(bank)));
console.log('✅ Droits des patients p01 : 85 QCM identiques, 69 cartes + 34 définitions, vocabulaire sans doublon et cours voisins préservés.');
