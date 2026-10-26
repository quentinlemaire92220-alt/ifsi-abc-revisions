// Aggregate every targeted failure. Read-only: never signs a course or changes a bank.
import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
const args=process.argv.slice(2),value=name=>{const i=args.indexOf(name);return i<0?undefined:args[i+1];};
const stage=value('--stage'),base=value('--base')||process.env.IFSI_BASE_SHA;
if(!['preparation','publication'].includes(stage)||!/^[a-f0-9]{40}$/i.test(base||''))throw Error('--stage preparation|publication et --base SHA complet requis');
if(spawnSync('git',['cat-file','-e',base+'^{commit}']).status!==0)throw Error('Base Git absente : pas de repli silencieux');
process.env.IFSI_BASE_SHA=base;
const n=process.execPath,py=process.env.IFSI_PYTHON||'python';
const commands=[
 ['graphic_contract',py,['tests/pdf-graphics-v2-test.py']],
 ['template_contract',py,['tests/pdf-template-v3-test.py']],
 ['pedagogical_contract',n,['tests/qcm-autonomy-contract-test.mjs']],
 ['pedagogical_contract',n,['tests/qcm-bank-contract-test.mjs']],
 ['pedagogical_contract',n,['tests/course-bank-current.mjs',stage]],
 ['preparation_isolation',n,['tests/course-preparation-stage.mjs']],
];
if(stage==='publication')commands.push(
 ['pedagogical_contract',n,['tests/qcm-autonomy-changed.mjs']],
 ['graphic_contract',py,['tools/pdf-graphics-v2-batch.py','--base',base]],
 ['template_contract',py,['tools/pdf-template-v3.py','--base',base]],
 ['pdf_bank_bytes',py,['tools/pdf-bank-coherence.py']],
 ['pdf_bank_bytes',n,['tests/posture-td2-publication-gate.mjs']],
 ['technical_release',n,['tests/public-artifact-contract-test.mjs']],
 ['technical_release',n,['tests/ux-regression.mjs']],
 ['technical_release',n,['tests/pwa-install.mjs']],
 ['technical_release',n,['tests/resource-sync-v821.mjs']],
 ['technical_release',n,['tests/release-assets-current.mjs']],
 ['publication_authorization',n,['tests/course-delivery.mjs']],
 ['publication_authorization',n,['tests/course-complement-additive-test.mjs']],
 ['publication_authorization',n,['tests/private-resource-withdrawal-test.mjs']],
 ['publication_authorization',n,['tests/course-publication-approval.mjs']],
 ['publication_authorization',n,['tests/course-delivery-new-course.mjs']],
 ['publication_authorization',n,['tests/course-delivery-parts.mjs']],
 ['publication_authorization',n,['tests/stomatotherapie-delivery.mjs']],
 ['publication_authorization',n,['tests/student-resource-visibility-ui-v1.mjs']],
);
const results=[];
for(const [group,bin,argv] of commands){
 const r=spawnSync(bin,argv,{encoding:'utf8',env:process.env,maxBuffer:32*1024*1024,timeout:120000});
 const status=r.status===0?'PASS':'FAIL';
 results.push({group,command:argv,status,exitCode:r.status,error:r.error?.message});
 console.log(`${status} [${group}] ${argv.join(' ')}`);
 if(status==='FAIL')console.log(r.error?.message||r.stderr||r.stdout);
}
const report=value('--report');
if(report){fs.mkdirSync(path.dirname(report),{recursive:true});fs.writeFileSync(report,JSON.stringify({stage,base,results},null,2)+'\n');}
console.log('Préflight : '+results.filter(r=>r.status==='PASS').length+'/'+results.length+' contrôles. La revue pédagogique et le GO restent des preuves privées distinctes.');
if(results.some(r=>r.status==='FAIL'))process.exitCode=1;
