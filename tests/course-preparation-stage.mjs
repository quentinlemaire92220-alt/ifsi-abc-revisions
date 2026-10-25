// Toutes les préparations doivent rester hors de l'application, sans ID spécial TD2.
import fs from 'node:fs';
import assert from 'node:assert/strict';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const pending=read('docs/course-preparations.json');
assert.equal(pending.schema,'ifsi_course_preparation_v1');
const catalog=read('course-registry-v741.json').courses;
const sheets=[1,2,3].flatMap(n=>read('sheets-'+n+'.json'));
const deliveries=read('docs/course-deliveries.json').courses;
const questions=[1,2,3,4,5].flatMap(n=>read('questions-'+n+'.json'));
const vocabulary=read('vocabulaire-v1.json').entries;
const infographics=read('infographics.json');
const vocals=read('vocals.json');
const ids=new Set();
for(const prep of pending.courses){
 const id=prep.courseId;
 assert.match(id||'',/^[a-z0-9_]+$/,'courseId non canonique');
 assert.ok(!ids.has(id),'courseId de preparation duplique');
 ids.add(id);
 assert.equal(prep.lifecycle,'preparation');
 assert.equal(prep.validated,false);
 assert.equal(prep.studentPublication,false);
 assert.equal(prep.approval,null);
 assert.ok(['complete','incomplete_tail','unverified','not_supplied'].includes(prep.sourceAudit?.oralStatus),
   id+': statut oral explicite requis');
 assert.ok(['pending','not_started'].includes(prep.sourceAudit?.scientificReview),
   id+': QA pédagogique ne doit pas être simulée');
 if(prep.sourceAudit.oralStatus==='incomplete_tail'){
  assert.equal(prep.sourceAudit.recordingTailTruncated,true);
  assert.equal(prep.sourceAudit.oralCoverageExhaustive,false);
 }
 const counts=prep.artifacts||{};
 for(const k of ['questions','flashcards','glossaryTerms','vocalMp3'])
  assert.ok(Number.isInteger(counts[k])&&counts[k]>=0,id+': inventaire '+k+' invalide');
 assert.equal(counts.vocalMp3,0,id+': MP3 privé non validé ne doit pas être déclaré');
 for(const [name,data] of Object.entries({catalog,sheets,deliveries,questions,infographics,vocals})){
  assert.ok(data.every(x=>x.id!==id&&x.courseId!==id),'Fuite catalogue '+name+': '+id);
 }
 assert.ok(!vocabulary.some(x=>x.courseIds?.includes(id)),id+': vocabulaire publié avant GO');
 const paths=prep.privateBankPaths||{};
 if(counts.questions>0){
  assert.ok(paths.questions?.startsWith('data/course-preparations/'),id+': banque préparée non isolée');
  const bank=read(paths.questions);
  assert.equal(bank.length,counts.questions,id+': quantité QCM incohérente');
  assert.equal(new Set(bank.map(q=>q.id)).size,bank.length);
  for(const q of bank){
   assert.equal(q.courseId,id);
   assert.equal(q.choices?.length,5);
   assert.ok(q.answers?.length>=1&&q.answers.length<=3);
   assert.equal(new Set(q.answers).size,q.answers.length);
   assert.equal(q.announcedCorrectCount,q.answers.length);
   assert.ok(['easy','medium','hard'].includes(q.difficulty));
   assert.ok(q.question&&q.explanation?.length>25&&q.flashcards?.length);
  }
  assert.equal(bank.reduce((a,q)=>a+q.flashcards.length,0),counts.flashcards);
 }else{
  assert.equal(counts.flashcards,0,id+': flashcards sans base validée');
 }
 if(counts.glossaryTerms>0){
  assert.ok(paths.lexicon?.startsWith('data/course-preparations/'),id+': lexique préparé non isolé');
  const terms=read(paths.lexicon);
  assert.equal(terms.length,counts.glossaryTerms);
  assert.ok(terms.every(t=>t.courseIds?.length===1&&t.courseIds[0]===id));
 }
 const publicMeta=JSON.stringify(prep);
 assert.ok(!/https?:\\/\\/drive\\.google\\.com|\\b(?:transcriptDriveId|recording_url|file_id)\\b/i.test(publicMeta),
  id+': une source privée a fuité dans GitHub');
 console.log('PASS préparation isolée',id,'QCM',counts.questions,'cartes',counts.flashcards);
}
