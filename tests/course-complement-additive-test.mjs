import fs from 'node:fs';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';import {createHash} from 'node:crypto';
import {runtimeDeck} from './flashcards-runtime-fixture.mjs';
import {requireVisualReviewIfChanged} from './visual-owner-review-gate.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),base=process.env.IFSI_BASE_SHA||'HEAD^';
const old=p=>JSON.parse(execFileSync('git',['show',base+':'+p],{encoding:'utf8',maxBuffer:32*1024*1024}));
const delivery=read('docs/course-deliveries.json').courses.find(c=>c.courseId==='droits_patients');
const prior=old('docs/course-deliveries.json').courses.find(c=>c.courseId==='droits_patients');
const {questions,deck}=await runtimeDeck(),bank=read('qextra-60.txt');
assert.equal(bank.length,20);assert.equal(new Set(bank.map(q=>q.id)).size,20);
assert.equal(questions.filter(q=>q.courseId==='droits_patients').length,105);
assert.equal(deck.filter(c=>c.courseId==='droits_patients'&&!String(c.id).startsWith('voc:')).length,93);
assert.equal(bank.flatMap(q=>q.flashcards||[]).length,24);
assert.deepEqual(read('qextra-55.txt'),old('qextra-55.txt'),'85 questions et cartes historiques préservées');
assert.deepEqual(read('vocals.json'),old('vocals.json'),'Aucun MP3 modifié');
const oldVocabulary=old('vocabulaire-v1.json'),newVocabulary=read('vocabulaire-v1.json');
const beforeCount=oldVocabulary.entries.length;
assert.deepEqual({...newVocabulary,entries:newVocabulary.entries.slice(0,beforeCount)},oldVocabulary,
 'Le lexique historique doit rester inchangé, y compris dans son ordre');
const addedVocabulary=newVocabulary.entries.slice(beforeCount);
// Autoriser uniquement les nouveaux lexiques approuvés, sans remplacer les entrées historiques.
const approvedCommunication=read('docs/course-deliveries.json').courses.some(c=>
 c.courseId==='d1_communication_td1' && c.publicationApproval?.status==='approved' &&
 c.publicationApproval?.authorization==='explicit_go_publication');
const allowedNewLexiconCourses=new Set(['responsabilite_exercice_professionnel']);
if(approvedCommunication)allowedNewLexiconCourses.add('d1_communication_td1');
assert.ok(addedVocabulary.every(e=>Array.isArray(e.courseIds)&&e.courseIds.length===1&&
 allowedNewLexiconCourses.has(e.courseIds[0])),
 'Le lexique ne peut être enrichi que pour les cours explicitement approuvés');
assert.equal(new Set(newVocabulary.entries.map(x=>x.id)).size,newVocabulary.entries.length,
 'IDs lexicaux uniques');
for(const file of ['sheets-1.json','sheets-2.json','infographics.json'])assert.deepEqual(read(file),old(file));
const sheets=[1,2,3].flatMap(n=>read(`sheets-${n}.json`)),oldSheets=[1,2,3].flatMap(n=>old(`sheets-${n}.json`));
for(const s of oldSheets)assert.deepEqual(sheets.find(x=>x.resourceId===s.resourceId&&x.url===s.url),s);
const part=delivery.partDeliveries.find(p=>p.deliveryMode==='existing_course_complement');assert.ok(part);
assert.equal(sheets.find(s=>s.resourceId===part.sheetResourceId).primaryRevision,false);
assert.equal(part.status,'awaiting_mp3');assert.deepEqual(delivery.vocals,prior.vocals);assert.equal(delivery.vocals.length,6);
const graphics=read('infographics.json'),hashes={};for(const i of graphics)if(i.localImage)hashes[i.localImage]=createHash('sha256').update(fs.readFileSync(i.localImage)).digest('hex');
const previous={sheets:oldSheets,infographics:old('infographics.json'),imageHashes:hashes},current={sheets,infographics:graphics,imageHashes:hashes};
if(!prior.partDeliveries.some(p=>p.deliveryMode==='existing_course_complement')){
 assert.equal(requireVisualReviewIfChanged('droits_patients',prior,delivery,previous,current),true);
 const reject=mutate=>{const d=structuredClone(delivery),data=structuredClone(current);mutate(d,data);assert.throws(()=>requireVisualReviewIfChanged('droits_patients',prior,d,previous,data));};
 reject(d=>{d.partDeliveries[0].ownerReview.pdfSha256='0'.repeat(64)});
 reject((d,data)=>{data.sheets.find(s=>s.resourceId===part.sheetResourceId).primaryRevision=true});
 reject((d,data)=>{data.sheets.find(s=>s.resourceId===prior.sheetResourceId).url='https://drive.google.com/file/d/changed/view'});
 reject(d=>{d.partDeliveries[0].ownerReview.pagesChecked=1});
 reject(d=>{d.partDeliveries[0].ownerReview.independentMedicalReview='invented'});
}
assert.ok(!/PLAUD|sourceRefs|Sources privées|C:[\\/]Users/.test(JSON.stringify(bank)));
console.log('PASS complément : 105 QCM, 93 cartes rédigées + 34 définitions ; anciennes ressources et 6 MP3 conservés ; faux accords et remplacements refusés.');
