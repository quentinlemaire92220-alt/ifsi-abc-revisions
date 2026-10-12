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
const master=math.find(x=>/Fiche_Maitre_Methodes_Calculs_Infirmiers/.test(x.title));
assert.ok(master,'Fiche maître supprimée');
assert.equal(master.resourceId,'maths_fiche_infographie_maitre','Identifiant stable de la fiche maître absent');
assert.equal(master.displayTitle,'09 — Fiche maître : méthodes de calculs infirmiers','Fiche maître non alignée sur les huit autres fiches');
assert.equal(master.url,'./assets/maths/fiche-maitre-methodes-calculs.svg','La fiche maître n’ouvre pas le mémo visuel');
assert.equal(master.driveId,'17ZNsH3xgASvLhsnkn4Z37NaHpsUHoY8F','La source PDF de la fiche maître a été perdue');
assert.ok(master.sourcePdfUrl?.includes('/d/'+master.driveId+'/view'),'PDF source de la fiche maître non conservé');
assert.equal(master.officialSupport,false,'La fiche maître ne doit pas être étiquetée comme support officiel');
assert.ok(fs.existsSync(new URL('../assets/maths/fiche-maitre-methodes-calculs.svg',import.meta.url)),'Mémo visuel manquant');
const svg=fs.readFileSync(new URL('../assets/maths/fiche-maitre-methodes-calculs.svg',import.meta.url),'utf8');
for(const formula of ['C = m / V','C₁ × V₁ = C₂ × V₂','KCl injectable : jamais en IV directe'])assert.ok(svg.includes(formula),'Formule ou sécurité perdue : '+formula);
assert.equal(json('infographics.json').filter(x=>x.courseId==='calculs_doses_mathematiques').length,0,'Les six anciennes infographies sont toujours affichées');
assert.equal(math.length,9,'Le catalogue math doit contenir 8 infographies et 1 fiche maître');
assert.ok(!math.some(x=>/^Fiche 0[1-5] -/.test(x.title)),'Anciennes fiches historiques encore affichées');
assert.equal(catalog.length,snap.expectedTotals.sheets,'Total de fiches incorrect');
assert.ok(snap.expectedTotals.sheets>=55,'Fiches historiques perdues');
assert.equal(snap.sheetProvenance.markedSheets,15,'Provenance des nouvelles fiches non comptabilisée');
assert.equal(json('infographics.json').length,snap.expectedTotals.infographics,'Catalogue infographies désynchronisé');
assert.ok(json('infographics.json').length>=155,'Les infographies historiques doivent être préservées');
const legacy=json('calculs-resources-v1.json');
assert.equal(legacy.sheets.length,0,'Les PDF obsolètes sont encore injectés');
assert.equal(legacy.infographics.length,0,'Les anciennes infographies de maths sont encore réinjectées');
const sw=fs.readFileSync(new URL('../sw.js',import.meta.url),'utf8');
assert.ok(sw.includes("const add=u.pathname.endsWith('/sheets-3.json')?(extra.sheets||[]):"),'Fusion des fiches non contrôlée');
assert.ok(sw.includes("./assets/maths/fiche-maitre-methodes-calculs.svg"),'Visuel maître non précaché pour usage hors-ligne');
assert.equal(math.length+legacy.sheets.length,9,'Fiches de maths dupliquées au chargement');
console.log('✅ Maths : 8 fiches illustrées + 1 mémo maître visuel ; 0 infographie séparée, PDF source conservé');
