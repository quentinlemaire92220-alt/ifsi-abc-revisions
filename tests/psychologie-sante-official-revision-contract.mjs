// Révision officielle ciblée : les octets et contrats historiques restent contrôlés.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {validateBank} from '../tools/qcm-bank-contract.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const sha=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
export const isPsychologieOfficialRevision=d=>d?.courseId==='psychologie_sante'&&
 d.deliveryMode==='existing_course_revision'&&d.publicationSubset==='official_support_revision_62_71_39p';
export function validatePsychologieOfficialRevision(d,data={}){
 assert.ok(isPsychologieOfficialRevision(d),'Révision officielle non identifiée');
 const r=d.officialRevision;
 assert.equal(r?.contract,'psychologie_sante_official_revision_v1');
 assert.equal(r.historicalDeliveryPath,'docs/proposals/psychologie-sante-20261029/historical-delivery.json');
 assert.equal(r.historicalBankPath,'data/course-bank-history/psychologie_sante_20261027.json');
 const history=read(r.historicalDeliveryPath),prior=history.delivery;
 assert.equal(sha(r.historicalBankPath),r.historicalBankSha256);
 assert.equal(sha(r.historicalDeliveryPath),r.historicalDeliverySha256);
 assert.equal(r.previousPublicationBundleSha256,prior.publicationApproval.bundleSha256);
 assert.equal(r.previousRevisionSheetBundleSha256,prior.revisionSheetSupplement.publicationApproval.bundleSha256);
 assert.deepEqual(d.revisionSheetSupplement,prior.revisionSheetSupplement,'Accord historique de la fiche remplacé');
 assert.deepEqual(d.qcmGraphicOwnerReview,prior.qcmGraphicOwnerReview,'Accord QCM historique remplacé');
 const bank=data.bank||read(d.qcmBank),previous=read(r.historicalBankPath);
 assert.equal(previous.length,50);assert.equal(previous.flatMap(q=>q.flashcards).length,59);
 assert.deepEqual(bank.slice(0,50),previous,'Question/carte historique modifiée');
 assert.equal(validateBank(bank,'Psychologie officielle',{glossaryCount:71}),62);
 const mirror=data.questions||read('questions-5.json');
 assert.deepEqual(mirror.filter(q=>q.courseId===d.courseId),bank,'Miroir interactif divergent');
 assert.equal(d.qcmCount,62);assert.equal(d.flashcardCount,71);
 const registry=data.registry||read('course-registry-v741.json');
 const course=registry.courses.find(c=>c.id===d.courseId);
 const mutable=['officialSupport','nativeSupportAvailable','provisional','sourceStatus','qcmPdfUrl','qcmPdfQuestionCount','flashcardTarget','additionalDocuments','officialSupportUrl','officialSupportItems'];
 const identity=c=>Object.fromEntries(Object.entries(c).filter(([k])=>!mutable.includes(k)));
 assert.deepEqual(identity(course),identity(history.course),'Identité du cours ou audio modifiés');
 assert.deepEqual(course.additionalDocuments.slice(0,history.course.additionalDocuments.length),history.course.additionalDocuments);
 assert.equal(course.flashcardTarget,71);assert.equal(course.qcmPdfQuestionCount,62);
 const voices=(data.vocals||read('vocals.json')).filter(x=>x.courseId===d.courseId);
 assert.deepEqual(voices,history.vocals,'Les deux vocaux historiques ont changé');
 for(const v of voices)assert.equal(sha(v.localAudio),d.artifactSha256s[v.driveId]);
 const sheets=(data.sheets||[1,2,3].flatMap(n=>read('sheets-'+n+'.json'))).filter(s=>s.courseId===d.courseId);
 const upgrade=d.postOfficialSheetRevision;assert.equal(sheets.length,upgrade?4:3);assert.equal(history.sheets.length,2);
 assert.deepEqual(r.archivedSheetResourceIds,history.sheets.map(s=>s.resourceId));
 for(const old of history.sheets)assert.deepEqual(sheets.find(s=>s.resourceId===old.resourceId),
  {...old,sourceStatus:'archived'},'Archive historique altérée ou supprimée');
 if(upgrade){assert.deepEqual(sheets.find(s=>s.resourceId===upgrade.previousSheet.resourceId),{...upgrade.previousSheet,sourceStatus:'archived'});assert.equal(sha(upgrade.previousReview.publicArtifact.path),upgrade.previousReview.publicArtifact.sha256);assert.equal(upgrade.previousReview.publicArtifact.sha256,r.acceptedPdfSha256s.sheet);assert.equal(upgrade.publicationApproval.status,'approved');}
 const active=sheets.filter(s=>s.sourceStatus!=='archived');assert.equal(active.length,1);
 assert.equal(active[0].resourceId,d.sheetResourceId);assert.equal(active[0].primaryRevision,true);
 assert.equal(active[0].pageCount,upgrade?upgrade.pageCount:39);assert.equal(active[0].lexiconTermCount,upgrade?79:73);
 assert.equal(active[0].officialSupport,true);assert.equal(active[0].provisional,false);
 if(upgrade?.revisionId==='psychologie_sante_52p_20261102'){
  assert.equal(upgrade.pdfSha256,'9c651de40791b83755bf11a883f40d5f2a96729afedc217b27c6d30d49126f4d');
  assert.equal(upgrade.pageCount,52);
  assert.equal(upgrade.archivedCandidateSheets.length,1);
  for(const old of upgrade.archivedCandidateSheets){assert.equal(sheets.some(s=>s.resourceId===old.resourceId),false,'Candidat QA non publié ajouté au catalogue étudiant');assert.equal(old.sourceStatus,'archived');}
  assert.equal(sha(upgrade.archivedCandidateArtifacts[0].path),'5408fb972722c012d916ec1a857f01943c2b0c11116426216ebc0aa96651b6d1');
  assert.equal(course.officialSupportUrl,'https://drive.google.com/drive/folders/11Q1sWdn_k9IWdH-50zvHaWpDClVux0vu');
  assert.deepEqual(course.officialSupportItems.map(x=>x.url),[
   'https://drive.google.com/file/d/1-W3SwRme-OUHg6AcTgXPqSc6DeQ-DRaB/view',
   'https://drive.google.com/file/d/1F5JbtGThluVbgIiGvwnZWz28regXpmMa/view',
   'https://drive.google.com/file/d/1jDMytgilRYduAlIjurkHwN3PfmlWLpjL/view']);
  assert.equal(course.provisional,false);
 }else{
  assert.deepEqual(course.officialSupportUrl,history.course.officialSupportUrl);
  assert.deepEqual(course.officialSupportItems,history.course.officialSupportItems);
 }
 const expected={sheet:upgrade?[upgrade.pdfSha256,upgrade.pageCount]:['236c5eed098a93ad3c85502ef0246a0dbd653d528595f8c72e3ee4b69d4595bf',39],
  qcm:['c755a88bd8c7a58bd73ea566d6781160684987abd422e57fda22a8d368dcd2cf',29],
  flashcards:['6839fcb91093383eb8dc525716b8ddcc64e7f4b00ae56fa997aca129e5f7b716',12]};
 assert.deepEqual(Object.keys(d.publicArtifacts).sort(),Object.keys(expected).sort());
 for(const [role,[hash,pages]] of Object.entries(expected)){
  const a=d.publicArtifacts[role];assert.equal(a.sha256,hash);assert.equal(sha(a.path),hash);
  assert.equal(a.pageCount,pages);assert.equal(d.artifactSha256s[a.artifactId],hash);
  if(role!=='sheet'||!upgrade)assert.equal(r.acceptedPdfSha256s[role],hash);
 }
 for(const a of Object.values(prior.publicArtifacts))assert.equal(sha(a.path),a.sha256);
 assert.equal(sha(prior.revisionSheetSupplement.publicAsset.path),prior.revisionSheetSupplement.pdfSha256);
 assert.equal(d.sourceBasis.nativeSupportAvailable,true);assert.equal(d.sourceBasis.officialSupportPending,false);
 assert.equal(d.sourceAudit.officialSupportCount,3);assert.equal(d.sourceAudit.transcriptionCount,4);
 assert.equal(d.sourceAudit.oralStatus,'complete');assert.equal(d.sourceAudit.originalAudioCompared,false);
 assert.equal(d.pedagogicalNonRegression.inheritanceReview,'compared');
 assert.equal(d.templateConformance.artifacts.sheet.status,'owner_accepted');
 assert.equal(d.templateConformance.artifacts.qcm.status,'owner_accepted');
 assert.equal(d.visualOwnerReview.status,'owner_accepted');
 assert.equal(d.publicationApproval.status,'approved');
 assert.equal(d.publicationApproval.authorization,'explicit_go_publication');
 assert.equal(d.publicationApproval.scope,'course_package');
 assert.equal(d.partDeliveries.length,1);
 assert.deepEqual(d.partDeliveries[0].qcmQuestionIds,bank.map(q=>q.id));
 return {questions:62,flashcards:71,historicalQuestions:50,historicalFlashcards:59};
}
export function isPsychologieSheetArchive(previous,current,delivery){
 if(!isPsychologieOfficialRevision(delivery)||previous.courseId!==delivery.courseId||
  ![...delivery.officialRevision.archivedSheetResourceIds,delivery.postOfficialSheetRevision?.previousSheet?.resourceId].includes(previous.resourceId))return false;
 validatePsychologieOfficialRevision(delivery);
 assert.deepEqual(current,{...previous,sourceStatus:'archived'});
 return true;
}
