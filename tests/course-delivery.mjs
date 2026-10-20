import fs from 'node:fs';
import assert from 'node:assert/strict';
import {runtimeDeck} from './flashcards-runtime-fixture.mjs';
import {validateDualSheetDelivery,validateSheetSource} from './dual-sheet-contract.mjs';
import {validateLeanCourseDelivery,validateLeanPart} from './lean-course-contract.mjs';
import {validateLeanQuestions,validateLeanFlashcards} from './lean-content-contract.mjs';
import {validateAudioOnlyDelivery} from './audio-only-delivery-contract.mjs';

const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const manifest=read('docs/course-deliveries.json');
const sheets=[1,2,3].flatMap(n=>read(`sheets-${n}.json`));
const infos=read('infographics.json'),vocals=read('vocals.json');
const {deck,questions,registry}=await runtimeDeck();
const {validateAudioSupplements}=await import('./audio-supplement-contract.mjs');
validateAudioSupplements(manifest,{registry,vocals});
const required=['01','02','03','04','05','06','07','08','99'];
for(const c of manifest.courses){
 assert.equal(c.validated,true,c.courseId+': validation manquante');
 assert.ok(registry.courses.some(x=>x.id===c.courseId),c.courseId+': cours absent');
 if(c.deliveryMode==='audio_only'){
  validateAudioOnlyDelivery(registry.courses.find(x=>x.id===c.courseId),c,vocals);
  console.log('✅ '+c.courseId+': '+c.vocals.length+' MP3 — livraison audio partielle (supports privés non publiés)');
  continue;
 }
 for(const key of required)assert.ok(c.folders[key],c.courseId+': dossier '+key+' absent');
 assert.equal(new Set(Object.values(c.folders)).size,required.length,'Dossiers dupliqués');
 // Les cours anciens sont conservés ; les deux fiches sont exigées pour les nouveaux cours et parties.
 if(c.packFormat==='lean_v1')validateLeanCourseDelivery(c.courseId,c,sheets);
 else if(c.infographicSheetResourceId)validateDualSheetDelivery(c.courseId,c,sheets);
 const sheet=sheets.find(x=>x.resourceId===c.sheetResourceId);
 assert.equal(sheet?.courseId,c.courseId,'Fiche mal rattachée');
 validateSheetSource(c.courseId,c,sheet);
 assert.ok(c.qcmDriveId&&(c.supportDriveId||c.deliveryMode==='existing_course_revision'),'Documents non identifiés');
 const bankPaths=Array.isArray(c.qcmBanks) && c.qcmBanks.length ? c.qcmBanks : [c.qcmBank];
 assert.ok(bankPaths.every(x=>typeof x==='string'&&x.length),'Chemins QCM invalides');
 assert.equal(new Set(bankPaths).size,bankPaths.length,'Banque QCM référencée deux fois');
 const bank=bankPaths.flatMap(read),live=questions.filter(q=>q.courseId===c.courseId);
 assert.equal(new Set(bank.map(q=>q.id)).size,bank.length,c.courseId+': ID de question dupliqué entre parties');
 assert.equal(bank.length,c.qcmCount,'Banque QCM tronquée');
 assert.equal(live.length,bank.length,'Banque perdue dans le navigateur');
 for(const q of bank){
  assert.ok(q.answers.length>=1&&q.answers.length<=3,q.id+': réponses hors charte');
  assert.ok(['easy','medium','hard'].includes(q.difficulty),q.id+': niveau absent');
  assert.ok(q.theme&&q.explanation.length>25,q.id+': thème/corrigé absent');
  const actual=live.find(x=>x.id===q.id);
  assert.deepEqual(JSON.parse(JSON.stringify(actual.answers)),q.answers,q.id+': correction divergente');
 }
 if(c.packFormat==='lean_v1')validateLeanQuestions(bank);
 const cards=deck.filter(x=>x.courseId===c.courseId && !String(x.id).startsWith('voc:')); // Les cartes de livraison sont distinctes des cartes de vocabulaire générées.
 assert.equal(cards.length,c.flashcardCount,'Flashcards absentes ou perdues');
 if(c.packFormat==='lean_v1')validateLeanFlashcards(cards);
 assert.ok(c.flashcardDriveId,'Export Flashcards absent');
 for(const card of cards){
  assert.ok(card.front.endsWith('?')&&(card.answers.length===1||(card.authored&&card.answers.length<=4)),card.id+': carte imprécise');
  assert.ok(card.explanation,card.id+': explication absente');
  const q=bank.find(x=>x.id===card.qid);
  assert.ok(q?.flashcards?.some(x=>x.front===(card.sourceFront||card.front)),card.id+': question source perdue');
 }
 const partDeliveries=c.partDeliveries||[];
 for(const part of partDeliveries){
  assert.match(part.partId||'',/^p\d{2,3}$/,c.courseId+': partId incorrect');
  if(part.packFormat==='lean_v1')validateLeanPart(c.courseId,part,sheets);
  for(const id of part.sheetResourceIds||[]){
   assert.ok(sheets.some(x=>x.resourceId===id&&x.courseId===c.courseId),
     c.courseId+': fiche de partie absente '+part.partId);
  }
  for(const id of part.qcmQuestionIds||[]){
   assert.ok(bank.some(x=>x.id===id&&x.courseId===c.courseId),
     c.courseId+': question de partie absente '+part.partId);
  }
  for(const id of part.infographicResourceIds||[]){
   assert.ok(infos.some(x=>x.resourceId===id&&x.courseId===c.courseId),
     c.courseId+': infographie de partie absente '+part.partId);
  }
  for(const id of part.vocalIds||[]){
   assert.ok(vocals.some(x=>x.id===id&&x.courseId===c.courseId),
     c.courseId+': vocal de partie absent '+part.partId);
  }
 }
 if(c.packFormat!=='lean_v1')assert.ok(c.infographicResourceIds.length,'Infographies absentes');
 for(const id of c.infographicResourceIds){
  const x=infos.find(x=>x.resourceId===id);
  assert.equal(x?.courseId,c.courseId,'Infographie mal rattachée');
  assert.ok(x.driveId&&fs.existsSync(x.localImage),'Infographie non exportée');
 }
 if(c.status==='complete'){
  assert.equal(c.blockers.length,0,'Un pack complet ne peut avoir de blocage');
  if(c.packFormat!=='lean_v1'||c.requestedVocals===true)assert.ok(c.vocals.length>0,'Pack complet sans vocal demandé');
 }else if(c.status==='awaiting_mp3'){
  assert.equal(c.vocals.length,0,'Audio publié avant le retour des MP3');
  assert.ok(c.vocalScripts.length>0,'Scripts vocaux absents');
  assert.ok(c.vocalScripts.every(x=>x.driveId&&x.number&&x.title),'Scripts vocaux incomplets');
  assert.ok(c.blockers.some(x=>x.resource==='vocals'&&x.reason==='awaiting_user_mp3'),'Attente des MP3 non explicitée');
 }else{
  assert.equal(c.status,'partial','Statut de livraison inconnu');
  assert.ok(c.blockers.length,'Livraison partielle sans explication');
  if(c.packFormat!=='lean_v1'||c.requestedVocals===true)assert.ok(c.vocals.length||c.blockers.some(x=>x.resource==='vocals'),'Vocaux oubliés silencieusement');
 }
 for(const id of c.vocals)assert.ok(vocals.some(x=>x.id===id&&x.courseId===c.courseId&&x.driveId),'Vocal absent');
 console.log(`✅ ${c.courseId}: ${bank.length} QCM, ${cards.length} cartes, ${c.infographicResourceIds.length} infographies — ${c.status}`);
}
