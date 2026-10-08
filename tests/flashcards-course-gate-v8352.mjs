import {execFileSync} from 'node:child_process';
import assert from 'node:assert/strict';

const stdout=execFileSync(process.execPath,['tests/flashcards-inventory-v8345.mjs'],{encoding:'utf8'});
const marker='FLASHCARD_INVENTORY_JSON';
const idx=stdout.indexOf(marker);
assert.ok(idx>=0,'Rapport inventaire Flashcards introuvable');
const jsonText=stdout.slice(idx+marker.length).trim();
const report=JSON.parse(jsonText);
assert.ok(Array.isArray(report.courseStats),'Statistiques par cours absentes de l’inventaire');

const MAX_REJECT_RATE=25;
const MIN_CARDS_FOR_RATE=4;
const failures=[];
const warnings=[];

for(const c of report.courseStats){
  if(c.qcmCount>0&&c.generatedCards===0){
    failures.push(`${c.label}: ${c.qcmCount} QCM mais 0 flashcard générée`);
    continue;
  }
  if(c.generatedCards>=MIN_CARDS_FOR_RATE&&c.rejectRate>MAX_REJECT_RATE){
    failures.push(`${c.label}: ${c.rejectRate}% de cartes rejetées (${c.reject}/${c.generatedCards}), seuil ${MAX_REJECT_RATE}%`);
  }else if(c.generatedCards<MIN_CARDS_FOR_RATE&&c.reject>=2){
    failures.push(`${c.label}: ${c.reject}/${c.generatedCards} cartes rejetées sur un petit jeu de cartes`);
  }
  if(c.reject>0){
    warnings.push(`${c.label}: ${c.reject}/${c.generatedCards} rejetée(s), ${c.rejectRate}%`);
  }
}

console.log('FLASHCARD_COURSE_GATE');
console.log(JSON.stringify({
  coursesChecked:report.courseStats.length,
  maxRejectRate:MAX_REJECT_RATE,
  minCardsForRate:MIN_CARDS_FOR_RATE,
  failures,
  warnings
},null,2));

if(failures.length){
  console.error('\n❌ Garde-fou Flashcards par cours en échec:');
  for(const f of failures)console.error('- '+f);
  process.exit(1);
}
console.log(`✅ ${report.courseStats.length} cours avec QCM contrôlés : aucun cours sans flashcard et aucun taux de rejet au-dessus du seuil.`);
