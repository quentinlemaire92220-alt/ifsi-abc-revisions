import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const read=p=>fs.readFileSync(p,'utf8');
const meta=JSON.parse(read('build-meta.json'));
assert.equal(meta.version,'8.30.48');
assert.equal(String(meta.build),'8348');

const qs=[
 {id:'calcium_case',courseId:'x',course:'Test',theme:'Minéraux, oligoéléments et vitamines',difficulty:'easy',question:'Concernant le calcium ?',choices:['environ 99 % se trouve dans les os','il participe à la coagulation','il est absent du squelette'],answers:[0,1],explanation:'Environ 99 % du calcium de l’organisme est stocké dans les os et les dents. Le calcium intervient aussi dans la coagulation sanguine.'},
 {id:'potassium_case',courseId:'x',course:'Test',theme:'Minéraux, oligoéléments et vitamines',difficulty:'easy',question:'Le potassium ?',choices:['est le principal cation intracellulaire','il participe à la conduction nerveuse','il est stocké à 99 % dans les os'],answers:[0,1],explanation:'Le potassium est le principal cation intracellulaire et participe notamment à l’excitabilité neuromusculaire.'},
 {id:'transcription_case',courseId:'x',course:'Test',theme:'ADN, ARN et expression génétique',difficulty:'easy',question:'La transcription correspond :',choices:["à la copie d'une information d'ADN en ARN messager","au passage de l'information de l'ADN vers l'ARNm",'à la synthèse directe d’une protéine'],answers:[0,1],explanation:'La transcription est le processus par lequel l’information portée par une séquence d’ADN est copiée sous forme d’ARN, notamment d’ARN messager.'},
 {id:'translation_case',courseId:'x',course:'Test',theme:'ADN, ARN et expression génétique',difficulty:'easy',question:'La traduction correspond :',choices:['à la synthèse d’une protéine à partir d’un ARNm','à la duplication de l’ADN'],answers:[0],explanation:'La traduction correspond à la synthèse d’une protéine à partir de l’information portée par un ARNm.'},
 {id:'tissues_case',courseId:'x',course:'Test',theme:'Tissus et peau',difficulty:'medium',question:'Quelles sont les quatre grandes classes de tissus ?',choices:['Épithélial','Conjonctif','Nerveux et musculaire','Osseux uniquement'],answers:[0,1,2],explanation:'Les tissus de l’organisme sont classés en quatre grandes familles : épithélial, conjonctif, musculaire et nerveux.'}
];
const registry={courses:[{id:'x',label:'Test',ue:'B1'}]};
const window={IFSI_V741:{getRegistry:()=>registry,resourcesForCourse:()=>({questions:qs,sheets:[]})},IFSI_V79:{themeOf:q=>q.theme,difficultyOf:q=>q.difficulty}};
const context={window,localStorage:{getItem:()=>null,setItem:()=>{}},document:{getElementById:()=>null,querySelector:()=>null,querySelectorAll:()=>[]},setInterval:()=>0,clearInterval:()=>{},setTimeout:()=>0,clearTimeout:()=>{},scrollTo:()=>{},MutationObserver:class{observe(){}},console};
vm.createContext(context);vm.runInContext(read('v8338-flashcards.js'),context);
window.IFSI_V8338_FLASHCARDS.rebuild();
const deck=window.IFSI_V8338_FLASHCARDS.getDeck();
const byQ=id=>deck.filter(c=>c.qid===id);

assert.ok(byQ('calcium_case').length>=2,'Le calcium doit être éclaté en plusieurs cartes précises');
assert.ok(byQ('calcium_case').some(c=>/99 % du calcium/i.test(c.front)),'Carte de localisation du calcium absente');
assert.ok(byQ('calcium_case').some(c=>/processus physiologique.*calcium/i.test(c.front)),'Carte rôle du calcium absente');
assert.ok(!byQ('calcium_case').some(c=>/^Concernant le calcium\s*\?$/i.test(c.front)),'Le recto vague calcium doit disparaître');

assert.ok(byQ('potassium_case').length>=2,'Le potassium doit être éclaté en plusieurs cartes précises');
assert.ok(byQ('potassium_case').some(c=>/principal cation intracellulaire/i.test(c.front)),'Carte cation intracellulaire absente');
assert.ok(!byQ('potassium_case').some(c=>/^Le potassium\s*\?$/i.test(c.front)),'Le recto vague potassium doit disparaître');

const transcription=byQ('transcription_case');
assert.equal(transcription.length,1,'La transcription doit rester une seule notion');
assert.match(transcription[0].front,/transcription en biologie moléculaire/i);
assert.equal(transcription[0].answers.length,1,'Les deux réponses équivalentes de transcription doivent être dédupliquées');

const translation=byQ('translation_case');
assert.equal(translation.length,1);
assert.match(translation[0].front,/traduction en biologie moléculaire/i);

const tissues=byQ('tissues_case');
assert.equal(tissues.length,1);
assert.equal(tissues[0].answers.length,4,'Le verso doit afficher les quatre classes de tissus annoncées au recto');
const tissueText=tissues[0].answers.join(' ').toLowerCase();
for(const x of ['épithélial','conjonctif','musculaire','nerveux'])assert.ok(tissueText.includes(x),`Classe de tissu manquante: ${x}`);

for(const c of deck){
  assert.ok(!/^Concernant\s+.+\?$/i.test(c.front),`Recto vague: ${c.front}`);
  const m=c.front.toLowerCase().match(/\b(quatre|4)\b/);
  if(m)assert.equal(c.answers.length,4,`Recto/verso incohérent: ${c.front}`);
}
console.log(`✅ V8.30.48 : cohérence recto/verso contrôlée sur ${deck.length} cartes de test`);
