// Contrôle différentiel avant toute publication : uniquement les banques
// QCM réellement modifiées dans la PR/push, jamais les données privées.
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import zlib from 'node:zlib';
import {validateChangedQcmBanks} from './qcm-autonomy-contract.mjs';
import {runtimeDeck} from './flashcards-runtime-fixture.mjs';

const git=args=>execFileSync('git',args,{encoding:'utf8'});
const baseHint=String(process.env.IFSI_BASE_SHA||'').trim();
const bases=/^[a-f0-9]{7,40}$/i.test(baseHint)&&!/^0+$/.test(baseHint)
  ? [baseHint,'HEAD^'] : ['HEAD^'];

let base;
for(const candidate of bases){
  try {git(['rev-parse','--verify',candidate+'^{commit}']);base=candidate;break;}catch{}
}
if(!base)throw new Error('Historique Git absent : contrôle QCM impossible');

const filenames=[...new Set([
 ...git(['diff','--name-only',base]).split(/\r?\n/),
 ...git(['ls-files','--others','--exclude-standard']).split(/\r?\n/)
])].filter(f=>/^(?:qextra-\d+\.txt|questions-\d+\.json)$/.test(f));
function decode(raw,name) {
  const value=raw.trim();
  if(!value)throw new Error(name+': banque vide');
  const parsed=value.startsWith('[')||value.startsWith('{')?JSON.parse(value)
    :JSON.parse(zlib.gunzipSync(Buffer.from(value,'base64')).toString('utf8'));
  if(!Array.isArray(parsed))throw new Error(name+': banque non listée');
  return parsed;
}
let count=0;
// A revision can move stable IDs into a new override bank. Compare with the
// previous production loader, rather than treating every moved row as new.
// This also preserves the actual precedence of historical correction packs.
const vm=await import('node:vm');
const oldSw=git(['show',base+':sw.js']);
const oldLoader={Response,Blob,DecompressionStream,TextDecoder,Uint8Array,atob,
 console:{log(){},warn(){},error(){}},caches:{match:async()=>null},
 fetch:async name=>new Response(git(['show',base+':'+String(name).replace(/^\.\//,'')]))};
vm.createContext(oldLoader);
vm.runInContext(oldSw.slice(0,oldSw.indexOf("self.addEventListener('install'")),oldLoader);
const oldExtras=await vm.runInContext('loadExtras()',oldLoader);
const oldQuestions=[1,2,3,4,5].flatMap(n=>decode(git(['show',base+':questions-'+n+'.json']),'base'));
const previousById=new Map([...oldQuestions,...oldExtras].map(q=>[q.id,JSON.parse(JSON.stringify(q))]));
const live=await runtimeDeck();
const presented=new Set(live.registry.courses.filter(c=>c.authoredFlashcardPresentation==='standalone_v1').map(c=>c.id));
for(const name of filenames){
  if(!fs.existsSync(name))continue; // Une banque supprimée n'ajoute pas de QCM.
  const next=decode(fs.readFileSync(name,'utf8'),name);
  let previous=[];
  let exists=true;
  try {git(['cat-file','-e',base+':'+name]);}
  catch {exists=false;} // Fichier ajouté sur cette branche.
  if(exists) previous=decode(git(['show',base+':'+name]),name+' (base)');
  // Explicit cards retain source wording in the export matrix. Validate what
  // the app presents after its tested, fact-preserving display normalization.
  const displayed=next.map(q=>{
   if(!presented.has(q.courseId))return q;
   const cards=live.deck.filter(c=>c.qid===q.id);
   assert.equal(cards.length,q.flashcards.length,q.id+': une carte explicite échappe au contrôle');
   return {...q,flashcards:cards.map(c=>({front:c.front,answers:[...c.answers],explanation:c.explanation}))};
  });
  count+=validateChangedQcmBanks([...previousById.values(),...previous],displayed,name);
}
console.log('✅ Autonomie TD/support : '+count+' item(s) QCM nouveau(x)/modifié(s) contrôlé(s) dans '+filenames.length+' banque(s). Les questions historiques inchangées restent hors de ce contrôle différentiel.');
