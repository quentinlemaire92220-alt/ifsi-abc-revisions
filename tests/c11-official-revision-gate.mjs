// Keep the existing student course unchanged until the official replacement has
// its own reviewed package and authentic publication approval.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {validateAudioSupplements} from './audio-supplement-contract.mjs';
const json = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const gate = json('docs/proposals/c11-sante-mondiale-support-officiel-20261031/REVISION_STATUS.json');
const registry = json('course-registry-v741.json').courses;
const c = registry.find(x => x.id === 'sante_mondiale_sante_france');
assert.ok(c, 'Cours historique Santé mondiale absent');
assert.equal(gate.schema, 'ifsi_abc_existing_course_official_revision_gate_v1');
assert.equal(gate.courseId, c.id);
assert.equal(gate.source.officialSupportReceived, true);
assert.equal(gate.source.sourceInPublicRepository, false);
assert.equal(gate.source.oralCoverageExhaustive, false);
const other = registry.filter(x => x.id !== c.id && /organisation.*systeme.*sante|offre.*soins/i.test(x.id));
assert.ok(!other.some(x => x.id === c.id), 'Fusion des cours C1 détectée');
assert.ok(gate.gaps.length >= 5);
assert.ok(gate.gaps.every(x => x.area && x.issue && ['blocking','review'].includes(x.priority)));
if (!gate.studentReleaseApproved) {
 const bank = json('qextra-59.txt').filter(x => x.courseId === c.id);
 assert.equal(bank.length, gate.existingPublishedBaseline.questions,
 '56 QCM canoniques de Santé mondiale absents');
 assert.equal(new Set(bank.map(q => q.id)).size, bank.length,
 'Doublons dans les QCM historiques');
 assert.ok(bank.every(q => q.choices?.length === 5 &&
  q.answers?.length >= 1 && q.answers.length <= 3 &&
  q.announcedCorrectCount === q.answers.length),
 'Une question historique a perdu ses choix ou son nombre de bonnes réponses');
 assert.equal(bank.reduce((n,q) => n + (q.flashcards?.length || 0), 0),
  gate.existingPublishedBaseline.flashcards,
 '56 flashcards réelles de Santé mondiale non préservées');
 const sheets = [1,2,3].flatMap(n => json('sheets-'+n+'.json'));
 const existing = sheets.filter(x => x.courseId === c.id);
 assert.ok(existing.some(x => x.resourceId === 'sante_mondiale_sante_france_fiche_p01'),
 'Fiche provisoire historique absente du catalogue');
 assert.ok(existing.some(x => x.resourceId === 'sante_mondiale_sante_france_fiche_complete_infographiee_p01'),
 'Ancien PDF infographié absent du catalogue');
 assert.equal(c.sourceStatus, gate.existingPublishedBaseline.sourceStatus,
 'Ne pas remplacer le statut provisoire sans livraison revue');
 assert.equal(c.officialSupport, gate.existingPublishedBaseline.officialSupportFlag,
 'Ne pas présenter la fiche provisoire comme révisée sur support officiel');
 assert.equal(c.qcmPdfQuestionCount, gate.existingPublishedBaseline.questions,
 'Banque historique de 56 QCM non préservée');
 assert.equal(c.flashcardTarget, gate.existingPublishedBaseline.flashcards,
 'Flashcards historiques non préservées');
 assert.equal(c.audioCount, gate.existingPublishedBaseline.audioDeclared,
 'Anciens vocaux perdus');
 assert.equal(gate.revision.explicitAcceptanceOfFinalBytes, false);
 assert.equal(gate.revision.pdfAllPagesInspected, false);
}
if (gate.studentReleaseApproved) {
 const delivery=json('docs/course-deliveries.json').courses.find(d=>d.courseId===c.id);
 const sheets=[1,2,3].flatMap(n=>json('sheets-'+n+'.json')).filter(x=>x.courseId===c.id);
 const bank=json('qextra-59.txt').filter(x=>x.courseId===c.id);
 assert.equal(delivery?.publicationApproval?.authorization,'explicit_go_publication','Publication sans GO');
 assert.equal(delivery?.publicationApproval?.status,'approved');
 assert.equal(c.officialSupport,true,'Le support officiel reçu doit être reconnu');
 assert.equal(c.sourceStatus,'provisional','Transcription absente : statut provisoire requis');
 assert.equal(delivery.status,'partial','Cours lacunaire ne doit pas apparaître complet');
 assert.equal(delivery.sourceAudit?.oralStatus,'unavailable','Transcription absente masquée');
 assert.ok(delivery.blockers?.some(b=>b.reason==='oral_source_missing'));
 assert.ok(delivery.blockers?.some(b=>b.reason==='unsupported_teacher_requested_content'));
 assert.equal(delivery.publicArtifacts?.sheet?.sha256,'a74f9df5707f5fc23db99ff9624abf79f4a0cb8bc5f88f14c7fc5c82226323fc');
 assert.equal(delivery.publicArtifacts?.qcm?.sha256,'4153a3b554fb7dc676fb745c26f8ab7c302493c51616b743b1af46a2ca6cac8e');
 assert.equal(bank.length,56);assert.equal(bank.flatMap(q=>q.flashcards||[]).length,56);
 assert.equal(c.flashcardTarget,56);
 const voices=json('vocals.json');
 const approved=validateAudioSupplements(json('docs/course-deliveries.json'),{registry:{courses:registry},vocals:voices});
 const historicalIds=new Set(['sante_mondiale_sante_france_p01_vocal_01','sante_mondiale_sante_france_p01_vocal_02']);
 assert.ok([...historicalIds].every(id=>voices.some(v=>v.id===id&&v.courseId===c.id)),'Vocaux historiques C1.1 perdus');
 const extra=voices.filter(v=>v.courseId===c.id&&!historicalIds.has(v.id));
 assert.ok(extra.every(v=>approved.has(v.id)),'Vocal C1.1 ajouté sans complément approuvé');
 assert.equal(c.audioCount,2+extra.length);
 assert.equal(sheets.filter(x=>x.sourceStatus!=='archived').length,1,'Plusieurs fiches actives');
 assert.equal(sheets.filter(x=>x.sourceStatus==='archived').length,2,'Fiches historiques supprimées');
 assert.equal(json('infographics.json').filter(x=>x.courseId===c.id&&x.sourceStatus==='archived').length,9,'Anciennes planches non archivées');
 assert.equal(gate.revision.explicitAcceptanceOfFinalBytes,true);
 assert.equal(gate.revision.pdfAllPagesInspected,true);
}
const m = JSON.stringify(gate);
assert.ok(!m.includes('drive.google.com') &&
 !/transcriptDriveId|file_id|recording_url/i.test(m),
 'Le contrôle ne doit pas contenir de liens ou IDs privés');
console.log('PASS C1.1 révision officielle en préparation — 56 QCM, 56 cartes, 2 vocaux conservés');
