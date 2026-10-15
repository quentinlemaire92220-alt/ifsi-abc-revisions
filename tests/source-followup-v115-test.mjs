import assert from 'node:assert/strict';
import {validateFollowup,receiveOfficial,planResume} from '../tools/source-followup-v115.mjs';
const A='a'.repeat(64),B='b'.repeat(64),C='c'.repeat(64);
const basic={key:'demo::p01',courseId:'demo',partId:'p01',
 sourceStatus:'TRANSCRIPT_ONLY',assetStatus:'DRAFT_PRIVATE',
 publicationStatus:'NOT_AUTHORIZED',privateOnly:true,expectedSources:['official_pdf'],sourceSha256:A};
assert.equal(validateFollowup(basic),basic);
const received=receiveOfficial(basic,{sha256:B,receivedOn:'2026-10-15'});
assert.equal(received.sourceStatus,'RECONCILIATION_PENDING');
assert.equal(received.reconciliationStatus,'PENDING');
assert.equal(received.publicationStatus,'NOT_AUTHORIZED');
assert.equal(received.previousSha256,A);
assert.throws(()=>validateFollowup({...basic,sourceStatus:'OFFICIAL_VERIFIED'}),/Rapprochement officiel/);
assert.throws(()=>validateFollowup({...basic,privateOnly:false}),/propriétaire/);
assert.throws(()=>validateFollowup({...basic,publicationStatus:'EXPLICIT_GO_RECORDED'}),/GO publication/);
const existing=receiveOfficial({...basic,publicationStatus:'HISTORIC_PUBLICATION'},{sha256:B,receivedOn:'2026-10-15'});
assert.equal(existing.publicationStatus,'HISTORIC_PUBLICATION');
const before=[{id:'n1',sha256:A,affects:['classicSheet','illustratedSheet','qcm','flashcards']},
 {id:'n2',sha256:B,affects:['vocabulary','vocalScripts']}];
const after=[{id:'n1',sha256:C,affects:['classicSheet','illustratedSheet','qcm','flashcards']},
 {id:'n2',sha256:B,affects:['vocabulary','vocalScripts']}];
const plan=planResume(before,after);
assert.deepEqual(plan.deltas,[{id:'n1',kind:'changed'}]);
assert.ok(plan.affectedAssets.includes('qcm')&&plan.affectedAssets.includes('classicSheet'));
assert.ok(!plan.affectedAssets.includes('vocabulary'));
assert.equal(plan.recheckBothFinalPdfs,true);
assert.equal(plan.publication,'NO_AUTOMATIC_PUBLICATION');
assert.deepEqual(planResume(before,before).affectedAssets,[]);
assert.deepEqual(planResume([],[{id:'new',sha256:A,affects:['vocabulary']}]).deltas,[{id:'new',kind:'added'}]);
assert.deepEqual(planResume(before,[]).deltas.map(x=>x.kind),['removed','removed']);
assert.throws(()=>planResume([{id:'dup',sha256:A,affects:[]},{id:'dup',sha256:B,affects:[]}],after),/Notions dupliquées/);
assert.throws(()=>receiveOfficial(basic,{sha256:'bad',receivedOn:'2026-10-15'}),/Empreinte/);
console.log('✅ v1.15 : 15 assertions : brouillon, attente officiel, reprise incrémentale, préservation de la publication.');
