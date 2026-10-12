import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

// TNR: deux TD simultanés en salles distinctes doivent rester indépendants.
const source = fs.readFileSync(new URL('../planning-v1.js', import.meta.url), 'utf8');
const storage = new Map();
const context = {
  document: {},
  window: {},
  localStorage: {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, String(value)),
  },
  setInterval: () => 0,
  Date,
  Intl,
};
vm.runInNewContext(source, context, { filename: 'planning-v1.js' });
const week = context.window.IFSI_PLANNING.weeks.find(w => w.id === 'S7');
assert.ok(week, 'La semaine S7 doit exister');

const events = week.events.filter(e =>
  e.date === '2026-10-12' &&
  e.start === '09:00' &&
  e.end === '10:30' &&
  e.promo === 'B' &&
  e.title === 'Rôles et missions de l’IDE'
);
assert.equal(events.length, 2, 'B1 et B2 doivent être deux séances distinctes');
for (const [group, room] of [['B1', 'S11'], ['B2', 'S3']]) {
  const visible = events.filter(e => e.groups?.includes(group));
  assert.equal(visible.length, 1, 'Le sous-groupe ' + group + ' ne doit voir qu’une séance');
  assert.equal(visible[0].room, room, 'Salle incorrecte pour ' + group);
  assert.equal(visible[0].groups.length, 1, 'Une séance doit référencer un seul sous-groupe');
}
assert.equal(new Set(events.map(e => e.room)).size, 2, 'Les salles ne doivent pas être regroupées');
// L'agenda du jour doit garder toutes les séances en cours et au prochain horaire,
 // et non choisir arbitrairement le premier événement avec find().
assert.match(source, /dayEvents\\.filter\\(e=>eventDateTime\\(e,'start'\\)<=now&&now<eventDateTime\\(e,'end'\\)\\)/);
assert.match(source, /future\\.filter\\(e=>e\\.start===nextStart\\)/);
console.log('TNR planning B1/B2 du 12/10/2026 : OK');
