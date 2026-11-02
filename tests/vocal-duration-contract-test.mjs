import assert from 'node:assert/strict';
import {validateVocalDuration} from './vocal-duration-contract.mjs';
const hash='a'.repeat(64);
const vocal={id:'demo_02',courseId:'demo',durationSeconds:614.330667,durationException:{status:'owner_accepted',vocalId:'demo_02',courseId:'demo',durationSeconds:614.330667,sha256:hash,reason:'Explicit owner acceptance of this exact export',approvedAt:'2026-11-02T15:25:37Z'}};
assert.equal(validateVocalDuration(vocal,hash),true);
assert.equal(validateVocalDuration({id:'demo_01',courseId:'demo',durationSeconds:599.99},hash),true);
for(const seconds of [0,NaN,-1,600,614.330667])assert.throws(()=>validateVocalDuration({durationSeconds:seconds},hash));
for(const mutate of [
 v=>delete v.durationException,
 v=>v.durationException.status='pending',
 v=>v.durationException.vocalId='other',
 v=>v.durationException.courseId='other',
 v=>v.durationException.sha256='b'.repeat(64),
 v=>v.durationException.durationSeconds=615,
 v=>v.durationSeconds=615,
 v=>v.durationException.reason='',
 v=>v.durationException.approvedAt='invalid'
]){const changed=structuredClone(vocal);mutate(changed);assert.throws(()=>validateVocalDuration(changed,hash));}
console.log('PASS durée vocale : limite normale stricte, exception explicite bornée au fichier, cours et durée acceptés.');
