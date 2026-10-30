// Publication additive d'une fiche : les contrats historiques restent intacts.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {readFileSync,existsSync} from 'node:fs';
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
const same=(a,b,message)=>assert.deepEqual(canonical(a),canonical(b),message);
const hash=v=>createHash('sha256').update(JSON.stringify(canonical(v))).digest('hex');
export const revisionSheetDigest=(revision,row)=>hash({revision:Object.fromEntries(Object.entries(revision).filter(([k])=>k!=='publicationApproval')),row});
export function validateRevisionSheetSupplement(courseId,delivery,data){
 const r=delivery.revisionSheetSupplement;if(!r)return null;
 const rows=data.sheets.filter(x=>x.courseId===courseId&&x.resourceId===r.resourceId);
 assert.equal(rows.length,1,courseId+': fiche supplémentaire absente/dupliquée');
 const row=rows[0],a=r.publicationApproval;
 const asset=r.publicAsset;
 if(asset){
  assert.equal(courseId,'psychologie_sante','Nouvelle fiche Pages non autorisée sur un autre cours');
  assert.equal(row.sheetFormat,'written_revision','Une fiche écrite ne doit pas se déclarer infographique');
  assert.equal(row.primaryRevision,true);
  assert.equal(asset.artifactId,'psychologie_sante_fiche_unique_20p_20261027');
  assert.match(asset.path,/^assets\/psychologie-sante-20261027\/[A-Za-z0-9_]+\.pdf$/);
  assert.equal(row.url,'https://quentinlemaire92220-alt.github.io/ifsi-abc-revisions/'+asset.path);
  assert.equal(row.driveId,undefined,'Les ressources Pages ne doivent pas usurper un Drive ID');
  assert.equal(asset.sha256,r.pdfSha256,'Empreinte source et ressource Pages différentes');
  assert.ok(existsSync(asset.path),'Fiche Pages absente');
  assert.equal(createHash('sha256').update(readFileSync(asset.path)).digest('hex'),r.pdfSha256,'Octets de la fiche modifiés');
  const review=r.templateConformance?.artifacts?.sheet;
  assert.equal(r.templateConformance?.contract,'ifsi_pdf_template_v3');
  assert.equal(review?.artifactSha256,r.pdfSha256);
  assert.equal(review?.pageCount,r.pageCount);
  assert.equal(review?.status,'owner_accepted');
 }else{
  assert.equal(row.sheetFormat,'hybrid_infographic');assert.equal(row.primaryRevision,true);
  assert.equal(row.driveId,r.driveId);assert.ok(row.url.startsWith('https://drive.google.com/file/d/'+r.driveId+'/'));
 }
 assert.equal(row.pageCount,r.pageCount);assert.ok(Number.isInteger(r.pageCount)&&r.pageCount>0);
 assert.equal(row.provisional,r.provisional);assert.ok(Number.isInteger(r.lexiconTermCount)&&r.lexiconTermCount>0);
 assert.match(r.pdfSha256,/^[a-f0-9]{64}$/);
 assert.equal(r.visualAudit.status,'PASS');assert.equal(r.visualAudit.pdfSha256,r.pdfSha256);
 assert.ok(r.visualAudit.expectedCount>0);assert.equal(r.visualAudit.checkedCount,r.visualAudit.expectedCount);
 assert.equal(r.visualAudit.pageCount,r.pageCount);
 assert.equal(r.publishedVerification.status,'MATCH');assert.equal(r.publishedVerification.source,'authenticated_drive_download');
 for(const k of ['pdfSha256','expectedCount','checkedCount','pageCount'])same(r.publishedVerification[k],r.visualAudit[k],'Preuve Drive différente : '+k);
 assert.equal(r.ownerReview.status,'owner_accepted');assert.equal(r.ownerReview.pdfSha256,r.pdfSha256);
 assert.equal(r.ownerReview.pagesChecked,r.pageCount);
 assert.equal(r.ownerReview.visualReference,r.publicAsset?'communication_written_v5.3_2026-10-24':'pharmacologie_v1.47_24_pages');
 assert.equal(r.ownerReview.scientificReview,'documentary_review_completed');
 assert.equal(r.ownerReview.independentMedicalReview,'not_attested');
 assert.equal(a?.status,'approved');assert.equal(a.authorization,'explicit_go_publication');
 assert.equal(a.scope,'revision_sheet_only');
 assert.ok(Number.isFinite(Date.parse(a.approvedAt)));
 // An archived row retains its original approval; only its visibility changes.
 const officialArchive=delivery.officialRevision?.contract==='psychologie_sante_official_revision_v1' &&
  delivery.publicationApproval?.status==='approved' && row.sourceStatus==='archived' &&
  delivery.officialRevision.archivedSheetResourceIds?.includes(row.resourceId);
 const reviewedRow=officialArchive?{...row,sourceStatus:'active'}:row;
 assert.equal(a.bundleSha256,revisionSheetDigest(r,reviewedRow),'Fiche changée après accord');
 if(!r.nativeSupportAvailable)assert.equal(r.provisional,true,'Réserve support natif effacée');
 if(data.registry?.courses.find(c=>c.id===courseId)?.nativeSupportAvailable===false)assert.equal(r.nativeSupportAvailable,false);
 if(r.provisional){assert.equal(row.officialSupport,false);assert.equal(r.nativeSupportAvailable,false);}
 return row;
}
export function validateRevisionSheetChange(id,prior,next,oldData,newData){
 const row=validateRevisionSheetSupplement(id,next,newData);
 assert.ok(prior&&row,id+': révision réservée à un cours existant');
 const without=d=>Object.fromEntries(Object.entries(d).filter(([k])=>k!=='revisionSheetSupplement'));
 same(without(next),without(prior),id+': manifeste historique modifié hors fiche');
 const before=oldData.sheets.filter(x=>x.courseId===id),after=newData.sheets.filter(x=>x.courseId===id);
 const oldRows=before.filter(x=>x.resourceId!==row.resourceId);
 same(after.filter(x=>x.resourceId!==row.resourceId),oldRows,id+': anciennes fiches modifiées/supprimées');
 assert.equal(after.length,oldRows.length+1,id+': une seule fiche autorisée');
 same(oldData.registry.courses.find(c=>c.id===id),newData.registry.courses.find(c=>c.id===id),id+': registre modifié');
 for(const key of ['vocals','infographics'])same(oldData[key].filter(x=>x.courseId===id),newData[key].filter(x=>x.courseId===id),id+': '+key+' modifiés');
 for(const p of new Set([...Object.keys(oldData.banks||{}),...Object.keys(newData.banks||{})]))
  same((oldData.banks[p]||[]).filter(x=>x.courseId===id),(newData.banks[p]||[]).filter(x=>x.courseId===id),id+': QCM/flashcards modifiés');
 same((oldData.vocabulary||[]).filter(x=>x.courseIds?.includes(id)),(newData.vocabulary||[]).filter(x=>x.courseIds?.includes(id)),id+': vocabulaire modifié');
 const images=newData.infographics.filter(x=>x.courseId===id&&x.localImage);
 for(const x of images)same(oldData.imageHashes[x.localImage],newData.imageHashes[x.localImage],id+': image historique modifiée');
 return row;
}
