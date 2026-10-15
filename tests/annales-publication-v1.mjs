import assert from 'node:assert/strict';
import fs from 'node:fs';
import zlib from 'node:zlib';
import {createHash} from 'node:crypto';
import {validateAnnales} from '../tools/check-annales-import.mjs';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const pack=JSON.parse(read('qextra-54.txt')),registry=JSON.parse(read('course-registry-v741.json'));
const supplements=JSON.parse(read('docs/qcm-supplements.json')).supplements;
const sup=supplements.find(x=>x.pack==='qextra-54.txt');
assert.ok(sup,'Déclaration de supplément annales absente');
const raw=read('qextra-54.txt');
const blobSha=createHash('sha1').update('blob '+Buffer.byteLength(raw)+'\\0'+raw).digest('hex');
assert.equal(sup.gitBlobSha,blobSha,'Le lot d’annales a changé après autorisation');
assert.equal(sup.publicationApproval?.authorization,'explicit_go_publication','Autorisation de publication absente');
assert.equal(sup.publicationApproval?.status,'approved');
assert.equal(sup.publicationApproval?.scope,'qcm_supplement');
assert.equal(sup.questionCount,pack.length);
assert.equal(sup.flashcardCount,pack.reduce((n,q)=>n+q.flashcards.length,0));
assert.deepEqual(sup.questionIds,pack.map(q=>q.id));
assert.deepEqual(sup.courseIds,[...new Set(pack.map(q=>q.courseId))].sort());
const report=validateAnnales(pack,registry,{publish:true});
assert.equal(report.total,22,'Lot annales inattendu');
assert.equal(report.errors.length,0,'Données annales incorrectes : '+report.errors.join('; '));
assert.equal(report.publishable,true,'Questions non validées ou non approuvées');
const seen=new Set();
const normalize=t=>String(t||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
for(const q of pack){
 assert.ok(q.id.startsWith('ann25_'),'ID annales invalide');
 assert.equal(q.choices.length,5,'Propositions incomplètes');
 assert.equal(q.choiceFeedback.length,5,'Corrections personnalisées incomplètes');
 assert.ok(q.choiceFeedback.every((x,i)=>q.answers.includes(i)?typeof x.missed==='string'&&x.missed.length>15:typeof x.incorrect==='string'&&x.incorrect.length>15),'Explication de distracteur insuffisante');
 assert.ok(Array.isArray(q.flashcards)&&q.flashcards.length>=1,'Flashcard explicite absente');
 assert.ok(q.flashcards.every(f=>f.front.length>12&&f.answers?.every(x=>x.length>1)),'Flashcard inexploitable');
 assert.equal(q.editedFromOriginal,true,'Sujet d’annales non reformulé');
 const normalized=normalize(q.question);
 assert.ok(!seen.has(normalized),'Questions du lot identiques');
 seen.add(normalized);
}
const byCourse=new Map();
for(const q of pack)byCourse.set(q.courseId,(byCourse.get(q.courseId)||0)+1);
assert.equal(byCourse.size,5,'Rattachement incomplet');
for(const [id,c] of byCourse)assert.ok(registry.courses.some(x=>x.id===id),'Cours inconnu '+id);
const sw=read('sw.js'),index=read('index.html'),meta=JSON.parse(read('build-meta.json'));
assert.ok(sw.includes("'./qextra-54.txt'"),'Nouveau pack absent du chargement ou précache');
assert.equal(sw.split("'./qextra-54.txt'").length-1,2,'Pack doit apparaître une fois dans le cache et une fois dans le chargeur');
assert.equal(meta.build,'8387','Numéro de version non mis à jour');
assert.ok(index.includes('v8387-changelog.js?v=8387'),'Changelog absent');
const base=[];for(let i=1;i<=5;i++)base.push(...JSON.parse(read('questions-'+i+'.json')));
const extraNames=[...Array.from({length:7},(_,i)=>i+1),...Array.from({length:45},(_,i)=>i+9)].filter(n=>n<=53);
function decode(p){const t=read(p).trim();if(t[0]==='['||t[0]==='{')return JSON.parse(t);const b=Buffer.from(t,'base64');let txt;try{txt=zlib.gunzipSync(b).toString('utf8')}catch{try{txt=zlib.inflateRawSync(b.subarray(10,-8)).toString('utf8')}catch{return []}}try{return JSON.parse(txt)}catch{return []}}
for(const n of extraNames){const path='qextra-'+String(n).padStart(2,'0')+'.txt';if(fs.existsSync(new URL('../'+path,import.meta.url))){const arr=decode(path);base.push(...(Array.isArray(arr)?arr:arr.questions||[]))}}
const previous=new Map(),prevId=new Set();
for(const q of base){if(!q||!q.id)continue;prevId.add(q.id);const key=normalize(q.question);if(key)previous.set(key,q.id);}
for(const q of pack){assert.ok(!prevId.has(q.id),'ID en conflit dans la banque actuelle : '+q.id);assert.ok(!previous.has(normalize(q.question)),'Question déjà présente : '+q.id)}
console.log('✅ Annales 2025 : '+pack.length+' QCM, '+pack.reduce((n,q)=>n+q.flashcards.length,0)+' flashcards, 5 cours ; validations, cache, release et doublons exacts contrôlés.');
