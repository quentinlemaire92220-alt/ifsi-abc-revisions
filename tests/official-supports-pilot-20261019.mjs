import assert from 'node:assert/strict';
import fs from 'node:fs';
import {runtimeDeck} from './flashcards-runtime-fixture.mjs';

const registry = JSON.parse(fs.readFileSync('course-registry-v741.json','utf8')).courses;
const course = id => registry.find(c => c.id === id);
const hasId = (url,id) => typeof url === 'string' && url.includes('/d/'+id+'/');
assert.ok(hasId(course('systeme_cardiovasculaire')?.officialSupportUrl,'153nGJAeW-Q_5fvLPK92KjYlcFz_7JDHS'),'Support cardiovasculaire non référencé');
assert.ok(hasId(course('chirurgie_orthopedique')?.officialSupportUrl,'1iHpfzotgrvRQmuM0CUKTiMnyFGfXtoF8'),'Support chirurgie orthopédique non référencé');
const docs=course('appareil_locomoteur')?.additionalDocuments||[];
assert.equal(docs.filter(d=>hasId(d.url,'1zkTBket8QK-s85SW6Ybp3mC0LGgNEIC4')).length,1,'QCM enseignant doit apparaître une fois');
const sheets=[1,2,3].flatMap(n=>JSON.parse(fs.readFileSync('sheets-'+n+'.json','utf8')));
const oldSheet=sheets.find(s=>s.courseId==='chirurgie_orthopedique');
assert.ok(oldSheet?.provisional===true && oldSheet?.officialSupport===false,'La fiche chirurgie historique doit rester provisoire tant que les apports oraux ne sont pas rapprochés');
const {questions,deck}=await runtimeDeck();
const existing=[
  'cardio_002','cardio_003','cardio_026',
  'v820_chirortho_001','v820_chirortho_005','v820_chirortho_017','v820_chirortho_018',
  'v820_chirortho_028','v820_chirortho_029','v820_chirortho_030',
  'v820_loco_048','v820_trauma_013','v820_brules_004'
];
const found=existing.map(id=>{
 const q=questions.find(item=>item.id===id);
 assert.ok(q,'QCM existant perdu : '+id);
 assert.ok(Array.isArray(q.answers)&&q.answers.length>=1 && q.answers.every(a=>Number.isInteger(a)&&a>=0&&a<q.choices.length),'Réponses désynchronisées : '+id);
 assert.ok(q.explanation?.trim(),'Correction absente : '+id);
 return {id,flashcards:deck.filter(c=>c.qid===id).length};
});
console.log('AUDIT_SUPPORTS_20261019 '+JSON.stringify(found));
console.log('✅ Trois supports rattachés et QCM historiques conservés ; aucune publication pédagogique nouvelle');
