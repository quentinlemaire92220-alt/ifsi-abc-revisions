import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createHash,webcrypto} from 'node:crypto';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const manifest=read('audio-series-v1.json'),code=fs.readFileSync('audio-series-v1.js','utf8');
async function boot(m){const c={window:{},crypto:webcrypto,TextEncoder,Uint8Array,console:{error(){}},fetch:async()=>({ok:true,json:async()=>structuredClone(m)})};vm.runInNewContext(code,c);await c.window.IFSI_AUDIO_SERIES.ready;return c.window.IFSI_AUDIO_SERIES;}
const api=await boot(manifest),old=read('vocals.json'),registry=read('course-registry-v741.json');
for(const s of manifest.series.filter(s=>s.reviewContract==='provided_audio_series_v1')){
 const voices=JSON.parse(JSON.stringify(api.applyVocals(old))).filter(v=>v.courseId===s.courseId);
 assert.deepEqual(voices,s.vocals);assert.equal(api.applyRegistry(registry).courses.find(c=>c.id===s.courseId).audioCount,voices.length);
 assert.deepEqual(s.replaces,old.filter(v=>v.courseId===s.courseId).map(v=>v.id));
 assert.deepEqual(JSON.parse(JSON.stringify(api.downloadsFor(s.courseId))),s.downloads);
 for(const a of [...s.artifacts,...s.downloads]){const bytes=fs.readFileSync(a.path);assert.equal(bytes.length,a.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),a.sha256);}
 for(const mutate of [x=>x.sourceArchive.driveId='',x=>x.review.independentHumanListening=true,x=>x.review.decodedVocalIds.pop(),x=>x.review.scriptSha256s={},x=>x.downloads[0].path='../private.zip',x=>x.downloads[0].sha256='0'.repeat(64),x=>x.vocals[0].title+='changed',x=>x.publicationApproval.authorization='production_only']){
  const bad=structuredClone(manifest);mutate(bad.series.find(x=>x.id===s.id));await assert.rejects(boot(bad));
 }
 const rawRegistry=JSON.stringify(registry.courses.find(c=>c.id===s.courseId));assert.ok(rawRegistry.includes('canonicalQuestionIds'));
}
assert.deepEqual(JSON.parse(JSON.stringify(api.downloadsFor('unknown_course'))),[]);
console.log('PASS provided audio: ordered active series, original archive, exact MP3/ZIP bytes, truthful review scope, and eight tampering cases.');
