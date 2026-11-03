import fs from 'node:fs';
import assert from 'node:assert/strict';
import {validateScopedRevisions} from '../tools/scoped-course-revision-contract.mjs';
import {isExplicitRecallPrompt} from './lean-content-contract.mjs';
const m=JSON.parse(fs.readFileSync('docs/course-deliveries.json','utf8'));
validateScopedRevisions(m);
for(const r of m.scopedCourseRevisions||[]){
 if(r.profile!=='official_complete_written_v1')continue;
 for(const mutate of [x=>x.sourceReview.receivedOralPartsReviewed=3,x=>x.sourceReview.independentClinicalSignoff=true,x=>x.sourceReview.oralCoverageCertifiedComplete=false,x=>x.bankSha256='0'.repeat(64),x=>x.audioArtifacts.push({vocalId:'invented'}),x=>x.publicationApproval.authorization='production_only',x=>x.sourceReview.privateEvidenceSha256=null]){
  const bad=structuredClone(m);mutate(bad.scopedCourseRevisions.find(x=>x.id===r.id));assert.throws(()=>validateScopedRevisions(bad));
 }
}
assert.equal(isExplicitRecallPrompt('Définir : Identité sociale.'),true);
for(const s of ['Définir :','Définir','Définir : ???.','Citer : identité sociale.','Identité sociale.'])assert.equal(isExplicitRecallPrompt(s),false);
console.log('PASS complete written addition: source scope, exact artifacts, authorization, historical audio and recall prompts.');
