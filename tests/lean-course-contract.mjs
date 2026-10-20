// Contrat de livraison pour le pack allégé validé le 20/10/2026.
// Un nouveau cours = deux supports exhaustifs (classique + infographié multipage), QCM, flashcards.
// Les cours historiques continuent de passer dans dual-sheet-contract.mjs.
// Les preuves déclarées ici ne remplacent jamais la revue des PDF et des copies Drive.
import assert from 'node:assert/strict';
import {validateSheetSource} from './dual-sheet-contract.mjs';

const sha=x=>typeof x==='string'&&/^[a-f0-9]{64}$/i.test(x);
const driveId=sheet=>sheet?.driveId||String(sheet?.url||'').match(/\/file\/d\/([\w-]+)/)?.[1];
const nonempty=x=>typeof x==='string'&&x.trim().length>0;
const idPattern=/^[a-zA-Z0-9_-]+$/;

function sheetFor(courseId,resourceId,format,sheets,delivery){
 assert.ok(nonempty(resourceId),courseId+': resourceId de '+format+' absent');
 const found=sheets.filter(s=>s.resourceId===resourceId&&s.courseId===courseId);
 assert.equal(found.length,1,courseId+': fiche absente ou dupliquée : '+resourceId);
 const sheet=found[0];
 assert.equal(sheet.sheetFormat,format,courseId+': mauvais sheetFormat '+resourceId);
 validateSheetSource(courseId,delivery,sheet);
 assert.ok(/^https:\/\/drive\.google\.com\/file\/d\/[\w-]+/.test(sheet.url||''),courseId+': URL Drive invalide pour '+format);
 assert.ok(idPattern.test(driveId(sheet)||''),courseId+': Drive ID invalide pour '+format);
 return sheet;
}

function verifyPdf(courseId,kind,sheet,audit,proof,digests,{minFigures=0,infographic=false,requirePublishedVerification=true}={}){
 assert.equal(audit?.status,'PASS',courseId+': audit PDF '+kind+' absent');
 assert.ok(sha(audit.pdfSha256),courseId+': empreinte audit '+kind+' invalide');
 assert.ok(Number.isInteger(audit.expectedCount)&&audit.expectedCount>=minFigures,courseId+': nombre de figures '+kind+' invalide');
 assert.equal(audit.checkedCount,audit.expectedCount,courseId+': images non toutes inspectées '+kind);
 if(infographic){
  assert.ok(Number.isInteger(audit.pageCount)&&audit.pageCount>=1,courseId+': pages du cours infographié non comptées');
  assert.equal(audit.pageSize,'A4',courseId+': le format A4 n’est pas attesté');
 }
 const id=driveId(sheet);
 assert.equal(digests?.[id]?.toLowerCase(),audit.pdfSha256.toLowerCase(),courseId+': empreinte artifactSha256s incohérente '+kind);
 if(!requirePublishedVerification)return;
 assert.equal(proof?.status,'MATCH',courseId+': preuve Drive après publication absente '+kind);
 assert.equal(proof.source,'authenticated_drive_download',courseId+': téléchargement Drive authentifié requis '+kind);
 assert.equal(proof.pdfSha256?.toLowerCase(),audit.pdfSha256.toLowerCase(),courseId+': empreintes PDF divergentes '+kind);
 assert.equal(proof.expectedCount,audit.expectedCount,courseId+': inventaire PDF Drive non conforme '+kind);
 assert.equal(proof.checkedCount,audit.checkedCount,courseId+': contrôle PDF Drive incomplet '+kind);
 if(infographic)assert.equal(proof.pageCount,audit.pageCount,courseId+': nombre de pages Drive différent du PDF contrôlé');
}

export function validateLeanCourseDelivery(courseId,delivery,sheets,{requirePublishedVerification=true}={}){
 assert.equal(delivery?.packFormat,'lean_v1',courseId+': packFormat lean_v1 absent');
 assert.notEqual(delivery.sheetResourceId,delivery.infographicSheetResourceId,courseId+': les deux PDF doivent être distincts');
 const classic=sheetFor(courseId,delivery.sheetResourceId,'classic',sheets,delivery);
 const illustrated=sheetFor(courseId,delivery.infographicSheetResourceId,'complete_infographic',sheets,delivery);
 assert.notEqual(driveId(classic),driveId(illustrated),courseId+': réutilisation du même PDF Drive');
 assert.ok(Array.isArray(delivery.infographicResourceIds||[]),courseId+': infographicResourceIds invalide');
 const exports=delivery.infographicResourceIds||[];
 assert.equal(new Set(exports).size,exports.length,courseId+': doublons d’exports infographiques');
 // Le visuel peut être inclus dans la fiche sans export séparé.
 assert.ok(['none','embedded_only','with_exports'].includes(delivery.schematics),courseId+': type de schéma non décrit');
 if(delivery.schematics==='with_exports')assert.ok(exports.length>0,courseId+': exports déclarés mais absents');
 else assert.equal(exports.length,0,courseId+': exports présents sans mode with_exports');
 if(delivery.schematics==='none'||delivery.schematics==='embedded_only')
  assert.ok(nonempty(delivery.schematicsJustification)&&delivery.schematicsJustification.trim().length>=30,
   courseId+': justifier le traitement des schémas et des exports (30 caractères)');
 const included=delivery.embeddedFigureCount;
 assert.ok(Number.isInteger(included)&&included>=0,courseId+': nombre de schémas intégrés non déclaré');
 if(delivery.schematics==='none')assert.equal(included,0,courseId+': schematics=none malgré les figures intégrées');
 if(delivery.schematics==='embedded_only')assert.ok(included>0,courseId+': mode embedded_only sans figure');
 verifyPdf(courseId,'classique',classic,delivery.visualAudit,delivery.publishedVerification,
  delivery.artifactSha256s,{minFigures:included,requirePublishedVerification});
 verifyPdf(courseId,'cours infographié complet',illustrated,delivery.infographicSheetVisualAudit,
  delivery.infographicSheetPublishedVerification,delivery.artifactSha256s,
  {infographic:true,requirePublishedVerification});
 const coverage=delivery.dualSheetCoverage;
 assert.ok(coverage&&Number.isInteger(coverage.expectedNotions)&&coverage.expectedNotions>0,courseId+': inventaire des notions absent');
 assert.equal(coverage.classicCovered,coverage.expectedNotions,courseId+': fiche classique incomplète');
 assert.equal(coverage.infographicCovered,coverage.expectedNotions,
  courseId+': cours infographié incomplet : toutes les notions doivent être couvertes');
 if(included||exports.length){
  assert.equal(coverage.medicalReview,'approved',courseId+': revue scientifique/anatomique non approuvée');
 }else{
  assert.equal(coverage.disciplinaryReview?.status,'approved',courseId+': revue disciplinaire/conceptuelle non approuvée');
 }
 assert.ok(coverage.readabilityReview==='approved',courseId+': lisibilité des PDF non approuvée');
 if(delivery.requestedVocals===true){
  assert.ok((delivery.vocals||[]).length>0||(delivery.vocalScripts||[]).length>0,courseId+': vocaux demandés mais absents');
 }
 return {classic,illustrated};
}

export function validateLeanPart(courseId,part,sheets){
 assert.match(part.partId||'',/^p\d{2,3}$/,courseId+': partId invalide');
 const ids=part.sheetResourceIds||[];
 assert.equal(ids.length,2,courseId+': les deux supports PDF de la partie doivent être déclarés');
 assert.ok(ids.includes(part.sheetResourceId)&&ids.includes(part.infographicSheetResourceId),courseId+': resourceId de partie absents');
 return validateLeanCourseDelivery(courseId,part,sheets);
}
