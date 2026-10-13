import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const raw=read('math-cases-10-v1.json'),pack=JSON.parse(raw);
const digest=createHash('sha256').update(raw).digest('hex');
assert.equal(digest,'b563b952974dd79a872d5f61e2b09887dc3f1db819932e23915dcd53523d981c','Le lot de calculs ne correspond plus à sa version validée');
assert.equal(pack.cases.length,10);
const fields=pack.cases.flatMap(c=>c.questions.flatMap(q=>q.fields));
assert.equal(fields.length,35);
assert.equal(new Set(fields.map(f=>f.id)).size,35);
for(const c of pack.cases){assert.ok(c.title&&c.situation&&c.prescription?.length&&c.materials?.length);
 for(const q of c.questions)for(const f of q.fields)assert.ok(f.unit&&f.hint&&f.formula&&f.method&&f.explanation);
}
assert.ok(read('sw.js').includes("'./math-cases-10-v1.json'"),'Cache hors ligne incomplet');
console.log('10 exercices, 35 réponses et empreinte vérifiés');
