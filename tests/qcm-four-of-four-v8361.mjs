import fs from 'node:fs';
import zlib from 'node:zlib';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const src=fs.readFileSync('sw.js','utf8'),tnr=fs.readFileSync('tests/tnr-node.mjs','utf8');
const context={self:{addEventListener(){}},console};vm.createContext(context);vm.runInContext(src,context);
const norm=context.normalizeMaxThreeAnswers,validate=context.validateQuestion;
assert.equal(typeof norm,'function');assert.equal(typeof validate,'function');
const sourceIds=[...tnr.matchAll(/qextra-0[2347]\.txt:[a-z_]+_\d+/g)].map(x=>x[0]);
assert.equal(new Set(sourceIds).size,53,'Les 53 QCM historiques ne sont pas tous référencés');
let checked=0;
for(const n of [2,3,4,7]){
 const name='qextra-'+String(n).padStart(2,'0')+'.txt';
 const raw=fs.readFileSync(name,'utf8').trim();
 const list=JSON.parse(zlib.gunzipSync(Buffer.from(raw,'base64')).toString('utf8'));
 for(const q of list.filter(x=>sourceIds.includes(name+':'+x.id))){
  assert.equal(q.choices.length,4,q.id);assert.equal(q.answers.length,4,q.id);
  const converted=norm(q);assert.equal(converted.answers.length,1,q.id);
  assert.equal(converted.choices.length,5,q.id);assert.ok(validate(converted,name),q.id);
  assert.ok(converted.explanation.includes(q.explanation),q.id);
  assert.ok(converted.choices[converted.answers[0]].includes('aucune fausse'),q.id);
  assert.deepEqual(q.answers,[0,1,2,3],q.id);
  checked++;
 }
}
assert.equal(checked,53,'Toutes les questions 4/4 ne sont pas réintégrées');
assert.ok(src.includes('validQuestions((await decodePack(name)).map(fixKnownContent),name)'), 'Le Service Worker doit normaliser AVANT de filtrer');
console.log('✅ '+checked+' QCM historiques réintégrés avec une seule combinaison correcte, sans altérer les énoncés médicaux');
