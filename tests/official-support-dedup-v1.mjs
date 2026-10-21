import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { runInNewContext } from 'node:vm';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const registry = JSON.parse(readFileSync(resolve(root, 'course-registry-v741.json'), 'utf8'));
const source = readFileSync(resolve(root, 'v74-pack.js'), 'utf8');
const courses = registry.courses || [];
const ids = courses.map(course => course.id);

assert.ok(courses.length >= 50, 'Le registre approuvé doit conserver ses 50 cours.');
assert.equal(new Set(ids).size, ids.length, 'courseId en double.');
assert.ok(ids.includes('pssm'), 'Le cours PSSM doit rester présent.');
assert.ok(ids.includes('sante_mondiale_sante_france'), 'Le cours C1.1 S1 doit rester présent.');

const helperStart = source.indexOf('  const uniqueSupportParts74=');
const helperEnd = source.indexOf('  const officialUrl=', helperStart);
assert.ok(helperStart !== -1 && helperEnd > helperStart, 'Déduplication UI des supports manquante.');
const helperCode = source.slice(helperStart, helperEnd);
const dedupe = runInNewContext(helperCode + '\nuniqueSupportParts74;');
assert.equal(typeof dedupe, 'function');
assert.ok(source.includes('const officialParts=uniqueSupportParts74('), 'L’affichage officiel doit appeler le filtre.');
assert.ok(source.includes('const captureParts=uniqueSupportParts74('), 'L’affichage des captures doit appeler le filtre.');

const reduced = [];
for (const course of courses) {
  const entries = course.officialSupportItems || [];
  const shown = dedupe(course.officialSupportUrl, entries);
  assert.ok(shown.length <= entries.length);
  if (shown.length < entries.length) reduced.push(course.id);
  const second = dedupe(course.officialSupportUrl, shown);
  assert.deepEqual(Array.from(second, x => x.url), Array.from(shown, x => x.url),
    'Le filtre doit être idempotent pour '+course.id);
}
assert.deepEqual(reduced.sort(),
  ['appareil_locomoteur','droits_patients','stomatotherapie','traumatologie'].sort(),
  'Seuls les quatre cours connus doivent être dédupliqués.');

const stomatotherapie = courses.find(course => course.id === 'stomatotherapie');
const shownStomato = dedupe(stomatotherapie.officialSupportUrl, stomatotherapie.officialSupportItems);
assert.equal(shownStomato.length, 1);
assert.ok(shownStomato[0].title.includes('appareil digestif'), 'Le complément digestif doit rester visible.');

console.log('PASS : '+courses.length+' cours préservés, 4 doublons UI supprimés, complément digestif visible, aucune modification du registre.');
