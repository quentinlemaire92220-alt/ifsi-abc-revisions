import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import zlib from 'node:zlib';

const source=fs.readFileSync(new URL('../features-v9.js',import.meta.url),'utf8');
const context={
  window:{addEventListener(){}},
  localStorage:{getItem(){return null},setItem(){},removeItem(){}},
  document:{
    head:{appendChild(){}},
    createElement(){return {append(){},appendChild(){},classList:{add(){},remove(){},toggle(){}},style:{}}},
    createTextNode(text){return {text}},
    getElementById(){return null},
    querySelectorAll(){return []}
  },
  begin(){},draw(){},nextQ(){},fill(){},save(){},st(){return {answered:0,correct:0,errors:[],themes:{}}},
  Q:[],session:[],res:[],i:0,done:false,$(){return null},
  setInterval(fn){fn();return 1},clearInterval(){},console
};
vm.createContext(context);vm.runInContext(source,context);

const wording=context.window.IFSI_QCM_WORDING;
assert.ok(wording,'API de nettoyage des énoncés absente');
assert.equal(wording.cleanQuestionPrompt('Quel est le rôle du thymus selon le cours ?'),'Quel est le rôle du thymus ?');
assert.equal(wording.cleanQuestionPrompt('Selon le support, une acidose correspond à :'),'Une acidose correspond à :');

const q={id:'homeostasie_057',question:'Selon la diapositive « diabète insipide » :',choices:['A','B','C','D'],answers:[0,1,3],explanation:'Ancienne correction'};
wording.polishQuestion(q);
assert.equal(q.question,'Quelles propositions décrivent correctement le diabète insipide ?');
assert.deepEqual([...q.answers],[0,1,3]);
assert.equal(q.choices.length,4);
assert.ok(q.choices.every(choice=>!/cité|ici/i.test(choice)),'Les propositions conservent une référence éditoriale inutile');

const root=new URL('../',import.meta.url);
const files=fs.readdirSync(root).filter(name=>/^questions-\d+\.json$|^qextra-\d+\.txt$/.test(name));
const decode=name=>{
  const raw=fs.readFileSync(new URL(name,root),'utf8').trim();
  return JSON.parse(raw.startsWith('[')||raw.startsWith('{')?raw:zlib.gunzipSync(Buffer.from(raw,'base64')).toString('utf8'));
};
const sourceReference=/\b(?:selon|d['’]après|conformément à)\s+(?:(?:ce|cet|cette|le|la|les|l['’])\s+)?(?:sources?\s+du\s+cours|cours(?:\s+et\s+son\s+QCM\s+oral)?|support(?:\s+officiel)?|diapositive|document|affiche\s+du\s+TD|TD)\b/i;
let audited=0;
for(const name of files){
  for(const original of decode(name)){
    const item={...original,choices:[...(original.choices||[])],answers:[...(original.answers||[])]};
    wording.polishQuestion(item);audited++;
    assert.doesNotMatch(item.question,sourceReference,`${name}:${item.id} conserve une référence au support`);
  }
}

assert.match(source,/body\.v72-dark \.qcm-answer-summary\{background:#282332;color:#f4f0fb/);
assert.match(source,/body\.v72-dark \.mastery-note\{background:#23313f;color:#c8eaff/);
console.log(`✅ QCM V8.30.75 : contraste sombre et ${audited} formulations autonomes contrôlés`);
