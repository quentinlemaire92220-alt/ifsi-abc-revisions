// A reviewed question/card replacement cannot authorize a sheet, audio or vocabulary change.
import fs from 'node:fs';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
import {validateBank} from './qcm-bank-contract.mjs';
import {preservedBeforeCorrections} from './reconciled-correction-contract.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const canon=v=>Array.isArray(v)?v.map(canon):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().filter(k=>v[k]!==undefined).map(k=>[k,canon(v[k])])):v;
const digest=v=>createHash('sha256').update(JSON.stringify(canon(v))).digest('hex');
const sha=x=>assert.match(x||'',/^[a-f0-9]{64}$/);
const origin='https://quentinlemaire92220-alt.github.io/ifsi-abc-revisions/';
export function validateQcmFlashcardsRevision(r,manifest,actual){
 assert.equal(r.profile,'qcm_flashcards_only_v1');assert.equal(r.status,'approved');assert.equal(r.contract,'scoped_course_revision_v1');
 assert.match(r.baselinePath,/^docs\/course-revisions\/[a-z0-9_]+_baseline\.json$/);assert.equal(hash(r.baselinePath),r.baselineSha256);
 const old=read(r.baselinePath),course=actual.course;assert.equal(old.courseId,r.courseId);assert.equal(course.id,r.courseId);
 assert.deepEqual(manifest.courses.find(c=>c.courseId===r.courseId),old.delivery,'Historical signed delivery changed');
 const allowed=['canonicalQuestionIds','qcmPdfUrl','qcmPdfQuestionCount','flashcardsPdfUrl','flashcardTarget','authoredFlashcards','authoredFlashcardPresentation','vocabularyEntryIds','activeDocumentUrls','additionalDocuments'];
 const strip=c=>Object.fromEntries(Object.entries(c).filter(([k])=>!allowed.includes(k)));
 assert.deepEqual(strip(course),strip(old.course),'Identity/support/audio/sheet selection changed');
 for(const [file,sha256] of Object.entries(old.protectedFiles))assert.equal(preservedBeforeCorrections(file,manifest,sha256),sha256,'Protected file changed outside an independently approved correction: '+file);
 assert.deepEqual(actual.sheets,[1,2,3].flatMap(n=>old.rows['sheets-'+n+'.json']),'Sheet changed');
 assert.deepEqual(actual.vocals,old.rows['vocals.json'],'Audio changed');assert.deepEqual(actual.vocabulary,old.vocabulary,'Vocabulary changed');
 assert.deepEqual(read('infographics.json').filter(c=>c.courseId===r.courseId),old.rows['infographics.json'],'Infographics changed');
 assert.deepEqual(r.audioArtifacts,[]);assert.equal(r.audioOwnerReview.status,'not_applicable_no_new_audio');
 assert.equal(r.sourceReview.sourceSheetSha256,old.delivery.revisionSheetSupplement.pdfSha256);assert.equal(r.sourceReview.sourceSheetSha256,r.sourceSheetSha256);
 assert.equal(r.sourceReview.availableTeacherSpeechReviewed,true);assert.equal(r.sourceReview.oralCoverageCertifiedComplete,false);assert.equal(r.sourceReview.ownerAcceptedAvailableOralScope,true);assert.equal(r.sourceReview.independentClinicalSignoff,false);sha(r.sourceReview.privateEvidenceSha256);
 assert.match(r.bankPath,/^data\/course-banks\/[a-z0-9_-]+\.json$/);assert.equal(hash(r.bankPath),r.bankSha256);
 assert.equal(validateBank(actual.bank),90);assert.equal(r.questionIds.length,90);assert.deepEqual(actual.bank.map(q=>q.id),r.questionIds);assert.ok(actual.bank.every(q=>q.courseId===r.courseId));
 assert.deepEqual(course.canonicalQuestionIds,r.questionIds);assert.equal(course.qcmPdfQuestionCount,90);assert.equal(course.flashcardTarget,90);assert.equal(course.authoredFlashcards,true);assert.equal(course.authoredFlashcardPresentation,'standalone_v1');
 const cards=actual.bank.flatMap(q=>q.flashcards);assert.equal(cards.length,90);assert.equal(new Set(cards.map(c=>c.front)).size,90);
 for(const q of actual.bank){assert.equal(q.flashcards.length,1);assert.match(q.flashcards[0].front,/\?$/);for(let i=0;i<5;i++)assert.ok(q.explanation.includes(`${'ABCDE'[i]} - ${q.answers.includes(i)?'Vrai':'Faux'} : `),'Rationale key mismatch');}
 assert.deepEqual(read('questions-5.json').filter(q=>q.courseId===r.courseId),[...old.rows['questions-5.json'],...actual.bank],'Question mirror/old rows changed');
 const vocabIds=old.vocabulary.map(v=>v.id);assert.deepEqual(r.vocabularyEntryIds,vocabIds);assert.deepEqual(course.vocabularyEntryIds,vocabIds);
 assert.deepEqual(r.publicArtifacts.map(a=>a.role),['qcm','flashcards']);
 for(const a of r.publicArtifacts){assert.match(a.path,/^assets\/douleur-qcm-flashcards-20261108\/[A-Za-z0-9_]+\.pdf$/);assert.equal(hash(a.path),a.sha256);assert.equal(fs.statSync(a.path).size,a.bytes);assert.equal(a.pageCount,a.role==='qcm'?47:30);}
 assert.equal(course.qcmPdfUrl,origin+r.publicArtifacts[0].path);assert.equal(course.flashcardsPdfUrl,origin+r.publicArtifacts[1].path);assert.deepEqual(course.activeDocumentUrls,[course.qcmPdfUrl,course.flashcardsPdfUrl]);
 assert.deepEqual(course.additionalDocuments,[...(old.course.additionalDocuments||[]),{label:'QCM PDF - 90 questions et corrigés',type:'qcm',url:course.qcmPdfUrl},{label:'Flashcards PDF - 90 cartes recto verso',type:'flashcards',url:course.flashcardsPdfUrl}]);
 assert.equal(r.assistantPdfReview.allPagesChecked,true);sha(r.assistantPdfReview.privateEvidenceSha256);assert.deepEqual(r.assistantPdfReview.pageCounts,{qcm:47,flashcards:30});
 assert.equal(r.ownerAcceptance.status,'explicit_application_update_authorized');sha(r.ownerAcceptance.privateEvidenceSha256);assert.ok(Number.isFinite(Date.parse(r.ownerAcceptance.approvedAt)));
 assert.equal(r.driveVerification.status,'MATCH');assert.equal(r.driveVerification.qcm.sha256,r.publicArtifacts[0].sha256);assert.equal(r.driveVerification.flashcards.sha256,r.publicArtifacts[1].sha256);assert.equal(r.driveVerification.archive.sha256,old.archivedQcmSha256);
 assert.equal(r.driveVerification.archiveBank.sha256,hash(old.oldBankArchivePath));assert.ok(r.driveVerification.archiveBank.id);
 const policy=read('docs/pdf-template-policy-v3.json').references.qcm,review=r.templateConformance.artifacts.qcm;
 assert.equal(review.templateId,policy.id);assert.equal(review.templateSha256,policy.sha256);assert.equal(review.artifactSha256,r.publicArtifacts[0].sha256);assert.equal(review.pageCount,47);assert.equal(review.status,'assistant_reviewed');
 assert.equal(r.publicationApproval.status,'approved');assert.equal(r.publicationApproval.authorization,'explicit_go_publication');assert.equal(r.publicationApproval.scope,'qcm_flashcards_only');assert.ok(Number.isFinite(Date.parse(r.publicationApproval.approvedAt)));assert.equal(r.publicationApproval.bundleSha256,digest(actual),'Revision changed after GO');
 return true;
}
