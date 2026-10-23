import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {runInNewContext} from 'node:vm';
import {execFileSync} from 'node:child_process';
import {isDeepStrictEqual} from 'node:util';
import {isScriptWorkItem} from './private-resource-withdrawal-lib.mjs';

const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const registry=JSON.parse(readFileSync(resolve(root,'course-registry-v741.json'),'utf8'));
const source=readFileSync(resolve(root,'v74-pack.js'),'utf8');
const start=source.indexOf('const studentVisibleDocument74=');
const end=source.indexOf('function renderCourse74()',start);
assert.ok(start>=0 && end>start,'Filtre des documents internes absent');
const visible=runInNewContext(source.slice(start,end)+'\nstudentVisibleDocument74;');
assert.equal(typeof visible,'function');
assert.ok(source.includes("x.category!=='anatomy'&&studentVisibleDocument74(x)"),'Filtre non branché sur Documents du cours');
assert.ok(source.includes('const parts=uniqueSupportParts74(url,'),'Sous-cours non dédupliqués');
assert.equal(registry.courses.length,50,'Ne pas perdre de cours');
const docs=registry.courses.flatMap(course=>(course.additionalDocuments||[]).map(doc=>({...doc,courseId:course.id})));
const blocked=docs.filter(doc=>!visible(doc));
assert.equal(blocked.length,0,'Aucun script de travail ne doit rester dans le registre public');
const base=process.env.IFSI_BASE_SHA||'HEAD^';
assert.match(base,/^(?:HEAD\^|[0-9a-f]{7,40})$/i);
const oldRegistry=JSON.parse(execFileSync('git',['show',base+':course-registry-v741.json'],{cwd:root,encoding:'utf8',maxBuffer:16*1024*1024}));
const historical=oldRegistry.courses.flatMap(c=>(c.additionalDocuments||[]).filter(d=>!isScriptWorkItem(d)).map(d=>({...d,courseId:c.id})));
assert.deepEqual(docs.filter(d=>historical.some(o=>isDeepStrictEqual(o,d))),historical,'Document étudiant historique retiré ou modifié');
const additions=docs.filter(d=>!historical.some(o=>isDeepStrictEqual(o,d)));
if(additions.length){
 // Le filtre UI ne déduit jamais un GO de la simple présence d'un nouveau lien.
 execFileSync(process.execPath,['tests/course-publication-approval.mjs'],{cwd:root,env:{...process.env,IFSI_BASE_SHA:base},stdio:'pipe',maxBuffer:32*1024*1024});
 const manifest=JSON.parse(readFileSync(resolve(root,'docs/course-deliveries.json'),'utf8'));
 for(const doc of additions){
  const delivery=manifest.courses.find(c=>c.courseId===doc.courseId);
  const id=String(doc.url||'').match(/^https:\/\/drive\.google\.com\/file\/d\/([\w-]+)\/view(?:\?|$)/)?.[1];
  assert.equal(delivery?.publicationApproval?.authorization,'explicit_go_publication','Nouveau document sans GO explicite');
  assert.equal(delivery.publicationApproval.status,'approved');
  assert.ok(id,'Nouveau document sans fichier identifié');
  assert.match(delivery.artifactSha256s?.[id]||'',/^[a-f0-9]{64}$/,'Nouveau document hors package examiné');
 }
}
assert.equal(docs.length,historical.length+additions.length,'Inventaire étudiant incohérent');
for(const label of ['Scripts vocaux (TXT)','Script vocal de consolidation'])assert.equal(visible({label}),false);
assert.ok(docs.some(doc=>doc.category==='qcm_enseignant'&&visible(doc)),'Ne pas retirer les documents QCM de l’enseignant');
assert.equal(docs.length-blocked.length,historical.length+additions.length,'La liste visible perd des ressources légitimes');
assert.equal(visible({label:'Compte-rendu de stage',visibility:'private'}),false);
assert.equal(visible({label:'Fiche de révision',category:'internal'}),false);
assert.equal(visible({label:'Transcription orale',category:'cours'}),false);
assert.equal(visible({label:'Vocal MP3 — 6 épisodes',category:'audio'}),true);
console.log(`PASS : 50 cours, zéro lien privé, ${historical.length} documents conservés et ${additions.length} ajouts approuvés ; UI refuse la réinjection. Contrôle ACL Drive séparé requis.`);
