// Contrat du complément publié : QCM PDF exact + 50 QCM + 59 cartes, historiques conservés.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {runtimeDeck} from './flashcards-runtime-fixture.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const candidate=read('docs/proposals/psychologie-sante-20261027/qcm-runtime-candidate.json');
const definitions=read('docs/proposals/psychologie-sante-20261027/flashcards-59-candidate.json');
const active=read('questions-5.json').filter(q=>q.courseId==='psychologie_sante');
const reg=read('course-registry-v741.json').courses.filter(c=>c.id==='psychologie_sante');
const sheets=read('sheets-3.json').filter(s=>s.courseId==='psychologie_sante');
const vocals=read('vocals.json').filter(v=>v.courseId==='psychologie_sante');
const manifest=read('docs/course-deliveries.json').courses.filter(c=>c.courseId==='psychologie_sante');
const expected='2d251cee59f5ceaa7657e88079a21db4718329e727c2b6d16ce7ce208b4f570c';
const path='assets/psychologie-sante-20261027/UE_B2_Psychologie_Sante_QCM_50_Corriges.pdf';
assert.ok(fs.existsSync(path));
assert.equal(createHash('sha256').update(fs.readFileSync(path)).digest('hex'),expected);
assert.equal(reg.length,1,'Cours dupliqué');
assert.equal(manifest.length,1,'Livraison non identifiée');
assert.equal(manifest[0].publicationSubset,'qcm_pdf_50_qcm_59_interactive_flashcards_only');
assert.equal(manifest[0].publicArtifacts.qcm.sha256,expected);
assert.equal(manifest[0].qcmGraphicOwnerReview.sha256,expected);
assert.equal(reg[0].flashcardTarget,59);
assert.equal(sheets.length,2,'Nouvelle fiche additive et ancienne fiche préservée');
assert.equal(sheets[0].resourceId,'psychologie_sante_fiche_p01');
const sheetPath='assets/psychologie-sante-20261027/UE_B2_S1_Psychologie_Sante_Fiche_Unique_20p_59_Definitions_20261027.pdf';
const sheetSha='da73c470b34d89a4bf74e976bf7d38951c1fb375ecddcbc503f22bb70987d512';
assert.ok(fs.existsSync(sheetPath),'Fiche unique absente du lot proposé');
assert.equal(createHash('sha256').update(fs.readFileSync(sheetPath)).digest('hex'),sheetSha,'Fiche PDF altérée');
assert.equal(manifest[0].revisionSheetSupplement.publicAsset.sha256,sheetSha);
assert.equal(manifest[0].revisionSheetSupplement.pageCount,20);
assert.equal(manifest[0].sourceBasis.officialSupportPending,true);
const primary=sheets.find(s=>s.resourceId==='psychologie_sante_fiche_unique_20261027');
assert.ok(primary?.url.endsWith('/'+sheetPath),'Lien de fiche unique absent');
assert.equal(primary.primaryRevision,true);
assert.equal(sheets.find(s=>s.resourceId==='psychologie_sante_fiche_p01')?.url,'https://drive.google.com/file/d/1nUmX2llDWKP0jsp8UKxR0a8p1h9xvG6Q/view?usp=drivesdk');
assert.equal(primary.pageCount,20);
assert.equal(primary.lexiconTermCount,59);
assert.equal(primary.label.includes('Partie 01'),false,'La nouvelle fiche ne doit pas être étiquetée Partie 01');
assert.equal(manifest[0].revisionSheetSupplement.publicationApproval?.status,'approved');

assert.equal(vocals.length,2,'Les deux vocaux anciens doivent être préservés');
assert.equal(reg[0].audioCount,2);
assert.equal(active.length,50);assert.equal(candidate.length,50);assert.equal(definitions.length,59);
const key=q=>JSON.stringify([q.id,q.question,q.choices,q.answers,q.explanation]);
for(let i=0;i<50;i++){
 assert.equal(key(active[i]),key(candidate[i]),'QCM divergent n° '+(i+1));
 assert.equal(active[i].announcedCorrectCount,active[i].answers.length);
 assert.ok(active[i].answers.length>=1 && active[i].answers.length<=3);
}
assert.equal(active.reduce((n,q)=>n+(q.flashcards?.length||0),0),59);
const actual=new Map(active.flatMap(q=>(q.flashcards||[]).map(c=>[c.front,c.answers[0]])));
assert.equal(actual.size,59);
for(const d of definitions)assert.equal(actual.get(d.front),d.back,'Flashcard divergente '+d.term);
const {deck,questions}=await runtimeDeck();
assert.equal(questions.filter(q=>q.courseId==='psychologie_sante').length,50);
const authored=deck.filter(c=>c.courseId==='psychologie_sante'&&String(c.qid||'').startsWith('psychologie_sante_p01_'));
assert.equal(authored.length,59);
for(const d of definitions)assert.ok(authored.some(c=>(c.sourceFront||c.front)===d.front&&c.answers.includes(d.back)),
 'Carte absente de l’interface '+d.term);
for(const name of ['UE_B2_Psychologie_Sante_Fiche_Revision_Corrigee.pdf','UE_B2_Psychologie_Sante_Flashcards_59.pdf'])
 assert.ok(!fs.existsSync('assets/psychologie-sante-20261027/'+name),'PDF non approuvé rendu public : '+name);
console.log('PASS Psychologie : QCM inchangé, 50 QCM, 59 cartes, fiche unique 20p vérifiée, 2 vocaux préservés');
