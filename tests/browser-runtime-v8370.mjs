import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {runtimeDeck} from './flashcards-runtime-fixture.mjs';
// Browser-compatible atob and DecompressionStream, executing the actual SW loader.
const {questions,window}=await runtimeDeck();
const math=window.IFSI_V741.resourcesForCourse('calculs_doses_mathematiques').questions;
assert.equal(math.length,226,'Le chargement navigateur perd des QCM de maths');
assert.equal(new Set(math.map(q=>q.id)).size,226,'Doublons de maths');
for(const [id,answer] of [['cdm2_110','0,125 mg'],['cdm2_112','0,075 L'],['cdm2_224','0,125 g']]){
 const q=math.find(q=>q.id===id);assert.ok(q,id+' manquant');
 assert.deepEqual(Array.from(q.answers,i=>q.choices[i]),[answer],id+' corrigé perdu');
}
assert.ok(questions.length>=2331,'Banque active incomplète');
// The DOM insertion order of old changelog timers must not dictate resource ordering.
const source=fs.readFileSync('v8312-home-revision.js','utf8');
const start=source.indexOf("(()=>{'use strict';"),end=source.indexOf('let newsExpanded');
const c={window:{IFSI_APP_VERSION:'8.30.70'},document:{getElementById:()=>null}};vm.createContext(c);
vm.runInContext(source.slice(start,end).replace("(()=>{'use strict';",''),c);
vm.runInContext(source.slice(source.indexOf('function inferMeta('),source.indexOf('function badgeHtml(')),c);
assert.equal(vm.runInContext("inferMeta('v8349Change','Ajout du compteur de flashcards et audit des ressources').type",c),'app');
const sorted=source.slice(source.indexOf('function resourceEntries(){'),source.indexOf('function drawNews(){'));
c.newsEntries=()=>[{title:'V8.30.53 — Cours',type:'resource'},{title:'V8.30.49 — Audit',type:'app'},{title:'V8.30.59 — Maths',type:'resource'},{title:'V8.30.54 — QCM',type:'resource'}];vm.runInContext(sorted,c);
assert.deepEqual(Array.from(vm.runInContext('resourceEntries().map(x=>versionFromTitle(x.title))',c)),['8.30.59','8.30.54','8.30.53']);
console.log('✅ Runtime navigateur : 226 QCM maths, corrections actives, annonces techniques séparées, ressources triées');
