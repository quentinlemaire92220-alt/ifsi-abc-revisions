// Audio interactif seul : aucune fiche, aucun lexique interactif ou pack fictif.
// Les preuves détaillées restent privées ; ce contrat vérifie leurs résumés liés aux octets.
import assert from 'node:assert/strict';
const sha=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x);
export function validateInteractiveAudioReview(record,vocals){
 const q=record.interactiveAudioReview;
 assert.equal(q?.contract,'interactive_audio_v1','Contrat QA vocal absent');
 assert.equal(q.status,'reviewed','Revue audio inachevée');
 assert.equal(q.documentaryReview,'completed','Revue documentaire non effectuée');
 assert.equal(q.listeningReview,'completed','Écoute finale non effectuée');
 assert.equal(q.privateSourcesPreserved,true,'Sources privées non préservées');
 assert.ok(sha(q.privateEvidenceSha256),'Preuve privée non identifiée');
 assert.ok(Array.isArray(q.episodes)&&q.episodes.length===record.vocalIds.length,'Couverture QA audio incomplète');
 assert.equal(new Set(q.episodes.map(x=>x.vocalId)).size,q.episodes.length,'QA dupliquée');
 for(const id of record.vocalIds){
  const v=vocals.find(x=>x.id===id),a=q.episodes.find(x=>x.vocalId===id);
  assert.ok(v&&a,'Vocal ou QA absent : '+id);
  assert.equal(v.courseId,record.courseId,'Rattachement QA incorrect');
  assert.ok(sha(a.audioSha256)&&sha(a.scriptSha256),'Empreinte QA absente');
  assert.equal(a.audioSha256,record.artifactSha256s?.[v.driveId],'QA portant sur un autre MP3');
  assert.ok(Number.isFinite(a.durationSeconds)&&a.durationSeconds>0&&a.durationSeconds<600,'Plafond strict de 10 minutes');
  assert.equal(a.durationSeconds,v.durationSeconds,'Durée QA et catalogue divergentes');
  assert.equal(a.questionCount,20,'20 questions corrigées attendues');
  assert.equal(a.reflectionPauseCount,20,'Pauses de réflexion incomplètes');
  assert.equal(a.transitionPauseCount,20,'Pauses de transition incomplètes');
  assert.equal(a.adaptivePauses,true,'Pauses uniformes non conformes');
  assert.equal(a.introductionUnitSemesterCourseEpisode,true,'Introduction incomplète');
  assert.equal(a.synthesisBeforeLexicon,true,'Synthèse mal placée');
  assert.equal(a.lexiconLast,true,'Définitions hors de la dernière section');
  assert.ok(Number.isInteger(a.definitionCount)&&a.definitionCount>=4,'Définitions finales absentes');
  assert.equal(a.sourceLimitationsVisible,true,'Réserves de source masquées');
 }
 return true;
}
export function validateInteractiveAudioOnly(course,d,vocals){
 assert.equal(d.audioOnlyContract,'interactive_audio_v1');
 assert.equal(d.deliveryMode,'audio_only');assert.equal(d.status,'partial');
 assert.equal(d.validated,true,'Livraison audio non validée');
 assert.equal(d.publicationScope,'audio_only','Portée limitée à l’audio attendue');
 assert.equal(d.publicationApproval?.status,'approved','GO audio absent');
 assert.equal(d.publicationApproval?.authorization,'explicit_go_publication');
 assert.equal(d.publicationApproval?.scope,'audio_only');
 assert.equal(d.courseId,course.id);assert.equal(course.audioStatus,'available');
 assert.ok(d.blockers?.some(x=>x.resource==='revision_sheets'&&x.reason==='not_requested'),'Absence de fiche non déclarée');
 for(const field of ['sheetResourceId','qcmBank','qcmBanks','qcmDriveId','flashcardDriveId','vocalScripts','supportDriveId'])assert.equal(d[field],undefined,'Ressource hors portée audio : '+field);
 assert.deepEqual(d.infographicResourceIds||[],[],'Infographie hors portée audio');
 const rows=vocals.filter(v=>v.courseId===course.id);
 assert.equal(rows.length,d.vocals.length);assert.equal(course.audioCount,rows.length);
 assert.deepEqual(new Set(rows.map(v=>v.id)),new Set(d.vocals));
 assert.equal(d.folders?.['05']&&course.audioFolderUrl,'https://drive.google.com/drive/folders/'+d.folders['05']);
 assert.ok(d.sourceBasis&&['official_support','oral_transcript','official_support_and_transcript','reviewed_reference'].includes(d.sourceBasis.kind),'Provenance audio absente');
 assert.equal(d.sourceBasis.limitationsDeclared,true);
 if(!d.sourceBasis.nativeSupportAvailable){assert.equal(course.provisional,true);assert.ok(rows.every(v=>v.provisional===true),'Source limitée non signalée');}
 return validateInteractiveAudioReview({...d,vocalIds:d.vocals},vocals);
}
