// Nouvelle porte de validation, uniquement pour un PDF/visuel nouveau ou modifie.
// La CI ne voit PAS les PDF privés : ce contrat n'atteste pas l'anatomie, il empeche
// de remplacer la revue humaine par "il y a X images" ou un drapeau PASS arbitraire.
import assert from 'node:assert/strict';
import {validateHybridPart} from './hybrid-sheet-contract.mjs';

const digest=x=>typeof x==='string'&&/^[a-f0-9]{64}$/i.test(x);
const driveId=x=>x?.driveId||String(x?.url||'').match(/\/file\/d\/([a-zA-Z0-9_-]+)/)?.[1]||null;
const canonical=x=>Array.isArray(x)?x.map(canonical):x&&typeof x==='object'?
 Object.fromEntries(Object.keys(x).sort().map(k=>[k,canonical(x[k])])):x;
const json=x=>JSON.stringify(canonical(x));

function selectedSheetIds(delivery){
 const ids=[delivery?.sheetResourceId,delivery?.infographicSheetResourceId];
 for(const p of delivery?.partDeliveries||[])
  ids.push(p.sheetResourceId,p.infographicSheetResourceId,...(p.sheetResourceIds||[]));
 return [...new Set(ids.filter(Boolean))].sort();
}

export function visualResourceFingerprint(courseId,delivery,data){
 if(!delivery)return null;
 const ids=selectedSheetIds(delivery);
 const sheets=ids.map(id=>{
  const sheet=(data.sheets||[]).find(s=>s.courseId===courseId&&s.resourceId===id);
  const fileId=driveId(sheet);
  return {id,sheet:sheet||null,pdfSha256:fileId?(delivery.artifactSha256s||{})[fileId]||null:null};
 });
 const graphics=(data.infographics||[]).filter(v=>v.courseId===courseId)
  .map(v=>({metadata:v,imageSha256:v.localImage?(data.imageHashes||{})[v.localImage]||null:null}))
  .sort((a,b)=>String(a.metadata.resourceId).localeCompare(String(b.metadata.resourceId)));
 const boardAudits=delivery.completeBoardAudits||null;
 const referencedGraphics=[...(delivery.infographicResourceIds||[])].sort();
 if(!ids.length&&!graphics.length&&!referencedGraphics.length&&!boardAudits)return null;
 return json({sheets,graphics,referencedGraphics,boardAudits,
  visualAudit:delivery.visualAudit?.pdfSha256||null,
  infographicSheetVisualAudit:delivery.infographicSheetVisualAudit?.pdfSha256||null});
}

export function validateVisualOwnerReview(courseId,delivery,data){
 if(delivery.packFormat==='written_v1'){
  const review=delivery.visualOwnerReview;
  assert.equal(review?.status,'owner_accepted',courseId+': revue du support écrit absente');
  assert.equal(review.reference,'communication_written_v5.3_2026-10-24',courseId+': référence du modèle écrit invalide');
  assert.equal(review.method,'pdf_all_pages_checked',courseId+': inspection complète des pages absente');
  assert.equal(review.reviewerDecision,'explicit_graphic_acceptance',courseId+': validation explicite manquante');
  assert.ok(Number.isInteger(review.pagesChecked)&&review.pagesChecked===delivery.writtenPdfAudit?.pageCount,
    courseId+': toutes les pages ne sont pas examinées');
  assert.equal(review.criteria?.NO_GENERATED_IMAGES,'PASS',courseId+': fiche écrite illustrée à tort');
  assert.equal(review.criteria?.PURPLE_BANDS_EVERY_PAGE,'PASS',courseId+': bandeaux violets absents');
  assert.equal(review.criteria?.TEXT_SELECTABLE,'PASS',courseId+': contenu non sélectionnable');
  assert.equal(review.criteria?.NO_TECHNICAL_NOTES,'PASS',courseId+': marques privées visibles');
  const ids=selectedSheetIds(delivery);
  for(const id of ids){
   const sheet=(data.sheets||[]).find(x=>x.courseId===courseId&&x.resourceId===id);
   assert.ok(sheet,courseId+': fiche inconnue '+id);
   // A PDF hosted on GitHub Pages has no Drive ID. Its immutable review proof
   // is the local artifact ID, still tied to the exact public URL and SHA.
   let digestId=driveId(sheet);
   if(!digestId && delivery.publicationHost==='github_pages'){
    const pub=delivery.publicArtifacts?.sheet;
    const expected=pub?.path && 'https://quentinlemaire92220-alt.github.io/ifsi-abc-revisions/'+pub.path;
    assert.equal(sheet?.url,expected,courseId+': URL PDF Pages différente du fichier revu');
    assert.match(pub?.sha256||'',/^[a-f0-9]{64}$/,courseId+': SHA du PDF Pages absent');
    digestId=pub?.artifactId;
    assert.equal(delivery.artifactSha256s?.[digestId],pub.sha256,
      courseId+': empreinte publiée et manifeste Pages divergents');
   }
   assert.equal(review.reviewedPdfSha256s?.[id],delivery.artifactSha256s?.[digestId],
    courseId+': revue graphique et empreinte de la fiche divergentes');
  }
  return {checkedSheets:ids.length,checkedBoards:0,checkedImages:0};
 }
 const review=delivery.visualOwnerReview;
 assert.equal(review?.status,'owner_accepted',
  courseId+': REVUE VISUELLE BLOQUANTE — accord graphique explicite du proprietaire absent');
 const infographicOnly=delivery.publicationScope==='infographics_only';
 const isHybrid=delivery.packFormat==='hybrid_v1';
 const requiredModel=isHybrid?'pharmacologie_v1.47_24_pages':
  infographicOnly?'cardiovascular_infographic_pdf_1p':'cardiovascular_revision_pdf_17p';
 assert.equal(review.reference,requiredModel,
  courseId+': comparaison au vrai modèle de référence manquante ('+requiredModel+')');
 const legalHybrid=isHybrid && delivery.discipline==='legal';
 const requiredMethod=legalHybrid?'pdf_all_pages_checked_plus_owner_graphic_acceptance':'manual_full_pdf_comparison_100_200_percent';
 assert.equal(review.method,requiredMethod,
  courseId+': inspection page par page et zoom 100-200 % non attestes');
 assert.ok(typeof review.reviewedAt==='string'&&/^\d{4}-\d{2}-\d{2}T/.test(review.reviewedAt)&&
  Number.isFinite(Date.parse(review.reviewedAt)),courseId+': date de la revue humaine absente');
 assert.equal(review.reviewerDecision,'explicit_graphic_acceptance',
  courseId+': ne pas transformer un GO production en validation graphique');
 for(const k of [...(infographicOnly?[]:['REVISION_TEXT_FIRST']),
  ...(legalHybrid?['LEGAL_DIAGRAMS_EXPLICATIVE']:['MEDICAL_ILLUSTRATION_REAL']),'INTEGRATED_IN_CONTEXT',
  'ORIGINAL_LEGENDS_VERIFIED','NO_DECORATIVE_BOX_SUBSTITUTION','ALL_PAGES_CHECKED']){
  assert.equal(review.criteria?.[k],'PASS',
   courseId+': revue graphique manuelle '+k+' non approuvee');
 }
 const hasCompleteInfographic=Boolean(delivery.infographicSheetResourceId
  ||delivery.revisionSheetMode==='single_with_complete_boards'
  ||(delivery.partDeliveries||[]).some(p=>p.infographicSheetResourceId));
 if(hasCompleteInfographic)assert.equal(review.criteria?.INFOGRAPHIC_VISUAL_FIRST,'PASS',
  courseId+': INFOGRAPHIC_VISUAL_FIRST — cours/planche infographiee autonome non approuve graphiquement');
 if(infographicOnly){
  assert.equal(review.criteria?.INFOGRAPHIC_VISUAL_FIRST,'PASS',
   courseId+': INFOGRAPHIC_VISUAL_FIRST — pack infographie non valide');
  const id=delivery.infographicPackDriveId, live=(delivery.artifactSha256s||{})[id];
  assert.ok(digest(live),courseId+': SHA-256 pack infographies absent');
  assert.equal(review.reviewedPackSha256,live,
   courseId+': le pack infographies a change apres la validation visuelle');
  assert.equal(delivery.reviewedBoardCount,16,courseId+': la revue du lot doit couvrir 16 planches');
 }
 const ids=selectedSheetIds(delivery);
 for(const id of ids){
  const sheet=(data.sheets||[]).find(s=>s.courseId===courseId&&s.resourceId===id);
  assert.ok(sheet,courseId+': fiche non repertoriee '+id);
  const idDrive=driveId(sheet);
  const live=idDrive?(delivery.artifactSha256s||{})[idDrive]:null;
  assert.ok(digest(live),courseId+': SHA-256 PDF fiche absent '+id);
  assert.equal(review.reviewedPdfSha256s?.[id],live,
   courseId+': la revue graphique ne correspond pas aux octets de '+id);
 }
 for(const [id,board] of Object.entries(delivery.completeBoardAudits||{})){
  const live=board?.driveId?(delivery.artifactSha256s||{})[board.driveId]:null;
  assert.ok(digest(live),courseId+': SHA-256 planche absente '+id);
  assert.equal(review.reviewedBoardSha256s?.[id],live,
   courseId+': planche infographique non revue ou modifiee '+id);
 }
 const graphics=(data.infographics||[]).filter(x=>x.courseId===courseId&&x.localImage);
 for(const image of graphics){
  const live=(data.imageHashes||{})[image.localImage];
  assert.ok(digest(live),courseId+': empreinte image absente '+image.resourceId);
  assert.equal(review.reviewedImageSha256s?.[image.resourceId],live,
   courseId+': image infographique non revue ou modifiee '+image.resourceId);
 }
 return {checkedSheets:ids.length,checkedBoards:Object.keys(delivery.completeBoardAudits||{}).length,
  checkedImages:graphics.length};
}

export function requireVisualReviewIfChanged(courseId,prior,next,oldData,newData){
 // Migration dédiée A2.1 : l'ancien test « complément ajouté » imposait que
 // les fiches restent actives. Ici elles sont archivées, jamais effacées.
 if(courseId==='droits_patients' && next?.historicalSheetMigration?.status==='archived_in_catalog_only'){
  const before=(oldData.sheets||[]).filter(x=>x.courseId===courseId);
  const after=(newData.sheets||[]).filter(x=>x.courseId===courseId);
  const ids=['droits_patients_fiche_p01','droits_patients_fiche_infographiee_p01',
   'droits_patients_fiche_complement_p01_20261021'];
  assert.equal(before.length,3,'Le lot source ne comporte pas les trois anciennes fiches');
  assert.equal(after.length,4,'La migration doit conserver trois archives et ajouter une fiche');
  for(const id of ids){
   const old=before.find(x=>x.resourceId===id);
   const archived=after.find(x=>x.resourceId===id);
   assert.ok(old&&archived,'Archive historique manquante '+id);
   assert.deepEqual(archived,{...old,sourceStatus:'archived'},
    'Archive altérée autrement que par son statut '+id);
  }
  const active=after.filter(x=>x.sourceStatus!=='archived');
  assert.equal(active.length,1,'Plusieurs fiches actives à l'+'issue de la fusion');
  assert.equal(active[0].resourceId,'droits_patients_fiche_unique_20261029');
  assert.equal(active[0].primaryRevision,true);
  const prevGraphics=(oldData.infographics||[]).filter(x=>x.courseId===courseId);
  const nextGraphics=(newData.infographics||[]).filter(x=>x.courseId===courseId);
  assert.deepEqual(nextGraphics,prevGraphics,'Infographie historique modifiée');
  for(const graphic of prevGraphics.filter(x=>x.localImage))
   assert.equal(newData.imageHashes?.[graphic.localImage],oldData.imageHashes?.[graphic.localImage],
    'Octets de la planche historique modifiés');
  const expected=next.publicArtifacts?.sheet?.sha256;
  assert.match(expected||'',/^[a-f0-9]{64}$/,'Empreinte du PDF consolidé absente');
  const meta=next.metadataOnlyCorrection;
  assert.equal(meta?.toSha256,expected,'Correction métadonnées sans correspondance des octets');
  assert.equal(meta?.fromSha256,
   '5dafe4f29b9d374e069bc5eabef5bb830656dc8b18f1eb24d387249c73d84361',
   'Source de la correction métadonnées modifiée');
  assert.equal(meta?.contentStreamsIdentical,true,'Flux de dessin non conservés');
  assert.equal(meta?.allPagesTextIdentical,true,'Texte des 42 pages non conservé');
  assert.equal(meta?.allPageLinksIdentical,true,'Liens internes non conservés');
  assert.equal(next.visualAudit?.pageCount,42,'Audit graphique de 42 pages absent');
  assert.equal(next.visualAudit?.pdfSha256,expected,'Audit non rattaché à la V8');
  assert.equal(next.templateConformance?.artifacts?.sheet?.ownerApproval,'user_message_2026_10_29',
   'Validation visuelle du contenu précédent non retrouvée');
  // Cette exception ne vaut PAS revue sémantique exhaustive ou reçu public.
  // Les portes dédiées v1.49 et publication HTTP restent indépendantes.
  return true;
 }
 // Une première déclaration de livraison QCM ne doit pas inventer une nouvelle fiche.
 // L'exemption est strictement limitée à zéro nouvelle association visuelle et aux octets
 // du catalogue historique de fiches/infographies conservés sans mutation.
 if(!prior && selectedSheetIds(next).length===0 &&
    JSON.stringify((oldData.sheets||[]).filter(x=>x.courseId===courseId))===JSON.stringify((newData.sheets||[]).filter(x=>x.courseId===courseId)) &&
    JSON.stringify((oldData.infographics||[]).filter(x=>x.courseId===courseId))===JSON.stringify((newData.infographics||[]).filter(x=>x.courseId===courseId)))
   return false;
 const prev=visualResourceFingerprint(courseId,prior,oldData);
 const curr=visualResourceFingerprint(courseId,next,newData);
 if(curr===null||prev===curr)return false; // aucune nouvelle fiche/illustration
 // Un complément hybride ne réouvre pas la validation des PDF historiques intacts.
 // L'exemption est limitée à une addition : retirer le complément doit restituer
 // exactement l'ancienne empreinte visuelle (PDF, images, audits et associations).
 const supplements=(next.partDeliveries||[]).filter(p=>p.deliveryMode==='existing_course_complement');
 if(prior&&supplements.length){
  const ids=new Set(supplements.map(p=>p.sheetResourceId));
  const historic={...next,partDeliveries:(next.partDeliveries||[]).map(p=>ids.has(p.sheetResourceId)?{
   ...p,sheetResourceId:undefined,sheetResourceIds:[]
  }:p)};
  const newRows=(newData.sheets||[]).filter(s=>s.courseId===courseId&&!oldData.sheets.some(o=>o.courseId===courseId&&o.resourceId===s.resourceId));
  assert.equal(newRows.length,ids.size,courseId+': seules les fiches de complément déclarées sont autorisées');
  assert.equal(visualResourceFingerprint(courseId,historic,newData),prev,
   courseId+': une fiche/illustration historique a changé pendant l’ajout du complément');
  for(const p of supplements){
   validateHybridPart(courseId,p,newData.sheets);
   const row=newRows.find(s=>s.resourceId===p.sheetResourceId);
   assert.ok(row,courseId+': le complément doit être une nouvelle fiche');
   assert.equal(row.primaryRevision,false,courseId+': le complément ne remplace pas le cours historique');
   const review=p.ownerReview;
   assert.equal(review?.status,'owner_accepted',courseId+': complément non accepté');
   assert.equal(review.pdfSha256,p.visualAudit.pdfSha256,courseId+': PDF modifié après revue');
   assert.equal(review.pagesChecked,p.visualAudit.pageCount,courseId+': revue de pages incomplète');
   assert.equal(review.visualReference,'pharmacologie_v1.47_24_pages');
   assert.equal(review.scientificReview,'documentary_review_completed');
   assert.equal(review.independentMedicalReview,'not_attested');
   assert.equal((next.artifactSha256s||{})[driveId(row)],review.pdfSha256);
  }
  return true;
 }
 validateVisualOwnerReview(courseId,next,newData);
 return true;
}
