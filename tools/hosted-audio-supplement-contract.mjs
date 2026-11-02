// Additive MP3 hosted by the application. Historical package signatures stay intact.
// Preparation validates bytes and scope; publication additionally requires a new GO.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {validateVocalDuration} from '../tests/vocal-duration-contract.mjs';

const canonical=x=>Array.isArray(x)?x.map(canonical):x&&typeof x==='object'?
 Object.fromEntries(Object.keys(x).sort().filter(k=>x[k]!==undefined).map(k=>[k,canonical(x[k])])):x;
export const audioValueDigest=x=>createHash('sha256').update(JSON.stringify(canonical(x))).digest('hex');
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
const iso=x=>typeof x==='string'&&/^\d{4}-\d{2}-\d{2}T/.test(x)&&Number.isFinite(Date.parse(x));
function keys(value,expected,label){assert.deepEqual(Object.keys(value).sort(),[...expected].sort(),label);}
function localBytes(file){
 const root=fs.realpathSync('.'),target=fs.realpathSync(file);
 assert.ok(target.startsWith(root+path.sep),'MP3 hors du checkout');
 assert.ok(fs.statSync(target).isFile(),'MP3 non régulier');
 return fs.readFileSync(target);
}
export function hostedAudioSupplementDigest(s,data){
 const {publicationApproval,...content}=s;
 return audioValueDigest({supplement:content,vocals:s.vocalIds.map(id=>data.vocals.find(v=>v.id===id))});
}

export function validateHostedAudioSupplements(manifest,data,{stage='preparation',readBytes=localBytes}={}){
 assert.ok(['preparation','publication'].includes(stage),'Étape audio inconnue');
 const supplements=manifest.hostedAudioSupplements||[];
 assert.ok(Array.isArray(supplements),'Liste des compléments MP3 invalide');
 const accepted=new Map(),courses=new Set(),paths=new Set(),ids=new Set();
 for(const s of supplements){
  keys(s,['contract','id','courseId','status','baseline','vocalIds','artifacts','review','publicationApproval'],'Champs du complément MP3 inconnus');
  assert.equal(s.contract,'hosted_audio_supplement_v1');
  assert.match(s.id||'',/^[a-z0-9_]+$/);assert.ok(!ids.has(s.id),'ID complément dupliqué');ids.add(s.id);
  assert.ok(!courses.has(s.courseId),'Un seul complément hébergé par cours pour ce contrat');courses.add(s.courseId);
  assert.ok(['prepared','approved'].includes(s.status),'Statut du complément MP3 invalide');
  const course=data.registry.courses.find(c=>c.id===s.courseId);
  const delivery=manifest.courses?.find(d=>d.courseId===s.courseId);
  assert.ok(course&&delivery,'Cours historique ou livraison absent');
  keys(s.baseline,['course','vocals','deliverySha256'],'Snapshot audio incomplet');
  assert.equal(s.baseline.course.id,s.courseId);
  assert.equal(s.baseline.deliverySha256,audioValueDigest(delivery),'Livraison ou approbation historique modifiée');
  assert.equal(delivery.publicationApproval?.status,'approved','Package historique non approuvé');
  assert.match(delivery.publicationApproval.bundleSha256||'',/^[a-f0-9]{64}$/);
  assert.ok(Array.isArray(s.baseline.vocals));
  assert.ok(s.baseline.vocals.every(v=>v.courseId===s.courseId),'Historique d’un autre cours');
  assert.equal(new Set(s.baseline.vocals.map(v=>v.id)).size,s.baseline.vocals.length,'Historique dupliqué');
  assert.equal(s.baseline.course.audioCount,s.baseline.vocals.length,'Compteur historique incorrect');
  assert.ok(Array.isArray(s.vocalIds)&&s.vocalIds.length>0,'Complément vide');
  assert.equal(new Set(s.vocalIds).size,s.vocalIds.length,'Vocal dupliqué');
  assert.ok(Array.isArray(s.artifacts));
  assert.deepEqual(s.artifacts.map(a=>a.vocalId),s.vocalIds,'Couverture ou ordre des MP3 incorrect');
  const courseVocals=data.vocals.filter(v=>v.courseId===s.courseId);
  assert.deepEqual(courseVocals.filter(v=>!s.vocalIds.includes(v.id)),s.baseline.vocals,'Vocal historique modifié, retiré, réordonné ou ajout non déclaré');
  assert.deepEqual(courseVocals,[...s.baseline.vocals,...s.vocalIds.map(id=>data.vocals.find(v=>v.id===id))],'Ordre historique ou ordre du complément modifié');
  assert.deepEqual(course,{...s.baseline.course,audioStatus:'available',audioCount:courseVocals.length},'Modification du cours hors compteur/statut audio');
  const maxNumber=Math.max(0,...s.baseline.vocals.map(v=>v.number));
  for(let i=0;i<s.artifacts.length;i++){
   const a=s.artifacts[i];keys(a,['vocalId','path','sha256','bytes','durationSeconds'],'Champs d’artefact MP3 inconnus');
   const matches=data.vocals.filter(v=>v.id===a.vocalId);
   assert.equal(matches.length,1,'Vocal absent ou dupliqué');const v=matches[0];
   assert.ok(!s.baseline.vocals.some(old=>old.id===v.id),'ID audio historique réutilisé');
   assert.ok(!accepted.has(v.id),'Vocal couvert deux fois');
   assert.equal(v.courseId,s.courseId,'Vocal rattaché au mauvais cours');assert.equal(v.course,course.label);
   assert.equal(v.number,maxNumber+i+1,'Ordre audio incorrect');assert.ok(v.title?.trim());
   assert.equal(v.mime,'audio/mpeg');assert.equal(v.driveId,undefined,'ID Drive fictif ou hors contrat');
   assert.match(a.path||'',/^assets\/audio\/[A-Za-z0-9_-]+(?:\/[A-Za-z0-9_-]+)*\.mp3$/,'Chemin MP3 non canonique');
   assert.ok(!paths.has(a.path),'Chemin MP3 réutilisé');paths.add(a.path);
   assert.equal(data.vocals.filter(row=>row.localAudio==='./'+a.path).length,1,'MP3 utilisé par un autre vocal');
   assert.equal(v.localAudio,'./'+a.path);assert.equal(a.durationSeconds,v.durationSeconds);
   assert.match(a.sha256||'',/^[a-f0-9]{64}$/);validateVocalDuration(v,a.sha256);
   assert.ok(Number.isSafeInteger(a.bytes)&&a.bytes>1024,'MP3 vide ou tronqué');
   const bytes=readBytes(a.path);assert.equal(bytes.length,a.bytes,'Taille MP3 différente');assert.equal(sha(bytes),a.sha256,'Octets MP3 modifiés');
   accepted.set(v.id,s);
  }
  if(s.status==='prepared'){
   assert.equal(s.publicationApproval,null,'Préparation munie d’un faux GO');
   assert.deepEqual(s.review,{status:'pending'},'Revue non effectuée déclarée comme acquise');
   assert.equal(stage,'preparation','HOSTED_AUDIO_GO_REQUIRED: complément préparé, écoute et GO publication absents');
  }else{
   keys(s.review,['status','listenedVocalIds','artifactSha256s','reviewedAt','privateEvidenceSha256'],'Revue audio incomplète');
   assert.equal(s.review.status,'completed');assert.deepEqual(s.review.listenedVocalIds,s.vocalIds);
   assert.deepEqual(s.review.artifactSha256s,Object.fromEntries(s.artifacts.map(a=>[a.path,a.sha256])),'Revue pour d’autres octets');
   assert.ok(iso(s.review.reviewedAt));assert.match(s.review.privateEvidenceSha256||'',/^[a-f0-9]{64}$/);
   const a=s.publicationApproval;
   keys(a||{},['status','authorization','scope','approvedAt','bundleSha256'],'GO audio incomplet');
   assert.equal(a.status,'approved');assert.equal(a.authorization,'explicit_go_publication');assert.equal(a.scope,'hosted_audio_supplement');
   assert.ok(iso(a.approvedAt));assert.equal(a.bundleSha256,hostedAudioSupplementDigest(s,data),'Complément changé après GO');
  }
 }
 return accepted;
}

// This view contains exactly the resources covered by the historical package GO.
// It is never used by the student player; the independent supplement gate is mandatory.
export function historicalAudioView(manifest,data,options={}){
 const accepted=validateHostedAudioSupplements(manifest,data,options);
 if(!accepted.size)return data;
 const byCourse=new Map(manifest.hostedAudioSupplements.map(s=>[s.courseId,s]));
 return {...data,registry:{...data.registry,courses:data.registry.courses.map(c=>byCourse.get(c.id)?.baseline.course||c)},
  vocals:data.vocals.filter(v=>!accepted.has(v.id))};
}

export function validateHostedAudioChanges(before,after,oldData,newData,{stage='publication',readBytes}={}){
 const options={stage:'preparation',...(readBytes?{readBytes}:{})};
 validateHostedAudioSupplements(after,newData,options);
 const oldView=historicalAudioView(before,oldData,options),newView=historicalAudioView(after,newData,options);
 for(const s of after.hostedAudioSupplements||[]){
  const prior=(before.hostedAudioSupplements||[]).find(p=>p.id===s.id);
  if(prior){
   const strip=x=>{const {status,review,publicationApproval,...rest}=x;return rest;};
   assert.deepEqual(strip(s),strip(prior),'Contenu du complément historique modifié');
   if(prior.status==='approved')assert.deepEqual(s,prior,'GO ou revue audio historique modifié');
  }else{
   assert.deepEqual(s.baseline.course,oldView.registry.courses.find(c=>c.id===s.courseId),'Snapshot de cours différent de la base');
   assert.deepEqual(s.baseline.vocals,oldView.vocals.filter(v=>v.courseId===s.courseId),'Snapshot des vocaux différent de la base');
   assert.equal(s.baseline.deliverySha256,audioValueDigest(before.courses.find(d=>d.courseId===s.courseId)),'Snapshot de livraison différent de la base');
  }
  assert.deepEqual(after.courses.find(d=>d.courseId===s.courseId),before.courses.find(d=>d.courseId===s.courseId),'Livraison pédagogique modifiée avec un complément audio');
 }
 for(const s of before.hostedAudioSupplements||[])assert.ok(after.hostedAudioSupplements?.some(n=>n.id===s.id),'Complément historique supprimé');
 // Exact preservation of the complete old catalog, including row order, is required.
 if((after.hostedAudioSupplements||[]).length){
  assert.deepEqual(newView.vocals,oldView.vocals,'Audio hors du complément ou historique modifié');
 }
 validateHostedAudioSupplements(after,newData,{stage,...(readBytes?{readBytes}:{})});
 return {oldView,newView};
}
