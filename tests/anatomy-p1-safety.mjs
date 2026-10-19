import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const snapshot=JSON.parse(read('resource-audit-v821.json'));
const missingValidation={systeme_respiratoire:8,systeme_urinaire:8,systeme_endocrinien:8,systeme_immunitaire:8,appareil_locomoteur:20};
assert.equal(Object.values(snapshot.atlasBoardContracts).reduce((a,b)=>a+b,0),106);
assert.equal(Object.entries(missingValidation).reduce((a,[id,n])=>{assert.equal(snapshot.atlasBoardContracts[id],n);return a+n},0),52);
const respiratory=read('v814-respiratory-atlas.js');
assert.match(respiratory,/id:'resp_atlas_02'[^\n]+needsReview:true/);
assert.match(respiratory,/function cropMedia\(d,cls=''{0,1}\)/); // vérification de la fonction de rendu de secours
assert.ok(respiratory.includes('if(d.needsReview)return'), 'Zoom sur planche respiratoire signalée non bloqué');
assert.ok(respiratory.includes('validation médicale non tracée')||respiratory.includes('Validation médicale non tracée'));
const interactive=read('v83-anatomy-interactive.js');
assert.match(interactive,/id:'urinary001'[^\n]+needsReview:true/);
assert.ok(interactive.includes('style="display:none"'),'Planche urinaire masquée manquante');
assert.ok(interactive.includes('if(activeDiagram().needsReview)return;'),'Zoom urinaire signalé non bloqué');
for(const p of ['v815-urinary-atlas.js','v816-endocrine-atlas.js','v817-immune-atlas.js','v829-locomotor-atlas.js']){
 const s=read(p);
 assert.ok(/validation médicale (non tracée|à confirmer)/i.test(s),p+' doit signaler la validation non documentée');
}
assert.ok(!snapshot.atlasBoardContracts.systeme_reproducteur,'Ne pas compter un atlas reproducteur non produit');
console.log('✅ P1 anatomie : 106 planches conservées, 52 statuts non tracés signalés, deux planches douteuses neutralisées, pas de publication fictive');
