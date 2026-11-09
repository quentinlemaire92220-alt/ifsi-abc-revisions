import fs from 'node:fs';import assert from 'node:assert/strict';
import {validateScopedRevisions} from '../tools/scoped-course-revision-contract.mjs';
const m=JSON.parse(fs.readFileSync('docs/course-deliveries.json','utf8'));validateScopedRevisions(m);
for(const r of m.scopedCourseRevisions||[]){if(r.profile!=='reconciled_written_correction_v1')continue;
 for(const mutate of [x=>x.questionIds.reverse(),x=>x.audioArtifacts[0].sha256='0'.repeat(64),x=>x.audioArtifacts[0].fromSha256='0'.repeat(64),x=>x.audioOwnerReview.humanListeningAttested=true,x=>x.sourceAttributionReview.fields[0].sha256='0'.repeat(64),x=>x.ownerAcceptance.status='pending']){
  const bad=structuredClone(m);mutate(bad.scopedCourseRevisions.find(x=>x.id===r.id));assert.throws(()=>validateScopedRevisions(bad));
 }
}
console.log('PASS stable-ID correction: separately signed changes, original media preserved, source-attribution bytes bound and six false approvals rejected.');
