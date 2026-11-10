import {readHistoricalAudioJson} from './historical-audio-fixture.mjs';
import fs from 'node:fs';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
import {validateAudioOnlyDelivery} from './audio-only-delivery-contract.mjs';
import {validateReceivedAudioOnly,receivedAudioBeforeJson} from '../tools/received-audio-only-contract.mjs';
import {publicationBundle,bundleDigest,validatePublicationApproval} from './course-publication-approval-lib.mjs';
import {firstReleaseAudioIds} from '../tools/hosted-audio-supplement-contract.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const registry=readHistoricalAudioJson('course-registry-v741.json'),vocals=read('vocals.json'),d=read('docs/course-deliveries.json').courses.find(d=>d.courseId==='psychopathologie'),course=registry.courses.find(c=>c.id==='psychopathologie');
assert.equal(d.audioOnlyContract,'received_audio_v1');assert.equal(d.vocals.length,26);
validateAudioOnlyDelivery(course,d,vocals);validateReceivedAudioOnly(course,d,vocals);
const data={registry,vocals,sheets:['sheets-1.json','sheets-2.json','sheets-3.json'].flatMap(readHistoricalAudioJson),infographics:read('infographics.json'),vocabulary:readHistoricalAudioJson('vocabulaire-v1.json').entries,banks:{},imageHashes:{}};
const digest=()=>bundleDigest(publicationBundle(course.id,d,data));validatePublicationApproval(course.id,d,digest());
for(const f of d.publicAudioArtifacts){const bytes=fs.readFileSync(f.path);assert.equal(bytes.length,f.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),f.sha256);}
for(const mutate of [x=>x.receivedAudioReview.speechAndPronunciationReview='completed',x=>x.receivedAudioReview.independentListeningAttested=true,x=>x.receivedAudioReview.ownerPublicationConsent='production_only',x=>x.receivedAudioReview.documentaryReview='pending',x=>x.receivedAudioReview.decodeReview='pending',x=>x.receivedAudioReview.episodes.pop(),x=>x.receivedAudioReview.episodes[0].audioSha256='0'.repeat(64),x=>x.receivedAudioReview.episodes[0].scriptSha256='',x=>x.receivedAudioReview.episodes[0].fullStreamDecoded=false,x=>x.publicationApproval.scope='course_package',x=>x.publicAudioArtifacts[0].path='../private.mp3',x=>x.sourceBasis.nativeSupportAvailable=false]){
 const bad=structuredClone(d);mutate(bad);assert.throws(()=>validateReceivedAudioOnly(course,bad,vocals));
}
const changed=structuredClone(d);changed.receivedAudioReview.episodes[0].scriptSha256='1'.repeat(64);assert.throws(()=>validatePublicationApproval(course.id,changed,bundleDigest(publicationBundle(course.id,changed,data))));
for(const mutation of [rows=>rows[0].durationSeconds=600,rows=>rows[0].number=26,rows=>rows[0].driveId='missing',rows=>rows[0].localAudio='../private.mp3']){
 const bad=vocals.filter(v=>v.courseId===course.id).map(v=>({...v}));mutation(bad);assert.throws(()=>validateReceivedAudioOnly(course,d,bad));
}
assert.equal(data.sheets.filter(s=>s.courseId===course.id).length,0);assert.equal(data.infographics.filter(s=>s.courseId===course.id).length,0);
assert.deepEqual(course.canonicalQuestionIds,[]);assert.equal(d.qcmBank,undefined);assert.equal(d.vocalScripts,undefined);
const history=receivedAudioBeforeJson('vocals.json',vocals);
assert.deepEqual(history,vocals.filter(v=>v.courseId!==course.id));
const manifest=read('docs/course-deliveries.json'),before={...manifest,courses:manifest.courses.filter(x=>x.courseId!==course.id)},oldData={registry:{...registry,courses:registry.courses.filter(x=>x.id!==course.id)},vocals:history};
assert.deepEqual(firstReleaseAudioIds(before,manifest,oldData,data),new Set(d.vocals));
assert.throws(()=>firstReleaseAudioIds(before,manifest,{...oldData,registry},data),'An existing course cannot masquerade as a first audio publication');
const unrelated=history[0],tampered=structuredClone(vocals);tampered.find(v=>v.id===unrelated.id).title+='changed';
assert.equal(receivedAudioBeforeJson('vocals.json',tampered).find(v=>v.id===unrelated.id).title,unrelated.title+'changed','Historical view must never mask another course edit');
console.log('PASS received audio: 26 exact MP3s, truthful unperformed-listening status, audio-only consent bound to bytes, and rejected corruptions.');
