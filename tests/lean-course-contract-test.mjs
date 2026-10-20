import assert from 'node:assert/strict';
import {validateLeanCourseDelivery,validateLeanPart} from './lean-course-contract.mjs';
import {validateLeanQuestions,validateLeanFlashcards} from './lean-content-contract.mjs';
import {validateDualSheetDelivery} from './dual-sheet-contract.mjs';

const H='a'.repeat(64),J='b'.repeat(64);
const classic={courseId:'demo',resourceId:'classic_p01',sheetFormat:'classic',officialSupport:true,
 driveId:'ID_CLASSIC',url:'https://drive.google.com/file/d/ID_CLASSIC/view'};
const illustrated={courseId:'demo',resourceId:'illustrated_p01',sheetFormat:'complete_infographic',officialSupport:true,
 driveId:'ID_ILLUSTRATED',url:'https://drive.google.com/file/d/ID_ILLUSTRATED/view'};
const audit=(digest,count,page=false)=>({status:'PASS',pdfSha256:digest,expectedCount:count,checkedCount:count,
 ...(page?{pageCount:1,pageSize:'A4'}:{})});
const proof=(digest,count,page=false)=>({status:'MATCH',source:'authenticated_drive_download',
 pdfSha256:digest,expectedCount:count,checkedCount:count,...(page?{pageCount:1}:{})});
const delivery={packFormat:'lean_v1',sheetResourceId:'classic_p01',infographicSheetResourceId:'illustrated_p01',
 infographicResourceIds:[],schematics:'none',embeddedFigureCount:0,
 schematicsJustification:'Le cours se résume en comparaisons conceptuelles sans figure anatomique indépendante.',
 visualAudit:audit(H,0),publishedVerification:proof(H,0),
 infographicSheetVisualAudit:{...audit(J,0,true),pageCount:3},infographicSheetPublishedVerification:{...proof(J,0,true),pageCount:3},
 artifactSha256s:{ID_CLASSIC:H,ID_ILLUSTRATED:J},
 dualSheetCoverage:{expectedNotions:26,classicCovered:26,infographicCovered:26,
 disciplinaryReview:{type:'conceptual',status:'approved'},readabilityReview:'approved'},
 vocals:[],vocalScripts:[],status:'complete',blockers:[]};
const sheets=[classic,illustrated];
const run=d=>validateLeanCourseDelivery('demo',d,sheets);
assert.equal(run(delivery).illustrated.resourceId,illustrated.resourceId);
assert.equal(validateLeanPart('demo',{...delivery,partId:'p02',sheetResourceIds:['classic_p01','illustrated_p01']},sheets).classic.resourceId,classic.resourceId);
const fails=(patch,re)=>assert.throws(()=>run({...delivery,...patch}),re);
fails({packFormat:'legacy'},/packFormat/);
fails({infographicSheetResourceId:'classic_p01'},/distincts/i);
fails({infographicSheetVisualAudit:audit(J,0)},/pages du cours infographié/);
assert.equal(run({...delivery,infographicSheetVisualAudit:{...audit(J,0,true),pageCount:2},infographicSheetPublishedVerification:{...proof(J,0,true),pageCount:2}}).illustrated.resourceId,illustrated.resourceId);
fails({infographicSheetPublishedVerification:{...proof(J,0,true),pageCount:2}},/nombre de pages Drive différent/);
fails({infographicSheetVisualAudit:{...audit(J,0,true),pageSize:'Letter'}},/A4/);
fails({infographicSheetPublishedVerification:undefined},/preuve Drive/);
fails({artifactSha256s:{ID_CLASSIC:H,ID_ILLUSTRATED:H}},/empreinte/);
fails({dualSheetCoverage:{...delivery.dualSheetCoverage,classicCovered:25}},/classique incomplète/);
fails({dualSheetCoverage:{...delivery.dualSheetCoverage,infographicCovered:6}},/cours infographié incomplet/);
fails({dualSheetCoverage:{...delivery.dualSheetCoverage,readabilityReview:'pending'}},/lisibilité des PDF/);
fails({schematics:'none',embeddedFigureCount:1},/figures intégrées/);
fails({schematics:'embedded_only',embeddedFigureCount:0},/sans figure/);
fails({infographicResourceIds:['missing'],schematics:'none'},/exports présents/);
fails({requestedVocals:true},/vocaux demandés/);
assert.equal(run({...delivery,requestedVocals:false,volcals:[]}).classic.resourceId,classic.resourceId);
assert.equal(run({...delivery,schematics:'embedded_only',embeddedFigureCount:1,
 visualAudit:audit(H,1),publishedVerification:proof(H,1),
 schematicsJustification:'Infographie originale utile intégrée à la fiche ; aucun export individuel nécessaire.',
 dualSheetCoverage:{...delivery.dualSheetCoverage,medicalReview:'approved'}}).illustrated.resourceId,'illustrated_p01');
assert.throws(()=>validateLeanPart('demo',{...delivery,partId:'p02',sheetResourceIds:['classic_p01']},sheets),/deux supports/);

const goodQ={id:'q01',courseId:'demo',theme:'Hématose',difficulty:'medium',
 question:'Quelles affirmations sur les échanges gazeux sont correctes ?',
 choices:['A - oxygène vers le sang','B - CO2 uniquement dissous','C - diffusion liée à la pression','D - gaz sans échanges','E - toutes fausses'],
 answers:[0,2],announcedCorrectCount:2,
 explanation:'La diffusion de l’oxygène et le gradient de pression expliquent les deux réponses.'};
assert.equal(validateLeanQuestions([goodQ]),1);
const badQ=(patch,re)=>assert.throws(()=>validateLeanQuestions([{...goodQ,...patch}]),re);
badQ({answers:[0,2,3],announcedCorrectCount:2},/nombre de bonnes réponses annoncé/);
badQ({answers:[0,1,2,3],announcedCorrectCount:4},/une et trois/);
badQ({choices:goodQ.choices.slice(0,4)},/cinq propositions/);
badQ({answers:[0,0]},/réponse répétée/);
badQ({answers:[5]},/indice de réponse/);
badQ({choices:[...goodQ.choices.slice(0,4),goodQ.choices[1]]},/dupliquées/);
const goodF={id:'f01',front:'Où ont lieu les échanges alvéolo-capillaires ?',
 answers:['Au niveau de la membrane alvéolo-capillaire.'],
 explanation:'Le sang échange O₂ et CO₂ avec l’air alvéolaire.'};
assert.equal(validateLeanFlashcards([goodF]),1);
assert.throws(()=>validateLeanFlashcards([{...goodF,front:'Citer trois organes ?'}]),/consigne vague/);
assert.throws(()=>validateLeanFlashcards([{...goodF,answers:[]}]),/réponse absente/);

// Régression historique : le nouveau format doit rester refusé par l'ancien validateur.
assert.throws(()=>validateDualSheetDelivery('demo',delivery,sheets),/sheetFormat/);
console.log('✅ Pack lean_v1 : deux cours PDF exhaustifs dont infographié multipage, empreintes et preuves Drive, audio optionnel, QCM/flashcards ; anciens contrats préservés.');
