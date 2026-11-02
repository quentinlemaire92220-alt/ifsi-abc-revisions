import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import {validateVocalDuration} from './vocal-duration-contract.mjs';

export function validateAudioReplacements(before,after,oldVocals,newVocals,readAudio=path=>fs.readFileSync(path)){
  const accepted=new Set();
  assert.ok(newVocals.length>=oldVocals.length,'Vocal historique supprimé');
  for(let i=0;i<oldVocals.length;i++){
    const prior=oldVocals[i],next=newVocals[i];
    if(JSON.stringify(prior)===JSON.stringify(next))continue;
    assert.ok(next,'Vocal historique absent');
    const strip=v=>{const x={...v};for(const key of ['durationSeconds','synthesisOrigin','durationException','replacementReview'])delete x[key];return x;};
    assert.deepEqual(strip(next),strip(prior),'Métadonnées historiques modifiées hors du remplacement audio');
    const oldDelivery=before.courses.find(c=>c.courseId===prior.courseId),delivery=after.courses.find(c=>c.courseId===next.courseId);
    assert.ok(oldDelivery&&delivery,'Cours du remplacement absent');
    const approval=delivery.publicationApproval;
    assert.equal(approval?.status,'approved','Remplacement sans validation');
    assert.equal(approval.authorization,'explicit_go_publication','GO remplacement absent');
    assert.equal(approval.scope,'course_package','Portée remplacement incorrecte');
    assert.match(approval.bundleSha256||'',/^[a-f0-9]{64}$/,'Empreinte package absente');
    assert.notEqual(approval.bundleSha256,oldDelivery.publicationApproval?.bundleSha256,'Ancien GO réutilisé pour de nouveaux MP3');
    const oldArtifact=oldDelivery.publicAudioArtifacts?.find(a=>a.artifactId===prior.id),artifact=delivery.publicAudioArtifacts?.find(a=>a.artifactId===next.id);
    assert.ok(oldArtifact&&artifact,'MP3 du remplacement non déclaré');
    assert.equal(artifact.path,oldArtifact.path,'Chemin historique du MP3 changé');
    assert.equal(prior.localAudio,'./'+oldArtifact.path);
    assert.equal(next.localAudio,'./'+artifact.path);
    assert.equal(oldArtifact.durationSeconds,prior.durationSeconds);
    assert.equal(artifact.durationSeconds,next.durationSeconds);
    assert.notEqual(artifact.sha256,oldArtifact.sha256,'Remplacement sans nouveaux octets');
    const review=next.replacementReview;
    assert.equal(review?.status,'owner_accepted','Écoute du nouveau MP3 non validée');
    assert.equal(review.scope,'audio_replacement');
    assert.equal(review.fromSha256,oldArtifact.sha256,'Ancien MP3 non rapproché');
    assert.equal(review.toSha256,artifact.sha256,'Nouveau MP3 non accepté');
    assert.equal(review.approvedAt,approval.approvedAt,'Date GO différente de la revue');
    assert.ok(Number.isFinite(Date.parse(review.approvedAt)),'Date GO invalide');
    for(const key of [next.id,next.driveId])assert.equal(delivery.artifactSha256s?.[key],artifact.sha256,'Empreintes du remplacement divergentes');
    assert.equal(next.mime,'audio/mpeg');
    validateVocalDuration(next,artifact.sha256);
    assert.equal(createHash('sha256').update(readAudio(artifact.path)).digest('hex'),artifact.sha256,'Octets du remplacement non vérifiés');
    accepted.add(next.id);
  }
  return accepted;
}

export function validateAudioReplacementOnly(prior,delivery,oldCourse,newCourse,oldVocals,newVocals,readAudio){
  assert.deepEqual(newCourse,oldCourse,'Cours modifié hors remplacement audio');
  assert.equal(newVocals.length,oldVocals.length,'Ajout ou suppression mélangé au remplacement');
  const accepted=validateAudioReplacements({courses:[prior]},{courses:[delivery]},oldVocals,newVocals,readAudio);
  assert.ok(accepted.size,'Aucun remplacement audio contrôlé');
  const strip=d=>{const x={...d};for(const key of ['publicationApproval','artifactSha256s','publicAudioArtifacts'])delete x[key];return x;};
  assert.deepEqual(strip(delivery),strip(prior),'Livraison pédagogique modifiée hors remplacement audio');
  const hashes={...prior.artifactSha256s};
  const artifacts=prior.publicAudioArtifacts.map(a=>{
    if(!accepted.has(a.artifactId))return a;
    const next=delivery.publicAudioArtifacts.find(n=>n.artifactId===a.artifactId),v=newVocals.find(v=>v.id===a.artifactId);
    hashes[v.id]=next.sha256;hashes[v.driveId]=next.sha256;
    return {...a,sha256:next.sha256,durationSeconds:next.durationSeconds};
  });
  assert.deepEqual(delivery.artifactSha256s,hashes,'Empreinte non audio historique modifiée');
  assert.deepEqual(delivery.publicAudioArtifacts,artifacts,'Artefact historique modifié hors remplacement');
  return accepted;
}
