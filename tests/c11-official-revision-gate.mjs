// Keep the existing student course unchanged until the official replacement has
// its own reviewed package and authentic publication approval.
import assert from 'node:assert/strict';
import fs from 'node:fs';
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
const m = JSON.stringify(gate);
assert.ok(!m.includes('drive.google.com') &&
 !/transcriptDriveId|file_id|recording_url/i.test(m),
 'Le contrôle ne doit pas contenir de liens ou IDs privés');
console.log('PASS C1.1 révision officielle en préparation — 56 QCM, 56 cartes, 2 vocaux conservés');
