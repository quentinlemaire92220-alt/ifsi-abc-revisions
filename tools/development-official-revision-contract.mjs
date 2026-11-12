import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {validateBank} from './qcm-bank-contract.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().filter(k=>v[k]!==undefined).map(k=>[k,canonical(v[k])])):v;
const digest=v=>createHash('sha256').update(JSON.stringify(canonical(v))).digest('hex');
const origin='https://quentinlemaire92220-alt.github.io/ifsi-abc-revisions/';
export function validateDevelopmentOfficialRevision(r,manifest,actual){
 assert.equal(r.courseId,'psychologie_developpement');assert.equal(r.profile,'development_official_update_v1');
 assert.equal(hash(r.baselinePath),r.baselineSha256);const old=read(r.baselinePath),c=actual.course;
 assert.deepEqual(manifest.courses.find(d=>d.courseId===r.courseId),old.delivery,'Historical signed delivery changed');
 const allowed=['officialSupport','nativeSupportAvailable','canonicalQuestionIds','qcmPdfUrl','qcmPdfQuestionCount','flashcardsPdfUrl','flashcardTarget','vocabularyEntryIds','sourceStatus','provisional','sourceNote','primarySheetResourceId','additionalDocuments','activeDocumentUrls'];
 const strip=x=>Object.fromEntries(Object.entries(x).filter(([k])=>!allowed.includes(k)));
 assert.deepEqual(strip(c),strip(old.course),'Identity or audio selection changed');
 assert.equal(c.officialSupport,true);assert.equal(c.nativeSupportAvailable,true);assert.equal(c.provisional,false);assert.equal(c.sourceStatus,'official');
 assert.deepEqual(actual.vocals,old.rows['vocals.json']);assert.deepEqual(r.audioArtifacts,[]);assert.equal(r.audioOwnerReview.status,'not_applicable_no_new_audio');
 assert.equal(r.sourceReview.officialPagesReviewed,35);assert.equal(r.sourceReview.receivedOralPartsReviewed,3);assert.equal(r.sourceReview.independentClinicalSignoff,false);assert.equal(r.sourceReview.originalAudioCompared,false);
 assert.equal(hash(r.bankPath),r.bankSha256);assert.equal(validateBank(actual.bank,r.courseId,{reviewedSourceComparisonFields:r.sourceAttributionReview.fields}),74);
 assert.deepEqual(actual.bank.slice(0,old.bank.length),old.bank,'An original question or card changed');
 assert.deepEqual(actual.bank.slice(old.bank.length).map(q=>q.id),r.addedQuestionIds);assert.equal(r.addedQuestionIds.length,12);assert.deepEqual(actual.bank.map(q=>q.id),r.questionIds);
 assert.deepEqual(c.canonicalQuestionIds,actual.bank.map(q=>q.id));assert.equal(c.qcmPdfQuestionCount,74);
 assert.deepEqual(read('questions-5.json').filter(q=>q.courseId===r.courseId),actual.bank,'Interactive bank differs');
 const cards=actual.bank.flatMap(q=>q.flashcards);assert.equal(cards.length,102);assert.equal(new Set(cards.map(f=>f.id)).size,102);assert.equal(new Set(cards.map(f=>f.front)).size,102);assert.equal(c.flashcardTarget,102);
 assert.deepEqual(actual.vocabulary.filter(v=>!r.addedVocabularyEntryIds.includes(v.id)),old.vocabulary,'Historical definitions changed');
 assert.equal(r.addedVocabularyEntryIds.length,28);assert.equal(actual.vocabulary.length,222);assert.deepEqual(r.vocabularyEntryIds,actual.vocabulary.map(v=>v.id));assert.deepEqual(c.vocabularyEntryIds,r.vocabularyEntryIds);
 assert.equal(new Set(actual.vocabulary.map(v=>v.term.normalize('NFKC').toLocaleLowerCase('fr'))).size,222);
 assert.ok(actual.vocabulary.every(v=>v.courseIds.length===1&&v.courseIds[0]===r.courseId&&v.definition));
 assert.deepEqual(actual.sheets.filter(s=>s.resourceId!==r.sheetResourceId),[1,2,3].flatMap(n=>old.rows[`sheets-${n}.json`]));
 const sheet=actual.sheets.find(s=>s.resourceId===r.sheetResourceId);assert.equal(c.primarySheetResourceId,sheet?.resourceId);assert.equal(sheet.officialSupport,true);assert.equal(sheet.provisional,false);assert.equal(sheet.primaryRevision,true);
 assert.deepEqual(c.additionalDocuments.slice(0,old.course.additionalDocuments.length),old.course.additionalDocuments,'Historical documents lost');
 assert.deepEqual(r.publicArtifacts.map(a=>a.role),['sheet','qcm','flashcards']);
 for(const a of r.publicArtifacts){
  assert.match(a.path,/^assets\/[a-z0-9_-]+\/[A-Za-z0-9_]+\.pdf$/);assert.equal(hash(a.path),a.sha256);assert.equal(fs.statSync(a.path).size,a.bytes);assert.equal(r.assistantPdfReview.pageCounts[a.role],a.pageCount);
  if(a.role!=='flashcards'){
   const check=r.templateConformance.artifacts[a.role],ref=read('docs/pdf-template-policy-v3.json').references[a.role];
   assert.equal(check.artifactSha256,a.sha256);assert.equal(check.templateId,ref.id);assert.equal(check.templateSha256,ref.sha256);assert.equal(check.status,'assistant_reviewed');assert.equal(check.ownerAcceptance,'explicit_application_update_authorized');
   assert.deepEqual(check.pagesChecked,Array.from({length:a.pageCount},(_,i)=>i+1));
  }
 }
 const [s,q,f]=r.publicArtifacts;assert.equal(sheet.url,origin+s.path);assert.equal(sheet.pageCount,s.pageCount);assert.equal(c.qcmPdfUrl,origin+q.path);assert.equal(c.flashcardsPdfUrl,origin+f.path);
 assert.deepEqual(c.activeDocumentUrls,[origin+q.path,origin+f.path,origin+r.downloadArtifact.path]);
 assert.equal(hash(r.downloadArtifact.path),r.downloadArtifact.sha256);assert.equal(fs.statSync(r.downloadArtifact.path).size,r.downloadArtifact.bytes);
 assert.equal(r.pedagogicalNonRegression.sheetSha256,s.sha256);assert.equal(r.pedagogicalNonRegression.sourceCoverage,'complete');assert.equal(r.pedagogicalNonRegression.inheritanceReview,'compared');
 assert.equal(r.assistantPdfReview.allPagesChecked,true);assert.equal(r.ownerAcceptance.status,'explicit_application_update_authorized');assert.match(r.ownerAcceptance.privateEvidenceSha256,/^[a-f0-9]{64}$/);
 assert.equal(r.scriptsPreparedCount,7);assert.equal(r.additionalScriptAwaitingMp3,true);
 assert.equal(r.publicationApproval.status,'approved');assert.equal(r.publicationApproval.authorization,'explicit_go_publication');assert.equal(r.publicationApproval.scope,'scoped_course_revision');assert.equal(r.publicationApproval.bundleSha256,digest(actual),'The reviewed revision changed after authorization');
 return true;
}
