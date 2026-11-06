import fs from 'node:fs';
import assert from 'node:assert/strict';
import {validateScopedRevisions} from '../tools/scoped-course-revision-contract.mjs';
const manifest=JSON.parse(fs.readFileSync('docs/course-deliveries.json','utf8'));
validateScopedRevisions(manifest);
let checked=0;
for(const r of manifest.scopedCourseRevisions||[]){
 if(r.profile!=='reviewed_written_audio_v1')continue;
 const mutations=[x=>x.sourceReview.receivedOralPartsReviewed=2,x=>x.sourceReview.oralCoverageCertifiedComplete=false,x=>x.sourceReview.externalResearchPerformed=true,x=>x.sourceReview.privateEvidenceSha256=null,x=>x.audioArtifacts.pop(),x=>x.audioArtifacts[0].sha256='0'.repeat(64),x=>x.audioOwnerReview.status='pending',x=>x.officialSupportArtifact.sha256='0'.repeat(64),x=>x.templateConformance.artifacts.qcm.pagesChecked.pop(),x=>x.nativeDiagramReview.authorization='inferred',x=>x.publicationApproval.authorization='production_only',x=>x.publicationApproval.bundleSha256='0'.repeat(64)];
 for(const mutate of mutations){const bad=structuredClone(manifest);mutate(bad.scopedCourseRevisions.find(x=>x.id===r.id));assert.throws(()=>validateScopedRevisions(bad));}
 checked++;
}
assert.ok(checked>0);
console.log('PASS written/audio revision: exact official support, reviewed source scope, unchanged history, four accepted audio files and 12 rejected mutations.');
