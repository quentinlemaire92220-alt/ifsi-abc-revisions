// Défauts injectés sur des copies temporaires ; aucun fichier étudiant modifié.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const script=fileURLToPath(new URL('./organes-sens-publication-assets.mjs',import.meta.url));
const manifestPath='docs/publication-candidates/organes_des_sens_b11_sans_vocaux.json';
const original=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
original.phase='prepublication_draft';
for(const flag of ['studentActivation','appRegistryChanges','publishedFilesInThisPr','mergeAuthorized','ownerGraphicAcceptance','pedagogicalAcceptance','publicationApproval'])original.deliveryPlan[flag]=false;
for(const a of Object.values(original.candidatePdfEvidence))a.ownerAcceptance='pending';
// Omettre volontairement les planches dans la fixture, même après leur futur import.
original.candidatePdfEvidence.boards.gitBinaryUploaded=false;
const parent=path.resolve(os.tmpdir());
const fixture=fs.mkdtempSync(path.join(parent,'ifsi-sens-assets-'));
const save=value=>{
 const target=path.join(fixture,manifestPath);
 fs.mkdirSync(path.dirname(target),{recursive:true});
 fs.writeFileSync(target,JSON.stringify(value));
};
const run=mode=>spawnSync(process.execPath,[script,mode],{cwd:fixture,encoding:'utf8'});
const refused=(mode,reason)=>{
 const result=run(mode);
 assert.ifError(result.error);
 assert.notEqual(result.status,0,'Défaut accepté : '+reason);
 assert.ok((result.stdout+result.stderr).includes(reason),'Échec inattendu : '+result.stderr);
};
try{
 for(const asset of Object.values(original.candidatePdfEvidence)){
  if(!asset.gitBinaryUploaded)continue;
  const target=path.join(fixture,asset.githubPath);
  fs.mkdirSync(path.dirname(target),{recursive:true});
  fs.copyFileSync(asset.githubPath,target);
 }
 save(original);
 const baseline=run('--prepublication');
 assert.ifError(baseline.error);
 assert.equal(baseline.status,0,baseline.stderr);
 refused('--require-assets','PDF binaires non présents dans GitHub');
 for(const flag of ['studentActivation','appRegistryChanges','publishedFilesInThisPr',
  'mergeAuthorized','ownerGraphicAcceptance','pedagogicalAcceptance','publicationApproval']){
  const changed=structuredClone(original);changed.deliveryPlan[flag]=true;save(changed);
  refused('--prepublication',flag+': verrou de prépublication requis');
 }
 for(const role of ['sheet','qcm','boards']){
  const changed=structuredClone(original);changed.candidatePdfEvidence[role].ownerAcceptance='owner_accepted';save(changed);
  refused('--prepublication',role+': acceptation humaine non autorisée');
 }
 const uploaded=structuredClone(original);uploaded.candidatePdfEvidence.boards.gitBinaryUploaded=true;save(uploaded);
 refused('--prepublication','boards: statut de transfert non prouvé');
 const size=structuredClone(original);size.candidatePdfEvidence.sheet.bytes++;save(size);
 refused('--prepublication','sheet: nombre d');
 const digest=structuredClone(original);digest.candidatePdfEvidence.sheet.sha256='0'.repeat(64);save(digest);
 refused('--prepublication','sheet: SHA-256 divergent');
 save(original);
 const sheet=path.join(fixture,original.candidatePdfEvidence.sheet.githubPath);
 const bytes=fs.readFileSync(sheet);bytes[0]=0;fs.writeFileSync(sheet,bytes);
 refused('--prepublication','sheet: en-tête PDF absent');
 console.log('PASS B1.1 : import partiel exact accepté ; 15 défauts bloqués, aucune activation ni approbation.');
}finally{
 assert.equal(path.dirname(path.resolve(fixture)),parent);
 assert.ok(path.basename(fixture).startsWith('ifsi-sens-assets-'));
 fs.rmSync(fixture,{recursive:true,force:true});
}
