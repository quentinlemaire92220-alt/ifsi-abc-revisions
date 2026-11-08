import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {webcrypto} from 'node:crypto';
import {validateHostedAudioSupplements} from '../tools/hosted-audio-supplement-contract.mjs';
import {validateScopedRevisions,revisionDigest} from '../tools/scoped-course-revision-contract.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const precache=JSON.parse(fs.readFileSync('sw.js','utf8').match(/const BASE_ASSETS=(\[[^;]+\]);/)[1].replaceAll("'",'"'));
assert.equal(new Set(precache).size,precache.length,'Duplicate precache URLs prevent service-worker installation');
const manifest=read('docs/course-deliveries.json');validateScopedRevisions(manifest);
const series=read('audio-series-v1.json'),raw=read('vocals.json');
async function boot(data){const c={window:{},crypto:webcrypto,TextEncoder,Uint8Array,console:{error(){}},fetch:async()=>({ok:true,json:async()=>structuredClone(data)})};vm.runInNewContext(fs.readFileSync('audio-series-v1.js','utf8'),c);await c.window.IFSI_AUDIO_SERIES.ready;return c.window.IFSI_AUDIO_SERIES;}
const api=await boot(series);let count=0;
for(const r of manifest.scopedCourseRevisions.filter(r=>r.profile==='unified_sheet_media_v1')){
 const s=series.series.find(s=>s.id===r.audioSeriesId),old=read(r.baselinePath);
 const projected=JSON.parse(JSON.stringify(api.applyVocals(raw))).filter(v=>v.courseId===r.courseId);
 assert.deepEqual(projected,s.vocals);assert.equal(projected.length,6);
 assert.ok(projected.every(v=>old.rows['vocals.json'].some(x=>x.id===v.id)),'Listening identity reset');
 assert.equal(new Set(projected.map(v=>v.id)).size,6);assert.deepEqual(raw.filter(v=>v.courseId===r.courseId),old.rows['vocals.json']);
 assert.deepEqual(read(r.bankPath),old.bank);
 const alteredRegistry=read('course-registry-v741.json');alteredRegistry.courses.find(c=>c.id===r.courseId).label+=' altered';
 assert.throws(()=>validateHostedAudioSupplements(manifest,{registry:alteredRegistry,vocals:raw}),/Unreviewed course/,'Historical selection must not hide an unapproved course argument');

 for(const mutate of [x=>x.bankSha256='0'.repeat(64),x=>x.questionIds.pop(),x=>x.audioSeriesSha256='0'.repeat(64),x=>x.audioOwnerReview.status='pending',x=>x.fusionReview.originalBodyPagesPreserved=35,x=>x.sourceReview.receivedOralPartsReviewed=1,x=>x.ownerAcceptance.status='pending',x=>x.publicationApproval.bundleSha256='0'.repeat(64)]){
  const bad=structuredClone(manifest);mutate(bad.scopedCourseRevisions.find(x=>x.id===r.id));assert.throws(()=>validateScopedRevisions(bad));
 }
 for(const mutate of [x=>x.previousVocals[0].title+='changed',x=>x.vocals[0].id='unexpected_id',x=>x.previousArtifacts.pop(),x=>x.vocals[0].durationSeconds=600]){
  const bad=structuredClone(series),s2=bad.series.find(x=>x.id===s.id);mutate(s2);const {publicationApproval,...content}=s2;s2.publicationApproval.bundleSha256=revisionDigest(content);
  await assert.rejects(async()=>{const a=await boot(bad);a.applyVocals(raw);});
 }
 count++;
}
assert.ok(count>0);console.log('PASS unified revision: unchanged signed bank and history, exact new sheet/media, six stable listening IDs, eight package mutations and four media mutations rejected.');
