// Additive facsimile support: screenshots remain visibly unofficial and separate
// from the authored revision sheet. No historical delivery is reclassified.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {pagesOrigin,pagesPrefix} from './public-artifact-contract.mjs';
export function validateCaptureSupport(course,delivery){
 if(!delivery.captureSupport)return false;
 const s=delivery.captureSupport;
 assert.equal(s.contract,'course_capture_facsimile_v1');
 assert.equal(course.provisional,true);assert.equal(course.officialSupport,false);
 assert.equal(delivery.status,'partial');assert.equal(delivery.pedagogicalValidated,false);
 assert.equal(s.facsimileNotOfficial,true);assert.equal(s.nativeResolutionPreserved,true);
 assert.equal(s.sourcePixelsPreserved,true);
 for(const k of ['sourceImageCount','uniqueSlideCount','redundantVariants','excludedViews','pageCount'])assert.ok(Number.isInteger(s[k])&&s[k]>0,k);
 assert.equal(s.sourceImageCount,s.uniqueSlideCount+s.redundantVariants+s.excludedViews);
 assert.equal(s.pageCount,s.uniqueSlideCount+1);
 assert.ok(s.missingCaptureSections.length>0&&s.laterallyTruncatedCaptureNumbers.length>0);
 assert.match(s.sourceReviewEvidenceSha256,/^[a-f0-9]{64}$/);
 assert.deepEqual(Object.keys(delivery.supportingArtifacts),['captures']);
 for(const a of [...Object.values(delivery.supportingArtifacts),...delivery.downloadArtifacts]){
  assert.match(a.path,/^assets\/[\w-]+\/[\w.-]+\.(?:pdf|zip)$/);
  assert.ok(!a.path.split('/').includes('..'));
  const bytes=fs.readFileSync(a.path);
  assert.equal(bytes.length,a.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),a.sha256);
  assert.equal(delivery.artifactSha256s[a.artifactId],a.sha256);
  const url=pagesOrigin+pagesPrefix+a.path;
  assert.ok(course.additionalDocuments.some(d=>d.url===url));
  assert.ok(course.activeDocumentUrls.includes(url));
 }
 const capture=delivery.supportingArtifacts.captures;
 assert.equal(capture.pageCount,s.pageCount);
 const doc=course.additionalDocuments.find(d=>d.url.endsWith(capture.path));
 assert.equal(doc.label,s.studentLabel);assert.match(doc.label,/non officiel/i);
 assert.ok(!Object.hasOwn(delivery.publicArtifacts,'captures'),'Facsimile must remain outside authored PDF roles');
 return true;
}
