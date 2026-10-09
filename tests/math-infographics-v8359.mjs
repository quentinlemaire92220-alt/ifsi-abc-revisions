import fs from 'node:fs';
import assert from 'node:assert/strict';

const json=p=>JSON.parse(fs.readFileSync(new URL('../'+p,import.meta.url),'utf8'));
const catalog=[...json('sheets-1.json'),...json('sheets-2.json'),...json('sheets-3.json')];
const snap=json('resource-audit-v821.json');
const math=catalog.filter(x=>x.courseId==='calculs_doses_mathematiques');
const illustrated=math.filter(x=>/^maths_fiche_infographie_[0-9]{2}$/.test(x.resourceId||''));
const ids=[
 '1EZ5GlglSpx2YROPt9B72l6S25DUh2rSn',
 '1yAvFlugbdxqFB2MEH6Dkclfbp9wHIqQl',
 '1aZ7Iyy_RFP4cKcIbeMCH1UhxluNThk_r',
 '16XUJzq1DH9yu54cj-hAM7aTz4RZpvCgq',
 '1DJJpHZ3m5LmxI3Sx7B5DhXTUAPbvjUG6',
 '1V26pezxLz1f6PMWZVZ0DYYJNsusiHw32',
 '18h4yl2NebC1VnaZu0RCUrXwJHXAgP0Mz',
 '10CBhy9ZckCshVZLM6GGSp6QxCPfsCXTK'
];
assert.equal(illustrated.length,8,'Huit fiches infographiques de maths attendues');
assert.equal(new Set(illustrated.map(x=>x.resourceId)).size,8,'Numéros de fiches dupliqués');
for(let i=0;i<8;i++){
 const x=illustrated.find(x=>x.resourceId===`maths_fiche_infographie_${String(i+1).padStart(2,'0')}`);
 assert.ok(x,`Fiche ${i+1} absente`);
 assert.equal(x.driveId,ids[i],`Lien Drive incorrect pour la fiche ${i+1}`);
 assert.ok(x.url.includes(`/d/${ids[i]}/view`),`URL non synchronisée ${i+1}`);
 assert.ok(x.title.endsWith('.png'),`La fiche ${i+1} n'est pas l'infographie finale`);
 assert.equal(x.officialSupport,false,'Provenance sans support officiel non indiquée');
 assert.equal(x.sourceStatus,'active','Une fiche finale ne doit pas être provisoire');
}
assert.ok(math.some(x=>/Fiche_Maitre_Methodes_Calculs_Infirmiers/.test(x.title)),'Fiche maître supprimée');
assert.equal(math.length,9,'Le catalogue math doit contenir 8 infographies et 1 fiche maître');
assert.ok(!math.some(x=>/^Fiche 0[1-5] -/.test(x.title)),'Anciennes fiches historiques encore affichées');
assert.equal(catalog.length,55,'Total de fiches incorrect');
assert.equal(snap.expectedTotals.sheets,55,'Snapshot des fiches désynchronisé');
assert.equal(snap.sheetProvenance.markedSheets,15,'Provenance des nouvelles fiches non comptabilisée');
assert.equal(json('infographics.json').length,155,'Les infographies historiques doivent être préservées');
console.log('✅ 8 nouvelles fiches de maths en infographies ; fiche maître et ressources conservées');
