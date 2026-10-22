// IFSI ABC — vue unique pour les futures fiches hybrides, sans publication implicite.
// Cette verification ne genere pas de GO et n'ajoute aucun lien Drive.
import assert from 'node:assert/strict';
import fs from 'node:fs';
const json=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const html=fs.readFileSync('index.html','utf8');
const sheets=[...json('sheets-1.json'),...json('sheets-2.json'),...json('sheets-3.json')];
const old=sheets.filter(s=>s.courseId==='douleur');
assert.equal(old.length,1,'La fiche historique Douleur doit rester liee tant que la revue manque');
assert.equal(old[0].url,'https://drive.google.com/file/d/1bas9Sba_9pEQiiJ6ZzAOcP5dtdx0scIe/view?usp=drivesdk');
assert.notEqual(old[0].sheetFormat,'hybrid_infographic','Ne pas presenter l ancienne fiche comme la nouvelle');
assert.ok(html.includes("x.sheetFormat==='hybrid_infographic'"),'Support UI du type hybride absent');
assert.ok(html.includes('Fiche hybride infographiée'),'Libelle de la fiche hybride absent');
assert.ok(html.includes("x.sheetFormat==='complete_infographic'"),'Maintenir le libelle des anciens packs');
assert.ok(html.includes("x.sheetFormat==='classic'"),'Maintenir le libelle des anciennes fiches');
const delivery=json('docs/course-deliveries.json').courses.find(c=>c.courseId==='douleur');
assert.equal(delivery?.medicalReview,'pending_independent_review');
assert.equal(delivery.publicationScope,'infographics_only');
assert.equal(delivery.status,'partial');
assert.equal(delivery.reviewedBoardCount,16);
assert.equal(delivery.infographicResourceIds?.length,1);
assert.equal(json('qextra-51.txt').filter(q=>q.courseId==='douleur').length,52);
assert.equal(json('infographics.json').filter(x=>x.courseId==='douleur').length,5);
console.log('PASS: libelle hybride prêt; publication douleur toujours bloquée, fiche historique, 16 planches, 52 QCM inchangés.');