import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {
 audioValueDigest,hostedAudioSupplementDigest,validateHostedAudioSupplements,
 historicalAudioView,validateHostedAudioChanges,firstReleaseAudioIds
} from '../tools/hosted-audio-supplement-contract.mjs';
import {publicationBundle,bundleDigest,validateChangedDeliveries} from './course-publication-approval-lib.mjs';
import {validatePartChanges} from './course-delivery-parts-lib.mjs';

// Synthetic authorization below exists only in memory. It is never saved to a
// manifest and must not be confused with a real owner decision for this lot.
const bytes=Buffer.alloc(2048,7),hash=createHash('sha256').update(bytes).digest('hex');
const readBytes=()=>bytes;
const original={id:'demo',label:'Cours témoin',audioStatus:'available',audioCount:1,officialSupportUrl:'https://example.invalid/source'};
const legacy={id:'legacy',courseId:'demo',course:original.label,number:1,title:'Historique',driveId:'old_audio_123456789',mime:'audio/mpeg'};
const voice={id:'new_audio',courseId:'demo',course:original.label,number:2,title:'Complément',mime:'audio/mpeg',durationSeconds:120,localAudio:'./assets/audio/demo/new_audio.mp3'};
const d={courseId:'demo',vocals:['legacy'],publicationApproval:{status:'approved',authorization:'explicit_go_publication',scope:'course_package',approvedAt:'2026-10-01T12:00:00Z',bundleSha256:'a'.repeat(64)}};
const before={courses:[d]};
const oldData={registry:{courses:[original]},vocals:[legacy],sheets:[],infographics:[],questions:[]};
const data={...oldData,registry:{courses:[{...original,audioCount:2}]},vocals:[legacy,voice]};
const supplement={contract:'hosted_audio_supplement_v1',id:'demo_audio',courseId:'demo',status:'prepared',
 baseline:{course:original,vocals:[legacy],deliverySha256:audioValueDigest(d)},vocalIds:[voice.id],
 artifacts:[{vocalId:voice.id,path:'assets/audio/demo/new_audio.mp3',sha256:hash,bytes:bytes.length,durationSeconds:120}],
 review:{status:'pending'},publicationApproval:null};
const manifest={courses:[d],hostedAudioSupplements:[supplement]};
const options={stage:'preparation',readBytes};
assert.equal(validateHostedAudioSupplements(manifest,data,options).size,1);
assert.deepEqual(historicalAudioView(manifest,data,options),oldData);
assert.deepEqual(validateHostedAudioChanges(before,manifest,oldData,data,options).newView,oldData);
assert.throws(()=>validateHostedAudioSupplements(manifest,data,{stage:'publication',readBytes}),/HOSTED_AUDIO_GO_REQUIRED/);
assert.throws(()=>validateHostedAudioChanges(before,manifest,oldData,data,{readBytes}),/HOSTED_AUDIO_GO_REQUIRED/);

const mutations=[
 (m,x)=>m.hostedAudioSupplements.push(structuredClone(supplement)),
 (m,x)=>m.hostedAudioSupplements[0].vocalIds.push('new_audio'),
 (m,x)=>m.hostedAudioSupplements[0].vocalIds=[],
 (m,x)=>m.hostedAudioSupplements[0].courseId='wrong',
 (m,x)=>m.hostedAudioSupplements[0].baseline.vocals[0].title='changed',
 (m,x)=>m.hostedAudioSupplements[0].baseline.deliverySha256='0'.repeat(64),
 (m,x)=>m.hostedAudioSupplements[0].artifacts[0].path='assets/audio/../secret.mp3',
 (m,x)=>m.hostedAudioSupplements[0].artifacts[0].sha256='0'.repeat(64),
 (m,x)=>m.hostedAudioSupplements[0].artifacts[0].bytes++,
 (m,x)=>m.hostedAudioSupplements[0].publicationApproval={status:'approved'},
 (m,x)=>m.hostedAudioSupplements[0].review={status:'completed'},
 (m,x)=>m.hostedAudioSupplements[0].extra='unknown',
 (m,x)=>x.vocals[0].title='legacy changed',
 (m,x)=>x.vocals.shift(),
 (m,x)=>x.vocals.reverse(),
 (m,x)=>x.vocals[1].id='legacy',
 (m,x)=>x.vocals[1].courseId='wrong',
 (m,x)=>x.vocals[1].number=3,
 (m,x)=>x.vocals[1].driveId='fictional_drive_id',
 (m,x)=>x.vocals[1].mime='text/plain',
 (m,x)=>x.vocals[1].durationSeconds=0,
 (m,x)=>x.vocals[1].durationSeconds=600,
 (m,x)=>x.vocals.push({...voice,id:'undeclared'}),
 (m,x)=>x.registry.courses[0].audioCount=99,
 (m,x)=>x.registry.courses[0].officialSupportUrl+='changed',
];
for(const change of mutations){
 const m=structuredClone(manifest),x=structuredClone(data);change(m,x);
 assert.throws(()=>validateHostedAudioSupplements(m,x,options));
}
assert.throws(()=>validateHostedAudioSupplements(manifest,data,{...options,readBytes:()=>Buffer.alloc(2048,8)}),/Octets MP3/);
assert.throws(()=>validateHostedAudioSupplements(manifest,data,{...options,readBytes:()=>{throw Error('absent');}}),/absent/);
const forged=structuredClone(manifest),forgedData=structuredClone(data);
forged.hostedAudioSupplements[0].baseline.course.label='forged';forgedData.registry.courses[0].label='forged';forgedData.vocals[1].course='forged';
assert.throws(()=>validateHostedAudioChanges(before,forged,oldData,forgedData,options),/Snapshot de cours/);

function approveForTest(m,x){
 const s=m.hostedAudioSupplements[0];s.status='approved';
 s.review={status:'completed',listenedVocalIds:[...s.vocalIds],artifactSha256s:Object.fromEntries(s.artifacts.map(a=>[a.path,a.sha256])),reviewedAt:'2026-11-02T12:00:00Z',privateEvidenceSha256:'b'.repeat(64)};
 s.publicationApproval={status:'approved',authorization:'explicit_go_publication',scope:'hosted_audio_supplement',approvedAt:'2026-11-02T12:01:00Z',bundleSha256:hostedAudioSupplementDigest(s,x)};
}
const approved=structuredClone(manifest);approveForTest(approved,data);
assert.equal(validateHostedAudioSupplements(approved,data,{stage:'publication',readBytes}).size,1);
assert.deepEqual(validateHostedAudioChanges(before,approved,oldData,data,{readBytes}).newView,oldData);
for(const change of [
 s=>s.publicationApproval.scope='course_package',s=>s.publicationApproval.authorization='implicit',
 s=>s.publicationApproval.bundleSha256='c'.repeat(64),s=>s.publicationApproval.approvedAt='bad',
 s=>s.review.listenedVocalIds=[],s=>s.review.artifactSha256s={},s=>s.review.privateEvidenceSha256='bad',
]){
 const m=structuredClone(approved);change(m.hostedAudioSupplements[0]);
 assert.throws(()=>validateHostedAudioSupplements(m,data,{stage:'publication',readBytes}));
}
const changedAfterGo=structuredClone(data);changedAfterGo.vocals[1].title+=' changed';
assert.throws(()=>validateHostedAudioSupplements(approved,changedAfterGo,{stage:'publication',readBytes}),/changé après GO/);
assert.throws(()=>validateHostedAudioChanges(approved,{courses:[d]},data,oldData,options),/supprimé/);
const revoked=structuredClone(manifest);
assert.throws(()=>validateHostedAudioChanges(approved,revoked,data,data,options),/GO ou revue/);

// Actual candidate: compare all signed data with the real Git base. Keep this
// integration coverage in addition to the adversarial in-memory contract tests.
const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const current=read('docs/course-deliveries.json');
const base=process.env.IFSI_BASE_SHA;
assert.match(base||'',/^[a-f0-9]{40}$/);
const old=file=>JSON.parse(execFileSync('git',['show',base+':'+file],{maxBuffer:32*1024*1024}));
function load(reader,m){
 const infographics=reader('infographics.json');
 const banks=Object.fromEntries([...new Set(m.courses.flatMap(d=>d.qcmBanks||[d.qcmBank].filter(Boolean)))].map(p=>[p,reader(p)]));
 return {registry:reader('course-registry-v741.json'),vocals:reader('vocals.json'),sheets:[1,2,3].flatMap(n=>reader(`sheets-${n}.json`)),infographics,banks,
  imageHashes:Object.fromEntries(infographics.filter(i=>i.localImage).map(i=>[i.localImage,createHash('sha256').update(fs.readFileSync(i.localImage)).digest('hex')])),vocabulary:reader('vocabulaire-v1.json').entries};
}
const previous=old('docs/course-deliveries.json'),previousData=load(old,previous),currentData=load(read,current);
const view=historicalAudioView(current,currentData);
validateHostedAudioChanges(previous,current,previousData,currentData,{stage:'preparation'});
const changed=validateChangedDeliveries(previous,current,previousData,currentData,{stage:'preparation'});
const independentlyApproved=current.courses.filter(d=>(d.updateContract==='official_reviewed_scoped_bundle_v1'||
 (d.deliveryMode==='first_release'&&['hybrid_v1','written_v1'].includes(d.packFormat)&&!previous.courses.some(old=>old.courseId===d.courseId))) &&
 JSON.stringify(d)!==JSON.stringify(previous.courses.find(old=>old.courseId===d.courseId)));
assert.deepEqual(changed.map(x=>x.courseId).sort(),independentlyApproved.map(x=>x.courseId).sort());

// A new full package must not be mistaken for a change to legacy supplements.
// These fixtures are in-memory test data, never saved as owner authorization.
{
 const v={id:'first_audio',courseId:'first',course:'Nouveau cours',number:1,title:'Rappel',mime:'audio/mpeg',durationSeconds:120,driveId:'new_drive',localAudio:'./assets/audio/first/one.mp3'};
 const artifact={vocalId:v.id,artifactId:v.id,path:v.localAudio.slice(2),sha256:hash,bytes:bytes.length,durationSeconds:120};
 const packageRow={courseId:'first',deliveryMode:'first_release',packFormat:'hybrid_v1',validated:true,status:'complete',vocals:[v.id],publicAudioArtifacts:[artifact],artifactSha256s:{new_drive:hash},audioOwnerReview:{status:'owner_listening_accepted',privateEvidenceSha256:'c'.repeat(64),artifactSha256s:{[v.id]:hash}},publicationApproval:{status:'approved',authorization:'explicit_go_publication',scope:'course_package',approvedAt:'2026-11-04T12:00:00Z',bundleSha256:'d'.repeat(64)}};
 packageRow.publicationHost='github_pages';
 const next={...approved,courses:[...approved.courses,packageRow]};
 const nextData={...data,registry:{courses:[...data.registry.courses,{id:'first',label:v.course,audioStatus:'available',audioCount:1}]},vocals:[...data.vocals,v]};
 assert.deepEqual([...firstReleaseAudioIds(approved,next,data,nextData,{readBytes})],[v.id]);
 const written=structuredClone(next);written.courses.at(-1).packFormat='written_v1';
 assert.deepEqual([...firstReleaseAudioIds(approved,written,data,nextData,{readBytes})],[v.id]);
 const noListening=structuredClone(written);noListening.courses.at(-1).audioOwnerReview.status='pending';
 assert.throws(()=>firstReleaseAudioIds(approved,noListening,data,nextData,{readBytes}));
 validateHostedAudioChanges(approved,next,data,nextData,{readBytes});
 for(const fault of [
  (m,x)=>m.courses.at(-1).publicationApproval.authorization='production_only',
  (m,x)=>m.courses.at(-1).audioOwnerReview.status='pending',
  (m,x)=>m.courses.at(-1).publicAudioArtifacts[0].sha256='0'.repeat(64),
  (m,x)=>m.courses.at(-1).publicAudioArtifacts[0].path='../private.mp3',
  (m,x)=>x.vocals.at(-1).durationSeconds=601,
  (m,x)=>x.vocals.at(-1).id='legacy',
  (m,x)=>x.vocals[0].title='historical changed',
  (m,x)=>x.vocals.push({...v,id:'undeclared'}),
 ]){
  const m=structuredClone(next),x=structuredClone(nextData);fault(m,x);
  assert.throws(()=>validateHostedAudioChanges(approved,m,data,x,{readBytes}));
 }
}
for(const s of current.hostedAudioSupplements||[]){
 const delivery=current.courses.find(d=>d.courseId===s.courseId);
 assert.deepEqual(delivery,previous.courses.find(d=>d.courseId===s.courseId),'Ancienne livraison et GO doivent rester identiques');
 const digest=bundleDigest(publicationBundle(s.courseId,delivery,view));
 assert.equal(digest,delivery.publicationApproval.bundleSha256,'Ancienne empreinte conservée');
 const technicalOnly=structuredClone(current);technicalOnly.courses.find(d=>d.courseId===s.courseId).qcmCount--;
 assert.throws(()=>validateChangedDeliveries(previous,technicalOnly,previousData,currentData,{stage:'preparation'}));
}
if(current.hostedAudioSupplements?.some(s=>s.status==='prepared')){
 assert.throws(()=>validateChangedDeliveries(previous,current,previousData,currentData),/HOSTED_AUDIO_GO_REQUIRED/);
 // Complete future publication path, still entirely in memory, with the actual
 // MP3 bytes. No real review/approval is recorded by this test.
 const hypothetical=structuredClone(current);approveForTest(hypothetical,currentData);
 assert.equal(validateChangedDeliveries(previous,hypothetical,previousData,currentData).length,0);
 assert.equal(validatePartChanges({...previousData,questions:[]},{...currentData,questions:[]},previous,hypothetical).resources,
  hypothetical.hostedAudioSupplements.flatMap(s=>s.vocalIds).length);
 const target=current.courses.find(d=>d.courseId===current.hostedAudioSupplements[0].courseId);
 for(const change of [
  x=>x.banks[target.qcmBank][0].question+=' altered',
  x=>x.sheets.find(s=>s.resourceId===target.sheetResourceId).url+='altered',
  x=>x.vocabulary.find(v=>v.courseIds?.includes(target.courseId)).definition+=' altered',
 ]){
  const bad=structuredClone(currentData);change(bad);
  assert.throws(()=>validateChangedDeliveries(previous,hypothetical,previousData,bad),'Le GO audio ne couvre pas une mutation pédagogique');
 }
 assert.equal(read('docs/course-deliveries.json').hostedAudioSupplements[0].publicationApproval,null,'Aucun accord synthétique écrit');
}
console.log('PASS compléments MP3 hébergés : préparation, empreintes historiques, ajouts exacts, octets, snapshots, revue et GO séparés ; mutations et faux accords refusés.');
