import {validateVerifiedDocumentsAddition} from './verified-documents-addition-contract.mjs';
import {validateConsolidations,consolidationBeforeBundle,consolidationBeforeJson} from './consolidated-course-contract.mjs';
import {validateQcmFlashcardsRevision} from './qcm-flashcards-revision-contract.mjs';
import {validateUnifiedSheetMedia} from './unified-sheet-media-contract.mjs';
import {validateCompleteWrittenRevision} from './complete-written-revision-contract.mjs';
import {validateReviewedWrittenAudioRevision} from './reviewed-written-audio-revision-contract.mjs';
import {validateReconciledCorrection} from './reconciled-correction-contract.mjs';
// An approved revision selects new active resources without rewriting a signed
// historical delivery. Historical views are test-only; students use real catalogs.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {validateBank} from './qcm-bank-contract.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().filter(k=>v[k]!==undefined).map(k=>[k,canonical(v[k])])):v;
export const revisionDigest=v=>createHash('sha256').update(JSON.stringify(canonical(v))).digest('hex');
const origin='https://quentinlemaire92220-alt.github.io/ifsi-abc-revisions/';
export function revisionBundle(revision){
 const {publicationApproval,...r}=revision;
 const course=read('course-registry-v741.json').courses.find(c=>c.id===r.courseId);
 return consolidationBeforeBundle(read('docs/course-deliveries.json'),revision,{revision:r,course,sheets:[1,2,3].flatMap(n=>read(`sheets-${n}.json`)).filter(s=>s.courseId===r.courseId),vocals:read('vocals.json').filter(v=>v.courseId===r.courseId),vocabulary:read('vocabulaire-v1.json').entries.filter(v=>v.courseIds?.includes(r.courseId)),bank:read(r.bankPath)});
}
export function validateScopedRevisions(manifest=read('docs/course-deliveries.json')){
 validateConsolidations(manifest);
 const ids=new Set(),courses=new Set();
 for(const r of manifest.scopedCourseRevisions||[]){
  assert.equal(r.contract,'scoped_course_revision_v1');assert.equal(r.status,'approved');
  if(r.profile==='reconciled_written_correction_v1'){
   assert.ok(!ids.has(r.id)&&!courses.has(r.courseId));ids.add(r.id);courses.add(r.courseId);validateReconciledCorrection(r,manifest,revisionBundle(r));continue;
  }
  if(r.profile==='qcm_flashcards_only_v1'){
   assert.ok(!ids.has(r.id)&&!courses.has(r.courseId));ids.add(r.id);courses.add(r.courseId);validateQcmFlashcardsRevision(r,manifest,revisionBundle(r));continue;
  }
  if(r.profile==='unified_sheet_media_v1'){
   assert.ok(!ids.has(r.id)&&!courses.has(r.courseId));ids.add(r.id);courses.add(r.courseId);validateUnifiedSheetMedia(r,manifest,revisionBundle(r));continue;
  }
  if(r.profile==='reviewed_written_audio_v1'){
   assert.ok(!ids.has(r.id)&&!courses.has(r.courseId));ids.add(r.id);courses.add(r.courseId);
   validateReviewedWrittenAudioRevision(r,manifest,revisionBundle(r));continue;
  }
  if(r.profile==='verified_documents_addition_v1'){
   assert.ok(!ids.has(r.id)&&!courses.has(r.courseId));ids.add(r.id);courses.add(r.courseId);
   validateVerifiedDocumentsAddition(r,manifest,revisionBundle(r));continue;
  }
  if(r.profile==='official_complete_written_v1'){
   assert.ok(!ids.has(r.id)&&!courses.has(r.courseId));ids.add(r.id);courses.add(r.courseId);
   validateCompleteWrittenRevision(r,manifest,revisionBundle(r));continue;
  }
  assert.equal(r.profile,undefined,'Unknown revision profile');
  assert.ok(!ids.has(r.id)&&!courses.has(r.courseId));ids.add(r.id);courses.add(r.courseId);
  assert.equal(hash(r.baselinePath),r.baselineSha256,'Historical snapshot bytes changed');
  const old=read(r.baselinePath),actual=revisionBundle(r),course=actual.course;
  assert.equal(old.courseId,r.courseId);assert.equal(course.id,old.course.id);
  assert.deepEqual(manifest.courses.find(d=>d.courseId===r.courseId),old.delivery,'Signed historical delivery changed');
  const allowed=['canonicalQuestionIds','qcmPdfUrl','qcmPdfQuestionCount','flashcardsPdfUrl','flashcardTarget','authoredFlashcards','authoredFlashcardPresentation','vocabularyEntryIds','audioStatus','audioCount','sourceStatus','provisional','sourceNote','primarySheetResourceId','activeVocalIds','additionalDocuments','activeDocumentUrls'];
  const strip=c=>Object.fromEntries(Object.entries(c).filter(([k])=>!allowed.includes(k)));
  assert.deepEqual(strip(course),strip(old.course),'Course identity or official support changed');
  assert.equal(course.officialSupport,true);assert.equal(course.provisional,false);assert.equal(course.sourceStatus,'official');
  assert.equal(r.sourceReview.officialSupportAvailable,true);assert.equal(r.sourceReview.receivedOralPartsReviewed,2);
  assert.equal(r.sourceReview.oralCoverageCertifiedComplete,false);assert.equal(r.sourceReview.documentaryReservationsOpen,true);
  assert.equal(r.sourceReview.independentClinicalSignoff,false);assert.equal(r.sourceReview.externalResearchPerformed,false);
  assert.equal(r.sourceReview.disputedAssessmentPointsExcluded,true);
  assert.equal(hash(r.bankPath),r.bankSha256);assert.equal(validateBank(actual.bank),r.questionIds.length);
  assert.deepEqual(actual.bank.map(q=>q.id),r.questionIds);assert.equal(new Set(r.questionIds).size,r.questionIds.length);
  assert.deepEqual(course.canonicalQuestionIds,r.questionIds);assert.equal(course.qcmPdfQuestionCount,r.questionIds.length);
  assert.equal(course.flashcardTarget,actual.bank.flatMap(q=>q.flashcards).length);assert.equal(course.authoredFlashcardPresentation,'standalone_v1');
  const mirror=read('questions-5.json').filter(q=>q.courseId===r.courseId);
  assert.deepEqual(mirror,[...old.rows['questions-5.json'],...actual.bank],'Old questions mutated or new mirror differs');
  assert.ok(actual.bank.every(q=>q.courseId===r.courseId));
  const selected=actual.vocabulary.filter(v=>r.vocabularyEntryIds.includes(v.id));
  assert.equal(selected.length,r.vocabularyEntryIds.length);assert.equal(new Set(r.vocabularyEntryIds).size,selected.length);
  assert.deepEqual(course.vocabularyEntryIds,r.vocabularyEntryIds);
  assert.deepEqual(actual.vocabulary.filter(v=>!r.vocabularyEntryIds.includes(v.id)),old.vocabulary,'Old vocabulary changed');
  assert.ok(selected.every(v=>v.courseIds.length===1&&v.courseIds[0]===r.courseId&&v.term&&v.definition));
  assert.equal(new Set(selected.map(v=>v.term.normalize('NFKC').toLocaleLowerCase('fr'))).size,selected.length);
  const newSheet=actual.sheets.find(s=>s.resourceId===r.sheetResourceId);
  assert.equal(course.primarySheetResourceId,r.sheetResourceId);assert.equal(newSheet?.primaryRevision,true);
  assert.deepEqual(actual.sheets.filter(s=>s.resourceId!==r.sheetResourceId),[1,2,3].flatMap(n=>old.rows[`sheets-${n}.json`]),'Old sheets changed');
  assert.equal(newSheet.provisional,false);assert.equal(newSheet.officialSupport,true);
  assert.deepEqual(course.additionalDocuments.slice(0,old.course.additionalDocuments.length),old.course.additionalDocuments);
  assert.deepEqual(r.publicArtifacts.map(a=>a.role),['sheet','qcm','flashcards']);
  for(const a of r.publicArtifacts){
   assert.match(a.path,/^assets\/[a-z0-9_-]+\/[A-Za-z0-9_]+\.pdf$/);assert.equal(hash(a.path),a.sha256);
   assert.equal(fs.statSync(a.path).size,a.bytes);assert.ok(a.pageCount>0);
   assert.equal(r.assistantPdfReview.pageCounts[a.role],a.pageCount);
   if(['sheet','qcm'].includes(a.role)){
    const review=r.templateConformance.artifacts[a.role],reference=read('docs/pdf-template-policy-v3.json').references[a.role];
    assert.equal(review.templateId,reference.id);assert.equal(review.templateSha256,reference.sha256);
    assert.equal(review.artifactSha256,a.sha256);assert.equal(review.pageCount,a.pageCount);
    assert.equal(review.status,'assistant_reviewed');assert.equal(review.ownerAcceptance,'explicit_application_update_authorized');
   }
  }
  assert.equal(newSheet.url,origin+r.publicArtifacts[0].path);assert.equal(course.qcmPdfUrl,origin+r.publicArtifacts[1].path);assert.equal(course.flashcardsPdfUrl,origin+r.publicArtifacts[2].path);assert.deepEqual(course.activeDocumentUrls,[course.qcmPdfUrl,course.flashcardsPdfUrl]);
  assert.equal(r.assistantPdfReview.allPagesChecked,true);assert.equal(r.ownerAcceptance.status,'explicit_application_update_authorized');
  assert.match(r.ownerAcceptance.privateEvidenceSha256,/^[a-f0-9]{64}$/);assert.ok(Number.isFinite(Date.parse(r.ownerAcceptance.approvedAt)));
  assert.equal(r.audioOwnerReview.status,'owner_listening_accepted');assert.match(r.audioOwnerReview.privateEvidenceSha256,/^[a-f0-9]{64}$/);
  const newIds=r.audioArtifacts.map(a=>a.vocalId);assert.deepEqual(course.activeVocalIds,newIds);
  assert.equal(new Set(newIds).size,newIds.length);assert.equal(newIds.length,6);
  assert.deepEqual(actual.vocals.filter(v=>!newIds.includes(v.id)),old.rows['vocals.json'],'Old audio changed');
  assert.equal(course.audioCount,actual.vocals.length);
  for(const a of r.audioArtifacts){
   assert.match(a.path,/^assets\/audio\/[a-z0-9_-]+\/[A-Za-z0-9_]+\.mp3$/);
   const row=actual.vocals.find(v=>v.id===a.vocalId);assert.equal(row?.localAudio,'./'+a.path);
   assert.equal(row.courseId,r.courseId);assert.equal(hash(a.path),a.sha256);assert.equal(fs.statSync(a.path).size,a.bytes);
   assert.equal(row.durationSeconds,a.durationSeconds);assert.ok(a.durationSeconds>0&&a.durationSeconds<600);
  }
  assert.equal(r.publicationApproval?.status,'approved');assert.equal(r.publicationApproval?.authorization,'explicit_go_publication');assert.equal(r.publicationApproval?.scope,'scoped_course_revision');
  assert.equal(r.publicationApproval?.bundleSha256,revisionDigest(actual),'Revision changed after GO');
 }
 return true;
}
export function approvedRevisionAudioIds(manifest){
 validateScopedRevisions(manifest);return (manifest.scopedCourseRevisions||[]).flatMap(r=>r.audioArtifacts.map(a=>a.vocalId));
}
// Adapter for shared PDF/visibility gates; never edits the historical delivery.
export function scopedRevisionDeliveryForUrl(manifest,courseId,url){
 const assets=r=>[...r.publicArtifacts,...(r.officialSupportArtifact?[r.officialSupportArtifact]:[])];
 const r=[...(manifest.scopedCourseRevisions||[]),...(manifest.consolidatedCourseRevisions||[])].find(r=>r.courseId===courseId&&assets(r).some(a=>origin+a.path===url));
 if(!r)return null;
 validateScopedRevisions(manifest);
 const artifacts=assets(r).map(a=>({...a,artifactId:r.id+'_'+a.role}));
 return {courseId,publicationHost:'github_pages',publicationApproval:r.publicationApproval,
  publicArtifacts:Object.fromEntries(artifacts.map(a=>[a.role,a])),artifactSha256s:Object.fromEntries(artifacts.map(a=>[a.artifactId,a.sha256]))};
}
// Reconstruct only the exact resources in a prior package. Never used by the app.
export function scopedHistoricalJson(reader,file){
 const manifest=reader('docs/course-deliveries.json');let value=consolidationBeforeJson(manifest,file,reader(file));
 for(const r of manifest.scopedCourseRevisions||[]){
  const old=reader(r.baselinePath);
  if(r.profile==='reconciled_written_correction_v1'){
   if(file==='course-registry-v741.json')value={...value,courses:value.courses.map(c=>c.id===r.courseId?old.course:c)};
   else if(file==='questions-5.json')value=value.map(q=>old.bank.find(x=>x.id===q.id)||q);
   else if(file==='vocabulaire-v1.json')value={...value,entries:value.entries.map(v=>old.vocabulary.find(x=>x.id===v.id)||v)};
   else if(file==='vocals.json')value=value.map(v=>old.rows['vocals.json'].find(x=>x.id===v.id)||v);
   else if(/^sheets-[123]\.json$/.test(file))value=value.filter(s=>s.resourceId!==r.sheetResourceId);
   continue;
  }
  if(file==='course-registry-v741.json')value={...value,courses:value.courses.map(c=>c.id===r.courseId?old.course:c)};
  else if(!['unified_sheet_media_v1','qcm_flashcards_only_v1'].includes(r.profile)&&file==='vocabulaire-v1.json')value={...value,entries:value.entries.filter(v=>!r.vocabularyEntryIds.includes(v.id))};
  else if(r.profile!=='unified_sheet_media_v1'&&file==='questions-5.json')value=value.filter(q=>!r.questionIds.includes(q.id));
  else if(file==='vocals.json'){const ids=new Set(r.audioArtifacts.map(a=>a.vocalId));value=value.filter(v=>!ids.has(v.id));}
  else if(r.sheetResourceId&&/^sheets-[123]\.json$/.test(file))value=value.filter(s=>s.resourceId!==r.sheetResourceId);
 }
 if(file==='docs/course-deliveries.json'){const {scopedCourseRevisions,...prior}=value;return prior;}
 return value;
}
export function scopedHistoricalData(manifest,data){
 let out={...data};
 if(out.registry)out.registry=consolidationBeforeJson(manifest,'course-registry-v741.json',out.registry);
 if(out.questions)out.questions=consolidationBeforeJson(manifest,'questions-5.json',out.questions);
 if(out.vocabulary)out.vocabulary=consolidationBeforeJson(manifest,'vocabulaire-v1.json',{entries:out.vocabulary}).entries;
 if(out.sheets)out.sheets=consolidationBeforeJson(manifest,'sheets-3.json',out.sheets);
 for(const r of manifest.scopedCourseRevisions||[]){
  const old=read(r.baselinePath),ids=new Set(r.audioArtifacts.map(a=>a.vocalId));
  if(r.profile==='reconciled_written_correction_v1'){
   if(out.registry)out.registry={...out.registry,courses:out.registry.courses.map(c=>c.id===r.courseId?old.course:c)};
   if(out.vocals)out.vocals=out.vocals.map(v=>old.rows['vocals.json'].find(x=>x.id===v.id)||v);
   if(out.sheets)out.sheets=out.sheets.filter(s=>s.resourceId!==r.sheetResourceId);
   if(out.questions)out.questions=out.questions.map(q=>old.bank.find(x=>x.id===q.id)||q);
   if(out.vocabulary)out.vocabulary=out.vocabulary.map(v=>old.vocabulary.find(x=>x.id===v.id)||v);
   continue;
  }
  if(out.registry)out.registry={...out.registry,courses:out.registry.courses.map(c=>c.id===r.courseId?old.course:c)};
  if(out.vocals)out.vocals=out.vocals.filter(v=>!ids.has(v.id));
  if(out.sheets&&r.sheetResourceId)out.sheets=out.sheets.filter(s=>s.resourceId!==r.sheetResourceId);
  if(r.profile!=='unified_sheet_media_v1'&&out.questions)out.questions=out.questions.filter(q=>!r.questionIds.includes(q.id));
  if(!['unified_sheet_media_v1','qcm_flashcards_only_v1'].includes(r.profile)&&out.vocabulary)out.vocabulary=out.vocabulary.filter(v=>!r.vocabularyEntryIds.includes(v.id));
 }
 return out;
}
