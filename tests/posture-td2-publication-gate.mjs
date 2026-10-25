// Empreintes et cohérence du lot TD2 réellement servi par GitHub Pages.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {validateBank} from '../tools/qcm-bank-contract.mjs';
import {runtimeDeck} from './flashcards-runtime-fixture.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const id='d1_posture_professionnelle_td2';
const delivery=read('docs/course-deliveries.json').courses.find(x=>x.courseId===id);
assert.ok(delivery,'Manifest de livraison TD2 absent');
assert.equal(delivery.validated,true);
assert.equal(delivery.status,'partial','PT02 tronquée : pas de statut complet');
assert.equal(delivery.sourceAudit?.oralStatus,'incomplete_tail');
assert.equal(delivery.sourceAudit?.oralCoverageExhaustive,false);
assert.equal(delivery.sourceAudit?.recordingTailTruncated,true);
assert.deepEqual(delivery.vocals,['d1_posture_td2_vocal_01'],'Posture TD2 : MP3 validé absent du manifeste');
const vocal=read('vocals.json').find(v=>v.id==='d1_posture_td2_vocal_01');
assert.ok(vocal&&vocal.courseId===id&&vocal.durationSeconds>0&&vocal.durationSeconds<600,'MP3 Posture absent ou trop long');
assert.equal(vocal.mime,'audio/mpeg');
assert.equal(delivery.artifactSha256s[vocal.driveId],'906f2c85b228a09c8293fb36294d3bd8026bffbe6c39eed06161d877d9e650c0');
const assets=[
 ['UE_D1_1_Posture_Professionnelle_Fiche_Revision.pdf',delivery.publicAssetSha256],
 ['UE_D1_1_Posture_Professionnelle_QCM_40_Corrige.pdf',delivery.qcmPublicAssetSha256],
 ['UE_D1_1_Posture_Professionnelle_Flashcards_40.pdf',delivery.flashcardPublicAssetSha256],
];
for(const [name,expected] of assets){
 const p='assets/posture-professionnelle-td2/'+name;
 const actual=createHash('sha256').update(fs.readFileSync(p)).digest('hex');
 assert.equal(actual,expected,'Empreinte du PDF public divergente : '+name);
}
const bank=read('data/course-banks/posture_professionnelle_td2.json');
const mirror=read('questions-5.json').filter(x=>x.courseId===id);
assert.equal(bank.length,40);
validateBank(bank);
assert.equal(createHash('sha256').update(JSON.stringify(bank.map(q=>q.answers))).digest('hex'),
 '5d5e7085093cf0d301ee07a18777b1bc795b1f3bb29a8a90da0aa41fadf49add',
 'Les 40 clés approuvées doivent rester inchangées');
assert.deepEqual(bank,mirror,'Risque de correction divergente dans le QCM interactif');
assert.deepEqual(bank.find(x=>x.id==='D1_POSTURE_TD2_003')?.answers,[2],
 'Q03 : seule la description factuelle est correcte');
for(const q of bank){
 assert.equal(q.choices?.length,5);
 assert.ok(q.answers?.length>=1&&q.answers.length<=3);
 assert.equal(q.announcedCorrectCount,q.answers.length);
}
const terms=read('vocabulaire-v1.json').entries.filter(x=>x.courseIds?.includes(id));
assert.equal(terms.length,6,'Termes de TD2 incomplets');
const course=read('course-registry-v741.json').courses.find(x=>x.id===id);
assert.ok(course?.qcmPdfUrl?.endsWith('/UE_D1_1_Posture_Professionnelle_QCM_40_Corrige.pdf'));
assert.ok(!course.qcmPdfUrl.includes('drive.google.com'),'La copie Drive QCM ancienne n’est pas le lien étudié');
const live=await runtimeDeck();
const linked=live.deck.filter(c=>c.courseId===id);
const deck=linked.filter(c=>c.authored===true);
assert.equal(deck.length,40,'Cartes réellement décodées différentes du PDF');
assert.equal(linked.filter(c=>c.kind==='Vocabulaire').length,6,'Les 6 termes du lexique restent disponibles séparément');
for(const q of bank){
 const card=deck.find(c=>c.qid===q.id);
 assert.ok(card,q.id+': carte runtime absente');
 assert.equal(card.front,q.flashcards[0].front,q.id+': recto runtime altéré');
 assert.deepEqual([...card.answers],q.flashcards[0].answers,q.id+': verso runtime altéré');
 assert.equal(card.explanation,q.flashcards[0].explanation,q.id+': explication runtime altérée');
}
console.log('PASS candidat TD2 local : 3 PDF intègres, Q03=C seule, 40 QCM/40 cartes, 6 termes, oral partiel ; aucune preuve de déploiement déduite');
