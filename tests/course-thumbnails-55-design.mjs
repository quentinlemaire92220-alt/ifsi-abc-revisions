import fs from 'node:fs';
import assert from 'node:assert/strict';
const reg=JSON.parse(fs.readFileSync('course-registry-v741.json','utf8')).courses;
const inv=JSON.parse(fs.readFileSync('docs/proposals/course-thumbnails-55-inventory.json','utf8'));
assert.equal(reg.length,56);assert.equal(reg.filter(c=>c.id==='theorie_gestion_symptomes_td').length,1);const historical=reg.filter(c=>c.id!=='theorie_gestion_symptomes_td');assert.equal(historical.length,55);assert.equal(inv.status,'INTEGRATED');assert.equal(inv.items.length,55);
assert.deepEqual(new Set(inv.items.map(x=>x.courseId)),new Set(historical.map(x=>x.id)));
assert.equal(new Set(inv.items.map(x=>x.targetAsset)).size,55);
assert.equal(new Set(inv.items.map(x=>x.motif)).size,55);
for(const x of inv.items){assert.equal(x.productionStatus,'integrated_v7_20261026');assert.equal(x.targetAsset,'assets/course-thumbnails/'+x.courseId+'.webp');}
console.log('PASS: 55 cours couverts par les vignettes V7.');
