import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {execFileSync} from 'node:child_process';
import {prepareHistory} from '../tools/prepare-ci-history.mjs';
const root=fs.mkdtempSync(path.join(os.tmpdir(),'ifsi-history-'));
const git=(cwd,...args)=>execFileSync('git',args,{cwd,encoding:'utf8',stdio:['ignore','pipe','pipe']}).trim();
const source=path.join(root,'source');fs.mkdirSync(source);git(source,'init','-b','main');
git(source,'config','user.email','test@example.invalid');git(source,'config','user.name','Fixture');
fs.mkdirSync(path.join(source,'docs'));let commits=[];
for(let i=0;i<6;i++){
 fs.writeFileSync(path.join(source,'course-registry-v741.json'),JSON.stringify({courses:[],fixture:i}));
 fs.writeFileSync(path.join(source,'docs/course-deliveries.json'),JSON.stringify({courses:[]}));
 fs.writeFileSync(path.join(source,'sheets-3.json'),'[]');fs.writeFileSync(path.join(source,'bank.json'),'[]');
 git(source,'add','.');git(source,'commit','-m','fixture '+i);commits.push(git(source,'rev-parse','HEAD'));
}
const main=commits.at(-1);git(source,'checkout','-b','candidate');
fs.writeFileSync(path.join(source,'docs/course-deliveries.json'),JSON.stringify({courses:[{officialRevision:{baseSha:commits[0]},qcmBank:'bank.json'}]}));
git(source,'add','.');git(source,'commit','-m','candidate');
git(source,'commit','--allow-empty','-m','candidate2');
function clone(name,branch='candidate'){
 const cwd=path.join(root,name);git(root,'clone','--no-local','--depth=2','--single-branch','--branch',branch,pathToFileURL(source).href,cwd);return cwd;
}
const environment={DEFAULT_BRANCH:'main',GITHUB_REF:'refs/heads/candidate'};
let cwd=clone('pr'),out=prepareHistory({cwd,env:{...environment,PR_BASE_SHA:main}});
assert.equal(out.base,main);assert.deepEqual(out.historical,[commits[0]]);assert.equal(out.shallow,true);
assert.ok(Number(git(cwd,'rev-list','--all','--count'))<=4,'Historique complet téléchargé');
assert.equal(git(cwd,'show',commits[0]+':bank.json'),'[]');
cwd=clone('push','main');out=prepareHistory({cwd,env:{DEFAULT_BRANCH:'main',GITHUB_REF:'refs/heads/main',PUSH_BEFORE_SHA:commits[2]}});
assert.equal(out.base,commits[2]);assert.equal(out.reason,'default_branch_before');
cwd=clone('branch');out=prepareHistory({cwd,env:environment});assert.equal(out.base,main);assert.equal(out.reason,'published_tip');
cwd=clone('manual','main');out=prepareHistory({cwd,env:{DEFAULT_BRANCH:'main',GITHUB_REF:'refs/heads/main'}});
assert.equal(out.base,commits[4]);assert.equal(out.reason,'default_branch_parent');
for(const base of ['0'.repeat(40),'invalid','f'.repeat(40)])assert.throws(()=>prepareHistory({cwd,env:{...environment,PR_BASE_SHA:base}}),'Base explicite invalide remplacée silencieusement');
const workflow=fs.readFileSync('.github/workflows/tnr.yml','utf8');
assert.ok(!/fetch-depth:\s*0/.test(workflow),'Récupération complète réintroduite');
assert.equal((workflow.match(/node tools\/prepare-ci-history.mjs/g)||[]).length,2,'Les deux jobs doivent préparer leur base exacte');
assert.ok(workflow.includes('node tests/ci-history-recovery.mjs'));
console.log('PASS récupération ciblée : PR, push main, nouvelle branche, manuel, révision historique et refus des bases invalides ; aucun historique complet.');
