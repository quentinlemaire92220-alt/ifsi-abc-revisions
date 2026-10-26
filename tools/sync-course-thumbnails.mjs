#!/usr/bin/env node
/* Manifeste évolutif des vignettes. Pas de génération d'images ni publication.
 * Ajouter un cours au registre => repli UE automatique.
 * Un WebP par ID n'entre au manifeste qu'avec course.thumbnail.status='validated',
 * course.thumbnail.reviewedAt (ISO) et course.thumbnail.approvedBy.
 */
import fs from 'node:fs';
import crypto from 'node:crypto';

const MANIFEST = 'docs/proposals/course-thumbnails-55-assets.json'; // nom historique
const REGISTRY = 'course-registry-v741.json';
const SW = 'sw.js';
const ASSET_DIR = 'assets/course-thumbnails';
const checkOnly = process.argv.includes('--check');
const registry = JSON.parse(fs.readFileSync(REGISTRY, 'utf8')).courses;
const oldManifest = JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
const byId = new Map(registry.map(c => [c.id, c]));
if (byId.size !== registry.length) throw Error('Doublon dans le registre');
const oldById = new Map();
for (const row of oldManifest) {
  const id = row.path?.match(/^assets\/course-thumbnails\/([a-z0-9_-]+)\.webp$/)?.[1];
  if (!id || !byId.has(id) || oldById.has(id)) throw Error('Manifeste invalide : ' + row.path);
  oldById.set(id, row);
}
const expected = [];
for (const course of registry) {
  if (!/^[a-z0-9_-]+$/.test(course.id)) throw Error('ID de cours invalide : ' + course.id);
  const path = ASSET_DIR + '/' + course.id + '.webp';
  const existing = oldById.get(course.id);
  const filePresent = fs.existsSync(path);
  const approved = course.thumbnail?.status === 'validated' &&
    /^\d{4}-\d\d-\d\d$/.test(String(course.thumbnail.reviewedAt || '')) &&
    !!String(course.thumbnail.approvedBy || '').trim();

  if (!existing && !filePresent) continue; // nouveau cours sans visuel : repli par UE
  if (!filePresent) throw Error('WebP manquant : ' + path);
  const data = fs.readFileSync(path);
  if (data.toString('ascii', 0, 4) !== 'RIFF' ||
      data.toString('ascii', 8, 12) !== 'WEBP') throw Error('Format WebP invalide : ' + path);
  const next = {
    path, length: data.length, sha256: crypto.createHash('sha256').update(data).digest('hex')
  };
  if (!existing && !approved) throw Error('Nouveau visuel non validé : ' + path);
  if (existing && (existing.sha256 !== next.sha256 || existing.length !== next.length) && !approved)
    throw Error('Remplacement sans validation graphique : ' + path);
  expected.push(next);
}
const dataText = JSON.stringify(expected, null, 2) + '\n';
const oldText = fs.readFileSync(MANIFEST, 'utf8');
let sw = fs.readFileSync(SW, 'utf8');
const assets = [MANIFEST, ...expected.map(x => x.path)];
for (const path of assets) {
  const literal = "'./" + path + "'";
  if (sw.includes(literal)) continue;
  if (checkOnly) throw Error('Précache PWA incomplet : ' + path);
  if (!sw.includes('const BASE_ASSETS=[')) throw Error('Structure SW inconnue');
  sw = sw.replace('const BASE_ASSETS=[', 'const BASE_ASSETS=[' + literal + ',');
}
if (checkOnly && oldText !== dataText) throw Error('Manifeste désynchronisé : exécuter node tools/sync-course-thumbnails.mjs');
if (!checkOnly) {
  if (oldText !== dataText) fs.writeFileSync(MANIFEST, dataText);
  if (sw !== fs.readFileSync(SW, 'utf8')) fs.writeFileSync(SW, sw);
}
console.log('Vignettes publiables : ' + expected.length +
  ' | Cours en attente : ' + (registry.length - expected.length) +
  ' | Mode : ' + (checkOnly ? 'vérification' : 'synchronisation'));
