import fs from 'node:fs';
import assert from 'node:assert/strict';
import {runtimeDeck} from './flashcards-runtime-fixture.mjs';
import {validateDualSheetDelivery,validateSheetSource} from './dual-sheet-contract.mjs';
import {validateLeanCourseDelivery,validateLeanPart} from './lean-course-contract.mjs';
import {validateHybridDelivery,validateHybridPart} from './hybrid-sheet-contract.mjs';
import {validateWrittenDelivery,validateWrittenPart} from './written-sheet-contract.mjs';
import {validateLeanQuestions,validateLeanFlashcards} from './lean-content-contract.mjs';
import {validateAudioOnlyDelivery} from './audio-only-delivery-contract.mjs';
import {validateRevisionSheetSupplement} from './revision-sheet-supplement-contract.mjs';

const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const manifest=read('docs/course-deliveries.json');
const sheets=[1,2,3].flatMap(n=>read(`sheets-${n}.json`));
const infos=read('infographics.json'),vocals=read('vocals.json');
const {deck,questions,registry}=await runtimeDeck();
const {validateAudioSupplements}=await import('./audio-supplement-contract.mjs');
validateAudioSupplements(manifest,{registry,vocals});
const required=['01','02','03','04','05','06','07'];
for(const c of manifest.courses){
 validateRevisionSheetSupplement(c.courseId,c,{sheets});
 assert.equal(c.validated,true,c.courseId+': validation manquante');
 assert.ok(registry.courses.some(x=>x.id===c.courseId),c.courseId+': cours absent');
 if(c.publicationScope==='infographics_only'){
  // Publication complémentaire : ne PAS réexiger un dossier de cours refait,
  // un export de flashcards ou des illustrations locales pour un PDF externe.
  assert.equal(c.status,'partial',c.courseId+': un complément non exhaustif doit rester partiel');
  assert.ok(c.folders?.['04'],c.courseId+': dossier infographies absent');
  assert.equal(c.infographicResourceIds?.length,1,c.courseId+': un unique PDF de 16 planches attendu');
  assert.equal(c.reviewedBoardCount,16,c.courseId+': 16 planches déclarées attendues');
  const id=c.infographicResourceIds[0];
  const info=infos.find(x=>x.resourceId===id&&x.courseId===c.courseId);
  assert.ok(info,c.courseId+': pack infographique non rattaché');
  assert.equal(info.pageCount,16,c.courseId+': nombre de planches incohérent');
  assert.equal(info.coverageStatus,'partial',c.courseId+': résumé complémentaire non signalé');
  assert.equal(info.url,'https://drive.google.com/file/d/'+c.infographicPackDriveId+'/view',
   c.courseId+': fichier Drive non concordant');
  assert.match(c.artifactSha256s?.[c.infographicPackDriveId]||'',/^[a-f0-9]{64}$/,
   c.courseId+': hash PDF absent');
  assert.ok(c.blockers?.length,c.courseId+": limitations d'exhaustivité non déclarées");
  console.log('✅ '+c.courseId+': pack complémentaire de 16 planches validé pour publication restreinte');
  continue;
 }
 if(c.deliveryMode==='audio_only'){
  validateAudioOnlyDelivery(registry.courses.find(x=>x.id===c.courseId),c,vocals);
  console.log('✅ '+c.courseId+': '+c.vocals.length+' MP3 — livraison audio partielle (supports privés non publiés)');
  continue;
 }
 for(const key of ['08','99'])assert.equal(c.folders?.[key],undefined,c.courseId+': pointeur de dossier privé dans le manifeste public');
 const hostedPublic = c.deliveryMode==='source_limited_first_release' &&
   c.provisional===true && c.publicationHost==='github_pages' && !c.folders;
 if(hostedPublic){
  // Public PDF assets are the publication folders. Do not invent Drive IDs.
  assert.equal(c.folders,undefined,c.courseId+': dossier Drive non attesté ne doit pas être inventé');
  assert.deepEqual(Object.keys(c.publicArtifacts||{}).sort(),['flashcards','qcm','sheet'],
   c.courseId+': exactement 3 ressources publiques vérifiables attendues');
  for(const [role,a] of Object.entries(c.publicArtifacts)){
   assert.match(a.path||'',/^assets\/[a-z0-9_-]+\/[A-Za-z0-9_/-]+\.pdf$/,c.courseId+': chemin PDF '+role+' invalide');
   assert.match(a.sha256||'',/^[a-f0-9]{64}$/,c.courseId+': SHA public '+role+' absent');
   assert.ok(Number.isInteger(a.pageCount)&&a.pageCount>0,c.courseId+': pagination '+role+' invalide');
  }
 } else {
  for(const key of required)assert.ok(c.folders?.[key],c.courseId+': dossier '+key+' absent');
  assert.equal(new Set(Object.values(c.folders)).size,required.length,'Dossiers dupliqués');
 }
 // Anciens contrats préservés ; les nouveaux packs hybrid_v1 utilisent une seule fiche.
 if(c.packFormat==='written_v1')validateWrittenDelivery(c.courseId,c,sheets);
 else if(c.packFormat==='hybrid_v1')validateHybridDelivery(c.courseId,c,sheets);
 else if(c.packFormat==='lean_v1')validateLeanCourseDelivery(c.courseId,c,sheets);
 else if(c.infographicSheetResourceId||c.revisionSheetMode==='single_with_complete_boards')validateDualSheetDelivery(c.courseId,c,sheets);
 const sheet=sheets.find(x=>x.resourceId===c.sheetResourceId);
 assert.equal(sheet?.courseId,c.courseId,'Fiche mal rattachée');
 validateSheetSource(c.courseId,c,sheet);
 const hostedProvisional=c.provisional===true&&c.publicationHost==='github_pages'&&
  c.publicArtifacts?.qcm?.sha256===c.qcmPublicAssetSha256&&
  c.publicArtifacts?.flashcards?.sha256===c.flashcardPublicAssetSha256;
 assert.ok((c.qcmDriveId||hostedProvisional)&&(c.supportDriveId||c.deliveryMode==='existing_course_revision'||
  c.deliveryMode==='source_limited_first_release'||
  (c.deliveryMode==='first_release'&&c.sourceAudit?.officialChecked===true&&c.sourceAudit?.officialSupportPreservedPrivately===true)),
  'Documents non identifiés ou source officielle privée non tracée');
 const bankPaths=Array.isArray(c.qcmBanks) && c.qcmBanks.length ? c.qcmBanks : [c.qcmBank];
 assert.ok(bankPaths.every(x=>typeof x==='string'&&x.length),'Chemins QCM invalides');
 assert.equal(new Set(bankPaths).size,bankPaths.length,'Banque QCM référencée deux fois');
 const bank=bankPaths.flatMap(read),live=questions.filter(q=>q.courseId===c.courseId);
 assert.equal(new Set(bank.map(q=>q.id)).size,bank.length,c.courseId+': ID de question dupliqué entre parties');
 assert.equal(bank.length,c.qcmCount,'Banque QCM tronquée');
 assert.equal(live.length,bank.length,'Banque perdue dans le navigateur');
 const deliveredQuestionIds=c.deliveryQuestionScope==='declared_parts'
  ?new Set((c.partDeliveries||[]).flatMap(p=>p.qcmQuestionIds||[])):null;
 for(const q of bank){
  const actual=live.find(x=>x.id===q.id);
  assert.ok(actual,q.id+': question perdue');
  assert.deepEqual(JSON.parse(JSON.stringify(actual.answers)),q.answers,q.id+': correction divergente');
  assert.deepEqual(JSON.parse(JSON.stringify(actual.choices)),q.choices,q.id+': choix divergents');
  // Le contrat actuel porte sur les nouvelles parties ; le snapshot historique
  // est conservé à l'identique et reste soumis au contrôle des choix/corrections.
  if(deliveredQuestionIds&&!deliveredQuestionIds.has(q.id))continue;
  assert.ok(q.answers.length>=1&&q.answers.length<=3,q.id+': réponses hors charte');
  assert.ok(['easy','medium','hard'].includes(q.difficulty),q.id+': niveau absent');
  assert.ok(q.theme&&q.explanation.length>25,q.id+': thème/corrigé absent');
 }
 if(['lean_v1','hybrid_v1','written_v1'].includes(c.packFormat))validateLeanQuestions(bank);
 let cards=deck.filter(x=>x.courseId===c.courseId && !String(x.id).startsWith('voc:')); // Les cartes de livraison sont distinctes des cartes de vocabulaire générées.
 if(c.deliveryQuestionScope==='declared_parts'){
  assert.equal(c.revisionSheetMode,'single_with_complete_boards','Portée partielle sans format de livraison explicite');
  assert.ok(c.partDeliveries?.length,'Parties de livraison absentes');
  const delivered=new Set(c.partDeliveries.flatMap(p=>p.qcmQuestionIds||[]));
  assert.ok(delivered.size,'Questions de partie non déclarées');
  cards=cards.filter(card=>delivered.has(card.qid));
 }
 assert.equal(cards.length,c.flashcardCount,'Flashcards absentes ou perdues');
 if(['lean_v1','hybrid_v1','written_v1'].includes(c.packFormat))validateLeanFlashcards(cards);
 assert.ok(c.flashcardDriveId||hostedProvisional,'Export Flashcards absent');
 for(const card of cards){
  const preciseExample=/^Donne un exemple de .+\.$/iu.test(String(card.front||'').trim());
  assert.ok((card.front.endsWith('?')||preciseExample)&&(card.answers.length===1||(card.authored&&card.answers.length<=4)),card.id+': carte imprécise');
  assert.ok(card.explanation,card.id+': explication absente');
  const q=bank.find(x=>x.id===card.qid);
  assert.ok(q?.flashcards?.some(x=>x.front===(card.sourceFront||card.front)),card.id+': question source perdue');
 }
 const partDeliveries=c.partDeliveries||[];
 for(const part of partDeliveries){
  assert.match(part.partId||'',/^p\d{2,3}$/,c.courseId+': partId incorrect');
  if(part.packFormat==='lean_v1')validateLeanPart(c.courseId,part,sheets);
  if(part.packFormat==='hybrid_v1')validateHybridPart(c.courseId,part,sheets);
  if(part.packFormat==='written_v1')validateWrittenPart(c.courseId,part,sheets);
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
 if(!['lean_v1','hybrid_v1','written_v1'].includes(c.packFormat))assert.ok(c.infographicResourceIds.length,'Infographies absentes');
 for(const id of c.infographicResourceIds){
  const x=infos.find(x=>x.resourceId===id);
  assert.equal(x?.courseId,c.courseId,'Infographie mal rattachée');
  assert.ok(x.driveId&&fs.existsSync(x.localImage),'Infographie non exportée');
 }
 if(c.status==='complete'){
  assert.equal(c.blockers.length,0,'Un pack complet ne peut avoir de blocage');
  if(!['lean_v1','hybrid_v1','written_v1'].includes(c.packFormat)||c.requestedVocals===true)assert.ok(c.vocals.length>0,'Pack complet sans vocal demandé');
 }else if(c.status==='awaiting_mp3'){
  assert.equal(c.vocals.length,0,'Audio publié avant le retour des MP3');
  assert.ok(Number.isInteger(c.scriptsPreparedCount)&&c.scriptsPreparedCount>0,
   'Nombre de scripts préparés absent (identifiants et URL restent privés)');
  assert.equal(c.vocalScripts,undefined,'Identifiants privés de scripts interdits dans le manifeste public');
  assert.ok(c.blockers.some(x=>x.resource==='vocals'&&x.reason==='awaiting_user_mp3'),'Attente des MP3 non explicitée');
 }else{
  assert.equal(c.status,'partial','Statut de livraison inconnu');
  assert.ok(c.blockers.length,'Livraison partielle sans explication');
  if(!['lean_v1','hybrid_v1','written_v1'].includes(c.packFormat)||c.requestedVocals===true)assert.ok(c.vocals.length||c.blockers.some(x=>x.resource==='vocals'),'Vocaux oubliés silencieusement');
 }
 for(const id of c.vocals)assert.ok(vocals.some(x=>x.id===id&&x.courseId===c.courseId&&x.driveId),'Vocal absent');
 console.log(`✅ ${c.courseId}: ${bank.length} QCM, ${cards.length} cartes, ${c.infographicResourceIds.length} infographies — ${c.status}`);
}
