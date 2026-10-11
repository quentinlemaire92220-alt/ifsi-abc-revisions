import assert from 'node:assert/strict';
import {runtimeDeck} from './flashcards-runtime-fixture.mjs';

const expected=new Map([
 ['v820_cut_021','0,4'],
 ['v820_micro_025','2,3'],
 ['v820_trauma_059','4'],
 ['v820_trauma_071','1,3'],
 ['v820_trauma_078','0,2'],
 ['v820_trauma_100','1,3,4'],
 ['v820_rhuminf_014','0,1,2']
]);
const {questions}=await runtimeDeck();
const dependent=/\b(?:sur (?:cette|la) (?:image|photographie|radiographie)|photographie du support|radiographie .*présentée dans le cours)\b/i;
for(const [id,answers] of expected){
 const q=questions.find(item=>item.id===id);
 assert.ok(q,`${id} absent de la banque active`);
 assert.doesNotMatch(q.question,dependent,`${id} dépend encore d’un visuel absent`);
 assert.equal(q.answers.join(','),answers,`${id} : le corrigé médical ne doit pas être modifié`);
 assert.ok(q.explanation.length>=80,`${id} : correction argumentée insuffisante`);
 assert.doesNotMatch(q.explanation,/\b(?:photo|photographie|image)\b/i,`${id} : correction encore dépendante du visuel`);
}
console.log('✅ 7 QCM signalés par #88 rendus autonomes sans modifier leurs réponses attendues');
