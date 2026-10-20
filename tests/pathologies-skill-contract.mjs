import fs from 'node:fs';
import assert from 'node:assert/strict';

const read=rel=>fs.readFileSync(new URL('../'+rel,import.meta.url),'utf8');
const agents=read('AGENTS.md');
const general=read('docs/skills/production-fiches-revision-infographies-originales.md');
const specialist=read('docs/skills/production-pathologies-infographies-cliniques.md');
const moduleDoc=read('docs/PATHOLOGIES_MODULE_V1.md');
const workflow=read('.github/workflows/tnr.yml');
const p1Validation=read('docs/PATHOLOGIES_LOT_P1_VALIDATION_FORME_20261020.md');
assert.match(p1Validation,/BPCO.*HTA.*(?:diabète|DT2)/is,'Trois références P1 absentes de la validation');
assert.match(p1Validation,/FORME VALIDÉE|FORME ET STRUCTURE VALIDÉES/,'Accord de forme non précisé');
assert.match(p1Validation,/GO publication/i,'Distinction validation graphique / publication absente');
assert.match(specialist,/Validation du LOT P1/i,'Skill spécialisé non mis à jour');
assert.match(specialist,/réponses A systématiquement/i,'Contrôle du biais de QCM absent');
assert.match(agents,/Validation de forme P1 Pathologies/i,'AGENTS ne consigne pas la validation P1');


assert.ok(agents.includes('docs/skills/production-pathologies-infographies-cliniques.md'),'AGENTS ne référence pas le skill Pathologies');
assert.ok(general.includes('production-pathologies-infographies-cliniques.md'),'Skill fiches ne réfère pas le skill spécialisé');
assert.ok(moduleDoc.includes('20/10/2026')&&/modèle maître/i.test(moduleDoc),'Validation visuelle BPCO non datée');
for(const [name,text] of [['AGENTS',agents],['skill spécialisé',specialist],['skill fiches',general],['documentation',moduleDoc]]){
 assert.match(text,/tout schéma|toute représentation schématique/i,name+' : transformation systématique non exigée');
 assert.match(text,/originale/i,name+' : originalité manquante');
 assert.match(text,/publication/i,name+' : frontière publication manquante');
}
for(const [label,pattern] of [
 ['sources',/source/i],
 ['contrôle médical',/médical/i],
 ['PDF page par page',/page par page|chaque page/i],
 ['révision visuelle',/100 %/],
 ['modèle BPCO',/BPCO/],
 ['dissociation graphique/scientifique',/forme.*(?:non|≠|pas).*médical|style.*(?:≠|pas).*médical/i],
 ['cas fictifs',/cas.*fictif/i],
 ['inventaire des infographies',/inventaire/i],
 ['absence de quota',/aucune règle fixe|nombre de visuels|nombre de planches/i],
 ['schémas de QCM distincts',/QCM/i],
 ['atlas distinct',/anatomique/i]
]){
 assert.match(specialist,pattern,'Skill Pathologies incomplet : '+label);
}
assert.match(workflow,/node tests\/pathologies-skill-contract\.mjs/,'Contrat absent de la CI');
console.log('✅ Skill et chartes Pathologies : modèle BPCO, 100 % schémas infographiés, contrôles et aucune publication prématurée');

assert.ok(read('index.html').includes('./pathologies-module-v1.js?v=8406'),'Moteur non chargé dans la coque');
assert.ok(read('index.html').includes('./pathologies-boot-v1.js?v=8406'),'Verrou d’activation absent de la coque');
assert.ok(read('sw.js').includes("'./pathologies-module-v1.js'")&&read('sw.js').includes("'./pathologies-boot-v1.js'"),'Scripts inactifs non précachés hors ligne');
assert.ok(!read('index.html').includes('IFSI_PATHOLOGIES_PUBLISHED_BUNDLE'),'Catalogue médical ne doit pas être déclaré dans index.html');
assert.ok(!read('sw.js').includes('IFSI_PATHOLOGIES_PUBLISHED_BUNDLE'),'Catalogue médical ne doit pas être déclaré dans le service worker');
