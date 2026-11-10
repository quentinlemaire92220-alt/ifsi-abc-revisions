// A new unified sheet and an accepted replacement playlist share the existing
// question bank, vocabulary and signed historical delivery without editing them.
import {historicalSeries} from './consolidated-course-contract.mjs';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {preservedBeforeCorrections} from './reconciled-correction-contract.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
export const unifiedDigest=v=>createHash('sha256').update(JSON.stringify(canonical(v))).digest('hex');
const hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const proof=v=>assert.match(v||'',/^[a-f0-9]{64}$/);
const origin='https://quentinlemaire92220-alt.github.io/ifsi-abc-revisions/';
export function validateUnifiedSheetMedia(r,manifest,actual){
 assert.equal(r.profile,'unified_sheet_media_v1');assert.equal(hash(r.baselinePath),r.baselineSha256);
 const old=read(r.baselinePath),course=actual.course;
 assert.equal(old.courseId,r.courseId);assert.equal(course.id,r.courseId);
 assert.deepEqual(manifest.courses.find(d=>d.courseId===r.courseId),old.delivery,'Original signed delivery changed');
 const permitted=new Set(['primarySheetResourceId','activeVocalIds','activeDocumentUrls','additionalDocuments','qcmPdfUrl','flashcardsPdfUrl','sourceNote']);
 const strip=c=>Object.fromEntries(Object.entries(c).filter(([k])=>!permitted.has(k)));
 assert.deepEqual(strip(course),strip(old.course),'Course outside reviewed selection changed');
 assert.equal(course.officialSupport,true);assert.equal(course.provisional,false);
 assert.equal(r.bankPath,old.delivery.qcmBank);assert.equal(hash(r.bankPath),r.bankSha256);assert.equal(r.bankSha256,old.bankSha256);
 assert.deepEqual(actual.bank,old.bank);assert.deepEqual(r.questionIds,actual.bank.map(q=>q.id));assert.deepEqual(course.canonicalQuestionIds,r.questionIds);
 assert.deepEqual(actual.vocabulary,old.vocabulary);assert.deepEqual(r.vocabularyEntryIds,old.course.vocabularyEntryIds);
 for(const x of old.preservedFiles)assert.equal(preservedBeforeCorrections(x.path,manifest,x.sha256),x.sha256,'Existing exercise/vocabulary file changed outside an independently approved correction');
 assert.deepEqual(actual.vocals,old.rows['vocals.json'],'Raw historical audio must stay intact');
 const sheet=actual.sheets.find(s=>s.resourceId===r.sheetResourceId);
 assert.ok(sheet);assert.equal(sheet.primaryRevision,true);assert.equal(sheet.officialSupport,true);assert.equal(sheet.provisional,false);assert.equal(sheet.pageCount,r.publicArtifacts[0].pageCount);
 assert.equal(course.primarySheetResourceId,r.sheetResourceId);
 assert.deepEqual(actual.sheets.filter(s=>s.resourceId!==r.sheetResourceId),[1,2,3].flatMap(n=>old.rows[`sheets-${n}.json`]));
 assert.deepEqual(r.publicArtifacts.map(a=>a.role),['sheet','qcm','flashcards']);
 for(const a of r.publicArtifacts){
  assert.match(a.path,/^assets\/[a-z0-9_-]+\/[A-Za-z0-9_]+\.pdf$/);assert.equal(hash(a.path),a.sha256);assert.equal(fs.statSync(a.path).size,a.bytes);assert.ok(a.pageCount>0);
  assert.equal(r.assistantPdfReview.pageCounts[a.role],a.pageCount);
  if(a.role!=='flashcards'){
   const review=r.templateConformance.artifacts[a.role],reference=read('docs/pdf-template-policy-v3.json').references[a.role];
   assert.equal(review.templateId,reference.id);assert.equal(review.templateSha256,reference.sha256);assert.equal(review.artifactSha256,a.sha256);assert.equal(review.pageCount,a.pageCount);assert.equal(review.status,'assistant_reviewed');proof(review.privateEvidenceSha256);
  }
 }
 assert.equal(sheet.url,origin+r.publicArtifacts[0].path);assert.equal(course.qcmPdfUrl,origin+r.publicArtifacts[1].path);assert.equal(course.flashcardsPdfUrl,origin+r.publicArtifacts[2].path);
 assert.deepEqual(course.activeDocumentUrls,[course.qcmPdfUrl,course.flashcardsPdfUrl]);
 assert.equal(r.assistantPdfReview.allPagesChecked,true);proof(r.assistantPdfReview.privateEvidenceSha256);
 assert.equal(r.sourceReview.receivedOralPartsReviewed,2);assert.equal(r.sourceReview.oralCoverageCertifiedComplete,true);assert.equal(r.sourceReview.officialSupportAvailable,true);assert.equal(r.sourceReview.independentClinicalSignoff,false);assert.equal(r.sourceReview.externalResearchPerformed,false);proof(r.sourceReview.privateEvidenceSha256);
 assert.equal(r.fusionReview.originalBodyPagesPreserved,36);assert.equal(r.fusionReview.nativeDiagramCount,4);assert.equal(r.fusionReview.sourceDocuments,4);proof(r.fusionReview.privateEvidenceSha256);
 const series=historicalSeries(manifest,r.audioSeriesId);
 assert.ok(series);assert.equal(unifiedDigest(series),r.audioSeriesSha256);assert.equal(series.courseId,r.courseId);assert.equal(series.preserveVocalIds,true);assert.deepEqual(series.previousVocals,old.rows['vocals.json']);assert.deepEqual(series.replaces,old.rows['vocals.json'].map(v=>v.id));assert.equal(series.vocals.length,6);
 assert.deepEqual(course.activeVocalIds,series.vocals.map(v=>v.id));assert.ok(series.vocals.every(v=>series.replaces.includes(v.id)));
 for(const a of [...series.artifacts,...series.previousArtifacts]){assert.equal(hash(a.path),a.sha256);assert.equal(fs.statSync(a.path).size,a.bytes);}
 assert.equal(r.audioArtifacts.length,0,'Replacement audio is checked through the signed series');
 assert.equal(r.audioOwnerReview.status,'owner_listening_accepted');proof(r.audioOwnerReview.privateEvidenceSha256);
 assert.equal(r.ownerAcceptance.status,'explicit_application_update_authorized');proof(r.ownerAcceptance.privateEvidenceSha256);assert.ok(Number.isFinite(Date.parse(r.ownerAcceptance.approvedAt)));
 assert.equal(r.publicationApproval?.status,'approved');assert.equal(r.publicationApproval.authorization,'explicit_go_publication');assert.equal(r.publicationApproval.scope,'scoped_course_revision');assert.equal(r.publicationApproval.bundleSha256,unifiedDigest(actual),'Unified revision changed after GO');
 return true;
}
