import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
// Exact reviewed personal reference. This scope does not authorize another PDF,
// a replacement course, an original support, previews or private source files.
const reviewed={b2_concepts_definitions_td:{path:'assets/ue-b2-concepts-20261112/UE_B2_Concepts_Definitions_TD_Validation.pdf',sha256:'03975ab3ec4f5be6a706b90f01cce8bf4cc1818573178ed75df5ae82dd258cf9',pageCount:81}};
const revised={b2_concepts_definitions_td:{path:'assets/psycho-dev-officiel-20261112/UE_B2_Concepts_Definitions_TD_Validation_complete.pdf',sha256:'831a3346d42a3338657417f469dc319c0febe779c893cf57017c2fd6c1e648ff',pageCount:83}};
export function validateUeReferenceResources(before,now,{root=process.cwd()}={}){
 assert.deepEqual(Object.keys(now).filter(k=>k!=='ueResources'),Object.keys(before).filter(k=>k!=='ueResources'),'Structure du registre modifiée hors ressources UE');
 for(const key of Object.keys(before).filter(k=>!['version','courses','ueResources'].includes(k)))assert.deepEqual(now[key],before[key],'Métadonnées historiques modifiées : '+key);
 const prior=before.ueResources||[],next=now.ueResources||[];assert.ok(Array.isArray(next));
 for(let i=0;i<prior.length;i++){
  const old=prior[i],r=next[i];assert.equal(r?.id,old.id,'Ressource UE perdue ou réordonnée');
  if(JSON.stringify(r)===JSON.stringify(old))continue;
  assert.equal(r.revision?.type,'official_support_reconciliation_v1');assert.deepEqual(r.revision.previousArtifact,old.artifact);
  assert.deepEqual(old.artifact,{...old.artifact,...reviewed[old.id]},'Ancien recueil hors référence');
  assert.equal(createHash('sha256').update(fs.readFileSync(path.resolve(root,old.artifact.path))).digest('hex'),old.artifact.sha256,'Ancien recueil perdu');
  const mutable=['url','pageCount','sourceLimitations','artifact','review','publicationApproval','revision'];
  const strip=x=>Object.fromEntries(Object.entries(x).filter(([k])=>!mutable.includes(k)));
  assert.deepEqual(strip(r),strip(old),'Métadonnées UE modifiées hors révision');
 }
 assert.equal(new Set(next.map(r=>r.id)).size,next.length,'Ressource UE dupliquée');
 for(const r of next){
  const expected=r.revision?revised[r.id]:reviewed[r.id];assert.ok(expected,'Ressource UE hors lot explicitement examiné');
  assert.equal(r.ue,'B2');assert.equal(r.domain,'B');assert.equal(r.officialSupport,false);assert.equal(r.provisional,true);
  assert.equal(r.sourceType,'personal_cross_course_reference');assert.equal(r.url,'./'+expected.path);
  assert.equal(r.artifact.path,expected.path);assert.equal(r.artifact.sha256,expected.sha256);assert.equal(r.artifact.pageCount,expected.pageCount);assert.equal(r.pageCount,expected.pageCount);
  assert.equal(r.review.status,'documentary_and_visual_review_completed');assert.equal(r.review.reviewedPageCount,expected.pageCount);assert.equal(r.review.listRowsCovered,57);assert.equal(r.review.independentMedicalReview,'not_attested');
  if(r.revision){assert.equal(r.revision.type,'official_support_reconciliation_v1');assert.equal(r.revision.officialSourcePages,35);assert.equal(r.review.addedDefinitionsFromOfficialSupport,20);}
  assert.equal(r.publicationApproval.status,'approved');assert.equal(r.publicationApproval.scope,'ue_reference_pdf_only');assert.equal(r.publicationApproval.userGoObserved,true);assert.equal(r.publicationApproval.artifactSha256,expected.sha256);
  assert.deepEqual([...r.courseIds].sort(),['psychopathologie','psychologie_developpement','psychologie_sante','psychologie_sociale'].sort());
  assert.ok(r.courseIds.every(id=>now.courses.some(c=>c.id===id)));
  assert.match(r.sourceLimitations,/non officielle/);assert.match(r.sourceLimitations,/reconstituée/);
  const file=path.resolve(root,expected.path);assert.equal(fs.realpathSync(file),file,'Lien symbolique interdit');const bytes=fs.readFileSync(file);
  assert.equal(bytes.length,r.artifact.bytes);assert.equal(bytes.subarray(0,5).toString(),'%PDF-');assert.equal(createHash('sha256').update(bytes).digest('hex'),expected.sha256,'Octets du recueil différents de la revue');
 }
 return next.slice(prior.length);
}
