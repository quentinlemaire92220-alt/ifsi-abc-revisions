import fs from 'node:fs';
import assert from 'node:assert/strict';

const read=rel=>fs.readFileSync(new URL('../'+rel,import.meta.url),'utf8');
const agents=read('AGENTS.md');
const general=read('docs/skills/production-fiches-revision-infographies-originales.md');
const specialist=read('docs/skills/production-pathologies-infographies-cliniques.md');
const moduleDoc=read('docs/PATHOLOGIES_MODULE_V1.md');
const workflow=read('.github/workflows/tnr.yml');

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
assert.ok(!read('index.html').includes('./pathologies-module-v1.js'),'Le moteur Pathologies non approuvé ne doit pas être chargé');
assert.ok(!read('sw.js').includes('./pathologies-module-v1.js'),'Le moteur Pathologies non approuvé ne doit pas être mis en cache');
console.log('✅ Skill et chartes Pathologies : modèle BPCO, 100 % schémas infographiés, contrôles et aucune publication prématurée');
