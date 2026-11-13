import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {localAssetPath,verifyPublicArtifact} from '../tools/public-artifact-contract.mjs';
const cwd=process.cwd(),tmp=fs.mkdtempSync(path.join(os.tmpdir(),'ifsi-assets-'));
try{
 process.chdir(tmp);fs.mkdirSync('assets');fs.writeFileSync('assets/fixture.pdf','synthetic bytes');
 const sha=createHash('sha256').update('synthetic bytes').digest('hex');
 const d={publicArtifacts:{qcm:{path:'assets/fixture.pdf',sha256:sha,artifactId:'fixture',pageCount:1}},artifactSha256s:{fixture:sha}};
 const url='https://quentinlemaire92220-alt.github.io/ifsi-abc-revisions/assets/fixture.pdf';
 assert.equal(verifyPublicArtifact(d,url),'fixture');
 for(const bad of [url.replace('github.io','example.org'),url+'?v=1',url.replace('fixture.pdf','unknown.pdf')])assert.throws(()=>verifyPublicArtifact(d,bad));
 assert.throws(()=>localAssetPath('assets/../private.pdf'));
 assert.throws(()=>verifyPublicArtifact({...d,artifactSha256s:{}},url));
 fs.mkdirSync('assets/revision');fs.writeFileSync('assets/revision/fixture.zip','zip bytes');
 const zipSha=createHash('sha256').update('zip bytes').digest('hex'),z={downloadContract:'scoped_reviewed_download_v1',publicationApproval:{scope:'scoped_course_revision',status:'approved',authorization:'explicit_go_publication'},publicArtifacts:{},downloadArtifacts:[{path:'assets/revision/fixture.zip',sha256:zipSha,artifactId:'zip',bytes:9}],artifactSha256s:{zip:zipSha}};
 const zipUrl=url.replace('fixture.pdf','revision/fixture.zip');assert.equal(verifyPublicArtifact(z,zipUrl),'zip');
 assert.throws(()=>verifyPublicArtifact({...z,publicationApproval:{...z.publicationApproval,scope:'other'}},zipUrl));
 assert.throws(()=>verifyPublicArtifact({...z,downloadContract:undefined},zipUrl));
 fs.writeFileSync('assets/revision/fixture.zip','tampered bytes');assert.throws(()=>verifyPublicArtifact(z,zipUrl));
 fs.writeFileSync('assets/revision/cards.html','<html>Cards</html>');
 const html=fs.readFileSync('assets/revision/cards.html'),htmlSha=createHash('sha256').update(html).digest('hex');
 const h={deliveryMode:'first_release',packFormat:'written_v1',downloadContract:'reviewed_course_downloads_v1',publicationApproval:{scope:'course_package',status:'approved',authorization:'explicit_go_publication',bundleSha256:'a'.repeat(64)},downloadArtifacts:[{path:'assets/revision/cards.html',artifactId:'cards',sha256:htmlSha,bytes:html.length,mimeType:'text/html'}],artifactSha256s:{cards:htmlSha}};
 const htmlUrl=url.replace('fixture.pdf','revision/cards.html');assert.equal(verifyPublicArtifact(h,htmlUrl),'cards');
 for(const mutate of [x=>x.downloadContract=undefined,x=>x.publicationApproval.status='pending',x=>x.publicationApproval.scope='other',x=>x.downloadArtifacts[0].mimeType='text/plain',x=>x.downloadArtifacts[0].bytes++,x=>x.artifactSha256s.cards='b'.repeat(64)]){const bad=structuredClone(h);mutate(bad);assert.throws(()=>verifyPublicArtifact(bad,htmlUrl));}
 fs.writeFileSync('assets/revision/cards.html','changed html');assert.throws(()=>verifyPublicArtifact(h,htmlUrl));
 fs.writeFileSync('assets/fixture.pdf','changed bytes');assert.throws(()=>verifyPublicArtifact(d,url));
}finally{process.chdir(cwd);fs.rmSync(tmp,{recursive:true,force:true});}
console.log('PASS assets publics : hôte, chemin, présence et SHA approuvé');
