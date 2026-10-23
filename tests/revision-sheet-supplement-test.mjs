import assert from 'node:assert/strict';
import fs from 'node:fs';
import {revisionSheetDigest,validateRevisionSheetChange,validateRevisionSheetSupplement} from './revision-sheet-supplement-contract.mjs';
const clone=x=>JSON.parse(JSON.stringify(x)),H='a'.repeat(64);
const oldRow={courseId:'demo',resourceId:'old',url:'https://drive.google.com/file/d/OLD/view'};
const row={courseId:'demo',resourceId:'new',driveId:'NEW',url:'https://drive.google.com/file/d/NEW/view',sheetFormat:'hybrid_infographic',primaryRevision:true,pageCount:8,provisional:true,officialSupport:false};
const audit={status:'PASS',pdfSha256:H,expectedCount:3,checkedCount:3,pageCount:8};
const r={resourceId:'new',driveId:'NEW',pdfSha256:H,pageCount:8,lexiconTermCount:12,provisional:true,nativeSupportAvailable:false,visualAudit:audit,publishedVerification:{...audit,status:'MATCH',source:'authenticated_drive_download'},ownerReview:{status:'owner_accepted',pdfSha256:H,pagesChecked:8,visualReference:'pharmacologie_v1.47_24_pages',scientificReview:'documentary_review_completed',independentMedicalReview:'not_attested'},publicationApproval:{status:'approved',authorization:'explicit_go_publication',scope:'revision_sheet_only',approvedAt:'2026-10-23T08:00:00Z'}};
r.publicationApproval.bundleSha256=revisionSheetDigest(r,row);
const old={courseId:'demo',qcmBank:'qdemo.txt'},next={...old,revisionSheetSupplement:r};
const data={registry:{courses:[{id:'demo',nativeSupportAvailable:false}]},sheets:[oldRow],infographics:[],vocals:[],banks:{'qdemo.txt':[{courseId:'demo',id:'q',answers:[1],flashcards:[{front:'Q',answers:['R']}]}]},vocabulary:[],imageHashes:{}};
const after={...data,sheets:[oldRow,row]};
assert.equal(validateRevisionSheetChange('demo',old,next,data,after).resourceId,'new');
for(const mutate of [
 (d,n)=>{d.banks['qdemo.txt'][0].answers=[0]},
 (d,n)=>{d.banks['qdemo.txt'][0].flashcards[0].answers=['Autre']},
 (d,n)=>{d.vocals.push({courseId:'demo',id:'mp3'})},
 (d,n)=>{d.infographics.push({courseId:'demo',resourceId:'board'})},
 (d,n)=>{d.sheets[0].url='https://drive.google.com/file/d/OTHER/view'},
 (d,n)=>{d.sheets.push({...row,resourceId:'extra'})},
 (d,n)=>{n.publicationApproval={status:'approved'}},
 (d,n)=>{n.revisionSheetSupplement.publishedVerification.status='FAIL'},
 (d,n)=>{n.revisionSheetSupplement.ownerReview.independentMedicalReview='approved'},
 (d,n)=>{n.revisionSheetSupplement.pdfSha256='b'.repeat(64)},
 (d,n)=>{n.revisionSheetSupplement.publicationApproval.scope='course_package'},
 (d,n)=>{n.revisionSheetSupplement.provisional=false;d.sheets[1].provisional=false}
]){
 const d=clone(after),n=clone(next);mutate(d,n);
 n.revisionSheetSupplement.publicationApproval.bundleSha256=revisionSheetDigest(n.revisionSheetSupplement,d.sheets.find(x=>x.resourceId==='new'));
 assert.throws(()=>validateRevisionSheetChange('demo',old,n,data,d));
}
const manifest=JSON.parse(fs.readFileSync('docs/course-deliveries.json','utf8')),sheets=[1,2,3].flatMap(n=>JSON.parse(fs.readFileSync('sheets-'+n+'.json','utf8')));
for(const [id,pages,terms,sha] of [['douleur',32,55,'4272bc3de97824e9eb74a30d4d79b22c6bb981c27447d77ef2d6bc14c517b27c'],['pharmacologie',24,34,'08e7f7a4323475aff737591e3f5a7bde1b08458087451b4d95bdbc6c1c21d3dd']]){
 const d=manifest.courses.find(x=>x.courseId===id),r=d.revisionSheetSupplement;
 validateRevisionSheetSupplement(id,d,{sheets});assert.equal(r.pageCount,pages);assert.equal(r.lexiconTermCount,terms);assert.equal(r.pdfSha256,sha);
}
console.log('PASS: deux fiches exactes approuvées; refus des changements QCM, flashcards, MP3, archives et faux statuts de revue.');
