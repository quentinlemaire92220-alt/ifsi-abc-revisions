import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(p,'utf8');
const meta=JSON.parse(read('build-meta.json'));
assert.equal(meta.version,'8.30.43');
assert.equal(String(meta.build),'8343');
const mod=read('v8338-flashcards.js');
for(const token of ['cité','mentionné','suivant','proposé','indiqué','présenté','parmi (?:les|ces)','la hiérarchie correcte'])assert.ok(mod.includes(token),`Filtre de contexte absent: ${token}`);
for(const bad of [
  'Quels sont les tissus conjonctifs spécialisés cités ?',
  'Quels sont les granulocytes cités ?',
  'Qu’est-ce que la hiérarchie correcte ?'
])assert.ok(!mod.includes(bad),`Formulation dépendante du contexte présente: ${bad}`);
const index=read('index.html'),sw=read('sw.js');
assert.ok(index.includes('./v8343-changelog.js?v=8343'),'Changelog V8.30.43 absent de index.html');
assert.ok(sw.includes("'./v8343-changelog.js'"),'Changelog V8.30.43 absent du cache PWA');
console.log('✅ V8.30.43 : flashcards contextuelles filtrées');
