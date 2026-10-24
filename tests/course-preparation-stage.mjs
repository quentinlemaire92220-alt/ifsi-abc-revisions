// Circuit de préparation : vérifier les ressources non validées sans les exposer dans IFSI ABC.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const pending=read('docs/course-preparations.json');
assert.equal(pending.schema,'ifsi_course_preparation_v1');
assert.equal(new Set(pending.courses.map(x=>x.courseId)).size,pending.courses.length);
const catalog=read('course-registry-v741.json').courses;
const sheets=[1,2,3].flatMap(n=>read('sheets-'+n+'.json'));
const deliveries=read('docs/course-deliveries.json').courses;
const questions=[1,2,3,4,5].flatMap(n=>read('questions-'+n+'.json'));
const vocabulary=read('vocabulaire-v1.json').entries;
const infographics=read('infographics.json');
const vocals=read('vocals.json');
const banned=/IFSI ABC\\s*[•·]\\s*UE|POSTURE PROFESSIONNELLE (?:QCM|FLASHCARDS)\\s*[•·]|\\bPAGE\\s+\\d+|\\b10 questions\\b/i;

for(const prep of pending.courses){
 const id=prep.courseId;
 assert.equal(id,'d1_posture_professionnelle_td2','Identifiant de préparation non déclaré dans le contrôle');
 assert.equal(prep.lifecycle,'preparation');
 assert.equal(prep.validated,false);
 assert.equal(prep.studentPublication,false);
 assert.equal(prep.approval,null);
 assert.equal(prep.sourceAudit.oralStatus,'incomplete_tail');
 assert.equal(prep.sourceAudit.recordingTailTruncated,true);
 assert.equal(prep.sourceAudit.oralCoverageExhaustive,false);
 assert.equal(prep.sourceAudit.scientificReview,'pending');
 assert.equal(prep.sourceAudit.lexiconReview,'pending');
 assert.equal(prep.artifacts.vocalMp3,0);
 for(const [name,data] of Object.entries({catalog,sheets,deliveries,questions,infographics,vocals})){
   assert.ok(data.every(x=>x.id!==id&&x.courseId!==id),
     'Fuite dans le catalogue étudiant '+name+' : '+id);
 }
 assert.ok(!vocabulary.some(x=>x.courseIds?.includes(id)),'Vocabulaire non approuvé exposé');
 assert.ok(!fs.existsSync('assets/posture-professionnelle-td2'),'PDF privé exposé sur GitHub Pages');
 assert.ok(!fs.existsSync('data/course-banks/posture_professionnelle_td2.json'),'Banque préparée déclarée publique');
 const bank=read('data/course-preparations/posture_professionnelle_td2.json');
 const lexicon=read('data/course-preparations/posture_professionnelle_td2_lexique.json');
 assert.equal(bank.length,prep.artifacts.questions);
 assert.equal(lexicon.length,prep.artifacts.glossaryTerms);
 assert.equal(new Set(bank.map(q=>q.id)).size,bank.length);
 assert.equal(new Set(lexicon.map(q=>q.id)).size,lexicon.length);
 assert.ok(lexicon.every(t=>t.courseIds?.length===1&&t.courseIds[0]===id));
 let cards=0;
 for(const q of bank){
  assert.equal(q.courseId,id);
  assert.equal(q.choices.length,5,'5 propositions A–E attendues pour '+q.id);
  assert.ok(q.answers.length>=1&&q.answers.length<=3,'Nombre de bonnes réponses : '+q.id);
  assert.equal(q.answers.length,new Set(q.answers).size,'Réponse répétée');
  assert.ok(q.answers.every(x=>Number.isInteger(x)&&x>=0&&x<5),'Indice de réponse invalide');
  assert.equal(q.announcedCorrectCount,q.answers.length,'Cardinalité différente');
  assert.ok(['easy','medium','hard'].includes(q.difficulty),'Niveau manquant');
  assert.ok(q.theme&&q.explanation?.length>25,'Thème ou explication absent');
  assert.ok(q.flashcards?.length>0,'Flashcard de cours absente');
  cards+=q.flashcards.length;
  const txt=[q.question,q.explanation,...q.choices,...q.flashcards.flatMap(f=>[f.front,f.explanation,...f.answers])];
  assert.ok(txt.every(s=>typeof s==='string'&&s.trim()),'Texte vide : '+q.id);
  assert.ok(txt.every(s=>!banned.test(s)),'Texte PDF parasite : '+q.id);
 }
 assert.equal(cards,prep.artifacts.flashcards,'Nombre de flashcards divergent');
 const publicMeta=JSON.stringify(prep);
 assert.ok(!/https?:\\/\\/drive\\.google\\.com/.test(publicMeta),'URL Drive privée exposée');
 assert.ok(!/\\b(?:script vocal private|recording_url|transcriptDriveId)\\b/i.test(publicMeta),'Source privée dans le manifeste');
 console.log('PASS préparation '+id+' : '+bank.length+' QCM, '+cards+' flashcards, '+lexicon.length+' termes ; catalogues étudiants intacts');
}
