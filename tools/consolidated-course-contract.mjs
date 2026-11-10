// Additive consolidation over a previously signed revision. Historical checks
// keep their exact inputs; this independent gate checks the actual student data.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {validateBank} from './qcm-bank-contract.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().filter(k=>v[k]!==undefined).map(k=>[k,canonical(v[k])])):v;
export const consolidationDigest=v=>createHash('sha256').update(JSON.stringify(canonical(v))).digest('hex');
const origin='https://quentinlemaire92220-alt.github.io/ifsi-abc-revisions/';
const proof=s=>assert.match(s||'',/^[a-f0-9]{64}$/);
export function consolidationBundle(r){
 const {publicationApproval,...revision}=r;
 return {revision,course:read('course-registry-v741.json').courses.find(c=>c.id===r.courseId),sheets:[1,2,3].flatMap(n=>read(`sheets-${n}.json`)).filter(x=>x.courseId===r.courseId),vocals:read('vocals.json').filter(x=>x.courseId===r.courseId),vocabulary:read('vocabulaire-v1.json').entries.filter(v=>v.courseIds?.includes(r.courseId)),bank:read(r.bankPath)};
}
export function consolidationBeforeJson(manifest,file,value){
 for(const r of [...(manifest.consolidatedCourseRevisions||[])].reverse()){
  assert.equal(hash(r.baselinePath),r.baselineSha256);const b=read(r.baselinePath);
  if(file==='course-registry-v741.json')value={...value,courses:value.courses.map(c=>c.id===r.courseId?b.course:c)};
  else if(file==='questions-5.json'){const added=new Set(r.questionIds.filter(id=>!b.bank.some(q=>q.id===id)));value=value.filter(q=>!added.has(q.id));}
  else if(file==='vocabulaire-v1.json'){const added=new Set(r.vocabularyEntryIds.filter(id=>!b.course.vocabularyEntryIds.includes(id)));value={...value,entries:value.entries.filter(v=>!added.has(v.id))};}
  else if(/^sheets-[123]\.json$/.test(file))value=value.filter(s=>s.resourceId!==r.sheetResourceId);
  else if(file==='audio-series-v1.json')value={...value,series:value.series.map(s=>s.courseId===r.courseId?b.series:s)};
 }
 if(file==='docs/course-deliveries.json'){const {consolidatedCourseRevisions,...old}=value;return old;}
 return value;
}
export function consolidationBeforeBundle(manifest,r,actual){
 const ext=manifest.consolidatedCourseRevisions?.find(x=>x.priorRevisionId===r.id);
 if(!ext)return actual;
 const b=read(ext.baselinePath);return {...actual,course:b.course,sheets:[1,2,3].flatMap(n=>b.rows[`sheets-${n}.json`]),vocabulary:b.vocabulary,vocals:b.rows['vocals.json']};
}
export function historicalSeries(manifest,id){
 const current=read('docs/course-deliveries.json');
 const ext=[...(manifest.consolidatedCourseRevisions||[]),...(current.consolidatedCourseRevisions||[])].find(x=>read(x.baselinePath).series.id===id);
 return ext?read(ext.baselinePath).series:read('audio-series-v1.json').series.find(s=>s.id===id);
}
export function validateConsolidations(manifest){
 const ids=new Set(),courses=new Set();
 for(const r of manifest.consolidatedCourseRevisions||[]){
  assert.equal(r.contract,'consolidated_course_extension_v1');assert.equal(r.status,'approved');assert.ok(!ids.has(r.id)&&!courses.has(r.courseId));ids.add(r.id);courses.add(r.courseId);
  assert.match(r.baselinePath,/^docs\/course-revisions\/[a-z0-9_]+_baseline\.json$/);assert.equal(hash(r.baselinePath),r.baselineSha256);
  const b=read(r.baselinePath),actual=consolidationBundle(r),c=actual.course;
  assert.deepEqual(manifest.scopedCourseRevisions.find(x=>x.id===r.priorRevisionId),b.priorRevision,'Predecessor signature changed');assert.equal(b.courseId,r.courseId);
  const allowed=['primarySheetResourceId','canonicalQuestionIds','vocabularyEntryIds','qcmPdfUrl','flashcardsPdfUrl','qcmPdfQuestionCount','flashcardTarget','audioCount','activeVocalIds','activeDocumentUrls','sourceNote','additionalDocuments'];
  const strip=c=>Object.fromEntries(Object.entries(c).filter(([k])=>!allowed.includes(k)));assert.deepEqual(strip(c),strip(b.course),'Identity outside consolidation changed');
  assert.equal(hash(r.bankPath),r.bankSha256);assert.notEqual(r.bankPath,b.priorRevision.bankPath);
  assert.equal(validateBank(actual.bank,r.bankPath,{previousRows:b.bank}),128);assert.deepEqual(actual.bank.slice(0,b.bank.length),b.bank,'Existing exercises changed');assert.equal(b.bank.length,104);
  assert.deepEqual(r.questionIds,actual.bank.map(q=>q.id));assert.deepEqual(c.canonicalQuestionIds,r.questionIds);assert.equal(c.qcmPdfQuestionCount,128);assert.equal(c.flashcardTarget,128);assert.equal(actual.bank.flatMap(q=>q.flashcards).length,128);
  assert.deepEqual(read('questions-5.json').filter(q=>q.courseId===r.courseId),[...b.rows['questions-5.json'],...actual.bank.slice(b.bank.length)],'Historical rows changed or new bank mirror differs');
  assert.equal(r.vocabularyEntryIds.length,107);assert.deepEqual(c.vocabularyEntryIds,r.vocabularyEntryIds);assert.deepEqual(r.vocabularyEntryIds.slice(0,78),b.course.vocabularyEntryIds);
  assert.deepEqual(actual.vocabulary.filter(v=>b.vocabulary.some(w=>w.id===v.id)),b.vocabulary,'Historical vocabulary changed');
  const added=actual.vocabulary.filter(v=>!b.vocabulary.some(w=>w.id===v.id));assert.equal(added.length,29);assert.deepEqual(added.map(v=>v.id),r.vocabularyEntryIds.slice(78));assert.ok(added.every(v=>v.term?.trim()&&v.definition?.trim()&&v.courseIds.length===1&&v.courseIds[0]===r.courseId));
  assert.equal(new Set(actual.vocabulary.filter(v=>r.vocabularyEntryIds.includes(v.id)).map(v=>v.term.normalize('NFKC').toLocaleLowerCase('fr'))).size,107);
  assert.deepEqual(actual.vocals,b.rows['vocals.json'],'Raw listening history changed');
  assert.deepEqual(actual.sheets.filter(s=>s.resourceId!==r.sheetResourceId),[1,2,3].flatMap(n=>b.rows[`sheets-${n}.json`]));const sheet=actual.sheets.find(s=>s.resourceId===r.sheetResourceId);assert.ok(sheet?.primaryRevision&&sheet.officialSupport&&!sheet.provisional);assert.equal(c.primarySheetResourceId,r.sheetResourceId);
  assert.deepEqual(c.additionalDocuments.slice(0,b.course.additionalDocuments.length),b.course.additionalDocuments);
  assert.deepEqual(r.publicArtifacts.map(a=>a.role),['sheet','qcm','flashcards']);assert.deepEqual(r.publicArtifacts.map(a=>a.pageCount),[55,45,44]);
  for(const a of r.publicArtifacts){assert.match(a.path,/^assets\/[a-z0-9_-]+\/[A-Za-z0-9_]+\.pdf$/);assert.equal(hash(a.path),a.sha256);assert.equal(fs.statSync(a.path).size,a.bytes);assert.equal(r.assistantPdfReview.pageCounts[a.role],a.pageCount);assert.match(a.driveId,/^[A-Za-z0-9_-]+$/);if(a.role!=='flashcards'){const rv=r.templateConformance.artifacts[a.role],ref=read('docs/pdf-template-policy-v3.json').references[a.role];assert.equal(rv.templateId,ref.id);assert.equal(rv.templateSha256,ref.sha256);assert.equal(rv.artifactSha256,a.sha256);assert.equal(rv.status,'assistant_reviewed');assert.deepEqual(rv.pagesChecked,Array.from({length:a.pageCount},(_,i)=>i+1));proof(rv.privateEvidenceSha256);}}
  assert.equal(sheet.url,origin+r.publicArtifacts[0].path);assert.equal(sheet.pageCount,55);assert.equal(c.qcmPdfUrl,origin+r.publicArtifacts[1].path);assert.equal(c.flashcardsPdfUrl,origin+r.publicArtifacts[2].path);assert.deepEqual(c.activeDocumentUrls,[c.qcmPdfUrl,c.flashcardsPdfUrl]);
  for(const a of b.preservedAssets){assert.equal(hash(a.path),a.sha256);assert.equal(fs.statSync(a.path).size,a.bytes);}
  const s=read('audio-series-v1.json').series.find(s=>s.id===r.audioSeriesId);assert.ok(s);assert.equal(consolidationDigest(s),r.audioSeriesSha256);assert.equal(s.courseId,r.courseId);assert.equal(s.vocals.length,8);assert.equal(c.audioCount,8);assert.deepEqual(c.activeVocalIds,s.vocals.map(v=>v.id));assert.deepEqual(s.vocals.slice(0,6).map(v=>v.id),b.series.vocals.map(v=>v.id));assert.deepEqual(s.appendedVocalIds,s.vocals.slice(6).map(v=>v.id));assert.deepEqual(s.previousVocals,b.series.previousVocals);assert.deepEqual(s.previousArtifacts,b.series.previousArtifacts);assert.deepEqual(s.replaces,b.series.replaces);assert.deepEqual(r.audioArtifacts,[]);
  for(const a of s.artifacts){assert.equal(hash(a.path),a.sha256);assert.equal(fs.statSync(a.path).size,a.bytes);}
  assert.equal(r.sourceReview.receivedOralPartsReviewed,2);assert.equal(r.sourceReview.oralCoverageCertifiedComplete,true);assert.equal(r.sourceReview.independentClinicalSignoff,false);assert.equal(r.sourceReview.externalResearchPerformed,false);assert.equal(r.sourceReview.officialSupportAvailable,true);proof(r.sourceReview.privateEvidenceSha256);
  assert.equal(r.assistantPdfReview.allPagesChecked,true);proof(r.assistantPdfReview.privateEvidenceSha256);assert.equal(r.audioOwnerReview.status,'owner_listening_accepted');assert.equal(r.audioOwnerReview.humanListeningAttested,true);proof(r.audioOwnerReview.privateEvidenceSha256);assert.equal(r.ownerAcceptance.status,'explicit_application_update_authorized');proof(r.ownerAcceptance.privateEvidenceSha256);
  assert.equal(r.pedagogicalNonRegression.sheetSha256,r.publicArtifacts[0].sha256);proof(r.pedagogicalNonRegression.privateEvidenceSha256);
  const p=r.publicationApproval;assert.equal(p.status,'approved');assert.equal(p.authorization,'explicit_go_publication');assert.equal(p.scope,'scoped_course_revision');assert.ok(Number.isFinite(Date.parse(p.approvedAt)));assert.equal(p.bundleSha256,consolidationDigest(actual),'Consolidation changed after GO');
 }
 return true;
}
