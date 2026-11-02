import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {runtimeDeck} from './flashcards-runtime-fixture.mjs';
import {validateFirstReleaseAudio} from './audio-supplement-contract.mjs';
import {validateBank} from '../tools/qcm-bank-contract.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const id='hepatites_virales',manifest=read('docs/course-deliveries.json');
const d=manifest.courses.find(c=>c.courseId===id),course=read('course-registry-v741.json').courses.find(c=>c.id===id);
assert.equal(d.status,'complete');assert.equal(d.sourceAudit.officialChecked,true);assert.equal(d.sourceAudit.oralStatus,'complete');assert.equal(d.sourceAudit.independentClinicalSignoff,false);
assert.equal(course.officialSupportUrl,'https://drive.google.com/file/d/'+d.supportDriveId+'/view');assert.equal(course.provisional,false);assert.equal(course.flashcardTarget,50);
const exportedCards=course.additionalDocuments.filter(x=>x.type==='flashcards');
assert.equal(exportedCards.length,1,'Accès PDF flashcards absent du cours');
assert.equal(exportedCards[0].url,'https://drive.google.com/file/d/'+d.flashcardDriveId+'/view');
assert.equal(exportedCards[0].cardCount,50);
const bank=read(d.qcmBank);assert.equal(validateBank(bank),50);
assert.equal(bank.flatMap(q=>q.flashcards).length,50);
assert.deepEqual(bank,read('questions-5.json').filter(q=>q.courseId===id));
assert.ok(!/privateSourceSection|transcriptDriveId|sourceRefs|C:[\\/]Users/.test(JSON.stringify(bank)));
assert.equal(read('vocabulaire-v1.json').entries.filter(v=>v.courseIds?.includes(id)).length,45);
const {deck,questions}=await runtimeDeck();
assert.equal(questions.filter(q=>q.courseId===id).length,50);
const authored=deck.filter(c=>c.courseId===id&&!c.id.startsWith('voc:'));assert.equal(authored.length,50);
for(const q of bank){const card=authored.find(c=>c.qid===q.id);assert.ok(card);assert.equal(card.front,q.flashcards[0].front);assert.equal(JSON.stringify(card.answers),JSON.stringify(q.flashcards[0].answers));}
const vocals=read('vocals.json').filter(v=>v.courseId===id);assert.equal(vocals.length,2);
const check=(delivery,catalogue=course,voices=vocals)=>validateFirstReleaseAudio({courses:[]},{courses:[delivery]},{courses:[]},{courses:[catalogue]},[],voices);
assert.equal(check(d).size,2);
for(const change of [
 x=>{x.publicationApproval.status='pending'},
 x=>{x.sourceAudit.oralStatus='unverified'},
 x=>{x.sourceAudit.officialChecked=false},
 x=>{x.publishedVerification.status='PENDING'},
 x=>{x.publicAudioArtifacts[0].sha256='0'.repeat(64)},
 x=>{x.artifactSha256s[vocals[0].driveId]='0'.repeat(64)},
 x=>{x.vocals.reverse()}
]){const candidate=structuredClone(d);change(candidate);assert.throws(()=>check(candidate));}
for(const change of [x=>{x[0].durationSeconds=600},x=>{x[0].driveId=''},x=>{x[0].localAudio='./assets/audio/wrong.mp3'}]){const candidate=structuredClone(vocals);change(candidate);assert.throws(()=>check(d,course,candidate));}
for(const a of d.publicAudioArtifacts){const bytes=fs.readFileSync(a.path);assert.equal(createHash('sha256').update(bytes).digest('hex'),a.sha256);assert.ok(a.durationSeconds>0&&a.durationSeconds<600);assert.match(bytes.subarray(0,3).toString('ascii'),/ID3/);}
console.log('PASS Hépatites : support officiel, 50 QCM et cartes réellement chargés, 45 définitions, deux MP3 exacts <10min; altérations de sources, copies, clés audio et autorisations rejetées.');
