import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {runtimeDeck} from './flashcards-runtime-fixture.mjs';
import {beforeAdditiveCourses} from '../tools/additive-course-history.mjs';
import {firstReleaseAudioIds} from '../tools/hosted-audio-supplement-contract.mjs';
import {validateBank} from '../tools/qcm-bank-contract.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const id='psychologie_developpement',manifest=read('docs/course-deliveries.json'),d=manifest.courses.find(x=>x.courseId===id),r=await runtimeDeck({loadResources:true});
const course=r.registry.courses.find(x=>x.id===id),bank=read(d.qcmBank),questions=r.questions.filter(q=>q.courseId===id),cards=r.deck.filter(c=>c.courseId===id&&!c.id.startsWith('voc:'));
assert.deepEqual(questions,bank);assert.equal(questions.length,62);assert.equal(cards.length,90);
assert.equal(validateBank(bank,id,{reviewedSourceComparisonFields:d.sourceAttributionReview.fields}),62);
const missingContext=structuredClone(bank);missingContext[0].question='Dans la vignette absente du support, quel soin est recommandé ?';assert.throws(()=>validateBank(missingContext,id,{reviewedSourceComparisonFields:d.sourceAttributionReview.fields}));
const alteredAttribution=structuredClone(bank);alteredAttribution[1].flashcards[0].front+=' Consulter la vignette du TD.';assert.throws(()=>validateBank(alteredAttribution,id,{reviewedSourceComparisonFields:d.sourceAttributionReview.fields}));
assert.equal(new Set(cards.map(c=>c.front)).size,90);assert.equal(r.window.IFSI_VOCAB.countForCourse(id),194);
for(const q of bank)for(const f of q.flashcards){
 const actual=cards.find(c=>c.qid===q.id&&c.sourceFront===f.front);assert.ok(actual);assert.equal(actual.front,f.displayFront||f.front);assert.deepEqual(Array.from(actual.answers),f.answers);assert.equal(actual.explanation,f.explanation);
}
const sw=fs.readFileSync('sw.js','utf8'),ctx={console,Response,Blob,DecompressionStream,TextDecoder,Uint8Array,atob};vm.createContext(ctx);vm.runInContext(sw.slice(0,sw.indexOf("self.addEventListener('install'")),ctx);
ctx.q=bank.find(q=>q.id==='psydev_q053');assert.equal(vm.runInContext('keepQuestion(q)',ctx),true);
ctx.q={...ctx.q,question:'Sur la figure absente, que désigne le repère A ?'};assert.equal(vm.runInContext('keepQuestion(q)',ctx),false);
const all=read('questions-5.json'),before=beforeAdditiveCourses('questions-5.json',all,manifest);
assert.ok(!before.some(q=>q.courseId===id));assert.deepEqual(before,all.filter(q=>q.courseId!==id));
const mutated=structuredClone(all);mutated.find(q=>q.courseId!==id).question+=' unauthorized';assert.notDeepEqual(beforeAdditiveCourses('questions-5.json',mutated,manifest),before,'Historical corruption must remain visible to old checksum guards');
const oldData={registry:{courses:r.registry.courses.filter(c=>c.id!==id)},vocals:read('vocals.json').filter(v=>v.courseId!==id)},newData={registry:r.registry,vocals:read('vocals.json')},prior={courses:manifest.courses.filter(c=>c.courseId!==id)};
assert.equal(firstReleaseAudioIds(prior,manifest,oldData,newData).size,6);
for(const mutation of [x=>x.provisional=false,x=>x.pedagogicalValidated=true,x=>x.audioOwnerReview.fullTechnicalDecode=false,x=>x.audioOwnerReview.humanListeningAttested=true,x=>x.publicAudioArtifacts[0].sha256='0'.repeat(64),x=>x.audioOwnerReview.status='pending']){
 const m=structuredClone(manifest);mutation(m.courses.find(c=>c.courseId===id));assert.throws(()=>firstReleaseAudioIds(prior,m,oldData,newData));
}
assert.equal(course.provisional,true);assert.equal(course.officialSupport,false);assert.equal(d.status,'partial');
console.log('PASS Psychologie du développement:62QCM,90unchanged unique cards,194definitions,6exact MP3, historical rows preserved, missing-figure and dishonest-review faults rejected.');
