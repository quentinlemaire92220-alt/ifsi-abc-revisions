// Test de contrat fictif : aucune ressource créée, publiée ni médicalement attestée.
import assert from 'node:assert/strict';
import {validateWrittenDelivery,validateWrittenPart} from './written-sheet-contract.mjs';
import {validateHybridDelivery} from './hybrid-sheet-contract.mjs';
const H='a'.repeat(64),B='b'.repeat(64);
const sheet={courseId:'demo',resourceId:'demo_written_p01',sheetFormat:'written_revision',
 officialSupport:true,driveId:'TEST_PDF',url:'https://drive.google.com/file/d/TEST_PDF/view'};
const audit={status:'PASS',pdfSha256:H,pageSize:'A4',pageCount:19,
 allPagesRendered:true,topAndBottomPurpleBandsEveryPage:true,noOverlaidHeaders:true,
 textSelectable:true,noImages:true,noClippedText:true,oneQcmPitfallSection:true,
 summaryBeforeLexicon:true,lexiconLast:true,navigationChecked:true};
const source={officialChecked:true,oralStatus:'complete',speakerStudentSeparated:true,
 teachingNotesPrivateTrace:true,notesWithoutTimestamps:true,
 externalSourcesCount:0,externalAuthorization:'not_requested'};
const good={packFormat:'written_v1',sheetResourceId:sheet.resourceId,
 sheetResourceIds:[sheet.resourceId],infographicResourceIds:[],schematics:'none',
 generatedImageCount:0,sourceAudit:source,
 writtenCoverage:{expectedEssential:20,coveredEssential:20,
 explicitVsInferredPrioritiesSeparated:true,explanationsNotOvercompressed:true,disciplinaryReview:'approved'},
 writtenPdfAudit:audit,writtenModelReference:'communication_written_v5.3_2026-10-24',
 artifactSha256s:{TEST_PDF:H},lexicon:{termCount:35,textSelectable:true,checked:true},
 publishedVerification:{status:'MATCH',source:'authenticated_drive_download',pdfSha256:H}};
const run=d=>validateWrittenDelivery('demo',d,[sheet]);
assert.equal(run(good).written.resourceId,sheet.resourceId);
assert.equal(validateWrittenPart('demo',{...good,partId:'p01'},[sheet]).written.resourceId,sheet.resourceId);
const rejects=(change,reason)=>assert.throws(()=>run(change(good)),reason);
rejects(x=>({...x,packFormat:'hybrid_v1'}),/packFormat/);
rejects(x=>({...x,generatedImageCount:1}),/image générée/);
rejects(x=>({...x,schematics:'embedded_only'}),/schéma/);
rejects(x=>({...x,infographicResourceIds:['poster']}),/planches/);
rejects(x=>({...x,sourceAudit:{...source,oralStatus:'missing'}}),/transcriptions/);
rejects(x=>({...x,sourceAudit:{...source,externalSourcesCount:1}}),/autorisation/);
assert.equal(run({...good,sourceAudit:{...source,externalSourcesCount:1,
 externalAuthorization:'explicit_prior_approval'}}).written.resourceId,sheet.resourceId);
rejects(x=>({...x,writtenCoverage:{...x.writtenCoverage,coveredEssential:19}}),/manquantes/);
rejects(x=>({...x,writtenCoverage:{...x.writtenCoverage,explicitVsInferredPrioritiesSeparated:false}}),/priorités/);
rejects(x=>({...x,writtenPdfAudit:{...audit,topAndBottomPurpleBandsEveryPage:false}}),/bandeaux/);
rejects(x=>({...x,writtenPdfAudit:{...audit,noOverlaidHeaders:false}}),/superposées/);
rejects(x=>({...x,writtenPdfAudit:{...audit,noImages:false}}),/image/);
rejects(x=>({...x,writtenPdfAudit:{...audit,oneQcmPitfallSection:false}}),/dupliqués/);
rejects(x=>({...x,writtenPdfAudit:{...audit,summaryBeforeLexicon:false}}),/synthèse/);
rejects(x=>({...x,writtenPdfAudit:{...audit,lexiconLast:false}}),/lexique/);
rejects(x=>({...x,lexicon:{...x.lexicon,textSelectable:false}}),/sélectionnable/);
rejects(x=>({...x,artifactSha256s:{TEST_PDF:B}}),/empreintes/);
rejects(x=>({...x,publishedVerification:{...x.publishedVerification,pdfSha256:B}}),/publié/);
assert.equal(validateWrittenDelivery('demo',{...good,publishedVerification:undefined},[sheet],
 {requirePublishedVerification:false}).written.resourceId,sheet.resourceId);
assert.throws(()=>validateHybridDelivery('demo',good,[sheet]),/hybrid_v1/);
console.log('✅ written_v1: fiche écrite sans image, couverture/oral, bandeaux, QCM unique, synthèse, lexique et preuve Drive.');
