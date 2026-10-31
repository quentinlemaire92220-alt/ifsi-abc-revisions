// Prépublication B1.1 : contrôler le cadrage SANS publier des ressources étudiantes.
import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const source = 'docs/publication-candidates/organes_des_sens_b11_sans_vocaux.json';
const p = read(source);
const id = 'organes_des_sens_b11';
const hash = value => /^[0-9a-f]{64}$/.test(value || '');

if(p.phase==='publication_approved'||p.phase==='published'){
 const delivery=read('docs/course-deliveries.json').courses.find(c=>c.courseId===id);
 assert.equal(delivery?.deliveryMode,'reviewed_written_bundle');
 assert.equal(delivery.publicationApproval.status,'approved');
 assert.equal(delivery.publicationApproval.authorization,'explicit_go_publication');
 assert.equal(p.sourcePreparation.dependencyMerged,true);
 for(const key of ['studentActivation','appRegistryChanges','publishedFilesInThisPr','mergeAuthorized','ownerGraphicAcceptance','pedagogicalAcceptance','publicationApproval'])assert.equal(p.deliveryPlan[key],true);
 for(const [role,a] of Object.entries(p.candidatePdfEvidence)){
  assert.equal(a.ownerAcceptance,'owner_accepted');
  assert.equal(a.sha256,delivery.publicArtifacts[role].sha256);
  assert.equal(a.githubPath,delivery.publicArtifacts[role].path);
 }
 assert.equal(p.deliveryPlan.vocalsIncluded,false);assert.equal(p.deliveryPlan.vocalMp3Count,0);
 assert.equal(read('course-registry-v741.json').courses.filter(c=>c.id===id).length,1);
 assert.equal(read('questions-5.json').filter(q=>q.courseId===id).length,50);
 assert.equal(read('vocabulaire-v1.json').entries.filter(x=>x.courseIds?.includes(id)).length,59);
 console.log('PASS B1.1 : lot exact autorisé, banque canonique et aucun MP3 fictif.');
}else{
assert.equal(p.schema, 'ifsi_publication_candidate_v1');
assert.equal(p.courseId, id);
assert.equal(p.phase, 'prepublication_draft');
assert.equal(p.scope, 'written_sheet_qcm_flashcards_glossary_anatomical_boards_without_audio');
assert.equal(p.sourcePreparation.prNumber, 275);
assert.equal(p.sourcePreparation.headBranch, 'prep/b11-organes-sens-20261030');
assert.match(p.sourcePreparation.headSha, /^[0-9a-f]{40}$/);
assert.equal(p.sourcePreparation.dependencyMerged, false);
for (const path of ['questionsPath', 'lexiconPath'])
  assert.ok(p.sourcePreparation[path].startsWith('data/course-preparations/'), path + ' doit rester isolé');

for (const key of [
  'studentActivation', 'appRegistryChanges', 'publishedFilesInThisPr',
  'mergeAuthorized', 'ownerGraphicAcceptance', 'pedagogicalAcceptance',
  'publicationApproval', 'vocalsIncluded'
]) assert.equal(p.deliveryPlan[key], false, key + ' ne doit pas déclarer une publication/acceptation');
assert.equal(p.deliveryPlan.vocalMp3Count, 0);
assert.equal(p.deliveryPlan.existingScriptsNotPublished, 3);
assert.deepEqual(p.deliveryPlan.counts,
  {qcm:50, flashcards:50, glossaryTerms:59, anatomicalBoards:7});

for (const [role, pages] of Object.entries({sheet:17,qcm:24,boards:7})) {
  const a = p.candidatePdfEvidence[role];
  assert.ok(a && a.localReviewName.endsWith('.pdf'), role + ': nom de candidat absent');
  assert.equal(a.pages, pages, role + ': pagination');
  assert.ok(hash(a.sha256), role + ': empreinte absente');
  assert.equal(a.ownerAcceptance, 'pending', role + ': acceptation humaine usurpée');
  assert.ok(a.technicalCheck.includes(role === 'boards' ? 'pending' : 'local_only'),
    role + ': ne jamais confondre contrôle local et preuve CI');
}
assert.ok(p.prerequisiteChecks.length >= 9);
assert.ok(p.blockers.includes('no_explicit_publication_go'));
const missingPdf=Object.values(p.candidatePdfEvidence).some(asset=>!asset.gitBinaryUploaded);
assert.equal(p.blockers.includes('pdf_binaries_not_in_repository'),missingPdf,
  'Le blocage des binaires doit correspondre au transfert réel');
assert.equal(p.deliveryPlan.binaryTransferStatus,missingPdf
  ? 'partial_2_of_3_in_github_not_published'
  : 'complete_3_of_3_in_github_not_published');
assert.ok(!['drive.google.com','transcriptDriveId','recording_url'].some(s => JSON.stringify(p).includes(s)),
  'sources privées non permises dans le dépôt');

// Aucune activation des banques et ressources avant accord du lot exact.
const roots = [
  ...read('course-registry-v741.json').courses,
  ...read('docs/course-deliveries.json').courses,
  ...[1,2,3].flatMap(n => read('sheets-' + n + '.json')),
  ...[1,2,3,4,5].flatMap(n => read('questions-' + n + '.json')),
  ...read('infographics.json'),
  ...read('vocals.json')
];
assert.ok(roots.every(x => x.id !== id && x.courseId !== id), 'cours actif sans GO');
assert.ok(!read('vocabulaire-v1.json').entries.some(x => x.courseIds?.includes(id)),
  'lexique étudiant actif sans GO');
console.log('PASS: candidature publication B1.1 sans vocaux isolée ; 50 QCM, 50 flashcards, 59 définitions, 7 planches ; aucune activation.');

}
