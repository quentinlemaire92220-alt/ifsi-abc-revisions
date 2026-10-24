import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {dirname,resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {runInNewContext} from 'node:vm';
import {execFileSync} from 'node:child_process';
import {isDeepStrictEqual} from 'node:util';
import {createHash} from 'node:crypto';
import {isScriptWorkItem} from './private-resource-withdrawal-lib.mjs';
import {verifyPublicArtifact} from '../tools/public-artifact-contract.mjs';

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
assert.ok(registry.courses.length>=50,'Les cours historiques ne doivent pas disparaitre');
const audited=JSON.parse(readFileSync(resolve(root,'resource-audit-v821.json'),'utf8'));
assert.equal(registry.courses.length,audited.expectedTotals.courses,'Total des cours non conforme a l’inventaire audite');
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
  // Ne publier une copie GitHub Pages du TD1 que si l'URL et les octets
  // correspondent exactement au document approuvé et inventorié.
  let id=String(doc.url||'').match(/^https:\/\/drive\.google\.com\/file\/d\/([\w-]+)\/view(?:\?|$)/)?.[1];
  if(!id&&delivery?.publicationHost==='github_pages'&&doc.courseId==='d1_communication_td1'){
   const prefix='https://quentinlemaire92220-alt.github.io/ifsi-abc-revisions/assets/communication-td1/';
   const sheets=[1,2,3].flatMap(n=>JSON.parse(readFileSync(resolve(root,`sheets-${n}.json`),'utf8')));
   const sheet=sheets.find(s=>s.resourceId===delivery.sheetResourceId);
   const files=new Map([
    ['UE_D1_Communication_TD1_Support_officiel.pdf',delivery.supportDriveId],
    ['UE_D1_Communication_TD1_Fiche_de_revision.pdf',sheet?.driveId],
    ['UE_D1_Communication_TD1_QCM_50_avec_corriges.pdf',delivery.qcmDriveId],
    ['UE_D1_Communication_TD1_Flashcards_40.pdf',delivery.flashcardDriveId]
   ]);
   const filename=String(doc.url||'').startsWith(prefix)?String(doc.url).slice(prefix.length):'';
   id=files.get(filename);
   if(id){
    const hash=createHash('sha256').update(readFileSync(resolve(root,'assets/communication-td1',filename))).digest('hex');
    assert.equal(hash,delivery.artifactSha256s?.[id],'Copie PDF publique différente du fichier approuvé');
   }
  }
  if(!id&&delivery?.publicationHost==='github_pages'&&delivery.publicArtifacts){
   id=verifyPublicArtifact(delivery,doc.url);
  }
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
console.log(`PASS : ${registry.courses.length} cours, zéro lien privé, ${historical.length} documents conservés et ${additions.length} ajouts approuvés ; UI refuse la réinjection. Contrôle ACL Drive séparé requis.`);
