import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {validateAudioSupplements} from './audio-supplement-contract.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const vocals=read('vocals.json'),registry=read('course-registry-v741.json'),manifest=read('docs/course-deliveries.json');
const added=vocals.filter(v=>v.release==='8.30.110');
const expected={genetique:3,calculs_doses_mathematiques:8,histoire_profession_infirmiere:1,epistemologie_savoirs:2,ethique_infirmiere:5,douleur:3,parametres_vitaux:2,grands_brules:2,diagnostic_bacteriologie:2,competences_psychosociales:1,methodes_travail_reussite:1,vaccination_prs:1,introduction_droit:2,psychologie_sante:2};
assert.equal(added.length,35);assert.ok(vocals.length>=166);
assert.equal(createHash('sha256').update(JSON.stringify(vocals.slice(0,131))).digest('hex'),'08bd5180accfa4ccb1395e948b6ebac5c793648e04a51e1fa414e8c3df874531','Les 131 enregistrements antérieurs ont changé');
assert.equal(new Set(vocals.map(v=>v.id)).size,vocals.length,'Identifiant audio dupliqué');
const withDrive=vocals.filter(v=>v.driveId);
assert.equal(new Set(withDrive.map(v=>v.driveId)).size,withDrive.length,'Fichier Drive duplique');
const hostedOnly=vocals.filter(v=>!v.driveId);
assert.ok(hostedOnly.every(v=>v.localAudio&&fs.existsSync(v.localAudio)),'MP3 Pages manquant');
assert.equal(new Set(hostedOnly.map(v=>v.localAudio)).size,hostedOnly.length,'MP3 Pages duplique');
const approved=validateAudioSupplements(manifest,{registry,vocals});
for(const[cid,count]of Object.entries(expected)){
 const group=added.filter(v=>v.courseId===cid),course=registry.courses.find(c=>c.id===cid);
 assert.equal(group.length,count,cid+': vocal manquant');assert.equal(course.audioStatus,'available');
 assert.equal(course.audioCount,vocals.filter(v=>v.courseId===cid).length,cid+': compteur incohérent');
 assert.deepEqual(group.map(v=>v.number).sort((a,b)=>a-b),Array.from({length:count},(_,i)=>i+1),cid+': ordre incorrect');
 for(const v of group){
  assert.equal(v.mime,'audio/mpeg');assert.ok(v.durationSeconds>0&&v.durationSeconds<600,'Durée hors limite '+v.id);
  assert.ok(approved.has(v.id),'Approbation audio absente '+v.id);
  assert.match(v.localAudio,/^\.\/assets\/audio\/v8410\/[a-z0-9_]+\.mp3$/);
  assert.equal(createHash('sha256').update(fs.readFileSync(v.localAudio)).digest('hex'),approved.get(v.id).artifactSha256s[v.driveId],'Le MP3 direct doit être identique à la copie Drive');
  assert.equal(course.audioFolderUrl,'https://drive.google.com/drive/folders/'+approved.get(v.id).folderId);
 }
}
const care=manifest.courses.find(c=>c.courseId==='ethique_infirmiere'),p02=care.partDeliveries.find(p=>p.partId==='p02');
assert.equal(p02.vocalIds.length,4);assert.equal(care.vocals.length,5);
assert.ok(!p02.blockers.some(b=>b.resource==='vocals'));assert.ok(p02.blockers.some(b=>b.reason==='native_support_unavailable'));
assert.ok(manifest.audioSupplements.some(c=>c.courseId==='diagnostic_bacteriologie'),'Complément de bactériologie absent');
for(const file of ['index.html','sw.js'])assert.ok(fs.readFileSync(file,'utf8').includes('v8410-changelog.js'),'Annonce absente '+file);
const player=fs.readFileSync('vocals-v73.js','utf8');
assert.ok(player.includes('localAudioSource(x)||driveStream(x.driveId)'),'Le lecteur doit privilégier le MP3 direct et garder Drive en secours');
console.log('✅ V8.30.110 : 35 MP3, 14 cours, durée <10 min, ordre/GO/empreintes cohérents ; 131 audios antérieurs inchangés.');
