import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read=path=>fs.readFileSync(new URL('../'+path,import.meta.url),'utf8');
const html=read('index.html');
const sw=read('sw.js');
const engineCode=read('pathologies-module-v1.js');
const bootCode=read('pathologies-boot-v1.js');

const e='<script src="./pathologies-module-v1.js?v=8405"></script>';
const b='<script src="./pathologies-boot-v1.js?v=8405"></script>';
assert.ok(html.includes(e),'Engine script is not loaded in app');
assert.ok(html.includes(b),'Approved-only bootstrap not loaded');
assert.ok(html.indexOf(e)<html.indexOf(b),'Engine must load before bootstrap');
assert.equal((html.match(/pathologies-module-v1\.js\?v=8405/g)||[]).length,1,'Engine loaded twice');
assert.equal((html.match(/pathologies-boot-v1\.js\?v=8405/g)||[]).length,1,'Bootstrap loaded twice');
assert.ok(sw.includes("'./pathologies-module-v1.js'")&&sw.includes("'./pathologies-boot-v1.js'"),'PWA does not precache the shell');
assert.ok(!html.includes('IFSI_PATHOLOGIES_PUBLISHED_BUNDLE'),'Clinical content accidentally assigned in HTML');
assert.ok(!sw.includes('IFSI_PATHOLOGIES_PUBLISHED_BUNDLE'),'Clinical content accidentally assigned in service worker');
const navMarkup=(html.match(/<nav>[\s\S]*?<\/nav>/)||[])[0]||'';
assert.ok(navMarkup.includes('id="ifsiPathologiesNav"'),'Le sixième onglet doit exister directement dans le HTML');
assert.equal((navMarkup.match(/<button\b/g)||[]).length,6,'La barre doit contenir exactement six boutons');
assert.ok(navMarkup.includes('window.IFSI_PATHOLOGIES?.open()'),'Le bouton public doit ouvrir la coque Pathologies');
assert.ok(html.includes('grid-template-columns:repeat(6,minmax(0,1fr))'),'La barre doit réserver six emplacements');
const homeNav=read('v82-nav-anatomy.js');
assert.ok(homeNav.includes('id="v82Pathologies"'),'Accès Pathologies manquant de la page d’accueil');
assert.ok(homeNav.includes("window.IFSI_PATHOLOGIES?.open?.()"),'Accès accueil non câblé');
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
 const elements={};const navButtons=[];const navClasses=new Set();
 const make=()=>{const el={_html:'',className:'',classList:{add(){},remove(){}},addEventListener(){},querySelectorAll(){return []},dataset:{}};Object.defineProperty(el,'innerHTML',{get(){return this._html},set(v){this._html=v;for(const m of String(v).matchAll(/id="([^"]+)"/g)){if(!elements[m[1]])elements[m[1]]=make();}}});return el;};
 const nav={classList:{add(v){navClasses.add(v)},remove(v){navClasses.delete(v)}},appendChild(el){navButtons.push(el);elements[el.id]=el;}};
 const existing=make();existing.id='ifsiPathologiesNav';elements[existing.id]=existing;navButtons.push(existing);
 const app={querySelector(selector){return selector==='nav'?nav:null},insertBefore(el){elements[el.id]=el;elements.ifsiPathologiesBody=make();},appendChild(el){this.insertBefore(el);}};
 const doc={head:{appendChild(){}},createElement:()=>make(),getElementById:id=>elements[id]||null,querySelector:selector=>selector==='.app'?app:null,querySelectorAll:selector=>selector==='.app > section'?[elements.ifsiPathologies].filter(Boolean):selector==='nav button'?navButtons:[]};
 return {doc,navButtons,elements,navClasses};
}
const browser=mockedBrowser();
const publicShell=simulate({document:browser.doc,show(){}});
assert.equal(browser.navButtons.length,1,'Un onglet Pathologies doit être visible dans la coque publique');
assert.equal(browser.navButtons[0].id,'ifsiPathologiesNav');
assert.ok(browser.navClasses.has('ifsi-pathologies-ready'),'La coque doit appliquer la grille de six colonnes sur le bouton statique');
assert.equal(publicShell.IFSI_PATHOLOGIES_BOOT.start().mounted,false,'Aucun contenu médical approuvé ne doit être activé');
publicShell.IFSI_PATHOLOGIES.open();
const placeholder=browser.elements.ifsiPathologiesBody.innerHTML;
assert.ok(placeholder.includes('id="pathoResults"'),'Catalogue Pathologies non créé');
const overview=browser.elements.pathoResults.innerHTML;
for(const title of ['BPCO','Hypertension artérielle (HTA)','Diabète de type 2'])assert.ok(overview.includes(title),'Entrée non médicale absente : '+title);
assert.equal((overview.match(/<details class="patho-group"/g)||[]).length,3,'Les trois volets systèmes doivent être déroulants');
assert.ok(!overview.includes('data-patho-course'),'Aucun clic de pathologie ne doit ouvrir directement un cours');
assert.ok(overview.includes('En cours de validation médicale'),'Le statut médical non approuvé doit être explicite');
assert.ok(!placeholder.includes('Bonne réponse :'),'Aucun contenu QCM privé ne doit apparaître dans la coque');
assert.ok(!placeholder.includes('https://drive.google.com/file/d/'),'Aucun lien clinique privé ne doit être inséré');

console.log('✅ Onglet Pathologies public informatif : navigation visible, aucun cours médical non approuvé exposé et brouillons rejetés');
