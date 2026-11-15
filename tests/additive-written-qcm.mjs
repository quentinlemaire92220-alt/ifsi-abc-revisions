import fs from 'node:fs';
import assert from 'node:assert/strict';
import {validateScopedRevisions,revisionBundle} from '../tools/scoped-course-revision-contract.mjs';
import {validateAdditiveWrittenQcm} from '../tools/additive-written-qcm-contract.mjs';
import {runtimeDeck} from './flashcards-runtime-fixture.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),m=read('docs/course-deliveries.json');validateScopedRevisions(m);
for(const r of m.scopedCourseRevisions.filter(r=>r.profile==='additive_written_qcm_v1')){
 const actual=revisionBundle(r),old=read(r.baselinePath);
 assert.equal(actual.bank.length,63);assert.equal(r.addedQuestionIds.length,23);
 const runtime=await runtimeDeck({loadResources:true}),resources=runtime.window.IFSI_V741.resourcesForCourse(r.courseId);
 const core=Array.from(resources.questions).filter(q=>q.kind!=='Vocabulaire');
 assert.deepEqual(core.map(q=>q.id),r.questionIds);
 for(const q of actual.bank){const live=core.find(x=>x.id===q.id);for(const key of ['question','choices','answers','explanation','announcedCorrectCount'])assert.deepEqual(JSON.parse(JSON.stringify(live[key])),q[key]);}
 const cards=runtime.deck.filter(c=>c.courseId===r.courseId&&!c.id.startsWith('voc:'));
 assert.equal(cards.length,old.bank.flatMap(q=>q.flashcards).length);assert.ok(cards.every(c=>old.bank.some(q=>q.id===c.qid)));
 assert.equal(runtime.window.IFSI_VOCAB.countForCourse(r.courseId),old.vocabulary.length);
 for(const mutate of [x=>x.addedQuestionIds.pop(),x=>x.bankSha256='0'.repeat(64),x=>x.sourceReview.embeddedVideoAudioCertifiedComplete=true,x=>x.sourceAttributionReview.fields.pop(),x=>x.audioArtifacts.push({vocalId:'unauthorized'}),x=>x.assistantPdfReview.allPagesChecked=false,x=>x.templateConformance.artifacts.qcm.pagesChecked.pop(),x=>x.publicationApproval.bundleSha256='0'.repeat(64)]){
  const bad=structuredClone(r);mutate(bad);assert.throws(()=>validateAdditiveWrittenQcm(bad,m,revisionBundle(bad)));
 }
 for(const mutate of [x=>x.bank[0].explanation+=' changed',x=>x.vocabulary.pop(),x=>x.vocals.pop(),x=>x.bank.at(-1).flashcards.push({front:'Unauthorized card'})]){
  const bad=structuredClone(actual);mutate(bad);assert.throws(()=>validateAdditiveWrittenQcm(r,m,bad));
 }
 console.log('PASS additive revision: 63 runtime questions; 23 additions; 40 original questions/cards, vocabulary and audio preserved; 12 rejected mutations.');
}
