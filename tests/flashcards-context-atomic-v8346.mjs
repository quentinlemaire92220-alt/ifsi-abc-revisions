import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(p,'utf8');
const meta=JSON.parse(read('build-meta.json'));
assert.equal(meta.version,'8.30.47');
assert.equal(String(meta.build),'8347');

const qs=[
 {id:'muscle_pairs',courseId:'x',course:'Test',theme:'Tissu musculaire et contraction',difficulty:'medium',question:'Quelles associations sont correctes ?',choices:['Fins : actine','Épais : myosine','A : actine','C : myosine'],answers:[0,1,2,3],explanation:'Les myofilaments fins sont principalement constitués d’actine et les myofilaments épais de myosine.'}
];
const registry={courses:[{id:'x',label:'Test',ue:'B1'}]};
const window={IFSI_V741:{getRegistry:()=>registry,resourcesForCourse:()=>({questions:qs,sheets:[]})},IFSI_V79:{themeOf:q=>q.theme,difficultyOf:q=>q.difficulty}};
const context={window,localStorage:{getItem:()=>null,setItem:()=>{}},document:{getElementById:()=>null,querySelector:()=>null,querySelectorAll:()=>[]},setInterval:()=>0,clearInterval:()=>{},setTimeout:()=>0,clearTimeout:()=>{},scrollTo:()=>{},MutationObserver:class{observe(){}},console};
vm.createContext(context);vm.runInContext(read('v8338-flashcards.js'),context);
window.IFSI_V8338_FLASHCARDS.rebuild();
const deck=window.IFSI_V8338_FLASHCARDS.getDeck();
const fronts=deck.map(c=>c.front);
assert.ok(fronts.some(x=>/myofilaments fins/i.test(x)),'Question contextualisée sur les myofilaments fins absente');
assert.ok(fronts.some(x=>/myofilaments épais/i.test(x)),'Question contextualisée sur les myofilaments épais absente');
assert.ok(!fronts.some(x=>/«\s*[AC]\s*»/i.test(x)),'Les repères A/C ne doivent jamais être affichés seuls');
assert.ok(!fronts.some(x=>/^À quoi correspond\s+«\s*(?:Fins|Épais)\s*»/i.test(x)),'Fins/Épais ne doivent pas être affichés sans contexte');
console.log('✅ V8.30.46 : associations atomiques contextualisées');
