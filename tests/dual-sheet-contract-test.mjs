import assert from 'node:assert/strict';
import {validateDualSheetDelivery,validateDualSheetPart} from './dual-sheet-contract.mjs';
const H='a'.repeat(64), J='b'.repeat(64);
const classic={resourceId:'demo_fiche_p01',sheetFormat:'classic',courseId:'demo',officialSupport:true,driveId:'DRIVE_CLASSIC',
 url:'https://drive.google.com/file/d/DRIVE_CLASSIC/view'};
const visual={resourceId:'demo_fiche_complete_infographiee_p01',sheetFormat:'complete_infographic',courseId:'demo',officialSupport:true,driveId:'DRIVE_VISUAL',
 url:'https://drive.google.com/file/d/DRIVE_VISUAL/view'};
const audit=(hash,count)=>({status:'PASS',pdfSha256:hash,expectedCount:count,checkedCount:count});
const pub=(hash,count)=>({status:'MATCH',source:'authenticated_drive_download',pdfSha256:hash,expectedCount:count,checkedCount:count});
const delivery={
 sheetResourceId:classic.resourceId,infographicSheetResourceId:visual.resourceId,
 infographicResourceIds:['figure_1','figure_2'],
 visualAudit:audit(H,2),publishedVerification:pub(H,2),
 infographicSheetVisualAudit:audit(J,2),infographicSheetPublishedVerification:pub(J,2),
 artifactSha256s:{DRIVE_CLASSIC:H,DRIVE_VISUAL:J},
 dualSheetCoverage:{expectedNotions:12,classicCovered:12,infographicCovered:12,medicalReview:'approved'}
};
const checked=()=>validateDualSheetDelivery('demo',delivery,[classic,visual]);
assert.equal(checked().illustrated.resourceId,visual.resourceId);
assert.equal(validateDualSheetPart('demo',{...delivery,partId:'p01',sheetResourceIds:[classic.resourceId,visual.resourceId]},[classic,visual]).classic.resourceId,classic.resourceId);
const error=(next,pattern,sheets=[classic,visual])=>assert.throws(
 ()=>validateDualSheetDelivery('demo',next,sheets),pattern);
error({...delivery,infographicSheetResourceId:null},/fiche complete_infographic|resourceId/);
error({...delivery,infographicSheetResourceId:classic.resourceId},/DISTINCTS/);
error({...delivery},/même Drive ID/,[classic,{...visual,driveId:classic.driveId,url:classic.url}]);
error({...delivery},/sheetFormat/,[classic,{...visual,sheetFormat:'classic'}]);
error({...delivery,infographicSheetVisualAudit:undefined},/contrôle PDF/);
error({...delivery,infographicSheetPublishedVerification:undefined},/non vérifié/);
error({...delivery,artifactSha256s:{DRIVE_CLASSIC:H,DRIVE_VISUAL:H}},/ne concorde pas/);
error({...delivery,dualSheetCoverage:{...delivery.dualSheetCoverage,infographicCovered:11}},/couverture pédagogique/);
error({...delivery,dualSheetCoverage:{...delivery.dualSheetCoverage,medicalReview:'pending'}},/revue médicale/);
assert.throws(()=>validateDualSheetPart('demo',{...delivery,partId:'p02',sheetResourceIds:[classic.resourceId]},[classic,visual]),/deux fiches/);
assert.throws(()=>validateDualSheetPart('demo',{...delivery,partId:'p02',sheetResourceIds:[classic.resourceId,visual.resourceId],infographicSheetResourceId:'missing'},[classic,visual]),/déclarées/);
// Cas synthétique Psychologie : deux PDF validés, aucun schéma individuel nécessaire.
const psychological={
 ...delivery,
 infographicResourceIds:[],
 schematics:'none',
 schematicsJustification:'Cours théorique de psychologie : notions expliquées par situations et comparaisons, sans schéma individuel pertinent.',
 visualAudit:audit(H,0),
 publishedVerification:pub(H,0),
 infographicSheetVisualAudit:audit(J,0),
 infographicSheetPublishedVerification:pub(J,0),
 dualSheetCoverage:{
  expectedNotions:12,classicCovered:12,infographicCovered:12,
  disciplinaryReview:{type:'conceptual',status:'approved'}
 }
};
assert.equal(validateDualSheetDelivery('demo',psychological,[classic,visual]).classic.resourceId,classic.resourceId);
assert.equal(validateDualSheetPart('demo',{...psychological,partId:'p02',
  sheetResourceIds:[classic.resourceId,visual.resourceId]},[classic,visual]).illustrated.resourceId,visual.resourceId);
const rejectsPsych=(change,re,msg='')=>assert.throws(()=>validateDualSheetDelivery(
  'demo',{...psychological,...change},[classic,visual]),re,msg);
rejectsPsych({schematics:undefined},/schematics=none/);
rejectsPsych({schematicsJustification:'pas de schéma'},/justifier le choix pédagogique/);
rejectsPsych({visualAudit:undefined},/contrôle PDF classique PASS absent/);
rejectsPsych({publishedVerification:undefined},/non vérifié/);
rejectsPsych({infographicSheetVisualAudit:audit(J,1)},/expectedCount doit être 0/);
rejectsPsych({dualSheetCoverage:{...psychological.dualSheetCoverage,disciplinaryReview:{type:'medical',status:'approved'}}},/revue conceptuelle/);
rejectsPsych({dualSheetCoverage:{...psychological.dualSheetCoverage,disciplinaryReview:{type:'conceptual',status:'pending'}}},/non approuvée/);
rejectsPsych({dualSheetCoverage:{...psychological.dualSheetCoverage,infographicCovered:11}},/couverture pédagogique/);
assert.throws(()=>validateDualSheetDelivery('demo',{...delivery,schematics:'none'},[classic,visual]),/contradiction/);
console.log('✅ v1.14 : psychologie sans schéma individuel : deux PDF et revue conceptuelle, 11 cas positifs/négatifs.');

const captureSheets=[classic,visual].map(x=>({...x,officialSupport:false}));
const captureRevision={...delivery,deliveryMode:'existing_course_revision',status:'partial',sourceBasis:{kind:'course_captures',nativeSupportAvailable:false,reconciled:true},blockers:[{resource:'support',reason:'native_support_unavailable'}]};
validateDualSheetDelivery('demo',captureRevision,captureSheets);
for(const bad of [{status:'complete'},{sourceBasis:{kind:'course_captures',nativeSupportAvailable:true,reconciled:true}},{blockers:[]},{publishedVerification:undefined},{infographicSheetPublishedVerification:undefined}]){
 assert.throws(()=>validateDualSheetDelivery('demo',{...captureRevision,...bad},captureSheets));
}
assert.throws(()=>validateDualSheetDelivery('demo',captureRevision,[classic,visual]),/PDF officiel/);
assert.throws(()=>validateDualSheetDelivery('demo',delivery,captureSheets),/support officiel/);
console.log('✅ Révision sur captures : réserve obligatoire, aucun faux support officiel, deux PDF et téléchargements toujours exigés.');

console.log('✅ v1.13 : 13 scénarios positifs/négatifs sur les deux fiches, preuves PDF et couverture.');
