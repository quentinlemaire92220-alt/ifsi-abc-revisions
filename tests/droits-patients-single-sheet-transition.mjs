// IFSI ABC — garde-fou de la transition « Droits des patients ».
// Ne publie rien. Mode courant : conserver les trois fiches historiques.
// Après GO + hébergement + QA, invoquer avec --require-unified.
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = p => JSON.parse(fs.readFileSync(p,'utf8'));
const id='droits_patients';
const historic=[
 'droits_patients_fiche_p01',
 'droits_patients_fiche_infographiee_p01',
 'droits_patients_fiche_complement_p01_20261021'
];
const sheets=[1,2,3].flatMap(n=>read('sheets-'+n+'.json'));
const active=sheets.filter(s=>s.courseId===id && s.sourceStatus!=='archived');
const courses=read('docs/course-deliveries.json').courses.filter(c=>c.courseId===id);
assert.equal(courses.length,1,'Un seul cours canonique Droits des patients doit exister');
const course=courses[0];
const legacy=historic.every(key=>active.some(s=>s.resourceId===key)) && active.length===3;
const required=process.argv.includes('--require-unified');

assert.equal(course.qcmCount,105,'105 QCM historiques attendus');
assert.equal(course.flashcardCount,93,'93 flashcards historiques attendues');
assert.equal(course.vocals?.length,7,'7 vocaux historiques attendus');
assert.ok(course.qcmDriveId && course.flashcardDriveId && course.vocabularyDriveId,
 'Référence historique QCM/flashcards/vocabulaire absente');

if(legacy){
 assert.ok(!required,'BLOQUÉ : trois fiches historiques actives, fusion non réalisée');
 assert.equal(course.sheetResourceId,historic[0],'Fiche classique historique altérée');
 assert.equal(course.infographicSheetResourceId,historic[1],'Fiche illustrée historique altérée');
 assert.ok(course.partDeliveries?.some(p=>p.sheetResourceId===historic[2]),
  'Complément historique supprimé');
 console.log('PASS historique : trois fiches conservées ; fusion non activée.');
}else{
 assert.equal(active.length,1,'BLOQUÉ : une seule fiche active obligatoire');
 const sheet=active[0];
 assert.ok(!historic.includes(sheet.resourceId),'La nouvelle fiche réutilise un ID historique');
 assert.equal(sheet.resourceId,course.sheetResourceId,'Manifeste et fiche discordants');
 assert.equal(sheet.sheetFormat,'written_revision','Contrat de fiche écrite V5.3 attendu');
 assert.ok(!course.infographicSheetResourceId,'Ancienne fiche illustrée encore active');
 assert.ok(!course.partDeliveries?.some(p=>historic.includes(p.sheetResourceId)),
  'Complément historique toujours actif en doublon');
 const idFromUrl=String(sheet.url||'').match(/^https:\/\/drive\.google\.com\/file\/d\/([\w-]+)/)?.[1];
 assert.ok(idFromUrl,'Lien Drive réel obligatoire pour la fiche unique');
 assert.equal(sheet.driveId,idFromUrl,'ID Drive et URL incohérents');
 assert.match(course.artifactSha256s?.[sheet.driveId]||'',/^[a-f0-9]{64}$/i,
  'SHA-256 du PDF final manquant');
 assert.equal(course.pedagogicalNonRegression?.contract,'ifsi_pedagogical_non_regression_v149',
  'Reçu non-régression v1.49 absent');
 assert.equal(course.templateConformance?.contract,'ifsi_pdf_template_v3',
  'Conformité trame V3 absente');
 assert.equal(course.publicationApproval?.status,'approved','GO publication du lot final absent');
 console.log('PASS structure unique : compléter encore les contrôles complets V3/v1.49, CI et revue humaine.');
}
