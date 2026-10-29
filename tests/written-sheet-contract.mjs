// IFSI ABC — nouveau contrat écrit v5.3, non rétroactif.
// Métadonnées de TNR uniquement ; la revue du PDF privé reste humaine et obligatoire.
import assert from 'node:assert/strict';
import {validateSheetSource} from './dual-sheet-contract.mjs';

const hash = s => typeof s === 'string' && /^[0-9a-f]{64}$/i.test(s);
const driveId = s => s?.driveId || String(s?.url || '').match(/\/file\/d\/([\w-]+)/)?.[1];
const ok = (v,what) => assert.equal(v,true,what);
export function validateWrittenDelivery(courseId, delivery, sheets, {requirePublishedVerification=true}={}) {
 const label = courseId + ': ';
 const provisional=delivery?.provisional===true && delivery?.deliveryMode==='source_limited_first_release';
 if(provisional){
  assert.equal(delivery.pedagogicalValidated,false,label+'une source orale ne prouve pas une validation scientifique');
  assert.equal(delivery.status,'partial',label+'une livraison provisoire doit rester partielle');
  assert.equal(delivery.publicationHost,'github_pages',label+'seuls des PDF traçables sur Pages sont autorisés');
  assert.equal(delivery.provisionalReassessmentRequired,true,label+'réévaluation obligatoire absente');
 }

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
 const isPages=delivery.publicationHost==='github_pages';
 const githubPageArtifactContract=Boolean(isPages&&delivery.deliveryMode==='source_limited_first_release'&&delivery.publicArtifacts?.sheet);
 let urlOK=false;
 try {
  const u=new URL(sheet.url||'');
  urlOK=u.protocol==='https:' && (isPages
   ? u.hostname.endsWith('.github.io') && u.pathname.includes('/assets/') && u.pathname.endsWith('.pdf')
   : u.hostname==='drive.google.com' && u.pathname.startsWith('/file/d/'));
 } catch {}
 if(githubPageArtifactContract){
  const published=delivery.publicArtifacts?.sheet;
  assert.ok(urlOK&&published?.artifactId&&published?.path,
   label+'PDF Pages identifié et publiable requis');
  const expected='https://quentinlemaire92220-alt.github.io/ifsi-abc-revisions/'+published.path;
  assert.equal(sheet.url,expected,label+'lien Pages doit pointer vers les octets du lot déclaré');
  assert.equal(delivery.artifactSha256s?.[published.artifactId],published.sha256,
   label+'empreinte du document hébergé absente');
 }else assert.ok(id&&urlOK,label+'Drive ID et lien étudiant publiable requis');
 if(isPages)assert.equal(delivery.publicAssetSha256?.toLowerCase(),delivery.writtenPdfAudit?.pdfSha256?.toLowerCase(),label+'empreinte du PDF public divergente');
 const source=delivery.sourceAudit;
 if(provisional){
  const supportReceived=delivery.sourceBasis?.nativeSupportAvailable===true;
  if(supportReceived){
    assert.equal(source?.officialChecked,true,label+'support officiel reçu mais non vérifié');
    assert.equal(source?.officialSupportMissing,false,label+'support officiel reçu déclaré absent');
    assert.ok(!source?.missingSources?.includes('written_official_support'),label+'absence du support obsolète');
    assert.ok(source?.missingSources?.includes('original_audio_comparison'),label+'comparaison audio manquante non tracée');
    assert.ok(typeof source?.scopedReviewBasis==='string'&&source.scopedReviewBasis.length>25,
      label+'portée de la revue du TD non décrite');
  }else{
    assert.equal(source?.officialChecked,false,label+'une transcription n’est pas un support officiel');
    assert.equal(source?.officialSupportMissing,true,label+'absence du support officiel non déclarée');
    assert.ok(source?.missingSources?.includes('written_official_support'),label+'source manquante non inventoriée');
  }
  assert.equal(source?.scopedReleaseAccepted,true,label+'provisional non autorisé pour ce périmètre');
  assert.equal(source?.oralCoverageExhaustive,false,label+'exhaustivité orale supposée');
  assert.equal(source?.recordingTailTruncated,false,label+'troncature inventée');
 }else assert.equal(source?.officialChecked,true,label+'support officiel non contrôlé');
 if(provisional){
  assert.equal(source?.oralStatus,'unverified',label+'statut oral provisoire inexact');
  assert.equal(delivery.status,'partial',label+'publication incomplète déclarée complète');
 }else if(source?.oralStatus==='incomplete_tail') {
  // Autoriser une publication PARTIELLEMENT SOURCÉE et explicitement limitée :
  // aucun faux « complete », aucune prétention à une revue orale exhaustive.
  assert.equal(source.recordingTailTruncated,true,label+'troncature de PT02 non documentée');
  assert.equal(source.oralCoverageExhaustive,false,label+'revue orale exhaustive faussement affirmée');
  assert.equal(source.scopedReleaseAccepted,true,label+'validation expresse du périmètre incomplet absente');
  assert.ok(typeof source.scopedReviewBasis==='string'&&source.scopedReviewBasis.length>25,
   label+'périmètre des sources vérifiées non décrit');
  assert.ok(delivery.blockers?.some(x=>x.resource==='transcription_pt02'&&x.reason==='incomplete_tail'),
   label+'réserve PT02 absente du manifeste public');
  assert.equal(delivery.status,'partial',label+'livraison oralement incomplète déclarée complète');
 } else assert.equal(source?.oralStatus,'complete',label+'contrôle des transcriptions incomplet : ne pas déclarer complet');
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
 assert.equal(cov.disciplinaryReview,provisional?'provisional_oral_only':'approved',label+'revue disciplinaire annoncée à tort');
 if(provisional){
  assert.ok(typeof cov.disciplinaryReviewScope==='string'&&cov.disciplinaryReviewScope.length>25,label+'limite pédagogique non décrite');
 }
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
 if(githubPageArtifactContract){
  const pub=delivery.publicArtifacts.sheet;
  assert.equal(pub.sha256?.toLowerCase(),pdf.pdfSha256.toLowerCase(),label+'empreinte Pages divergente');
  assert.equal(delivery.artifactSha256s?.[pub.artifactId]?.toLowerCase(),pdf.pdfSha256.toLowerCase(),label+'SHA Pages non tracé');
 }else assert.equal(delivery.artifactSha256s?.[id]?.toLowerCase(),pdf.pdfSha256.toLowerCase(),label+'empreintes divergentes');
 const lex=delivery.lexicon;
 assert.ok(Number.isInteger(lex?.termCount)&&lex.termCount>0,label+'lexique absent');
 ok(lex.textSelectable,label+'lexique non sélectionnable');
 ok(lex.checked,label+'lexique non vérifié');
 if(requirePublishedVerification){
  const proof=delivery.publishedVerification;
  if(provisional){
   assert.equal(proof?.status,'PENDING_DEPLOYMENT',label+'preuve de déploiement à confirmer : ne pas annoncer MATCH');
   assert.equal(proof.source,'github_pages_file_staged',label+'une copie locale ne prouve pas un fichier distant');
   assert.equal(delivery.publicArtifacts?.sheet?.sha256,pdf.pdfSha256,label+'SHA PDF Pages absent');
  }else{
   assert.equal(proof?.status,'MATCH',label+'preuve publication manquante');
   assert.equal(proof.source,'authenticated_drive_download',label+'preuve Drive authentifiée absente');
  }
  assert.equal(proof.pdfSha256?.toLowerCase(),pdf.pdfSha256.toLowerCase(),label+'SHA publié différent');
 }
 return {written:sheet};
}
export function validateWrittenPart(courseId,part,sheets,options) {
 assert.match(part?.partId||'',/^p\d{2,3}$/,courseId+': partId invalide');
 return validateWrittenDelivery(courseId,part,sheets,options);
}
