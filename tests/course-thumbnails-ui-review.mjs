import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {createHash} from 'node:crypto';
import {execFileSync} from 'node:child_process';
const script=fs.readFileSync('course-thumbnails-v1.js','utf8');
const catalog=JSON.parse(fs.readFileSync('course-registry-v741.json','utf8')).courses;
const entries=JSON.parse(fs.readFileSync('docs/proposals/course-thumbnails-55-assets.json','utf8'));
const html=fs.readFileSync('index.html','utf8'),sw=fs.readFileSync('sw.js','utf8');
assert.ok(catalog.length>=55,'Les 55 cours historiques sont conservés');
assert.ok(entries.length>=55,'Les 55 vignettes historiques sont conservées');
const courseIds=new Set(catalog.map(c=>c.id));
assert.equal(courseIds.size,catalog.length);
assert.equal(new Set(entries.map(x=>x.path)).size,entries.length,'Un WebP distinct par ID');
assert.ok(entries.every(x=>courseIds.has(x.path.match(/\/([^/]+)\.webp$/)?.[1])),
  'Chaque visuel publié appartient au registre');
assert.equal(new Set(entries.map(x=>x.sha256)).size,entries.length);
for(const x of entries){
 const data=fs.readFileSync(x.path);
 assert.equal(data.length,x.length,'Size: '+x.path);
 assert.equal(createHash('sha256').update(data).digest('hex'),x.sha256,'SHA mismatch: '+x.path);
 assert.equal(data.toString('ascii',0,4),'RIFF');
 assert.equal(data.toString('ascii',8,12),'WEBP');
 assert.ok(sw.includes("'./"+x.path+"'"),'Offline cache missing: '+x.path);
}
assert.match(script,/loadManifest/);
assert.match(script,/picture.addEventListener/);
assert.match(script,/showPlaceholder/);
assert.doesNotMatch(script,/localStorage|Q\.push/);
assert.doesNotThrow(()=>new vm.Script(script));
const build=JSON.parse(fs.readFileSync('build-meta.json','utf8'));
assert.ok(html.includes('src="./course-thumbnails-v1.js?v='+build.build+'"'));
assert.ok(html.indexOf('course-navigation-ui-v2.js?v='+build.build)<
 html.indexOf('course-thumbnails-v1.js?v='+build.build));
assert.ok(sw.includes("'./course-thumbnails-v1.js'")&&sw.includes('"course-thumbnails-v1.js"'));
execFileSync(process.execPath,['tools/sync-course-thumbnails.mjs','--check'],{stdio:'pipe'});
console.log('PASS: manifest évolutif, images WebP SHA-256, cache PWA et registre.');
