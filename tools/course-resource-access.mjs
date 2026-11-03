// Local readiness only: HTTP permissions and served bytes remain post-deployment checks.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
const origin='https://quentinlemaire92220-alt.github.io/ifsi-abc-revisions/';
export function verifyCourseAccess({course,sheets,vocals,vocabulary,runtime,exists=fs.existsSync}){
 const unique=(rows,label)=>assert.equal(new Set(rows).size,rows.length,label+' dupliqués');
 const local=url=>{
  assert.equal(typeof url,'string','URL absente');
  let rel;
  if(url.startsWith(origin))rel=decodeURIComponent(new URL(url).pathname.slice('/ifsi-abc-revisions/'.length));
  else if(url.startsWith('./assets/'))rel=url.slice(2);
  else if(url.startsWith('assets/'))rel=url;
  else{assert.ok(/^https:\/\//.test(url),'URL non publique');return {kind:'external_not_probed',url};}
  assert.ok(rel.startsWith('assets/')&&!rel.split('/').includes('..')&&!path.isAbsolute(rel),'Chemin local invalide');
  assert.ok(exists(rel),'Fichier cible absent : '+rel);return {kind:'local_exists',path:rel};
 };
 const resources=[];
 if(course.primarySheetResourceId){
  const matches=sheets.filter(s=>s.resourceId===course.primarySheetResourceId);
  assert.equal(matches.length,1,'Fiche principale absente ou dupliquée');assert.equal(matches[0].courseId,course.id,'Fiche liée à un autre cours');
  resources.push(local(matches[0].url));
  if(runtime)assert.deepEqual(Array.from(runtime.sheets,s=>s.resourceId),[course.primarySheetResourceId],'Fiche active non chargée');
 }
 if(course.activeDocumentUrls){
  unique(course.activeDocumentUrls,'Liens actifs');
  for(const [field,type] of [['qcmPdfUrl','qcm'],['flashcardsPdfUrl','flashcards']])if(course[field]){
   assert.ok(course.activeDocumentUrls.includes(course[field]),'PDF actif masqué : '+field);
   assert.ok((course.additionalDocuments||[]).some(d=>d.url===course[field]),'PDF actif absent du catalogue : '+type);
  }
  for(const url of course.activeDocumentUrls)resources.push(local(url));
 }
 if(course.activeVocalIds){
  unique(course.activeVocalIds,'Vocaux actifs');
  for(const id of course.activeVocalIds){
   const rows=vocals.filter(v=>v.id===id);assert.equal(rows.length,1,'Vocal actif absent ou dupliqué');assert.equal(rows[0].courseId,course.id,'Vocal lié à un autre cours');
   assert.match(rows[0].localAudio||'',/^\.\/assets\//,'Copie directe audio absente');resources.push(local(rows[0].localAudio));
  }
  if(runtime)assert.deepEqual(Array.from(runtime.vocals,v=>v.id).sort(),[...course.activeVocalIds].sort(),'Vocaux actifs non chargés');
 }
 if(course.canonicalQuestionIds){
  unique(course.canonicalQuestionIds,'Questions canoniques');
  if(runtime)assert.deepEqual(Array.from(runtime.questions,q=>q.id).sort(),[...course.canonicalQuestionIds].sort(),'Banque active non chargée');
 }
 if(course.vocabularyEntryIds){
  unique(course.vocabularyEntryIds,'Définitions');
  for(const id of course.vocabularyEntryIds){const rows=vocabulary.filter(v=>v.id===id);assert.equal(rows.length,1,'Définition absente ou dupliquée');assert.ok(rows[0].courseIds?.includes(course.id),'Définition liée à un autre cours');}
 }
 return {courseId:course.id,resources};
}
