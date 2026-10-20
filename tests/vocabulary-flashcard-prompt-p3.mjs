import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const read=file=>fs.readFileSync(new URL('../'+file,import.meta.url),'utf8');
const real=JSON.parse(read('vocabulaire-v1.json')).entries;
const sample=real.find(x=>x.id==='enrich_anurie');
const parent=real.find(x=>x.id==='anurie');
assert.ok(sample&&parent,'Les deux entrées historiques doivent rester présentes');

const fixture={entries:[
 parent,
 {...sample,flashcardFront:'En quoi diffèrent le terme Alpha et le terme Bêta ?',flashcardAnswer:'Alpha et Bêta décrivent des notions distinctes.'},
 {id:'fixture_incomplete',term:'Terme fictif',definition:'Définition fictive conservée.',
  theme:'Fictif',courseIds:[sample.courseIds[0]],flashcardFront:'Question incomplète ?'},
 ...['Bêta','Gamma','Delta'].map((term,i)=>({id:'fixture_extra_'+i,term,definition:'Une définition distincte numéro '+i+'.',theme:'Fictif',courseIds:[sample.courseIds[0]]}))
]};
const registry=JSON.parse(read('course-registry-v741.json'));
const win={IFSI_V741:{getRegistry:()=>registry},dispatchEvent(){}};
const elements={classList:{contains:()=>true},addEventListener(){}};
const context={window:win,console,Event:class{},CustomEvent:class{},
 localStorage:{getItem:()=>null,setItem(){}},
 document:{getElementById:id=>['v8355Vocab','v8355VocabCss'].includes(id)?elements:null},
 fetch:async()=>({ok:true,json:async()=>fixture}),
 begin(){},shuffle:a=>a,fill(){}};
vm.createContext(context);
vm.runInContext(read('v8355-vocabulary.js'),context);
await win.IFSI_VOCAB.refresh();
const first=win.IFSI_VOCAB.flashcards();
assert.equal(first.length,6,'Les cartes ne doivent ni disparaître ni se multiplier');
const byId=id=>first.find(x=>x.id==='voc:'+id);
assert.equal(byId('anurie').front,'Que signifie « '+parent.term+' » ?');
assert.equal(byId('anurie').answers[0],parent.definition);
assert.equal(byId('enrich_anurie').front,'En quoi diffèrent le terme Alpha et le terme Bêta ?');
assert.equal(byId('enrich_anurie').answers[0],'Alpha et Bêta décrivent des notions distinctes.');
assert.equal(byId('enrich_anurie').explanation,sample.distinction);
assert.equal(byId('enrich_anurie').courseId,sample.courseIds[0]);
assert.deepEqual(Array.from(byId('enrich_anurie').courseIds),sample.courseIds);
assert.equal(byId('fixture_incomplete').front,'Que signifie « Terme fictif » ?');
assert.equal(byId('fixture_incomplete').answers[0],'Définition fictive conservée.');
const qs=win.IFSI_VOCAB.questions();
const enriched=qs.filter(q=>q.courseId===sample.courseIds[0]&&q.question.includes(sample.term));
assert.ok(enriched.length,'Le module QCM vocabulaire demeure actif');
assert.ok(qs.every(q=>q.choices.length===4&&q.answers.length===1),'Le QCM conserve quatre choix et sa source de vérité');
await win.IFSI_VOCAB.refresh();
assert.deepEqual(win.IFSI_VOCAB.flashcards().map(x=>x.id),first.map(x=>x.id));
assert.ok(real.every(x=>!Object.hasOwn(x,'flashcardFront')&&!Object.hasOwn(x,'flashcardAnswer')),
 'Aucune banque réelle ne doit être modifiée avant validation et GO publication');
console.log('✅ P3 pilote: overrides facultatifs, associations multi-cours, QCM et progression préservés ; données publiées inchangées');
