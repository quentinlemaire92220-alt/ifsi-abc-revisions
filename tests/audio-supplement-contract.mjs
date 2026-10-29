// Compléments audio de cours historiques : autorisation limitée aux fichiers désignés.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import fs from 'node:fs';
const canonical=x=>Array.isArray(x)?x.map(canonical):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,canonical(x[k])])):x;
export function audioSupplementDigest(supplement,vocals){
 const rows=supplement.vocalIds.map(id=>vocals.find(v=>v.id===id)).sort((a,b)=>a.id.localeCompare(b.id));
 return createHash('sha256').update(JSON.stringify(canonical({courseId:supplement.courseId,folderId:supplement.folderId,vocals:rows,artifactSha256s:supplement.artifactSha256s}))).digest('hex');
}
export function validateAudioSupplements(manifest,data){
 const byId=new Map(),files=new Set();
 for(const s of manifest.audioSupplements||[]){
  assert.ok(data.registry.courses.some(c=>c.id===s.courseId),s.courseId+': cours du complément absent');
  assert.match(s.folderId||'',/^[\w-]{15,}$/,'Dossier audio absent');
  assert.ok(Array.isArray(s.vocalIds)&&s.vocalIds.length,'Complément audio vide');
  assert.equal(new Set(s.vocalIds).size,s.vocalIds.length,'ID vocal déclaré deux fois');
  const a=s.publicationApproval;
  assert.equal(a?.status,'approved','Complément audio non approuvé');
  assert.equal(a.authorization,'explicit_go_publication','GO audio absent');
  assert.equal(a.scope,'audio_supplement','Autorisation limitée au complément audio attendue');
  assert.ok(typeof a.approvedAt==='string'&&Number.isFinite(Date.parse(a.approvedAt)),'Date de validation audio invalide');
  const referenced=new Set();
  for(const id of s.vocalIds){
   assert.ok(!byId.has(id),'Vocal couvert par deux compléments');
   const matches=data.vocals.filter(v=>v.id===id);
   assert.equal(matches.length,1,'Vocal absent ou dupliqué : '+id);
   const v=matches[0];
   assert.equal(v.courseId,s.courseId,'Vocal rattaché au mauvais cours');
   assert.match(v.driveId||'',/^[\w-]{15,}$/,'ID Drive absent');
   assert.ok(['audio/aac','audio/mpeg','audio/mp4'].includes(v.mime),'MIME vocal invalide');
   assert.ok(Number.isFinite(v.durationSeconds)&&v.durationSeconds>0,'Durée audio non mesurée');
   assert.ok(!files.has(v.driveId),'Même fichier audio publié deux fois');
   files.add(v.driveId);referenced.add(v.driveId);
   assert.match(s.artifactSha256s?.[v.driveId]||'',/^[a-f0-9]{64}$/,'Empreinte audio absente');
   byId.set(id,s);
  }
  assert.deepEqual(Object.keys(s.artifactSha256s).sort(),[...referenced].sort(),'Empreintes hors du complément audio');
  assert.equal(a.bundleSha256,audioSupplementDigest(s,data.vocals),'Complément audio modifié après validation');
 }
 return byId;
}


// Première publication : les vocaux inclus dans un nouveau package sont
// contrôlés par l'autorisation du package ET leurs octets physiques, et non
// comme des compléments d'un cours déjà publié sur Google Drive.
// La signature du package et l'approbation graphique restent bloquantes
// dans course-publication-approval et les contrats PDF.
export function validateFirstReleaseAudio(before,after,oldRegistry,registry,oldVocals,newVocals){
 const oldIds=new Set(oldVocals.map(v=>v.id));
 const approved=new Set(),usedPaths=new Set();
 for(const c of after.courses||[]){
  if(!Array.isArray(c.publicAudioArtifacts)||c.publicAudioArtifacts.length===0)continue;
  if((before.courses||[]).some(x=>x.courseId===c.courseId))continue;
  assert.ok(!(oldRegistry.courses||[]).some(x=>x.id===c.courseId),
    c.courseId+': audio prétendument nouveau pour un ancien cours');
  const course=(registry.courses||[]).find(x=>x.id===c.courseId);
  assert.ok(course,c.courseId+': nouveau cours absent du registre');
  assert.equal(c.deliveryMode,'source_limited_first_release',c.courseId+': audio non couvert par une première publication');
  assert.equal(c.publicationHost,'github_pages',c.courseId+': hôte MP3 non conforme');
  assert.equal(c.provisional,true,c.courseId+': publication source-limitée non signalée');
  assert.equal(c.publicationApproval?.status,'approved',c.courseId+': package non approuvé');
  assert.equal(c.publicationApproval?.authorization,'explicit_go_publication',c.courseId+': GO package absent');
  assert.equal(c.publicationApproval?.scope,'course_package',c.courseId+': portée du GO incorrecte');
  assert.deepEqual(c.publicAudioArtifacts.map(a=>a.artifactId),c.vocals,
    c.courseId+': ordre ou couverture des MP3 déclarés incorrects');
  const newCourseVocals=newVocals.filter(v=>v.courseId===c.courseId&&!oldIds.has(v.id));
  assert.deepEqual(newCourseVocals.map(v=>v.id),c.vocals,
    c.courseId+': MP3 du cours différents du package');
  assert.equal(course.audioCount,c.vocals.length,c.courseId+': compteur audio incohérent');
  assert.equal(course.audioStatus,'available',c.courseId+': statut vocal incohérent');
  for(const a of c.publicAudioArtifacts){
   assert.ok(!approved.has(a.artifactId),a.artifactId+': MP3 approuvé deux fois');
   assert.match(a.path||'',/^assets\/audio\/[A-Za-z0-9_/-]+\.mp3$/,c.courseId+': chemin audio public invalide');
   assert.ok(!usedPaths.has(a.path),c.courseId+': chemin MP3 dupliqué');
   usedPaths.add(a.path);
   const v=newCourseVocals.find(x=>x.id===a.artifactId);
   assert.ok(v,c.courseId+': MP3 déclaré absent '+a.artifactId);
   assert.equal(v.driveId,undefined,c.courseId+': Drive fictif pour MP3 local');
   assert.equal(v.localAudio,'./'+a.path,c.courseId+': source audio divergente');
   assert.equal(v.mime,'audio/mpeg',c.courseId+': MIME audio incorrect');
   assert.ok(Number.isFinite(v.durationSeconds)&&v.durationSeconds>0&&v.durationSeconds<600,
     c.courseId+': durée MP3 incorrecte');
   assert.equal(v.durationSeconds,a.durationSeconds,c.courseId+': durée MP3 non cohérente');
   assert.match(a.sha256||'',/^[a-f0-9]{64}$/,c.courseId+': empreinte MP3 absente');
   assert.ok(fs.existsSync(a.path),c.courseId+': MP3 manquant '+a.path);
   assert.ok(fs.statSync(a.path).size>1024,c.courseId+': MP3 vide ou tronqué');
   assert.equal(createHash('sha256').update(fs.readFileSync(a.path)).digest('hex'),a.sha256,
     c.courseId+': octets MP3 différents du manifeste '+a.artifactId);
   approved.add(v.id);
  }
 }
 return approved;
}
