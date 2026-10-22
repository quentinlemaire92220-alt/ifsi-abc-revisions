// Sécurisation P0 : teste la DIFF RÉELLE vs main, non un jeu de données fictif.
// Aucun nom/ID de source de travail n'est ajouté à ce fichier public.
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {isDeepStrictEqual} from 'node:util';
import {
 isScriptWorkItem,expectedPublicCourseAfterWithdrawal,
 expectedPublicDeliveryAfterWithdrawal,isApprovedPrivateReferenceWithdrawal
} from './private-resource-withdrawal-lib.mjs';
import {publicationBundle,validateChangedDeliveries} from './course-publication-approval-lib.mjs';

const clone=x=>JSON.parse(JSON.stringify(x));
const disk=file=>JSON.parse(readFileSync(file,'utf8'));
const base=process.env.IFSI_BASE_SHA||'HEAD~1';
assert.match(base,/^(?:HEAD~1|[0-9a-f]{7,40})$/i);
const before=file=>JSON.parse(execFileSync('git',['show',base+':'+file],{encoding:'utf8',maxBuffer:16*1024*1024}));
const oldReg=before('course-registry-v741.json'),currentReg=disk('course-registry-v741.json');
const oldMan=before('docs/course-deliveries.json'),currentMan=disk('docs/course-deliveries.json');

assert.equal(oldReg.courses.length,50);
assert.equal(currentReg.courses.length,50);
assert.deepEqual(currentReg.courses,oldReg.courses.map(expectedPublicCourseAfterWithdrawal),
 'Registre : seule la suppression des scripts de travail est permise');
assert.deepEqual(Object.keys(currentReg),Object.keys(oldReg),'Structure du registre modifiée');
assert.equal(currentReg.version,oldReg.version,'Version approuvée conservée');
const removed=oldReg.courses.reduce((n,c)=>n+(c.additionalDocuments||[]).filter(isScriptWorkItem).length,0);
assert.equal(removed,10,'Nombre connu des scripts privés modifié');
assert.equal(currentReg.courses.reduce((n,c)=>n+(c.additionalDocuments||[]).length,0),23);
assert.ok(currentReg.courses.every(c=>(c.additionalDocuments||[]).every(d=>!isScriptWorkItem(d))),
 'Scripts encore dans la liste publique');

const oldCourses=new Map(oldReg.courses.map(c=>[c.id,c]));
const expectedMan=clone(oldMan);
let removedScripts=0,removedFolders=0;
for(const delivery of expectedMan.courses){
 const old=oldMan.courses.find(x=>x.courseId===delivery.courseId);
 removedScripts+=(old.vocalScripts||[]).length;
 for(const key of ['08','99'])if(old.folders?.[key])removedFolders++;
 const updated=expectedPublicDeliveryAfterWithdrawal(old,oldCourses.get(old.courseId));
 Object.keys(delivery).forEach(k=>delete delivery[k]);
 Object.assign(delivery,updated);
}
assert.equal(removedScripts,20,'Nombre de scripts de travail du manifeste modifié');
assert.equal(removedFolders,14,'Nombre de pointeurs de dossiers internes modifié');
assert.deepEqual(currentMan,expectedMan,
 'Manifeste : seule la révocation des pointeurs de travail, et les comptes sourcés, sont permises');
assert.equal(currentMan.courses.length,oldMan.courses.length,'Livraison supprimée');
for(const c of currentMan.courses){
 assert.equal(c.vocalScripts,undefined,'Scripts privés présents dans le manifeste');
 for(const key of ['08','99'])assert.equal(c.folders?.[key],undefined,'Dossier interne présent dans le manifeste');
 assert.deepEqual(c.publicationApproval,oldMan.courses.find(x=>x.courseId===c.courseId).publicationApproval,
  'Une approbation approuvée ne doit pas être réécrite');
}
assert.deepEqual(currentMan.audioSupplements,oldMan.audioSupplements,'MP3 publiés modifiés');

// La même règle doit rejeter toute mutation masquée d'un cours, corrigé ou PDF.
const course={id:'demo',label:'Démo',additionalDocuments:[
 {label:'Scripts vocaux',url:'https://drive.google.com/file/d/TEST_SCRIPT/view'},
 {label:'Fiche de révision',url:'https://drive.google.com/file/d/TEST_PDF/view'}
]};
const delivery={courseId:'demo',qcmBank:'qdemo.json',
 vocalScripts:[{number:1,driveId:'TEST_SCRIPT',url:'https://drive.google.com/file/d/TEST_SCRIPT/view'}],
 folders:{'08':'TEST_WORK_FOLDER','02':'TEST_PDF_FOLDER'},
 artifactSha256s:{TEST_SCRIPT:'a'.repeat(64),TEST_PDF:'b'.repeat(64)},
 publicationApproval:{status:'approved',authorization:'explicit_go_publication',
 scope:'course_package',approvedAt:'2026-10-20T12:00:00Z',bundleSha256:'f'.repeat(64)}};
const makeData=()=>({registry:{courses:[clone(course)]},sheets:[{courseId:'demo',resourceId:'sheet',
 driveId:'TEST_PDF',url:'https://drive.google.com/file/d/TEST_PDF/view'}],
 infographics:[],vocals:[],banks:{'qdemo.json':[{courseId:'demo',id:'Q1',answers:[1]}]},
 imageHashes:{},vocabulary:[]});
const oldData=makeData(),newData=makeData(),updatedDelivery=expectedPublicDeliveryAfterWithdrawal(delivery,course);
newData.registry.courses=[expectedPublicCourseAfterWithdrawal(course)];
const oldBundle=publicationBundle('demo',delivery,oldData),newBundle=publicationBundle('demo',updatedDelivery,newData);
assert.equal(isApprovedPrivateReferenceWithdrawal('demo',delivery,updatedDelivery,oldBundle,newBundle),true);
assert.equal(validateChangedDeliveries({courses:[delivery]},{courses:[updatedDelivery]},oldData,newData)[0].kind,
 'private_reference_withdrawal');
for(const mutate of [
 x=>{x.banks['qdemo.json'][0].answers=[0]},
 x=>{x.sheets[0].driveId='ANOTHER_PDF'},
 x=>{x.vocals.push({courseId:'demo',id:'v1',driveId:'NEW_MP3'})},
 x=>{x.registry.courses[0].additionalDocuments.push({label:'Nouvelle fiche',url:'https://drive.google.com/file/d/UNAPPROVED/view'})}
]){
 const bad=clone(newData);mutate(bad);
 assert.equal(isApprovedPrivateReferenceWithdrawal('demo',delivery,updatedDelivery,oldBundle,
  publicationBundle('demo',updatedDelivery,bad)),false,'Modification pédagogique non approuvée acceptée');
 assert.throws(()=>validateChangedDeliveries({courses:[delivery]},{courses:[updatedDelivery]},oldData,bad),
  /changé après validation|validation du package absente/);
}
for(const mutate of [
 x=>{x.publicationApproval={...x.publicationApproval,status:'pending'}},
 x=>{x.artifactSha256s.TEST_PDF='c'.repeat(64)},
 x=>{x.scriptsPreparedCount=99},
 x=>{x.folders['02']='ANOTHER_FOLDER'}
]){
 const bad=clone(updatedDelivery);mutate(bad);
 assert.equal(isApprovedPrivateReferenceWithdrawal('demo',delivery,bad,oldBundle,
   publicationBundle('demo',bad,newData)),false,'Modification de manifeste non autorisée acceptée');
}
assert.equal(isDeepStrictEqual(oldMan.courses.map(x=>x.courseId),currentMan.courses.map(x=>x.courseId)),true);
console.log('PASS P0: 50 cours, 23 documents élèves, 10 liens privés retirés, 20 scripts et 14 dossiers internes expurgés ; contenu/approbations intacts.');
