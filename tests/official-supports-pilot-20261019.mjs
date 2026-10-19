import assert from 'node:assert/strict';
import fs from 'node:fs';
import {runtimeDeck} from './flashcards-runtime-fixture.mjs';

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
const {questions: activeQuestions} = await runtimeDeck();
const norm = value => String(value || '').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const stop = new Set('la le les l de des du en et ou au aux un une d qu que qui quels quelles quel quelle concernant propos apres sont est dans entre pour sur avec associees exactes correctes suivantes affirmation affirmations propositions'.split(' '));
const tokens = str => new Set(norm(str).split(' ').filter(v => v.length > 2 && !stop.has(v)));
const similarity = (a, b) => {
 const left=tokens(a),right=tokens(b);
 if(!left.size || !right.size)return 0;
 const intersection=[...left].filter(x=>right.has(x)).length;
 return intersection / (left.size + right.size - intersection);
};
const audit=[];
for(const q of pilot.questions){
 const existing=activeQuestions.filter(x=>x.id!==q.id);
 const matches=existing.map(old=>({id:old.id,courseId:old.courseId,score:similarity(q.question,old.question),question:old.question})).sort((a,b)=>b.score-a.score).slice(0,2);
 audit.push({id:q.id,matches});
 assert.ok(!existing.some(old=>norm(old.question)===norm(q.question)),'Question strictement dupliquée : '+q.id);
}
console.log('AUDIT_PILOTE_PROXIMITES_JSON '+JSON.stringify(audit));
const domainIds=new Set(['systeme_cardiovasculaire','chirurgie_orthopedique','traumatologie','appareil_locomoteur','grands_brules','arthrose']);
const domainQuestions=activeQuestions.filter(q=>domainIds.has(q.courseId));
console.log('AUDIT_EXISTANT_COMPTAGE_JSON '+JSON.stringify([...domainIds].map(id=>({id,count:domainQuestions.filter(q=>q.courseId===id).length}))));
const targeted=domainQuestions.filter(q=>/circulation|coeur|cardiaque|ecg|onde|depolarisation|arthrose|coxarthrose|prothese|pt[gh]|post.?operat|laminectomie|hematome|sciatique|cruralgie|radiculalgie|platre|cruro|courbure|cyphose|lordose|gravite|brulure/i.test(norm(q.question)));
console.log('AUDIT_EXISTANT_DOMAIN_JSON '+JSON.stringify(targeted.map(q=>({id:q.id,courseId:q.courseId,question:q.question,correct:(q.answers||[]).map(i=>q.choices[i])}))));

const termsByPilot={
 cardio_01:['circulation','pulmonaire','veine pulmonaire','oreillette','sang'],
 cardio_02:['ecg','onde p','qrs','onde t','depolarisation','repolarisation'],
 cardio_03:['debit cardiaque','ves','frequence cardiaque','resistance','pression arterielle'],
 chir_01:['coxarthrose','prothese totale de hanche','pth','traitement medical'],
 chir_02:['postoperatoire','hematome','thrombose','embolie','surveillance','pth','ptg'],
 chir_03:['cruralgie','sciatique','radiculalgie','l3','l4','l5','s1'],
 chir_04:['laminectomie','hematome extradural','hematome compressif','redon','paresthesie'],
 rachis_01:['cyphose','lordose','courbures','rachis'],
 rachis_02:['cruro','platre','cheville','genou'],
 brules_01:['gravite','brulure','localisation','etendue','profondeur']
};
const diagnostic = pilot.questions.map(q=>{
 const key=q.id.replace('off26_20261019_',''),terms=termsByPilot[key]||[];
 const allowed=q.courseId==='appareil_locomoteur'?new Set(['traumatologie','appareil_locomoteur']):new Set([q.courseId]);
 const likely=activeQuestions.filter(old=>allowed.has(old.courseId)).map(old=>{
  const body=norm(old.question+' '+(old.choices||[]).join(' ')+' '+old.explanation);
  const hit=terms.filter(k=>body.includes(norm(k)));
  return {id:old.id,question:old.question,answers:(old.answers||[]).map(i=>old.choices[i]),hit,score:hit.length};
 }).filter(old=>old.score>0).sort((a,b)=>b.score-a.score).slice(0,5);
 return {id:q.id,existing:likely};
});
console.log('AUDIT_PILOTE_RECOUVREMENTS_JSON '+JSON.stringify(diagnostic));


console.log('✅ Sources officielles liées et pilote de 10 QCM + 10 flashcards cohérent, non publié');
