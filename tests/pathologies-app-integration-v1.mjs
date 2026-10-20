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
assert.ok(engineCode.includes("if(!entries.length&&!shellEnabled)return;"),'open() must block only when public shell is not enabled');
assert.ok(engineCode.includes('function showShell()'),'Public information shell missing');
assert.ok(bootCode.includes('engine?.showShell?.()'),'No-catalog state must mount the information shell');
assert.ok(engineCode.includes('Contenu en cours de validation'),'Visible shell must disclose review status');
assert.ok(engineCode.includes('nav.classList.add('),'Approved-only navigation CSS not activated');
function mockedBrowser(){
 const elements={};const navButtons=[];
 const make=()=>({innerHTML:'',className:'',classList:{add(){},remove(){}},addEventListener(){},querySelectorAll(){return []},dataset:{}});
 const nav={classList:{add(){},remove(){}},appendChild(el){navButtons.push(el);elements[el.id]=el;}};
 const app={querySelector(selector){return selector==='nav'?nav:null},insertBefore(el){elements[el.id]=el;elements.ifsiPathologiesBody=make();},appendChild(el){this.insertBefore(el);}};
 const doc={head:{appendChild(){}},createElement:()=>make(),getElementById:id=>elements[id]||null,querySelector:selector=>selector==='.app'?app:null,querySelectorAll:selector=>selector==='.app > section'?[elements.ifsiPathologies].filter(Boolean):selector==='nav button'?navButtons:[]};
 return {doc,navButtons,elements};
}
const browser=mockedBrowser();
const publicShell=simulate({document:browser.doc,show(){}});
assert.equal(browser.navButtons.length,1,'Un onglet Pathologies doit être visible dans la coque publique');
assert.equal(browser.navButtons[0].id,'ifsiPathologiesNav');
assert.equal(publicShell.IFSI_PATHOLOGIES_BOOT.start().mounted,false,'Aucun contenu médical approuvé ne doit être activé');
publicShell.IFSI_PATHOLOGIES.open();
const placeholder=browser.elements.ifsiPathologiesBody.innerHTML;
for(const title of ['BPCO','Hypertension artérielle (HTA)','Diabète de type 2'])assert.ok(placeholder.includes(title),'Entrée non médicale absente : '+title);
assert.ok(placeholder.includes('en cours de validation médicale'),'Le statut médical non approuvé doit être explicite');
assert.ok(!placeholder.includes('Bonne réponse :'),'Aucun contenu QCM privé ne doit apparaître dans la coque');
assert.ok(!placeholder.includes('https://drive.google.com/file/d/'),'Aucun lien clinique privé ne doit être inséré');

console.log('✅ Onglet Pathologies public informatif : navigation visible, aucun cours médical non approuvé exposé et brouillons rejetés');
