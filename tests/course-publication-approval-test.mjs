import assert from 'node:assert/strict';
import {publicationBundle,bundleDigest,validatePublicationApproval,validateChangedDeliveries} from './course-publication-approval-lib.mjs';
const clone=x=>JSON.parse(JSON.stringify(x));
const data={registry:{courses:[{id:'example',label:'Exemple'}]},sheets:[{courseId:'example',resourceId:'sheet01',driveId:'public-file'}],infographics:[{courseId:'example',resourceId:'info01',localImage:'assets/example.webp'}],vocals:[],banks:{'qextra-example.txt':[{id:'q01',courseId:'example',question:'Question ?',choices:['A','B','C','D','E'],answers:[1],explanation:'Explication du cours.'}]},imageHashes:{'assets/example.webp':'a'.repeat(64)},vocabulary:[]};
const delivery={courseId:'example',qcmBank:'qextra-example.txt',vocalScripts:[{number:1,driveId:'script01'}],visualAudit:{pdfSha256:'a'.repeat(64)},publishedVerification:{pdfSha256:'a'.repeat(64)},artifactSha256s:{'public-file':'a'.repeat(64),script01:'b'.repeat(64)}};
// L'ancien test publiait une fiche avec seulement un drapeau PASS technique.
 // Le nouveau contrat demande une revue graphique explicite, liee au PDF.
delivery.visualOwnerReview={
 status:'owner_accepted',
 reference:'cardiovascular_revision_pdf_17p',
 method:'manual_full_pdf_comparison_100_200_percent',
 reviewedAt:'2026-10-21T20:30:00Z',
 reviewerDecision:'explicit_graphic_acceptance',
 criteria:Object.fromEntries([
 'REVISION_TEXT_FIRST','MEDICAL_ILLUSTRATION_REAL','INTEGRATED_IN_CONTEXT',
 'ORIGINAL_LEGENDS_VERIFIED','NO_DECORATIVE_BOX_SUBSTITUTION','ALL_PAGES_CHECKED'
 ].map(k=>[k,'PASS'])),
 reviewedPdfSha256s:{sheet01:'a'.repeat(64)},
 reviewedImageSha256s:{info01:'a'.repeat(64)}
};
const digest=()=>bundleDigest(publicationBundle('example',delivery,data));
const approval={status:'approved',authorization:'explicit_go_publication',scope:'course_package',approvedAt:'2026-10-13T12:00:00Z',bundleSha256:digest()};
assert.throws(()=>validatePublicationApproval('example',delivery,digest()),/validation du package absente/);
for(const [field,value,error] of [['status','pending',/validation du package absente/],['authorization','go_production',/GO publication explicite absent/],['scope','qcm_only',/fichier seul/],['approvedAt','invalid',/date de validation/],['bundleSha256','invalid',/empreinte de validation invalide/]]){
 assert.throws(()=>validatePublicationApproval('example',{...delivery,publicationApproval:{...approval,[field]:value}},digest()),error);
}
const approved={...delivery,publicationApproval:approval};
assert.doesNotThrow(()=>validatePublicationApproval('example',approved,digest()));
assert.equal(validateChangedDeliveries({courses:[delivery]},{courses:[delivery]},data,data).length,0);
assert.throws(()=>validateChangedDeliveries({courses:[]},{courses:[delivery]},data,data),/validation du package absente/);
assert.equal(validateChangedDeliveries({courses:[]},{courses:[approved]},data,data).length,1);
for(const mutate of [d=>d.banks['qextra-example.txt'][0].answers=[2],d=>d.banks['qextra-example.txt'][0].explanation='Correction modifiée',d=>d.imageHashes['assets/example.webp']='new-hash',d=>d.vocals.push({courseId:'example',id:'audio01',driveId:'mp3'}),d=>d.sheets[0].driveId='new-pdf',d=>d.vocabulary.push({id:'term01',courseIds:['example'],definition:'Définition'})]){
 const changed=clone(data);mutate(changed);
 assert.throws(()=>validateChangedDeliveries({courses:[approved]},{courses:[approved]},data,changed),/changé après validation/);
}
const changed=clone(approved);changed.visualAudit.pdfSha256='b'.repeat(64);
assert.throws(()=>validateChangedDeliveries({courses:[approved]},{courses:[changed]},data,data),/changé après validation/);
const reordered={...data,registry:{courses:[{label:'Exemple',id:'example'}]}};
assert.equal(bundleDigest(publicationBundle('example',delivery,reordered)),digest());
const uncovered=clone(approved);delete uncovered.artifactSha256s.script01;
uncovered.publicationApproval.bundleSha256=bundleDigest(publicationBundle('example',uncovered,data));
assert.throws(()=>validateChangedDeliveries({courses:[]},{courses:[uncovered]},data,data),/empreinte du fichier examiné absente/);
console.log('✅ 19 scénarios : validation complète, GO distinct, portée, empreinte, QCM, image, PDF, vocabulaire, MP3, fichiers examinés et anciens cours inchangés.');

await import("./official-course-reconciliation-test.mjs");
