import assert from 'node:assert/strict';
import {changedResources, validatePartChanges, canonicalPart} from './course-delivery-parts-lib.mjs';

const id='cours_test';
const base={
 registry:{courses:[{id,qcmPdfUrl:'public-test-url'}]},
 sheets:[{courseId:id,resourceId:'cours_test_fiche_p01'}],
 infographics:[{courseId:id,resourceId:'cours_test_info_p01_01'}],
 vocals:[],questions:[{courseId:id,id:'cours_test_p1_001'}]
};
const added={
 ...base, sheets:[...base.sheets,
  {courseId:id,resourceId:'cours_test_fiche_p02',sheetFormat:'classic',officialSupport:true,
   driveId:'TEST_CLASSIC',url:'https://drive.google.com/file/d/TEST_CLASSIC/view'},
  {courseId:id,resourceId:'cours_test_fiche_complete_infographiee_p02',
   sheetFormat:'complete_infographic',officialSupport:true,
   driveId:'TEST_GRAPHIC',url:'https://drive.google.com/file/d/TEST_GRAPHIC/view'}],
 infographics:[...base.infographics,{courseId:id,resourceId:'cours_test_info_p02_01'}],
 vocals:[{courseId:id,id:'cours_test_vocal_p02_01'}],
 questions:[...base.questions,{courseId:id,id:'cours_test_p2_001'}]
};
const audit={status:'PASS',pdfSha256:'a'.repeat(64),expectedCount:1,checkedCount:1};
const publishedVerification={
 status:'MATCH',source:'authenticated_drive_download',
 pdfSha256:'a'.repeat(64),expectedCount:1,checkedCount:1
};
const part={
 partId:'p02',validated:true,status:'awaiting_mp3',
 sheetResourceIds:['cours_test_fiche_p02','cours_test_fiche_complete_infographiee_p02'],
 sheetResourceId:'cours_test_fiche_p02',
 infographicSheetResourceId:'cours_test_fiche_complete_infographiee_p02',
 dualSheetCoverage:{expectedNotions:8,classicCovered:8,infographicCovered:8,medicalReview:'approved'},
 infographicSheetVisualAudit:{status:'PASS',pdfSha256:'b'.repeat(64),expectedCount:1,checkedCount:1},
 infographicSheetPublishedVerification:{status:'MATCH',source:'authenticated_drive_download',
    pdfSha256:'b'.repeat(64),expectedCount:1,checkedCount:1},
 artifactSha256s:{TEST_CLASSIC:'a'.repeat(64),TEST_GRAPHIC:'b'.repeat(64)},
 infographicResourceIds:['cours_test_info_p02_01'],
 vocalIds:['cours_test_vocal_p02_01'],
 qcmQuestionIds:['cours_test_p2_001'],
 visualAudit:audit,publishedVerification
};
const before={courses:[{courseId:id,part:'1/2',validated:true}]};
const after={courses:[{...before.courses[0],partDeliveries:[part]}]};
let count=0;
const pass=(name,prev=base,next=added,old=before,newer=after)=>{
 assert.doesNotThrow(()=>validatePartChanges(prev,next,old,newer),name);
 count++; console.log('✅ '+name);
};
const fail=(name,prev=base,next=added,old=before,newer=after)=>{
 assert.throws(()=>validatePartChanges(prev,next,old,newer),name);
 count++; console.log('✅ Refuse : '+name);
};
pass('Nouvelle partie p02 : fiche, schéma, questions, vocal');
pass('Pas de modification sur un cours publié',base,base,before,before);
pass('Entrée calendrier sans ressources',
 {registry:{courses:[]},sheets:[],infographics:[],vocals:[],questions:[]},
 {registry:{courses:[{id:'calendrier'}]},sheets:[],infographics:[],vocals:[],questions:[]},
 {courses:[]},{courses:[]});
pass('Ajout de QCM seuls sur une nouvelle partie',base,
 {...base,questions:added.questions},before,
 {courses:[{...before.courses[0],partDeliveries:[{
   partId:'p02',validated:true,status:'partial',qcmQuestionIds:['cours_test_p2_001']
 }]}]});
fail('Partie non déclarée',base,added,before,before);
fail('Rapport visuel absent',base,added,before,
 {courses:[{...before.courses[0],partDeliveries:[{...part,visualAudit:undefined}]}]});
fail('Vérification PDF publié absente',base,added,before,
 {courses:[{...before.courses[0],partDeliveries:[{...part,publishedVerification:undefined}]}]});
fail('Empreinte PDF différente',base,added,before,
 {courses:[{...before.courses[0],partDeliveries:[{...part,publishedVerification:{
 ...publishedVerification,pdfSha256:'b'.repeat(64)}}]}]});
fail('Identifiant de partie incohérent',base,added,before,
 {courses:[{...before.courses[0],partDeliveries:[{...part,partId:'p03'}]}]});
fail('Infographie ajoutée mais non déclarée',base,added,before,
 {courses:[{...before.courses[0],partDeliveries:[{...part,infographicResourceIds:[]}]}]});
fail('Question QCM nouvelle non déclarée',base,added,before,
 {courses:[{...before.courses[0],partDeliveries:[{...part,qcmQuestionIds:[]}]}]});
fail('Partie doublonnée',base,added,before,
 {courses:[{...before.courses[0],partDeliveries:[part,part]}]});
fail('Déclaration de partie non actualisée',base,added,
 {courses:[{...before.courses[0],partDeliveries:[part]}]},after);
fail('Absence de justification quand fiche sans infographie',base,
 {...base,sheets:added.sheets},before,
 {courses:[{...before.courses[0],partDeliveries:[{
   partId:'p02',validated:true,status:'partial',sheetResourceIds:['cours_test_fiche_p02']
 }]}]});
fail('Fiche sans visuel : une fiche seule ne suffit plus en v1.13',base,
 {...base,sheets:added.sheets},before,
 {courses:[{...before.courses[0],partDeliveries:[{
   partId:'p02',validated:true,status:'partial',
   sheetResourceIds:['cours_test_fiche_p02'],schematics:'none'
 }]}]});
// Nouveau chapitre psychologie : deux fiches, aucun diagramme à ajouter.
const noFigurePart={
 ...part,
 infographicResourceIds:[],schematics:'none',
 schematicsJustification:'Ce chapitre de psychologie se comprend par des cas et comparaisons conceptuelles, sans planche anatomique ni diagramme individuel.',
 visualAudit:{...audit,expectedCount:0,checkedCount:0},
 publishedVerification:{...publishedVerification,expectedCount:0,checkedCount:0},
 infographicSheetVisualAudit:{...part.infographicSheetVisualAudit,expectedCount:0,checkedCount:0},
 infographicSheetPublishedVerification:{...part.infographicSheetPublishedVerification,expectedCount:0,checkedCount:0},
 dualSheetCoverage:{expectedNotions:8,classicCovered:8,infographicCovered:8,
   disciplinaryReview:{type:'conceptual',status:'approved'}}
};
const noFigureAdded={...base,sheets:added.sheets};
pass('Psychologie : deux PDF, 0 schéma individuel et justification',
 base,noFigureAdded,before,
 {courses:[{...before.courses[0],partDeliveries:[{
  ...noFigurePart,vocalIds:[],qcmQuestionIds:[]
 }]}]});
fail('Psychologie : rejet absence de justification',
 base,noFigureAdded,before,
 {courses:[{...before.courses[0],partDeliveries:[{
  ...noFigurePart,schematicsJustification:'',vocalIds:[],qcmQuestionIds:[]
 }]}]});
fail('Psychologie : rejet revue conceptuelle absente',
 base,noFigureAdded,before,
 {courses:[{...before.courses[0],partDeliveries:[{
  ...noFigurePart,dualSheetCoverage:{...noFigurePart.dualSheetCoverage,disciplinaryReview:undefined},
  vocalIds:[],qcmQuestionIds:[]
 }]}]});

fail('Modification d’un ancien cours sans manifeste',base,added,{courses:[]},{courses:[]});
assert.equal(canonicalPart('cours_test_fiche_p02'),'p02');
assert.equal(canonicalPart('cours_test_p2_001'),'p02');

// Le GO sur 16 infographies est distinct du GO d'une NOUVELLE partie complète.
const supplementalInfo={courseId:id,resourceId:'cours_test_pack_16',
 url:'https://drive.google.com/file/d/PACK_16/view',pageCount:16};
const partialManifest={courses:[{
 courseId:id,publicationScope:'infographics_only',
 infographicResourceIds:['cours_test_pack_16'],
 infographicPackDriveId:'PACK_16',reviewedBoardCount:16,
 visualOwnerReview:{status:'owner_accepted'},artifactSha256s:{PACK_16:'a'.repeat(64)},
 publicationApproval:{status:'approved',authorization:'explicit_go_publication',scope:'infographics_only'}
}]};
const partialAfter={...base,infographics:[...base.infographics,supplementalInfo]};
pass('Infographies approuvées : ajout de 16 planches sans refaire tout le cours',
 base,partialAfter,before,partialManifest);
fail('Pack de 16 planches sans GO : refus',
 base,partialAfter,before,{courses:[{...partialManifest.courses[0],
 publicationApproval:{...partialManifest.courses[0].publicationApproval,status:'pending'}}]});
console.log('✅ '+count+' scénarios testés pour les parties de cours');
