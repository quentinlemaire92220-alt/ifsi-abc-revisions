import assert from 'node:assert/strict';
import {runtimeDeck} from './flashcards-runtime-fixture.mjs';
import fs from 'node:fs';
import {validateScopedRevisions} from '../tools/scoped-course-revision-contract.mjs';
import {validateFirstReleaseAuthoredCards} from '../tools/first-release-authored-cards.mjs';

// Unlike the legacy text-only inventory, include compressed banks, production
// override precedence, the course resolver, subthemes and the vocabulary deck.
const selected=await runtimeDeck();
const full=await runtimeDeck({allCards:true});
assert.ok(selected.questions.length>2200,'Banques de production absentes');
const vocabulary=JSON.parse((await import('node:fs')).readFileSync(new URL('../vocabulaire-v1.json',import.meta.url),'utf8'));
const manifest=JSON.parse(fs.readFileSync('docs/course-deliveries.json','utf8'));validateScopedRevisions(manifest);
const coveredCourses=new Set((manifest.scopedCourseRevisions||[]).filter(r=>r.profile==='verified_documents_addition_v1').map(r=>r.courseId));
for(const d of manifest.courses.filter(d=>d.authoredCardReview)){
 const course=selected.registry.courses.find(c=>c.id===d.courseId),bank=JSON.parse(fs.readFileSync(d.qcmBank,'utf8'));
 validateFirstReleaseAuthoredCards(d,course,bank,vocabulary.entries);if(course.vocabularyCoveredByAuthoredCards)coveredCourses.add(d.courseId);
 for(const change of [x=>x.publicationApproval.status='pending',x=>x.authoredCardReview.cards[0].sha256='0'.repeat(64),x=>x.authoredCardReview.cards.pop()]){const altered=structuredClone(d);change(altered);assert.throws(()=>validateFirstReleaseAuthoredCards(altered,course,bank,vocabulary.entries));}
 const altered=structuredClone(vocabulary.entries);altered.find(v=>v.id===course.vocabularyEntryIds[0]).definition+=' altérée';assert.throws(()=>validateFirstReleaseAuthoredCards(d,course,bank,altered));
}
for(const c of selected.registry.courses.filter(c=>c.vocabularyCoveredByAuthoredCards))assert.ok(coveredCourses.has(c.id),'Duplicate suppression without validated authored coverage');
const automatic=vocabulary.entries.filter(e=>!e.courseIds.every(id=>coveredCourses.has(id)&&selected.registry.courses.find(c=>c.id===id)?.vocabularyCoveredByAuthoredCards));
assert.equal(selected.deck.filter(c=>c.id.startsWith('voc:')).length,automatic.length);
for(const e of automatic)assert.ok(selected.deck.some(c=>c.id==='voc:'+e.id),'Automatic vocabulary card missing: '+e.id);
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
// The legacy IAS card is retained as a source question; its course now selects
// an explicitly authored bank. Still test the original transformation itself.
const legacyIas=selected.questions.find(q=>q.id==='v820_ias_018');
assert.ok(legacyIas,'Question IAS historique perdue');
assert.match(selected.frontForQuestion(legacyIas),/exemples/,'Liste partielle annoncée comme exhaustive');
for(const q of selected.questions.filter(q=>['homeostasie_050','cellules_014','v820_a1p3_015'].includes(q.id))){
  const cards=selected.cardsForQuestion(q);
  assert.ok(cards.length,q.id);
  for(const c of cards)assert.doesNotMatch(c.front,/À quoi correspond/,q.id+': relation à rappeler non explicitée');
}
console.log(JSON.stringify({selectedCards:selected.deck.length,candidateCards:full.deck.length,questions:selected.questions.length,negativeQuestions:negative.length,normalizedQuestions:7,vocabularyCards:vocabulary.entries.length}));
