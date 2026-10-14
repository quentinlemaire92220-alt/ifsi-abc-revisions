// Contrat PUBLIC v1.13 pour les nouveaux cours et nouvelles parties.
// La CI vérifie les déclarations; les octets des PDF privés restent vérifiés par Work.
// Les cours antérieurs inchangés sont exemptés de rétroactivité.
import assert from 'node:assert/strict';
import {validateVisualAudit} from './pdf-visual-audit-contract.mjs';

const sha=v=>typeof v==='string'&&/^[a-f0-9]{64}$/i.test(v);
const driveId=sheet=>sheet?.driveId||String(sheet?.url||'').match(/\/file\/d\/([a-zA-Z0-9_-]+)/)?.[1];

function sheetFor(courseId,id,format,sheets){
 assert.ok(typeof id==='string'&&id,courseId+': resourceId de fiche '+format+' absent');
 const matches=sheets.filter(s=>s.resourceId===id&&s.courseId===courseId);
 assert.equal(matches.length,1,courseId+': fiche '+format+' manquante ou dupliquée '+id);
 const sheet=matches[0];
 assert.equal(sheet.sheetFormat,format,courseId+': sheetFormat attendu '+format+' pour '+id);
 assert.equal(sheet.officialSupport,true,courseId+': fiche '+format+' sans support officiel validé');
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
 assert.notEqual(delivery.sheetResourceId,delivery.infographicSheetResourceId,
  courseId+': les deux fiches doivent être des fichiers DISTINCTS');
 const classic=sheetFor(courseId,delivery.sheetResourceId,'classic',sheets);
 const illustrated=sheetFor(courseId,delivery.infographicSheetResourceId,'complete_infographic',sheets);
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
 if(requirePublishedVerification){
  pdfCheck(courseId,'classique',figures.length,delivery.visualAudit,
    delivery.publishedVerification,classic,delivery.artifactSha256s);
  pdfCheck(courseId,'complète infographiée',withoutFigures?0:1,delivery.infographicSheetVisualAudit,
    delivery.infographicSheetPublishedVerification,illustrated,delivery.artifactSha256s);
  if(withoutFigures){
   for(const [kind,audit] of [['classique',delivery.visualAudit],
                            ['complète infographiée',delivery.infographicSheetVisualAudit]]){
    assert.equal(audit.expectedCount,0,
      courseId+': PDF '+kind+' sans figure : expectedCount doit être 0, pas une fausse illustration');
    assert.equal(audit.checkedCount,0,
      courseId+': PDF '+kind+' sans figure : checkedCount doit être 0');
   }
  }
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
 assert.equal(ids.length,2,courseId+'/'+part.partId+': deux fiches distinctes obligatoires');
 assert.ok(part.sheetResourceId&&part.infographicSheetResourceId,
  courseId+'/'+part.partId+': IDs des deux formats non identifiés');
 assert.ok(ids.includes(part.sheetResourceId)&&ids.includes(part.infographicSheetResourceId),
  courseId+'/'+part.partId+': les deux fiches doivent être déclarées dans sheetResourceIds');
 return validateDualSheetDelivery(courseId,part,sheets);
}
