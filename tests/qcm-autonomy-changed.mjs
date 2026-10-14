// Contrôle différentiel avant toute publication : uniquement les banques
// QCM réellement modifiées dans la PR/push, jamais les données privées.
import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import zlib from 'node:zlib';
import {validateChangedQcmBanks} from './qcm-autonomy-contract.mjs';

const git=args=>execFileSync('git',args,{encoding:'utf8'});
const baseHint=String(process.env.IFSI_BASE_SHA||'').trim();
const bases=/^[a-f0-9]{7,40}$/i.test(baseHint)&&!/^0+$/.test(baseHint)
  ? [baseHint,'HEAD^'] : ['HEAD^'];

let base;
for(const candidate of bases){
  try {git(['rev-parse','--verify',candidate+'^{commit}']);base=candidate;break;}catch{}
}
if(!base)throw new Error('Historique Git absent : contrôle QCM impossible');

const filenames=git(['diff','--name-only',base,'HEAD']).split(/\r?\n/).filter(f=>
  /^(?:qextra-\d+\.txt|questions-\d+\.json)$/.test(f));
function decode(raw,name) {
  const value=raw.trim();
  if(!value)throw new Error(name+': banque vide');
  const parsed=value.startsWith('[')||value.startsWith('{')?JSON.parse(value)
    :JSON.parse(zlib.gunzipSync(Buffer.from(value,'base64')).toString('utf8'));
  if(!Array.isArray(parsed))throw new Error(name+': banque non listée');
  return parsed;
}
let count=0;
for(const name of filenames){
  const next=decode(fs.readFileSync(name,'utf8'),name);
  let previous=[];
  try {previous=decode(git(['show',base+':'+name]),name+' (base)');}
  catch(error){
    if(!String(error.message||'').includes('does not exist') &&
       !String(error.message||'').includes('exists on disk')) {
      // Newly created path: Git may show fatal: path ... does not exist;
      // other errors should never silently skip historical comparisons.
      try {git(['cat-file','-e',base+':'+name]);}catch{previous=[];continueCheck();}
    }
  }
  function continueCheck() {}
  count+=validateChangedQcmBanks(previous,next,name);
}
console.log('✅ Autonomie TD/support : '+count+' item(s) QCM nouveau(x)/modifié(s) contrôlé(s) dans '+filenames.length+' banque(s). Les questions historiques inchangées restent hors de ce contrôle différentiel.');
