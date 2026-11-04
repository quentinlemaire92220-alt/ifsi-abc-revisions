import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';

const source = readFileSync(new URL('../planning-v1.js', import.meta.url), 'utf8');
function load(promo='A', tier='all', subgroup='all') {
  const values = new Map([
    ['ifsiabc_planning_promo_v1', promo],
    ['ifsiabc_planning_tier_v1', tier],
    ['ifsiabc_planning_subgroup_v1', subgroup],
  ]);
  const window = {};
  const context = {
    window,
    document: {getElementById: () => null},
    localStorage: {
      getItem: key => values.has(key) ? values.get(key) : null,
      setItem: (key, value) => values.set(key, value),
    },
    setInterval: () => 1,
    clearInterval: () => {},
    Date, Intl,
  };
  // L'injection existe uniquement dans le test pour vérifier le prédicat privé.
  vm.runInNewContext(source.replace('window.IFSI_PLANNING={', 'window.__testEventVisible=eventVisible;window.IFSI_PLANNING={'), context, {filename:'planning-v1.js'});
  return {weeks:window.IFSI_PLANNING.weeks, visible:window.__testEventVisible, version:window.IFSI_PLANNING.version};
}
const {weeks, visible, version} = load('A','1');
assert.equal(version,'1.6');
const s10 = weeks.find(w=>w.id==='S10'), s11 = weeks.find(w=>w.id==='S11');
assert.ok(s10 && s11, 'Semaines S10 et S11 présentes');
assert.equal(s11.start,'2026-11-09');
assert.equal(s11.events.length,11);
assert.equal(s11.events.filter(e=>e.date==='2026-11-11'&&e.type==='Férié').length,1);
const tiers = s10.events.filter(e=>e.tier);
assert.equal(tiers.length,6);
for (const n of ['1','2','3']) assert.equal(tiers.filter(e=>e.tier===n).length,2);
assert.ok(tiers.filter(e=>e.date==='2026-11-04').every(e=>e.end==='16:30'));
const saynettes=s10.events.filter(e=>e.date==='2026-11-05' && /saynètes/i.test(e.title));
assert.equal(saynettes.length,1);
assert.equal(saynettes[0].start,'13:30');
assert.equal(saynettes[0].end,'17:00');
assert.equal(s10.events.some(e=>e.date==='2026-11-05' && /anti-infectieux|socle numérique/i.test(e.title)),false);
const nov12=s11.events.filter(e=>e.date==='2026-11-12');
assert.equal(nov12.length,4);
assert.deepEqual([...new Set(nov12.map(e=>e.start))].sort(),['09:30','13:30']);
assert.ok(nov12.some(e=>e.promo==='A'&&e.start==='09:30'&&/coping/.test(e.title)));
assert.ok(nov12.some(e=>e.promo==='B'&&e.start==='13:30'&&/coping/.test(e.title)));
assert.ok(visible(tiers.find(e=>e.tier==='1')));
assert.equal(visible(tiers.find(e=>e.tier==='2')),false);
assert.ok(visible(s10.events.find(e=>e.date==='2026-11-02')),'CM commun visible');
assert.equal(visible(s11.events.find(e=>e.promo==='B'&&e.date==='2026-11-12')),false,'promo B masquée pour A');
const forB2=load('B','2');
assert.ok(forB2.visible(tiers.find(e=>e.tier==='2')));
assert.equal(forB2.visible(tiers.find(e=>e.tier==='1')),false);
assert.ok(forB2.visible(s11.events.find(e=>e.promo==='B'&&e.date==='2026-11-12')));
assert.equal(forB2.visible(s11.events.find(e=>e.promo==='A'&&e.date==='2026-11-12')),false);
console.log('Planning S45/S46 + tiers de promotion : contrôles OK.');
