// Dette historique mesurée sur la banque source : extraction des en-têtes PDF.
// Ne corrige pas de réponses, ne lit aucune transcription privée.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {hasPdfPageFurniture} from './qcm-quality-core-v1.mjs';
const rows=JSON.parse(fs.readFileSync('qextra-12.txt','utf8'));
assert.ok(Array.isArray(rows),'qextra-12 doit contenir une liste QCM');
const part=rows.filter(q=>String(q.id||'').startsWith('v820_a1p3_'));
assert.equal(part.length,30,'Le nombre de questions A1 partie 03 a changé : revue requise');
const impacted=part.filter(hasPdfPageFurniture).map(q=>q.id);
assert.ok(impacted.length<=8,
  'Nouvelle contamination par en-tête PDF : '+impacted.length+' items (plafond historique 8)');
console.log('ℹ️ A1 partie 03 : '+impacted.length+' questions avec fragment PDF à revoir : '+impacted.join(', '));
console.log('✅ Contamination PDF plafonnée sans altérer les questions ni les réponses');
