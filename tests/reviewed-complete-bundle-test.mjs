import fs from 'node:fs';import assert from 'node:assert/strict';
import {validateReviewedCompleteBundle,isReviewedCompleteBundle} from './reviewed-complete-bundle-contract.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
for(const d of read('docs/course-deliveries.json').courses.filter(isReviewedCompleteBundle)){
 const course=read('course-registry-v741.json').courses.find(c=>c.id===d.courseId),sheets=[1,2,3].flatMap(n=>read(`sheets-${n}.json`));
 const options={vocabulary:read('vocabulaire-v1.json').entries,vocals:read('vocals.json'),infographics:read('infographics.json')};
 validateReviewedCompleteBundle(course,d,sheets,options);
 for(const mutate of [x=>x.status='complete',x=>x.audioOwnerReview.humanListeningAttested=true,x=>x.audioOwnerReview.spokenScriptMatchVerified=true,x=>x.blockers=[],x=>x.qcmCount--,x=>x.flashcardCount--,x=>x.sourceAudit.originalAudioCompared=true,x=>x.sourceAudit.oralStatus='unverified',x=>x.publicArtifacts.sheet.sha256='0'.repeat(64),x=>x.ownerApprovalEvidenceSha256=null,x=>x.publicationApproval.authorization='inferred',x=>x.flashcardStandaloneReview.cards[0].sha256='0'.repeat(64),x=>x.flashcardStandaloneReview.cards[0].cardId='unknown',x=>x.flashcardStandaloneReview.privateEvidenceSha256=null]){
  const changed=structuredClone(d);mutate(changed);assert.throws(()=>validateReviewedCompleteBundle(course,changed,sheets,options));
 }
}
console.log('PASS reviewed complete bundle: exact resources, documentary scope and listening reservation; 14 injected defects rejected.');
