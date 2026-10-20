#!/usr/bin/env node
/* IFSI ABC — preflight for local private pathology JSON. Does not publish, does not upload content.
   CLI:
     node tests/pathologies-p1-readiness.mjs --self-test
     node tests/pathologies-p1-readiness.mjs --draft /private/hta.json /private/dt2.json
     node tests/pathologies-p1-readiness.mjs --release /private/pathology-final.json
   Only minimal aggregate metadata is printed; no clinical text, URLs or private review evidence.
*/
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const moduleCode=fs.readFileSync(new URL('../pathologies-module-v1.js',import.meta.url),'utf8');
const context={window:{},console};
vm.createContext(context);
vm.runInContext(moduleCode,context);
const engine=context.window.IFSI_PATHOLOGIES;
const registry=JSON.parse(fs.readFileSync(new URL('../course-registry-v741.json',import.meta.url),'utf8'));
const courses=new Set((registry.courses||[]).map(x=>x.id));
const expected={bpco:{courseId:'systeme_respiratoire',qcm:24,flashcards:20,steps:8},hta:{courseId:'systeme_cardiovasculaire',qcm:24,flashcards:20,steps:8},dt2:{courseId:'systeme_endocrinien',qcm:24,flashcards:20,steps:8}};
const arr=x=>Array.isArray(x)?x:[];
const validText=x=>typeof x==='string'&&x.trim().length>0;
function preflight(item){
 const id=validText(item?.id)?item.id:'invalid';
 const issues=[];
 const sourceIds=new Set(arr(item?.sources).filter(x=>validText(x?.id)).map(x=>x.id));
 const courseIds=arr(item?.courseIds);
 if(!courseIds.length||courseIds.some(cid=>!courses.has(cid)))issues.push('unknown_or_missing_course');
 if(!sourceIds.size||arr(item?.sources).some(x=>!validText(x?.id)||!/^https:\/\//.test(x?.url||'')))issues.push('missing_source_identifiers_or_https');
 const sets={
  qcm:arr(item?.qcm),
  flashcards:arr(item?.flashcards),
  steps:arr(item?.cases).flatMap(c=>arr(c?.steps))
 };
 for(const [kind,items] of Object.entries(sets)){
  if(!items.length)issues.push(kind+'_missing');
  if(items.some(x=>!arr(x?.sourceIds).length||x.sourceIds.some(s=>!sourceIds.has(s))))issues.push(kind+'_unsourced_items');
 }
 const requirements=engine.requiredSections;
 const missingSections=requirements.filter(k=>!validText(item?.sections?.[k]));
 if(missingSections.length)issues.push('missing_sections_'+missingSections.length);
 if(!arr(item?.visuals).length)issues.push('visual_manifest_absent');
 const medicalStatus=item?.medicalReview==='approved';
 if(!medicalStatus)issues.push('clinical_review_pending');
 const approval=item?.publicationApproval;
 if(approval?.authorization!=='explicit_go_publication'||approval?.status!=='approved')issues.push('explicit_publication_go_missing');
 if(expected[id]){
  const e=expected[id];
  if(!courseIds.includes(e.courseId))issues.push('p1_course_mapping_wrong');
  for(const k of ['qcm','flashcards','steps'])if(sets[k].length!==e[k])issues.push('p1_count_mismatch_'+k);
 }
 const engineErrors=engine.validate(item);
 if(engineErrors.length)issues.push('engine_contract_failed');
 // "structuralReady" does not assert that a clinician has reviewed the attached assets.
 return {id,counts:{qcm:sets.qcm.length,flashcards:sets.flashcards.length,steps:sets.steps.length,sources:sourceIds.size,visuals:arr(item?.visuals).length},issues:[...new Set(issues)],engineErrorCount:engineErrors.length,readyForPublication:false};
}
const args=process.argv.slice(2);
if(args[0]==='--self-test'){
 const sample={id:'hta',courseIds:['systeme_cardiovasculaire'],sources:[{id:'ref',url:'https://example.org/source'}],qcm:[{id:'q',sourceIds:['ref']}],flashcards:[{id:'f',sourceIds:['ref']}],cases:[{steps:[{id:'s',sourceIds:['ref']}]}]};
 const result=preflight(sample);
 assert.ok(result.issues.includes('missing_sections_10'));
 assert.ok(result.issues.includes('visual_manifest_absent'));
 assert.ok(result.issues.includes('explicit_publication_go_missing'));
 assert.ok(result.issues.includes('p1_count_mismatch_qcm'));
 assert.ok(preflight({...sample,flashcards:[{id:'f',sourceIds:[]}]}).issues.includes('flashcards_unsourced_items'));
 assert.ok(preflight({...sample,courseIds:['unknown']}).issues.includes('unknown_or_missing_course'));
 assert.equal(result.readyForPublication,false);
 console.log('✅ Pathologies P1 : preflight privé, contrôle des cours, sources, illustrations, approbations');
}else{
 if(!['--draft','--release'].includes(args[0])||args.length<2){
  console.error('Usage: node tests/pathologies-p1-readiness.mjs --draft|--release <private-catalog.json> [...]');
  process.exitCode=2;
 }else{
  const results=[];
  for(const file of args.slice(1)){
   try{
    const data=JSON.parse(fs.readFileSync(file,'utf8'));
    for(const item of (Array.isArray(data)?data:[data]))results.push(preflight(item));
   }catch(e){results.push({id:'unreadable',counts:{},issues:['catalogue_unreadable'],engineErrorCount:0,readyForPublication:false});}
  }
  // Never print sensitive clinical text or private file paths.
  console.log(JSON.stringify({mode:args[0].slice(2),status:'private_review_only_no_publication',results},null,2));
  if(args[0]==='--release'&&results.some(r=>r.issues.length))process.exitCode=1;
 }
}
