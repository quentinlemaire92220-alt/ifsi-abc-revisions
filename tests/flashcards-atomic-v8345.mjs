import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(p,'utf8');
const meta=JSON.parse(read('build-meta.json'));
assert.match(meta.version,/^\d+\.\d+(?:\.\d+)?$/,'Version courante invalide');
assert.match(String(meta.build),/^\d+$/,'Build courant invalide');

const qs=[
 {id:'atomic_thermo',courseId:'x',course:'Test',theme:'Thermorégulation',difficulty:'medium',question:'Quelles associations mécanisme – exemple sont justes ?',choices:['Convection : vent qui éloigne l’air réchauffé au contact du corps.','Évaporation : départ de la sueur sous forme de vapeur.','Conduction : contact des mains avec un haltère froid.','Rayonnement : uniquement par contact direct.'],answers:[0,1,2],explanation:'Conduction = contact, convection = déplacement d’un fluide, évaporation = passage de l’eau en vapeur.'},
 {id:'atomic_ph',courseId:'x',course:'Test',theme:'Équilibre acido-basique',difficulty:'medium',question:'Quelles valeurs ou définitions correspondent au support ?',choices:['Le pH sanguin physiologique indiqué est de 7,38 à 7,42.','Un pH inférieur à 7 correspond à une solution acide.','Le pH 7 est neutre.','Le pH 10 est acide.'],answers:[0,1,2],explanation:'Repères de pH.'},
 {id:'atomic_temp',courseId:'x',course:'Test',theme:'Thermorégulation',difficulty:'easy',question:'Quelle valeur sert de consigne dans la boucle thermique de la diapo 31 ?',choices:['36,8 °C.','42 °C.'],answers:[0],explanation:'La consigne est proche de 36,8 °C.'},
 {id:'atomic_stomach',courseId:'x',course:'Test',theme:'Digestif',difficulty:'easy',question:"Quelle fonction est attribuée à l'estomac dans le support ?",choices:['Le broyage et la digestion des aliments','La filtration du sang'],answers:[0],explanation:"L'estomac assure broyage et digestion."}
];
const registry={courses:[{id:'x',label:'Test',ue:'B1'}]};
const window={IFSI_V741:{getRegistry:()=>registry,resourcesForCourse:()=>({questions:qs,sheets:[]})},IFSI_V79:{themeOf:q=>q.theme,difficultyOf:q=>q.difficulty}};
const context={window,localStorage:{getItem:()=>null,setItem:()=>{}},document:{getElementById:()=>null,querySelector:()=>null,querySelectorAll:()=>[]},setInterval:()=>0,clearInterval:()=>{},setTimeout:()=>0,clearTimeout:()=>{},scrollTo:()=>{},MutationObserver:class{observe(){}},console};
vm.createContext(context);vm.runInContext(read('v8338-flashcards.js'),context);
window.IFSI_V8338_FLASHCARDS.rebuild();
const deck=window.IFSI_V8338_FLASHCARDS.getDeck();
const fronts=deck.map(c=>c.front);
assert.ok(deck.filter(c=>c.qid==='atomic_thermo').length>=3,'Le QCM thermorégulation doit être scindé');
assert.ok(fronts.some(x=>/À quoi correspond .*Convection/i.test(x)),'Carte Convection absente');
assert.ok(fronts.some(x=>/À quoi correspond .*Évaporation/i.test(x)),'Carte Évaporation absente');
assert.ok(fronts.some(x=>/pH sanguin physiologique/i.test(x)),'Carte valeur pH absente');
assert.ok(fronts.some(x=>/pH inférieur à 7/i.test(x)),'Carte définition acidité absente');
assert.ok(fronts.some(x=>/pH de 7/i.test(x)),'Carte pH neutre absente');
assert.ok(fronts.some(x=>/boucle thermique/i.test(x)&&!/diapo/i.test(x)),'La référence à la diapo doit être retirée');
assert.ok(fronts.some(x=>/fonction de l'estomac/i.test(x)&&!/support/i.test(x)),'La fonction de l’estomac doit être autonome');
for(const f of fronts)assert.ok(!/support|diapo(?:sitive)?|sont justes|valeurs ou définitions correspondent/i.test(f),`Carte non autonome: ${f}`);
const mod=read('v8338-flashcards.js');
for(const token of ['atomicCards','atomicFromAnswers','answerPairAtom','answerSentenceAtom','selectCards'])assert.ok(mod.includes(token),`Moteur atomique incomplet: ${token}`);
const index=read('index.html'),sw=read('sw.js');
assert.ok(index.includes(`./v8345-changelog.js?v=${meta.build}`),'Changelog V8.30.45 absent de index.html');
assert.ok(sw.includes("'./v8345-changelog.js'"),'Changelog V8.30.45 absent du cache PWA');
console.log(`✅ V8.30.45 : ${deck.length} flashcards atomiques de test contrôlées`);
