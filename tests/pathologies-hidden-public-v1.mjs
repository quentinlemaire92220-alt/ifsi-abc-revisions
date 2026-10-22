import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const config=read('app-features-v1.js');
const root={};vm.runInNewContext(config,{window:root});
assert.equal(root.IFSI_APP_FEATURES.pathologies,false);
assert.ok(Object.isFrozen(root.IFSI_APP_FEATURES));
const html=read('index.html'),sw=read('sw.js');
assert.ok(html.indexOf('app-features-v1.js')<html.indexOf('v82-nav-anatomy.js'));
assert.ok(sw.includes("'./app-features-v1.js'"));

// Execute the actual home renderer in both states, including repeated refreshes.
const home=read('v82-nav-anatomy.js');
const hierarchy=home.slice(home.indexOf('function hierarchy(){'),home.indexOf('function links(){'));
for(const enabled of [false,true]){
 const elements=new Map();let markup='',opened=0,courses=0,anatomy=0,revision=0;
 const panel={set innerHTML(value){markup=value;for(const id of ['v82Continue','v82Courses','v82Anat','v82Center','v82Pathologies'])elements.delete(id);for(const [,id] of value.matchAll(/id="([^"]+)"/g))elements.set(id,{});}};
 elements.set('v82Primary',panel);elements.set('v76Home',{querySelector(){return null;}});
 const window={IFSI_APP_FEATURES:{pathologies:enabled},IFSI_PATHOLOGIES:{open(){opened++;}},showCourses74(){courses++;},IFSI_V81:{showHub(){revision++;}}};
 const ctx={window,$:id=>elements.get(id),V:'test',hasResume:()=>false,primaryAction(){},showAnatomy(){anatomy++;}};
 vm.createContext(ctx);vm.runInContext(hierarchy+';hierarchy();hierarchy();',ctx);
 assert.equal(markup.includes('id="v82Pathologies"'),enabled);
 for(const id of ['v82Courses','v82Anat','v82Center'])elements.get(id).onclick();
 elements.get('v82Pathologies')?.onclick();
 assert.deepEqual([courses,anatomy,revision,opened],[1,1,1,enabled?1:0]);
}

// A returning private session and an old URL must not load/sync/upload when hidden.
// Use throwing storage/network mocks: neither tokens nor existing packs are touched.
const fail=()=>{throw Error('Hidden Pathologies attempted storage/network/navigation');};
const hidden={document:{},IFSI_APP_FEATURES:root.IFSI_APP_FEATURES,location:{hash:'#pathologies'},localStorage:{getItem:fail,setItem:fail,removeItem:fail},IFSI_PATHOLOGIES:{open:fail,showCatalog:fail}};
for(const p of ['pathologies-private-review-v1.js','pathologies-cloud-private-v1.js']){
 vm.runInNewContext(read(p),{window:hidden,fetch:fail,indexedDB:{open:fail},console,URL});
}
await Promise.resolve();await Promise.resolve();
assert.equal(hidden.location.hash,'#pathologies');
assert.ok(hidden.IFSI_PATHOLOGIES_REVIEW&&hidden.IFSI_PATHOLOGIES_CLOUD,'Private resources/APIs preserved');
console.log('✅ Pathologies masqué : accueil, accès directs, retour privé sans I/O ; réactivation et autres raccourcis testés');
