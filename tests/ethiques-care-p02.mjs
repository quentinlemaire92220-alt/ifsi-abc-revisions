import fs from 'node:fs';
import assert from 'node:assert/strict';
import {runtimeDeck} from './flashcards-runtime-fixture.mjs';
import {validateDualSheetPart} from './dual-sheet-contract.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),id='ethique_infirmiere';
const bank=read('qextra-58.txt'),old=read('data/course-banks/ethique_infirmiere-p01.json');
const delivery=read('docs/course-deliveries.json').courses.find(c=>c.courseId===id),part=delivery.partDeliveries.find(p=>p.partId==='p02');
const sheets=[1,2,3].flatMap(n=>read(`sheets-${n}.json`));
validateDualSheetPart(id,part,sheets);
assert.equal(bank.length,60);assert.equal(old.length,50);assert.equal(part.sheetResourceIds.length,1);
assert.equal(delivery.deliveryQuestionScope,'declared_parts');
assert.equal(bank.filter(q=>q.flashcards?.length).length,36);
assert.equal(bank.filter(q=>q.vocabularyTermIds?.length).length,24);
assert.ok(sheets.some(s=>s.courseId===id&&s.url.includes('1f3U91NKQVUAAGoHFTUc1jbbzQyBwIab1')),'Ancienne fiche perdue');
assert.equal(sheets.filter(s=>s.courseId===id&&s.partId==='p02').length,1,'Deuxième fiche non demandée');
const {questions,deck,registry}=await runtimeDeck();
for(const q of [...old,...bank]){
 const live=questions.find(x=>x.id===q.id&&x.courseId===id);assert.ok(live,'Question perdue '+q.id);
 assert.deepEqual(JSON.parse(JSON.stringify(live.answers)),q.answers,'Correction modifiée '+q.id);
 assert.deepEqual(JSON.parse(JSON.stringify(live.choices)),q.choices,'Choix modifiés '+q.id);
}
const incoming=bank.filter(q=>q.flashcards?.length);
for(const q of incoming){
 const card=deck.find(c=>c.qid===q.id);assert.ok(card,'Flashcard absente '+q.id);
 assert.equal(card.front,q.flashcards[0].front);assert.equal(card.explanation,q.flashcards[0].explanation);
 assert.deepEqual(JSON.parse(JSON.stringify(card.answers)),q.flashcards[0].answers);
}
for(const qid of ['013','026','038','044','020','010','021','033','050','005','004'])
 assert.ok(deck.some(c=>c.id==='fc:v820_ethique_'+qid),'Carte antérieure perdue '+qid);
const termIds=[...new Set(bank.flatMap(q=>q.vocabularyTermIds||[]))];
assert.equal(termIds.length,24);
const terms=read('vocabulaire-v1.json').entries;
for(const termId of termIds){
 const term=terms.find(t=>t.id===termId);assert.ok(term?.courseIds.includes(id),'Terme non rattaché '+termId);
 assert.ok(deck.some(c=>c.id==='voc:'+termId&&c.courseIds.includes(id)),'Carte vocabulaire absente '+termId);
 const q=bank.find(q=>q.vocabularyTermIds?.includes(termId));
 assert.equal(term.qcmQuestionIdsByCourse?.[id]||term.qcmQuestionId,q.id,'Lien vocabulaire non réciproque');
}
assert.equal(terms.filter(t=>t.term==='Empathie').length,1,'Terme partagé dupliqué');
for(const resourceId of part.infographicResourceIds){
 const board=read('infographics.json').find(x=>x.resourceId===resourceId);
 assert.ok(board?.localImage&&fs.existsSync(board.localImage));
 assert.equal(board.partId,'p02');assert.equal(board.officialSupport,false);
 assert.equal(part.completeBoardAudits[resourceId].driveId,board.driveId);
}
assert.equal(part.infographicResourceIds.length,5);
assert.equal(delivery.scriptsPreparedCount,4,'Nombre historique des scripts de care p02 conservé');
assert.equal(delivery.vocalScripts,undefined,'Références privées interdites dans le manifeste étudiant');
if(!part.vocalIds.length)assert.ok(part.blockers.some(b=>b.resource==='vocals'&&b.reason==='awaiting_user_mp3'));
const course=registry.courses.find(c=>c.id===id);assert.equal(course.qcmPdfQuestionCount,60);
assert.ok(registry.courses.find(c=>c.id===id).aliases.includes('Initiation à la philosophie éthique'));
const letters=new Set(bank.flatMap(q=>q.answers));assert.ok(letters.size>=4,'Réponses non réparties');
console.log('✅ Care p02 : une fiche, cinq planches, 60 QCM et 60 cartes ajoutés ; 50 QCM et 11 cartes antérieurs préservés.');
