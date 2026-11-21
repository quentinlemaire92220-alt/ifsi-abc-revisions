import fs from 'node:fs';
import assert from 'node:assert/strict';

const read = path => JSON.parse(fs.readFileSync(path, 'utf8'));
const release = read('build-meta.json');
const history = read('data/release-news.json');
const cutoff = new Date(release.releasedAt + 'T00:00:00Z');
cutoff.setUTCDate(cutoff.getUTCDate() - 6);
const firstDay = cutoff.toISOString().slice(0, 10);
const entries = history.filter(note => note.date >= firstDay && note.date <= release.releasedAt);
const latestResource = history.find(note => note.type === 'resource') || null;
const payload = {entries, latestResourceId: latestResource?.id};
if (latestResource && !entries.some(note => note.id === latestResource.id)) payload.latestResource = latestResource;

assert.equal(history[0].id, 'v' + release.build + 'Change');
assert.equal(history[0].date, release.releasedAt);
assert.equal(new Set(history.map(note => note.id)).size, history.length);
assert.ok(history.every((note, i) => !i || (note.date || '') <= (history[i - 1].date || '')));
const target = 'v' + release.build + '-changelog.js';
const source = '// Généré avec node tools/build-release-news.mjs depuis data/release-news.json.\n' +
  'window.IFSI_RELEASE_NEWS = ' + JSON.stringify(payload, null, 2) + ';\n';
if (process.argv.includes('--check')) assert.equal(fs.readFileSync(target, 'utf8'), source);
else fs.writeFileSync(target, source);
