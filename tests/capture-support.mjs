import fs from 'node:fs';
import assert from 'node:assert/strict';
import {validateCaptureSupport} from '../tools/capture-support-contract.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const registry=read('course-registry-v741.json');
const deliveries=read('docs/course-deliveries.json').courses.filter(d=>d.captureSupport);
assert.ok(deliveries.length>0);
for(const d of deliveries){
 const c=registry.courses.find(c=>c.id===d.courseId);validateCaptureSupport(c,d);
 for(const change of [x=>x.captureSupport.sourcePixelsPreserved=false,x=>x.captureSupport.facsimileNotOfficial=false,x=>x.captureSupport.sourceImageCount++,x=>x.captureSupport.pageCount++,x=>x.supportingArtifacts.captures.sha256='0'.repeat(64),x=>x.supportingArtifacts.captures.path='../outside.pdf',x=>x.captureSupport.missingCaptureSections=[],x=>x.status='complete',x=>x.pedagogicalValidated=true]){
  const bad=structuredClone(d);change(bad);assert.throws(()=>validateCaptureSupport(c,bad));
 }
 const badCourse=structuredClone(c);badCourse.additionalDocuments=badCourse.additionalDocuments.filter(x=>!x.url.endsWith(d.supportingArtifacts.captures.path));assert.throws(()=>validateCaptureSupport(badCourse,d));
}
console.log('PASS captures: unofficial facsimiles, exact bytes, source limitations, download links and 10 rejected faults.');
