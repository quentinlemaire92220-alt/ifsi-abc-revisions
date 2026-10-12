import assert from 'node:assert/strict';
import {runtimeDeck} from './flashcards-runtime-fixture.mjs';

// Un classement doit permuter les éléments de l'énoncé, jamais les remplacer.
// Contrôle générique : nombres, volumes, structures anatomiques, étapes chronologiques.
// Pour être contrôlable, l'énoncé énumère les éléments avec ";" et les choix
// utilisent <, >, →, ⇒, -> ou ";" comme séparateurs.
const rankingPrompt=/\b(?:range|ranger|classe|classer|ordonne|ordonner|trie|trier|ordre chronologique|ordre croissant|ordre d[eé]croissant)\b/i;
const normalize=s=>String(s).normalize('NFKC').trim().replace(/\s+/g,' ').toLocaleLowerCase('fr');
const sortedTokens=xs=>xs.map(normalize).sort();
function listedElements(text){
  const match=String(text).match(/:\s*([^?]+?)(?:\.\s|\?|$)/);
  if(!match)return null;
  const elements=match[1].split(/\s*;\s*/).map(x=>x.trim()).filter(Boolean);
  return elements.length>=3?elements:null;
}
function orderedElements(choice){
  const elements=String(choice).split(/\s*(?:<|>|→|⇒|->|;)\s*/).map(x=>x.trim()).filter(Boolean);
  return elements.length>=3?elements:null;
}
function volumeMl(s){
  const m=String(s).trim().match(/^(\d+(?:[,.]\d+)?)\s*(µl|ml|cl|dl|l)$/i);
  if(!m)return null;
  const factor={'µl':0.001,ml:1,cl:10,dl:100,l:1000}[m[2].toLowerCase()];
  return Number(m[1].replace(',','.'))*factor;
}
function validateRanking(q){
  if(!rankingPrompt.test(q.question))return false;
  const inputs=listedElements(q.question);
  if(!inputs)return false; // Questions sans liste explicite : hors de cette règle.
  assert.equal(new Set(sortedTokens(inputs)).size,inputs.length,q.id+' : élément en double dans l’énoncé');
  const wanted=sortedTokens(inputs);
  const options=q.choices.map((choice,i)=>{
    const parts=orderedElements(choice);
    assert.ok(parts,q.id+' choix '+String.fromCharCode(65+i)+' : ordre non lisible');
    assert.deepEqual(sortedTokens(parts),wanted,q.id+' choix '+String.fromCharCode(65+i)+' : élément remplacé, manquant ou répété');
    return parts;
  });
  assert.equal(q.answers.length,1,q.id+' : un seul ordre exact attendu');
  const volumes=inputs.map(volumeMl);
  if(volumes.every(x=>x!==null)){
    const descending=/plus grand au plus petit|d[eé]croissant/i.test(q.question);
    const compare=(a,b)=>descending?a>b:a<b;
    const validOptions=options.flatMap((parts,i)=>{
      const v=parts.map(volumeMl);
      return v.every((x,j)=>j===0||compare(v[j-1],x))?[i]:[];
    });
    assert.deepEqual(validOptions,q.answers,q.id+' : bonne réponse et comparaison réelle des volumes incohérentes');
  }
  return true;
}

const {questions}=await runtimeDeck();
const target=questions.find(q=>q.id==='cdm_039');
assert.ok(target,'Question cdm_039 absente de la banque active');
assert.equal(target.courseId,'calculs_doses_mathematiques');
assert.equal(target.difficulty,'hard');
assert.deepEqual(Array.from(target.answers),[1],'La réponse B doit rester la seule réponse exacte');
assert.equal(target.choices.length,5);
assert.deepEqual(listedElements(target.question),['0,05 L','75 mL','1 dL','250 cL']);
assert.deepEqual(orderedElements(target.choices[1]),['0,05 L','75 mL','1 dL','250 cL']);
assert.match(target.explanation,/50 mL[\s\S]*75 mL[\s\S]*100 mL[\s\S]*2 500 mL/);
assert.ok(target.explanation.length>=120,'Corrigé argumenté trop court');
const audited=questions.filter(validateRanking);
assert.ok(audited.some(q=>q.id==='cdm_039'),'Le contrôle doit inclure le QCM signalé');

// Régressions simulées : chaque anomalie doit faire échouer la CI.
assert.throws(()=>validateRanking({...target,choices:target.choices.map((x,i)=>i===0?x.replace('0,05 L','0,01 L'):x)}),/remplacé, manquant ou répété/);
assert.throws(()=>validateRanking({...target,choices:target.choices.map((x,i)=>i===0?x.replace('0,05 L','75 mL'):x)}),/remplacé, manquant ou répété/);
assert.throws(()=>validateRanking({...target,choices:target.choices.map((x,i)=>i===0?x.replace(' < 1 dL',''):x)}),/remplacé, manquant ou répété/);
assert.throws(()=>validateRanking({...target,answers:[0]}),/bonne réponse/);

// Même garde-fou pour une liste anatomique sans valeur numérique.
const anatomy={
  id:'fixture_anatomie',
  question:'Classe les structures de proximal à distal : épaule ; coude ; poignet ; main. Quel est le bon ordre ?',
  choices:['main → épaule → poignet → coude','épaule → coude → poignet → main','épaule → main → coude → poignet','coude → épaule → main → poignet'],
  answers:[1]
};
assert.equal(validateRanking(anatomy),true);
assert.throws(()=>validateRanking({...anatomy,choices:[...anatomy.choices.slice(0,2),'épaule → main → coude → genou',anatomy.choices[3]]}),/remplacé, manquant ou répété/);

console.log('✅ Classements QCM : '+audited.length+' question(s) contrôlée(s) ; valeurs conservées ; corrigé et vérité vérifiés ; mutations bloquées');
