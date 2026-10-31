import fs from 'node:fs';
import assert from 'node:assert/strict';
import {validateReviewedWrittenBundle} from './reviewed-written-bundle-contract.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const original=read('docs/course-deliveries.json').courses.find(d=>d.deliveryMode==='reviewed_written_bundle');
assert.ok(original,'Fixture réelle de première publication absente');
const course=read('course-registry-v741.json').courses.find(c=>c.id===original.courseId);
const atlasSource=fs.readFileSync('v82-nav-anatomy.js','utf8');
const visibleSystems=atlasSource.match(/const SYSTEMS=\[([\s\S]*?)\];/)[1];
assert.ok(visibleSystems.includes("id:'"+original.courseId+"'"),'Pack absent de la liste réellement rendue dans Anatomie');
const sheets=[1,2,3].flatMap(n=>read('sheets-'+n+'.json'));
const options={vocabulary:read('vocabulaire-v1.json').entries,vocals:read('vocals.json'),infographics:read('infographics.json')};
validateReviewedWrittenBundle(course,original,sheets,options);
for(const change of [
 d=>d.publicationApproval.status='pending',
 d=>d.publicationApproval.authorization='production_only',
 d=>d.ownerAcceptedArtifactSha256s.qcm='0'.repeat(64),
 d=>d.publicArtifacts.boards.sha256='0'.repeat(64),
 d=>d.reviewedPageCounts.sheet--,
 d=>d.sourceAudit.originalAudioCompared=true,
 d=>d.anatomicalReview.independentClinicalSignoff=true,
 d=>d.anatomicalReview.minimumEffectiveDpi=53,
 d=>d.qcmCount--,
 d=>d.flashcardCount--,
 d=>d.vocabularyCount--,
 d=>d.vocals=['invented_mp3']
]){
 const d=structuredClone(original);change(d);
 assert.throws(()=>validateReviewedWrittenBundle(course,d,sheets,options),'Lot corrompu accepté');
}
console.log('PASS première publication écrite : 12 défauts de GO, octets, contenu, résolution et médias fictifs refusés.');
