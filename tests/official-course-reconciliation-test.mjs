import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {validateOfficialReconciliation} from './official-course-reconciliation-contract.mjs';
import {publicationBundle,bundleDigest} from './course-publication-approval-lib.mjs';
const sha=x=>createHash('sha256').update(x).digest('hex'),bytes=Buffer.from('fixture PDF'),url=p=>'https://quentinlemaire92220-alt.github.io/ifsi-abc-revisions/'+p;
const artifact={path:'assets/demo/old.pdf',sha256:sha(bytes),pageCount:1};
const prior={courseId:'demo',provisional:true,qcmBank:'demo.json',sheetResourceId:'s1',vocals:[],infographics:[],publicArtifacts:{sheet:artifact},publicationApproval:{bundleSha256:'a'.repeat(64)}};
const oldCourse={id:'demo',label:'Démo provisoire',provisional:true,officialSupport:false,sourceStatus:'provisional',audioCount:0,additionalDocuments:[{url:url(artifact.path)}]};
const oldQ={id:'q1',courseId:'demo',question:'Notion historique',flashcards:[{front:'Question',answers:['Réponse']}]};
const before={registry:{courses:[oldCourse]},sheets:[{courseId:'demo',resourceId:'s1',url:url(artifact.path)}],vocals:[],infographics:[],vocabulary:[],banks:{'demo.json':[oldQ]},imageHashes:{}};
const after=structuredClone(before),a={path:'assets/demo/new.pdf',sha256:sha(bytes),pageCount:2};
Object.assign(after.registry.courses[0],{label:'Démo',provisional:false,officialSupport:true,sourceStatus:'active',qcmPdfUrl:url(a.path),qcmPdfQuestionCount:1,flashcardTarget:1});
after.registry.courses[0].additionalDocuments.push({url:url(a.path)});Object.assign(after.sheets[0],{url:url(a.path),pageCount:2,officialSupport:true,provisional:false});
const delivery={...structuredClone(prior),validated:true,provisional:false,pedagogicalValidated:true,qcmCount:1,flashcardCount:1,vocabularyCount:0,sourceAudit:{officialChecked:true,officialSupportPreservedPrivately:true},sourceBasis:{reconciled:true,nativeSupportAvailable:true},publicArtifacts:{sheet:a,qcm:a,flashcards:a},reconciliation:{type:'provisional_to_official_v1',previousBundleSha256:prior.publicationApproval.bundleSha256,previousArtifacts:prior.publicArtifacts},publicationApproval:{status:'approved',authorization:'explicit_go_publication',scope:'course_package',approvedAt:'2026-10-26T14:00:00Z'}};
const fixture=()=>({prior:structuredClone(prior),delivery:structuredClone(delivery),before:structuredClone(before),after:structuredClone(after),readAsset:()=>bytes});
const sign=x=>{x.delivery.publicationApproval.bundleSha256=bundleDigest(publicationBundle('demo',x.delivery,x.after));return x};
assert.equal(validateOfficialReconciliation(sign(fixture())),true);
for(const mutate of [
 x=>{x.delivery.reconciliation.previousBundleSha256='b'.repeat(64)},
 x=>{x.delivery.reconciliation.previousArtifacts={}},
 x=>{x.readAsset=()=>Buffer.from('archive altérée')},
 x=>{x.after.banks['demo.json'][0].question='Question historique réécrite'},
 x=>{x.after.registry.courses[0].audioCount=1},
 x=>{x.after.registry.courses[0].id='autre'},
 x=>{x.after.registry.courses[0].additionalDocuments.shift()},
 x=>{x.delivery.sourceAudit.officialChecked=false},
 x=>{x.delivery.publicArtifacts.sheet.sha256='c'.repeat(64)},
 x=>{x.delivery.publicationApproval.authorization='implicit'},
 x=>{x.delivery.publicationApproval.status='pending'}
]){const x=fixture();mutate(x);assert.throws(()=>validateOfficialReconciliation(sign(x)));}
const unsigned=sign(fixture());unsigned.after.registry.courses[0].label='Mutation après accord';assert.throws(()=>validateOfficialReconciliation(unsigned));
console.log('PASS rapprochement officiel : nouvel accord, identité, archives, anciens QCM/cartes, documents et octets protégés ; 12 mutations rejetées.');
