// Add reviewed questions and a sheet without regenerating historical cards,
// vocabulary, audio, assets, or the delivery signed by the original approval.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {autonomyViolations,reviewedFieldDigest} from '../tests/qcm-autonomy-contract.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().filter(k=>v[k]!==undefined).map(k=>[k,canonical(v[k])])):v;
const digest=v=>createHash('sha256').update(JSON.stringify(canonical(v))).digest('hex');
const sha=v=>assert.match(v||'',/^[a-f0-9]{64}$/);
const origin='https://quentinlemaire92220-alt.github.io/ifsi-abc-revisions/';
export function attributionFields(bank){return bank.flatMap(q=>[...new Set(autonomyViolations(q).map(x=>x.field))].map(field=>({questionId:q.id,field,sha256:reviewedFieldDigest(field,q[field])})));}
export function validateAdditiveWrittenQcm(r,manifest,actual){
 assert.equal(r.profile,'additive_written_qcm_v1');assert.equal(r.contract,'scoped_course_revision_v1');assert.equal(r.status,'approved');
 assert.match(r.baselinePath,/^docs\/course-revisions\/[a-z0-9_]+_baseline\.json$/);assert.equal(hash(r.baselinePath),r.baselineSha256);
 const old=read(r.baselinePath),course=actual.course;
 assert.equal(old.courseId,r.courseId);assert.equal(course.id,r.courseId);
 assert.deepEqual(manifest.courses.find(d=>d.courseId===r.courseId),old.delivery,'Historical signed delivery changed');
 const allowed=['label','officialSupport','sourceStatus','provisional','sourceNote','primarySheetResourceId','canonicalQuestionIds','qcmPdfUrl','qcmPdfQuestionCount','activeDocumentUrls','additionalDocuments'];
 const strip=c=>Object.fromEntries(Object.entries(c).filter(([k])=>!allowed.includes(k)));
 assert.deepEqual(strip(course),strip(old.course),'Unrelated course/audio/card metadata changed');
 assert.deepEqual(actual.vocals,old.rows['vocals.json']);assert.deepEqual(actual.vocabulary,old.vocabulary);
 assert.deepEqual(r.audioArtifacts,[]);assert.equal(r.audioOwnerReview.status,'not_applicable_no_new_audio');
 assert.deepEqual(r.vocabularyEntryIds,old.vocabulary.map(v=>v.id));assert.deepEqual(r.addedVocabularyEntryIds,[]);
 assert.equal(hash(r.bankPath),r.bankSha256);assert.ok(actual.bank.length>old.bank.length);
 assert.deepEqual(actual.bank.slice(0,old.bank.length),old.bank,'Existing questions/cards changed');
 assert.equal(new Set(actual.bank.map(q=>q.id)).size,actual.bank.length);
 const added=actual.bank.slice(old.bank.length);assert.deepEqual(added.map(q=>q.id),r.addedQuestionIds);
 assert.ok(added.every(q=>!old.bank.some(x=>x.id===q.id)&&q.flashcards?.length===0),'Only new QCM authorized; no card regeneration');
 assert.deepEqual(read('questions-5.json').filter(q=>q.courseId===r.courseId),[...old.rows['questions-5.json'],...added],'Interactive mirror differs or historical row changed');
 assert.deepEqual(r.questionIds,actual.bank.map(q=>q.id));assert.deepEqual(course.canonicalQuestionIds,r.questionIds);assert.equal(course.qcmPdfQuestionCount,actual.bank.length);
 assert.equal(r.sourceAttributionReview.status,'exact_fields_reviewed_self_contained');sha(r.sourceAttributionReview.privateEvidenceSha256);
 assert.deepEqual(r.sourceAttributionReview.fields,attributionFields(actual.bank),'Reviewed source attribution changed');
 for(const q of actual.bank){
  assert.equal(q.courseId,r.courseId);assert.ok(q.id&&q.theme&&q.question?.trim());assert.equal(q.choices?.length,5);assert.ok(q.choices.every(s=>typeof s==='string'&&s.trim()));
  assert.ok(Array.isArray(q.answers)&&q.answers.length>=1&&q.answers.length<=3);assert.equal(new Set(q.answers).size,q.answers.length);assert.ok(q.answers.every(i=>Number.isInteger(i)&&i>=0&&i<5));assert.equal(q.announcedCorrectCount,q.answers.length);assert.ok(q.explanation?.trim().length>20);
  assert.ok(['easy','medium','hard'].includes(q.difficulty));assert.ok(Array.isArray(q.flashcards));assert.ok(Object.keys(q).every(k=>!/^private/i.test(k)));
 }
 const sheet=actual.sheets.find(s=>s.resourceId===r.sheetResourceId);
 assert.equal(course.primarySheetResourceId,r.sheetResourceId);assert.equal(sheet?.primaryRevision,true);assert.equal(sheet.officialSupport,true);assert.equal(sheet.provisional,false);
 assert.deepEqual(actual.sheets.filter(s=>s.resourceId!==r.sheetResourceId),[1,2,3].flatMap(n=>old.rows[`sheets-${n}.json`]));
 assert.deepEqual(course.additionalDocuments.slice(0,old.course.additionalDocuments.length),old.course.additionalDocuments);
 assert.deepEqual(r.publicArtifacts.map(a=>a.role),['sheet','qcm']);
 for(const a of r.publicArtifacts){
  assert.match(a.path,/^assets\/[a-z0-9_-]+\/[A-Za-z0-9_]+\.pdf$/);assert.equal(hash(a.path),a.sha256);assert.equal(fs.statSync(a.path).size,a.bytes);
  assert.ok(Number.isInteger(a.pageCount)&&a.pageCount>0);assert.equal(r.assistantPdfReview.pageCounts[a.role],a.pageCount);
  const ref=read('docs/pdf-template-policy-v3.json').references[a.role],review=r.templateConformance.artifacts[a.role];
  assert.equal(review.templateId,ref.id);assert.equal(review.templateSha256,ref.sha256);assert.equal(review.artifactSha256,a.sha256);assert.equal(review.pageCount,a.pageCount);
  assert.equal(review.status,'assistant_reviewed');assert.equal(review.ownerAcceptance,'explicit_application_update_authorized');assert.deepEqual(review.pagesChecked,Array.from({length:a.pageCount},(_,i)=>i+1));sha(review.privateEvidenceSha256);sha(review.ownerApprovalEvidenceSha256);
 }
 assert.equal(sheet.url,origin+r.publicArtifacts[0].path);assert.equal(course.qcmPdfUrl,origin+r.publicArtifacts[1].path);assert.ok(course.activeDocumentUrls.includes(sheet.url)&&course.activeDocumentUrls.includes(course.qcmPdfUrl));
 assert.equal(r.sourceReview.officialSupportAvailable,true);assert.equal(r.sourceReview.fullProvidedTranscriptReviewed,true);assert.equal(r.sourceReview.independentClinicalSignoff,false);assert.equal(r.sourceReview.externalResearchPerformed,false);sha(r.sourceReview.privateEvidenceSha256);
 assert.equal(r.sourceReview.embeddedVideoAudioCertifiedComplete,false);assert.equal(r.sourceReview.documentaryReservationsOpen,true);assert.equal(r.sourceReview.oralCoverageCertifiedComplete,false);
 assert.equal(r.assistantPdfReview.allPagesChecked,true);sha(r.assistantPdfReview.privateEvidenceSha256);assert.equal(r.pedagogicalNonRegression.sheetSha256,r.publicArtifacts[0].sha256);sha(r.pedagogicalNonRegression.privateEvidenceSha256);
 assert.equal(r.ownerAcceptance.status,'explicit_application_update_authorized');sha(r.ownerAcceptance.privateEvidenceSha256);assert.ok(Number.isFinite(Date.parse(r.ownerAcceptance.approvedAt)));
 assert.equal(r.publicationApproval.status,'approved');assert.equal(r.publicationApproval.authorization,'explicit_go_publication');assert.equal(r.publicationApproval.scope,'scoped_course_revision');assert.equal(r.publicationApproval.bundleSha256,digest(actual),'Content changed after scoped approval');
 return true;
}
