import assert from 'node:assert/strict';
import {requireVisualReviewIfChanged,validateVisualOwnerReview} from './visual-owner-review-gate.mjs';
const h='a'.repeat(64), j='b'.repeat(64);
const clone=x=>JSON.parse(JSON.stringify(x));
const data={sheets:[
 {courseId:'douleur',resourceId:'douleur_fiche',driveId:'PDF_CLASSIC',title:'Fiche Douleur'},
 {courseId:'douleur',resourceId:'douleur_infographie',driveId:'PDF_INFO',title:'Cours infographie'}
],infographics:[{courseId:'douleur',resourceId:'mecanisme_01',localImage:'assets/mecanisme.webp'}],
imageHashes:{'assets/mecanisme.webp':h}};
const delivery={courseId:'douleur',sheetResourceId:'douleur_fiche',
 infographicSheetResourceId:'douleur_infographie',
 infographicResourceIds:['mecanisme_01'],artifactSha256s:{PDF_CLASSIC:h,PDF_INFO:j},
 visualAudit:{pdfSha256:h},infographicSheetVisualAudit:{pdfSha256:j}};
const review={
 status:'owner_accepted',
 reference:'cardiovascular_revision_pdf_17p',
 method:'manual_full_pdf_comparison_100_200_percent',
 reviewedAt:'2026-10-21T20:00:00Z',reviewerDecision:'explicit_graphic_acceptance',
 criteria:Object.fromEntries([
  'REVISION_TEXT_FIRST','INFOGRAPHIC_VISUAL_FIRST','MEDICAL_ILLUSTRATION_REAL',
  'INTEGRATED_IN_CONTEXT','ORIGINAL_LEGENDS_VERIFIED',
  'NO_DECORATIVE_BOX_SUBSTITUTION','ALL_PAGES_CHECKED'].map(x=>[x,'PASS'])),
 reviewedPdfSha256s:{douleur_fiche:h,douleur_infographie:j},
 reviewedImageSha256s:{mecanisme_01:h}};
assert.throws(()=>requireVisualReviewIfChanged('douleur',null,delivery,data,data),
 /REVUE VISUELLE BLOQUANTE/, 'Nouveau lot sans inspection explicite rejeté');
assert.throws(()=>validateVisualOwnerReview('douleur',{...delivery,visualOwnerReview:{status:'PASS'}},data),
 /owner_accepted/, 'Une étiquette PASS technique ne suffit pas');
const reviewed={...delivery,visualOwnerReview:review};
assert.equal(requireVisualReviewIfChanged('douleur',null,reviewed,data,data),true);
assert.equal(requireVisualReviewIfChanged('douleur',reviewed,reviewed,data,data),false,
 'Ancien lot inchangé reste exempt');
assert.equal(requireVisualReviewIfChanged('douleur',reviewed,{...reviewed,qcmDriveId:'new'},data,data),false,
 'QCM uniquement ne redemande pas une revue des images');
const fails=(mutation,pattern)=>{const d=clone(reviewed);mutation(d);assert.throws(
 ()=>requireVisualReviewIfChanged('douleur',null,d,data,data),pattern);};
fails(d=>d.visualOwnerReview.criteria.MEDICAL_ILLUSTRATION_REAL='A_CORRIGER',/MEDICAL_ILLUSTRATION_REAL/);
fails(d=>d.visualOwnerReview.criteria.NO_DECORATIVE_BOX_SUBSTITUTION='FAIL',/NO_DECORATIVE_BOX_SUBSTITUTION/);
fails(d=>delete d.visualOwnerReview.criteria.INFOGRAPHIC_VISUAL_FIRST,/INFOGRAPHIC_VISUAL_FIRST/);
fails(d=>d.visualOwnerReview.criteria.ALL_PAGES_CHECKED='PENDING',/ALL_PAGES_CHECKED/);
fails(d=>d.visualOwnerReview.method='count_images_only',/inspection page par page/);
fails(d=>d.visualOwnerReview.reference='generic_style',/cardiovasculaire/);
fails(d=>d.visualOwnerReview.reviewerDecision='assistant_self_approved',/GO production/);
fails(d=>d.visualOwnerReview.reviewedPdfSha256s.douleur_fiche=j,/octets/);
fails(d=>d.visualOwnerReview.reviewedPdfSha256s.douleur_infographie=h,/octets/);
fails(d=>d.visualOwnerReview.reviewedImageSha256s.mecanisme_01=j,/non revue ou modifiee/);
fails(d=>d.artifactSha256s.PDF_CLASSIC=j,/octets/);
// La revue faite sur le même PDF garde sa valeur si seul le libellé change:
// l empreinte elle-même est contrôlée. Un nouveau PDF doit etre rejete.
const changed=clone(reviewed);changed.artifactSha256s.PDF_CLASSIC='c'.repeat(64);
assert.throws(()=>requireVisualReviewIfChanged('douleur',reviewed,changed,data,data),/octets/);
const withBoards=clone(reviewed);
withBoards.completeBoardAudits={plate_01:{driveId:'BOARD_1'}};
withBoards.artifactSha256s.BOARD_1=h;
assert.throws(()=>validateVisualOwnerReview('douleur',withBoards,data),/planche infographique non revue/);
withBoards.visualOwnerReview.reviewedBoardSha256s={plate_01:h};
assert.doesNotThrow(()=>validateVisualOwnerReview('douleur',withBoards,data));
console.log('✅ 17 cas : blocage sans vraie revue déclarée, images, atlas, figures, empreintes, et compatibilité QCM-only.');