// IFSI ABC — garde-fou de la transition « Droits des patients ».
// Ne publie rien. Mode courant : conserver les trois fiches historiques.
// Après GO + hébergement + QA, invoquer avec --require-unified.
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = p => JSON.parse(fs.readFileSync(p,'utf8'));
const id='droits_patients';
const historic=[
 'droits_patients_fiche_p01',
 'droits_patients_fiche_infographiee_p01',
 'droits_patients_fiche_complement_p01_20261021'
];
const sheets=[1,2,3].flatMap(n=>read('sheets-'+n+'.json'));
const active=sheets.filter(s=>s.courseId===id && s.sourceStatus!=='archived');
const courses=read('docs/course-deliveries.json').courses.filter(c=>c.courseId===id);
assert.equal(courses.length,1,'Un seul cours canonique Droits des patients doit exister');
const course=courses[0];
const legacy=historic.every(key=>active.some(s=>s.resourceId===key)) && active.length===3;
const required=process.argv.includes('--require-unified');

assert.equal(course.qcmCount,105,'105 QCM historiques attendus');
assert.equal(course.flashcardCount,93,'93 flashcards historiques attendues');
assert.equal(course.vocals?.length,7,'7 vocaux historiques attendus');
assert.ok(course.qcmDriveId && course.flashcardDriveId && course.vocabularyDriveId,
 'Référence historique QCM/flashcards/vocabulaire absente');

if(legacy){
 assert.ok(!required,'BLOQUÉ : trois fiches historiques actives, fusion non réalisée');
 assert.equal(course.sheetResourceId,historic[0],'Fiche classique historique altérée');
 assert.equal(course.infographicSheetResourceId,historic[1],'Fiche illustrée historique altérée');
 assert.ok(course.partDeliveries?.some(p=>p.sheetResourceId===historic[2]),
  'Complément historique supprimé');
 console.log('PASS historique : trois fiches conservées ; fusion non activée.');
}else{
 // L'archivage n'est PAS une suppression : chaque ancien fichier doit rester
 // référençable avec son identifiant Drive initial, sans fiche active doublonnée.
 const legacyDriveIds={
  droits_patients_fiche_p01:'15nG6-XL0JG-nE8IPrVpjmsbkeXRnPagQ',
  droits_patients_fiche_infographiee_p01:'1wTBIMcI6XXqaUudoYGcCy10UsjVO1oWC',
  droits_patients_fiche_complement_p01_20261021:'1swoAu939ZMfH53M8CYdtBb6DM-fXVaWW'
 };
 for(const [oldResourceId,oldDriveId] of Object.entries(legacyDriveIds)){
  const archived=sheets.filter(s=>s.courseId===id && s.resourceId===oldResourceId);
  assert.equal(archived.length,1,'Archive historique manquante/dupliquée : '+oldResourceId);
  assert.equal(archived[0].sourceStatus,'archived','Ancienne fiche non archivée : '+oldResourceId);
  assert.equal(archived[0].url,'https://drive.google.com/file/d/'+oldDriveId+'/view',
   'Lien source historique modifié : '+oldResourceId);
 }
 assert.equal(active.length,1,'BLOQUÉ : une seule fiche active obligatoire');
 const sheet=active[0];
 assert.ok(!historic.includes(sheet.resourceId),'La nouvelle fiche réutilise un ID historique');
 assert.equal(sheet.resourceId,course.sheetResourceId,'Manifeste et fiche discordants');
 assert.equal(sheet.sheetFormat,'written_revision','Contrat de fiche écrite V5.3 attendu');
 assert.ok(!course.infographicSheetResourceId,'Ancienne fiche illustrée encore active');
 assert.ok(!course.partDeliveries?.some(p=>
  historic.includes(p.sheetResourceId) ||
  (p.sheetResourceIds||[]).some(x=>historic.includes(x))),
  'Complément historique toujours actif en doublon');
 // URL publique finale et objet Git binaire réellement chargé sur la branche.
 // Un lien Github Pages attendu n'est pas à lui seul la preuve d'un déploiement.
 const assetPath='assets/droits-patients/UE_A2_1_S1_Droits_des_patients_Fiche_de_revision.pdf';
 const artifactId='github_pages:'+assetPath;
 const expectedUrl='https://quentinlemaire92220-alt.github.io/ifsi-abc-revisions/'+assetPath;
 const approvedPublicationPdf='52ab60513762814abbb48b4ec8a05ff687b3c0429d49689e81185701595844f5';
 assert.equal(sheet.url,expectedUrl,'URL de fiche publique non canonique');
 assert.equal(sheet.publicationHost,'github_pages','Hébergement PDF Pages non déclaré');
 assert.equal(sheet.artifactId,artifactId,'Identifiant PDF Pages divergent');
 assert.ok(!sheet.driveId,'ID du Drive privé exposé comme ressource publique');
 assert.equal(course.publicationHost,'github_pages','Hôte publié non déclaré');
 assert.equal(course.publicArtifacts?.sheet?.path,assetPath,'Chemin du PDF actif erroné');
 assert.equal(course.publicArtifacts?.sheet?.artifactId,artifactId,'Référence asset discordante');
 assert.equal(course.publicArtifacts?.sheet?.pageCount,42,'PDF publié incomplet');
 assert.equal(course.publicArtifacts?.sheet?.verifiedGitBlobSha,
  '3815848158d561e8e8a12393ade06ea1bba8633e','Git blob non concordant');
 assert.equal((course.artifactSha256s?.[artifactId]||'').toLowerCase(),approvedPublicationPdf,
  'Fiche différente des octets nettoyés approuvés : nouveau GO nécessaire');
 assert.equal((course.publicArtifacts?.sheet?.sha256||'').toLowerCase(),approvedPublicationPdf,
  'Le SHA du lot ne correspond pas au PDF public');
 assert.equal(sheet.pageCount,42,'La fiche unique validée contient 42 pages');

 // Le hash de l'objet Git n'est PAS une preuve d'accès anonyme sur GitHub Pages.
 // Maintenir un blocage distinct jusqu'au vrai téléchargement HTTP public
 // de la future URL étudiante avec calcul SHA-256 des octets servis.
 const publicProof=course.publicSheetVerification;
 assert.equal(publicProof?.status,'MATCH','Lecture publique anonyme de la candidate validée non attestée');
 assert.equal(publicProof.source,'anonymous_public_download',
  'Vérification depuis un compte autorisé ou l’objet Git insuffisante');
 assert.equal(publicProof.method,'full_download_sha256',
  'Hash des octets publics complets non vérifié');
 assert.equal(publicProof.httpStatus,200,'Accès HTTP public 200 non prouvé');
 assert.equal(publicProof.url,sheet.url,'URL vérifiée différente du lien étudiant');
 assert.equal((publicProof.pdfSha256||'').toLowerCase(),approvedPublicationPdf,
  'Le PDF servi publiquement diffère de la candidate nettoyée validée');
 assert.ok(typeof publicProof.verifiedAt==='string' &&
  Number.isFinite(Date.parse(publicProof.verifiedAt)),
  'Horodatage du contrôle public manquant');

 // Empêcher des reçus fictifs : l'indexation des 251 pages n'est pas une
 // revue SÉMANTIQUE et la CI ne peut pas se substituer à la validation humaine.
 const pedagogic=course.pedagogicalNonRegression;
 assert.equal(pedagogic?.contract,'ifsi_pedagogical_non_regression_v149',
  'Reçu non-régression v1.49 absent');
 assert.equal(pedagogic.sheetSha256?.toLowerCase(),approvedPublicationPdf,
  'Reçu pédagogique lié à un autre PDF');
 assert.match(pedagogic.privateEvidenceSha256||'',/^[a-f0-9]{64}$/i,
  'Preuve pédagogique privée non identifiée par empreinte');
 assert.equal(pedagogic.sourceInventory,'reviewed','Inventaire des sources non revu');
 assert.equal(pedagogic.sourceCoverage,'complete','Couverture pédagogique exhaustive non attestée');
 assert.equal(pedagogic.inheritanceReview,'compared','Non-régression des 3 fiches non attestée');
 assert.equal(pedagogic.depthReview,'reviewed','Profondeur des explications non revue');
 assert.equal(pedagogic.differencesReview,'reviewed','Journal des écarts non revu');
 assert.equal(pedagogic.decision,'full_review_recorded',
  'Revue humaine complète non attestée');

 const template=course.templateConformance;
 assert.equal(template?.contract,'ifsi_pdf_template_v3','Conformité trame V3 absente');
 const sheetReview=template.artifacts?.sheet;
 assert.equal(sheetReview?.artifactSha256?.toLowerCase(),approvedPublicationPdf,
  'Trame contrôlée pour une autre version');
 assert.equal(sheetReview.pageCount,42,'Nombre de pages de revue graphique inexact');
 assert.equal(sheetReview.templateId,'communication_written_v5.3_2026-10-24',
  'Modèle de fiche incorrect');
 assert.equal(sheetReview.templateSha256,
  '223b163f243373c03d87b8e7b8ec8ffd60a06ab883c40dabfa7a7dbbfe4b30cf',
  'Empreinte modèle Communication incorrecte');
 assert.deepEqual(sheetReview.pagesChecked,Array.from({length:42},(_,i)=>i+1),
  'Revue graphique 100/200 % incomplète');
 assert.equal(sheetReview.method,'all_pages_compared_at_100_and_200_percent',
  'Comparaison graphique au modèle non attestée');
 assert.equal(sheetReview.status,'owner_accepted',
  'Validation graphique du PDF exact manquante');
 assert.equal(sheetReview.decision,'explicit_graphic_acceptance',
  'Accord graphique explicite manquant');
 assert.match(sheetReview.privateEvidenceSha256||'',/^[a-f0-9]{64}$/i,
  'Preuve graphique privée manquante');

 // L'ancien package approuvé le 23/10 ne valide pas la migration de fiche.
 // Le contrôle publicationBundle valide en outre que le nouveau SHA de lot
 // correspond exactement à tous les nouveaux pointeurs.
 const approval=course.publicationApproval;
 assert.equal(approval?.status,'approved','GO du nouveau lot absent');
 assert.equal(approval.authorization,'explicit_go_publication',
  'GO de publication distinct non enregistré');
 assert.equal(approval.scope,'course_package','Portée de GO incohérente');
 assert.match(approval.bundleSha256||'',/^[a-f0-9]{64}$/i,'SHA du nouveau lot absent');
 assert.notEqual(approval.bundleSha256,
  '187af855c1a5553fb7f0ae03cb22e660e0d9990fb073a453c35caa26f78b2e6e',
  'ANCIEN GO de publication réutilisé pour une nouvelle fiche');
 console.log('PASS structure unique + archives + SHA candidate validée + reçus complets + preuve publique anonyme.');
}
