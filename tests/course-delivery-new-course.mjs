// Contrôle des premières publications pédagogiques (cours nouveaux ou pré-inscrits).
// Aucun accès au Drive ni à des documents privés : seules les données Git sont lues.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {validateDualSheetDelivery} from './dual-sheet-contract.mjs';
import {validateLeanCourseDelivery} from './lean-course-contract.mjs';
import {validateAnatomyRouting} from './anatomy-routing-contract.mjs';
import {validateAudioOnlyDelivery} from './audio-only-delivery-contract.mjs';

const read = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const git = args => execFileSync('git', args, {
  encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe']
}).trim();

function resolveBase() {
  const requested = String(process.env.IFSI_BASE_SHA || '').trim();
  const valid = /^[0-9a-f]{7,40}$/i.test(requested) && !/^0+$/.test(requested);
  const candidates = valid ? [requested, 'HEAD^'] : ['HEAD^'];
  for (const base of candidates) {
    try {
      return {base, previous: JSON.parse(git(['show', `${base}:course-registry-v741.json`]))};
    } catch {
      // Fallback utile pour workflow_dispatch ou un historique Git incomplet.
    }
  }
  throw new Error('Historique Git introuvable pour comparer les cours ; vérifier checkout fetch-depth: 0.');
}

const {base, previous: oldRegistry} = resolveBase();
const previousJson = path => JSON.parse(git(['show', `${base}:${path}`]));
const current = {
  registry: read('course-registry-v741.json'),
  sheets: [1, 2, 3].flatMap(n => read(`sheets-${n}.json`)),
  infographics: read('infographics.json'),
  vocals: read('vocals.json')
};
const before = {
  registry: oldRegistry,
  sheets: [1, 2, 3].flatMap(n => previousJson(`sheets-${n}.json`)),
  infographics: previousJson('infographics.json'),
  vocals: previousJson('vocals.json')
};
const deliveries = read('docs/course-deliveries.json');
assert.ok(Array.isArray(current.registry.courses), 'Registre actuel invalide');
assert.ok(Array.isArray(before.registry.courses), 'Registre de base invalide');
assert.ok(Array.isArray(deliveries.courses), 'Manifeste de livraison invalide');

const deliveredIds = deliveries.courses.map(c => c.courseId);
assert.equal(new Set(deliveredIds).size, deliveredIds.length, 'courseId en doublon dans le manifeste');
const published = (dataset, id) => {
  const course = dataset.registry.courses.find(c => c.id === id);
  return !!course?.qcmPdfUrl ||
    dataset.sheets.some(x => x.courseId === id) ||
    dataset.infographics.some(x => x.courseId === id) ||
    dataset.vocals.some(x => x.courseId === id);
};

for(const d of deliveries.courses.filter(x=>x.deliveryMode==='existing_course_revision')){
 assert.ok(published(before,d.courseId),d.courseId+': la révision sur captures est réservée à un cours déjà publié');
 assert.ok(before.registry.courses.some(x=>x.id===d.courseId),d.courseId+': identifiant existant perdu');
}

const oldIds = new Set(before.registry.courses.map(c => c.id));
const added = current.registry.courses.filter(c => !oldIds.has(c.id));
const firstPublished = current.registry.courses
  .filter(c => published(current, c.id) && !published(before, c.id));
const missing = firstPublished.filter(c => !deliveredIds.includes(c.id));
assert.equal(missing.length, 0,
  'Premières publications sans livraison dans docs/course-deliveries.json : ' +
  missing.map(c => c.id).join(', '));

for (const course of firstPublished) {
  const delivery = deliveries.courses.find(d => d.courseId === course.id);
  assert.equal(delivery?.validated, true, course.id + ' : validation de livraison absente');
  assert.ok(['complete', 'awaiting_mp3', 'partial'].includes(delivery.status),
    course.id + ' : statut de livraison invalide');
  if (delivery.deliveryMode==='audio_only') {
    validateAudioOnlyDelivery(course,delivery,current.vocals);
    continue; // Seul l'audio est publié ; les deux PDF restent indispensables pour déclarer le cours complet.
  }
  if(delivery.packFormat==='lean_v1')validateLeanCourseDelivery(course.id, delivery, current.sheets);
  else validateDualSheetDelivery(course.id, delivery, current.sheets);
  const atlasSources = ['v83-anatomy-interactive.js','v82-nav-anatomy.js',
    'v814-respiratory-atlas.js','v815-urinary-atlas.js','v816-endocrine-atlas.js',
    'v817-immune-atlas.js','v822-nervous-atlas.js','v823-cardiovascular-atlas.js',
    'v824-digestive-atlas.js','v829-locomotor-atlas.js']
    .map(file=>fs.readFileSync(file,'utf8')).join('\n');
  validateAnatomyRouting(course, atlasSources, current.infographics);
}
console.log('✅ Garde-fou première publication : ' + added.length +
  ' nouveaux courseId, ' + firstPublished.length +
  ' cours publiés pour la première fois, 0 manifeste manquant (base ' + base + ').');
