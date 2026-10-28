import fs from 'node:fs';
import assert from 'node:assert/strict';
import {validateAudioSupplements} from './audio-supplement-contract.mjs';
const read=p=>fs.readFileSync(p,'utf8'),json=p=>JSON.parse(read(p));
const vocals=json('vocals.json'),registry=json('course-registry-v741.json'),delivery=json('docs/course-deliveries.json'),meta=json('build-meta.json');
assert.ok(Number(meta.build)>=8401,'Build antérieur à la série infectiologie');
assert.ok(vocals.length>=131,'Catalogue : au moins 105 anciens + 26 nouveaux');
assert.equal(new Set(vocals.map(v=>v.id)).size,vocals.length);
const driveBacked=vocals.filter(v=>v.driveId);
assert.equal(new Set(driveBacked.map(v=>v.driveId)).size,driveBacked.length,'Doublon Drive historique');
const hosted=vocals.filter(v=>!v.driveId);
assert.ok(hosted.every(v=>v.localAudio&&fs.existsSync(v.localAudio)),'Fichier MP3 direct absent');
assert.equal(new Set(hosted.map(v=>v.localAudio)).size,hosted.length,'Chemin audio direct dupliqué');
validateAudioSupplements(delivery,{registry,vocals});
const expected=[
 ['parasites_champignons',4],['physiopathologie_infections',3],['diagnostic_virologie',2],
 ['infections_urinaires',3],['infections_pulmonaires_bacteriennes',4],['infections_respiratoires_virales',3],
 ['infections_cutanees',5],['ist_hors_vih',2]
];
let n=0;
for(const [courseId,count] of expected){
 const pack=delivery.audioSupplements.find(s=>s.courseId===courseId);
 assert.ok(pack,'Complément absent : '+courseId);
 assert.equal(pack.vocalIds.length,count,'Mauvais décompte : '+courseId);
 const course=registry.courses.find(c=>c.id===courseId);
 assert.ok(course,'Cours inconnu : '+courseId);
 assert.ok(course.audioCount>=count,'Compteur trop bas : '+courseId);
 assert.equal(course.audioStatus,'available','Cours sans audio : '+courseId);
 assert.ok(course.audioFolderUrl==='https://drive.google.com/drive/folders/'+pack.folderId||course.audioAdditionalFolderUrls?.includes('https://drive.google.com/drive/folders/'+pack.folderId),'Dossier non relié : '+courseId);
 const episodes=pack.vocalIds.map(id=>vocals.find(v=>v.id===id));
 assert.ok(episodes.every(Boolean),'MP3 sans ligne catalogue : '+courseId);
 assert.deepEqual(episodes.map(v=>v.number),Array.from({length:count},(_,i)=>i+1),'Ordre des vocaux incorrect : '+courseId);
 assert.ok(episodes.every(v=>v.courseId===courseId&&v.mime==='audio/mpeg'&&v.title&&v.driveId&&Number.isFinite(v.durationSeconds)&&v.durationSeconds>0&&v.durationSeconds<600),'MP3 non valide : '+courseId);
 n+=count;
}
assert.equal(n,26);
const release=read('v8401-changelog.js');
assert.ok(release.includes('v8401Change')&&release.includes('26 nouveaux vocaux')&&release.includes('131 vocaux'),'Changelog étudiant manquant');
const home=read('v8312-home-revision.js');
assert.ok(home.includes("v8401Change:{type:'resource'"),'Actualité non classée ressource');
const startup=read('v8303-home-startup.js');
assert.ok(startup.includes("'IFSI_V"+meta.build+"_CHANGELOG'"),'Le changelog courant doit être relancé au démarrage');
const index=read('index.html'),sw=read('sw.js'),app=read('app-version-v742.js');
assert.ok(index.includes('v8401-changelog.js?v='+meta.build));
assert.ok(sw.includes("'./v8401-changelog.js'")&&sw.includes('"v8401-changelog.js"'));
assert.ok(app.includes("const VERSION='"+meta.version+"'"));
console.log('✅ V8.30.101 : 26 MP3 sur huit cours, 131 vocaux au total, liens et durées validés, PWA et actualités cohérentes');
