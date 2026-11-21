import assert from 'node:assert/strict';
import fs from 'node:fs';

const read = name => fs.readFileSync(new URL('../' + name, import.meta.url), 'utf8');
const archive = JSON.parse(read('data/release-news.json'));
export function assertArchivedRelease(id) {
  const note = archive.find(entry => entry.id === id);
  assert.ok(note?.title && note.date, 'Annonce absente du journal daté : ' + id);
  assert.ok(read('sw.js').includes("'./data/release-news.json'"), 'Journal absent du cache hors ligne');
  return note;
}
