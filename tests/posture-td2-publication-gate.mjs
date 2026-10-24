// Empreintes et cohérence du lot TD2 réellement servi par GitHub Pages.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const id='d1_posture_professionnelle_td2';
const delivery=read('docs/course-deliveries.json').courses.find(x=>x.courseId===id);
assert.ok(delivery,'Manifest de livraison TD2 absent');
assert.equal(delivery.validated,true);
assert.equal(delivery.status,'partial','PT02 tronquée : pas de statut complet');
assert.equal(delivery.sourceAudit?.oralStatus,'incomplete_tail');
assert.equal(delivery.sourceAudit?.oralCoverageExhaustive,false);
assert.equal(delivery.sourceAudit?.recordingTailTruncated,true);
assert.equal(delivery.vocals.length,0,'Aucun MP3 ne doit être inventé');
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
console.log('PASS TD2 publié : 3 PDFs intègres, Q03 corrigée, 40 QCM/40 cartes, 6 termes, oral partiel et aucun MP3');
