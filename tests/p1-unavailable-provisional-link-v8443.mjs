import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

// P1 regression: historical records stay intact, broken Drive URLs must stay
// hidden in the student course UI. This test does not certify Drive ACLs.
const sheets=JSON.parse(readFileSync('sheets-3.json','utf8'));
const old=sheets.find(x=>x.resourceId==='responsabilite_exercice_professionnel_hybride_p01');
assert.ok(old,'Historical provisional revision must remain in registry');
assert.equal(old.driveId,'1we0v8BkXplPY9H0fLfUPukRP1p_U4yMB');
const ui=readFileSync('v74-pack.js','utf8');
const fn=ui.match(/const p1HiddenDocument74=doc=>\{([\s\S]*?)\n  \};/);
assert.ok(fn,'P1 course document visibility gate is missing');
const gate=new Function('courseMeta','doc',`const p1HiddenDocument74=doc=>{${fn[1]}\n};return p1HiddenDocument74(doc);`);
assert.equal(gate({id:'responsabilite_exercice_professionnel'},{url:old.url}),true,
 'Known unavailable provisional Drive PDF must not appear to students');
assert.equal(gate({id:'systeme_respiratoire'},{url:old.url}),false,
 'Visibility exception must remain scoped to the affected course');
console.log('PASS: historical entry preserved and unavailable provisional PDF hidden');
