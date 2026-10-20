import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const read=p=>fs.readFileSync(new URL('../'+p,import.meta.url),'utf8');
const navSrc=read('v87-settings.js');
const planSrc=read('planning-v1.js');
const pathoSrc=read('pathologies-module-v1.js');
const html=read('index.html');
const source=(s,a,b)=>{const i=s.indexOf(a),j=s.indexOf(b,i+1);assert.ok(i>=0&&j>i,'Fonction introuvable : '+a);return s.slice(i,j);};
assert.match(navSrc,/#v87Nav\{[^}]*grid-template-columns:repeat\(7,minmax\(0,1fr\)\)/,'v87 bottom bar must have seven columns');
assert.match(planSrc,/#v87Nav\.vplanning-nav\{grid-template-columns:repeat\(7,minmax\(0,1fr\)\)\}/,'Planning must not override with six columns');
assert.match(navSrc,/body\.v87-ready nav:not\(#v87Nav\)\{display:none!important\}/,'Real v87 nav must be identified as visible and base hidden');
assert.ok(pathoSrc.includes("byId('v87Pathologies')?.classList.add('on')"),'Selected state missing in Pathologies.open()');
assert.ok(navSrc.includes("if($('ifsiPathologies')&&!$('ifsiPathologies').classList.contains('hidden'))"),'v87 selected state must check visible pathology section');
assert.ok(!html.includes('IFSI_PATHOLOGIES_PUBLISHED_BUNDLE'),'Private medical catalog must remain absent in HTML');

const byId=new Map(), buttons=[],classes=new Set();let opened=0;
const nav={id:'v87Nav',dataset:{},classList:{add:c=>classes.add(c),remove:c=>classes.delete(c)},addEventListener(){},set innerHTML(markup){
 for(const match of markup.matchAll(/<button id="([^"]+)"[^>]*>/g)){
   const id=match[1],button={id,onclick:null,insertAdjacentElement(position,node){
    assert.equal(position,'afterend');buttons.splice(buttons.indexOf(this)+1,0,node);
   }};
   byId.set(id,button);buttons.push(button);
 }
 }};
const app={appendChild(el){byId.set(el.id,el)}};
const document={querySelector:q=>q==='.app'?app:null,createElement:tag=>tag==='nav'?nav:{id:'',innerHTML:'',onclick:null},getElementById:id=>byId.get(id)||null};
const $=id=>document.getElementById(id);
const window={IFSI_PATHOLOGIES:{open(){opened++}},show(){},showCourses74(){},IFSI_V82:{showAnatomy(){}},IFSI_V81:{showHub(){}}};
const context={document,window,$,NAV_ID:'vPlanningNav',showSettings(){},showPlanning(){},hidePlanning(){}};
vm.createContext(context);
vm.runInContext(source(navSrc,'function addNav(){','function hideSettings(){')+'; addNav();',context);
assert.deepEqual(buttons.map(b=>b.id),['v87Home','v87Courses','v87Anat','v87Center','v87Pathologies','v87Settings'],'v87 should render the real navigation');
buttons.find(b=>b.id==='v87Pathologies').onclick();
assert.equal(opened,1,'Pathologies nav click must open pathology section');
vm.runInContext(source(planSrc,'function addNav(){','function init(){')+';addNav();',context);
assert.deepEqual(buttons.map(b=>b.id),['v87Home','vPlanningNav','v87Courses','v87Anat','v87Center','v87Pathologies','v87Settings'],'Planning/Paramètres must remain and Pathologies must be reachable');
assert.equal(buttons.length,7,'Exactly seven buttons expected');
assert.ok(classes.has('vplanning-nav'),'Planning layout must be active');
console.log('✅ Navigation réellement visible v87 : Accueil, Planning, Cours, Anatomie, Révision, Pathologies, Paramètres');
