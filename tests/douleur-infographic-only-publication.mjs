import assert from 'node:assert/strict';
import {publicationBundle,bundleDigest,validateChangedDeliveries} from './course-publication-approval-lib.mjs';
const H='a'.repeat(64),J='b'.repeat(64),Q='c'.repeat(64);
const oldRow={courseId:'douleur',resourceId:'old_01',title:'Ancienne planche',url:'https://drive.google.com/file/d/OLD_PDF/view'};
const packRow={courseId:'douleur',resourceId:'douleur_infographies_pack_16_20261022',
 title:'16 nouvelles planches',url:'https://drive.google.com/file/d/NEW_PDF/view',pageCount:16,coverageStatus:'partial'};
const base={registry:{courses:[{id:'douleur',label:'Douleur aiguë et chronique'}]},
 sheets:[],infographics:[oldRow],vocals:[],banks:{'qextra-51.txt':[{courseId:'douleur',id:'q1',answers:[0],choices:['A','B','C','D','E']}]},
 vocabulary:[],imageHashes:{}};
const newer={...base,infographics:[oldRow,packRow]};
const delivery={courseId:'douleur',publicationScope:'infographics_only',infographicPackDriveId:'NEW_PDF',
 infographicResourceIds:['douleur_infographies_pack_16_20261022'],qcmBank:'qextra-51.txt',reviewedBoardCount:16,
 artifactSha256s:{OLD_PDF:H,NEW_PDF:J},
 visualOwnerReview:{status:'owner_accepted',reference:'cardiovascular_infographic_pdf_1p',
 method:'manual_full_pdf_comparison_100_200_percent',reviewedAt:'2026-10-22T08:12:35Z',
 reviewerDecision:'explicit_graphic_acceptance',
 criteria:Object.fromEntries(['INFOGRAPHIC_VISUAL_FIRST','MEDICAL_ILLUSTRATION_REAL',
 'INTEGRATED_IN_CONTEXT','ORIGINAL_LEGENDS_VERIFIED','NO_DECORATIVE_BOX_SUBSTITUTION','ALL_PAGES_CHECKED']
 .map(x=>[x,'PASS'])),reviewedPackSha256:J},
 publicationApproval:{status:'approved',authorization:'explicit_go_publication',
 scope:'infographics_only',approvedAt:'2026-10-22T08:12:35Z',bundleSha256:null}};
delivery.publicationApproval.bundleSha256=bundleDigest(publicationBundle('douleur',delivery,newer));
const before={courses:[]},after={courses:[delivery]};
assert.equal(validateChangedDeliveries(before,after,base,newer).length,1);
const clone=o=>JSON.parse(JSON.stringify(o));
const rejects=(b,a,re)=>assert.throws(()=>validateChangedDeliveries(before,{courses:[b]},base,a),re);
rejects({...delivery,publicationApproval:{...delivery.publicationApproval,scope:'course_package'}},newer,/portee du package/);
rejects(delivery,{...newer,infographics:[...newer.infographics,{...packRow,resourceId:'extra'}]},/une seule nouvelle ressource/);
rejects(delivery,{...newer,infographics:[{...oldRow,title:'Supprime sans accord'},packRow]},/anciennes infographies/);
rejects(delivery,{...newer,registry:{courses:[{id:'douleur',label:'Autre cours'}]}},/modification de course/);
rejects(delivery,{...newer,banks:{'qextra-51.txt':[{...base.banks['qextra-51.txt'][0],answers:[1]}]}},/modification de banks/);
rejects(delivery,{...newer,vocals:[{courseId:'douleur',id:'new'}]},/modification de vocals/);
rejects(delivery,{...newer,sheets:[{courseId:'douleur',resourceId:'new'}]},/modification de sheets/);
const changed=clone(delivery);changed.artifactSha256s.NEW_PDF=Q;
changed.publicationApproval.bundleSha256=bundleDigest(publicationBundle('douleur',changed,newer));
rejects(changed,newer,/pack infographies a change/);
const invalid=clone(delivery);invalid.visualOwnerReview.criteria.INFOGRAPHIC_VISUAL_FIRST='PENDING';
invalid.publicationApproval.bundleSha256=bundleDigest(publicationBundle('douleur',invalid,newer));
rejects(invalid,newer,/INFOGRAPHIC_VISUAL_FIRST/);
console.log('PASS: GO infographies seulement, document identique, 16 planches, QCM et ressources historiques non modifiables.');