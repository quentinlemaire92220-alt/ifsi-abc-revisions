// TNR v1.46 — nouveaux packs : un PDF hybride, zéro planche totale séparée.
// Fixturing only: no user/source content, Drive upload or fictitious publication.
import assert from 'node:assert/strict';
import {validateHybridDelivery,validateHybridPart} from './hybrid-sheet-contract.mjs';
import {validateLeanCourseDelivery} from './lean-course-contract.mjs';

const H='a'.repeat(64), L='b'.repeat(64);
const sheet={courseId:'demo',resourceId:'demo_hybrid_p01',sheetFormat:'hybrid_infographic',
 officialSupport:true,driveId:'TEST_PDF',url:'https://drive.google.com/file/d/TEST_PDF/view'};
const audit={status:'PASS',pdfSha256:H,expectedCount:6,checkedCount:6,pageCount:8,pageSize:'A4'};
const proof={status:'MATCH',source:'authenticated_drive_download',pdfSha256:H,
 expectedCount:6,checkedCount:6,pageCount:8};
const good={packFormat:'hybrid_v1',sheetResourceId:sheet.resourceId,
 sheetResourceIds:[sheet.resourceId],infographicResourceIds:[],
 schematics:'embedded_only',embeddedFigureCount:6,visualAudit:audit,
 publishedVerification:proof,artifactSha256s:{TEST_PDF:H},
 hybridCoverage:{expectedEssential:12,coveredEssential:12,
 prioritySourceReference:'Matrice des priorités sourcée et vérifiée',
 medicalReview:'approved',readabilityReview:'approved'},
 hybridVisualReview:{status:'approved',reference:'pharmacologie_v1.46_10_pages',pagesChecked:8},
 lexicon:{termCount:30,textSelectable:true,checked:true,sourceSha256:L}};
const run=d=>validateHybridDelivery('demo',d,[sheet]);
assert.equal(run(good).hybrid.resourceId,sheet.resourceId);
assert.equal(validateHybridPart('demo',{...good,partId:'p02'},[sheet]).hybrid.resourceId,sheet.resourceId);
const rejects=(patch,reason)=>assert.throws(()=>run({...good,...patch}),reason);
rejects({packFormat:'lean_v1'},/packFormat/);
rejects({infographicSheetResourceId:'old_second'},/second PDF/);
rejects({dualSheetCoverage:{}},/dualSheetCoverage/);
rejects({infographicResourceIds:['poster']},/planches séparées/);
rejects({sheetResourceIds:['first','second']},/une seule fiche/);
rejects({schematics:'none'},/intégrées/);
rejects({embeddedFigureCount:0},/infographies intégrées/);
rejects({visualAudit:{...audit,pageCount:0}},/pages invalide/);
rejects({visualAudit:{...audit,checkedCount:5}},/tous inspectés/);
rejects({hybridCoverage:{...good.hybridCoverage,coveredEssential:11}},/essentielle manquante/);
rejects({hybridCoverage:{...good.hybridCoverage,medicalReview:'pending'}},/scientifique/);
rejects({hybridVisualReview:{...good.hybridVisualReview,pagesChecked:7}},/toutes les pages/);
rejects({hybridVisualReview:{...good.hybridVisualReview,reference:'cardiovasculaire'}},/référence visuelle/);
rejects({lexicon:{...good.lexicon,textSelectable:false}},/sélectionnable/);
rejects({lexicon:{...good.lexicon,termCount:0}},/lexique/);
rejects({publishedVerification:{...proof,pageCount:7}},/pagination Drive/);
rejects({artifactSha256s:{TEST_PDF:L}},/empreinte/);
assert.equal(validateHybridDelivery('demo',{...good,publishedVerification:undefined},[sheet],
 {requirePublishedVerification:false}).hybrid.resourceId,sheet.resourceId);
// The existing lean_v1 validator MUST NOT silently accept a hybrid pack.
assert.throws(()=>validateLeanCourseDelivery('demo',good,[sheet]),/packFormat lean_v1/);
console.log('✅ hybrid_v1: fiche unique, couverture essentielle, lexique, modèle visuel et preuves Drive; héritage isolé.');
