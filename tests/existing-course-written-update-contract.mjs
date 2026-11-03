import {readHistoricalAudioJson,readHistoricalAudioGitJson} from './historical-audio-fixture.mjs';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
import {validateBank} from '../tools/qcm-bank-contract.mjs';
import {validateWrittenDelivery} from './written-sheet-contract.mjs';
const read=readHistoricalAudioJson;
const hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
export const isExistingWrittenUpdate=d=>d?.updateContract==='existing_course_written_update_v1';
export function validateExistingWrittenUpdate(course,d,{sheets,questions,deck,vocabulary,vocals,infographics}={}){
 assert.equal(d.updateContract,'existing_course_written_update_v1');
 assert.equal(d.deliveryMode,'existing_course_revision');
 assert.equal(d.publicationSubset,'written_qcm_flashcards_vocabulary_update');
 assert.equal(d.packFormat,'written_v1');assert.equal(d.validated,true);assert.equal(d.pedagogicalValidated,true);
 assert.equal(d.publicationHost,'drive');assert.equal(d.status,'partial');assert.equal(d.provisional,false);
 assert.equal(d.sourceAudit.independentClinicalSignoff,false);
 assert.equal(d.sourceAudit.oralReviewBasis,'full_transcript_documentary_review');
 assert.equal(d.sourceAudit.originalAudioCompared,false);
 assert.equal(d.sourceAudit.officialSupportPreservedPrivately,true);
 assert.equal(course.id,d.courseId);assert.equal(course.officialSupport,true);assert.equal(course.provisional,false);
 validateWrittenDelivery(d.courseId,d,sheets);
 assert.deepEqual(Object.keys(d.publicArtifacts).sort(),['flashcards','qcm','sheet']);
 for(const a of Object.values(d.publicArtifacts)){
  assert.match(a.path,/^assets\/[a-z0-9_-]+\/[A-Za-z0-9_/-]+\.pdf$/);
  assert.equal(hash(a.path),a.sha256);assert.equal(d.artifactSha256s[a.artifactId],a.sha256);
 }
 const bank=read(d.qcmBank);assert.equal(validateBank(bank),d.qcmCount);
 assert.deepEqual(bank.map(q=>q.number),Array.from({length:bank.length},(_,i)=>i+1));
 assert.deepEqual(d.qcmBanks,[d.qcmBank]);assert.equal(new Set(bank.map(q=>q.id)).size,bank.length);
 assert.ok(bank.every(q=>q.courseId===course.id));
 assert.deepEqual(read('questions-5.json').filter(q=>course.canonicalQuestionIds.includes(q.id)),bank);
 assert.deepEqual(course.canonicalQuestionIds,bank.map(q=>q.id));
 assert.equal(bank.flatMap(q=>q.flashcards).length,d.flashcardCount);
 assert.equal(course.flashcardTarget,d.flashcardCount);assert.equal(course.authoredFlashcards,true);
 assert.equal(course.authoredFlashcardPresentation,'standalone_v1');
 assert.deepEqual(course.vocabularyEntryIds,d.vocabularyEntryIds);
 const selected=vocabulary.filter(v=>d.vocabularyEntryIds.includes(v.id));
 assert.equal(new Set(d.vocabularyEntryIds).size,d.vocabularyCount);
 assert.equal(selected.length,d.vocabularyCount);assert.equal(d.lexicon.termCount,d.vocabularyCount);
 assert.ok(selected.every(v=>v.courseIds.length===1&&v.courseIds[0]===course.id));
 assert.ok(selected.every(v=>v.sourceType==='course_glossary'&&v.etymologyStatus==='not_provided_in_course'&&!v.etymologie));
 assert.equal(new Set(selected.map(v=>v.term.normalize('NFKC').toLocaleLowerCase('fr'))).size,selected.length);
 assert.equal(course.qcmPdfUrl,'https://drive.google.com/file/d/'+d.qcmDriveId+'/view?usp=drivesdk');
 assert.equal(course.flashcardsPdfUrl,'https://drive.google.com/file/d/'+d.flashcardDriveId+'/view?usp=drivesdk');
 assert.equal(d.flashcardPdfLayout,'duplex_six_cards_v1');assert.equal(d.qcmPdfLayout,'theme_badge_cardinality_v1');
 assert.ok(Number.isInteger(d.scriptsPreparedCount)&&d.scriptsPreparedCount>0);
 assert.ok(d.blockers.some(b=>b.resource==='vocals'&&b.reason==='awaiting_user_mp3'&&b.count===d.scriptsPreparedCount));
 assert.equal(d.vocalScripts,undefined);assert.equal(d.publicAudioArtifacts,undefined);
 assert.deepEqual(vocals.filter(v=>v.courseId===course.id).map(v=>v.id),d.vocals);
 assert.equal(d.partDeliveries.length,1);const p=d.partDeliveries[0];assert.equal(p.partId,'p01');
 assert.equal(p.status,'awaiting_mp3');assert.deepEqual(p.vocalIds,[]);assert.deepEqual(p.qcmQuestionIds,course.canonicalQuestionIds);
 assert.deepEqual(p.sheetResourceIds,[d.sheetResourceId]);
 assert.equal(d.publicationApproval.status,'approved');assert.equal(d.publicationApproval.authorization,'explicit_go_publication');
 assert.equal(d.publicationApproval.scope,'course_package');
 if(questions){
  assert.deepEqual(JSON.parse(JSON.stringify(questions.filter(q=>course.canonicalQuestionIds.includes(q.id)))),bank);
  const actual=deck.filter(c=>c.courseId===course.id&&!String(c.id).startsWith('voc:'));
  assert.equal(actual.length,d.flashcardCount);
  for(const q of bank){const c=actual.find(c=>c.qid===q.id);assert.ok(c);assert.equal(c.sourceFront||c.front,q.flashcards[0].front);assert.equal(c.front.replace(/\s+([?!:;])/g,'$1'),q.flashcards[0].front.replace(/\s+([?!:;])/g,'$1'));assert.deepEqual(JSON.parse(JSON.stringify(c.answers)),q.flashcards[0].answers);}
 }
 return {questions:d.qcmCount,flashcards:d.flashcardCount,vocabulary:d.vocabularyCount};
}
export function verifyExistingWrittenHistory(oldCourse,nextCourse,d,base=process.env.IFSI_BASE_SHA){
 assert.ok(isExistingWrittenUpdate(d));assert.equal(d.courseId,oldCourse.id);
 assert.match(base||'',/^[a-f0-9]{40}$/);
 const before=p=>readHistoricalAudioGitJson(p,base);
 const prior=before('docs/course-deliveries.json').courses.find(c=>c.courseId===d.courseId);
 if(prior){
  // A later audio supplement must not re-run the first-release +2 docs/+1 sheet
  // arithmetic against a base where those resources are already published.
  assert.deepEqual(d,prior,'Livraison historique modifiée');
  assert.deepEqual(nextCourse,oldCourse,'Cours historique modifié hors complément isolé');
  assert.deepEqual(read(d.historicalResourcesPath),before(d.historicalResourcesPath),'Snapshot historique modifié');
  for(const file of ['sheets-1.json','sheets-2.json','sheets-3.json','vocals.json','infographics.json','questions-5.json']){
   assert.deepEqual(read(file).filter(x=>x.courseId===d.courseId),before(file).filter(x=>x.courseId===d.courseId),'Ressource historique modifiée : '+file);
  }
  assert.deepEqual(read(d.qcmBank),before(d.qcmBank),'Banque historique modifiée');
  assert.deepEqual(read('vocabulaire-v1.json').entries.filter(x=>x.courseIds?.includes(d.courseId)),before('vocabulaire-v1.json').entries.filter(x=>x.courseIds?.includes(d.courseId)),'Vocabulaire historique modifié');
  return true;
 }
 const strip=x=>{const y={...x};for(const k of ['officialSupport','nativeSupportAvailable','provisional','sourceStatus','authoredFlashcards','authoredFlashcardPresentation','flashcardTarget','qcmPdfUrl','qcmPdfQuestionCount','flashcardsPdfUrl','canonicalQuestionIds','vocabularyEntryIds','additionalDocuments','sourceNote'])delete y[k];return y;};
 assert.deepEqual(strip(nextCourse),strip(oldCourse),'Identité, support ou vocaux historiques modifiés');
 const oldDocs=oldCourse.additionalDocuments||[],docs=nextCourse.additionalDocuments;
 assert.deepEqual(docs.slice(0,oldDocs.length),oldDocs);assert.equal(docs.length,oldDocs.length+2);
 assert.deepEqual(docs.slice(oldDocs.length).map(x=>x.type),['qcm','flashcards']);
 assert.equal(docs.at(-2).url,nextCourse.qcmPdfUrl);assert.equal(docs.at(-1).url,nextCourse.flashcardsPdfUrl);
 const history=read(d.historicalResourcesPath);assert.deepEqual(history.course,oldCourse);
 const previousSheets=[1,2,3].flatMap(n=>before(`sheets-${n}.json`)).filter(x=>x.courseId===d.courseId);
 const currentSheets=[1,2,3].flatMap(n=>read(`sheets-${n}.json`)).filter(x=>x.courseId===d.courseId);
 assert.deepEqual(history.sheets,previousSheets);assert.equal(currentSheets.length,previousSheets.length+1);
 assert.ok(previousSheets.every(x=>currentSheets.some(y=>isDeepStrictEqual(x,y))),'Ancienne fiche perdue ou modifiée');
 assert.equal(currentSheets.filter(x=>x.resourceId===d.sheetResourceId).length,1);
 for(const [file,key] of [['vocals.json','vocals'],['infographics.json','infographics']]){
  const old=before(file).filter(x=>x.courseId===d.courseId),now=read(file).filter(x=>x.courseId===d.courseId);
  assert.deepEqual(now,old,'Ressource historique modifiée : '+file);assert.deepEqual(history[key],old);
 }
 const oldVocabulary=before('vocabulaire-v1.json'),newVocabulary=read('vocabulaire-v1.json');
 assert.deepEqual({...newVocabulary,entries:newVocabulary.entries.slice(0,oldVocabulary.entries.length)},oldVocabulary);
 assert.deepEqual(history.vocabulary,oldVocabulary.entries.filter(v=>v.courseIds?.includes(d.courseId)));
 const oldQuestions=before('questions-5.json'),newQuestions=read('questions-5.json');
 assert.deepEqual(newQuestions.slice(0,oldQuestions.length),oldQuestions,'Questions historiques altérées');
 assert.deepEqual(newQuestions.slice(oldQuestions.length),read(d.qcmBank),'Ajouts hors banque approuvée');
 return true;
}
