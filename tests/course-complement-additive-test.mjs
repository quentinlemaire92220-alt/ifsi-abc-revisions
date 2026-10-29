import {verifyOfficialCourseReconciliation} from './official-course-reconciliation-contract.mjs';
import fs from 'node:fs';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';import {createHash} from 'node:crypto';
import {runtimeDeck} from './flashcards-runtime-fixture.mjs';
import {requireVisualReviewIfChanged} from './visual-owner-review-gate.mjs';
import {validateFirstReleaseAudio} from './audio-supplement-contract.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),base=process.env.IFSI_BASE_SHA||'HEAD^';
const old=p=>JSON.parse(execFileSync('git',['show',base+':'+p],{encoding:'utf8',maxBuffer:32*1024*1024}));
const delivery=read('docs/course-deliveries.json').courses.find(c=>c.courseId==='droits_patients');
const prior=old('docs/course-deliveries.json').courses.find(c=>c.courseId==='droits_patients');
const {questions,deck}=await runtimeDeck(),bank=read('qextra-60.txt');
assert.equal(bank.length,20);assert.equal(new Set(bank.map(q=>q.id)).size,20);
assert.equal(questions.filter(q=>q.courseId==='droits_patients').length,105);
assert.equal(deck.filter(c=>c.courseId==='droits_patients'&&!String(c.id).startsWith('voc:')).length,93);
assert.equal(bank.flatMap(q=>q.flashcards||[]).length,24);
assert.deepEqual(read('qextra-55.txt'),old('qextra-55.txt'),'85 questions et cartes historiques préservées');
const oldVocals=old('vocals.json'),newVocals=read('vocals.json');
assert.deepEqual(newVocals.slice(0,oldVocals.length),oldVocals,'Aucun MP3 historique modifié');
const addedVocals=newVocals.slice(oldVocals.length);
const approvedAudio=read('docs/course-deliveries.json').audioSupplements||[];
const firstReleaseAudioIds=validateFirstReleaseAudio(old('docs/course-deliveries.json'),read('docs/course-deliveries.json'),old('course-registry-v741.json'),read('course-registry-v741.json'),oldVocals,newVocals);
for(const voice of addedVocals){
 assert.ok(firstReleaseAudioIds.has(voice.id)||approvedAudio.some(s=>s.vocalIds?.includes(voice.id)&&s.publicationApproval?.authorization==='explicit_go_publication'),
 'MP3 ajouté sans complément audio explicitement approuvé : '+voice.id);
}
const priorAudioIds=new Set(oldVocals.map(v=>v.id));
const expectedApprovedAudioIds=new Set([...firstReleaseAudioIds,...approvedAudio.flatMap(s=>s.publicationApproval?.authorization==='explicit_go_publication'?(s.vocalIds||[]):[]).filter(id=>!priorAudioIds.has(id))]);
assert.deepEqual(new Set(addedVocals.map(v=>v.id)),expectedApprovedAudioIds,'Seuls les MP3 complémentaires approuvés peuvent être ajoutés depuis la version de comparaison');
const oldVocabulary=old('vocabulaire-v1.json'),newVocabulary=read('vocabulaire-v1.json');
const beforeCount=oldVocabulary.entries.length;
assert.deepEqual({...newVocabulary,entries:newVocabulary.entries.slice(0,beforeCount)},oldVocabulary,
 'Le lexique historique doit rester inchangé, y compris dans son ordre');
const addedVocabulary=newVocabulary.entries.slice(beforeCount);
// Autoriser uniquement les nouveaux lexiques approuvés, sans remplacer les entrées historiques.
const approvedCommunication=read('docs/course-deliveries.json').courses.some(c=>
 c.courseId==='d1_communication_td1' && c.publicationApproval?.status==='approved' &&
 c.publicationApproval?.authorization==='explicit_go_publication');
const allowedNewLexiconCourses=new Set(['responsabilite_exercice_professionnel']);
if(approvedCommunication)allowedNewLexiconCourses.add('d1_communication_td1');
const publicationApprovals=read('docs/course-deliveries.json').courses;
const stressAddon=publicationApprovals.find(c=>c.courseId==='gestion_stress_professionnel')?.qcmFlashcardsSupplement;
if(stressAddon?.publicationApproval?.status==='approved'&&stressAddon.publicationApproval?.authorization==='explicit_go_publication'&&stressAddon.publicationApproval?.scope==='qcm_flashcards_vocabulary_only')allowedNewLexiconCourses.add('gestion_stress_professionnel');
for(const delivery of publicationApprovals){
 // Extensions du lexique uniquement pour un lot explicitement approuvé.
 // La vérification du digest et de la revue du cours reste obligatoire dans les TNR de publication.
 if(delivery.validated===true &&
    delivery.publicationApproval?.status==='approved' &&
    delivery.publicationApproval?.authorization==='explicit_go_publication' &&
    delivery.publicationApproval?.scope==='course_package')
  allowedNewLexiconCourses.add(delivery.courseId);
}
assert.ok(addedVocabulary.every(e=>Array.isArray(e.courseIds)&&e.courseIds.length===1&&
 allowedNewLexiconCourses.has(e.courseIds[0])),
 'Le lexique ne peut être enrichi que pour les cours explicitement approuvés');
assert.equal(new Set(newVocabulary.entries.map(x=>x.id)).size,newVocabulary.entries.length,
 'IDs lexicaux uniques');
for(const file of ['sheets-1.json','sheets-2.json','infographics.json'])assert.deepEqual(read(file),old(file));
const sheets=[1,2,3].flatMap(n=>read(`sheets-${n}.json`)),oldSheets=[1,2,3].flatMap(n=>old(`sheets-${n}.json`));
// Révision intermédiaire ciblée : le TD reste PROVISOIRE lorsque le support
// officiel est reçu mais que l'enregistrement oral n'a pas été contrôlé.
// Seules trois métadonnées de la fiche écrite déjà publiée peuvent changer;
// les autres fichiers historiques restent protégés par égalité stricte.
function allowOfficialSupportWithUnverifiedAudio(previous,current){
 if(previous.courseId!=='theorie_gestion_symptomes_td'||previous.resourceId!=='a1_tgs_td_written_p01')return false;
 if(!current||previous.url!==current.url)return false;
 const strip=(s)=>Object.fromEntries(Object.entries(s).filter(([k])=>!['pageCount','officialSupport','sourceBasis'].includes(k)));
 assert.deepEqual(strip(current),strip(previous),'Transition officielle : fiche historique altérée hors périmètre');
 const c=read('docs/course-deliveries.json').courses.find(c=>c.courseId===previous.courseId);
 assert.equal(previous.officialSupport,false);
 assert.equal(current.officialSupport,true);
 assert.equal(current.pageCount,c.publicArtifacts.sheet.pageCount);
 assert.ok(current.sourceBasis.includes('audio original non vérifié'));
 assert.equal(c.sourceBasis?.kind,'official_support_and_transcript');
 assert.equal(c.sourceBasis?.nativeSupportAvailable,true);
 assert.equal(c.sourceAudit?.officialChecked,true);
 assert.equal(c.sourceAudit?.oralStatus,'unverified');
 assert.equal(c.status,'partial');assert.equal(c.pedagogicalValidated,false);
 assert.ok(c.blockers?.some(x=>x.reason==='oral_source_unverified'));
 assert.equal(c.visualOwnerReview?.status,'owner_accepted');
 assert.equal(c.templateConformance?.artifacts?.sheet?.artifactSha256,c.publicArtifacts.sheet.sha256);
 assert.equal(c.pedagogicalNonRegression?.sheetSha256,c.publicArtifacts.sheet.sha256);
 assert.equal(c.pedagogicalNonRegression?.sourceCoverage,'limited');
 // Ne pas exiger ici le GO de publication du package : un contrôle dédié
 // valide strictement la signature et l'empreinte finale du lot.
 return true;
}
// Fusion officielle de trois fiches vers une fiche unique : les anciennes lignes
// restent lisibles dans le catalogue, mais sont exclues de l'affichage étudiant.
// Interdiction de modifier leur URL, leurs octets, ou toute autre propriété.
function allowDroitsArchival(previous,current){
 const ids=new Set([
  'droits_patients_fiche_p01',
  'droits_patients_fiche_infographiee_p01',
  'droits_patients_fiche_complement_p01_20261021'
 ]);
 if(previous.courseId!=='droits_patients'||!ids.has(previous.resourceId))return false;
 const migration=delivery.historicalSheetMigration;
 if(migration?.status!=='archived_in_catalog_only'||
   migration.historicalResourceIds?.length!==3 ||
   !ids.has(migration.historicalSheetResourceId) ||
   !ids.has(migration.historicalInfographicSheetResourceId))return false;
 if(!ids.has(previous.resourceId)||!migration.historicalResourceIds.includes(previous.resourceId))return false;
 assert.equal(previous.sourceStatus,'active','Ancienne fiche non active dans la base');
 assert.ok(current,'Archive de fiche supprimée : '+previous.resourceId);
 assert.deepEqual(current,{...previous,sourceStatus:'archived'},
  'Une fiche historique a été altérée autrement que par archivage');
 assert.equal(delivery.sheetResourceId,'droits_patients_fiche_unique_20261029',
  'Migration sans fiche consolidée de référence');
 assert.equal(sheets.filter(x=>x.courseId==='droits_patients'&&x.sourceStatus!=='archived').length,1,
  'Plusieurs fiches Droits des patients encore actives');
 return true;
}
for(const s of oldSheets){
 const next=sheets.find(x=>x.resourceId===s.resourceId&&x.url===s.url);
 if(next && JSON.stringify(next)===JSON.stringify(s))continue;
 if(allowOfficialSupportWithUnverifiedAudio(s,next))continue;
 if(allowDroitsArchival(s,next))continue;
 if(!next&&read('docs/course-deliveries.json').courses.find(c=>c.courseId===s.courseId)?.reconciliation?.type==='provisional_to_official_v1')verifyOfficialCourseReconciliation(s.courseId,base);
 else assert.deepEqual(next,s);
}
const part=delivery.partDeliveries.find(p=>p.deliveryMode==='existing_course_complement');assert.ok(part);
if(delivery.historicalSheetMigration?.status==='archived_in_catalog_only'){
 const oldComplement=delivery.historicalSheetMigration.historicalSupplementReview;
 assert.equal(oldComplement?.sheetResourceId,'droits_patients_fiche_complement_p01_20261021',
  'Ancien complément non retrouvé dans l'historique');
 assert.equal(sheets.find(s=>s.resourceId===oldComplement.sheetResourceId)?.sourceStatus,'archived',
  'Complément historique non archivé');
 assert.equal(sheets.find(s=>s.resourceId===oldComplement.sheetResourceId)?.primaryRevision,false,
  'L’ancien complément était secondaire');
 assert.equal(sheets.find(s=>s.resourceId===part.sheetResourceId)?.primaryRevision,true,
  'La nouvelle fiche consolidée n’est pas la référence principale');
}else assert.equal(sheets.find(s=>s.resourceId===part.sheetResourceId).primaryRevision,false);
const rightsAdded=addedVocals.filter(v=>v.courseId==='droits_patients').map(v=>v.id);
assert.deepEqual(delivery.vocals,[...prior.vocals,...rightsAdded],'Les six anciens MP3 sont préservés');
if(rightsAdded.length){
 const wasPart=prior.partDeliveries.find(p=>p.partId===part.partId);
 assert.deepEqual(part.vocalIds,[...(wasPart.vocalIds||[]),...rightsAdded],'Seuls les vocaux approuvés sont ajoutés à la partie');
 assert.equal(part.status,'complete');assert.equal(delivery.status,'complete');
 assert.deepEqual(delivery.blockers,[]);
}else assert.equal(part.status,prior.partDeliveries.find(p=>p.partId===part.partId).status);
const graphics=read('infographics.json'),hashes={};for(const i of graphics)if(i.localImage)hashes[i.localImage]=createHash('sha256').update(fs.readFileSync(i.localImage)).digest('hex');
const previous={sheets:oldSheets,infographics:old('infographics.json'),imageHashes:hashes},current={sheets,infographics:graphics,imageHashes:hashes};
if(!prior.partDeliveries.some(p=>p.deliveryMode==='existing_course_complement')){
 assert.equal(requireVisualReviewIfChanged('droits_patients',prior,delivery,previous,current),true);
 const reject=mutate=>{const d=structuredClone(delivery),data=structuredClone(current);mutate(d,data);assert.throws(()=>requireVisualReviewIfChanged('droits_patients',prior,d,previous,data));};
 reject(d=>{d.partDeliveries[0].ownerReview.pdfSha256='0'.repeat(64)});
 reject((d,data)=>{data.sheets.find(s=>s.resourceId===part.sheetResourceId).primaryRevision=true});
 reject((d,data)=>{data.sheets.find(s=>s.resourceId===prior.sheetResourceId).url='https://drive.google.com/file/d/changed/view'});
 reject(d=>{d.partDeliveries[0].ownerReview.pagesChecked=1});
 reject(d=>{d.partDeliveries[0].ownerReview.independentMedicalReview='invented'});
}
assert.ok(!/PLAUD|sourceRefs|Sources privées|C:[\\/]Users/.test(JSON.stringify(bank)));
console.log('PASS complément : 105 QCM, 93 cartes rédigées + 34 définitions ; anciennes ressources et 6 MP3 conservés ; faux accords et remplacements refusés.');
