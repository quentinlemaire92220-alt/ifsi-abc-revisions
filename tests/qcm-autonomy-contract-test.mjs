import assert from 'node:assert/strict';
import {autonomyViolations,validateChangedQcmBanks} from './qcm-autonomy-contract.mjs';

const make=(id,question,extra={})=>({
  id,courseId:'synthetic_course',question,
  choices:['Une voie correcte','Une voie incorrecte','Un trajet plausible','Un distracteur','Une action erronée'],
  answers:[0],explanation:'Le choix A décrit le mécanisme correctement.',
  flashcards:[{front:'Quel est le mécanisme principal ?',answers:['Voie correcte.'],
    explanation:'Il assure la fonction indiquée.'}],
  ...extra
});
const okay=make('ex01','Quel est le rôle de l’intestin grêle ?',{
  source_ref:'TD page 12 - trace privée uniquement'
});
assert.deepEqual(autonomyViolations(okay),[]);
assert.equal(validateChangedQcmBanks([], [okay]),1);
assert.equal(validateChangedQcmBanks([make('ex01','Selon le TD, quel est le rôle ?')],
  [make('ex01','Selon le TD, quel est le rôle ?')]),0,
  'Les anciens cours inchangés ne doivent pas bloquer la CI');
const bad=[
  make('ex02','Quelles fonctions sont attribuées au grêle dans le cours ?'),
  make('ex03','Selon le TD, quels organes participent ?'),
  make('ex04','Quelle longueur figure page 12 du support ?'),
  make('ex05','Quelles indications sont citées dans le document ?'),
  make('ex06','Quel geste est recommandé par le cours ?'),
  make('ex07','La solution indiquée dans le TD est :'),
  make('ex08','Quel est le bon organe ?',{
    explanation:'Le TD décrit une relation entre ces deux organes.'
  }),
  make('ex09','Quel est le bon organe ?',{
    choices:['Le support indique une poche','Autre choix','Le rein','Le côlon','Le rectum']
  }),
  make('ex10','Quel est le bon organe ?',{
    flashcards:[{front:'Avec quel produit selon le TD ?',answers:['Eau.'],
      explanation:'Le support cite cette solution.'}]
  }),
  make('ex11','Quel est le bon organe ?',{
    flashcards:[{front:'Quel est le mécanisme ?',answers:['Le TD montre un mécanisme.'],
      explanation:'C’est un principe anatomique.'}]
  })
];
for(const item of bad){
  assert.ok(autonomyViolations(item).length,item.id+' non détecté');
  assert.throws(()=>validateChangedQcmBanks([], [item],'nouveau_cours'),
    /dépend du TD\/support/,item.id);
}
assert.throws(()=>validateChangedQcmBanks([], [okay,okay]),/dupliqué/);
assert.equal(validateChangedQcmBanks([okay],[{...okay,difficulty:'Moyen'}]),0,
  'Une simple métadonnée ne doit pas réouvrir les anciens contenus');
const legacy=make('legacy','Selon le cours, comment fonctionne ce phénomène ?');
const cleaned=make('legacy','Selon le cours, comment fonctionne ce phénomène ?',{
  choices:[...legacy.choices.slice(0,4),'Un distracteur clarifié']
});
assert.equal(validateChangedQcmBanks([legacy],[cleaned]),1,
  'Nettoyer une option sans modifier une formulation historique doit rester possible');
assert.throws(()=>validateChangedQcmBanks([legacy],[{
  ...cleaned,question:'Selon le TD, comment fonctionne ce phénomène ?'
}]),/dépend du TD\\/support/,
  'Une nouvelle référence à un support doit rester interdite');
assert.throws(()=>validateChangedQcmBanks([okay],[{...okay,explanation:'Le TD indique A.'}]),
  /dépend du TD\/support/);
console.log('✅ QCM autonomes : nouveaux énoncés, propositions, corrigés, cartes, archivage historique et suivi différentiel contrôlés.');
