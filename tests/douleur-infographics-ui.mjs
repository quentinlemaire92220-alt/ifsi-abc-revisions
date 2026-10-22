import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const html=fs.readFileSync('index.html','utf8');
const start=html.indexOf('function infoUe(x)');
const end=html.indexOf('function showInfographics()',start);
assert.ok(start>=0&&end>start,'Infography render functions not found');
const old={courseId:'douleur',ue:'S1 B3',title:'UE_S1_B1_Douleur_Partie01_Infographie_01_Definition_Mecanismes_Circuit.pdf',
 displayTitle:'Définition, mécanismes et circuit',url:'https://drive.google.com/file/d/OLD/view'};
const published={courseId:'douleur',ue:'S1 B3.3',
 title:'UE_B3_3_S1_Douleur_16_Planches_Infographiees_20261022.pdf',
 displayTitle:'Prise en charge de la douleur — 16 planches infographiées',
 url:'https://drive.google.com/file/d/1BBl2PdTj8msoUsMBj6JtN6aS8DA66m9u/view',pageCount:16};
const dom={infoUe:{options:[],value:'S1 B3.3',innerHTML:''},
 infoSearch:{value:'Douleur'},infoCount:{textContent:''},infoList:{innerHTML:''}};
const context={I:[old,published],$:(key)=>dom[key],uniq:x=>[...new Set(x)],window:{}};
const api=vm.runInNewContext(html.slice(start,end)+';({infoUe,infoLabel,renderInfographics})',context);
assert.equal(api.infoUe(published),'S1 B3.3','New pack classified from explicit UE');
assert.equal(api.infoLabel(published),published.displayTitle,'Title must be the human-friendly displayTitle');
assert.equal(api.infoUe(old),'S1 B3','Legacy B1 filename must not override actual UE');
assert.equal(api.infoUe('UE_B3_3_S1_Douleur_16_Planches.pdf'),'S1 B3.3','New filename compatible');
assert.equal(api.infoUe('UE_S1_B1_Douleur.pdf'),'S1 B1','Legacy fallback compatible');
api.renderInfographics();
assert.equal(dom.infoCount.textContent,1,'UE B3.3 + Douleur should show exactly one pack');
assert.ok(dom.infoList.innerHTML.includes('Prise en charge de la douleur — 16 planches infographiées'));
assert.ok(dom.infoList.innerHTML.includes(published.url),'PDF link must be exactly the published Drive URL');
assert.ok(dom.infoList.innerHTML.includes('S1 B3.3'),'UE badge should be corrected');
assert.ok(!dom.infoList.innerHTML.includes('UE B3 3 S1 Douleur 16 Planches'),'Raw filename should not be displayed');
dom.infoUe.value='S1 B3';dom.infoSearch.value='Douleur';
api.renderInfographics();
assert.equal(dom.infoCount.textContent,1,'Legacy infographics remain accessible under their declared UE');
assert.ok(dom.infoList.innerHTML.includes('Définition, mécanismes et circuit'));
dom.infoUe.value='Toutes les UE';dom.infoSearch.value='codéine';
api.renderInfographics();
assert.equal(dom.infoCount.textContent,0,'Search should not fabricate resources');
dom.infoSearch.value='16 planches';
api.renderInfographics();
assert.equal(dom.infoCount.textContent,1,'Search on displayTitle works');
console.log('PASS : accessibilité de la carte Douleur, titre, filtre UE B3.3 et anciennes infographies préservés.');
