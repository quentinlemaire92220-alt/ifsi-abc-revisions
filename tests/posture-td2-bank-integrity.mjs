// Contrôle autonome : un PDF ne doit jamais contaminer la banque interactive.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const id='d1_posture_professionnelle_td2';
const reg=JSON.parse(fs.readFileSync('course-registry-v741.json','utf8'));
if(!reg.courses.some(c=>c.id===id)){
 console.log('SKIP : le TD2 n’est pas encore dans le registre');
}else{
 const file='data/course-banks/posture_professionnelle_td2.json';
 assert.ok(fs.existsSync(file),'Banque du TD2 manquante');
 const bank=JSON.parse(fs.readFileSync(file,'utf8'));
 const mirror=JSON.parse(fs.readFileSync('questions-5.json','utf8')).filter(q=>q.courseId===id);
 assert.equal(bank.length,40,'40 QCM attendus');
 assert.equal(new Set(bank.map(q=>q.id)).size,40,'identifiants QCM uniques');
 assert.deepEqual(bank,mirror,'banque et version chargée par l’application différentes');
 const artifact=/IFSI ABC\\s*[•·]\\s*UE|POSTURE PROFESSIONNELLE (QCM|FLASHCARDS) [•·]|\\bPAGE\\s+\\d+|\\b10 questions\\b/i;
 for(const q of bank){
  assert.equal(q.courseId,id,'cours mal rattaché : '+q.id);
  assert.equal(q.choices?.length,5,'choix A–E incomplets : '+q.id);
  assert.ok(q.answers?.length>=1&&q.answers.length<=3,'nombre de bonnes réponses : '+q.id);
  assert.equal(new Set(q.answers).size,q.answers.length,'bonne réponse doublonnée : '+q.id);
  assert.ok(q.answers.every(i=>Number.isInteger(i)&&i>=0&&i<5),'index réponse invalide : '+q.id);
  assert.equal(q.announcedCorrectCount,q.answers.length,'annonce incompatible : '+q.id);
  assert.equal(q.flashcards?.length,1,'une carte rédigée par question : '+q.id);
  const fields=[q.question,q.explanation,...q.choices,q.flashcards[0].front,q.flashcards[0].explanation,...q.flashcards[0].answers];
  assert.ok(fields.every(s=>typeof s==='string'&&s.trim().length>0),'champ vide : '+q.id);
  for(const s of fields)assert.ok(!artifact.test(s),'pied de page / titre parasitant '+q.id+': '+s);
 }
 console.log('PASS TD2 : 40 QCM, 200 choix, 40 cartes ; miroir synchronisé et aucune contamination PDF');
}
