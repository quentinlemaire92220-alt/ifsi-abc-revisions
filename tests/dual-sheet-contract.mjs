// Contrat PUBLIC v1.13 pour les nouveaux cours et nouvelles parties.
// La CI vérifie les déclarations; les octets des PDF privés restent vérifiés par Work.
// Les cours antérieurs inchangés sont exemptés de rétroactivité.
import assert from 'node:assert/strict';
import {validateVisualAudit} from './pdf-visual-audit-contract.mjs';

const sha=v=>typeof v==='string'&&/^[a-f0-9]{64}$/i.test(v);
const driveId=sheet=>sheet?.driveId||String(sheet?.url||'').match(/\/file\/d\/([a-zA-Z0-9_-]+)/)?.[1];

export function validateSheetSource(courseId,delivery,sheet){
 if(delivery.deliveryMode==='existing_course_revision'||delivery.deliveryMode==='source_limited_first_release'){
  assert.equal(delivery.sourceBasis?.kind,'course_captures',courseId+': provenance captures absente');
  assert.equal(delivery.sourceBasis.nativeSupportAvailable,false,courseId+': support natif non vérifié');
  assert.equal(delivery.sourceBasis.reconciled,true,courseId+': captures non rapprochées');
  assert.equal(delivery.status,'partial',courseId+': révision sur captures déclarée complète');
  assert.ok(delivery.blockers?.some(x=>x.resource==='support'&&x.reason==='native_support_unavailable'),courseId+': réserve support natif absente');
  assert.equal(sheet.officialSupport,false,courseId+': captures présentées comme PDF officiel');
 }else assert.equal(sheet.officialSupport,true,courseId+': fiche sans support officiel validé');
}

function sheetFor(courseId,id,format,sheets,delivery){
 assert.ok(typeof id==='string'&&id,courseId+': resourceId de fiche '+format+' absent');
 const matches=sheets.filter(s=>s.resourceId===id&&s.courseId===courseId);
 assert.equal(matches.length,1,courseId+': fiche '+format+' manquante ou dupliquée '+id);
 const sheet=matches[0];
 assert.equal(sheet.sheetFormat,format,courseId+': sheetFormat attendu '+format+' pour '+id);
 validateSheetSource(courseId,delivery,sheet);
 assert.ok(/^https:\/\/drive\.google\.com\/file\/d\/[a-zA-Z0-9_-]+/.test(sheet.url||''),
  courseId+': lien Drive de la fiche '+format+' invalide');
 return sheet;
}

function pdfCheck(courseId,kind,figures,audit,proof,sheet,artifactSha256s){
 assert.ok(audit&&audit.status==='PASS',courseId+': contrôle PDF '+kind+' PASS absent');
 assert.ok(sha(audit.pdfSha256),courseId+': SHA-256 audit '+kind+' absent');
 assert.ok(Number.isInteger(audit.expectedCount)&&audit.expectedCount>=figures,
  courseId+': couverture visuelle '+kind+' insuffisante');
 assert.equal(audit.checkedCount,audit.expectedCount,courseId+': visuels '+kind+' non tous contrôlés');
 assert.equal(proof?.status,'MATCH',courseId+': PDF '+kind+' non vérifié après publication Drive');
 assert.equal(proof?.source,'authenticated_drive_download',courseId+': preuve '+kind+' sans téléchargement authentifié');
 assert.equal(proof.pdfSha256?.toLowerCase(),audit.pdfSha256.toLowerCase(),courseId+': empreintes PDF '+kind+' divergentes');
 assert.equal(proof.checkedCount,audit.expectedCount,courseId+': comptage publié '+kind+' différent');
 assert.equal(proof.expectedCount,audit.expectedCount,courseId+': matrice publiée '+kind+' différente');
 const id=driveId(sheet);
 assert.ok(id,courseId+': Drive ID manquant '+kind);
 assert.equal(artifactSha256s?.[id]?.toLowerCase(),audit.pdfSha256.toLowerCase(),
  courseId+': l’empreinte du fichier Drive '+kind+' ne concorde pas avec le contrôle PDF');
}

export function validateDualSheetDelivery(courseId,delivery,sheets,{requirePublishedVerification=true}={}){
 assert.ok(delivery&&typeof delivery==='object',courseId+': livraison absente');
 if(delivery.revisionSheetMode==='single_with_complete_boards')
  return validateSingleSheetDelivery(courseId,delivery,sheets,{requirePublishedVerification});
 assert.notEqual(delivery.sheetResourceId,delivery.infographicSheetResourceId,
  courseId+': les deux fiches doivent être des fichiers DISTINCTS');
 const classic=sheetFor(courseId,delivery.sheetResourceId,'classic',sheets,delivery);
 const illustrated=sheetFor(courseId,delivery.infographicSheetResourceId,'complete_infographic',sheets,delivery);
 assert.notEqual(driveId(classic),driveId(illustrated),courseId+': les deux PDF pointent vers le même Drive ID');
 const figures=delivery.infographicResourceIds??[];
 assert.ok(Array.isArray(figures),courseId+': infographicResourceIds doit être un tableau');
 const withoutFigures=figures.length===0;
 if(withoutFigures){
  assert.equal(delivery.schematics,'none',
   courseId+': aucune infographie individuelle : schematics=none obligatoire');
  assert.ok(typeof delivery.schematicsJustification==='string'&&
    delivery.schematicsJustification.trim().length>=30,
   courseId+': justifier le choix pédagogique sans schéma individuel (30 caractères minimum)');
 }else{
  assert.notEqual(delivery.schematics,'none',
   courseId+': contradiction : schémas déclarés mais schematics=none');
  validateVisualAudit(courseId,delivery,{requirePublishedVerification});
 }
  if(withoutFigures){
   for(const [kind,audit] of [['classique',delivery.visualAudit],
                            ['complète infographiée',delivery.infographicSheetVisualAudit]]){
    assert.equal(audit?.status,'PASS',
      courseId+': contrôle PDF '+kind+' PASS absent');
    assert.equal(audit?.expectedCount,0,
      courseId+': PDF '+kind+' sans figure : expectedCount doit être 0, pas une fausse illustration');
    assert.equal(audit?.checkedCount,0,
      courseId+': PDF '+kind+' sans figure : checkedCount doit être 0');
   }
  }
 if(requirePublishedVerification){
  pdfCheck(courseId,'classique',figures.length,delivery.visualAudit,
    delivery.publishedVerification,classic,delivery.artifactSha256s);
  pdfCheck(courseId,'complète infographiée',withoutFigures?0:1,delivery.infographicSheetVisualAudit,
    delivery.infographicSheetPublishedVerification,illustrated,delivery.artifactSha256s);
 } else {
  assert.equal(delivery.infographicSheetVisualAudit?.status,'PASS',
    courseId+': rapport local de fiche complète infographiée absent');
 }
 const coverage=delivery.dualSheetCoverage;
 assert.ok(coverage&&Number.isInteger(coverage.expectedNotions)&&coverage.expectedNotions>0,
  courseId+': inventaire des notions essentielles absent');
 assert.equal(coverage.classicCovered,coverage.expectedNotions,
  courseId+': couverture pédagogique de la fiche classique incomplète');
 assert.equal(coverage.infographicCovered,coverage.expectedNotions,
  courseId+': couverture pédagogique de la fiche complète infographiée incomplète');
 if(withoutFigures){
  assert.equal(coverage.disciplinaryReview?.type,'conceptual',
    courseId+': une revue conceptuelle indépendante est obligatoire sans schéma anatomique');
  assert.equal(coverage.disciplinaryReview?.status,'approved',
    courseId+': revue conceptuelle des deux fiches non approuvée');
 }else{
  assert.equal(coverage.medicalReview,'approved',
    courseId+': revue médicale indépendante des deux fiches non déclarée');
 }
 return {classic,illustrated};
}

export function validateDualSheetPart(courseId,part,sheets){
 const ids=part.sheetResourceIds||[];
 if(part.revisionSheetMode==='single_with_complete_boards'){
  assert.deepEqual(ids,[part.sheetResourceId],courseId+'/'+part.partId+': une seule fiche doit être déclarée');
  return validateSingleSheetDelivery(courseId,part,sheets);
 }
 assert.equal(ids.length,2,courseId+'/'+part.partId+': deux fiches distinctes obligatoires');
 assert.ok(part.sheetResourceId&&part.infographicSheetResourceId,
  courseId+'/'+part.partId+': IDs des deux formats non identifiés');
 assert.ok(ids.includes(part.sheetResourceId)&&ids.includes(part.infographicSheetResourceId),
  courseId+'/'+part.partId+': les deux fiches doivent être déclarées dans sheetResourceIds');
 return validateDualSheetDelivery(courseId,part,sheets);
}

// Choix explicite du propriétaire : une fiche écrite illustrée et des planches
// complètes séparées. Les anciens contrats à deux fiches restent inchangés.
export function validateSingleSheetDelivery(courseId,delivery,sheets,{requirePublishedVerification=true}={}){
 assert.equal(delivery.revisionSheetMode,'single_with_complete_boards',courseId+': format de livraison non identifié');
 assert.ok(!delivery.infographicSheetResourceId,courseId+': seconde fiche non demandée');
 const classic=sheetFor(courseId,delivery.sheetResourceId,'classic',sheets,delivery);
 const figures=delivery.infographicResourceIds;
 assert.ok(Array.isArray(figures)&&figures.length>0,courseId+': planches complètes complémentaires absentes');
 assert.equal(new Set(figures).size,figures.length,courseId+': planche déclarée deux fois');
 validateVisualAudit(courseId,delivery,{requirePublishedVerification});
 if(requirePublishedVerification)
  pdfCheck(courseId,'révision',figures.length,delivery.visualAudit,
   delivery.publishedVerification,classic,delivery.artifactSha256s);
 const coverage=delivery.sheetCoverage;
 assert.ok(Number.isInteger(coverage?.expectedNotions)&&coverage.expectedNotions>0,courseId+': inventaire pédagogique absent');
 assert.equal(coverage.coveredNotions,coverage.expectedNotions,courseId+': fiche de révision incomplète');
 assert.ok(['medical','conceptual'].includes(coverage.disciplinaryReview?.type),courseId+': type de revue absent');
 assert.equal(coverage.disciplinaryReview.status,'approved',courseId+': revue disciplinaire non approuvée');
 for(const id of figures){
  const board=delivery.completeBoardAudits?.[id];
  assert.equal(board?.status,'PASS',courseId+': contrôle de planche manquant '+id);
  assert.ok(sha(board.pdfSha256)&&board.driveId,courseId+': empreinte de planche absente '+id);
  assert.ok(board.expectedCount>0&&board.checkedCount===board.expectedCount,courseId+': planche incomplètement contrôlée '+id);
  assert.equal(delivery.artifactSha256s?.[board.driveId],board.pdfSha256,courseId+': empreinte de planche incohérente '+id);
  if(requirePublishedVerification){
   const proof=board.publishedVerification;
   assert.equal(proof?.status,'MATCH',courseId+': copie de planche non vérifiée '+id);
   assert.equal(proof.source,'authenticated_drive_download',courseId+': origine de vérification invalide '+id);
   assert.equal(proof.pdfSha256,board.pdfSha256,courseId+': copie de planche différente '+id);
   assert.equal(proof.expectedCount,board.expectedCount,courseId+': inventaire publié différent '+id);
   assert.equal(proof.checkedCount,board.expectedCount,courseId+': copie de planche incomplètement contrôlée '+id);
  }
 }
 return {classic};
}
