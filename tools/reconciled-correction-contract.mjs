// Stable-ID corrections of an existing signed course. Historical fixtures are
// restored only for historical tests; this gate checks every actual changed row.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {validateBank} from './qcm-bank-contract.mjs';
import {reviewedFieldDigest} from '../tests/qcm-autonomy-contract.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().filter(k=>v[k]!==undefined).map(k=>[k,canonical(v[k])])):v;
const digest=v=>createHash('sha256').update(JSON.stringify(canonical(v))).digest('hex');
const proof=s=>assert.match(s||'',/^[a-f0-9]{64}$/);
const origin='https://quentinlemaire92220-alt.github.io/ifsi-abc-revisions/';
export function preservedBeforeCorrections(path,manifest,expected){
 const direct=hash(path);if(direct===expected)return direct;
 if(!['questions-5.json','vocabulaire-v1.json','vocals.json','sheets-1.json','sheets-2.json','sheets-3.json'].includes(path))return direct;
 let value=read(path);
 for(const r of manifest.scopedCourseRevisions||[]){
  if(r.profile!=='reconciled_written_correction_v1')continue;
  const old=read(r.baselinePath);assert.equal(hash(r.baselinePath),r.baselineSha256);
  if(path==='questions-5.json')value=value.map(q=>old.bank.find(x=>x.id===q.id)||q);
  else if(path==='vocabulaire-v1.json')value={...value,entries:value.entries.map(v=>old.vocabulary.find(x=>x.id===v.id)||v)};
  else if(path==='vocals.json')value=value.map(v=>old.rows[path].find(x=>x.id===v.id)||v);
  else value=value.filter(s=>s.resourceId!==r.sheetResourceId);
 }
 // Verify the exact old serialized bytes, not merely the current course slice.
 for(const suffix of ['\n','']){const reconstructed=createHash('sha256').update(JSON.stringify(value,null,2)+suffix).digest('hex');if(reconstructed===expected)return reconstructed;}
 return direct;
}
export function validateReconciledCorrection(r,manifest,actual){
 assert.equal(r.profile,'reconciled_written_correction_v1');assert.equal(r.contract,'scoped_course_revision_v1');assert.equal(r.status,'approved');
 assert.match(r.baselinePath,/^docs\/course-revisions\/[a-z0-9_]+_baseline\.json$/);assert.equal(hash(r.baselinePath),r.baselineSha256);
 const old=read(r.baselinePath),c=actual.course;assert.equal(c.id,r.courseId);assert.equal(old.courseId,r.courseId);
 assert.deepEqual(manifest.courses.find(d=>d.courseId===r.courseId),old.delivery,'Historical signed delivery changed');
 const allowed=['label','officialSupport','nativeSupportAvailable','sourceStatus','provisional','sourceNote','primarySheetResourceId','canonicalQuestionIds','vocabularyEntryIds','qcmPdfUrl','flashcardsPdfUrl','qcmPdfQuestionCount','authoredFlashcardPresentation','additionalDocuments','activeDocumentUrls','activeVocalIds'];
 const strip=c=>Object.fromEntries(Object.entries(c).filter(([k])=>!allowed.includes(k)));
 assert.deepEqual(strip(c),strip(old.course),'Identity or counters outside correction scope changed');
 assert.equal(c.officialSupport,true);assert.equal(c.nativeSupportAvailable,true);assert.equal(c.provisional,false);assert.equal(c.sourceStatus,'official');
 const sr=r.sourceReview;assert.equal(sr.officialSupportAvailable,true);assert.equal(sr.oralCoverageCertifiedComplete,true);assert.equal(sr.independentClinicalSignoff,false);assert.equal(sr.verifiedCorrectionsDisclosed,true);assert.ok(Number.isInteger(sr.receivedOralPartsReviewed)&&sr.receivedOralPartsReviewed>0);proof(sr.privateEvidenceSha256);
 assert.match(r.bankPath,/^data\/course-banks\/[a-z0-9_-]+\.json$/);assert.notEqual(r.bankPath,old.delivery.qcmBank);assert.equal(hash(r.bankPath),r.bankSha256);
 assert.equal(validateBank(actual.bank,r.bankPath,{previousRows:old.bank,reviewedSourceComparisonFields:r.sourceAttributionReview.fields}),old.bank.length);assert.deepEqual(actual.bank.map(q=>q.id),old.bank.map(q=>q.id),'Progress IDs changed');assert.deepEqual(r.questionIds,actual.bank.map(q=>q.id));assert.deepEqual(c.canonicalQuestionIds,r.questionIds);
 assert.equal(r.sourceAttributionReview.status,'documentary_reviewed');proof(r.sourceAttributionReview.privateEvidenceSha256);
 for(const x of r.sourceAttributionReview.fields){assert.ok(['question','choices','explanation','flashcards'].includes(x.field));const q=actual.bank.find(q=>q.id===x.questionId);assert.ok(q);assert.equal(reviewedFieldDigest(x.field,q[x.field]),x.sha256,'Reviewed source attribution changed');}
 assert.deepEqual(read('questions-5.json').filter(q=>q.courseId===r.courseId),actual.bank,'Actual override bank differs');
 assert.equal(actual.bank.flatMap(q=>q.flashcards).length,old.bank.flatMap(q=>q.flashcards).length);assert.equal(c.flashcardTarget,actual.bank.flatMap(q=>q.flashcards).length);assert.equal(c.qcmPdfQuestionCount,actual.bank.length);
 assert.deepEqual(r.vocabularyEntryIds,old.vocabulary.map(v=>v.id));assert.deepEqual(c.vocabularyEntryIds,r.vocabularyEntryIds);assert.equal(actual.vocabulary.length,old.vocabulary.length);
 for(const v of actual.vocabulary){const was=old.vocabulary.find(x=>x.id===v.id);assert.ok(was);assert.deepEqual({...v,definition:undefined},{...was,definition:undefined},'Vocabulary identity or authored etymology changed');assert.ok(v.definition?.trim());}
 const s=actual.sheets.find(x=>x.resourceId===r.sheetResourceId);assert.ok(s?.primaryRevision&&s.officialSupport&&!s.provisional);assert.equal(c.primarySheetResourceId,s.resourceId);
 assert.deepEqual(actual.sheets.filter(x=>x.resourceId!==r.sheetResourceId),[1,2,3].flatMap(n=>old.rows[`sheets-${n}.json`]));
 assert.deepEqual(c.additionalDocuments.slice(0,old.course.additionalDocuments.length),old.course.additionalDocuments);
 assert.deepEqual(r.publicArtifacts.map(a=>a.role),['sheet','qcm','flashcards']);
 for(const a of r.publicArtifacts){assert.match(a.path,/^assets\/[a-z0-9_-]+\/[A-Za-z0-9_]+\.pdf$/);assert.equal(hash(a.path),a.sha256);assert.equal(fs.statSync(a.path).size,a.bytes);assert.equal(r.assistantPdfReview.pageCounts[a.role],a.pageCount);assert.ok(a.pageCount>0);}
 assert.equal(s.url,origin+r.publicArtifacts[0].path);assert.equal(s.pageCount,r.publicArtifacts[0].pageCount);assert.equal(c.qcmPdfUrl,origin+r.publicArtifacts[1].path);assert.equal(c.flashcardsPdfUrl,origin+r.publicArtifacts[2].path);assert.deepEqual(c.activeDocumentUrls,[c.qcmPdfUrl,c.flashcardsPdfUrl]);
 assert.equal(r.templateConformance.profile,'compact_integrated_lexicon_v1');
 for(const role of ['sheet','qcm']){const a=r.publicArtifacts.find(a=>a.role===role),rv=r.templateConformance.artifacts[role];assert.equal(rv.status,'assistant_reviewed');assert.equal(rv.ownerAcceptance,'explicit_application_update_authorized');assert.equal(rv.artifactSha256,a.sha256);assert.deepEqual(rv.pagesChecked,Array.from({length:a.pageCount},(_,i)=>i+1));proof(rv.privateEvidenceSha256);}
 assert.equal(r.assistantPdfReview.allPagesChecked,true);proof(r.assistantPdfReview.privateEvidenceSha256);assert.equal(r.pedagogicalNonRegression.sheetSha256,r.publicArtifacts[0].sha256);proof(r.pedagogicalNonRegression.privateEvidenceSha256);
 assert.equal(r.ownerAcceptance.status,'explicit_application_update_authorized');proof(r.ownerAcceptance.privateEvidenceSha256);assert.ok(Number.isFinite(Date.parse(r.ownerAcceptance.approvedAt)));
 assert.equal(r.audioOwnerReview.status,'publication_authorized_listening_reservations_disclosed');assert.equal(r.audioOwnerReview.humanListeningAttested,false);proof(r.audioOwnerReview.privateEvidenceSha256);
 assert.deepEqual(actual.vocals.map(v=>v.id),old.rows['vocals.json'].map(v=>v.id));assert.deepEqual(c.activeVocalIds,actual.vocals.map(v=>v.id));assert.equal(c.audioCount,actual.vocals.length);
 assert.ok(r.audioArtifacts.length>0&&new Set(r.audioArtifacts.map(a=>a.vocalId)).size===r.audioArtifacts.length);
 for(const v of actual.vocals){const was=old.rows['vocals.json'].find(x=>x.id===v.id),a=r.audioArtifacts.find(a=>a.vocalId===v.id);const strip=v=>Object.fromEntries(Object.entries(v).filter(([k])=>!['provisional','provisionalReason',...(a?['localAudio','durationSeconds']:[])].includes(k)));assert.deepEqual(strip(v),strip(was),'Audio metadata outside correction scope changed');if(!a)continue;assert.equal(v.localAudio,'./'+a.path);assert.equal(v.durationSeconds,a.durationSeconds);assert.ok(a.durationSeconds>0&&a.durationSeconds<600);assert.equal(hash(a.path),a.sha256);assert.equal(fs.statSync(a.path).size,a.bytes);const olda=old.delivery.publicAudioArtifacts.find(x=>x.artifactId===v.id);assert.equal(a.fromSha256,olda.sha256);assert.equal(hash(olda.path),olda.sha256,'Old MP3 bytes changed');assert.notEqual(a.sha256,a.fromSha256);}
 for(const p of old.preservedFiles)assert.equal(hash(p.path),p.sha256,'Historical asset changed');
 const a=r.publicationApproval;assert.equal(a.status,'approved');assert.equal(a.authorization,'explicit_go_publication');assert.equal(a.scope,'scoped_course_revision');assert.ok(Number.isFinite(Date.parse(a.approvedAt)));assert.equal(a.bundleSha256,digest(actual),'Corrected package changed after GO');return true;
}
