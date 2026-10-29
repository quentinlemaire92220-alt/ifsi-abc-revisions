// Probe HTTP indépendant, exécuté sur un runner GitHub Actions non authentifié.
// Ne lit aucun secret, aucune ressource Drive privée, ni aucun artefact PR local.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const url='https://quentinlemaire92220-alt.github.io/ifsi-abc-revisions/assets/droits-patients/UE_A2_1_S1_Droits_des_patients_Fiche_de_revision.pdf';
const expected='52ab60513762814abbb48b4ec8a05ff687b3c0429d49689e81185701595844f5';
let lastError=null;
for(let attempt=1;attempt<=6;attempt++){
 try{
  const response=await fetch(url+'?no-cache='+attempt,{
   redirect:'follow',headers:{'Cache-Control':'no-cache','Accept':'application/pdf'},
   signal:AbortSignal.timeout(20000)
  });
  assert.equal(response.status,200,'HTTP public doit être 200');
  const bytes=Buffer.from(await response.arrayBuffer());
  assert.equal(bytes.length,1060611,'Le PDF public n’a pas la taille approuvée');
  assert.equal(bytes.toString('latin1',0,5),'%PDF-','Le serveur ne renvoie pas de PDF');
  const hash=createHash('sha256').update(bytes).digest('hex');
  assert.equal(hash,expected,'Le PDF public n’est pas la V8 exacte');
  const verifiedAt=new Date().toISOString();
  console.log('PUBLIC_PDF_VERIFIED '+JSON.stringify({
   source:'anonymous_public_download',method:'full_download_sha256',status:'MATCH',
   httpStatus:200,url,verifiedAt,pdfSha256:hash,bytes:bytes.length,
   urlChecked:response.url,attempt
  }));
  process.exit(0);
 }catch(e){
  lastError=e;
  console.warn('PUBLIC_PDF_NOT_READY',attempt,String(e.message||e).slice(0,300));
  if(attempt<6)await new Promise(r=>setTimeout(r,3000));
 }
}
throw lastError;
