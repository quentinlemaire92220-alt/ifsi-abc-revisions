import fs from 'node:fs';
import assert from 'node:assert/strict';
const reg=JSON.parse(fs.readFileSync('course-registry-v741.json','utf8')).courses;
const inv=JSON.parse(fs.readFileSync('docs/proposals/course-thumbnails-55-inventory.json','utf8'));
assert.ok(reg.length>=55,'Les 55 cours historiques sont conservés');
assert.equal(inv.status,'INTEGRATED');assert.equal(inv.items.length,55);
const ids=new Set(reg.map(x=>x.id));
assert.ok(inv.items.every(x=>ids.has(x.courseId)),'Le lot historique de vignettes reste enregistré');
assert.equal(new Set(inv.items.map(x=>x.targetAsset)).size,55);
assert.equal(new Set(inv.items.map(x=>x.motif)).size,55);
for(const x of inv.items){
 assert.equal(x.productionStatus,'integrated_v7_20261026');
 assert.equal(x.targetAsset,'assets/course-thumbnails/'+x.courseId+'.webp');
}
console.log('PASS : les 55 vignettes historiques sont conservées, sans bloquer un nouveau cours.');
