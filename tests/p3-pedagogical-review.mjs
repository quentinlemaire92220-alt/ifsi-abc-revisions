import assert from 'node:assert/strict';
import fs from 'node:fs';
import {findQcmBias,findFlashcardIssues,toMarkdown} from '../tools/p3-pedagogical-review.mjs';
const questions=[];
for(let i=0;i<24;i++)questions.push({
 id:'fixture_'+i,courseId:'fixture_cours',course:'Cours fictif',
 choices:['A','B','C','D','E'],answers:[i<20?1:i%5],question:'Question '+i,explanation:'Fictif'
});
const flagged=findQcmBias(questions);
assert.equal(flagged.length,1,'Une position dominante doit être signalée');
assert.equal(flagged[0].courseId,'fixture_cours');
assert.ok(flagged[0].patterns.some(x=>x.category==='dominant_answer_combination'));
assert.ok(flagged[0].patterns.some(x=>x.category==='imbalanced_position'));
const balanced=Array.from({length:25},(_,i)=>({...questions[0],id:'balanced_'+i,answers:[i%5]}));
assert.equal(findQcmBias(balanced).length,0,'Une répartition équilibrée ne doit pas être signalée');
assert.equal(findQcmBias(questions.slice(0,5)).length,0,'Échantillon trop petit pour une alerte');
const cards=[
 {id:'ok',qid:'q1',courseId:'c',theme:'General',front:'À quoi sert le rein ?',answers:['Filtrer le sang']},
 {id:'wrong',qid:'q2',courseId:'c',theme:'General',front:'Question de révision',answers:['Voir le corrigé associé']},
 {id:'dup',qid:'q3',courseId:'c',theme:'General',front:'À quoi sert le rein ?',answers:['Filtrer le sang']}
];
const bad=findFlashcardIssues(cards);
assert.equal(bad.length,2);
assert.deepEqual(bad[0].reasons,['question manquante','réponse manquante']);
assert.ok(bad[1].reasons.includes('question en double'));
const report={counts:{questions:24,flashcards:3,qcmFlaggedCourses:1,flashcardIssues:2},qcmBias:flagged,flashcardIssues:bad};
const md=toMarkdown(report);
assert.match(md,/P3 — Revue QCM/);
assert.match(md,/fixture_cours/);
assert.match(md,/Pas de correction automatique/);
const ui=fs.readFileSync(new URL('../v821-resource-audit.js',import.meta.url),'utf8');
assert.ok(ui.includes("state=!e.ok?'❌ Anomalies structurelles':e.warnings.length||fc.bad.length?'⚠️ Points à vérifier'"),
 'Les flashcards à revoir ne doivent pas être présentées comme des erreurs critiques');
assert.ok(ui.includes("${!e.ok?'bad':clean?'ok':'wait'}"),
 'Pastille rouge réservée aux erreurs structurelles');
assert.ok(!ui.includes("state=!e.ok||fc.bad.length?"),
 'L’ancien classement rouge des flashcards ne doit pas réapparaître');
console.log('✅ P3 : seuils de biais, doublons de recto et alertes flashcards sans modification de contenu');
