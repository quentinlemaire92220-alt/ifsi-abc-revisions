import assert from 'node:assert/strict';
import {runtimeDeck} from './flashcards-runtime-fixture.mjs';

// Unlike the legacy text-only inventory, include compressed banks, production
// override precedence, the course resolver, subthemes and the vocabulary deck.
const selected=await runtimeDeck();
const full=await runtimeDeck({allCards:true});
assert.ok(selected.questions.length>2200,'Banques de production absentes');
assert.equal(selected.deck.filter(c=>c.id.startsWith('voc:')).length,195);
for(const {deck} of [selected,full]){
  assert.equal(new Set(deck.map(c=>c.id)).size,deck.length,'Identifiants dupliqués');
  for(const c of deck){
    assert.ok(c.front&&c.answers.length&&c.answers.every(a=>a.trim()),c.id+': recto/verso vide');
    assert.ok(!c.answers.some(a=>/^[A-E](?:\s*\+\s*[A-E])+\.?$/.test(a)),c.id+': combinaison de lettres sans repères');
    assert.ok(!/Combinaison correcte\s*:/i.test(c.explanation),c.id+': corrigé QCM sans repères');
    assert.ok(!/\?\?|Que permet les|Qu’est-ce que (?:un|une)\b|\bfigurent\s*\?/.test(c.front),c.id+': question mal formée');
  }
}
for(const q of selected.questions.filter(q=>q.answerCountNormalized)){
  const answers=selected.answersForQuestion(q);
  assert.equal(answers.length,4,q.id+': les quatre faits doivent être décodés');
  assert.ok(answers.every(a=>a.length>1&&!/^[A-E]$/.test(a)),q.id+': réponses développées absentes');
}
const negative=selected.questions.filter(q=>/(?:propositions?|affirmations?)\s+(?:(?:sont|est)\s+)?FAUSSES?/i.test(q.question));
assert.ok(negative.length>20,'Questions négatives non couvertes');
for(const q of negative){
  const cards=selected.cardsForQuestion(q);
  assert.equal(cards.length,q.answers.length,q.id+': une carte par proposition fausse');
  cards.forEach(c=>{
    assert.match(c.front,/Vrai ou faux/);
    assert.match(c.front,/—/,'Contexte de la proposition conservé');
    assert.deepEqual(Array.from(c.answers),['Faux.']);
  });
}
const receptors=selected.deck.find(c=>c.qid==='pharmaco_023');
assert.match(receptors.front,/quatre types de récepteurs/);
assert.equal(receptors.answers.length,4);
const calculation=selected.deck.find(c=>c.qid==='pharmaco_042'&&c.answers.includes('10 %'));
assert.match(calculation.front,/10 mg.*1 mg/,'Données du calcul absentes');
assert.doesNotMatch(calculation.front,/valeur normale/,'Un résultat de calcul ne constitue pas une norme');
assert.match(selected.deck.find(c=>c.qid==='v820_ias_018').front,/exemples/,'Liste partielle annoncée comme exhaustive');
for(const q of selected.questions.filter(q=>['homeostasie_050','cellules_014','v820_a1p3_015'].includes(q.id))){
  const cards=selected.cardsForQuestion(q);
  assert.ok(cards.length,q.id);
  for(const c of cards)assert.doesNotMatch(c.front,/À quoi correspond/,q.id+': relation à rappeler non explicitée');
}
console.log(JSON.stringify({selectedCards:selected.deck.length,candidateCards:full.deck.length,questions:selected.questions.length,negativeQuestions:negative.length,normalizedQuestions:7,vocabularyCards:195}));
