// Préflight ciblé du candidat UE B2 S1 : aucune activation des ressources.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';

const root='docs/proposals/psychologie-sante-20261027/';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const qs=read(root+'qcm-runtime-candidate.json');
const ds=read(root+'flashcards-59-candidate.json');
const meta=read(root+'manifest.json');
const signature=(arr,keys)=>createHash('sha256').update(JSON.stringify(arr.map(o=>keys.map(k=>o[k])))).digest('hex');
assert.equal(meta.courseId,'psychologie_sante');
assert.equal(meta.state,'draft_branch_not_student_visible');
assert.equal(meta.authorizedGitHubMergeGo,false);
assert.equal(qs.length,50);
assert.equal(ds.length,59);
assert.equal(new Set(qs.map(q=>q.id)).size,50);
assert.equal(new Set(ds.map(d=>d.id)).size,59);
for(let i=0;i<qs.length;i++){
  const q=qs[i];
  assert.equal(q.courseId,'psychologie_sante');
  assert.equal(q.number,i+1);
  assert.deepEqual(q.choices.length,5);
  assert.ok(q.choices.every(x=>typeof x==='string'&&x.trim()));
  assert.ok(Array.isArray(q.answers)&&q.answers.length>=1&&q.answers.length<=3);
  assert.equal(new Set(q.answers).size,q.answers.length);
  assert.ok(q.answers.every(x=>Number.isInteger(x)&&x>=0&&x<5));
  assert.equal(q.announcedCorrectCount,q.answers.length);
  assert.ok(['easy','medium','hard'].includes(q.difficulty));
  assert.ok(q.explanation?.trim().length>=25);
}
for(let i=0;i<ds.length;i++){
  const d=ds[i];
  assert.equal(d.courseId,'psychologie_sante');
  assert.equal(d.id,'psychologie_sante_p01_f'+String(i+1).padStart(3,'0'));
  assert.ok(d.front&&d.back&&d.term);
  assert.equal(d.definition,d.back);
}
assert.equal(ds[33].term,'Angoisse');
assert.ok(ds[33].back.startsWith('L’angoisse est une peur sans objet'));
assert.deepEqual(qs.reduce((a,q)=>(a[q.answers.length]=(a[q.answers.length]||0)+1,a),{}),{'2':2,'3':48});
assert.equal(signature(qs,['id','question','choices','answers','explanation']),'39989b0f77a43aa9dbcb90a3ac7f8c26a5f6114149f5f8e0be5d7f9500c0adae');
assert.equal(signature(ds,['id','term','front','back']),'7f017030d0d7d0468245ff4121d747f3898553cec1b82d2fbadd4565ebcdee1c');
assert.equal(meta.assets.sheet.pages,18);
assert.equal(meta.assets.qcm.pages,21);
assert.equal(meta.assets.flashcards.pages,13);
const reg=read('course-registry-v741.json').courses;
assert.equal(reg.filter(c=>c.id==='psychologie_sante').length,1);
const oldVocals=read('vocals.json').filter(v=>v.courseId==='psychologie_sante');
assert.equal(oldVocals.length,2,'Les deux anciens vocaux doivent être conservés');
console.log('PASS candidat Psychologie : 50 QCM, 59 définitions, 2 vocaux historiques préservés');
