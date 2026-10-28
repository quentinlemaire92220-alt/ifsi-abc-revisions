// Publication ciblée : une fiche écrite approuvée, sans QCM ni flashcards implicites.
// Contrat additif ; tous les contrôles des packs complets restent inchangés.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {validateSheetSource} from './dual-sheet-contract.mjs';
import {validateStressAddonRuntime} from './stress-qcm-flashcards-addon.mjs';

const hash=x=>typeof x==='string'&&/^[a-f0-9]{64}$/.test(x);
const BASE='https://quentinlemaire92220-alt.github.io/ifsi-abc-revisions/';

export function validateSheetOnlyFirstRelease(course,delivery,sheets,{questions=[],deck=[],vocals=[],infographics=[]}={}){
 const id=delivery?.courseId,tag=id+': ';
 assert.equal(delivery.deliveryMode,'sheet_only_first_release',tag+'mode invalide');
 assert.equal(delivery.publicationScope,'revision_sheet_only',tag+'GO non restreint à la fiche');
 assert.equal(delivery.packFormat,'written_v1',tag+'seul le standard écrit V5.3 est accepté');
 assert.equal(delivery.status,'partial',tag+'une fiche seule ne constitue pas un cours complet');
 assert.equal(delivery.publicationHost,'github_pages',tag+'PDF local GitHub Pages requis');
 assert.equal(delivery.validated,true,tag+'fiche non validée');
 assert.equal(course?.id,id,tag+'identifiant du cours inconnu');
 assert.equal(course.officialSupport,true,tag+'support officiel non attesté');
 assert.equal(delivery.sourceAudit?.officialChecked,true,tag+'support officiel non rapproché');
 assert.equal(delivery.sourceAudit?.oralStatus,'complete',tag+'oral non contrôlé');
 assert.equal(delivery.sourceAudit?.speakerStudentSeparated,true,tag+'propos étudiants et intervenant confondus');
 assert.equal(delivery.sourceAudit?.teachingNotesPrivateTrace,true,tag+'traçabilité PLAUD non conservée');
 assert.equal(delivery.sourceAudit?.notesWithoutTimestamps,true,tag+'horodatages dans la fiche');
 assert.equal(delivery.sourceAudit?.externalSourcesCount,0,tag+'sources externes non autorisées');
 assert.ok(delivery.writtenCoverage?.expectedEssential>0,tag+'matrice pédagogique absente');
 assert.equal(delivery.writtenCoverage.coveredEssential,delivery.writtenCoverage.expectedEssential,
  tag+'notions perdues');
 assert.equal(delivery.writtenCoverage.explicitVsInferredPrioritiesSeparated,true,
  tag+'priorités orales non séparées');
 assert.equal(delivery.writtenCoverage.explanationsNotOvercompressed,true,
  tag+'explications insuffisantes');
 if(delivery.qcmFlashcardsSupplement)validateStressAddonRuntime(course,delivery,sheets,{questions,deck});
 else assert.ok(delivery.blockers?.some(x=>x.resource==='qcm'&&x.reason==='not_requested'),
  tag+'QCM absent non signalé');
 if(!delivery.qcmFlashcardsSupplement)assert.ok(delivery.blockers?.some(x=>x.resource==='flashcards'&&x.reason==='not_requested'),
  tag+'flashcards absentes non signalées');
 assert.deepEqual(delivery.infographicResourceIds||[],[],tag+'infographies artificielles');
 assert.deepEqual(delivery.vocals||[],[],tag+'vocaux artificiels');
 assert.equal(delivery.generatedImageCount,0,tag+'images interdites pour la fiche écrite');
 assert.equal(delivery.schematics,'none',tag+'schémas interdits pour la fiche écrite');
 if(!delivery.qcmFlashcardsSupplement)assert.equal((questions||[]).filter(x=>x.courseId===id).length,0,tag+'QCM non autorisés');
 if(!delivery.qcmFlashcardsSupplement)assert.equal((deck||[]).filter(x=>x.courseId===id).length,0,tag+'flashcards non autorisées');
 assert.equal((vocals||[]).filter(x=>x.courseId===id).length,0,tag+'audios non autorisés');
 assert.equal((infographics||[]).filter(x=>x.courseId===id).length,0,tag+'infographies non autorisées');
 assert.equal(sheets.filter(x=>x.courseId===id).length,1,tag+'une fiche unique attendue');
 const sheet=sheets.find(x=>x.courseId===id&&x.resourceId===delivery.sheetResourceId);
 assert.ok(sheet,tag+'fiche absente ou ID erroné');
 assert.equal(sheet.sheetFormat,'written_revision',tag+'format de fiche invalide');
 assert.equal(sheet.officialSupport,true,tag+'provenance du support incorrecte');
 validateSheetSource(id,delivery,sheet);
 const pub=delivery.publicArtifacts?.sheet;
 assert.ok(pub&&hash(pub.sha256),tag+'déclaration asset SHA absente');
 assert.match(pub.path||'',/^assets\/[a-z0-9-]+\/[\w-]+\.pdf$/,tag+'chemin asset invalide');
 assert.equal(sheet.url,BASE+pub.path,tag+'URL étudiante et asset divergent');
 assert.equal(pub.artifactId,delivery.sheetResourceId,tag+'ID de ressource non canonique');
 assert.equal(delivery.artifactSha256s?.[pub.artifactId],pub.sha256,tag+'SHA manifeste divergent');
 assert.equal(delivery.publicAssetSha256,pub.sha256,tag+'SHA de livraison divergent');
 assert.equal(delivery.writtenPdfAudit?.pdfSha256,pub.sha256,tag+'SHA revue différent');
 assert.equal(delivery.writtenPdfAudit?.pageCount,pub.pageCount,tag+'pagination incohérente');
 assert.equal(delivery.writtenPdfAudit?.status,'PASS',tag+'QA PDF non validée');
 for(const k of ['allPagesRendered','topAndBottomPurpleBandsEveryPage','textSelectable','noImages',
  'noClippedText','oneQcmPitfallSection','summaryBeforeLexicon','lexiconLast','navigationChecked'])
  assert.equal(delivery.writtenPdfAudit?.[k],true,tag+'QA non satisfaite : '+k);
 assert.equal(delivery.lexicon?.termCount,50,tag+'50 définitions attendues');
 assert.equal(delivery.lexicon?.textSelectable,true,tag+'lexique non sélectionnable');
 const rev=delivery.visualOwnerReview;
 assert.equal(rev?.status,'owner_accepted',tag+'GO graphique absent');
 assert.equal(rev.reference,'communication_written_v5.3_2026-10-24',tag+'modèle non vérifié');
 assert.equal(rev.pagesChecked,pub.pageCount,tag+'pages non toutes examinées');
 assert.equal(rev.reviewedPdfSha256s?.[delivery.sheetResourceId],pub.sha256,
  tag+'GO graphique portant sur un autre PDF');
 assert.equal(delivery.templateConformance?.contract,'ifsi_pdf_template_v3',tag+'trame V3 absente');
 assert.equal(delivery.templateConformance?.artifacts?.sheet?.artifactSha256,pub.sha256,
  tag+'template signé sur un autre PDF');
 assert.equal(delivery.publicationApproval?.status,'approved',tag+'GO publication absent');
 assert.equal(delivery.publicationApproval?.scope,'revision_sheet_only',
  tag+'GO de fiche extrapolé à un pack complet');
 assert.equal(delivery.publicationApproval?.authorization,'explicit_go_publication',
  tag+'autorisation de publication absente');
 assert.ok(['PENDING_DEPLOYMENT','MATCH'].includes(delivery.publishedVerification?.status),
  tag+'statut de déploiement inconnu');
 if(delivery.publishedVerification.status==='PENDING_DEPLOYMENT')
  assert.equal(delivery.publishedVerification.source,'github_pages_file_staged',
   tag+'un PDF staged ne prouve pas un déploiement');
 else assert.equal(delivery.publishedVerification.source,'github_pages_verified',
   tag+'MATCH doit provenir de Pages, pas du Drive');
 assert.equal(delivery.publishedVerification.pdfSha256,pub.sha256,tag+'SHA du déploiement incohérent');
 assert.ok(fs.existsSync(pub.path),tag+'PDF absent du dépôt');
 const bytes=fs.readFileSync(pub.path);
 assert.equal(bytes.subarray(0,4).toString('ascii'),'%PDF',tag+'PDF corrompu');
 assert.equal(createHash('sha256').update(bytes).digest('hex'),pub.sha256,tag+'PDF différent des octets approuvés');
 return {courseId:id,artifact:pub.path,pages:pub.pageCount,sha256:pub.sha256};
}
