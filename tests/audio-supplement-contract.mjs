// Compléments audio de cours historiques : autorisation limitée aux fichiers désignés.
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
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

