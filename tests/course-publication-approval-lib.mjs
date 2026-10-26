import assert from 'node:assert/strict';
import {requireVisualReviewIfChanged} from './visual-owner-review-gate.mjs';
import {createHash} from 'node:crypto';
import {isApprovedPrivateReferenceWithdrawal} from './private-resource-withdrawal-lib.mjs';
import {validateRevisionSheetChange} from './revision-sheet-supplement-contract.mjs';
import {validateAudioSupplements} from './audio-supplement-contract.mjs';

function canonical(value){
 if(Array.isArray(value))return value.map(canonical);
 if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().filter(k=>value[k]!==undefined).map(k=>[k,canonical(value[k])]));
 return value;
}
const sortById=items=>[...items].sort((a,b)=>String(a.resourceId||a.id||a.title||'').localeCompare(String(b.resourceId||b.id||b.title||'')));
export function publicationBundle(courseId,delivery,data){
 const paths=delivery.qcmBanks?.length?delivery.qcmBanks:[delivery.qcmBank].filter(Boolean);
 const resource=x=>({metadata:x,imageSha256:x.localImage?data.imageHashes[x.localImage]:null});
 const parts=(delivery.partDeliveries||[]).map(p=>({partId:p.partId,visualAudit:p.visualAudit,publishedVerification:p.publishedVerification,
  ...(p.deliveryMode==='existing_course_complement'?{complement:p}:{})}));
 return {
  course:data.registry.courses.find(c=>c.id===courseId),
  sheets:sortById(data.sheets.filter(x=>x.courseId===courseId)),
  infographics:sortById(data.infographics.filter(x=>x.courseId===courseId)).map(resource),
  vocals:sortById(data.vocals.filter(x=>x.courseId===courseId)),
  banks:[...new Set(paths)].sort().map(path=>({path,questions:sortById((data.banks[path]||[]).filter(q=>q.courseId===courseId))})),
  vocabulary:sortById((data.vocabulary||[]).filter(x=>x.courseIds?.includes(courseId))),
  scripts:delivery.vocalScripts||[],
  packFormat:delivery.packFormat||'legacy',
  ...(delivery.packFormat==='hybrid_v1'?{hybridMetadata:{discipline:delivery.discipline,sourceBasis:delivery.sourceBasis,hybridCoverage:delivery.hybridCoverage,hybridVisualReview:delivery.hybridVisualReview,lexicon:delivery.lexicon,schematics:delivery.schematics,embeddedFigureCount:delivery.embeddedFigureCount}}:{}),
  completeInfographicAudit:delivery.packFormat==='lean_v1'?delivery.infographicSheetVisualAudit:null,
  dualSheetCoverage:delivery.packFormat==='lean_v1'?delivery.dualSheetCoverage:null,
  visualAudit:delivery.visualAudit,
  publishedVerification:delivery.publishedVerification,
  artifactSha256s:delivery.artifactSha256s||{},
  ...(delivery.publicArtifacts?{publicArtifacts:delivery.publicArtifacts}:{}),
  ...(delivery.visualOwnerReview?{visualOwnerReview:delivery.visualOwnerReview}:{}),
  documentIds:[delivery.supportDriveId,delivery.qcmDriveId,delivery.flashcardDriveId,delivery.vocabularyDriveId,delivery.infographicPackDriveId].filter(Boolean),
  parts
  ,...(delivery.revisionSheetSupplement?{revisionSheetSupplement:delivery.revisionSheetSupplement}:{})
  ,...(delivery.revisionSheetMode==='single_with_complete_boards'?{revisionSheetDelivery:{
   mode:delivery.revisionSheetMode,questionScope:delivery.deliveryQuestionScope,coverage:delivery.sheetCoverage,completeBoardAudits:delivery.completeBoardAudits,
   parts:(delivery.partDeliveries||[]).filter(p=>p.revisionSheetMode==='single_with_complete_boards')
    .map(p=>({partId:p.partId,sheetResourceIds:p.sheetResourceIds,coverage:p.sheetCoverage,completeBoardAudits:p.completeBoardAudits}))
  }}:{})
 };
}
export const bundleDigest=bundle=>createHash('sha256').update(JSON.stringify(canonical(bundle))).digest('hex');
export function validatePublicationApproval(courseId,delivery,digest){
 const a=delivery.publicationApproval;
 assert.equal(a?.status,'approved',courseId+': validation du package absente. Empreinte attendue : '+digest);
 assert.equal(a.authorization,'explicit_go_publication',courseId+': GO publication explicite absent');
 const expectedScope=delivery.publicationScope==='infographics_only'?'infographics_only':'course_package';
 assert.equal(a.scope,expectedScope,courseId+': portee du package incorrecte : une validation de fichier seul ne valide pas le package');
 assert.ok(typeof a.approvedAt==='string'&&/^\d{4}-\d{2}-\d{2}T/.test(a.approvedAt)&&Number.isFinite(Date.parse(a.approvedAt)),courseId+': date de validation absente ou invalide');
 assert.match(a.bundleSha256||'',/^[a-f0-9]{64}$/,courseId+': empreinte de validation invalide');
 assert.equal(a.bundleSha256,digest,courseId+': le lot a changé après validation. Empreinte attendue : '+digest);
}

// Une nouvelle ressource audio explicitement approuvée n'invalide pas le package
// pédagogique d'origine. Le contrat refuse tout changement au-delà des trois
// métadonnées audio et de la disparition du blocage MP3 correspondant.
export function isStrictAudioSupplementOnly(id,prior,delivery,oldData,newData,previousManifest,currentManifest){
 const accepted=validateAudioSupplements(currentManifest,newData);
 const previousIds=new Set((previousManifest.audioSupplements||[]).flatMap(s=>s.vocalIds||[]));
 const supplements=(currentManifest.audioSupplements||[]).filter(s=>
  s.courseId===id && (s.vocalIds||[]).some(vid=>!previousIds.has(vid)));
 if(supplements.length!==1)return false;
 const supplement=supplements[0],addIds=new Set(supplement.vocalIds||[]);
 if(!addIds.size || [...addIds].some(vid=>previousIds.has(vid)||accepted.get(vid)!==supplement))return false;
 const oldVoice=oldData.vocals.filter(v=>v.courseId===id);
 const newVoice=newData.vocals.filter(v=>v.courseId===id);
 if(newVoice.length!==oldVoice.length+addIds.size)return false;
 if(oldVoice.some(v=>!newVoice.some(n=>n.id===v.id&&JSON.stringify(canonical(n))===JSON.stringify(canonical(v)))))return false;
 for(const vid of addIds){const v=newVoice.find(v=>v.id===vid);if(!v||!Number.isFinite(v.durationSeconds)||v.durationSeconds<=0||v.durationSeconds>=600)return false;}
 const oldCourse=oldData.registry.courses.find(c=>c.id===id),newCourse=newData.registry.courses.find(c=>c.id===id);
 if(!oldCourse||!newCourse)return false;
 const stripAudio=c=>{const x={...c};for(const k of ['audioStatus','audioCount','audioFolderUrl'])delete x[k];return x;};
 if(JSON.stringify(canonical(stripAudio(oldCourse)))!==JSON.stringify(canonical(stripAudio(newCourse))))return false;
 if(newCourse.audioStatus!=='available'||newCourse.audioCount!==newVoice.length
  ||newCourse.audioFolderUrl!=='https://drive.google.com/drive/folders/'+supplement.folderId)return false;
 if(JSON.stringify(canonical(prior.publicationApproval))!==JSON.stringify(canonical(delivery.publicationApproval)))return false;
 // Un cours en attente peut devenir complet lorsque SEUL le blocage vocal a été levé.
 const oldStatus=prior.status,newStatus=delivery.status;
 if(newStatus!==oldStatus && !(oldStatus==='awaiting_mp3'&&newStatus==='complete'&&(delivery.blockers||[]).length===0))return false;
 const stripDelivery=d=>{const x={...d};for(const k of ['vocals','artifactSha256s','blockers','publicationApproval','status'])delete x[k];return x;};
 if(JSON.stringify(canonical(stripDelivery(prior)))!==JSON.stringify(canonical(stripDelivery(delivery))))return false;
 const expectedBlockers=(prior.blockers||[]).filter(b=>!(b.resource==='vocals'&&['awaiting_user_mp3','awaiting_mp3'].includes(b.reason)));
 if(JSON.stringify(canonical(expectedBlockers))!==JSON.stringify(canonical(delivery.blockers||[])))return false;
 const expectedVocalIds=[...(prior.vocals||[]),...supplement.vocalIds];
 if(JSON.stringify(delivery.vocals||[])!==JSON.stringify(expectedVocalIds))return false;
 const hashes={...(prior.artifactSha256s||{})};
 for(const vid of supplement.vocalIds){const v=newVoice.find(v=>v.id===vid);hashes[v.driveId]=supplement.artifactSha256s[v.driveId];}
 if(JSON.stringify(canonical(hashes))!==JSON.stringify(canonical(delivery.artifactSha256s||{})))return false;
 const oldBundle=publicationBundle(id,prior,oldData),newBundle=publicationBundle(id,delivery,newData);
 for(const key of Object.keys(oldBundle)){
  if(['course','vocals','artifactSha256s'].includes(key))continue;
  if(JSON.stringify(canonical(oldBundle[key]))!==JSON.stringify(canonical(newBundle[key])))return false;
 }
 return true;
}

export function validateChangedDeliveries(before,after,oldData,newData){
 const old=new Map((before.courses||[]).map(c=>[c.courseId,c]));const checked=[];
 for(const delivery of after.courses||[]){
  const id=delivery.courseId,prior=old.get(id);
  const bundle=publicationBundle(id,delivery,newData);
  const digest=bundleDigest(bundle);
  const oldDigest=prior?bundleDigest(publicationBundle(id,prior,oldData)):null;
  if(oldDigest===digest)continue; // Pas d'obligation rétroactive pour un cours inchangé.
  if(delivery.revisionSheetSupplement && JSON.stringify(canonical(delivery.revisionSheetSupplement))!==JSON.stringify(canonical(prior?.revisionSheetSupplement))){
   validateRevisionSheetChange(id,prior,delivery,oldData,newData);
   checked.push({courseId:id,kind:'revision_sheet_only'});
   continue;
  }
  if(prior && isStrictAudioSupplementOnly(id,prior,delivery,oldData,newData,before,after)){
   checked.push({courseId:id,kind:'audio_supplement_only'});
   continue;
  }
  // Une révocation PURE de références privées est permise sans nouveau GO de publication.
  // Les approbations et tous les contenus QCM, PDF, cartes, vocaux doivent rester identiques.
  if(prior && isApprovedPrivateReferenceWithdrawal(id,prior,delivery,
      publicationBundle(id,prior,oldData),bundle)){
   checked.push({courseId:id,kind:'private_reference_withdrawal'});
   continue;
  }
  validatePublicationApproval(id,delivery,digest);
  if(delivery.publicationScope==='infographics_only'){
   // Une autorisation sur les planches NE valide PAS une refonte du cours entier.
   // Refuser toute mutation des supports, banques, vocaux, registre et lexique.
   const beforeScope=publicationBundle(id,delivery,oldData);
   for(const key of ['course','sheets','vocals','banks','vocabulary']){
    assert.equal(JSON.stringify(canonical(bundle[key])),JSON.stringify(canonical(beforeScope[key])),
     id+': le GO infographies ne couvre pas la modification de '+key);
   }
   const previousInfos=beforeScope.infographics;
   const additions=bundle.infographics.filter(x=>!previousInfos.some(old=>JSON.stringify(canonical(old))===JSON.stringify(canonical(x))));
   assert.equal(bundle.infographics.length,previousInfos.length+1,
    id+': une seule nouvelle ressource infographique autorisee');
   assert.equal(additions.length,1,id+': les anciennes infographies doivent rester identiques');
   const row=additions[0].metadata;
   assert.equal(row.resourceId,delivery.infographicResourceIds?.[0],
    id+': identification de la planche publiee incoherente');
   assert.equal(delivery.infographicResourceIds?.length,1,
    id+': une seule nouvelle ressource de pack autorisee');
   assert.equal(row.url,'https://drive.google.com/file/d/'+delivery.infographicPackDriveId+'/view',
    id+': l URL Drive ne concorde pas avec le pack approuve');
   assert.equal(row.pageCount,16,id+': le nombre de planches a change');
   assert.equal(row.coverageStatus,'partial',id+': publication non exhaustive non signalee');
   assert.equal(delivery.reviewedBoardCount,16,id+': 16 planches doivent etre controlees');
  }
  // Les changements QCM/audio seuls ne forcent pas une revue d'illustration;
  // un PDF/une figure nouveaux ou modifies ne passent plus sur un comptage PASS.
  requireVisualReviewIfChanged(id,prior,delivery,oldData,newData);
  const fileIds=new Set(bundle.documentIds);
  function collect(value,key){
   if(Array.isArray(value))return value.forEach(v=>collect(v,key));
   if(value&&typeof value==='object')return Object.entries(value).forEach(([k,v])=>{if(k!=='artifactSha256s')collect(v,k)});
   if(typeof value!=='string')return;
   if(key==='driveId')fileIds.add(value);
   const match=value.match(/^https:\/\/drive\.google\.com\/file\/d\/([^/]+)/);if(match)fileIds.add(match[1]);
  }
  collect(bundle);
  for(const fileId of fileIds)assert.match(delivery.artifactSha256s?.[fileId]||'',/^[a-f0-9]{64}$/,
   id+': empreinte du fichier examiné absente ou invalide : '+fileId);
  checked.push({courseId:id,bundleSha256:digest});
 }
 return checked;
}
