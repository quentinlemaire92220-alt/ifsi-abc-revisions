import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
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
// Même si toutes les clés PDF sont A ou AB, les choix affichés doivent être équilibrés.
const context={window:{}};
vm.runInNewContext(fs.readFileSync(new URL('../v8378-qcm-feedback.js',import.meta.url),'utf8'),context);
const {choiceOrder,reviewChoices}=context.window.IFSI_QCM_FEEDBACK;
const bank=Array.from({length:80},(_,i)=>({...questions[0],courseId:'psychometrie',id:'choice_'+i,
 choices:['Premier texte','Deuxième texte','Troisième texte','Quatrième texte','Cinquième texte'],
 answers:i%2?[0]:[0,1]}));
bank.push({...bank[0],id:'anchored',choices:['La proposition A est vraie',...bank[0].choices.slice(1)]},
 {...bank[1],id:'vocab',vocabularyTermId:'terme'});
const initial=JSON.stringify(bank), reversed=bank.slice().reverse();
const displayed=bank.map(q=>{
 const order=choiceOrder(q,bank);
 if(!order)return q;
 assert.deepEqual([...order].sort(),[0,1,2,3,4]);
 assert.deepEqual([...order],[...choiceOrder(q,reversed)]);
 assert.equal(reviewChoices(q,[0],bank),'A. Premier texte');
 return {...q,answers:q.answers.map(i=>order.indexOf(i))};
});
assert.ok(findQcmBias(bank).length);
assert.equal(findQcmBias(displayed).length,0);
assert.equal(choiceOrder(bank.at(-2),bank),null);
assert.equal(choiceOrder(bank.at(-1),bank),null);
assert.equal(JSON.stringify(bank),initial);
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
