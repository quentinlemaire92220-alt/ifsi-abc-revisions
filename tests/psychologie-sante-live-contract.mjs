import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {runtimeDeck} from './flashcards-runtime-fixture.mjs';

const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const dir='docs/proposals/psychologie-sante-20261027/';
const candidate=read(dir+'qcm-runtime-candidate.json');
const definitions=read(dir+'flashcards-59-candidate.json');
const active=read('questions-5.json').filter(q=>q.courseId==='psychologie_sante');
const reg=read('course-registry-v741.json').courses.filter(c=>c.id==='psychologie_sante');
const sheets=read('sheets-3.json').filter(s=>s.courseId==='psychologie_sante');
const pdfs=[
 ['assets/psychologie-sante-20261027/UE_B2_Psychologie_Sante_Fiche_Revision_Corrigee.pdf','c1cf1233a527e755917e11f5dd06e95d001f8ff4d5fd2da81f6463d281027486'],
 ['assets/psychologie-sante-20261027/UE_B2_Psychologie_Sante_QCM_50_Corriges.pdf','e018df4efd9c5e0db34453164e112a5c40d91746f64b059b80bd562e5ff83c89'],
 ['assets/psychologie-sante-20261027/UE_B2_Psychologie_Sante_Flashcards_59.pdf','9bd7e45fc6d49273552db4c66f08407af9a56b919d7cc6275e58065868cd178a']
];
for(const [path,digest] of pdfs){
  assert.ok(fs.existsSync(path),'PDF manquant : '+path);
  assert.equal(createHash('sha256').update(fs.readFileSync(path)).digest('hex'),digest,'PDF empreinte incorrecte '+path);
}
assert.equal(reg.length,1,'Ne jamais doubler le cours');
assert.equal(reg[0].flashcardTarget,59);
assert.equal(reg[0].authoredFlashcards,true);
assert.equal(reg[0].nativeSupportAvailable,false);
assert.equal(sheets.length,2,'Préserver la fiche historique et la nouvelle');
assert.ok(sheets.some(s=>s.resourceId==='psychologie_sante_fiche_p01'));
assert.ok(sheets.some(s=>s.resourceId==='psychologie_sante_fiche_complete_20261027'&&s.provisional&&s.officialSupport===false));
assert.equal(candidate.length,50);
assert.equal(active.length,50,'Exactement 50 QCM pour cette nouvelle partie');
assert.equal(new Set(active.map(q=>q.id)).size,50);
const key=q=>JSON.stringify([q.id,q.question,q.choices,q.answers,q.explanation]);
for(let i=0;i<50;i++){
 assert.equal(key(active[i]),key(candidate[i]),'Contenu corrigé non conforme Q'+(i+1));
 assert.equal(active[i].announcedCorrectCount,active[i].answers.length);
 assert.equal(active[i].flashcards?.every(c=>c.kind==='Notion précise'&&c.front&&c.answers.length===1),true);
}
assert.equal(active.reduce((n,q)=>n+q.flashcards.length,0),59);
assert.equal(definitions.length,59);
const actual=new Map(active.flatMap(q=>q.flashcards.map(c=>[c.front,c.answers[0]])));
assert.equal(actual.size,59,'Toutes les définitions ont un recto distinct');
for(const d of definitions)assert.equal(actual.get(d.front),d.back,'Définition divergent : '+d.term);
const existingVocals=read('vocals.json').filter(v=>v.courseId==='psychologie_sante');
assert.equal(existingVocals.length,2,'Ne pas écraser les deux vocaux historiques');
const {deck,questions}=await runtimeDeck();
assert.equal(questions.filter(q=>q.courseId==='psychologie_sante').length,50,'50 QCM dans le chargeur réel');
const cards=deck.filter(c=>c.courseId==='psychologie_sante');
const authored=cards.filter(c=>String(c.qid||'').startsWith('psychologie_sante_p01_'));
assert.equal(authored.length,59,'Le moteur doit rendre exactement les 59 nouvelles cartes rédigées');
assert.ok(cards.length>=59,'Ne pas supprimer les fiches de vocabulaire historiques');
const cardTexts=new Set(authored.map(c=>c.front));
for(const d of definitions)assert.ok(cardTexts.has(d.front),'Carte absente du rendu : '+d.term);
console.log('PASS publication candidat : 3 PDF intègres, 50 QCM actifs dans chargeur, 59 cartes rendues et 2 vocaux préservés.');
