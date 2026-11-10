import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {validateScopedRevisions,revisionDigest,scopedHistoricalJson} from '../tools/scoped-course-revision-contract.mjs';
import {runtimeDeck} from './flashcards-runtime-fixture.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const manifest=read('docs/course-deliveries.json');
validateScopedRevisions(manifest);
const runtime=await runtimeDeck();
for(const r of (manifest.scopedCourseRevisions||[]).filter(r=>!manifest.consolidatedCourseRevisions?.some(x=>x.priorRevisionId===r.id))){
 const course=runtime.registry.courses.find(c=>c.id===r.courseId),resource=runtime.window.IFSI_V741.resourcesForCourse(r.courseId);
 assert.deepEqual(JSON.parse(JSON.stringify(resource.questions.map(q=>q.id))),r.questionIds,'Active bank differs from approved bank');
 const cards=runtime.deck.filter(c=>c.courseId===r.courseId&&!String(c.id).startsWith('voc:'));
 assert.equal(cards.length,read(r.bankPath).flatMap(q=>q.flashcards).length,'Active cards lost or duplicated');
 assert.ok(cards.every(c=>r.questionIds.includes(c.qid)),'Historical reserved question leaked into active cards');
 assert.equal(runtime.window.IFSI_VOCAB.countForCourse(r.courseId),r.vocabularyEntryIds.length);
 if(r.id==='offre_soins_20261106'){
  const card=cards.find(c=>c.qid==='offre_soins_20261106_q041');
  assert.deepEqual(Array.from(card.answers),['DREES : études et statistiques','DGCS : cohésion sociale','IGAS : inspection des affaires sociales.']);
  assert.equal(card.explanation,'Partir de la fonction permet d’éviter la confusion entre organismes aux sigles proches.');
  assert.equal(read(r.bankPath)[40].flashcards[0].answers[0],card.answers.join(' ; ')+' '+card.explanation,'Display must preserve every authored word');
 }
 const baseline=read(r.baselinePath);
 if(process.env.IFSI_BASE_SHA){
  const prior=p=>JSON.parse(execFileSync('git',['show',process.env.IFSI_BASE_SHA+':'+p],{encoding:'utf8',maxBuffer:32*1024*1024}));
  const previous=prior('docs/course-deliveries.json');
  if(!(previous.scopedCourseRevisions||[]).some(x=>x.id===r.id)){
   assert.deepEqual(baseline.course,prior('course-registry-v741.json').courses.find(c=>c.id===r.courseId));
   assert.deepEqual(baseline.delivery,previous.courses.find(d=>d.courseId===r.courseId));
   for(const file of Object.keys(baseline.rows))assert.deepEqual(baseline.rows[file],prior(file).filter(x=>x.courseId===r.courseId));
   assert.deepEqual(baseline.vocabulary,prior('vocabulaire-v1.json').entries.filter(v=>v.courseIds?.includes(r.courseId)));
  }
 }
 const reconstructed=scopedHistoricalJson(read,'course-registry-v741.json').courses.find(c=>c.id===r.courseId);
 assert.deepEqual(reconstructed,baseline.course);
 assert.notDeepEqual(course,reconstructed,'Student app accidentally uses historical data');
 for(const mutate of [x=>x.sourceReview.independentClinicalSignoff=true,x=>x.publicArtifacts[0].sha256='0'.repeat(64),x=>x.questionIds.pop(),x=>x.ownerAcceptance.status='pending',x=>x.publicationApproval.bundleSha256='0'.repeat(64)]){
  const bad=structuredClone(manifest);mutate(bad.scopedCourseRevisions.find(x=>x.id===r.id));assert.throws(()=>validateScopedRevisions(bad),'Tampered revision accepted');
 }
}
console.log('PASS scoped course revision: exact artifacts, authorized scope, historical preservation, active runtime bank/cards/vocabulary, and five tampering cases.');
