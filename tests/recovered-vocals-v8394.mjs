import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {validateAudioSupplements} from './audio-supplement-contract.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const vocals=read('vocals.json'),manifest=read('docs/course-deliveries.json'),registry=read('course-registry-v741.json');
const supplements=validateAudioSupplements(manifest,{registry,vocals});
const legacy=['locomoteur_legacy_01','locomoteur_legacy_02','virus_legacy_01','virus_legacy_02','virus_legacy_03'];
const newCourseIds=new Set(['parasites_champignons','physiopathologie_infections','diagnostic_virologie','infections_urinaires','infections_pulmonaires_bacteriennes','infections_respiratoires_virales','infections_cutanees','ist_hors_vih']);
const newLot=manifest.audioSupplements.filter(s=>newCourseIds.has(s.courseId));
assert.equal(newLot.length,8,'Huit compléments de la série infections attendus');
const newLotIds=newLot.flatMap(s=>s.vocalIds);
assert.equal(newLotIds.length,26,'La nouvelle série doit compter 26 vocaux');
const additions=manifest.audioSupplements.filter(s=>!newCourseIds.has(s.courseId)&&s.vocalIds.some(id=>!legacy.includes(id)));
assert.equal(additions.length,6,'Six compléments 2026 attendus');
const newIds=additions.flatMap(s=>s.vocalIds);
assert.equal(newIds.length,25,'25 nouveaux vocaux attendus');
assert.equal(new Set(newIds).size,25,'ID doublonné entre compléments');
for(const id of [...legacy,...newIds,...newLotIds])assert.ok(supplements.has(id),'Complément audio historique manquant : '+id);
assert.ok(vocals.length>=131,'Au moins 131 vocaux attendus');
const original=vocals.slice(0,80).filter(v=>!legacy.includes(v.id));
assert.equal(original.length,75);
assert.equal(createHash('sha256').update(JSON.stringify(original)).digest('hex'),'feab05ae2850878be2c0d3f21c1bf8ec1b0c5f2249579cc75b49ae0f5f66211b','Les 75 vocaux précédents ont changé');
assert.equal(new Set(vocals.map(v=>v.driveId)).size,vocals.length);
for(const [id,count] of [['appareil_locomoteur',2],['virus',3]]){
 const course=registry.courses.find(c=>c.id===id),prior=vocals.filter(v=>legacy.includes(v.id)&&v.courseId===id);
 assert.equal(prior.length,count,id+': ancien lot altéré');
 assert.equal(course.audioStatus,'available');
 assert.equal(course.audioFolderUrl,'https://drive.google.com/drive/folders/'+manifest.audioSupplements.find(s=>s.courseId===id).folderId);
}
for(const [id,count] of [['systeme_endocrinien',5],['systeme_digestif',5],['systeme_immunitaire',5],['appareil_locomoteur',5],['homeostasie',3],['niveaux_organisation',2]]){
 const pack=additions.find(s=>s.courseId===id);
 assert.ok(pack,id+': complément absent');
 assert.equal(pack.vocalIds.length,count,id+': épisode absent');
 const course=registry.courses.find(c=>c.id===id);
 const all=vocals.filter(v=>v.courseId===id);
 assert.equal(course.audioCount,all.length,id+': compteur audio');
 assert.equal(course.audioStatus,'available',id+': statut audio');
 const folderUrl='https://drive.google.com/drive/folders/'+pack.folderId;
 assert.ok(course.audioFolderUrl===folderUrl||course.audioAdditionalFolderUrls?.includes(folderUrl),id+': dossier audio absent');
 const news=all.filter(v=>pack.vocalIds.includes(v.id));
 assert.equal(news.length,count,id+': rattachement absent');
 assert.ok(news.every(v=>v.mime==='audio/mpeg'&&v.durationSeconds>0&&v.durationSeconds<600),id+': type ou durée audio');
 assert.ok(news.every(v=>v.title&&v.driveId&&v.course),id+': métadonnées incomplètes');
}
assert.ok(fs.readFileSync('vocals-v73.js','utf8').includes('Number.isFinite(x.durationSeconds)'),'Durées non affichées');
assert.ok(!fs.readFileSync('vocals.json','utf8').includes('staging_'));
console.log('✅ 131 vocaux : 105 anciens inchangés et 26 nouveaux dans huit cours');
