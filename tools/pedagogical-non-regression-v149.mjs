// Garde-fou public v1.49 : preuve STRUCTURELLE uniquement, sans matrice PLAUD privée.
// La CI ne peut jamais attester la fidélité sémantique ni signer une approbation humaine.
import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

const SHA=/^[a-f0-9]{64}$/i, BASE=/^[a-f0-9]{40}$/i;
const SHEET_FILES=['sheets-1.json','sheets-2.json','sheets-3.json'];
const RECEIPT_FIELDS=new Set([
 'contract','sheetSha256','privateEvidenceSha256','reviewedAt',
 'sourceInventory','sourceCoverage','inheritanceReview','depthReview',
 'differencesReview','decision'
]);
function verifyReceipt(receipt, delivery, expectedSha, hasHistoricalSheet) {
 assert.ok(receipt && typeof receipt==='object' && !Array.isArray(receipt),
  'v1.49 : reçu pédagogique absent (preuves privées interdites dans GitHub)');
 for(const key of Object.keys(receipt))
  assert.ok(RECEIPT_FIELDS.has(key),'v1.49 : champ public non autorisé '+key);
 assert.equal(receipt.contract,'ifsi_pedagogical_non_regression_v149','v1.49 : contrat incorrect');
 assert.match(receipt.sheetSha256||'',SHA,'v1.49 : empreinte PDF candidate absente');
 assert.equal(receipt.sheetSha256.toLowerCase(),expectedSha.toLowerCase(),
  'v1.49 : reçu non lié aux octets de la fiche');
 assert.match(receipt.privateEvidenceSha256||'',SHA,
  'v1.49 : empreinte de preuve privée absente');
 assert.match(receipt.reviewedAt||'',/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?(?:Z|[+-]\d{2}:\d{2})$/,
  'v1.49 : date de revue et fuseau requis');
 assert.equal(receipt.sourceInventory,'reviewed','v1.49 : inventaire des sources non attesté');
 assert.ok(['complete','limited'].includes(receipt.sourceCoverage),
  'v1.49 : couverture accessible/limitée non déclarée');
 assert.ok(['compared','not_applicable_new_course'].includes(receipt.inheritanceReview),
  'v1.49 : comparaison historique manquante');
 if(hasHistoricalSheet)assert.equal(receipt.inheritanceReview,'compared',
  'v1.49 : ancienne fiche non comparée');
 assert.equal(receipt.depthReview,'reviewed','v1.49 : citer ≠ expliquer : revue de profondeur absente');
 assert.equal(receipt.differencesReview,'reviewed','v1.49 : journal avant/après absent');
 assert.ok(['full_review_recorded','scoped_provisional_review_recorded'].includes(receipt.decision),
  'v1.49 : décision de revue non renseignée');
 if(receipt.sourceCoverage==='limited'){
  assert.equal(receipt.decision,'scoped_provisional_review_recorded',
   'v1.49 : couverture limitée présentée comme complète');
  assert.equal(delivery.status,'partial','v1.49 : source limitée exige livraison partielle');
  assert.equal(delivery.pedagogicalValidated,false,
   'v1.49 : source limitée ne peut pas être déclarée validée pédagogiquement');
 }else assert.equal(receipt.decision,'full_review_recorded',
  'v1.49 : statut provisoire sans réserve documentaire');
 assert.equal(delivery.publicationApproval?.status,'approved',
  'v1.49 : reçu structurel ≠ GO de publication');
 assert.equal(delivery.publicationApproval?.authorization,'explicit_go_publication',
  'v1.49 : autorisation distincte non tracée');
 return true;
}
function git(...args){return execFileSync('git',args,{encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();}
function oldJson(base,file){
 try{return JSON.parse(git('show',base+':'+file));}catch(e){
  // Le seul cas toléré est une ressource nouvelle non présente dans l'arbre de base.
  try{git('cat-file','-e',base+':'+file);}catch{return [];}
  throw e;
 }
}
function getSheets(files){return files.flatMap(f=>JSON.parse(fs.readFileSync(f,'utf8')));}
function resourceKey(s){return s.resourceId||s.courseId+'::'+(s.url||s.title);}
function localAsset(s){
 try {const u=new URL(s.url);const ix=u.pathname.indexOf('/assets/');
  return ix<0?null:decodeURIComponent(u.pathname.slice(ix+1));
 }catch{return null;}
}
function selectDelivery(manifest,s){
 const course=manifest.courses.find(d=>d.courseId===s.courseId);
 assert.ok(course,'v1.49 : fiche nouvelle sans manifeste de livraison : '+s.courseId);
 const part=(course.partDeliveries||[]).find(p=>(p.sheetResourceIds||[]).includes(s.resourceId));
 return {course,part,scope:part||course};
}
function expectedHash(course,part,s){
 const asset=localAsset(s);
 if(asset && fs.existsSync(asset))
  return crypto.createHash('sha256').update(fs.readFileSync(asset)).digest('hex');
 return part?.publicArtifacts?.sheet?.sha256
  ||course.publicArtifacts?.sheet?.sha256
  ||part?.writtenPdfAudit?.pdfSha256
  ||course.writtenPdfAudit?.pdfSha256
  ||course.artifactSha256s?.[s.resourceId]
  ||part?.templateConformance?.artifacts?.sheet?.artifactSha256
  ||course.templateConformance?.artifacts?.sheet?.artifactSha256;
}
function runGate(base){
 assert.match(base||'',BASE,'v1.49 : --base SHA Git complet obligatoire');
 git('cat-file','-e',base+'^{commit}');
 const changed=new Set(git('diff','--name-only',base,'HEAD').split('\n').filter(Boolean));
 const active=getSheets(SHEET_FILES),old=SHEET_FILES.flatMap(f=>oldJson(base,f));
 const byId=new Map(old.map(s=>[resourceKey(s),s]));
 const hist=new Set(old.map(s=>s.courseId));
 const manifest=JSON.parse(fs.readFileSync('docs/course-deliveries.json','utf8'));
 let reviewed=0;
 for(const s of active){
  const prev=byId.get(resourceKey(s)),asset=localAsset(s);
  const touchedPdf=!!asset && changed.has(asset);
  const changedSheet=!prev||['url','pageCount','sheetFormat','primaryRevision'].some(k=>s[k]!==prev[k]);
  if(!changedSheet&&!touchedPdf)continue;
  const {course,part,scope}=selectDelivery(manifest,s);
  const sha=expectedHash(course,part,s);
  assert.match(sha||'',SHA,'v1.49 : SHA du PDF candidat absent : '+s.courseId);
  const receipt=scope.pedagogicalNonRegression || (part?null:course.pedagogicalNonRegression);
  try{verifyReceipt(receipt,course,sha,hist.has(s.courseId));}
  catch(e){throw new Error(s.courseId+'/'+(s.resourceId||s.title)+' : '+e.message);}
  reviewed++;
 }
 console.log('PASS contrôle structurel v1.49 : '+reviewed+' fiche(s) nouvelle(s)/modifiée(s).');
 console.log('La matrice, le journal, le contrôle sémantique et le GO authentique restent privés et humains.');
}
function selfTest(){
 const H='a'.repeat(64),E='b'.repeat(64);
 const d={status:'complete',pedagogicalValidated:true,
  publicationApproval:{status:'approved',authorization:'explicit_go_publication'}};
 const r={contract:'ifsi_pedagogical_non_regression_v149',sheetSha256:H,
  privateEvidenceSha256:E,reviewedAt:'2026-10-28T13:00:00+01:00',
  sourceInventory:'reviewed',sourceCoverage:'complete',inheritanceReview:'compared',
  depthReview:'reviewed',differencesReview:'reviewed',decision:'full_review_recorded'};
 assert.equal(verifyReceipt(r,d,H,true),true);
 const bad=(patch,delivery=d,historical=true)=>{
  assert.throws(()=>verifyReceipt({...r,...patch},delivery,H,historical));
 };
 bad({privateEvidenceSha256:null});
 bad({sheetSha256:E});
 bad({inheritanceReview:'not_applicable_new_course'});
 bad({depthReview:'cited'});
 bad({differencesReview:'missing'});
 bad({sourceCoverage:'limited'});
 bad({extraPrivateTranscript:'do not publish'});
 const scoped={...d,status:'partial',pedagogicalValidated:false};
 assert.equal(verifyReceipt({...r,sourceCoverage:'limited',
  decision:'scoped_provisional_review_recorded'},scoped,H,true),true);
 bad({sourceCoverage:'limited',decision:'scoped_provisional_review_recorded'},d);
 bad({sourceInventory:'blocked'});
 bad({decision:'blocked_regression'});
 const noGo={...d,publicationApproval:{status:'pending',authorization:'explicit_go_publication'}};
 bad({},noGo);
 assert.equal(verifyReceipt({...r,inheritanceReview:'not_applicable_new_course'},d,H,false),true);
 console.log('PASS v1.49 : tests de contrat (SHA, héritage, profondeur, limites, GO, confidentialité).');
}
if(process.argv.includes('--self-test'))selfTest();
else {
 const ix=process.argv.indexOf('--base');
 runGate(ix>=0?process.argv[ix+1]:process.env.IFSI_BASE_SHA);
}
