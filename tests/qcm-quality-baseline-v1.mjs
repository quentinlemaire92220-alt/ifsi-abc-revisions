// La dette historique reste visible et ne peut pas augmenter silencieusement.
// Cette limite n'atteste pas l'exactitude médicale des réponses.
import assert from 'node:assert/strict';
import {runtimeDeck} from './flashcards-runtime-fixture.mjs';
import {qualityCounts,assertQualityCeilings,needsExternalFigure,hasFigureResource} from './qcm-quality-core-v1.mjs';
const {questions}=await runtimeDeck();
const counts=qualityCounts(questions);
const ceilings={
  short_explanation:289,
  source_dependent_question:108,
  three_of_four:623,
  identical_question:0,
  image_without_figure:2
};
assert.ok(questions.length>=2560,'Une baisse du nombre total de QCM doit être justifiée en revue.');
const visualIds=questions.filter(q=>needsExternalFigure(q.question)&&!hasFigureResource(q)).map(q=>q.id);
console.log('ℹ️ Questions signalées sans figure explicite : '+JSON.stringify(visualIds));
assertQualityCeilings(counts,ceilings);
console.log('✅ Dette QCM historique plafonnée (à corriger après validation pédagogique) : '+JSON.stringify(counts));
