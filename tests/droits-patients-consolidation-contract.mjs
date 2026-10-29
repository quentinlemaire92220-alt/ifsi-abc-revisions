// Contrat structurel ciblé : UE A2.1, fusion de trois anciennes fiches
// en UNE fiche nouvelle sans suppression des sources historiques.
// Ce validateur NE remplace PAS les reçus pédagogiques, juridiques,
// graphiques, de publication ou l'approbation du nouveau SHA.
import assert from 'node:assert/strict';

export function validateDroitsPatientsConsolidation(courseId,part,delivery,sheets){
 assert.equal(courseId,'droits_patients','Consolidation non autorisée pour un autre cours');
 assert.equal(part.partId,'p01','La fiche consolide l’ensemble des droits des patients en partie 01');
 assert.equal(part.packFormat,'consolidated_revision_v1','Format de migration non identifié');
 assert.equal(part.schematics,'embedded_vector','Infographie vectorielle intégrée obligatoire');
 assert.ok(Number.isInteger(part.embeddedFigureCount)&&part.embeddedFigureCount>=1,
  'Infographie intégrée non inventoriée');
 const wanted='droits_patients_fiche_unique_20261029';
 assert.equal(part.sheetResourceId,wanted,'Partie non rattachée à la nouvelle fiche');
 assert.deepEqual(part.sheetResourceIds,[wanted],'Plusieurs fiches déclarées pour une partie unique');
 assert.deepEqual(part.infographicResourceIds||[],[],'Infographies séparées ajoutées à tort');
 assert.equal(delivery.sheetResourceId,wanted,'Fiche unique discordante dans le cours');
 assert.ok(!delivery.infographicSheetResourceId,'Ancienne fiche illustrée conservée comme active');
 const active=sheets.filter(s=>s.courseId===courseId&&s.sourceStatus!=='archived');
 assert.equal(active.length,1,'Nombre de fiches actives différent de 1');
 assert.equal(active[0].resourceId,wanted,'Nouvelle fiche active incorrecte');
 assert.equal(active[0].primaryRevision,true,'Fiche unifiée non principale');
 assert.equal(active[0].sheetFormat,'written_revision','Format fiche écrite du modèle non conservé');
 const historic=[
  ['droits_patients_fiche_p01','15nG6-XL0JG-nE8IPrVpjmsbkeXRnPagQ'],
  ['droits_patients_fiche_infographiee_p01','1wTBIMcI6XXqaUudoYGcCy10UsjVO1oWC'],
  ['droits_patients_fiche_complement_p01_20261021','1swoAu939ZMfH53M8CYdtBb6DM-fXVaWW']
 ];
 for(const [id,drive] of historic){
  const items=sheets.filter(s=>s.courseId===courseId&&s.resourceId===id);
  assert.equal(items.length,1,'Ancienne fiche manquante ou dupliquée : '+id);
  assert.equal(items[0].sourceStatus,'archived','Archive encore exposée : '+id);
  assert.equal(items[0].url,'https://drive.google.com/file/d/'+drive+'/view',
   'Lien Drive historique altéré : '+id);
 }
 const migration=delivery.historicalSheetMigration;
 assert.equal(migration?.status,'archived_in_catalog_only','Traçabilité d’archivage absente');
 assert.deepEqual(migration.historicalResourceIds,historic.map(([id])=>id),
  'Références historiques modifiées');
 assert.equal(migration.historicalSupplementReview?.sheetResourceId,historic[2][0],
  'Ancien complément pédagogique perdu');
 assert.equal(delivery.qcmCount,105,'105 QCM à conserver');
 assert.equal(delivery.flashcardCount,93,'93 flashcards à conserver');
 assert.equal(delivery.vocals?.length,7,'7 vocaux à conserver');
 assert.equal(delivery.publicationHost,'github_pages','Fiche nouvelle non servie par Pages');
 const asset=delivery.publicArtifacts?.sheet;
 assert.equal(asset?.path,'assets/droits-patients/UE_A2_1_S1_Droits_des_patients_Fiche_de_revision.pdf',
  'Asset GitHub Pages inattendu');
 assert.match(asset?.sha256||'',/^[a-f0-9]{64}$/,'Empreinte de l’asset manquante');
 assert.equal(delivery.artifactSha256s?.[asset.artifactId],asset.sha256,
  'L’asset du cours et le manifeste ne portent pas les mêmes octets');
 // Un asset exact et une autorisation de poursuivre n'attestent pas la
 // diffusion HTTP ni la revue humaine : les gates séparés restent obligatoires.
 assert.equal(delivery.publicationApproval?.authorization,'explicit_go_publication',
  'GO du propriétaire pour préparer l’intégration absent');
 return {sheet:active[0],historicalCount:historic.length};
}
