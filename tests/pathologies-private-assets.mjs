#!/usr/bin/env node
// Audit offline des fichiers visuels privés Pathologies P1.
// Aucune publication, aucune lecture de GitHub, aucun diagnostic médical.
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
const validSha=s=>typeof s==='string'&&/^[0-9a-f]{64}$/i.test(s);
function verify(file,expected=18){
 const root=path.dirname(path.resolve(file));
 const manifest=JSON.parse(fs.readFileSync(file,'utf8'));
 const errors=[];
 if(manifest.reviewOnly!==true||manifest.publicationPermitted!==false)errors.push('missing_private_review_guard');
 if(manifest.shaAlgorithm!=='SHA-256')errors.push('invalid_hash_algorithm');
 const entries=Object.entries(manifest.assets||{});
 if(entries.length!==expected)errors.push('unexpected_asset_count');
 const counts={bpco:0,hta:0,dt2:0};
 const seen=new Set();
 for(const [relative,m] of entries){
  if(typeof relative!=='string'||!/^assets\/(bpco|hta|dt2)\/p0[1-6]\.png$/.test(relative)||seen.has(relative)){errors.push('invalid_asset_path');continue;}
  seen.add(relative);
  const id=relative.split('/')[1];counts[id]++;
  const full=path.resolve(root,relative);
  if(!full.startsWith(root+path.sep)){errors.push('path_traversal');continue;}
  let buf;
  try{buf=fs.readFileSync(full);}catch{errors.push('asset_missing');continue;}
  if(!validSha(m?.sha256)||digest(buf)!==m.sha256)errors.push('asset_hash_mismatch');
  if(!Number.isInteger(m?.bytes)||m.bytes!==buf.length)errors.push('asset_size_mismatch');
  if(buf.length<24||buf.toString('hex',0,8)!=='89504e470d0a1a0a'){errors.push('invalid_png');continue;}
  const width=buf.readUInt32BE(16),height=buf.readUInt32BE(20);
  if(width<1||height<1||width!==m.width||height!==m.height)errors.push('image_dimensions_mismatch');
  if(m?.medicalReview==='approved')errors.push('private_audit_cannot_approve_medical_content');
  if(!/^documents\/[^/]+$/.test(m?.sourceDocument||''))errors.push('source_document_missing');
  else if(!fs.existsSync(path.join(root,m.sourceDocument)))errors.push('source_document_not_found');
 }
 for(const id of Object.keys(counts))if(expected===18&&counts[id]!==6)errors.push('missing_six_pages_'+id);
 return {status:errors.length?'BLOCKED':'VISUAL_ASSETS_READY_FOR_PRIVATE_REVIEW_ONLY',assetCount:entries.length,counts,errors:[...new Set(errors)]};
}
function selfTest(){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'ifsi-p1-private-assets-'));
 try{
  fs.mkdirSync(path.join(dir,'assets','bpco'),{recursive:true});
  fs.mkdirSync(path.join(dir,'documents'),{recursive:true});
  const tiny=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+/cFoAAAAASUVORK5CYII=','base64');
  const file=path.join(dir,'assets/bpco/p01.png');fs.writeFileSync(file,tiny);
  fs.writeFileSync(path.join(dir,'documents','source.png'),tiny);
  const a={sha256:digest(tiny),bytes:tiny.length,width:1,height:1,medicalReview:'pending',sourceDocument:'documents/source.png'};
  const m={reviewOnly:true,publicationPermitted:false,shaAlgorithm:'SHA-256',assets:{'assets/bpco/p01.png':a}};
  const mf=path.join(dir,'manifest.json');
  fs.writeFileSync(mf,JSON.stringify(m));
  assert.equal(verify(mf,1).status,'VISUAL_ASSETS_READY_FOR_PRIVATE_REVIEW_ONLY');
  fs.writeFileSync(file,Buffer.concat([tiny,Buffer.from('change')]));
  assert.ok(verify(mf,1).errors.includes('asset_hash_mismatch'));
  fs.writeFileSync(file,tiny);a.medicalReview='approved';fs.writeFileSync(mf,JSON.stringify(m));
  assert.ok(verify(mf,1).errors.includes('private_audit_cannot_approve_medical_content'));
  m.publicationPermitted=true;fs.writeFileSync(mf,JSON.stringify(m));
  assert.ok(verify(mf,1).errors.includes('missing_private_review_guard'));
  console.log('✅ Manifest privé Pathologies : empreintes, dimensions, six pages, provenance et blocages de publication');
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
}
if(process.argv[2]==='--self-test')selfTest();
else if(process.argv[2]==='--review'&&process.argv[3]){
 try{const report=verify(process.argv[3]);console.log(JSON.stringify(report,null,2));if(report.errors.length)process.exitCode=1;}
 catch(e){console.error('Manifest private invalid or missing');process.exitCode=1;}
}else{console.error('Usage: node tests/pathologies-private-assets.mjs --self-test | --review /chemin/prive/MANIFESTE_ASSETS_SHA256.json');process.exitCode=2;}
