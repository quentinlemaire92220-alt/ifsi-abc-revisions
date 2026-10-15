import assert from 'node:assert/strict';

// V1.15 : contrôle des ETATS uniquement. Aucun contenu ni référence de source
// personnelle n'entre dans les données de test ou dans le dépôt public.
const sourceStates=new Set(['TRANSCRIPT_ONLY','SCREENSHOTS_ONLY','MIXED_PARTIAL','SOURCE_UNVERIFIED','OFFICIAL_RECEIVED','RECONCILIATION_PENDING','OFFICIAL_VERIFIED']);
const assetStates=new Set(['NOT_STARTED','DRAFT_PRIVATE','EXISTING_NEEDS_RECONCILIATION','PRIVATE_REVIEW','CORRECTIONS_NEEDED','REVIEWED_COMPLETE']);
const publishStates=new Set(['NOT_AUTHORIZED','HISTORIC_PUBLICATION','EXPLICIT_GO_RECORDED']);
const hash=v=>typeof v==='string'&&/^[0-9a-f]{64}$/i.test(v);
export function validateFollowup(row){
 assert.ok(row&&/^[a-z0-9_-]+$/.test(row.courseId||''),'courseId invalide');
 assert.equal(row.key,row.courseId+'::'+row.partId,'Clé partie incorrecte');
 assert.ok(sourceStates.has(row.sourceStatus),'Statut de source inconnu');
 assert.ok(assetStates.has(row.assetStatus),'Statut de livrable inconnu');
 assert.ok(publishStates.has(row.publicationStatus),'Statut publication inconnu');
 assert.ok(Array.isArray(row.expectedSources),'Liste des documents attendus absente');
 assert.equal(row.privateOnly,true,'Suivi propriétaire seulement');
 if(row.sourceStatus==='OFFICIAL_VERIFIED'){
  assert.equal(row.reconciliationStatus,'APPROVED','Rapprochement officiel non vérifié');
  assert.ok(hash(row.sourceSha256),'Empreinte de source officielle absente');
 }
 if(row.sourceSha256!=null)assert.ok(hash(row.sourceSha256),'Empreinte non valide');
 if(row.publicationStatus==='EXPLICIT_GO_RECORDED')
  assert.equal(row.explicitPublicationApproval,true,'GO publication explicite absent');
 return row;
}
export function receiveOfficial(row,{sha256,receivedOn}){
 validateFollowup(row);
 assert.ok(hash(sha256),'Empreinte requise');
 assert.ok(/^\d{4}-\d{2}-\d{2}$/.test(receivedOn),'Date de réception requise');
 return {...row,sourceStatus:'RECONCILIATION_PENDING',sourceSha256:sha256,
  previousSha256:row.sourceSha256||null,receivedOn,reconciliationStatus:'PENDING',
  publicationStatus:row.publicationStatus==='HISTORIC_PUBLICATION'?'HISTORIC_PUBLICATION':'NOT_AUTHORIZED',
  explicitPublicationApproval:false};
}
export function planResume(before,after){
 for(const version of [before,after]){
  assert.ok(Array.isArray(version),'Matrice de notions absente');
  for(const n of version)assert.ok(n&&/^[a-z0-9_-]+$/.test(n.id||'')&&hash(n.sha256)&&
   Array.isArray(n.affects),'Notion incorrecte');
  assert.equal(new Set(version.map(x=>x.id)).size,version.length,'Notions dupliquées');
 }
 const old=new Map(before.map(x=>[x.id,x]));
 const fresh=new Map(after.map(x=>[x.id,x]));
 const deltas=[],assets=new Set();
 for(const n of after){
  const previous=old.get(n.id);
  if(previous?.sha256===n.sha256)continue;
  deltas.push({id:n.id,kind:previous?'changed':'added'});
  for(const a of [...(previous?.affects||[]),...n.affects])assets.add(a);
 }
 for(const n of before)if(!fresh.has(n.id)){
  deltas.push({id:n.id,kind:'removed'});
  for(const a of n.affects)assets.add(a);
 }
 return {deltas,affectedAssets:[...assets].sort(),
  recheckBothFinalPdfs:assets.has('classicSheet')||assets.has('illustratedSheet'),
  sourceReviewRequired:true,publication:'NO_AUTOMATIC_PUBLICATION'};
}
