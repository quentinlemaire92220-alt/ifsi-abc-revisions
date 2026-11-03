// A complete written addition to a previously signed audio-only delivery.
// This contract has no authority to approve new audio or alter historical rows.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {validateBank} from './qcm-bank-contract.mjs';
import {validateLeanFlashcards} from '../tests/lean-content-contract.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().filter(k=>v[k]!==undefined).map(k=>[k,canonical(v[k])])):v;
const digest=v=>createHash('sha256').update(JSON.stringify(canonical(v))).digest('hex');
const sha=v=>assert.match(v||'',/^[a-f0-9]{64}$/);
const origin='https://quentinlemaire92220-alt.github.io/ifsi-abc-revisions/';
export function validateCompleteWrittenRevision(r,manifest,actual){
 assert.equal(r.profile,'official_complete_written_v1');assert.equal(r.contract,'scoped_course_revision_v1');assert.equal(r.status,'approved');
 assert.match(r.baselinePath,/^docs\/course-revisions\/[a-z0-9_]+_baseline\.json$/);
 assert.equal(hash(r.baselinePath),r.baselineSha256);
 const old=read(r.baselinePath),course=actual.course;
 assert.equal(old.courseId,r.courseId);assert.equal(old.course.id,r.courseId);
 assert.equal(old.delivery.deliveryMode,'audio_only');assert.equal(old.delivery.publicationApproval.status,'approved');
 assert.deepEqual(manifest.courses.find(d=>d.courseId===r.courseId),old.delivery,'Historical delivery changed');
 const allowed=['officialSupport','nativeSupportAvailable','canonicalQuestionIds','qcmPdfUrl','qcmPdfQuestionCount','flashcardsPdfUrl','flashcardTarget','authoredFlashcards','authoredFlashcardPresentation','vocabularyEntryIds','sourceStatus','provisional','sourceNote','primarySheetResourceId','additionalDocuments','activeDocumentUrls'];
 const strip=c=>Object.fromEntries(Object.entries(c).filter(([k])=>!allowed.includes(k)));
 assert.deepEqual(strip(course),strip(old.course),'Identity or historical audio metadata changed');
 assert.equal(course.officialSupport,true);assert.equal(course.nativeSupportAvailable,true);assert.equal(course.sourceStatus,'official');assert.equal(course.provisional,false);
 assert.deepEqual(actual.vocals,old.rows['vocals.json'],'Historical audio changed');
 assert.deepEqual(r.audioArtifacts,[]);assert.equal(r.audioOwnerReview.status,'not_applicable_no_new_audio');
 assert.equal(r.sourceReview.officialSupportAvailable,true);assert.equal(r.sourceReview.receivedOralPartsReviewed,4);
 assert.equal(r.sourceReview.oralCoverageCertifiedComplete,true);assert.equal(r.sourceReview.independentClinicalSignoff,false);
 assert.equal(r.sourceReview.externalResearchPerformed,true);assert.equal(r.sourceReview.verifiedCorrectionsDisclosed,true);
 assert.equal(r.sourceReview.disputedAssessmentPointsExcluded,true);sha(r.sourceReview.privateEvidenceSha256);
 assert.match(r.bankPath,/^data\/course-banks\/[a-z0-9_-]+\.json$/);
 assert.equal(hash(r.bankPath),r.bankSha256);assert.equal(validateBank(actual.bank),r.questionIds.length);
 assert.deepEqual(actual.bank.map(q=>q.id),r.questionIds);assert.ok(actual.bank.every(q=>q.courseId===r.courseId));
 assert.equal(new Set(r.questionIds).size,r.questionIds.length);assert.deepEqual(course.canonicalQuestionIds,r.questionIds);
 const cards=actual.bank.flatMap(q=>q.flashcards);validateLeanFlashcards(cards);
 assert.equal(new Set(cards.map(c=>c.id)).size,cards.length);assert.equal(course.flashcardTarget,cards.length);
 assert.equal(course.authoredFlashcards,true);assert.equal(course.authoredFlashcardPresentation,'standalone_v1');assert.equal(course.qcmPdfQuestionCount,actual.bank.length);
 assert.deepEqual(read('questions-5.json').filter(q=>q.courseId===r.courseId),[...old.rows['questions-5.json'],...actual.bank]);
 const selected=actual.vocabulary.filter(v=>r.vocabularyEntryIds.includes(v.id));
 assert.equal(selected.length,r.vocabularyEntryIds.length);assert.equal(new Set(r.vocabularyEntryIds).size,selected.length);
 assert.deepEqual(course.vocabularyEntryIds,r.vocabularyEntryIds);
 assert.deepEqual(actual.vocabulary.filter(v=>!r.vocabularyEntryIds.includes(v.id)),old.vocabulary);
 assert.ok(selected.every(v=>v.courseIds.length===1&&v.courseIds[0]===r.courseId&&v.term&&v.definition));
 assert.equal(new Set(selected.map(v=>v.term.normalize('NFKC').toLocaleLowerCase('fr'))).size,selected.length);
 const sheet=actual.sheets.find(s=>s.resourceId===r.sheetResourceId);
 assert.equal(course.primarySheetResourceId,r.sheetResourceId);assert.equal(sheet?.primaryRevision,true);assert.equal(sheet.provisional,false);assert.equal(sheet.officialSupport,true);
 assert.deepEqual(actual.sheets.filter(s=>s.resourceId!==r.sheetResourceId),[1,2,3].flatMap(n=>old.rows[`sheets-${n}.json`]));
 assert.deepEqual(course.additionalDocuments.slice(0,(old.course.additionalDocuments||[]).length),old.course.additionalDocuments||[]);
 assert.deepEqual(r.publicArtifacts.map(a=>a.role),['sheet','qcm','flashcards']);
 for(const a of r.publicArtifacts){
  assert.match(a.path,/^assets\/[a-z0-9_-]+\/[A-Za-z0-9_]+\.pdf$/);assert.equal(hash(a.path),a.sha256);assert.equal(fs.statSync(a.path).size,a.bytes);
  assert.ok(Number.isSafeInteger(a.pageCount)&&a.pageCount>0);assert.equal(r.assistantPdfReview.pageCounts[a.role],a.pageCount);
  if(a.role!=='flashcards'){
   const ref=read('docs/pdf-template-policy-v3.json').references[a.role],review=r.templateConformance.artifacts[a.role];
   assert.equal(review.templateId,ref.id);assert.equal(review.templateSha256,ref.sha256);assert.equal(review.artifactSha256,a.sha256);assert.equal(review.pageCount,a.pageCount);
   assert.equal(review.status,'assistant_reviewed');assert.equal(review.ownerAcceptance,'explicit_application_update_authorized');
  }
 }
 assert.equal(r.templateConformance.profile,'compact_thematic_lexicon_v1');
 assert.equal(sheet.url,origin+r.publicArtifacts[0].path);assert.equal(course.qcmPdfUrl,origin+r.publicArtifacts[1].path);assert.equal(course.flashcardsPdfUrl,origin+r.publicArtifacts[2].path);
 assert.deepEqual(course.activeDocumentUrls,[course.qcmPdfUrl,course.flashcardsPdfUrl]);
 assert.equal(r.assistantPdfReview.allPagesChecked,true);sha(r.assistantPdfReview.privateEvidenceSha256);
 assert.equal(r.ownerAcceptance.status,'explicit_application_update_authorized');sha(r.ownerAcceptance.privateEvidenceSha256);assert.ok(Number.isFinite(Date.parse(r.ownerAcceptance.approvedAt)));
 assert.equal(r.pedagogicalNonRegression.sheetSha256,r.publicArtifacts[0].sha256);sha(r.pedagogicalNonRegression.privateEvidenceSha256);
 const a=r.publicationApproval;assert.equal(a.status,'approved');assert.equal(a.authorization,'explicit_go_publication');assert.equal(a.scope,'scoped_course_revision');assert.ok(Number.isFinite(Date.parse(a.approvedAt)));
 assert.equal(a.bundleSha256,digest(actual),'Written revision changed after GO');
 return true;
}
