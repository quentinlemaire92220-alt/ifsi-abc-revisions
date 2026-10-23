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
