import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
const html=read('index.html');
const sw=read('sw.js');
const engineCode=read('pathologies-module-v1.js');
const bootCode=read('pathologies-boot-v1.js');

const e='<script src="./pathologies-module-v1.js?v=8404"></script>';
const b='<script src="./pathologies-boot-v1.js?v=8404"></script>';
assert.ok(html.includes(e),'Engine script is not loaded in app');
assert.ok(html.includes(b),'Approved-only bootstrap not loaded');
assert.ok(html.indexOf(e)<html.indexOf(b),'Engine must load before bootstrap');
assert.equal((html.match(/pathologies-module-v1\.js\?v=8404/g)||[]).length,1,'Engine loaded twice');
assert.equal((html.match(/pathologies-boot-v1\.js\?v=8404/g)||[]).length,1,'Bootstrap loaded twice');
assert.ok(sw.includes("'./pathologies-module-v1.js'")&&sw.includes("'./pathologies-boot-v1.js'"),'PWA does not precache the shell');
assert.ok(!html.includes('IFSI_PATHOLOGIES_PUBLISHED_BUNDLE'),'Clinical content accidentally assigned in HTML');
assert.ok(!sw.includes('IFSI_PATHOLOGIES_PUBLISHED_BUNDLE'),'Clinical content accidentally assigned in service worker');
assert.ok(!html.includes('ifsiPathologiesNav'),'Navigation must not exist before medical approval');
assert.ok(!html.includes('bpco_pilote')&&!html.includes('dt2_pilote')&&!html.includes('hta_pilote'),'Private clinical fixtures leaked');

function simulate(initial={}){
 const root={...initial};const context={window:root,console};vm.createContext(context);vm.runInContext(engineCode,context);vm.runInContext(bootCode,context);return root;
}
const noData=simulate();
assert.ok(noData.IFSI_PATHOLOGIES_BOOT,'Bootstrap API missing');
assert.equal(noData.IFSI_PATHOLOGIES_BOOT.start().mounted,false,'Missing catalog should not mount');
assert.equal(noData.IFSI_PATHOLOGIES_BOOT.start().reason,'no_published_catalog','Invalid no-catalog reason');
assert.doesNotThrow(()=>noData.IFSI_PATHOLOGIES.open(),'Cannot try opening before release');
const rejected=simulate({IFSI_PATHOLOGIES_PUBLISHED_BUNDLE:[{id:'bpco',title:'Unapproved private draft'}]});
assert.equal(rejected.IFSI_PATHOLOGIES_BOOT.start().mounted,false,'Unapproved clinical draft must not mount');
assert.equal(rejected.IFSI_PATHOLOGIES_BOOT.start().reason,'catalog_rejected','Unapproved clinical draft should be rejected by engine');
const malformed=simulate({IFSI_PATHOLOGIES_PUBLISHED_BUNDLE:{id:'bpco'}});
assert.equal(malformed.IFSI_PATHOLOGIES_BOOT.start().mounted,false,'Malformed bundle must not mount');
assert.ok(engineCode.includes("if(!entries.length)return;"),'open() missing no-content guard');
assert.ok(engineCode.includes('nav.classList.add('),'Approved-only navigation CSS not activated');
console.log('✅ Coque Pathologies montée sans catalogue : aucun onglet et aucune donnée clinique exposés ; brouillons rejetés');
