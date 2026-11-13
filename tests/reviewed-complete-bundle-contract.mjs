import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {validateWrittenDelivery} from './written-sheet-contract.mjs';
import {verifyPublicArtifact,pagesOrigin,pagesPrefix} from '../tools/public-artifact-contract.mjs';
import {validateBank} from '../tools/qcm-bank-contract.mjs';
export const isReviewedCompleteBundle=d=>d?.firstReleaseContract==='reviewed_complete_bundle_v1';
export function validateReviewedCompleteBundle(course,d,sheets,{questions=[],deck=[],vocabulary=[],vocals=[],infographics=[],runtime=false}={}){
 const tag=d.courseId+': ';
 assert.ok(isReviewedCompleteBundle(d));assert.equal(d.deliveryMode,'first_release');
 assert.equal(d.publicationHost,'github_pages');assert.equal(d.packFormat,'written_v1');
 assert.equal(d.validated,true);assert.equal(d.pedagogicalValidated,false);
 assert.equal(d.provisional,false);assert.equal(d.status,'partial');
 assert.equal(d.sourceBasis.nativeSupportAvailable,true);assert.equal(d.sourceBasis.reconciled,true);
 assert.equal(course.officialSupport,true);assert.equal(course.provisional,false);
 assert.equal(d.sourceAudit.officialChecked,true);assert.equal(d.sourceAudit.oralStatus,'complete');
 assert.equal(d.sourceAudit.oralReviewBasis,'full_transcript_documentary_review');
 assert.equal(d.sourceAudit.originalAudioCompared,false);assert.equal(d.sourceAudit.independentClinicalSignoff,false);
 assert.equal(d.sourceAudit.officialSupportPreservedPrivately,true);
 assert.match(d.sourceAudit.privateEvidenceSha256,/^[a-f0-9]{64}$/);
 assert.match(d.ownerApprovalEvidenceSha256,/^[a-f0-9]{64}$/);
 assert.deepEqual(Object.keys(d.publicArtifacts).sort(),['flashcards','qcm','sheet']);
 for(const a of Object.values(d.publicArtifacts))verifyPublicArtifact(d,pagesOrigin+pagesPrefix+a.path);
 for(const a of d.downloadArtifacts){
  assert.match(a.path,/^assets\/[\w-]+\/[\w.-]+$/);const bytes=fs.readFileSync(a.path);
  assert.equal(bytes.length,a.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),a.sha256);
  assert.equal(d.artifactSha256s[a.artifactId],a.sha256);
 }
 validateWrittenDelivery(d.courseId,d,sheets,{requirePublishedVerification:false});
 assert.equal(sheets.filter(s=>s.courseId===d.courseId).length,1);
 assert.equal(course.qcmPdfUrl,pagesOrigin+pagesPrefix+d.publicArtifacts.qcm.path);
 assert.equal(course.flashcardsPdfUrl,pagesOrigin+pagesPrefix+d.publicArtifacts.flashcards.path);
 const bank=JSON.parse(fs.readFileSync(d.qcmBank,'utf8'));
 assert.equal(validateBank(bank,d.courseId),d.qcmCount);
 assert.deepEqual(JSON.parse(fs.readFileSync('questions-5.json','utf8')).filter(q=>q.courseId===d.courseId),bank);
 assert.equal(bank.flatMap(q=>q.flashcards).length,d.flashcardCount);
 assert.equal(new Set(bank.flatMap(q=>q.flashcards.map(f=>f.id))).size,d.flashcardCount);
 assert.equal(course.authoredFlashcards,true);assert.equal(course.flashcardTarget,d.flashcardCount);
 const terms=vocabulary.filter(v=>v.courseIds?.includes(d.courseId));
 assert.equal(terms.length,d.vocabularyCount);assert.equal(d.vocabularyCount,d.lexicon.termCount);
 assert.deepEqual(terms.map(v=>v.id),d.vocabularyEntryIds);
 assert.equal(infographics.filter(i=>i.courseId===d.courseId).length,0);
 const audio=vocals.filter(v=>v.courseId===d.courseId);assert.ok(audio.length>0);
 assert.deepEqual(audio.map(v=>v.id),d.vocals);assert.equal(course.audioCount,audio.length);
 const review=d.audioOwnerReview;
 assert.equal(review.status,'publication_authorized_listening_reservations_disclosed');
 assert.equal(review.humanListeningAttested,false);assert.equal(review.spokenScriptMatchVerified,false);
 assert.equal(review.fullTechnicalDecode,true);assert.match(review.privateEvidenceSha256,/^[a-f0-9]{64}$/);
 assert.deepEqual(d.blockers.map(b=>({resource:b.resource,reason:b.reason})),[{resource:'vocals',reason:'listening_review_not_attested'}]);
 assert.equal(d.publicationApproval.status,'approved');assert.equal(d.publicationApproval.authorization,'explicit_go_publication');
 assert.equal(d.publicationApproval.scope,'course_package');
 assert.equal(d.visualOwnerReview.ownerApprovalEvidenceSha256,d.ownerApprovalEvidenceSha256);
 if(runtime){
  assert.deepEqual(JSON.parse(JSON.stringify(questions.filter(q=>q.courseId===d.courseId))),bank);
  const cards=deck.filter(c=>c.courseId===d.courseId&&!String(c.id).startsWith('voc:'));
  assert.equal(cards.length,d.flashcardCount);
  assert.ok(cards.every(c=>bank.some(q=>q.id===c.qid&&q.flashcards.some(f=>f.front===(c.sourceFront||c.front)))));
 }
 return {questions:bank.length,cards:d.flashcardCount,definitions:d.vocabularyCount,audio:audio.length};
}
