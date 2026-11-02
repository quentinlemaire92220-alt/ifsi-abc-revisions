import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {validateAudioReplacements,validateAudioReplacementOnly} from './audio-replacement-contract.mjs';
const bytes=Buffer.from('ID3 owner generated TTS fixture'),hash=createHash('sha256').update(bytes).digest('hex'),oldHash='0'.repeat(64);
const prior={id:'demo_01',courseId:'demo',title:'Theme',number:1,driveId:'stable_drive_123456',localAudio:'./assets/audio/demo.mp3',mime:'audio/mpeg',durationSeconds:450};
const next={...prior,durationSeconds:460,synthesisOrigin:'owner_tts_export',replacementReview:{status:'owner_accepted',scope:'audio_replacement',fromSha256:oldHash,toSha256:hash,approvedAt:'2026-11-02T15:25:37Z'}};
const before={courses:[{courseId:'demo',publicationApproval:{bundleSha256:'a'.repeat(64)},publicAudioArtifacts:[{artifactId:prior.id,path:'assets/audio/demo.mp3',sha256:oldHash,durationSeconds:450}]}]};
const after={courses:[{courseId:'demo',publicationApproval:{status:'approved',authorization:'explicit_go_publication',scope:'course_package',bundleSha256:'b'.repeat(64),approvedAt:next.replacementReview.approvedAt},publicAudioArtifacts:[{artifactId:prior.id,path:'assets/audio/demo.mp3',sha256:hash,durationSeconds:460}],artifactSha256s:{[prior.id]:hash,[prior.driveId]:hash}}]};
const check=(manifest=after,voice=next,reader=()=>bytes)=>validateAudioReplacements(before,manifest,[prior],[voice],reader);
assert.deepEqual([...check()],['demo_01']);
assert.equal(validateAudioReplacements(before,before,[prior],[prior]).size,0);
assert.throws(()=>validateAudioReplacements(before,after,[prior],[]));
for(const change of [v=>v.title='Other theme',v=>v.id='other',v=>v.courseId='other',v=>v.driveId='new_id',v=>v.localAudio='./wrong.mp3',v=>v.mime='text/plain',v=>v.durationSeconds=600,v=>delete v.replacementReview,v=>v.replacementReview.status='pending',v=>v.replacementReview.fromSha256='c'.repeat(64),v=>v.replacementReview.toSha256='c'.repeat(64),v=>v.replacementReview.approvedAt='invalid']){const v=structuredClone(next);change(v);assert.throws(()=>check(after,v));}
for(const change of [d=>d.publicationApproval.status='pending',d=>d.publicationApproval.authorization='implicit',d=>d.publicationApproval.scope='audio_supplement',d=>d.publicationApproval.bundleSha256='a'.repeat(64),d=>d.publicAudioArtifacts[0].sha256='c'.repeat(64),d=>d.publicAudioArtifacts[0].path='wrong.mp3',d=>d.artifactSha256s[prior.id]=oldHash]){const m=structuredClone(after);change(m.courses[0]);assert.throws(()=>check(m));}
assert.throws(()=>check(after,next,()=>Buffer.from('different audio bytes')));
const course={id:'demo',officialSupport:true};
const only=(d=after.courses[0],c=course)=>validateAudioReplacementOnly(before.courses[0],d,course,c,[prior],[next],()=>bytes);
assert.equal(only().size,1);
for(const mutate of [d=>d.qcmCount=999,d=>d.artifactSha256s.other='c'.repeat(64),d=>d.publicAudioArtifacts.push({...d.publicAudioArtifacts[0],artifactId:'extra'})]){const d=structuredClone(after.courses[0]);mutate(d);assert.throws(()=>only(d));}
assert.throws(()=>only(after.courses[0],{...course,officialSupport:false}));
console.log('PASS remplacement audio : ID stable, ancien/nouveau SHA, écoute, GO et octets exacts; suppressions et changements non autorisés rejetés.');
