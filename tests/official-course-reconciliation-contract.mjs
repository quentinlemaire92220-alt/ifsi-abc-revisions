// Révision explicite d'un cours provisoire : conserver les archives et les acquis.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {publicationBundle,bundleDigest,validatePublicationApproval} from './course-publication-approval-lib.mjs';
const strip=(x,keys)=>Object.fromEntries(Object.entries(x).filter(([k])=>!keys.includes(k)));
const sha=b=>createHash('sha256').update(b).digest('hex');
export function validateOfficialReconciliation({prior,delivery,before,after,readAsset}){
 const id=prior.courseId,revision=delivery.reconciliation;
 assert.equal(revision?.type,'provisional_to_official_v1');
 assert.equal(delivery.courseId,id);assert.equal(prior.provisional,true);
 assert.equal(revision.previousBundleSha256,prior.publicationApproval.bundleSha256);
 assert.deepEqual(revision.previousArtifacts,prior.publicArtifacts);
 assert.notDeepEqual(delivery.publicationApproval,prior.publicationApproval,'Nouvelle autorisation nécessaire');
 validatePublicationApproval(id,delivery,bundleDigest(publicationBundle(id,delivery,after)));
 for(const a of Object.values(revision.previousArtifacts))assert.equal(sha(readAsset(a.path)),a.sha256,'Archive historique modifiée ou perdue');
 for(const a of Object.values(delivery.publicArtifacts)){
  assert.match(a.path,/^assets\/[\w/.-]+\.pdf$/);assert.ok(!a.path.includes('..'));
  assert.equal(sha(readAsset(a.path)),a.sha256,'PDF publié différent du lot approuvé');
 }
 assert.equal(delivery.validated,true);assert.equal(delivery.provisional,false);
 assert.equal(delivery.pedagogicalValidated,true);assert.equal(delivery.sourceAudit.officialChecked,true);
 assert.equal(delivery.sourceAudit.officialSupportPreservedPrivately,true);
 assert.equal(delivery.sourceBasis.reconciled,true);assert.equal(delivery.sourceBasis.nativeSupportAvailable,true);
 assert.equal(delivery.sheetResourceId,prior.sheetResourceId);assert.equal(delivery.qcmBank,prior.qcmBank);
 assert.deepEqual(delivery.vocals,prior.vocals);assert.deepEqual(delivery.infographics,prior.infographics);
 const was=before.registry.courses.find(c=>c.id===id),now=after.registry.courses.find(c=>c.id===id);
 const mutable=['label','officialSupport','sourceStatus','provisional','sourceNote','qcmPdfUrl','qcmPdfQuestionCount','flashcardTarget','additionalDocuments'];
 assert.deepEqual(strip(now,mutable),strip(was,mutable),'Identité ou audio historique modifié');
 assert.equal(now.officialSupport,true);assert.equal(now.provisional,false);assert.equal(now.sourceStatus,'active');
 assert.deepEqual(now.additionalDocuments.slice(0,was.additionalDocuments.length),was.additionalDocuments,'Document historique perdu');
 const url=a=>'https://quentinlemaire92220-alt.github.io/ifsi-abc-revisions/'+a.path;
 const urls=Object.values(delivery.publicArtifacts).map(url);
 assert.equal(now.qcmPdfUrl,url(delivery.publicArtifacts.qcm));
 assert.ok(now.additionalDocuments.slice(was.additionalDocuments.length).every(d=>urls.includes(d.url)));
 const oldBank=before.banks[prior.qcmBank],bank=after.banks[delivery.qcmBank];
 assert.deepEqual(bank.slice(0,oldBank.length),oldBank,'Question ou carte historique modifiée');
 assert.equal(new Set(bank.map(q=>q.id)).size,bank.length);assert.ok(bank.every(q=>q.courseId===id));
 assert.equal(delivery.qcmCount,bank.length);assert.equal(now.qcmPdfQuestionCount,bank.length);
 assert.equal(delivery.flashcardCount,bank.flatMap(q=>q.flashcards||[]).length);assert.equal(now.flashcardTarget,delivery.flashcardCount);
 const oldTerms=before.vocabulary.filter(v=>v.courseIds.includes(id)),terms=after.vocabulary.filter(v=>v.courseIds.includes(id));
 assert.deepEqual(terms.slice(0,oldTerms.length),oldTerms);assert.equal(delivery.vocabularyCount,terms.length);
 for(const field of ['vocals','infographics'])assert.deepEqual(after[field].filter(x=>x.courseId===id),before[field].filter(x=>x.courseId===id));
 const oldSheets=before.sheets.filter(x=>x.courseId===id),sheets=after.sheets.filter(x=>x.courseId===id);
 assert.deepEqual(sheets.map(s=>s.resourceId),oldSheets.map(s=>s.resourceId));
 for(const sheet of sheets){
  const old=oldSheets.find(x=>x.resourceId===sheet.resourceId);
  if(sheet.resourceId!==delivery.sheetResourceId){assert.deepEqual(sheet,old);continue;}
  assert.equal(sheet.url,url(delivery.publicArtifacts.sheet));assert.equal(sheet.pageCount,delivery.publicArtifacts.sheet.pageCount);
  assert.equal(sheet.officialSupport,true);assert.equal(sheet.provisional,false);assert.equal(sheet.courseId,id);
 }
 return true;
}
export function verifyOfficialCourseReconciliation(id,base){
 const json=(ref,p)=>JSON.parse(ref?execFileSync('git',['show',ref+':'+p],{maxBuffer:32*1024*1024}):fs.readFileSync(p));
 const prior=json(base,'docs/course-deliveries.json').courses.find(c=>c.courseId===id),delivery=json(null,'docs/course-deliveries.json').courses.find(c=>c.courseId===id);
 const data=ref=>({registry:json(ref,'course-registry-v741.json'),sheets:[1,2,3].flatMap(n=>json(ref,`sheets-${n}.json`)),infographics:json(ref,'infographics.json'),vocals:json(ref,'vocals.json'),vocabulary:json(ref,'vocabulaire-v1.json').entries,banks:{[prior.qcmBank]:json(ref,prior.qcmBank)},imageHashes:{}});
 return validateOfficialReconciliation({prior,delivery,before:data(base),after:data(null),readAsset:p=>fs.readFileSync(p)});
}
