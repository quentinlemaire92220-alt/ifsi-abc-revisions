// Fetch only comparison commits. Never substitute HEAD when an explicit base is missing.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';

export function prepareHistory({cwd=process.cwd(),env=process.env,manifestPath='docs/course-deliveries.json',reportPath}={}){
 const started=performance.now(),fetches=[];
 const git=(...args)=>execFileSync('git',args,{cwd,encoding:'utf8',maxBuffer:32*1024*1024,stdio:['ignore','pipe','pipe']}).trim();
 const sha=value=>{assert.match(value||'',/^[a-f0-9]{40}$/i,'SHA Git complet requis');assert.ok(!/^0+$/.test(value),'SHA nul interdit');return value;};
 const exists=ref=>{
  try{
   // A promisor clone otherwise lazily fetches the commit before our bounded fetch.
   execFileSync('git',['cat-file','-e',ref+'^{commit}'],{cwd,stdio:'ignore',env:{...process.env,GIT_NO_LAZY_FETCH:'1'}});
   return true;
  }catch{return false;}
 };
 const fetch=ref=>{const t=performance.now();git('fetch','--no-tags','--depth=1','--filter=blob:none','origin',ref);fetches.push({ref,seconds:(performance.now()-t)/1000});};
 const ensure=ref=>{sha(ref);if(!exists(ref))fetch(ref);assert.ok(exists(ref),'Commit de comparaison absent après récupération : '+ref);return ref;};
 const branch=env.DEFAULT_BRANCH||'main';
 assert.ok(!branch.startsWith('-')&&branch.length<200);git('check-ref-format','refs/heads/'+branch);
 let base,reason;
 if(env.PR_BASE_SHA){base=ensure(env.PR_BASE_SHA);reason='pull_request_base';}
 else if(env.GITHUB_REF==='refs/heads/'+branch&&env.PUSH_BEFORE_SHA&&!/^0+$/.test(env.PUSH_BEFORE_SHA)){
  base=ensure(env.PUSH_BEFORE_SHA);reason='default_branch_before';
 }else{
  // A new branch push has no PR payload; compare with the actual published tip.
  fetch(branch);const tip=sha(git('rev-parse','FETCH_HEAD'));
  if(tip!==git('rev-parse','HEAD')){base=tip;reason='published_tip';}
  else{
   // A depth-one fetch can mark HEAD shallow; the raw commit still records its parent.
   const parent=git('cat-file','-p','HEAD').match(/^parent ([a-f0-9]{40})$/m)?.[1];
   base=ensure(sha(parent));reason='default_branch_parent';
  }
 }
 const manifest=JSON.parse(fs.readFileSync(path.resolve(cwd,manifestPath),'utf8'));
 const historical=[...new Set((manifest.courses||[]).map(c=>c.officialRevision?.baseSha).filter(Boolean))];
 for(const ref of historical)ensure(ref);
 // Prove the exact objects needed by historical review tests are readable.
 for(const c of manifest.courses||[])if(c.officialRevision?.baseSha){
  const ref=c.officialRevision.baseSha;
  for(const file of ['docs/course-deliveries.json','course-registry-v741.json','sheets-3.json',c.qcmBank].filter(Boolean))git('show',ref+':'+file);
 }
 git('show',base+':course-registry-v741.json');
 if(env.GITHUB_ENV)fs.appendFileSync(env.GITHUB_ENV,'IFSI_BASE_SHA='+base+'\n');
 const result={base,reason,historical,fetches,seconds:(performance.now()-started)/1000,shallow:git('rev-parse','--is-shallow-repository')==='true'};
 if(reportPath){fs.mkdirSync(path.dirname(reportPath),{recursive:true});fs.writeFileSync(reportPath,JSON.stringify(result,null,2)+'\n');}
 return result;
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const i=process.argv.indexOf('--report');console.log(JSON.stringify(prepareHistory({reportPath:i<0?undefined:process.argv[i+1]})));
}
