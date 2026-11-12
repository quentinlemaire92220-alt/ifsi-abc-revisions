import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {validateUeReferenceResources} from '../tools/ue-reference-resource-contract.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const registry=read('course-registry-v741.json');
const approved={id:'b2_concepts_definitions_td',sha256:'03975ab3ec4f5be6a706b90f01cce8bf4cc1818573178ed75df5ae82dd258cf9',path:'assets/ue-b2-concepts-20261112/UE_B2_Concepts_Definitions_TD_Validation.pdf'};
function validate(r){
 assert.equal(r.id,approved.id);assert.equal(r.ue,'B2');assert.equal(r.domain,'B');
 assert.equal(r.sourceType,'personal_cross_course_reference');assert.equal(r.officialSupport,false);assert.equal(r.provisional,true);
 assert.deepEqual([...r.courseIds].sort(),['psychopathologie','psychologie_developpement','psychologie_sante','psychologie_sociale'].sort());
 assert.ok(r.courseIds.every(id=>registry.courses.some(c=>c.id===id)));
 assert.equal(r.artifact.path,approved.path);assert.equal(r.url,'./'+approved.path);
 assert.equal(r.artifact.sha256,approved.sha256);assert.equal(r.pageCount,81);assert.equal(r.artifact.pageCount,81);
 assert.equal(r.review.status,'documentary_and_visual_review_completed');assert.equal(r.review.reviewedPageCount,81);
 assert.equal(r.review.listRowsCovered,57);assert.equal(r.review.originalLexiconEntriesPreserved,711);
 assert.equal(r.review.independentMedicalReview,'not_attested');
 assert.equal(r.publicationApproval.status,'approved');assert.equal(r.publicationApproval.userGoObserved,true);
 assert.equal(r.publicationApproval.scope,'ue_reference_pdf_only');assert.equal(r.publicationApproval.artifactSha256,approved.sha256);
 assert.match(r.sourceLimitations,/non officielle/);assert.match(r.sourceLimitations,/reconstituée/);
 const bytes=fs.readFileSync(r.artifact.path);assert.equal(bytes.length,r.artifact.bytes);assert.equal(bytes.subarray(0,5).toString(),'%PDF-');
 assert.equal(createHash('sha256').update(bytes).digest('hex'),approved.sha256);
 assert.ok(fs.readFileSync('sw.js','utf8').includes("'./"+approved.path+"'"),'Recueil absent du précache hors ligne');
}
assert.equal(registry.ueResources.length,1,'Un seul recueil autorisé');validate(registry.ueResources[0]);
for(const mutate of [r=>r.publicationApproval.status='pending',r=>r.artifact.sha256='a'.repeat(64),r=>r.courseIds.push('another'),r=>r.officialSupport=true,r=>r.url='../private.pdf']){
 const bad=structuredClone(registry.ueResources[0]);mutate(bad);assert.throws(()=>validate(bad),'Modification hors GO acceptée');
}
const base=process.env.IFSI_BASE_SHA;assert.match(base||'',/^[a-f0-9]{40}$/);
const before=JSON.parse(execFileSync('git',['show',base+':course-registry-v741.json'],{encoding:'utf8'}));
validateUeReferenceResources(before,registry);
for(const mutate of [r=>r.unreviewed={},r=>r.ueResources[0].publicationApproval.status='pending',r=>r.ueResources.push(structuredClone(r.ueResources[0]))]){
 const bad=structuredClone(registry);mutate(bad);assert.throws(()=>validateUeReferenceResources(before,bad),'Extension non approuvée du registre acceptée');
}
assert.deepEqual(registry.courses,before.courses,'Un cours existant a changé avec le recueil partagé');
for(const file of ['docs/course-deliveries.json','sheets-1.json','sheets-2.json','sheets-3.json','questions-5.json','vocabulaire-v1.json','vocals.json','audio-series-v1.json']){
 const prior=execFileSync('git',['show',base+':'+file],{maxBuffer:64*1024*1024});assert.ok(prior.equals(fs.readFileSync(file)),'Ressource historique modifiée : '+file);
}
const python=process.env.IFSI_PYTHON||process.env.PYTHON||'python';
const result=JSON.parse(execFileSync(python,['-c','import fitz,json,sys; d=fitz.open(sys.argv[1]); print(json.dumps({"pages":len(d),"first":d[0].get_text(),"all": " ".join(p.get_text() for p in d)}))',approved.path],{encoding:'utf8',maxBuffer:10*1024*1024}));
assert.equal(result.pages,81);assert.match(result.first,/6 concepts/);assert.match(result.first,/2 des concepts/);
for(const term of ['Relation d’attachement chez l’adulte','Attachement symbolique','Psychopathologie','Psychologie de la santé','Psychologie sociale','Index'])assert.ok(result.all.includes(term),'Contenu attendu absent : '+term);
console.log('PASS recueil UE B2 : PDF exact approuvé,81 pages,statut personnel,57 rubriques,GO limité et ressources antérieures intactes');
