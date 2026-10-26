// Contrôles P3 des données du nouveau pack ; aucune approbation clinique simulée.
import assert from 'node:assert/strict';

const filled=v=>typeof v==='string'&&v.trim().length>0;
const bannedFront=/^(?:cite|citer|liste|lister)\b/i;

export function isExplicitRecallPrompt(value){
 const front=String(value||'').trim();
 if(!filled(front)||bannedFront.test(front))return false;
 // A targeted recall instruction is equivalent to an active question.
 // Vague listing commands remain forbidden.
 return front.endsWith('?') ||
  /^(?:Donne un exemple de|Nomme (?:les|des))\s+\S.{5,}\.$/iu.test(front);
}

export function validateLeanQuestions(questions){
 assert.ok(Array.isArray(questions)&&questions.length>0,'Banque QCM lean vide');
 const ids=new Set();
 for(const q of questions){
  assert.ok(filled(q.id)&&!ids.has(q.id),'ID QCM manquant/dupliqué');
  ids.add(q.id);
  assert.ok(filled(q.question)&&filled(q.theme),'Énoncé ou thème QCM manquant : '+q.id);
  assert.ok(['easy','medium','hard'].includes(q.difficulty),'Difficulté QCM absente : '+q.id);
  assert.equal(q.choices?.length,5,'QCM : exactement cinq propositions A-E : '+q.id);
  assert.ok(q.choices.every(filled),'QCM : proposition vide : '+q.id);
  assert.equal(new Set(q.choices.map(x=>x.trim().toLowerCase())).size,5,'QCM : propositions dupliquées : '+q.id);
  assert.ok(Array.isArray(q.answers),'QCM : réponses manquantes : '+q.id);
  assert.ok(q.answers.length>=1&&q.answers.length<=3,'QCM : entre une et trois bonnes réponses : '+q.id);
  assert.equal(new Set(q.answers).size,q.answers.length,'QCM : réponse répétée : '+q.id);
  assert.ok(q.answers.every(i=>Number.isInteger(i)&&i>=0&&i<5),'QCM : indice de réponse invalide : '+q.id);
  // Un nombre annoncé dans la question/PDF doit provenir de la même matrice que les réponses applicatives.
  assert.equal(q.announcedCorrectCount,q.answers.length,'QCM : nombre de bonnes réponses annoncé incohérent : '+q.id);
  assert.ok(filled(q.explanation)&&q.explanation.length>=26,'QCM : corrigé argumenté absent : '+q.id);
 }
 return questions.length;
}

export function validateLeanFlashcards(cards){
 assert.ok(Array.isArray(cards)&&cards.length>0,'Flashcards lean absentes');
 const ids=new Set();
 for(const card of cards){
  assert.ok(filled(card.id)&&!ids.has(card.id),'Flashcard ID absent/dupliqué');
  ids.add(card.id);
  const front=String(card.front||'').trim();
  assert.ok(!bannedFront.test(front),'Flashcard : consigne vague « citer/lister » : '+card.id);
  assert.ok(isExplicitRecallPrompt(front),'Flashcard : question ou rappel explicite manquant : '+card.id);
  assert.ok(Array.isArray(card.answers)&&card.answers.length>=1&&card.answers.every(filled),'Flashcard : réponse absente : '+card.id);
  assert.ok(filled(card.explanation),'Flashcard : justification absente : '+card.id);
 }
 return cards.length;
}
