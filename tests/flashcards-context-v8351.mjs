import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';

const read=p=>fs.readFileSync(p,'utf8');
const meta=JSON.parse(read('build-meta.json'));
assert.ok(Number(meta.build)>=8351,'Les garanties de contextualisation V8.30.51 doivent être conservées');

const qs=[
  {
    id:'ctx_liquids',courseId:'x',course:'Homéostasie',theme:'Équilibre hydrique et ADH',difficulty:'hard',
    question:'Quelles associations sont correctes ?',
    choices:['LIC : environ 70 % de l’eau totale','LEC : environ 30 % de l’eau totale','ADH : hormone thyroïdienne'],
    answers:[0,1],
    explanation:'L’eau corporelle est majoritairement située dans les cellules. Le support relie ces compartiments à la proportion totale d’eau du corps.'
  },
  {
    id:'ctx_loop',courseId:'x',course:'Homéostasie',theme:'Principes de l’homéostasie et rétrocontrôles',difficulty:'medium',
    question:'Quelles associations composant – fonction sont exactes ?',
    choices:['Capteur : détecte une variation du paramètre régulé','Effecteur : corrige l’écart','Capteur : produit systématiquement une hormone'],
    answers:[0,1],
    explanation:'Dans une boucle d’homéostasie, le capteur détecte la variation et l’effecteur met en œuvre la réponse.'
  },
  {
    id:'ctx_ph',courseId:'x',course:'Homéostasie',theme:'pH et équilibre acido-basique',difficulty:'hard',
    question:'Quelles valeurs sont correctes ?',
    choices:['HCO3− : 22–26 mmol/L','PaCO2 : 35–45 mmHg','HCO3− : 2–6 mmol/L'],
    answers:[0,1],
    explanation:'Les intervalles indiqués sont ceux fournis par le support de cours pour situer les principaux paramètres du bilan présenté.'
  },
  {
    id:'ctx_thermo',courseId:'x',course:'Homéostasie',theme:'Thermorégulation',difficulty:'hard',
    question:'Quelles associations mécanisme – exemple sont justes ?',
    choices:['Convection : déplacement d’air autour du corps','Conduction : transfert par contact direct','Convection : uniquement par rayonnement'],
    answers:[0,1],
    explanation:'La convection implique le déplacement d’un fluide, la conduction un transfert par contact.'
  },
  {
    id:'ctx_insulin',courseId:'x',course:'Homéostasie',theme:'Régulation de la glycémie',difficulty:'medium',
    question:'Quel organe sécrète l’insuline, et son QCM oral ?',
    choices:['Le pancréas','Le rein','Le foie','La rate'],
    answers:[0],
    explanation:'Le pancréas sécrète l’insuline.'
  },
  {
    id:'ctx_calcium',courseId:'x',course:'Homéostasie',theme:'Calcium, sodium et potassium',difficulty:'hard',
    question:'Concernant le calcium dans ce cours : quelles propositions sont correctes ?',
    choices:['Participation à la coagulation','Participation à la contraction musculaire','Participation à la synthèse de l’ADN uniquement'],
    answers:[0,1],
    explanation:'Le calcium intervient notamment dans la coagulation sanguine et la contraction musculaire.'
  }
];

const registry={courses:[{id:'x',label:'Homéostasie',ue:'B1'}]};
const window={
  IFSI_V741:{getRegistry:()=>registry,resourcesForCourse:()=>({questions:qs,sheets:[]})},
  IFSI_V79:{themeOf:q=>q.theme,difficultyOf:q=>q.difficulty}
};
const context={
  window,
  localStorage:{getItem:()=>null,setItem:()=>{}},
  document:{getElementById:()=>null,querySelector:()=>null,querySelectorAll:()=>[]},
  setInterval:()=>0,clearInterval:()=>{},setTimeout:()=>0,clearTimeout:()=>{},
  scrollTo:()=>{},MutationObserver:class{observe(){}},console
};
vm.createContext(context);
vm.runInContext(read('v8338-flashcards.js'),context);
window.IFSI_V8338_FLASHCARDS.rebuild();
const deck=window.IFSI_V8338_FLASHCARDS.getDeck();
const byQ=id=>deck.filter(c=>c.qid===id);

const lic=byQ('ctx_liquids').find(c=>/intracellulaire/i.test(c.front));
assert.ok(lic,'Carte LIC absente');
assert.match(lic.front,/liquide intracellulaire \(LIC\)/i);
assert.match(lic.front,/eau corporelle totale/i);
assert.ok(!/«\s*LIC\s*»/.test(lic.front),'LIC ne doit pas rester un sigle nu');
assert.ok(!/support/i.test(lic.explanation||''),'Le support ne doit pas apparaître dans l’explication');

const capteur=byQ('ctx_loop').find(c=>/capteur/i.test(c.front));
assert.ok(capteur,'Carte capteur absente');
assert.match(capteur.front,/boucle d’homéostasie/i);
assert.ok(!/^À quoi correspond « Capteur »/i.test(capteur.front));

const hco=byQ('ctx_ph').find(c=>/bicarbonates/i.test(c.front));
assert.ok(hco,'Carte bicarbonates absente');
assert.match(hco.front,/HCO₃⁻/);
assert.match(hco.front,/valeur normale/i);
assert.ok(!/support|cours/i.test(hco.explanation||''),'Explication HCO3 doit être débarrassée des métadonnées');

const paco=byQ('ctx_ph').find(c=>/dioxyde de carbone/i.test(c.front));
assert.ok(paco,'Carte PaCO2 absente');
assert.match(paco.front,/PaCO₂/);

const convection=byQ('ctx_thermo').find(c=>/convection/i.test(c.front));
assert.ok(convection,'Carte convection absente');
assert.match(convection.front,/En thermorégulation/i);

const insulin=byQ('ctx_insulin')[0];
assert.ok(insulin,'Carte insuline absente');
assert.equal(insulin.front,'Quel organe sécrète l’insuline ?');
assert.ok(!/QCM oral/i.test(insulin.front));

const calcium=byQ('ctx_calcium').find(c=>/processus physiologiques/i.test(c.front));
assert.ok(calcium,'Carte calcium contextualisée absente');
assert.match(calcium.front,/le calcium/i);
assert.ok(!/dans ce cours|selon le cours/i.test(calcium.front));

for(const c of deck){
  assert.ok(!/dans ce cours|selon le cours|QCM oral|support de cours/i.test(c.front+' '+(c.explanation||'')),`Métadonnée pédagogique visible: ${c.front}`);
  assert.ok(!/À quoi correspond\s+«\s*(?:LIC|LEC|ADH|HCO3|PaCO2|PaO2|SpO2)\s*»/i.test(c.front),`Sigle nu: ${c.front}`);
}
console.log(`✅ V8.30.51 : contextualisation et développement des sigles contrôlés sur ${deck.length} cartes`);
