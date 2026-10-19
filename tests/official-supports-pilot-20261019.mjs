import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const registry = read('course-registry-v741.json').courses;
const pilot = read('docs/qcm-flashcards-supplements-20261019.pending.json');
const course = id => registry.find(item => item.id === id);
const expectUrl = (id, driveId) => {
  const url = course(id)?.officialSupportUrl || '';
  assert.ok(url.includes('/d/' + driveId + '/'), 'Support officiel absent du cours ' + id);
};
expectUrl('systeme_cardiovasculaire', '153nGJAeW-Q_5fvLPK92KjYlcFz_7JDHS');
expectUrl('chirurgie_orthopedique', '1iHpfzotgrvRQmuM0CUKTiMnyFGfXtoF8');
const teacherQcm = (course('appareil_locomoteur')?.additionalDocuments || []).filter(item => item.category === 'qcm_enseignant');
assert.equal(teacherQcm.filter(item => item.url.includes('1zkTBket8QK-s85SW6Ybp3mC0LGgNEIC4')).length, 1, 'QCM enseignant doit être référencé une seule fois');
assert.equal(pilot.status, 'en_attente_validation_pedagogique');
assert.equal(pilot.publication, 'non');
assert.equal(pilot.questions.length, 10);
const knownIds = new Set();
const old = [1, 2, 3, 4, 5].flatMap(index => read('questions-' + index + '.json'));
old.forEach(item => knownIds.add(item.id));
const ids = new Set();
const disallowed = /\b(?:selon le (?:cours|support|td)|dans le (?:cours|support|td)|voir (?:la diapositive|la page)|ci-dessus|ci-dessous)\b/i;
for (const q of pilot.questions) {
  assert.ok(!ids.has(q.id) && !knownIds.has(q.id), 'Identifiant QCM dupliqué: ' + q.id);
  ids.add(q.id);
  assert.ok(course(q.courseId), 'courseId inconnu: ' + q.courseId);
  assert.equal(q.choices.length, 5, q.id + ': cinq choix attendus');
  assert.ok(q.answers.length >= 1 && q.answers.length <= 3, q.id + ': une à trois bonnes réponses');
  assert.ok(new Set(q.answers).size === q.answers.length && q.answers.every(value => Number.isInteger(value) && value >= 0 && value < 5), q.id + ': indices invalides');
  assert.ok(q.explanation.length >= 80, q.id + ': correction insuffisante');
  assert.ok(q.reviewSource?.driveId && q.reviewSource?.pages, q.id + ': preuve de revue incomplète');
  assert.equal(q.flashcards.length, 1, q.id + ': une carte explicite attendue');
  for (const card of q.flashcards) {
    assert.ok(card.front?.length >= 25 && card.answers?.length === 1 && card.answers[0].length >= 10 && card.explanation?.length >= 80, q.id + ': carte non autonome');
    assert.ok(!disallowed.test([card.front, ...card.answers, card.explanation].join(' ')), q.id + ': flashcard dépendante du support');
  }
  assert.ok(!disallowed.test([q.question, ...q.choices, q.explanation].join(' ')), q.id + ': QCM dépendant du support');
}
assert.ok(!fs.readFileSync('index.html', 'utf8').includes('qcm-flashcards-supplements-20261019.pending.json'), 'Le pilotage en attente ne doit pas charger dans le runtime');
console.log('✅ Sources officielles liées et pilote de 10 QCM + 10 flashcards cohérent, non publié');
