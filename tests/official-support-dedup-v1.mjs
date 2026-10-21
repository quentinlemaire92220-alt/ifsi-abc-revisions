import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const registry = JSON.parse(readFileSync(resolve(root, 'course-registry-v741.json'), 'utf8'));
const courses = registry.courses || [];
const ids = courses.map(course => course.id);

assert.ok(courses.length >= 50, 'Le registre ne doit pas retomber sous 50 cours (base du 21/10/2026).');
assert.equal(new Set(ids).size, ids.length, 'courseId en double.');
assert.ok(ids.includes('pssm'), 'Le cours PSSM introduit après la PR #129 doit rester présent.');
assert.ok(ids.includes('sante_mondiale_sante_france'), 'Le cours C1.1 S1 doit rester présent.');

function driveId(url) {
  if (typeof url !== 'string') return '';
  const path = url.split('?')[0].split('#')[0];
  return (path.split('/file/d/')[1] || path.split('/folders/')[1] || '').split('/')[0];
}

for (const course of courses) {
  const primary = driveId(course.officialSupportUrl);
  const idsSeen = new Set(primary ? [primary] : []);
  for (const item of course.officialSupportItems || []) {
    const id = driveId(item.url);
    assert.ok(id, 'URL Drive invalide dans les supports de '+ course.id);
    assert.ok(!idsSeen.has(id), 'Même support officiel référencé deux fois : '+course.id+' / '+id);
    idsSeen.add(id);
  }
}

const stomatotherapie = courses.find(course => course.id === 'stomatotherapie');
assert.ok(stomatotherapie, 'Cours Stomatothérapie manquant.');
assert.ok((stomatotherapie.officialSupportItems || []).some(item => item.title.includes('appareil digestif')),
  'Le complément digestif unique doit être conservé.');

console.log('PASS : '+courses.length+' cours, aucun doublon Drive dans les supports officiels, C1.1/PSSM et complément digestif préservés.');
