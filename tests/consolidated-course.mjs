import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
import {validateConsolidations,consolidationBeforeJson,consolidationDigest} from '../tools/consolidated-course-contract.mjs';
import {runtimeDeck} from './flashcards-runtime-fixture.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),m=read('docs/course-deliveries.json');validateConsolidations(m);
const runtime=await runtimeDeck();
for(const r of m.consolidatedCourseRevisions||[]){
 const resource=runtime.window.IFSI_V741.resourcesForCourse(r.courseId),bank=read(r.bankPath),b=read(r.baselinePath);
 assert.deepEqual(Array.from(resource.questions,q=>q.id),r.questionIds);
 const cards=runtime.deck.filter(c=>c.courseId===r.courseId&&!String(c.id).startsWith('voc:'));assert.equal(cards.length,128);assert.equal(new Set(cards.map(c=>c.id)).size,128);assert.ok(cards.every(c=>r.questionIds.includes(c.qid)));
 assert.equal(runtime.window.IFSI_VOCAB.countForCourse(r.courseId),107);
 const a=read('audio-series-v1.json'),ctx={window:{},crypto:webcrypto,TextEncoder,Uint8Array,console:{error(){}},fetch:async()=>({ok:true,json:async()=>structuredClone(a)})};vm.runInNewContext(fs.readFileSync('audio-series-v1.js','utf8'),ctx);await ctx.window.IFSI_AUDIO_SERIES.ready;
 const projected=JSON.parse(JSON.stringify(ctx.window.IFSI_AUDIO_SERIES.applyVocals(read('vocals.json')))),s=a.series.find(s=>s.id===r.audioSeriesId);assert.deepEqual(projected.filter(v=>v.courseId===r.courseId),s.vocals);assert.equal(new Set(projected.map(v=>v.id)).size,projected.length);
 assert.deepEqual(consolidationBeforeJson(m,'audio-series-v1.json',a).series.find(s=>s.courseId===r.courseId),b.series);
 for(const mutate of [x=>x.bankSha256='0'.repeat(64),x=>x.questionIds.pop(),x=>x.audioSeriesSha256='0'.repeat(64),x=>x.audioOwnerReview.humanListeningAttested=false,x=>x.sourceReview.independentClinicalSignoff=true,x=>x.assistantPdfReview.allPagesChecked=false,x=>x.publicArtifacts[0].sha256='0'.repeat(64),x=>x.vocabularyEntryIds.pop(),x=>x.ownerAcceptance.status='pending',x=>x.publicationApproval.bundleSha256='0'.repeat(64)]){
  const bad=structuredClone(m);mutate(bad.consolidatedCourseRevisions.find(x=>x.id===r.id));assert.throws(()=>validateConsolidations(bad));
 }
 for(const mutate of [s=>s.appendedVocalIds.pop(),s=>s.previousArtifacts.pop(),s=>s.previousVocals[0].title+='changed']){
  const bad=structuredClone(a),bs=bad.series.find(s=>s.id===r.audioSeriesId);mutate(bs);const {publicationApproval,...content}=bs;bs.publicationApproval.bundleSha256=consolidationDigest(content);
  const c={...ctx,window:{},fetch:async()=>({ok:true,json:async()=>bad})};vm.runInNewContext(fs.readFileSync('audio-series-v1.js','utf8'),c);await assert.rejects(async()=>{await c.window.IFSI_AUDIO_SERIES.ready;c.window.IFSI_AUDIO_SERIES.applyVocals(read('vocals.json'));});
 }
 assert.deepEqual(bank.slice(0,104),b.bank);
}
console.log('PASS consolidation: actual 128 QCM/cards, 107 definitions, 8 MP3, six stable IDs, history and thirteen tampering cases');
