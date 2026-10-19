import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {runtimeDeck} from './flashcards-runtime-fixture.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const {questions,deck}=await runtimeDeck();
const manifest=read('docs/course-deliveries.json');
for(const [id,path,count,cards,vocab,captures] of [
 ['pharmacologie','qextra-56.txt',68,22,30,148],
 ['infections_neuro_meningees','qextra-57.txt',44,27,14,48]
]){
 const bank=read(path),live=questions.filter(q=>q.courseId===id);
 assert.equal(bank.length,count);assert.equal(live.length,count);
 for(const q of bank){
  const actual=live.find(x=>x.id===q.id);assert.ok(actual,q.id);
  for(const key of ['question','choices','answers','explanation','flashcards'])
   assert.deepEqual(JSON.parse(JSON.stringify(actual[key])),q[key],q.id+': ancienne surcharge active sur '+key);
 }
 const expected=bank.flatMap(q=>q.flashcards.map(c=>({qid:q.id,...c})));
 const actual=deck.filter(c=>c.courseId===id&&!c.id.startsWith('voc:'));
 assert.equal(actual.length,cards);assert.equal(expected.length,cards);
 for(const c of expected){const found=actual.find(x=>x.qid===c.qid&&(x.sourceFront||x.front)===c.front);assert.ok(found,c.front);assert.deepEqual([...found.answers],c.answers.flatMap(a=>a.includes(' ; ')?a.split(/\s*;\s*/):[a]));assert.ok(found.explanation);assert.doesNotMatch(found.explanation,/Combinaison correcte|dans ce cours/)}
 assert.equal(deck.filter(c=>c.courseIds.includes(id)&&c.id.startsWith('voc:')).length,vocab);
 const d=manifest.courses.find(x=>x.courseId===id);
 assert.equal(d.sourceBasis.reviewedCaptureCount,captures);
 assert.equal(d.sourceBasis.nativeSupportAvailable,false);
 assert.equal(d.deliveryMode,'existing_course_revision');assert.equal(d.status,'partial');
 assert.equal(d.visualAudit.pdfSha256,d.publishedVerification.pdfSha256);
 assert.equal(d.infographicSheetVisualAudit.pdfSha256,d.infographicSheetPublishedVerification.pdfSha256);
}
const base=process.env.IFSI_BASE_SHA||'HEAD^';
const before=JSON.parse(execFileSync('git',['show',base+':vocals.json']).toString('utf8'));
const now=read('vocals.json');
assert.ok([80,105].includes(before.length),'La référence doit correspondre soit à la base historique de 80 vocaux, soit au catalogue déjà augmenté à 105');
assert.deepEqual(now.slice(0,before.length),before,'Tous les vocaux présents dans la référence Git doivent rester intacts.');
assert.equal(now.length,105,'Le catalogue doit conserver les 80 vocaux historiques et les 25 vocaux ajoutés');
console.log('✅ V8.30.95 : 112 QCM et 49 cartes de cours identiques aux matrices revues, 44 cartes de vocabulaire, 80 vocaux historiques inchangés et 25 nouveaux.');
