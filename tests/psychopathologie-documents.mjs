import fs from 'node:fs';import assert from 'node:assert/strict';
import {validateScopedRevisions,revisionBundle} from '../tools/scoped-course-revision-contract.mjs';
import {validateVerifiedDocumentsAddition,verifiedDocumentsBeforeJson} from '../tools/verified-documents-addition-contract.mjs';
import {validateBank} from '../tools/qcm-bank-contract.mjs';
import {runtimeDeck} from './flashcards-runtime-fixture.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),m=read('docs/course-deliveries.json'),r=m.scopedCourseRevisions.find(r=>r.courseId==='psychopathologie');
validateScopedRevisions(m);assert.equal(r.profile,'verified_documents_addition_v1');
const data=revisionBundle(r),cards=data.bank.flatMap(q=>q.flashcards);
assert.equal(data.bank.length,113);assert.equal(cards.length,350);assert.equal(r.vocabularyEntryIds.length,301);
assert.deepEqual(r.publicArtifacts.map(a=>a.pageCount),[41,46,60]);assert.equal(data.vocals.length,26);
const norm=s=>s.normalize('NFKC').replace(/\s+/g,' ').replace(/\s+([?!,;:.])/g,'$1').trim();
const runtime=await runtimeDeck({loadResources:true}),actual=runtime.deck.filter(c=>c.courseId===r.courseId&&!c.id.startsWith('voc:'));
assert.equal(actual.length,350);assert.equal(runtime.questions.filter(q=>q.courseId===r.courseId).length,113);
assert.equal(runtime.window.IFSI_V8338_FLASHCARDS.cardsForCourse(r.courseId).length,350,'Definition coverage must not create duplicate automatic cards');
assert.equal(runtime.window.IFSI_VOCAB.countForCourse(r.courseId),301);
for(const c of cards){const found=actual.find(x=>norm(x.sourceFront||x.front)===norm(c.front));assert.ok(found,c.id);assert.equal(norm(found.answers.join(' ; ')),norm(c.answers.join(' ; ')),c.id);assert.equal(norm(found.explanation),norm(c.explanation),c.id);assert.equal(found.theme,c.theme,c.id);}
for(const mutate of [x=>x.sourceReview.receivedOralPartsReviewed=4,x=>x.sourceReview.externalResearchPerformed=true,x=>x.sourceReview.independentClinicalSignoff=true,x=>x.publicationApproval.authorization='production_only',x=>x.publicationApproval.bundleSha256='0'.repeat(64),x=>x.assistantPdfReview.allPagesChecked=false,x=>x.bankSha256='0'.repeat(64),x=>x.audioArtifacts.push({vocalId:'new'}),x=>x.templateConformance.artifacts.sheet.artifactSha256='0'.repeat(64)]){
 const bad=structuredClone(r);mutate(bad);assert.throws(()=>validateVerifiedDocumentsAddition(bad,m,revisionBundle(bad)));
}
const changed=structuredClone(data);changed.vocals[0].title+=' changed';assert.throws(()=>validateVerifiedDocumentsAddition(r,m,changed));
const wrongReview=structuredClone(r);wrongReview.flashcardStandaloneReview.cards[0].sha256='0'.repeat(64);assert.throws(()=>validateVerifiedDocumentsAddition(wrongReview,m,revisionBundle(wrongReview)),'Changed standalone-card review accepted');
const tampered=read('questions-5.json');tampered[0].question+=' changed';assert.equal(verifiedDocumentsBeforeJson('questions-5.json',tampered)[0].question,tampered[0].question,'Historical view must preserve edits to other courses');
const bad=structuredClone(data.bank);bad[0].flashcards[0].answers=[''];bad[0].flashcards[0].explanation='';bad[0].flashcards[0].completeAnswer=true;assert.throws(()=>validateBank(bad));
assert.equal(cards.filter(c=>c.completeAnswer).every(c=>c.explanation===''&&c.answers.join(' ').length>=30),true);
console.log('PASS psychopathologie: 113 exact QCM, 350 decoded authored cards, 301 definitions, three PDF hashes, 26 preserved MP3s and rejected corruptions.');
