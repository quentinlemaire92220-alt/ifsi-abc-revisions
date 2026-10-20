import assert from 'node:assert/strict';
import {validateDualSheetDelivery,validateDualSheetPart} from './dual-sheet-contract.mjs';
import {publicationBundle,bundleDigest} from './course-publication-approval-lib.mjs';
const id='cours_test',digest='a'.repeat(64),boardDigest='b'.repeat(64);
const proof=pdfSha256=>({status:'MATCH',source:'authenticated_drive_download',pdfSha256,expectedCount:1,checkedCount:1});
const sheet={courseId:id,resourceId:'cours_test_fiche_p02',sheetFormat:'classic',officialSupport:true,driveId:'TEST_SHEET',url:'https://drive.google.com/file/d/TEST_SHEET/view'};
const delivery={revisionSheetMode:'single_with_complete_boards',partId:'p02',sheetResourceId:sheet.resourceId,sheetResourceIds:[sheet.resourceId],infographicResourceIds:['board_p02_01'],
 artifactSha256s:{TEST_SHEET:digest,TEST_BOARD:boardDigest},visualAudit:{status:'PASS',pdfSha256:digest,expectedCount:1,checkedCount:1},publishedVerification:proof(digest),
 sheetCoverage:{expectedNotions:20,coveredNotions:20,disciplinaryReview:{type:'conceptual',status:'approved'}},
 completeBoardAudits:{board_p02_01:{status:'PASS',driveId:'TEST_BOARD',pdfSha256:boardDigest,expectedCount:1,checkedCount:1,publishedVerification:proof(boardDigest)}}};
assert.doesNotThrow(()=>validateDualSheetPart(id,delivery,[sheet]));
const rejects=change=>{const d=structuredClone(delivery);change(d);assert.throws(()=>validateDualSheetPart(id,d,[sheet]));};
rejects(d=>delete d.revisionSheetMode);
rejects(d=>d.sheetResourceIds.push('unexpected_second_sheet'));
rejects(d=>d.infographicSheetResourceId='unexpected_second_sheet');
rejects(d=>d.sheetCoverage.coveredNotions--);
rejects(d=>d.publishedVerification.pdfSha256=boardDigest);
rejects(d=>d.completeBoardAudits.board_p02_01.publishedVerification.source='local_original');
rejects(d=>delete d.completeBoardAudits.board_p02_01);
rejects(d=>d.completeBoardAudits.board_p02_01.checkedCount=0);
rejects(d=>d.infographicResourceIds=[]);
rejects(d=>d.sheetCoverage.disciplinaryReview.status='pending');
assert.throws(()=>validateDualSheetDelivery(id,delivery,[{...sheet,officialSupport:false}]));
const data={registry:{courses:[{id}]},sheets:[sheet],infographics:[],vocals:[],banks:{},imageHashes:{},vocabulary:[]};
const originalDigest=bundleDigest(publicationBundle(id,delivery,data));
const modified=structuredClone(delivery);modified.sheetCoverage.coveredNotions--;
assert.notEqual(bundleDigest(publicationBundle(id,modified,data)),originalDigest,'Couverture non liée à l’accord de publication');
modified.sheetCoverage.coveredNotions++;modified.completeBoardAudits.board_p02_01.publishedVerification.status='PENDING';
assert.notEqual(bundleDigest(publicationBundle(id,modified,data)),originalDigest,'Preuves de planches non liées à l’accord');
console.log('✅ Fiche unique : acceptation explicite et 11 refus de ressources ou preuves incomplètes.');
