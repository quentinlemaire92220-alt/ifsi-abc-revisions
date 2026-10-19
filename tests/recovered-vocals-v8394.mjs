import fs from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {validateAudioSupplements} from './audio-supplement-contract.mjs';
const read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const vocals=read('vocals.json'),manifest=read('docs/course-deliveries.json'),registry=read('course-registry-v741.json');
const supplements=validateAudioSupplements(manifest,{registry,vocals});
const expected=['locomoteur_legacy_01','locomoteur_legacy_02','virus_legacy_01','virus_legacy_02','virus_legacy_03'];
assert.deepEqual([...supplements.keys()].sort(),[...expected].sort());
assert.equal(vocals.length,80);
const original=vocals.filter(v=>!expected.includes(v.id));
assert.equal(original.length,75);
assert.equal(createHash('sha256').update(JSON.stringify(original)).digest('hex'),'feab05ae2850878be2c0d3f21c1bf8ec1b0c5f2249579cc75b49ae0f5f66211b','Les 75 vocaux précédents ont changé');
assert.equal(new Set(vocals.map(v=>v.driveId)).size,80);
for(const [id,count] of [['appareil_locomoteur',2],['virus',3]]){
 const course=registry.courses.find(c=>c.id===id),items=vocals.filter(v=>v.courseId===id);
 assert.equal(items.length,count);assert.equal(course.audioCount,count);
 assert.equal(course.audioStatus,'available');
 assert.equal(course.audioFolderUrl,'https://drive.google.com/drive/folders/'+manifest.audioSupplements.find(s=>s.courseId===id).folderId);
}
assert.ok(fs.readFileSync('vocals-v73.js','utf8').includes('Number.isFinite(x.durationSeconds)'),'Durées non affichées');
assert.ok(!fs.readFileSync('vocals.json','utf8').includes('staging_'));
console.log('✅ V8.30.94 : 80 vocaux, 5 ajouts autorisés, 75 anciens préservés et durées visibles');

