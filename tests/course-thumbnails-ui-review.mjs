import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
const script=fs.readFileSync('course-thumbnails-v1.js','utf8');
const catalog=JSON.parse(fs.readFileSync('course-registry-v741.json','utf8')).courses;
const entries=JSON.parse(fs.readFileSync('docs/proposals/course-thumbnails-55-assets.json','utf8'));
const html=fs.readFileSync('index.html','utf8'),sw=fs.readFileSync('sw.js','utf8');
assert.equal(catalog.length,55);assert.equal(entries.length,55);
const ids=new Set([...script.matchAll(/"([a-z0-9_]+)"/g)].map(x=>x[1]).filter(id=>catalog.some(c=>c.id===id)));
assert.deepEqual(ids,new Set(catalog.map(c=>c.id)));
assert.deepEqual(new Set(entries.map(x=>x.path)),new Set(catalog.map(c=>'assets/course-thumbnails/'+c.id+'.webp')));
assert.equal(new Set(entries.map(x=>x.sha256)).size,55);
for(const x of entries){
 const data=fs.readFileSync(x.path);
 assert.equal(data.length,x.length,'Size: '+x.path);
 assert.equal(createHash('sha256').update(data).digest('hex'),x.sha256,'SHA mismatch: '+x.path);
 assert.equal(data.toString('ascii',0,4),'RIFF');
 assert.equal(data.toString('ascii',8,12),'WEBP');
 assert.ok(sw.includes("'./"+x.path+"'"),'Offline cache missing: '+x.path);
}
assert.match(script,/thumbFor/);assert.match(script,/picture.addEventListener/);assert.match(script,/fallback/);
assert.doesNotMatch(script,/localStorage|Q\.push|fetch\(/);
assert.doesNotThrow(()=>new vm.Script(script));
assert.ok(html.includes('src="./course-thumbnails-v1.js?v=8438"'));
assert.ok(html.indexOf('course-navigation-ui-v2.js?v=8438')<html.indexOf('course-thumbnails-v1.js?v=8438'));
assert.ok(sw.includes("'./course-thumbnails-v1.js'")&&sw.includes('"course-thumbnails-v1.js"'));
assert.equal(JSON.parse(fs.readFileSync('build-meta.json','utf8')).version,'8.30.138');
console.log('PASS: 55 assets WebP SHA-256, mapping et cache PWA.');
