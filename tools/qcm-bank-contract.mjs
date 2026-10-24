import assert from 'node:assert/strict';
import {autonomyViolations} from '../tests/qcm-autonomy-contract.mjs';
export function validateBank(rows,label='bank'){
 assert.ok(Array.isArray(rows)&&rows.length>0,label+': banque vide');
 assert.equal(new Set(rows.map(q=>q.id)).size,rows.length,label+': ID dupliqué');
 for(const q of rows){
  assert.ok(q.id&&q.courseId&&q.theme&&q.question?.trim(),label+': identité/contexte manquant');
  assert.equal(q.choices?.length,5,q.id+': cinq choix A–E requis');
  assert.ok(q.choices.every(x=>typeof x==='string'&&x.trim()),q.id+': choix vide');
  assert.ok(Array.isArray(q.answers)&&q.answers.length>=1&&q.answers.length<=3,q.id+': 1–3 réponses requises');
  assert.equal(new Set(q.answers).size,q.answers.length,q.id+': clé répétée');
  assert.ok(q.answers.every(a=>Number.isInteger(a)&&a>=0&&a<5),q.id+': indice invalide');
  assert.equal(q.announcedCorrectCount,q.answers.length,q.id+': cardinalité divergente');
  assert.ok(q.explanation?.trim().length>20,q.id+': correction absente');
  assert.ok(q.flashcards?.length,q.id+': cartes absentes');
  for(const f of q.flashcards){
   assert.ok(f.front?.trim()&&f.answers?.length&&f.answers.every(a=>typeof a==='string'&&a.trim())&&f.explanation?.trim(),q.id+': carte incomplète');
  }
  assert.deepEqual(autonomyViolations(q),[],q.id+': dépendance à une source absente');
 }
 return rows.length;
}
