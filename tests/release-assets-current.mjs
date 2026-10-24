import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {verifyPublicArtifact,pagesOrigin,pagesPrefix} from '../tools/public-artifact-contract.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const meta=read('build-meta.json'),base=process.env.IFSI_BASE_SHA;
assert.match(base||'',/^[a-f0-9]{40}$/i,'Base complète obligatoire');
const old=JSON.parse(execFileSync('git',['show',base+':build-meta.json'],{encoding:'utf8'}));
const cmp=(a,b)=>{const x=a.split('.').map(Number),y=b.split('.').map(Number);for(let i=0;i<Math.max(x.length,y.length);i++){if((x[i]||0)!==(y[i]||0))return (x[i]||0)-(y[i]||0);}return 0;};
const changed=execFileSync('git',['diff','--name-only',base],{encoding:'utf8'}).trim().split(/\r?\n/);
const publishes=changed.some(f=>/^(?:assets\/|data\/course-banks\/|questions-\d\.json$|qextra-\d+\.txt$|sheets-\d\.json$|course-registry-v741.json$|docs\/course-deliveries.json$|[^/]+\.(?:js|html|webmanifest)$)/.test(f));
if(publishes)assert.ok(cmp(meta.version,old.version)>0&&Number(meta.build)>Number(old.build),'Publication : version et build doivent progresser');
const index=fs.readFileSync('index.html','utf8'),sw=fs.readFileSync('sw.js','utf8');
// Template interpolations inside scripts are not literal HTML asset URLs.
const names=[...index.matchAll(/(?:src|href)="\.\/([^"?#]+)(?:\?[^"#]*)?"/g)].map(m=>m[1]).filter(s=>!s.includes('${'));
for(const name of names)assert.ok(fs.existsSync(name),'Ressource index absente : '+name);
const assets=sw.match(/const BASE_ASSETS=\[(.*?)\];/s);
assert.ok(assets);
for(const [,name] of assets[1].matchAll(/'([^']+)'/g)){
 const relative=name.replace(/^\.\//,'').split('?')[0]||'index.html';
 assert.ok(!path.isAbsolute(relative)&&!relative.split('/').includes('..'));
 assert.ok(fs.existsSync(relative),'Ressource précache absente : '+relative);
}
assert.ok(sw.includes('src="./${name}?v='+meta.build+'"'),'Modules de secours SW avec ancien build');
for(const d of read('docs/course-deliveries.json').courses.filter(d=>d.publicArtifacts)){
 for(const a of Object.values(d.publicArtifacts))verifyPublicArtifact(d,pagesOrigin+pagesPrefix+a.path);
 const rows=read(d.qcmBank);
 assert.equal(rows.length,d.qcmCount);
 assert.equal(rows.reduce((n,q)=>n+q.flashcards.length,0),d.flashcardCount);
 assert.deepEqual(rows,read('questions-5.json').filter(q=>q.courseId===d.courseId),'Miroir runtime divergent');
}
console.log('PASS release : versions croissantes, index/précache présents, secours SW et banques/PDF');
