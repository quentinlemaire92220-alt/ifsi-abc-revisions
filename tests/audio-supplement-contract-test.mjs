import assert from 'node:assert/strict';
import {audioSupplementDigest,validateAudioSupplements} from './audio-supplement-contract.mjs';
import {validatePartChanges} from './course-delivery-parts-lib.mjs';
const vocal={id:'demo_audio_01',courseId:'demo',driveId:'public_audio_123456789',mime:'audio/aac',durationSeconds:450,title:'Chapitre'};
const data={registry:{courses:[{id:'demo'}]},vocals:[vocal],sheets:[],infographics:[],questions:[]};
const s={courseId:'demo',folderId:'public_folder_123456789',vocalIds:[vocal.id],artifactSha256s:{[vocal.driveId]:'a'.repeat(64)},publicationApproval:{status:'approved',authorization:'explicit_go_publication',scope:'audio_supplement',approvedAt:'2026-10-19T07:00:00Z'}};
s.publicationApproval.bundleSha256=audioSupplementDigest(s,data.vocals);
const manifest={courses:[],audioSupplements:[s]};
assert.equal(validateAudioSupplements(manifest,data).size,1);
const before={...data,vocals:[],sheets:[{courseId:'demo',resourceId:'old_sheet'}]};
assert.equal(validatePartChanges(before,data,{courses:[]},manifest).resources,1);
for(const change of [
 m=>m.audioSupplements[0].publicationApproval.status='pending',
 m=>m.audioSupplements[0].publicationApproval.scope='course_package',
 m=>m.audioSupplements[0].publicationApproval.bundleSha256='b'.repeat(64),
 m=>m.audioSupplements[0].vocalIds.push(vocal.id),
 m=>m.audioSupplements[0].artifactSha256s={},
 m=>m.audioSupplements[0].artifactSha256s.other='b'.repeat(64),
 m=>m.audioSupplements.push(structuredClone(s))
]){
 const m=structuredClone(manifest);change(m);assert.throws(()=>validateAudioSupplements(m,data));
}
for(const change of [v=>v.courseId='wrong',v=>v.title='Contenu changé',v=>v.durationSeconds=0,v=>v.mime='text/plain']){
 const d=structuredClone(data);change(d.vocals[0]);assert.throws(()=>validateAudioSupplements(manifest,d));
}
assert.throws(()=>validatePartChanges(before,data,{courses:[]},{courses:[]}),/non déclarées/);
const extra={...data,vocals:[vocal,{...vocal,id:'unapproved_audio'}]};
assert.throws(()=>validatePartChanges(before,extra,{courses:[]},manifest),/non déclarées/);
const qcm={...data,questions:[{id:'new_question',courseId:'demo'}]};
assert.throws(()=>validatePartChanges(before,qcm,{courses:[]},manifest),/non déclarées/);
console.log('✅ Compléments audio : GO, empreinte, durée, MIME, rattachement et refus des ajouts non autorisés');

