import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';

function canonical(value){
 if(Array.isArray(value))return value.map(canonical);
 if(value&&typeof value==='object')return Object.fromEntries(Object.keys(value).sort().filter(k=>value[k]!==undefined).map(k=>[k,canonical(value[k])]));
 return value;
}
const sortById=items=>[...items].sort((a,b)=>String(a.resourceId||a.id||a.title||'').localeCompare(String(b.resourceId||b.id||b.title||'')));
export function publicationBundle(courseId,delivery,data){
 const paths=delivery.qcmBanks?.length?delivery.qcmBanks:[delivery.qcmBank].filter(Boolean);
 const resource=x=>({metadata:x,imageSha256:x.localImage?data.imageHashes[x.localImage]:null});
 const parts=(delivery.partDeliveries||[]).map(p=>({partId:p.partId,visualAudit:p.visualAudit,publishedVerification:p.publishedVerification}));
 return {
  course:data.registry.courses.find(c=>c.id===courseId),
  sheets:sortById(data.sheets.filter(x=>x.courseId===courseId)),
  infographics:sortById(data.infographics.filter(x=>x.courseId===courseId)).map(resource),
  vocals:sortById(data.vocals.filter(x=>x.courseId===courseId)),
  banks:[...new Set(paths)].sort().map(path=>({path,questions:sortById((data.banks[path]||[]).filter(q=>q.courseId===courseId))})),
  vocabulary:sortById((data.vocabulary||[]).filter(x=>x.courseIds?.includes(courseId))),
  scripts:delivery.vocalScripts||[],
  packFormat:delivery.packFormat||'legacy',
  completeInfographicAudit:delivery.packFormat==='lean_v1'?delivery.infographicSheetVisualAudit:null,
  dualSheetCoverage:delivery.packFormat==='lean_v1'?delivery.dualSheetCoverage:null,
  visualAudit:delivery.visualAudit,
  publishedVerification:delivery.publishedVerification,
  artifactSha256s:delivery.artifactSha256s||{},
  documentIds:[delivery.supportDriveId,delivery.qcmDriveId,delivery.flashcardDriveId,delivery.vocabularyDriveId,delivery.infographicPackDriveId].filter(Boolean),
  parts
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
 assert.equal(a.scope,'course_package',courseId+': une validation de fichier seul ne valide pas le package');
 assert.ok(typeof a.approvedAt==='string'&&/^\d{4}-\d{2}-\d{2}T/.test(a.approvedAt)&&Number.isFinite(Date.parse(a.approvedAt)),courseId+': date de validation absente ou invalide');
 assert.match(a.bundleSha256||'',/^[a-f0-9]{64}$/,courseId+': empreinte de validation invalide');
 assert.equal(a.bundleSha256,digest,courseId+': le lot a changé après validation. Empreinte attendue : '+digest);
}
export function validateChangedDeliveries(before,after,oldData,newData){
 const old=new Map((before.courses||[]).map(c=>[c.courseId,c]));const checked=[];
 for(const delivery of after.courses||[]){
  const id=delivery.courseId,prior=old.get(id);
  const bundle=publicationBundle(id,delivery,newData);
  const digest=bundleDigest(bundle);
  const oldDigest=prior?bundleDigest(publicationBundle(id,prior,oldData)):null;
  if(oldDigest===digest)continue; // Pas d'obligation rétroactive pour un cours inchangé.
  validatePublicationApproval(id,delivery,digest);
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
