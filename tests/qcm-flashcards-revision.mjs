import fs from 'node:fs';import assert from 'node:assert/strict';
import {validateScopedRevisions,revisionBundle} from '../tools/scoped-course-revision-contract.mjs';
import {validateQcmFlashcardsRevision} from '../tools/qcm-flashcards-revision-contract.mjs';
import {runtimeDeck} from './flashcards-runtime-fixture.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),m=read('docs/course-deliveries.json');validateScopedRevisions(m);
for(const r of (m.scopedCourseRevisions||[]).filter(r=>r.profile==='qcm_flashcards_only_v1')){
 const actual=revisionBundle(r);validateQcmFlashcardsRevision(r,m,actual);const runtime=await runtimeDeck({loadResources:true}),resource=runtime.window.IFSI_V741.resourcesForCourse(r.courseId),cards=runtime.deck.filter(c=>c.courseId===r.courseId&&!c.id.startsWith('voc:'));
 assert.deepEqual(Array.from(resource.questions,q=>q.id),r.questionIds);assert.equal(cards.length,90);assert.equal(runtime.window.IFSI_VOCAB.countForCourse(r.courseId),r.vocabularyEntryIds.length);
 const norm=s=>s.normalize('NFKC').replace(/\s+/g,' ').replace(/\s+([?!,;:.])/g,'$1').trim();
 for(const q of actual.bank){const c=cards.find(c=>c.qid===q.id);assert.ok(c);assert.equal(norm(c.front),norm(q.flashcards[0].front));assert.equal(norm(c.answers.join(' ; ')),norm(q.flashcards[0].answers.join(' ; ')));assert.equal(norm(c.explanation),norm(q.flashcards[0].explanation));}
 for(const mutate of [x=>x.publicationApproval.scope='course_package',x=>x.driveVerification.status='pending',x=>x.sourceReview.independentClinicalSignoff=true,x=>x.assistantPdfReview.allPagesChecked=false,x=>x.bankSha256='0'.repeat(64),x=>x.sourceSheetSha256='0'.repeat(64)]){const bad=structuredClone(r);mutate(bad);assert.throws(()=>validateQcmFlashcardsRevision(bad,m,revisionBundle(bad)));}
 console.log('PASS QCM/card revision: 90 exact questions, 90 authored cards, original vocabulary/audio/sheet/banks preserved, six false approvals rejected.');
}
