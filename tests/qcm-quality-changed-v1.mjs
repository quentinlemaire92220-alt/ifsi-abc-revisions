// Refuser les défauts de qualité dans les QCM nouveaux ou réécrits.
// Les banques historiques inchangées restent en attente de revue médicale privée.
import fs from 'node:fs';
import zlib from 'node:zlib';
import {execFileSync} from 'node:child_process';
import {pedagogicalFields} from './qcm-autonomy-contract.mjs';
import {pedagogicalQualityViolations} from './qcm-quality-core-v1.mjs';

const git=args=>execFileSync('git',args,{encoding:'utf8'});
const hint=String(process.env.IFSI_BASE_SHA||'').trim();
const candidates=/^[a-f0-9]{7,40}$/i.test(hint)&&!/^0+$/.test(hint)?[hint,'HEAD^']:['HEAD^'];
let base;
for(const candidate of candidates){
  try{git(['rev-parse','--verify',candidate+'^{commit}']);base=candidate;break}catch{}
}
if(!base)throw new Error('Historique Git indisponible : qualité des QCM non vérifiable');
const files=git(['diff','--name-only',base,'HEAD']).split(/\r?\n/).filter(p=>/^(?:qextra-\d+\.txt|questions-\d+\.json)$/.test(p));
function decode(raw,path){
  const txt=raw.trim();
  const rows=txt.startsWith('[')||txt.startsWith('{')?JSON.parse(txt):
    JSON.parse(zlib.gunzipSync(Buffer.from(txt,'base64')).toString('utf8'));
  const array=Array.isArray(rows)?rows:rows.questions;
  if(!Array.isArray(array))throw new Error(path+': banque QCM non listée');
  return array;
}
let changed=0;
for(const path of files){
  if(!fs.existsSync(path))continue;
  const rows=decode(fs.readFileSync(path,'utf8'),path);
  let before=[];
  try{git(['cat-file','-e',base+':'+path]);before=decode(git(['show',base+':'+path]),path+' (base)')}catch(e){
    if(e.status!==1&&e.status!==128)throw e;
  }
  const previous=new Map(before.map(x=>[x.id,x]));
  for(const q of rows){
    const old=previous.get(q.id);
    if(old&&JSON.stringify(pedagogicalFields(old))===JSON.stringify(pedagogicalFields(q)))continue;
    changed++;
    const issues=pedagogicalQualityViolations(q);
    if(issues.length)throw new Error(path+' / '+(q.id||'?')+': '+issues.join(' ; '));
  }
}
console.log('✅ Qualité différentielle QCM : '+changed+' question(s) créée(s)/réécrite(s) examinée(s) dans '+files.length+' banque(s). Aucun ancien contenu modifié.');
