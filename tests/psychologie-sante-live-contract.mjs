// Contrat de STAGING : contrôler les futurs livrables ET l'absence d'activation prématurée.
// Ne pas confondre un TNR vert en préparation avec un GO graphique ou la publication étudiante.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const root='docs/proposals/psychologie-sante-20261027/';
const candidate=read(root+'qcm-runtime-candidate.json');
const definitions=read(root+'flashcards-59-candidate.json');
const manifest=read(root+'manifest.json');
const reg=read('course-registry-v741.json').courses.filter(c=>c.id==='psychologie_sante');
const sheets=read('sheets-3.json').filter(s=>s.courseId==='psychologie_sante');
const active=read('questions-5.json').filter(q=>q.courseId==='psychologie_sante');
const publishedVocals=read('vocals.json').filter(v=>v.courseId==='psychologie_sante');

assert.equal(manifest.state,'draft_branch_not_student_visible');
assert.equal(manifest.publicationGates.activeApplicationIntegration,'draft_only');
assert.equal(manifest.publicationGates.studentLinks,'not_enabled');
assert.equal(manifest.publicationGates.humanGraphics,'pending_owner_visual_review');
assert.equal(manifest.interactiveQcmWording.pdfTextParity,'candidate_pdf_v2_technical_match_pending_owner_acceptance');
assert.equal(manifest.privateReconciledQcmV2.sha256,'468bd3a80b4ea5e88f3583d69e94d920f7466b2cb289c616d2c7df4585c667fd');
assert.equal(manifest.privateReconciledQcmV2.driveDownloadedSha256,manifest.privateReconciledQcmV2.sha256);
assert.equal(manifest.privateReconciledQcmV2.originalQcmRetainedSha256,manifest.assets.qcm.sha256);
assert.equal(manifest.privateReconciledQcmV2.pageCount,19);
assert.equal(manifest.privateReconciledQcmV2.ownerGraphicReview,'pending');
assert.equal(manifest.privateReconciledQcmV2.authorizedForStudents,false);
assert.equal(manifest.privateReconciledQcmV2.questionChoiceExplanationFieldsPresent,350);
assert.equal(manifest.newSyntheticAudioApproved,false);
assert.equal(reg.length,1,'Cours historique manquant ou dupliqué');
assert.equal(reg[0].audioCount,2,'Les deux anciens vocaux doivent rester référencés');
assert.equal(publishedVocals.length,2,'Ne pas ajouter les quatre MP3 non approuvés');
assert.equal(sheets.length,1,'Ne pas ajouter de PDF étudiant non déclaré');
assert.equal(sheets[0].resourceId,'psychologie_sante_fiche_p01');
assert.equal(active.length,0,'Ne pas activer les 50 QCM avant publication approuvée');
assert.ok(!reg[0].qcmPdfUrl,'PDF QCM non approuvé exposé dans le registre');
assert.ok(!reg[0].authoredFlashcards,'Cartes non approuvées annoncées comme publiées');
assert.ok(!reg[0].additionalDocuments?.some(d=>/psychologie-sante-20261027/.test(d.url)),
  'Lien étudiant de prépublication présent dans le registre');

// Les PDF sont strictement conservés dans Drive privé tant que la revue graphique n'est pas attestée.
// Ce contrôle verrouille les empreintes du paquet source, sans prétendre télécharger le Drive dans la CI.
const pdfs=[
  ['sheet','UE_B2_Psychologie_Sante_Fiche_Revision_Corrigee.pdf',
    'c1cf1233a527e755917e11f5dd06e95d001f8ff4d5fd2da81f6463d281027486',18],
  ['qcm','UE_B2_Psychologie_Sante_QCM_50_Corriges.pdf',
    'e018df4efd9c5e0db34453164e112a5c40d91746f64b059b80bd562e5ff83c89',21],
  ['flashcards','UE_B2_Psychologie_Sante_Flashcards_59.pdf',
    '9bd7e45fc6d49273552db4c66f08407af9a56b919d7cc6275e58065868cd178a',13]
];
for(const [key,filename,digest,pages] of pdfs){
  assert.equal(manifest.assets[key].sha256,digest,'Empreinte de référence du lot modifiée : '+key);
  assert.equal(manifest.assets[key].pages,pages,'Pagination du lot modifiée : '+key);
  assert.equal(manifest.driveByteVerification[key].sha256,digest,'Empreinte Drive enregistrée divergente : '+key);
  assert.equal(manifest.driveByteVerification[key].status,'verified');
  assert.ok(!fs.existsSync('assets/psychologie-sante-20261027/'+filename),
    'Le PDF non relu ne doit pas figurer dans les assets publiables : '+filename);
}
assert.equal(candidate.length,50);
assert.equal(definitions.length,59);
assert.equal(new Set(candidate.map(q=>q.id)).size,50);
assert.equal(new Set(definitions.map(d=>d.id)).size,59);
for(const q of candidate){
  assert.equal(q.courseId,'psychologie_sante');
  assert.equal(q.choices.length,5);
  assert.equal(new Set(q.answers).size,q.answers.length);
  assert.equal(q.announcedCorrectCount,q.answers.length);
  assert.ok(q.answers.length>=1&&q.answers.length<=3);
  assert.ok(q.answers.every(i=>Number.isInteger(i)&&i>=0&&i<5));
  assert.ok(q.explanation.length>=25);
}
for(const d of definitions){
  assert.equal(d.courseId,'psychologie_sante');
  assert.equal(d.back,d.definition);
  assert.ok(d.front.startsWith('Définis complètement : '));
}
assert.equal(definitions[33].term,'Angoisse');
assert.match(definitions[33].back,/peur sans objet/);

// Différence stricte interdite dans les actifs : garde-fou indépendant des chemins de staging.
const base=String(process.env.IFSI_BASE_SHA||'').trim();
if(/^[0-9a-f]{7,40}$/i.test(base)){
  for(const path of ['questions-5.json','course-registry-v741.json','sheets-3.json','vocals.json',
    'build-meta.json','index.html','sw.js','resource-audit-v821.json','app-version-v742.js','v8303-home-startup.js']){
    const previous=execFileSync('git',['show',base+':'+path],{maxBuffer:32*1024*1024});
    assert.ok(fs.readFileSync(path).equals(previous),'Actif modifié dans la PR staging : '+path);
  }
}
console.log('PASS STAGING Psychologie : 3 empreintes PDF privées, 50 QCM et 59 définitions prêts ; 0 activation étudiante ; 2 vocaux historiques préservés.');
