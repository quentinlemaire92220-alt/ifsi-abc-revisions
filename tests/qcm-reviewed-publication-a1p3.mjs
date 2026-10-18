// Contrat de publication du lot A1 partie 03 examiné en privé.
// Empreinte des 9 QCM (questions/choix/réponses/corrigés), pas celle de toute la banque.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const m=read('docs/course-deliveries.json');
const approval=m.supplementalResourceApprovals?.find(x=>x.courseId==='epistemologie_savoirs'&&x.partId==='a1-p03'&&x.resourcePath==='qextra-12.txt');
assert.ok(approval,'Approbation scoped A1-P03 absente');
const a=approval.publicationApproval;
assert.equal(a.status,'approved');
assert.equal(a.authorization,'explicit_go_publication');
assert.equal(a.scope,'reviewed_qcm_corrections');
assert.ok(Number.isFinite(Date.parse(a.approvedAt)));
assert.equal(approval.reviewedItemCount,9);
assert.equal(approval.editedFieldCount,10);
const ids=approval.reviewedItemIds;
assert.equal(new Set(ids).size,9,'Identifiant approuvé dupliqué');
const source=read('qextra-12.txt');
const byId=new Map(source.map(q=>[q.id,q]));
const proj=ids.map(id=>{
  const q=byId.get(id);
  assert.ok(q,'Question approuvée absente : '+id);
  return Object.fromEntries(['id','question','choices','answers','explanation'].map(key=>[key,q[key]]));
}).sort((x,y)=>x.id.localeCompare(y.id,'en'));
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().map(k=>[k,canonical(v[k])])):v;
const digest=createHash('sha256').update(JSON.stringify(canonical(proj))).digest('hex');
assert.equal(digest,a.bundleSha256,'Lot publié différent du dossier privé validé ; nouveau GO nécessaire');
assert.equal(a.bundleSha256,'e335116210035a6d3189e0a4d90ddd4bf75472a484a5fc0fc43bcd498a09d262');
const expectedAnswers={
 v820_a1p3_005:[2,3],v820_a1p3_012:[1,2,3],v820_a1p3_014:[3],
 v820_a1p3_018:[0,1],v820_a1p3_019:[2],v820_a1p3_022:[0],
 v820_a1p3_024:[4],v820_a1p3_028:[0,1,2,3],v820_a1p3_030:[4]
};
for(const q of proj){
 assert.equal(q.choices.length,5,q.id+': nombre de choix modifié');
 assert.deepEqual(q.answers,expectedAnswers[q.id],q.id+': correction altérée');
 assert.ok(![q.question,...q.choices,q.explanation].some(s=>/CM3\\s*[•·]|Niveaux d.abstraction et utilit[ée]/i.test(s)),q.id+': résidu PDF');
}
assert.equal(byId.get('v820_a1p3_019').question,'Dans une théorie infirmière, quels éléments sont reliés entre eux par des propositions ?');
assert.deepEqual(approval.reviewFingerprintSha256s,{
 qcmPreview:'4cb0c41b73cd5f107a20275553fc152085e60c3fc81eeae59aba3f5f0f0ab76a',
 flashcardsPreview:'62ba2d7ba63f6a4579156f1d350e6386c7c243e201e0c541b6496152e57febf4',
 pdfReview:'d577f365c2ab8ba2351807f453008ba4e3bb0f5c918b96dcfca0ed1727435c02'
});
console.log('✅ A1-P03 : 9 QCM, 10 corrections approuvées, SHA256 inchangé, réponses et 5 choix préservés.');
