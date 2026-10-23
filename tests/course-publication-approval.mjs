import fs from 'node:fs';
import path from 'node:path';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {validateChangedDeliveries,publicationBundle,bundleDigest} from './course-publication-approval-lib.mjs';

const git=args=>execFileSync('git',args,{maxBuffer:32*1024*1024});
const json=(ref,file)=>JSON.parse((ref?git(['show',ref+':'+file]):fs.readFileSync(file)).toString('utf8'));
const requested=String(process.env.IFSI_BASE_SHA||'');
let base;
for(const ref of (/^[a-f0-9]{7,40}$/i.test(requested)?[requested,'HEAD^']:['HEAD^'])){
 try{json(ref,'docs/course-deliveries.json');base=ref;break;}catch{}
}
if(!base)throw Error('Historique Git absent pour contrôler la validation de publication.');
const before=json(base,'docs/course-deliveries.json'),after=json(null,'docs/course-deliveries.json');
function readData(ref,manifest,proposedManifest=manifest){
 const sheets=[1,2,3].flatMap(n=>json(ref,`sheets-${n}.json`));
 const infographics=json(ref,'infographics.json'),vocals=json(ref,'vocals.json');
 const banks={},imageHashes={};
 const manifestCourses=[...(manifest.courses||[]),...(proposedManifest.courses||[])];
 for(const c of manifestCourses)for(const file of c.qcmBanks?.length?c.qcmBanks:[c.qcmBank].filter(Boolean)){
  if(!/^[\w/-]+\.(?:txt|json)$/.test(file)||file.includes('..'))throw Error('Chemin de banque invalide');
  if(!banks[file]){
   // Une nouvelle banque n'existait pas nécessairement dans la base publiée.
   // Seule son absence Git est admise ; un ancien fichier absent ou malformé reste bloquant.
   const wasDeclared=(manifest.courses||[]).some(c=>(c.qcmBanks?.length?c.qcmBanks:[c.qcmBank]).includes(file));
   if(ref&&!wasDeclared){
    const exists=execFileSync('git',['ls-tree','--name-only',ref,'--',file],{encoding:'utf8'}).trim();
    banks[file]=exists?json(ref,file):[];
   }else banks[file]=json(ref,file);
  }
 }
 for(const x of infographics.filter(x=>(manifest.courses||[]).some(c=>c.courseId===x.courseId))){
  if(!x.localImage)continue;
  if(path.isAbsolute(x.localImage)||x.localImage.split(/[\\/]/).includes('..'))throw Error('Chemin image invalide');
  const bytes=ref?git(['show',ref+':'+x.localImage]):fs.readFileSync(x.localImage);
  imageHashes[x.localImage]=createHash('sha256').update(bytes).digest('hex');
 }
 return {registry:json(ref,'course-registry-v741.json'),sheets,infographics,vocals,banks,imageHashes,vocabulary:json(ref,'vocabulaire-v1.json').entries};
}
const oldData=readData(base,before,after),newData=readData(null,after);
for(const delivery of after.courses||[]){
 console.log('🔐 Empreinte package '+delivery.courseId+' : '+bundleDigest(publicationBundle(delivery.courseId,delivery,newData)));
}
const checked=validateChangedDeliveries(before,after,oldData,newData);
const {validateAudioSupplements}=await import('./audio-supplement-contract.mjs');
validateAudioSupplements(after,newData);
console.log(`✅ Validation avant publication : ${checked.length} lot(s) nouveau(x) ou modifié(s) approuvé(s) ; cours inchangés préservés.`);
