// Garde-fou de livraison pour les nouveaux cours : déclenché par les différences Git.
// Ne publie ni n'interroge aucune ressource Drive privée.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';

const read = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const registry = read('course-registry-v741.json');
const deliveries = read('docs/course-deliveries.json');
const sheets = [1, 2, 3].flatMap(n => read(`sheets-${n}.json`));
const infographics = read('infographics.json');
const vocals = read('vocals.json');

function git(args) {
  return execFileSync('git', args, {encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']}).trim();
}

function previousRegistry() {
  const externalBase = String(process.env.IFSI_BASE_SHA || '').trim();
  const validBase = /^[0-9a-f]{7,40}$/i.test(externalBase) && !/^0+$/.test(externalBase);
  const candidates = validBase ? [externalBase, 'HEAD^'] : ['HEAD^'];
  let lastError;
  for (const base of candidates) {
    try {
      return {base, data: JSON.parse(git(['show', `${base}:course-registry-v741.json`]))};
    } catch (error) {
      lastError = error;
    }
  }
  throw new Error('Impossible de lire le registre du commit de base (vérifier checkout fetch-depth: 0). ' + (lastError?.message || ''));
}

assert.ok(Array.isArray(registry.courses), 'Registre de cours invalide');
assert.ok(Array.isArray(deliveries.courses), 'Manifeste de livraison invalide');
const {base, data: before} = previousRegistry();
const oldIds = new Set((before.courses || []).map(c => c.id));
const newlyAdded = registry.courses.filter(c => !oldIds.has(c.id));
const deliveryIds = deliveries.courses.map(c => c.courseId);
assert.equal(new Set(deliveryIds).size, deliveryIds.length, 'courseId répété dans le manifeste de livraison');

const published = id =>
  sheets.some(x => x.courseId === id) ||
  infographics.some(x => x.courseId === id) ||
  vocals.some(x => x.courseId === id) ||
  Boolean(registry.courses.find(c => c.id === id)?.qcmPdfUrl);

const withoutDelivery = newlyAdded
  .filter(c => published(c.id))
  .filter(c => !deliveryIds.includes(c.id));

assert.equal(
  withoutDelivery.length, 0,
  'Nouveaux cours avec ressources publiées mais absents de docs/course-deliveries.json : ' +
  withoutDelivery.map(c => c.id).join(', ')
);
for (const course of newlyAdded.filter(c => published(c.id))) {
  const delivery = deliveries.courses.find(d => d.courseId === course.id);
  assert.equal(delivery?.validated, true, course.id + ' : livraison non validée');
  assert.ok(['complete', 'awaiting_mp3', 'partial'].includes(delivery.status), course.id + ' : statut de livraison invalide');
}
console.log('✅ Contrôle nouveaux cours depuis ' + base + ' : ' +
  newlyAdded.length + ' nouveaux, ' +
  newlyAdded.filter(c => published(c.id)).length + ' publiés, ' +
  newlyAdded.filter(c => !published(c.id)).length + ' entrées sans ressources (autorisées).');
