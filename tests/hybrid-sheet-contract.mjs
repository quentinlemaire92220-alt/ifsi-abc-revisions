// IFSI ABC v1.47 — contrat NON rétroactif de la fiche hybride unique.
// Les packs lean_v1, dual-sheet et single_with_complete_boards restent inchangés.
// Ce garde-fou contrôle les déclarations ; seule la revue humaine vérifie la science
// et la fidélité au modèle maître Pharmacologie P01 de 24 pages (charte privée v1.47).
import assert from 'node:assert/strict';
import {validateSheetSource} from './dual-sheet-contract.mjs';

const hash = value => typeof value==='string' && /^[a-f0-9]{64}$/i.test(value);
const idFrom = sheet => sheet?.driveId || String(sheet?.url||'').match(/\/file\/d\/([\w-]+)/)?.[1];

export function validateHybridDelivery(courseId, delivery, sheets, {requirePublishedVerification=true}={}){
 assert.equal(delivery?.packFormat,'hybrid_v1',courseId+': packFormat hybrid_v1 attendu');
 assert.ok(delivery.sheetResourceId,courseId+': fiche hybride unique absente');
 assert.ok(!delivery.infographicSheetResourceId,courseId+': ancien second PDF interdit pour hybrid_v1');
 assert.ok(!delivery.dualSheetCoverage,courseId+': dualSheetCoverage obsolète pour hybrid_v1');
 assert.deepEqual(delivery.infographicResourceIds||[],[],courseId+': pack de planches séparées interdit par défaut');
 if(delivery.sheetResourceIds!==undefined)
  assert.deepEqual(delivery.sheetResourceIds,[delivery.sheetResourceId],courseId+': une seule fiche doit être déclarée');
 const matching=sheets.filter(s=>s.courseId===courseId && s.resourceId===delivery.sheetResourceId);
 assert.equal(matching.length,1,courseId+': fiche hybride absente ou dupliquée');
 const sheet=matching[0];
 assert.equal(sheet.sheetFormat,'hybrid_infographic',courseId+': sheetFormat hybride attendu');
 validateSheetSource(courseId,delivery,sheet);
 const id=idFrom(sheet);
 assert.ok(/^[\w-]+$/.test(id||'') && /^https:\/\/drive\.google\.com\/file\/d\/[\w-]+/.test(sheet.url||''),
  courseId+': lien Drive réel obligatoire (pas de lien fictif)');
 assert.equal(delivery.schematics,'embedded_only',courseId+': les figures restent intégrées à la fiche');
 assert.ok(Number.isInteger(delivery.embeddedFigureCount) && delivery.embeddedFigureCount>0,
  courseId+': infographies intégrées non attestées');
 const audit=delivery.visualAudit;
 assert.equal(audit?.status,'PASS',courseId+': audit PDF non PASS');
 assert.ok(hash(audit.pdfSha256),courseId+': empreinte PDF manquante');
 assert.ok(Number.isInteger(audit.expectedCount) && audit.expectedCount>=delivery.embeddedFigureCount,
  courseId+': inventaire des visuels incomplet');
 assert.equal(audit.checkedCount,audit.expectedCount,courseId+': visuels non tous inspectés');
 assert.ok(Number.isInteger(audit.pageCount) && audit.pageCount>0,courseId+': nombre de pages invalide');
 assert.equal(audit.pageSize,'A4',courseId+': format PDF non attesté');
 assert.equal(delivery.artifactSha256s?.[id]?.toLowerCase(),audit.pdfSha256.toLowerCase(),
  courseId+': empreinte du PDF et du manifeste divergente');
 const coverage=delivery.hybridCoverage;
 assert.ok(Number.isInteger(coverage?.expectedEssential) && coverage.expectedEssential>0,
  courseId+': matrice des notions essentielles manquante');
 assert.equal(coverage.coveredEssential,coverage.expectedEssential,courseId+': notion essentielle manquante');
 assert.ok(typeof coverage.prioritySourceReference==='string' && coverage.prioritySourceReference.trim(),
  courseId+': provenance des priorités non documentée');
 assert.equal(coverage.medicalReview,'approved',courseId+': revue scientifique non approuvée');
 assert.equal(coverage.readabilityReview,'approved',courseId+': lisibilité non approuvée');
 const model=delivery.hybridVisualReview;
 assert.equal(model?.status,'approved',courseId+': modèle pharmacologie non comparé');
 assert.equal(model.reference,'pharmacologie_v1.47_24_pages',courseId+': référence visuelle obsolète');
 assert.equal(model.pagesChecked,audit.pageCount,courseId+': toutes les pages doivent être comparées');
 const lex=delivery.lexicon;
 assert.ok(Number.isInteger(lex?.termCount)&&lex.termCount>0,courseId+': lexique final absent');
 assert.equal(lex.textSelectable,true,courseId+': lexique non sélectionnable');
 assert.equal(lex.checked,true,courseId+': lexique non revu');
 assert.ok(hash(lex.sourceSha256),courseId+': lexique non tracé sur la source textuelle');
 if(requirePublishedVerification){
  const proof=delivery.publishedVerification;
  assert.equal(proof?.status,'MATCH',courseId+': preuve Drive après publication absente');
  assert.equal(proof.source,'authenticated_drive_download',courseId+': téléchargement Drive authentifié requis');
  assert.equal(proof.pdfSha256?.toLowerCase(),audit.pdfSha256.toLowerCase(),
   courseId+': preuve Drive et PDF divergent');
  assert.equal(proof.expectedCount,audit.expectedCount,courseId+': inventaire des figures modifié sur Drive');
  assert.equal(proof.checkedCount,audit.checkedCount,courseId+': figures Drive non inspectées');
  assert.equal(proof.pageCount,audit.pageCount,courseId+': pagination Drive modifiée');
 }
 // Les contrats QCM/flashcards/vocaux restent contrôlés par leurs validateurs existants.
 return {hybrid:sheet};
}

export function validateHybridPart(courseId,part,sheets,options){
 assert.match(part?.partId||'',/^p\d{2,3}$/,courseId+': partId invalide');
 assert.deepEqual(part.sheetResourceIds,[part.sheetResourceId],courseId+': un PDF hybride par partie');
 return validateHybridDelivery(courseId,part,sheets,options);
}
