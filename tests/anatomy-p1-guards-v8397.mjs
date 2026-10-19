import assert from 'node:assert/strict';
import fs from 'node:fs';
const read=p=>fs.readFileSync(p,'utf8');
const snapshot=JSON.parse(read('resource-audit-v821.json'));
const meta=JSON.parse(read('build-meta.json'));
const resp=read('v814-respiratory-atlas.js');
const uOld=read('v83-anatomy-interactive.js');
const urinary=read('v815-urinary-atlas.js');
const endo=read('v816-endocrine-atlas.js');
const immune=read('v817-immune-atlas.js');
const loco=read('v829-locomotor-atlas.js');
const nav=read('v82-nav-anatomy.js');
const doc=read('docs/anatomy-p1-guards-post8397.md');

assert.equal(meta.version,'8.30.98','Release P1 anatomie non alignée sur V8.30.98');
assert.equal(snapshot.expectedTotals.hdAtlasBoards,106);
assert.equal(Object.values(snapshot.atlasBoardContracts).reduce((a,b)=>a+b,0),106);
const noTrace=[['systeme_respiratoire',8],['systeme_urinaire',8],['systeme_endocrinien',8],['systeme_immunitaire',8],['appareil_locomoteur',20]];
for(const [course,count] of noTrace)assert.equal(snapshot.atlasBoardContracts[course],count);
assert.equal(noTrace.reduce((sum,[,count])=>sum+count,0),52);
assert.equal(snapshot.atlasBoardContracts.systeme_reproducteur,undefined);

assert.match(resp,/id:'resp_atlas_02'[^\n]*needsReview:true/);
assert.ok(resp.includes("if(d.needsReview)return '<div"),'Masquage des miniatures et de la figure principale respiratoire');
assert.ok(resp.includes("d.needsReview?cropMedia(d):d.crop?cropMedia(d)"),'Le zoom caché ne doit jamais créer d’image respiratoire P1');
assert.ok(resp.includes('if(d.needsReview)return;'),'Ouverture zoom respiratoire bloquée');

assert.match(uOld,/id:'urinary001'[^\n]*needsReview:true/);
assert.ok(uOld.includes("x.needsReview?'<span class="),'Miniature rein douteux bloquée');
assert.ok(uOld.includes("d.needsReview?'<div class="),'L’image du rein douteux ne doit pas être créée dans le DOM');
assert.ok(!uOld.includes("d.needsReview?'style=\"display:none\"'"),'Interdire le simple masquage CSS : le navigateur chargerait la figure');
assert.ok(uOld.includes('if(activeDiagram().needsReview)return;'),'Zoom hile rénal bloqué');

for(const [name,data] of [['respiratoire',resp],['urinaire',urinary],['endocrinien',endo],['immunitaire',immune],['locomoteur',loco]]){
 assert.match(data,/validation médicale (non tracée|à confirmer)/i,name+' doit afficher la réserve de validation médicale');
}
assert.ok(nav.includes("id:'systeme_reproducteur'"),'Entrée V8.30.97 conservée');
assert.ok(nav.includes('6 maquettes en revue'),'Statut reproducteur conservé');
assert.ok(nav.includes('0 planche validée'),'Aucune maquette non validée comptée');
assert.ok(doc.includes('Ancienne PR #132'),'Note de migration depuis la PR #132 absente');
for(const forbidden of ['DAHYd62tg4w','GQ6MYI8VJqgsclS','7a2hov21rkj9e7f','0b1n29zj87pent7']){
 assert.ok(!doc.includes(forbidden),'Lien de revue privé interdit dans le rapport');
}
console.log('✅ P1: figures respiratoire et rénale bloquées, zoom sécurisé, 52 validations non tracées signalées, 106 planches conservées, reproducteur non publié.');
