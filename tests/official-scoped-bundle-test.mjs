import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {validateOfficialScoped,isOfficialScoped} from './official-scoped-bundle-contract.mjs';
import {runtimeDeck} from './flashcards-runtime-fixture.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const m=read('docs/course-deliveries.json'),runtime=await runtimeDeck();
const data={sheets:[1,2,3].flatMap(n=>read(`sheets-${n}.json`)),vocals:read('vocals.json'),vocabulary:read('vocabulaire-v1.json').entries,questions:runtime.questions,deck:runtime.deck};
const base=process.env.IFSI_BASE_SHA;assert.match(base,/^[a-f0-9]{40}$/);
const before=p=>JSON.parse(execFileSync('git',['show',base+':'+p],{encoding:'utf8',maxBuffer:32*1024*1024}));
for(const d of m.courses.filter(isOfficialScoped)){
 const course=read('course-registry-v741.json').courses.find(c=>c.id===d.courseId);
 validateOfficialScoped(course,d,data);
 const prior=before('docs/course-deliveries.json').courses.find(c=>c.courseId===d.courseId);
 if(!isOfficialScoped(prior))assert.deepEqual(d.historicalDelivery,prior,'Livraison historique altérée');
 const oldVoices=before('vocals.json').filter(v=>v.courseId===d.courseId);
 for(const v of oldVoices)assert.deepEqual(data.vocals.find(x=>x.id===v.id),v,'Vocal historique altéré');
 for(const mutate of [x=>x.pedagogicalValidated=true,x=>x.status='complete',x=>x.sourceAudit.independentClinicalSignoff=true,
  x=>x.sourceAudit.privateReservationsOpen=false,x=>x.scopedPublicationAuthorization.status='pending',
  x=>x.publicationApproval.status='pending',x=>x.publicArtifacts.qcm.sha256='0'.repeat(64),
  x=>x.assessmentOwnerReview.flashcardsSha256='0'.repeat(64),x=>x.audioOwnerReview.status='pending',
  x=>x.publicAudioArtifacts[0].sha256='0'.repeat(64),x=>x.qcmCount--,x=>x.vocabularyCount--,
  x=>x.embeddedVectorDiagramPages=[3],x=>x.officialSupportArtifact.sha256='0'.repeat(64)]){
  const altered=structuredClone(d);mutate(altered);assert.throws(()=>validateOfficialScoped(course,altered,data));
 }
 const altered=structuredClone(data);altered.vocals=altered.vocals.filter(v=>v.id!==d.historicalVocalIds[0]);
 assert.throws(()=>validateOfficialScoped(course,d,altered));
}
console.log('PASS lot officiel : octets, runtime, historique préservé ; faux accords, réserves effacées et faux statut clinique rejetés.');
