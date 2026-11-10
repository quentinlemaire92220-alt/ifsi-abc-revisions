// Provided MP3s accepted for publication after technical review.
// This contract never presents an unperformed speech/listening review as completed.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
const sha=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x);
export function validateReceivedAudioOnly(course,d,vocals){
 assert.equal(d.audioOnlyContract,'received_audio_v1');
 assert.equal(d.deliveryMode,'audio_only');assert.equal(d.status,'partial');
 assert.equal(d.publicationScope,'audio_only');assert.equal(d.validated,true);
 const a=d.publicationApproval;
 assert.equal(a?.status,'approved');assert.equal(a.authorization,'explicit_go_publication');assert.equal(a.scope,'audio_only');
 assert.ok(sha(a.privateEvidenceSha256));assert.ok(Number.isFinite(Date.parse(a.approvedAt)));
 assert.equal(d.sourceBasis?.kind,'official_support_and_transcript');
 assert.equal(d.sourceBasis.nativeSupportAvailable,true);assert.equal(d.sourceBasis.limitationsDeclared,true);
 const r=d.receivedAudioReview;
 assert.equal(r?.documentaryReview,'completed');assert.equal(r.decodeReview,'completed');
 assert.equal(r.speechAndPronunciationReview,'not_performed_user_declined');
 assert.equal(r.independentListeningAttested,false);assert.equal(r.ownerPublicationConsent,'explicit');
 assert.equal(r.privateSourcesPreserved,true);assert.ok(sha(r.privateEvidenceSha256));assert.ok(sha(r.sourceArchiveSha256));
 const rows=vocals.filter(v=>v.courseId===course.id);
 assert.equal(rows.length,d.vocals.length);assert.equal(r.episodes.length,rows.length);
 assert.deepEqual(new Set(rows.map(v=>v.id)),new Set(d.vocals));
 assert.equal(new Set(r.episodes.map(e=>e.vocalId)).size,rows.length);
 assert.equal(d.publicAudioArtifacts.length,rows.length);
 for(const [i,v] of rows.entries()){
  const e=r.episodes.find(e=>e.vocalId===v.id),file=d.publicAudioArtifacts.find(f=>f.vocalId===v.id);
  assert.ok(e&&file);assert.equal(v.number,i+1);
  assert.ok(Number.isFinite(v.durationSeconds)&&v.durationSeconds>0&&v.durationSeconds<600);
  assert.equal(e.durationSeconds,v.durationSeconds);assert.equal(e.fullStreamDecoded,true);
  assert.ok(sha(e.audioSha256)&&sha(e.scriptSha256));assert.equal(e.audioSha256,d.artifactSha256s[v.driveId]);
  assert.ok(Number.isInteger(e.scriptQuestionCount)&&e.scriptQuestionCount>0);
  assert.match(v.localAudio,/^\.\/assets\/audio\/[a-z0-9_-]+\/[A-Za-z0-9_]+\.mp3$/);
  assert.equal(file.path,v.localAudio.slice(2));assert.equal(file.driveId,v.driveId);assert.equal(file.sha256,e.audioSha256);
  assert.ok(Number.isSafeInteger(file.bytes)&&file.bytes>1024);assert.equal(file.mime,'audio/mpeg');
 }
 assert.ok(d.blockers.some(x=>x.resource==='official_support'&&x.reason==='private_pending'));
 return true;
}
// Reconstruct historical global catalogues only after validating the independently
// approved new audio course. Every older row remains untouched and old hashes
// must still match exactly in the caller.
export function receivedAudioBeforeJson(path,value){
 if(!['vocals.json','docs/course-deliveries.json'].includes(path))return value;
 const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
 const manifest=read('docs/course-deliveries.json'),registry=read('course-registry-v741.json');
 const voices=path==='vocals.json'?value:read('vocals.json');
 for(const d of manifest.courses.filter(d=>d.audioOnlyContract==='received_audio_v1')){
  validateReceivedAudioOnly(registry.courses.find(c=>c.id===d.courseId),d,voices);
  for(const f of d.publicAudioArtifacts){const bytes=fs.readFileSync(f.path);assert.equal(bytes.length,f.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),f.sha256);}
  if(path==='vocals.json'){const added=new Set(d.vocals);value=value.filter(v=>!added.has(v.id));}
  else value={...value,courses:value.courses.filter(c=>c.courseId!==d.courseId)};
 }
 return value;
}
