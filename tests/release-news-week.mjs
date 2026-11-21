import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';

const read = file => fs.readFileSync(file, 'utf8');
const {build} = JSON.parse(read('build-meta.json'));
execFileSync(process.execPath,['tools/build-release-news.mjs','--check']);
const initial = [...read('index.html').matchAll(/<script src="\.\/(v\d+-changelog\.js)/g)];
assert.deepEqual(initial.map(m=>m[1]),[`v${build}-changelog.js`]);
assert.deepEqual([...read('sw.js').matchAll(/'\.\/(v\d+-changelog\.js)'/g)].map(m=>m[1]),[initial[0][1]]);
const source=read('changelog-v742.js');
const dates=['2026-11-22','2026-11-21','2026-11-15','2026-11-14',null];
const notes=dates.map(date=>({date}));
let attempts=0;
const context=vm.createContext({window:{IFSI_RELEASE_NEWS:{entries:notes}},document:{getElementById:()=>null},
  fetch:async()=>{if(++attempts===1)throw Error('network');return {ok:true,json:async()=>notes}}});
vm.runInContext(source,context);
const api=context.window.IFSI_CHANGELOG;
const week=iso=>api.week(new Date(iso));
assert.deepEqual(Array.from(week('2026-11-21T22:59:59Z').entries,n=>n.date),dates.slice(1,3));
assert.deepEqual(Array.from(week('2026-11-21T23:00:00Z').entries,n=>n.date),dates.slice(0,2));
assert.equal(week('2026-11-30T12:00:00Z').entries.length,0);
for(const [now,next] of [
  ['2026-03-29T00:00:00Z','2026-03-29T22:00:00Z'],
  ['2026-10-25T00:00:00Z','2026-10-25T23:00:00Z'],
  ['2026-12-31T22:59:59Z','2026-12-31T23:00:00Z']
]) assert.equal(week(now).nextMidnight,Date.parse(next));
assert.equal(attempts,0,'Le premier écran ne doit pas demander les archives');
await assert.rejects(api.loadHistory());
assert.deepEqual(await Promise.all([api.loadHistory(),api.loadHistory()]),[notes,notes]);
assert.equal(attempts,2,'Le journal doit partager sa requête et permettre de réessayer');
console.log('✅ Journal hebdomadaire, minuit à Paris, changements d’heure, partage de la requête et réouverture');
