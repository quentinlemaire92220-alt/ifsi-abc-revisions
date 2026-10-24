// IFSI ABC — nouveau contrat écrit v5.3, non rétroactif.
// Métadonnées de TNR uniquement ; la revue du PDF privé reste humaine et obligatoire.
import assert from 'node:assert/strict';
import {validateSheetSource} from './dual-sheet-contract.mjs';

const hash = s => typeof s === 'string' && /^[0-9a-f]{64}$/i.test(s);
const driveId = s => s?.driveId || String(s?.url || '').match(/\/file\/d\/([\w-]+)/)?.[1];
const ok = (v,what) => assert.equal(v,true,what);
export function validateWrittenDelivery(courseId, delivery, sheets, {requirePublishedVerification=true}={}) {
 const label = courseId + ': ';
 assert.equal(delivery?.packFormat,'written_v1',label+'packFormat written_v1 attendu');
 assert.ok(delivery.sheetResourceId,label+'fiche écrite unique absente');
 assert.deepEqual(delivery.sheetResourceIds || [delivery.sheetResourceId],[delivery.sheetResourceId],label+'une seule fiche');
 assert.ok(!delivery.infographicSheetResourceId,label+'second PDF interdit');
 assert.deepEqual(delivery.infographicResourceIds||[],[],label+'planches interdites');
 assert.equal(delivery.schematics,'none',label+'aucun schéma généré');
 assert.equal(delivery.generatedImageCount,0,label+'aucune image générée');
 assert.ok(!delivery.dualSheetCoverage,label+'couverture dual-sheet historique interdite');
 const matches = sheets.filter(x=>x.courseId===courseId&&x.resourceId===delivery.sheetResourceId);
 assert.equal(matches.length,1,label+'ressource absente ou dupliquée');
 const sheet = matches[0];
 assert.equal(sheet.sheetFormat,'written_revision',label+'format écrit attendu');
 validateSheetSource(courseId,delivery,sheet);
 const id=driveId(sheet);
 assert.ok(id&&/^https:\/\/drive\.google\.com\/file\/d\/[\w-]+/.test(sheet.url||''),label+'Drive ID et URL requis');
 const source=delivery.sourceAudit;
 assert.equal(source?.officialChecked,true,label+'support officiel non contrôlé');
 assert.equal(source?.oralStatus,'complete',label+'contrôle des transcriptions incomplet : ne pas déclarer complet');
 assert.equal(source?.speakerStudentSeparated,true,label+'propos étudiants non séparés');
 assert.equal(source?.teachingNotesPrivateTrace,true,label+'traçabilité orale privée absente');
 assert.equal(source?.notesWithoutTimestamps,true,label+'horodatages / traces audio visibles dans la fiche');
 assert.ok(Number.isInteger(source?.externalSourcesCount)&&source.externalSourcesCount>=0,label+'sources externes non inventoriées');
 if(source.externalSourcesCount>0)
  assert.equal(source.externalAuthorization,'explicit_prior_approval',label+'autorisation préalable externe absente');
 const cov=delivery.writtenCoverage;
 assert.ok(Number.isInteger(cov?.expectedEssential)&&cov.expectedEssential>0,label+'matrice des notions essentielles absente');
 assert.equal(cov.coveredEssential,cov.expectedEssential,label+'notions essentielles manquantes');
 ok(cov.explicitVsInferredPrioritiesSeparated,label+'priorités orales explicites et déduites confondues');
 ok(cov.explanationsNotOvercompressed,label+'synthèse trop courte ou nuances sacrifiées');
 assert.equal(cov.disciplinaryReview,'approved',label+'revue disciplinaire manquante');
 const pdf=delivery.writtenPdfAudit;
 assert.equal(pdf?.status,'PASS',label+'QA PDF non PASS');
 assert.ok(hash(pdf.pdfSha256),label+'SHA-256 PDF absent');
 assert.equal(pdf.pageSize,'A4',label+'format A4 absent');
 assert.ok(Number.isInteger(pdf.pageCount)&&pdf.pageCount>0,label+'pagination absente');
 for(const [field,msg] of [
  ['allPagesRendered','toutes les pages non vérifiées'],
  ['topAndBottomPurpleBandsEveryPage','bandeaux violets haut et bas manquants'],
  ['noOverlaidHeaders','couches des bandeaux superposées'],
  ['textSelectable','texte non sélectionnable'],
  ['noImages','une image est présente'],
  ['noClippedText','texte coupé'],
  ['oneQcmPitfallSection','pièges QCM dupliqués'],
  ['summaryBeforeLexicon','synthèse générale mal placée'],
  ['lexiconLast','lexique non final'],
  ['navigationChecked','sommaire non vérifié']
 ]) ok(pdf[field],label+msg);
 assert.equal(delivery.writtenModelReference,'communication_written_v5.3_2026-10-24',label+'référence V5.3 attendue');
 assert.equal(delivery.artifactSha256s?.[id]?.toLowerCase(),pdf.pdfSha256.toLowerCase(),label+'empreintes divergentes');
 const lex=delivery.lexicon;
 assert.ok(Number.isInteger(lex?.termCount)&&lex.termCount>0,label+'lexique absent');
 ok(lex.textSelectable,label+'lexique non sélectionnable');
 ok(lex.checked,label+'lexique non vérifié');
 if(requirePublishedVerification){
  const proof=delivery.publishedVerification;
  assert.equal(proof?.status,'MATCH',label+'preuve publication manquante');
  assert.equal(proof.source,'authenticated_drive_download',label+'preuve Drive authentifiée absente');
  assert.equal(proof.pdfSha256?.toLowerCase(),pdf.pdfSha256.toLowerCase(),label+'SHA publié différent');
 }
 return {written:sheet};
}
export function validateWrittenPart(courseId,part,sheets,options) {
 assert.match(part?.partId||'',/^p\d{2,3}$/,courseId+': partId invalide');
 return validateWrittenDelivery(courseId,part,sheets,options);
}
