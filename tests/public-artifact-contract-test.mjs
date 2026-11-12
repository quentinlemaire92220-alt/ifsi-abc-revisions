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
 fs.writeFileSync('assets/fixture.pdf','changed bytes');assert.throws(()=>verifyPublicArtifact(d,url));
}finally{process.chdir(cwd);fs.rmSync(tmp,{recursive:true,force:true});}
console.log('PASS assets publics : hôte, chemin, présence et SHA approuvé');
