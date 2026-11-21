import fs from 'node:fs';
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
const news=JSON.parse(fs.readFileSync('data/release-news.json','utf8'));
const resources=news.filter(entry=>entry.type==='resource').map(entry=>entry.id);
assert.ok(resources.indexOf('v8359Change')>=0);
assert.ok(resources.indexOf('v8359Change')<resources.indexOf('v8353Change'));
console.log('✅ Runtime navigateur : 226 QCM maths, corrections actives, annonces techniques séparées, ressources triées');
