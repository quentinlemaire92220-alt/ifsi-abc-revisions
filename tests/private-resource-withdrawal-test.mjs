import {verifyOfficialCourseReconciliation} from './official-course-reconciliation-contract.mjs';
// Sécurisation P0 : teste la DIFF RÉELLE vs main, non un jeu de données fictif.
// Aucun nom/ID de source de travail n'est ajouté à ce fichier public.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {isDeepStrictEqual} from 'node:util';
import {verifyPublicArtifact} from '../tools/public-artifact-contract.mjs';
import {runInNewContext} from 'node:vm';
import {
 isScriptWorkItem,expectedPublicCourseAfterWithdrawal,
 expectedPublicDeliveryAfterWithdrawal,isApprovedPrivateReferenceWithdrawal
} from './private-resource-withdrawal-lib.mjs';
import {publicationBundle,bundleDigest,validateChangedDeliveries,isStrictAudioSupplementOnly} from './course-publication-approval-lib.mjs';
import {validateRevisionSheetSupplement} from './revision-sheet-supplement-contract.mjs';
import {validateAudioSupplements,validateFirstReleaseAudio} from './audio-supplement-contract.mjs';

const clone=x=>JSON.parse(JSON.stringify(x));
const disk=file=>JSON.parse(readFileSync(file,'utf8'));
const base=process.env.IFSI_BASE_SHA||'HEAD~1';
assert.match(base,/^(?:HEAD~1|[0-9a-f]{7,40})$/i);
const before=file=>JSON.parse(execFileSync('git',['show',base+':'+file],{encoding:'utf8',maxBuffer:16*1024*1024}));
const oldReg=before('course-registry-v741.json'),currentReg=disk('course-registry-v741.json');
const oldMan=before('docs/course-deliveries.json'),currentMan=disk('docs/course-deliveries.json');

const visibilitySource=readFileSync('v74-pack.js','utf8');
const visibilityStart=visibilitySource.indexOf('const studentVisibleDocument74=');
const visibilityEnd=visibilitySource.indexOf('function renderCourse74()',visibilityStart);
assert.ok(visibilityStart>=0&&visibilityEnd>visibilityStart);
const visible=runInNewContext(visibilitySource.slice(visibilityStart,visibilityEnd)+'\nstudentVisibleDocument74;');
const without=(value,keys)=>Object.fromEntries(Object.entries(value).filter(([key])=>!keys.includes(key)));
const publicDocuments=c=>(c.additionalDocuments||[]).filter(d=>!isScriptWorkItem(d));
// Publication provisoire TD3 après réception du support officiel : seules
// la provenance et la fiche approuvée changent ; QCM/cartes restent identiques.
function preserveApprovedTD3OfficialSupport(oldCourse,nextCourse,oldDelivery,nextDelivery){
 const id='theorie_gestion_symptomes_td';
 assert.equal(oldCourse.id,id);assert.equal(nextCourse.id,id);
 assert.equal(oldCourse.officialSupport,false);assert.equal(nextCourse.officialSupport,true);
 assert.equal(nextCourse.provisional,true);assert.equal(nextCourse.sourceStatus,'provisional');
 assert.ok(nextCourse.sourceNote.includes('Support officiel du TD') &&
   nextCourse.sourceNote.includes('Audio original non contrôlé'),
   id+': arrivée du support et réserve audio insuffisamment documentées');
 const expected=expectedPublicCourseAfterWithdrawal(oldCourse);
 assert.deepEqual(without(nextCourse,['officialSupport','sourceNote']),
   without(expected,['officialSupport','sourceNote']),id+': identité ou ressource historique modifiée');
 assert.deepEqual(publicDocuments(nextCourse),publicDocuments(oldCourse),id+': document étudiant historique modifié');
 assert.equal(nextDelivery.publicationApproval?.status,'approved');
 assert.equal(nextDelivery.publicationApproval?.authorization,'explicit_go_publication');
 assert.equal(nextDelivery.publicationApproval?.scope,'course_package');
 assert.notDeepEqual(nextDelivery.publicationApproval,oldDelivery.publicationApproval);
 assert.equal(nextDelivery.status,'partial');assert.equal(nextDelivery.provisional,true);
 assert.equal(nextDelivery.pedagogicalValidated,false);
 assert.equal(nextDelivery.sourceBasis?.kind,'official_support_and_transcript');
 assert.equal(nextDelivery.sourceBasis.nativeSupportAvailable,true);
 assert.equal(nextDelivery.sourceAudit?.officialChecked,true);
 assert.equal(nextDelivery.sourceAudit?.officialSupportMissing,false);
 assert.equal(nextDelivery.sourceAudit?.oralCoverageExhaustive,false);
 assert.equal(nextDelivery.sourceAudit?.oralStatus,'unverified');
 assert.ok(nextDelivery.blockers?.some(b=>b.reason==='oral_source_unverified'));
 assert.equal(nextDelivery.pedagogicalNonRegression?.sourceCoverage,'limited');
 assert.equal(nextDelivery.visualOwnerReview?.status,'owner_accepted');
 assert.equal(nextDelivery.templateConformance?.artifacts?.sheet?.status,'owner_accepted');
 for(const role of ['qcm','flashcards'])
  assert.deepEqual(nextDelivery.publicArtifacts?.[role],oldDelivery.publicArtifacts?.[role],
   id+': PDF historique '+role+' modifié');
 const before=oldDelivery.publicArtifacts?.sheet,after=nextDelivery.publicArtifacts?.sheet;
 assert.equal(after?.path,before?.path);
 assert.ok(after?.sha256 && after.sha256!==before?.sha256,id+': fiche révisée absente');
 assert.equal(after.sha256,nextDelivery.writtenPdfAudit?.pdfSha256);
 assert.equal(after.sha256,nextDelivery.templateConformance?.artifacts?.sheet?.artifactSha256);
 assert.equal(after.sha256,nextDelivery.pedagogicalNonRegression?.sheetSha256);
 for(const field of ['qcmBank','qcmCount','flashcardCount','vocabularyCount','sheetResourceId'])
  assert.deepEqual(nextDelivery[field],oldDelivery[field],id+': ressource historique modifiée '+field);
 for(const field of ['vocals','infographicResourceIds','vocalScripts'])
  assert.deepEqual(nextDelivery[field],oldDelivery[field],id+': contenu ajouté hors fiche '+field);
 for(const role of ['qcm','flashcards'])
  assert.equal(nextDelivery.artifactSha256s?.[nextDelivery.publicArtifacts[role].artifactId],
   oldDelivery.artifactSha256s?.[oldDelivery.publicArtifacts[role].artifactId],
   id+': empreinte historique '+role+' modifiée');
}
function preserveApprovedAddition(oldCourse,nextCourse,oldDelivery,nextDelivery){
 const id=oldCourse.id,approval=nextDelivery.publicationApproval;
 assert.equal(approval?.status,'approved',id+': complément sans approbation');
 assert.equal(approval.authorization,'explicit_go_publication',id+': GO explicite absent');
 assert.equal(approval.scope,'course_package',id+': portée du complément incorrecte');
 assert.notDeepEqual(approval,oldDelivery.publicationApproval,id+': accord historique réutilisé');
 assert.deepEqual(without(nextCourse,['additionalDocuments','flashcardTarget']),
  without(expectedPublicCourseAfterWithdrawal(oldCourse),['additionalDocuments','flashcardTarget']),id+': support ou identité historique modifié');
 const historical=publicDocuments(oldCourse),current=nextCourse.additionalDocuments||[];
 assert.deepEqual(current.filter(d=>historical.some(o=>isDeepStrictEqual(o,d))),historical,id+': document étudiant historique perdu ou modifié');
 for(const doc of current){
  assert.ok(visible(doc)&&!isScriptWorkItem(doc),id+': réinjection de document privé');
  if(historical.some(o=>isDeepStrictEqual(o,doc)))continue;
  const fileId=String(doc.url||'').match(/^https:\/\/drive\.google\.com\/file\/d\/([\w-]+)\/view(?:\?|$)/)?.[1];
  assert.ok(fileId,id+': complément sans fichier Drive identifié');
  assert.match(nextDelivery.artifactSha256s?.[fileId]||'',/^[a-f0-9]{64}$/,id+': complément non lié au package examiné');
 }
 if(nextCourse.flashcardTarget!==oldCourse.flashcardTarget){
  assert.ok(Number.isInteger(nextCourse.flashcardTarget)&&nextCourse.flashcardTarget>oldCourse.flashcardTarget,id+': cartes historiques tronquées');
  assert.equal(nextCourse.flashcardTarget,nextDelivery.flashcardCount,id+': nombre de cartes divergent');
 }
 const expected=expectedPublicDeliveryAfterWithdrawal(oldDelivery,oldCourse);
 const additiveFields=['status','blockers','qcmBanks','qcmCount','flashcardCount','scriptsPreparedCount','artifactSha256s','partDeliveries','publicationApproval'];
 assert.deepEqual(without(nextDelivery,additiveFields),without(expected,additiveFields),id+': ressource historique modifiée hors complément');
 for(const [fileId,sha] of Object.entries(expected.artifactSha256s||{}))
  assert.equal(nextDelivery.artifactSha256s?.[fileId],sha,id+': empreinte historique modifiée');
 const previousBanks=expected.qcmBanks||[expected.qcmBank].filter(Boolean);
 assert.ok(previousBanks.every(p=>(nextDelivery.qcmBanks||[nextDelivery.qcmBank]).includes(p)),id+': ancienne banque retirée');
 assert.ok(nextDelivery.qcmCount>=expected.qcmCount&&nextDelivery.flashcardCount>=expected.flashcardCount,id+': contenu historique tronqué');
}

// Passage provisoire strict : nouveau support officiel et fiche v1.49, sans
// prétendre à une validation clinique exhaustive ou migrer le reste du cours.
// Cette porte ne remplace pas la revue V3, la matrice v1.49 et le digest du GO,
// tous contrôlés séparément par course-publication-approval.mjs.
function preserveApprovedProvisionalWrittenRevision(oldCourse,nextCourse,oldDelivery,nextDelivery){
 const id=oldCourse.id;
 assert.equal(id,'theorie_gestion_symptomes_td','Seul le TD3 examiné est admis par cette porte');
 assert.equal(oldCourse.officialSupport,false,'Le support était déjà officiel : pas de transition');
 assert.equal(nextCourse.officialSupport,true,'Support officiel du TD non enregistré');
 assert.equal(nextCourse.sourceStatus,'provisional','Ne pas masquer la réserve pédagogique');
 assert.equal(nextCourse.provisional,true,'TD sans audio vérifié reste provisoire');
 assert.deepEqual(without(nextCourse,['officialSupport','sourceNote']),
  without(oldCourse,['officialSupport','sourceNote']),'Identité, documents ou QCM historiques modifiés');
 assert.match(nextCourse.sourceNote||'',/support officiel/i);
 assert.match(nextCourse.sourceNote||'',/audio original non contr[oô]l[eé]/i);
 assert.equal(nextDelivery.packFormat,'written_v1');
 assert.equal(nextDelivery.status,'partial','Cours partiel déclaré complet sans preuve');
 assert.equal(nextDelivery.provisional,true);
 assert.equal(nextDelivery.pedagogicalValidated,false);
 assert.equal(nextDelivery.sourceAudit?.oralStatus,'unverified');
 assert.equal(nextDelivery.sourceAudit?.oralCoverageExhaustive,false);
 assert.equal(nextDelivery.sourceAudit?.officialChecked,true);
 assert.equal(nextDelivery.sourceBasis?.nativeSupportAvailable,true);
 assert.equal(nextDelivery.sourceBasis?.reconciled,false,'Audio non vérifié : pas de réconciliation exhaustive');
 assert.ok((nextDelivery.blockers||[]).some(b=>b.resource==='audio'&&b.reason==='oral_source_unverified'),
  'Réserve audio historique effacée');
 assert.equal(nextDelivery.publicationApproval?.status,'approved');
 assert.equal(nextDelivery.publicationApproval?.authorization,'explicit_go_publication');
 assert.equal(nextDelivery.publicationApproval?.scope,'course_package');
 assert.equal(nextDelivery.publicationApproval?.provisionalOnly,true);
 assert.notDeepEqual(nextDelivery.publicationApproval,oldDelivery.publicationApproval);
 assert.equal(nextDelivery.pedagogicalNonRegression?.contract,'ifsi_pedagogical_non_regression_v149');
 assert.equal(nextDelivery.pedagogicalNonRegression?.sourceCoverage,'limited');
 assert.equal(nextDelivery.templateConformance?.contract,'ifsi_pdf_template_v3');
 assert.equal(nextDelivery.templateConformance?.artifacts?.sheet?.status,'owner_accepted');
 for(const field of ['courseId','sheetResourceId','qcmBank','qcmCount','flashcardCount','vocabularyCount','packFormat','publicationHost','vocals','infographics','qcmBanks','vocalScripts','partDeliveries','scriptsPreparedCount']){
  assert.deepEqual(nextDelivery[field],oldDelivery[field],id+': ressource historique modifiée : '+field);
 }
 for(const role of ['qcm','flashcards']){
  assert.deepEqual(nextDelivery.publicArtifacts?.[role],oldDelivery.publicArtifacts?.[role],
   id+': PDF historique modifié sans revue : '+role);
 }
 const beforePdf=oldDelivery.publicArtifacts?.sheet,afterPdf=nextDelivery.publicArtifacts?.sheet;
 assert.equal(afterPdf?.path,beforePdf?.path,'La fiche quitte son ancien emplacement');
 assert.notEqual(afterPdf?.sha256,beforePdf?.sha256,'Aucune nouvelle version de fiche');
 assert.equal(nextDelivery.publicAssetSha256,afterPdf.sha256);
 assert.equal(nextDelivery.artifactSha256s?.[afterPdf.artifactId],afterPdf.sha256);
 assert.equal(nextDelivery.writtenPdfAudit?.pdfSha256,afterPdf.sha256);
 assert.equal(nextDelivery.visualOwnerReview?.reviewedPdfSha256s?.[nextDelivery.sheetResourceId],afterPdf.sha256);
 assert.equal(nextDelivery.templateConformance?.artifacts?.sheet?.artifactSha256,afterPdf.sha256);
 const oldSheets=[1,2,3].flatMap(n=>before('sheets-'+n+'.json')).filter(s=>s.courseId===id);
 const newSheets=[1,2,3].flatMap(n=>disk('sheets-'+n+'.json')).filter(s=>s.courseId===id);
 assert.equal(oldSheets.length,newSheets.length,'Nombre historique de fiches changé');
 for(let i=0;i<oldSheets.length;i++){
  assert.equal(newSheets[i].resourceId,oldSheets[i].resourceId);
  if(newSheets[i].resourceId!==nextDelivery.sheetResourceId){
   assert.deepEqual(newSheets[i],oldSheets[i],'Fiche d’une autre partie modifiée');
   continue;
  }
  assert.deepEqual(without(newSheets[i],['officialSupport','sourceBasis','pageCount']),
   without(oldSheets[i],['officialSupport','sourceBasis','pageCount']),
   'Publication de fiche altérée au-delà du support et de sa pagination');
  assert.equal(newSheets[i].officialSupport,true);
  assert.equal(newSheets[i].pageCount,afterPdf.pageCount);
  assert.match(newSheets[i].sourceBasis||'',/audio original non v[eé]rifi[eé]/i);
 }
 assert.deepEqual(before(oldDelivery.qcmBank),disk(oldDelivery.qcmBank),
  'Banque QCM ou flashcards historiques modifiées');
 const oldArtifacts=oldDelivery.artifactSha256s||{},newArtifacts=nextDelivery.artifactSha256s||{};
 assert.deepEqual(Object.keys(newArtifacts).sort(),Object.keys(oldArtifacts).sort(),
  'Une nouvelle ressource non prévue a été ajoutée');
 for(const key of Object.keys(oldArtifacts))if(key!==afterPdf.artifactId)
  assert.equal(newArtifacts[key],oldArtifacts[key],'Empreinte ancienne modifiée : '+key);
 return true;
}

// Complément QCM d'un cours déjà visible avant l'introduction du manifeste des livraisons.
// N'autorise ni nouvelle fiche ni MP3 ni autre mutation du cours historique.
function preserveApprovedFirstManifestAddition(oldCourse,nextCourse,nextDelivery){
 const id=oldCourse.id;
 assert.equal(id,'psychologie_sante','Premier manifeste permis seulement pour la revue actuelle');
 assert.equal(nextDelivery.courseId,id);
 assert.equal(nextDelivery.deliveryMode,'existing_course_revision');
 assert.equal(nextDelivery.publicationSubset,'qcm_pdf_50_qcm_59_interactive_flashcards_only');
 assert.equal(nextDelivery.publicationApproval?.status,'approved');
 assert.equal(nextDelivery.publicationApproval.authorization,'explicit_go_publication');
 assert.equal(nextDelivery.publicationApproval.scope,'course_package');
 assert.deepEqual(without(nextCourse,['additionalDocuments','flashcardTarget']),
  without(expectedPublicCourseAfterWithdrawal(oldCourse),['additionalDocuments','flashcardTarget']),
  id+': identité ou ressources historiques modifiées');
 assert.equal(nextCourse.flashcardTarget,59,'Nombre de cartes divergent');
 const historical=publicDocuments(oldCourse),current=nextCourse.additionalDocuments||[];
 assert.deepEqual(current.filter(d=>historical.some(o=>isDeepStrictEqual(o,d))),historical,
  id+': document étudiant historique modifié');
 const fresh=current.filter(d=>!historical.some(o=>isDeepStrictEqual(o,d)));
 assert.equal(fresh.length,1,id+': seul le PDF QCM a reçu un GO graphique');
 for(const doc of fresh){
  assert.ok(visible(doc)&&!isScriptWorkItem(doc),id+': fichier de travail interdit');
  const assetId=verifyPublicArtifact(nextDelivery,doc.url);
  assert.equal(assetId,'psychologie_sante_qcm_v3_19p_20261027');
  assert.equal(nextDelivery.artifactSha256s[assetId],
   '2d251cee59f5ceaa7657e88079a21db4718329e727c2b6d16ce7ce208b4f570c');
 }
 assert.equal(nextDelivery.qcmCount,50);
 assert.equal(nextDelivery.flashcardCount,59);
 assert.equal(nextDelivery.partDeliveries?.length,1);
 assert.equal(nextDelivery.partDeliveries[0].qcmQuestionIds?.length,50);
 assert.deepEqual(nextDelivery.partDeliveries[0].sheetResourceIds,[],'Nouvelle fiche sans revue');
 assert.deepEqual(nextDelivery.partDeliveries[0].vocalIds,[],'Nouveaux MP3 non validés');
}

const approvedUpdates=new Set(currentMan.courses.filter(c=>{
 const old=oldMan.courses.find(p=>p.courseId===c.courseId);
 if(!isDeepStrictEqual(c.publicationApproval,old?.publicationApproval))return true;
 const a=c.qcmFlashcardsSupplement;
 return !!(c.courseId==='gestion_stress_professionnel'&&!old?.qcmFlashcardsSupplement&&a?.publicationApproval?.status==='approved'&&a?.publicationApproval?.authorization==='explicit_go_publication'&&a?.publicationApproval?.scope==='qcm_flashcards_vocabulary_only');
}).map(c=>c.courseId));
// Des MP3 nouveaux sont acceptés ici seulement si leur ajout est strictement
// indépendant du dossier pédagogique et signé par un nouveau GO audio.
const prevVocals=before('vocals.json'),nextVocals=disk('vocals.json');
assert.deepEqual(nextVocals.slice(0,prevVocals.length),prevVocals,'Aucun MP3 historique ne doit changer');
const prevAudio=oldMan.audioSupplements||[],nextAudio=currentMan.audioSupplements||[];
assert.deepEqual(nextAudio.slice(0,prevAudio.length),prevAudio,'Compléments audio historiques altérés');
const freshAudio=nextAudio.slice(prevAudio.length);
const firstReleaseAudioIds=validateFirstReleaseAudio(oldMan,currentMan,oldReg,currentReg,prevVocals,nextVocals);
const expectedAudioIds=[...freshAudio.flatMap(p=>p.vocalIds||[]),...firstReleaseAudioIds];
assert.deepEqual(nextVocals.slice(prevVocals.length).map(v=>v.id).sort(),expectedAudioIds.slice().sort(),
 'Le catalogue doit contenir exactement les MP3 nouvellement approuvés');
const baseAudioData={registry:oldReg,vocals:prevVocals,sheets:[1,2,3].flatMap(n=>before('sheets-'+n+'.json')),
 infographics:before('infographics.json'),vocabulary:before('vocabulaire-v1.json').entries,banks:{},imageHashes:{}};
const nowAudioData={registry:currentReg,vocals:nextVocals,sheets:[1,2,3].flatMap(n=>disk('sheets-'+n+'.json')),
 infographics:disk('infographics.json'),vocabulary:disk('vocabulaire-v1.json').entries,banks:{},imageHashes:{}};
validateAudioSupplements(currentMan,nowAudioData);
const audioOnlyUpdates=new Set();
for(const pack of freshAudio){
 assert.ok(!audioOnlyUpdates.has(pack.courseId),'Au plus un complément ajouté par cours dans ce lot');
 const prior=oldMan.courses.find(c=>c.courseId===pack.courseId);
 const updated=currentMan.courses.find(c=>c.courseId===pack.courseId);
 // Certains sous-cours ont des ressources actives depuis longtemps mais pas de manifeste
 // historique de package. Le GO audio ne doit jamais autoriser une autre mutation.
 if(!prior&&!updated){
  const id=pack.courseId;
  const was=oldReg.courses.find(c=>c.id===id),now=currentReg.courses.find(c=>c.id===id);
  assert.ok(was&&now,'Complément MP3 sur un cours inconnu');
  assert.ok(baseAudioData.sheets.some(r=>r.courseId===id)||baseAudioData.infographics.some(r=>r.courseId===id)||(was.officialSupportUrl&&was.officialSupportUrl===now.officialSupportUrl),
    id+': le cours doit avoir des ressources déjà publiées avant un complément audio');
  const strip=x=>without(x,['audioStatus','audioCount','audioFolderUrl']);
  assert.deepEqual(strip(now),strip(was),id+': modification non audio du sous-cours');
  const oldVoices=prevVocals.filter(v=>v.courseId===id),newVoices=nextVocals.filter(v=>v.courseId===id);
  assert.deepEqual(newVoices.slice(0,oldVoices.length),oldVoices,id+': vocaux historiques modifiés');
  assert.deepEqual(newVoices.slice(oldVoices.length).map(v=>v.id),pack.vocalIds,id+': IDs audio non conformes');
  assert.equal(now.audioStatus,'available',id+': statut vocal erroné');
  assert.equal(now.audioCount,newVoices.length,id+': nombre de vocaux erroné');
  assert.equal(now.audioFolderUrl,'https://drive.google.com/drive/folders/'+pack.folderId,id+': dossier audio erroné');
 } else {
  assert.ok(prior&&updated,'Livraison audio historique incomplète');
  assert.ok(isStrictAudioSupplementOnly(pack.courseId,prior,updated,baseAudioData,nowAudioData,oldMan,currentMan),
   'Ajout audio insuffisamment isolé ou sans validation : '+pack.courseId);
 }
 audioOnlyUpdates.add(pack.courseId);
}
const removed=oldReg.courses.reduce((n,c)=>n+(c.additionalDocuments||[]).filter(isScriptWorkItem).length,0);
if(approvedUpdates.size){
 // Une publication ultérieure est contrôlée comme un vrai package ; elle ne
 // bénéficie jamais de l'exemption réservée au retrait PURE de références.
 assert.equal(removed,0,'Ne pas mélanger retrait initial et publication pédagogique');
 execFileSync(process.execPath,['tests/course-publication-approval.mjs'],
  {env:{...process.env,IFSI_BASE_SHA:base},maxBuffer:32*1024*1024,stdio:'pipe'});
}

// Le socle évolue : conserver tous les IDs du commit de base au lieu d'imposer 50 cours.
assert.ok(oldReg.courses.length>=50,'Snapshot historique P0 : moins de 50 cours dans la base');
const historicIds=new Set(oldReg.courses.map(c=>c.id));
assert.equal(new Set(currentReg.courses.map(c=>c.id)).size,currentReg.courses.length,'Cours dupliques dans le registre');
const newCourses=currentReg.courses.filter(c=>!historicIds.has(c.id));
assert.equal(currentReg.courses.length,oldReg.courses.length+newCourses.length,'Cours historique supprime');
for(const course of newCourses){
 assert.ok(approvedUpdates.has(course.id),'Nouveau cours sans validation package : '+course.id);
 assert.ok(currentMan.courses.some(c=>c.courseId===course.id),'Nouveau cours sans manifeste : '+course.id);
}
const registryForWithdrawal=clone(currentReg.courses.filter(c=>historicIds.has(c.id)));
for(const course of registryForWithdrawal)if(audioOnlyUpdates.has(course.id)){
 const beforeCourse=oldReg.courses.find(c=>c.id===course.id);
 assert.ok(beforeCourse,'Cours sans historique pour complément MP3');
 Object.keys(course).forEach(k=>delete course[k]);
 Object.assign(course,expectedPublicCourseAfterWithdrawal(beforeCourse));
}
for(const course of registryForWithdrawal)if(approvedUpdates.has(course.id)){
 const oldCourse=oldReg.courses.find(c=>c.id===course.id);
 assert.ok(oldCourse,'Complément sans cours historique');
 if(currentMan.courses.find(c=>c.courseId===course.id)?.reconciliation?.type==='provisional_to_official_v1')verifyOfficialCourseReconciliation(course.id,base);
 else {
  const previousDelivery=oldMan.courses.find(c=>c.courseId===course.id);
  const nextDelivery=currentMan.courses.find(c=>c.courseId===course.id);
  if(course.id==='gestion_stress_professionnel'&&nextDelivery?.qcmFlashcardsSupplement){
   assert.equal(nextDelivery.qcmFlashcardsSupplement?.publicationApproval?.status,'approved');
   assert.equal(nextDelivery.qcmFlashcardsSupplement?.publicationApproval?.scope,'qcm_flashcards_vocabulary_only');
   assert.deepEqual(course.additionalDocuments.slice(0,oldCourse.additionalDocuments.length),oldCourse.additionalDocuments,'Fiche historique perdue');
   assert.equal(course.additionalDocuments.length,oldCourse.additionalDocuments.length+2,'Seulement deux PDFs nouveaux');
   const clean=x=>{const y={...x};for(const k of ['additionalDocuments','sourceNote','flashcardTarget','authoredFlashcards'])delete y[k];return y;};
   assert.deepEqual(clean(course),clean(oldCourse),'Cours historique muté hors QCM/cartes');
   assert.equal(course.flashcardTarget,50);
   assert.equal(course.authoredFlashcards,true);
  }
  else if(course.id==='theorie_gestion_symptomes_td' && previousDelivery)preserveApprovedTD3OfficialSupport(oldCourse,course,previousDelivery,nextDelivery);
  else if(course.id==='theorie_gestion_symptomes_td' && nextDelivery?.pedagogicalNonRegression?.contract==='ifsi_pedagogical_non_regression_v149')
    preserveApprovedProvisionalWrittenRevision(oldCourse,course,previousDelivery,nextDelivery);
   else if(previousDelivery)preserveApprovedAddition(oldCourse,course,previousDelivery,nextDelivery);
  else preserveApprovedFirstManifestAddition(oldCourse,course,nextDelivery);
 }
 Object.keys(course).forEach(k=>delete course[k]);Object.assign(course,expectedPublicCourseAfterWithdrawal(oldCourse));
}
assert.deepEqual(registryForWithdrawal,oldReg.courses.map(expectedPublicCourseAfterWithdrawal),
 'Registre : changement hors retrait pur ou complément approuvé');
assert.deepEqual(Object.keys(currentReg),Object.keys(oldReg),'Structure du registre modifiée');
assert.equal(currentReg.version,disk('build-meta.json').version,'Version du registre alignée sur la release courante');
assert.ok([0,10].includes(removed),'Retrait initial ou état déjà expurgé attendu');
const preservedDocumentCount=oldReg.courses.reduce((n,c)=>n+publicDocuments(c).length,0);
const addedDocumentCount=currentReg.courses.reduce((n,c)=>n+(c.additionalDocuments||[]).filter(d=>
 !publicDocuments(oldReg.courses.find(o=>o.id===c.id)||{}).some(o=>isDeepStrictEqual(o,d))).length,0);
assert.equal(currentReg.courses.reduce((n,c)=>n+(c.additionalDocuments||[]).length,0),preservedDocumentCount+addedDocumentCount);
assert.ok(currentReg.courses.every(c=>(c.additionalDocuments||[]).every(d=>!isScriptWorkItem(d))),
 'Scripts encore dans la liste publique');

const oldCourses=new Map(oldReg.courses.map(c=>[c.id,c]));
const expectedMan=clone(oldMan);
let removedScripts=0,removedFolders=0;
for(const delivery of expectedMan.courses){
 const old=oldMan.courses.find(x=>x.courseId===delivery.courseId);
 removedScripts+=(old.vocalScripts||[]).length;
 for(const key of ['08','99'])if(old.folders?.[key])removedFolders++;
 const updated=expectedPublicDeliveryAfterWithdrawal(old,oldCourses.get(old.courseId));
 Object.keys(delivery).forEach(k=>delete delivery[k]);
 Object.assign(delivery,updated);
}
assert.ok([0,20].includes(removedScripts),'Retrait initial ou état déjà expurgé attendu');
assert.ok([0,14].includes(removedFolders),'Retrait initial ou état déjà expurgé attendu');
const actualMan=clone(currentMan);
const newDeliveryIds=new Set(currentMan.courses.filter(c=>!oldMan.courses.some(o=>o.courseId===c.courseId)).map(c=>c.courseId));
for(const id of newDeliveryIds){
 assert.ok(approvedUpdates.has(id),'Lot de cours ajoute sans approbation : '+id);
 const existingCourseFirstManifest=(id==='psychologie_sante' &&
  oldReg.courses.some(c=>c.id===id) &&
  currentMan.courses.some(c=>c.courseId===id &&
   c.deliveryMode==='existing_course_revision' &&
   c.publicationSubset==='qcm_pdf_50_qcm_59_interactive_flashcards_only'));
 assert.ok(newCourses.some(c=>c.id===id)||existingCourseFirstManifest,
  'Lot nouveau orphelin : '+id);
}
actualMan.courses=actualMan.courses.filter(c=>!newDeliveryIds.has(c.courseId));
const sheets=[1,2,3].flatMap(n=>disk('sheets-'+n+'.json'));
for(const c of actualMan.courses){
 const previous=expectedMan.courses.find(x=>x.courseId===c.courseId);
 if(audioOnlyUpdates.has(c.courseId)){
  Object.keys(c).forEach(k=>delete c[k]);Object.assign(c,clone(previous));continue;
 }
 if(approvedUpdates.has(c.courseId)){
  // Les seules différences admises ont passé la préservation ci-dessus et
  // le digest complet du package ; l'ancien manifeste reste la référence P0.
  Object.keys(c).forEach(k=>delete c[k]);Object.assign(c,clone(previous));continue;
 }
 if(!isDeepStrictEqual(c.revisionSheetSupplement,previous.revisionSheetSupplement)){
  validateRevisionSheetSupplement(c.courseId,c,{sheets});
  // Autorisation additive propre à la fiche, contrôlée aussi par le garde-fou
  // différentiel complet ; ne pas réécrire l'approbation historique.
  delete c.revisionSheetSupplement;delete previous.revisionSheetSupplement;
 }
}
// Les compléments approuvés sont vérifiés séparément plus haut ; retirer seulement
// leurs nouvelles entrées de la comparaison du manifeste pédagogique historique.
actualMan.audioSupplements=clone(prevAudio);
assert.deepEqual(actualMan,expectedMan,
 'Manifeste : seule la révocation des pointeurs de travail, et les comptes sourcés, sont permises');
assert.equal(currentMan.courses.length,oldMan.courses.length+newDeliveryIds.size,'Livraison historique supprimée ou nouvelle livraison orpheline');
for(const c of currentMan.courses){
 assert.equal(c.vocalScripts,undefined,'Scripts privés présents dans le manifeste');
 for(const key of ['08','99'])assert.equal(c.folders?.[key],undefined,'Dossier interne présent dans le manifeste');
 if(!approvedUpdates.has(c.courseId))assert.deepEqual(c.publicationApproval,oldMan.courses.find(x=>x.courseId===c.courseId).publicationApproval,
  'Une approbation approuvée ne doit pas être réécrite');
}
assert.deepEqual(currentMan.audioSupplements.slice(0,prevAudio.length),prevAudio,'MP3 historiques ou leurs validations modifiés');
assert.equal(currentMan.audioSupplements.length,prevAudio.length+freshAudio.length,'Compléments audio non autorisés');

// La même règle doit rejeter toute mutation masquée d'un cours, corrigé ou PDF.
const course={id:'demo',label:'Démo',additionalDocuments:[
 {label:'Scripts vocaux',url:'https://drive.google.com/file/d/TEST_SCRIPT/view'},
 {label:'Fiche de révision',url:'https://drive.google.com/file/d/TEST_PDF/view'}
]};
const delivery={courseId:'demo',qcmBank:'qdemo.json',qcmCount:1,flashcardCount:1,
 vocalScripts:[{number:1,driveId:'TEST_SCRIPT',url:'https://drive.google.com/file/d/TEST_SCRIPT/view'}],
 folders:{'08':'TEST_WORK_FOLDER','02':'TEST_PDF_FOLDER'},
 artifactSha256s:{TEST_SCRIPT:'a'.repeat(64),TEST_PDF:'b'.repeat(64)},
 publicationApproval:{status:'approved',authorization:'explicit_go_publication',
 scope:'course_package',approvedAt:'2026-10-20T12:00:00Z',bundleSha256:'f'.repeat(64)}};
const makeData=()=>({registry:{courses:[clone(course)]},sheets:[{courseId:'demo',resourceId:'sheet',
 driveId:'TEST_PDF',url:'https://drive.google.com/file/d/TEST_PDF/view'}],
 infographics:[],vocals:[],banks:{'qdemo.json':[{courseId:'demo',id:'Q1',answers:[1]}]},
 imageHashes:{},vocabulary:[]});
const oldData=makeData(),newData=makeData(),updatedDelivery=expectedPublicDeliveryAfterWithdrawal(delivery,course);
newData.registry.courses=[expectedPublicCourseAfterWithdrawal(course)];
const oldBundle=publicationBundle('demo',delivery,oldData),newBundle=publicationBundle('demo',updatedDelivery,newData);
assert.equal(isApprovedPrivateReferenceWithdrawal('demo',delivery,updatedDelivery,oldBundle,newBundle),true);
assert.equal(validateChangedDeliveries({courses:[delivery]},{courses:[updatedDelivery]},oldData,newData)[0].kind,
 'private_reference_withdrawal');
for(const mutate of [
 x=>{x.banks['qdemo.json'][0].answers=[0]},
 x=>{x.sheets[0].driveId='ANOTHER_PDF'},
 x=>{x.vocals.push({courseId:'demo',id:'v1',driveId:'NEW_MP3'})},
 x=>{x.registry.courses[0].additionalDocuments.push({label:'Nouvelle fiche',url:'https://drive.google.com/file/d/UNAPPROVED/view'})}
]){
 const bad=clone(newData);mutate(bad);
 assert.equal(isApprovedPrivateReferenceWithdrawal('demo',delivery,updatedDelivery,oldBundle,
  publicationBundle('demo',updatedDelivery,bad)),false,'Modification pédagogique non approuvée acceptée');
 assert.throws(()=>validateChangedDeliveries({courses:[delivery]},{courses:[updatedDelivery]},oldData,bad),
  /changé après validation|validation du package absente/);
}
for(const mutate of [
 x=>{x.publicationApproval={...x.publicationApproval,status:'pending'}},
 x=>{x.artifactSha256s.TEST_PDF='c'.repeat(64)},
 x=>{x.scriptsPreparedCount=99},
 x=>{x.folders['02']='ANOTHER_FOLDER'}
]){
 const bad=clone(updatedDelivery);mutate(bad);
 assert.equal(isApprovedPrivateReferenceWithdrawal('demo',delivery,bad,oldBundle,
   publicationBundle('demo',bad,newData)),false,'Modification de manifeste non autorisée acceptée');
}
assert.equal(isDeepStrictEqual(oldMan.courses.map(x=>x.courseId),currentMan.courses.filter(x=>!newDeliveryIds.has(x.courseId)).map(x=>x.courseId)),true);

// Cas séparé : un ajout approuvé ne devient pas une révocation pure. L'accord
// absent, le document privé et l'altération d'une ancienne empreinte restent refusés.
const oldCourse=clone(newData.registry.courses[0]),newCourse=clone(oldCourse);
newCourse.additionalDocuments.push({label:'Complément QCM',url:'https://drive.google.com/file/d/NEW_PUBLIC_PDF/view'});
const approvedData=clone(newData);approvedData.registry.courses=[newCourse];
const approvedDelivery=clone(updatedDelivery);approvedDelivery.artifactSha256s.NEW_PUBLIC_PDF='c'.repeat(64);
approvedDelivery.publicationApproval={...approvedDelivery.publicationApproval,approvedAt:'2026-10-23T12:00:00Z',
 bundleSha256:bundleDigest(publicationBundle('demo',approvedDelivery,approvedData))};
assert.equal(isApprovedPrivateReferenceWithdrawal('demo',updatedDelivery,approvedDelivery,newBundle,publicationBundle('demo',approvedDelivery,approvedData)),false);
assert.equal(validateChangedDeliveries({courses:[updatedDelivery]},{courses:[approvedDelivery]},newData,approvedData).length,1);
preserveApprovedAddition(oldCourse,newCourse,updatedDelivery,approvedDelivery);
for(const mutate of [
 (course,d)=>{d.publicationApproval.status='pending'},
 (course,d)=>{course.additionalDocuments.push({label:'Transcription orale',visibility:'private'})},
 (course,d)=>{course.additionalDocuments[0].url='https://drive.google.com/file/d/CHANGED/view'},
 (course,d)=>{d.artifactSha256s.TEST_PDF='d'.repeat(64)}
]){
 const c=clone(newCourse),d=clone(approvedDelivery);mutate(c,d);
 assert.throws(()=>preserveApprovedAddition(oldCourse,c,updatedDelivery,d));
}
const missingApproval=clone(approvedDelivery);missingApproval.publicationApproval.status='pending';
assert.throws(()=>validateChangedDeliveries({courses:[updatedDelivery]},{courses:[missingApproval]},newData,approvedData));
console.log(`PASS P0: ${oldReg.courses.length} cours historiques conservés, ${newCourses.length} nouveau(x) avec approbation, ${preservedDocumentCount} documents historiques, ${addedDocumentCount} ajouts autorisés ; zéro pointeur privé et retrait pur strict.`);
