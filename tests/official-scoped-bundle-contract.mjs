import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {validateBank} from '../tools/qcm-bank-contract.mjs';
import {validateVisualOwnerReview} from './visual-owner-review-gate.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
const origin='https://quentinlemaire92220-alt.github.io/ifsi-abc-revisions/';
export const isOfficialScoped=d=>d?.updateContract==='official_reviewed_scoped_bundle_v1';
export function validateOfficialScoped(course,d,{sheets,questions,deck,vocabulary,vocals}={}){
 assert.ok(isOfficialScoped(d));assert.equal(d.deliveryMode,'official_reviewed_scoped_bundle');
 assert.equal(d.packFormat,'written_v1');assert.equal(d.publicationHost,'github_pages');
 assert.equal(d.validated,true);assert.equal(d.status,'partial');assert.equal(d.pedagogicalValidated,false);
 assert.equal(d.provisional,false);assert.equal(course.provisional,false);assert.equal(course.officialSupport,true);
 assert.equal(d.sourceAudit.officialChecked,true);assert.equal(d.sourceBasis.nativeSupportAvailable,true);
 assert.equal(d.sourceAudit.oralStatus,'complete');assert.equal(d.sourceAudit.originalAudioCompared,false);
 assert.equal(d.sourceAudit.independentClinicalSignoff,false);
 assert.equal(d.sourceAudit.scientificReview,'documentary_review_with_reservations');
 assert.equal(d.sourceAudit.privateReservationsOpen,true);assert.equal(d.sourceAudit.disputedAssessmentPointsExcluded,true);
 assert.equal(d.sourceAudit.externalSourcesCount,0);
 const auth=d.scopedPublicationAuthorization;
 assert.equal(auth.status,'owner_accepted_with_private_reservations');assert.equal(auth.removeProvisionalLabel,true);
 assert.match(auth.privateEvidenceSha256,/^[a-f0-9]{64}$/);assert.ok(Number.isFinite(Date.parse(auth.approvedAt)));
 assert.equal(d.publicationApproval.status,'approved');assert.equal(d.publicationApproval.authorization,'explicit_go_publication');
 assert.equal(d.publicationApproval.scope,'course_package');
 assert.equal(d.generatedImageCount,0);assert.deepEqual(d.embeddedVectorDiagramPages,[3,10]);
 assert.deepEqual(Object.keys(d.publicArtifacts).sort(),['flashcards','qcm','sheet']);
 for(const [role,v] of Object.entries(d.publicArtifacts)){
  assert.match(v.path,/^assets\/[a-z0-9_-]+\/[A-Za-z0-9_/-]+\.pdf$/);
  assert.equal(hash(v.path),v.sha256);assert.equal(d.artifactSha256s[v.artifactId],v.sha256);
  assert.ok(Number.isInteger(v.pageCount)&&v.pageCount>0);
 }
 const ss=sheets.filter(s=>s.courseId===d.courseId);assert.equal(ss.length,1);
 assert.equal(ss[0].resourceId,d.sheetResourceId);assert.equal(ss[0].url,origin+d.publicArtifacts.sheet.path);
 assert.equal(ss[0].officialSupport,true);assert.equal(ss[0].provisional,false);
 assert.equal(course.officialSupportUrl,origin+d.officialSupportArtifact.path);
 assert.equal(hash(d.officialSupportArtifact.path),d.officialSupportArtifact.sha256);
 assert.equal(course.qcmPdfUrl,origin+d.publicArtifacts.qcm.path);
 assert.equal(course.flashcardsPdfUrl,origin+d.publicArtifacts.flashcards.path);
 assert.equal(d.assessmentOwnerReview.status,'owner_accepted');
 for(const role of ['qcm','flashcards'])assert.equal(d.assessmentOwnerReview[role+'Sha256'],d.publicArtifacts[role].sha256);
 const bank=read(d.qcmBank);assert.equal(validateBank(bank),d.qcmCount);
 assert.equal(bank.flatMap(q=>q.flashcards).length,d.flashcardCount);
 assert.deepEqual(read('questions-5.json').filter(q=>q.courseId===d.courseId),bank);
 assert.deepEqual(course.canonicalQuestionIds,bank.map(q=>q.id));
 const selected=vocabulary.filter(v=>d.vocabularyEntryIds.includes(v.id));assert.equal(selected.length,d.vocabularyCount);
 assert.equal(new Set(d.vocabularyEntryIds).size,d.vocabularyCount);assert.deepEqual(course.vocabularyEntryIds,d.vocabularyEntryIds);
 assert.equal(d.lexicon.termCount,d.vocabularyCount);assert.equal(course.flashcardTarget,d.flashcardCount);
 assert.equal(course.authoredFlashcardPresentation,'standalone_v1');
 assert.deepEqual(vocals.filter(v=>v.courseId===d.courseId).map(v=>v.id),d.vocals);
 assert.equal(d.audioOwnerReview.status,'owner_listening_accepted');
 assert.deepEqual(d.publicAudioArtifacts.map(v=>v.vocalId),d.newVocalIds);
 for(const v of d.publicAudioArtifacts){
  const row=vocals.find(x=>x.id===v.vocalId);assert.equal(row.localAudio,'./'+v.path);
  assert.equal(hash(v.path),v.sha256);assert.equal(d.audioOwnerReview.artifactSha256s[v.vocalId],v.sha256);
  assert.equal(row.durationSeconds,v.durationSeconds);assert.ok(v.durationSeconds>0&&v.durationSeconds<600);
 }
 assert.equal(course.audioCount,d.vocals.length);
 validateVisualOwnerReview(d.courseId,d,{sheets});
 if(questions)assert.deepEqual(JSON.parse(JSON.stringify(questions.filter(q=>q.courseId===d.courseId))),bank);
 if(deck){const cards=deck.filter(c=>c.courseId===d.courseId&&!String(c.id).startsWith('voc:'));assert.equal(cards.length,d.flashcardCount);
  for(const q of bank){const c=cards.find(x=>x.qid===q.id);assert.ok(c);assert.equal(c.sourceFront||c.front,q.flashcards[0].front);assert.deepEqual(JSON.parse(JSON.stringify(c.answers)),q.flashcards[0].answers.flatMap(s=>s.split(/\s*;\s*/)).map(s=>s.trim()));}}
 return true;
}

export function approvedScopedAudioIds(manifest){
 const result=[];
 for(const d of manifest.courses.filter(isOfficialScoped)){
  validateOfficialScoped(read('course-registry-v741.json').courses.find(c=>c.id===d.courseId),d,
   {sheets:[1,2,3].flatMap(n=>read(`sheets-${n}.json`)),vocabulary:read('vocabulaire-v1.json').entries,vocals:read('vocals.json')});
  result.push(...d.newVocalIds);
 }
 return result;
}
