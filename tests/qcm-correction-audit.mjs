import fs from 'node:fs';
import assert from 'node:assert/strict';

const read=p=>fs.readFileSync(new URL('../'+p, import.meta.url),'utf8');
const index=read('index.html');
const features=read('features-v9.js');
const v7=read('v7-local.js');
const v72=read('v72-pack.js');
const v75=read('v75-smart.js');
const v79=read('v79-themes.js');
const v81=read('v81-suite.js');

for(const src of [index,features]){
  assert.ok(src.includes('same(sel,q.answers)'),'Le score entraînement doit utiliser q.answers');
  assert.ok(src.includes("e.querySelector('input').disabled=true"),'Les réponses doivent être figées après validation');
  assert.ok(src.includes('Ta réponse :'),'Libellé « Ta réponse » absent de la correction entraînement');
  assert.ok(src.includes('Bonne réponse :'),'Libellé « Bonne réponse » absent de la correction entraînement');
}
assert.ok(features.includes('function renderTrainingCorrection('),'Renderer central de correction entraînement absent');
assert.ok(features.includes('answerLetters(q.answers)'),'La correction affichée doit utiliser la même vérité q.answers');
assert.ok(features.includes("explanation.textContent=q.explanation||''"),'Explication argumentée absente du renderer entraînement');

assert.ok(v75.includes("dataset.frozen==='1'"),'Le niveau de confiance n’est pas protégé après validation');
assert.ok(v75.includes("function freezeConfidence()"),'Fonction de gel de confiance absente');
assert.ok(v75.includes("b.disabled=true"),'Les boutons de confiance ne sont pas désactivés');
assert.ok(v75.includes("freezeConfidence();const r=recordReview"),'La confiance doit être figée lors de la validation entraînement');

for(const [name,src] of [['v7',v7],['v72',v72]]){
  assert.ok(src.includes('Ta réponse :</b>'),`Corrigé examen ${name}: « Ta réponse » absent`);
  assert.ok(src.includes('Bonne réponse :</b>'),`Corrigé examen ${name}: « Bonne réponse » absent`);
  assert.ok(src.includes('q.answers'),`Corrigé examen ${name}: source de vérité q.answers absente`);
  assert.ok(src.includes('q.explanation'),`Corrigé examen ${name}: explication absente`);
}

assert.match(index,/function startErrors\(\).*begin\(Q\.filter/,'Mode Erreurs ne converge plus vers le moteur QCM');
assert.match(features,/function startFavorites\(\).*begin\(a\)/,'Mode Favoris ne converge plus vers le moteur QCM');
assert.ok(v79.includes("if(typeof begin==='function')begin(picked)"),'Série personnalisée cours ne converge plus vers begin');
assert.ok(v81.includes("typeof begin==='function'?begin(qs)"),'Centre de révision ne converge plus vers begin');

for(const [name,src] of [['index',index],['features',features],['v7',v7],['v72',v72]]){
  assert.ok(!/correctAnswers|correctAnswer\b/.test(src),`Source de vérité QCM parallèle détectée dans ${name}`);
}

console.log('✅ Audit correction QCM : réponse figée, confiance figée, Ta réponse / Bonne réponse / explication et q.answers contrôlés');
