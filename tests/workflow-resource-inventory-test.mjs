import assert from 'node:assert/strict';
import {buildAudit} from '../tools/workflow-resource-inventory.mjs';

const audit=await buildAudit(),courses=new Map(audit.courses.map(c=>[c.courseId,c]));
assert.equal(audit.workflow,'v1.14');
assert.equal(courses.size,audit.totals.courses,'Un seul audit par courseId');
assert.ok(audit.totals.courses>0&&audit.totals.sheets>0,'L’inventaire réel doit être chargé');
assert.equal(audit.totals.pdfSheets+audit.totals.nonPdfSheets,audit.totals.sheets,
 'Les fiches au format non-PDF ne doivent pas être comptabilisées comme PDF');
assert.equal(audit.totals.unclassifiedSheetFormats,
 audit.courses.reduce((n,c)=>n+c.sheetFormats.unclassified,0));
assert.ok(courses.get('traumatologie')?.showInCourses===false);
assert.equal(courses.get('traumatologie')?.parentId,'appareil_locomoteur');
assert.ok(courses.get('traumatologie')?.flags.includes('hidden_child_check_parent_coverage'),
 'Une sous-partie masquée ne doit pas être présentée comme un cours visible privé de fiche');
assert.ok(courses.get('traumatologie')?.parentSheetCandidates>=1,
 'Le rattachement au parent doit être vérifié sur les ressources existantes');
assert.ok(courses.get('calculs_doses_mathematiques')?.nonPdfSheets>=8,
 'Ne pas traiter automatiquement toutes les fiches comme des PDF');
assert.equal(courses.get('calculs_doses_mathematiques')?.infographics,0,
 'L’absence volontaire d’infographies séparées en maths est permise');
assert.equal(courses.get('calculs_doses_mathematiques')?.individualInfographicsDecision,'NOT_ASSESSED',
 'Zéro infographie ne vaut pas non-applicabilité sans étude du support');
for(const c of audit.courses){
 assert.equal(c.v114Status,'UNVERIFIED_LEGACY','Pas de validation v1.14 implicite');
 assert.equal(c.anatomyDecision,'NOT_ASSESSED','Pas de faux jugement anatomique');
 assert.ok(Array.isArray(c.flags),'Flags course manquants');
}
assert.ok(courses.get('psychologie_sante')?.sheets>0);
assert.ok(courses.get('infections_urinaires')?.flags.includes('no_catalogued_revision_sheet'));
assert.ok(courses.get('diagnostic_bacteriologie')?.flags.includes('no_catalogued_revision_sheet'));
assert.equal(audit.totals.coursesWithQcm+audit.courses.filter(c=>c.qcm===0).length,audit.totals.courses);
assert.equal(audit.totals.coursesWithManifest,audit.courses.filter(c=>c.deliveryManifest).length);
console.log('✅ Audit v1.14 non destructif : rattachement parent/partie, PDF vs images, QCM, fiches, sources et absence de faux PASS.');
console.log('ℹ️',JSON.stringify(audit.totals));
