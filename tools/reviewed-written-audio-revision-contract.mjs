// Explicit, additive written package and audio series after an audio-only release.
// Existing signed deliveries and historical media remain unchanged.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {validateBank} from './qcm-bank-contract.mjs';
import {validateLeanFlashcards} from '../tests/lean-content-contract.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().filter(k=>v[k]!==undefined).map(k=>[k,canonical(v[k])])):v;
const digest=v=>createHash('sha256').update(JSON.stringify(canonical(v))).digest('hex');
const sha=v=>assert.match(v||'',/^[a-f0-9]{64}$/);
const origin='https://quentinlemaire92220-alt.github.io/ifsi-abc-revisions/';
export function validateReviewedWrittenAudioRevision(r,manifest,actual){
 assert.equal(r.profile,'reviewed_written_audio_v1');assert.equal(r.contract,'scoped_course_revision_v1');assert.equal(r.status,'approved');
 assert.match(r.baselinePath,/^docs\/course-revisions\/[a-z0-9_]+_baseline\.json$/);assert.equal(hash(r.baselinePath),r.baselineSha256);
 const old=read(r.baselinePath),course=actual.course;
 assert.equal(old.courseId,r.courseId);assert.equal(course.id,old.course.id);
 assert.equal(old.delivery.deliveryMode,'audio_only');assert.equal(old.delivery.publicationApproval.status,'approved');
 assert.deepEqual(manifest.courses.find(x=>x.courseId===r.courseId),old.delivery,'Historical signed delivery changed');
 const allowed=['officialSupportUrl','officialSupport','nativeSupportAvailable','canonicalQuestionIds','qcmPdfUrl','qcmPdfQuestionCount','flashcardsPdfUrl','flashcardTarget','authoredFlashcards','authoredFlashcardPresentation','vocabularyEntryIds','sourceStatus','provisional','sourceNote','primarySheetResourceId','additionalDocuments','activeDocumentUrls','activeVocalIds','audioStatus','audioCount','audioFolderUrl'];
 const strip=c=>Object.fromEntries(Object.entries(c).filter(([k])=>!allowed.includes(k)));
 assert.deepEqual(strip(course),strip(old.course),'Course identity changed');
 assert.equal(course.officialSupport,true);assert.equal(course.nativeSupportAvailable,true);assert.equal(course.sourceStatus,'official');assert.equal(course.provisional,false);
 assert.equal(r.sourceReview.officialSupportAvailable,true);assert.equal(r.sourceReview.receivedOralPartsReviewed,3);assert.equal(r.sourceReview.oralCoverageCertifiedComplete,true);
 assert.equal(r.sourceReview.independentClinicalSignoff,false);assert.equal(r.sourceReview.externalResearchPerformed,false);assert.equal(r.sourceReview.disputedAssessmentPointsExcluded,true);sha(r.sourceReview.privateEvidenceSha256);
 assert.match(r.bankPath,/^data\/course-banks\/[a-z0-9_-]+\.json$/);assert.equal(hash(r.bankPath),r.bankSha256);
 assert.equal(validateBank(actual.bank),r.questionIds.length);assert.deepEqual(actual.bank.map(q=>q.id),r.questionIds);
 assert.equal(new Set(r.questionIds).size,r.questionIds.length);assert.ok(actual.bank.every(q=>q.courseId===r.courseId));assert.deepEqual(course.canonicalQuestionIds,r.questionIds);
 const cards=actual.bank.flatMap(q=>q.flashcards);validateLeanFlashcards(cards);assert.equal(new Set(cards.map(c=>c.id)).size,cards.length);
 assert.equal(course.flashcardTarget,cards.length);assert.equal(course.authoredFlashcards,true);assert.equal(course.authoredFlashcardPresentation,'standalone_v1');assert.equal(course.qcmPdfQuestionCount,actual.bank.length);
 assert.deepEqual(read('questions-5.json').filter(q=>q.courseId===r.courseId),[...old.rows['questions-5.json'],...actual.bank]);
 const selected=actual.vocabulary.filter(v=>r.vocabularyEntryIds.includes(v.id));assert.equal(selected.length,r.vocabularyEntryIds.length);assert.equal(new Set(r.vocabularyEntryIds).size,selected.length);assert.deepEqual(course.vocabularyEntryIds,r.vocabularyEntryIds);
 assert.deepEqual(actual.vocabulary.filter(v=>!r.vocabularyEntryIds.includes(v.id)),old.vocabulary);
 assert.ok(selected.every(v=>v.courseIds.length===1&&v.courseIds[0]===r.courseId&&v.term&&v.definition));assert.equal(new Set(selected.map(v=>v.term.normalize('NFKC').toLocaleLowerCase('fr'))).size,selected.length);
 const sheet=actual.sheets.find(s=>s.resourceId===r.sheetResourceId);assert.equal(course.primarySheetResourceId,r.sheetResourceId);assert.equal(sheet?.primaryRevision,true);assert.equal(sheet.officialSupport,true);assert.equal(sheet.provisional,false);
 assert.deepEqual(actual.sheets.filter(s=>s.resourceId!==r.sheetResourceId),[1,2,3].flatMap(n=>old.rows[`sheets-${n}.json`]));
 assert.deepEqual(course.additionalDocuments.slice(0,(old.course.additionalDocuments||[]).length),old.course.additionalDocuments||[]);
 assert.deepEqual(r.publicArtifacts.map(a=>a.role),['sheet','qcm','flashcards']);
 for(const a of r.publicArtifacts){
  assert.match(a.path,/^assets\/[a-z0-9_-]+\/[A-Za-z0-9_]+\.pdf$/);assert.equal(hash(a.path),a.sha256);assert.equal(fs.statSync(a.path).size,a.bytes);assert.ok(Number.isSafeInteger(a.pageCount)&&a.pageCount>0);assert.equal(r.assistantPdfReview.pageCounts[a.role],a.pageCount);
  if(a.role!=='flashcards'){
   const ref=read('docs/pdf-template-policy-v3.json').references[a.role],review=r.templateConformance.artifacts[a.role];
   assert.equal(review.templateId,ref.id);assert.equal(review.templateSha256,ref.sha256);assert.equal(review.artifactSha256,a.sha256);assert.equal(review.pageCount,a.pageCount);
   assert.equal(review.status,'assistant_reviewed');assert.equal(review.ownerAcceptance,'explicit_application_update_authorized');assert.deepEqual(review.pagesChecked,Array.from({length:a.pageCount},(_,i)=>i+1));sha(review.privateEvidenceSha256);
  }
 }
 assert.equal(r.templateConformance.profile,'communication_v3_native_blocks');assert.equal(r.nativeDiagramReview.count,4);assert.equal(r.nativeDiagramReview.rasterImages,0);assert.equal(r.nativeDiagramReview.authorization,'explicit_user_request');sha(r.nativeDiagramReview.privateEvidenceSha256);
 assert.equal(sheet.url,origin+r.publicArtifacts[0].path);assert.equal(course.qcmPdfUrl,origin+r.publicArtifacts[1].path);assert.equal(course.flashcardsPdfUrl,origin+r.publicArtifacts[2].path);assert.deepEqual(course.activeDocumentUrls,[course.qcmPdfUrl,course.flashcardsPdfUrl,origin+r.officialSupportArtifact.path]);assert.equal(course.officialSupportUrl,r.officialSupportArtifact.url);
 const official=r.officialSupportArtifact;assert.equal(hash(official.path),official.sha256);assert.equal(fs.statSync(official.path).size,official.bytes);assert.equal(official.pageCount,105);assert.ok(official.driveId);assert.ok(course.additionalDocuments.some(d=>d.type==='official'&&d.url===origin+official.path));
 assert.equal(r.assistantPdfReview.allPagesChecked,true);sha(r.assistantPdfReview.privateEvidenceSha256);assert.equal(r.ownerAcceptance.status,'explicit_application_update_authorized');sha(r.ownerAcceptance.privateEvidenceSha256);assert.ok(Number.isFinite(Date.parse(r.ownerAcceptance.approvedAt)));
 assert.equal(r.audioOwnerReview.status,'owner_listening_accepted');sha(r.audioOwnerReview.privateEvidenceSha256);
 const ids=r.audioArtifacts.map(a=>a.vocalId);assert.equal(ids.length,4);assert.equal(new Set(ids).size,4);assert.deepEqual(course.activeVocalIds,ids);assert.equal(course.audioCount,actual.vocals.length);assert.equal(course.audioStatus,'available');
 assert.deepEqual(actual.vocals.filter(v=>!ids.includes(v.id)),old.rows['vocals.json'],'Historical voices changed');assert.equal(actual.vocals.length,old.rows['vocals.json'].length+4);
 for(const a of r.audioArtifacts){
  assert.match(a.path,/^assets\/audio\/[a-z0-9_-]+\/[A-Za-z0-9_]+\.mp3$/);assert.equal(hash(a.path),a.sha256);assert.equal(fs.statSync(a.path).size,a.bytes);
  const row=actual.vocals.find(v=>v.id===a.vocalId);assert.equal(row?.localAudio,'./'+a.path);assert.equal(row.courseId,r.courseId);assert.equal(row.durationSeconds,a.durationSeconds);assert.ok(row.driveId&&row.url);assert.ok(a.durationSeconds>0&&a.durationSeconds<=720);
  if(a.durationSeconds>=600){assert.equal(row.durationException?.status,'owner_accepted');assert.ok(Number.isFinite(Date.parse(row.durationException.approvedAt)));}
 }
 assert.equal(r.pedagogicalNonRegression.sheetSha256,r.publicArtifacts[0].sha256);sha(r.pedagogicalNonRegression.privateEvidenceSha256);
 const approval=r.publicationApproval;assert.equal(approval?.status,'approved');assert.equal(approval.authorization,'explicit_go_publication');assert.equal(approval.scope,'scoped_course_revision');assert.ok(Number.isFinite(Date.parse(approval.approvedAt)));assert.equal(approval.bundleSha256,digest(actual),'Revision changed after GO');
 return true;
}
