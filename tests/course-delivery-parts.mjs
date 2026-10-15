// Compare les ajouts aux cours déjà publiés : tous les courseId connus,
// même si le registre contenait déjà la partie 1 avant ce commit.
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {validatePartChanges} from './course-delivery-parts-lib.mjs';

const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
const git = args => execFileSync('git', args, {encoding:'utf8', stdio:['ignore','pipe','pipe']}).trim();
function showJson(ref, path, fallback = null) {
  try { return JSON.parse(git(['show', ref + ':' + path])); }
  catch (error) {
    if (fallback !== null) return fallback;
    throw error;
  }
}
function findBase() {
  const requested = String(process.env.IFSI_BASE_SHA || '').trim();
  const options = /^[0-9a-f]{7,40}$/i.test(requested) && !/^0+$/.test(requested)
    ? [requested, 'HEAD^'] : ['HEAD^'];
  for (const ref of options) {
    try { showJson(ref, 'course-registry-v741.json'); return ref; }
    catch { /* history uninitialized */ }
  }
  throw new Error('Historique Git introuvable pour la comparaison différentielle');
}
const base = findBase();
const oldManifest = showJson(base, 'docs/course-deliveries.json', {courses:[]});
const currentManifest = read('docs/course-deliveries.json');
const changed = git(['diff','--name-only',base,'HEAD'])
  .split(/\r?\n/).filter(path => /^qextra-[\w-]+\.txt$/.test(path));
const manifestBanks = [oldManifest,currentManifest].flatMap(manifest =>
  (manifest.courses||[]).flatMap(c => c.qcmBanks || (c.qcmBank ? [c.qcmBank] : [])));
const qextra = [...new Set([...changed,...manifestBanks])]
  .filter(path => typeof path === 'string' && /^[\w/-]+\.(txt|json)$/.test(path) &&
    !path.includes('..'));
function load(ref) {
  const current = ref === 'HEAD';
  const json = path => current ? read(path) : showJson(ref, path);
  const bank = qextra.flatMap(path => current
    ? (fs.existsSync(path) ? read(path) : [])
    : showJson(base, path, []));
  for (const item of bank) if (!item.id || !item.courseId)
    throw new Error('Question ajoutée sans ID ni courseId dans une banque QCM');
  return {
    registry:json('course-registry-v741.json'),
    sheets:[1,2,3].flatMap(i=>json('sheets-'+i+'.json')),
    infographics:json('infographics.json'),
    vocals:json('vocals.json'),
    questions:bank
  };
}
const previous = load(base);
const current = load('HEAD');
const supplements = fs.existsSync('docs/qcm-supplements.json') ? read('docs/qcm-supplements.json') : {supplements:[]};
const result = validatePartChanges(previous,current,oldManifest,currentManifest,supplements);
console.log('✅ Parties de cours déjà publiés : ' + result.courses + ' cours, ' +
  result.resources + ' nouvelles ressources contrôlées (base '+base+')');
