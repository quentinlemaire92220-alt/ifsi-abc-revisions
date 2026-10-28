// Complément strict : 50 QCM, 50 cartes et 50 termes, sans modifier la fiche initiale.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
const sha=b=>createHash('sha256').update(b).digest('hex');
const canonical=v=>Array.isArray(v)?v.map(canonical):v&&typeof v==='object'?Object.fromEntries(Object.keys(v).sort().filter(k=>v[k]!==undefined).map(k=>[k,canonical(v[k])])):v;
const equal=(a,b,m)=>assert.deepEqual(canonical(a),canonical(b),m);
const BASE='https://quentinlemaire92220-alt.github.io/ifsi-abc-revisions/';
export const stressAddonId='gestion_stress_professionnel';
export function validateStressAddonRuntime(course,delivery,sheets,{questions=[],deck=[]}={}){
 const id=stressAddonId,a=delivery.qcmFlashcardsSupplement;
 assert.equal(delivery.courseId,id);
 assert.equal(a?.courseId,id);
 assert.equal(a.scope,'qcm_flashcards_vocabulary_only');
 assert.equal(a.status,'owner_accepted');
 assert.equal(a.qcmCount,50);assert.equal(a.flashcardCount,50);
 assert.equal(a.termsAdded,46);assert.equal(a.termsReused,4);
 assert.equal(delivery.qcmCount,50);assert.equal(delivery.flashcardCount,50);
 assert.equal(delivery.vocabularyCount,50);
 assert.equal(delivery.qcmBank,a.bankPath);
 assert.equal(course?.id,id);
 const docs=course.additionalDocuments||[];
 assert.equal(docs.length,3,'Fiche historique + QCM + flashcards attendus');
 const artefacts=['qcm','flashcards'];
 for(const role of artefacts){
  const art=delivery.publicArtifacts?.[role],review=a.ownerReview?.[role+'Pdf'];
  assert.ok(art&&/^[a-f0-9]{64}$/.test(art.sha256),'asset SHA absent '+role);
  assert.ok(art.path.startsWith('assets/gestion-stress-20261019/'),role+': chemin hors cours');
  assert.ok(fs.existsSync(art.path),'asset manquant '+art.path);
  assert.equal(sha(fs.readFileSync(art.path)),art.sha256,'PDF different '+role);
  assert.equal(delivery.artifactSha256s?.[art.artifactId],art.sha256,'Manifeste SHA faux '+role);
  assert.equal(review?.sha256,art.sha256,'Revue PDF autre fichier '+role);
  assert.equal(review?.pageCount,art.pageCount,'Revue nombre pages incoherent '+role);
  assert.equal(review?.renderedAllPages,true,'Pages non verifiees '+role);
  assert.ok(docs.some(x=>x.url===BASE+art.path),'Document absent du catalogue '+role);
 }
 assert.equal(a.ownerReview?.status,'owner_accepted');
 assert.equal(a.publicationApproval?.status,'approved');
 assert.equal(a.publicationApproval?.authorization,'explicit_go_publication');
 assert.equal(a.publicationApproval?.scope,'qcm_flashcards_vocabulary_only');
 assert.match(a.publicationApproval?.bundleSha256||'',/^[a-f0-9]{64}$/);
 assert.equal(a.publishedVerification?.status,'PENDING_DEPLOYMENT','Ne pas inventer verification Pages');
 assert.equal(a.publishedVerification?.source,'github_pages_file_staged');
 assert.equal(delivery.publicArtifacts?.sheet?.sha256,'d2f3eb89fa0ebe6c7ab464ea2423b5a9fbe7004c8b308d5e3ef13b2232c8e4c6','Fiche historique modifiée');
 const bank=JSON.parse(fs.readFileSync(a.bankPath,'utf8'));
 assert.equal(bank.length,50);assert.equal(new Set(bank.map(q=>q.id)).size,50);
 assert.equal(new Set(bank.map(q=>q.theme)).size,5);
 const balance={easy:0,medium:0,hard:0};
 for(const q of bank){
  assert.equal(q.courseId,id);
  assert.equal(q.choices?.length,5,'Cinq propositions A-E attendues');
  assert.ok(q.answers?.length>=1&&q.answers.length<=3,'Nombre de reponses interdit');
  assert.equal(new Set(q.answers).size,q.answers.length,'Reponse dupliquee');
  assert.ok(q.answers.every(n=>Number.isInteger(n)&&n>=0&&n<5),'Index reponse invalide');
  assert.equal(q.announcedCorrectCount,q.answers.length,'Cardinalite affichee differente');
  assert.ok(typeof q.explanation==='string'&&q.explanation.length>=35,'Correction non argumentee');
  assert.equal(q.flashcards?.length,1,'Une carte par QCM attendue');
  assert.ok(q.flashcards[0].front?.length>8&&q.flashcards[0].answers?.[0]?.length>8,'Flashcard vide');
  assert.ok(Object.hasOwn(balance,q.difficulty),'Niveau invalide');
  balance[q.difficulty]++;
 }
 equal(balance,{easy:10,medium:25,hard:15},'Repartition des difficultes differente');
 if(questions.length)equal(questions.filter(x=>x.courseId===id),bank,'Miroir questions-5 ou runtime divergent');
 if(deck.length)assert.equal(deck.filter(x=>x.courseId===id).length,50,'Cartes runtime non exposees');
 assert.equal(sheets.filter(s=>s.courseId===id).length,1,'Fiche unique historique perdue');
 return {qcm:50,flashcards:50,source:'official_support'};
}
export function validateStressAddonChange(prior,delivery,oldData,newData,digest){
 const id=stressAddonId,a=delivery.qcmFlashcardsSupplement;
 assert.ok(prior&&prior.courseId===id,'Complement sans cours de base');
 assert.equal(prior.deliveryMode,'sheet_only_first_release');
 assert.equal(delivery.deliveryMode,'sheet_only_first_release');
 const strip=d=>{const o={...d};for(const k of ['qcmFlashcardsSupplement','qcmBank','qcmCount','flashcardCount','vocabularyCount','publicArtifacts','artifactSha256s','blockers'])delete o[k];return o;};
 equal(strip(prior),strip(delivery),'Fiche initiale ou autres metadonnees historiques modifiees');
 equal(delivery.publicArtifacts?.sheet,prior.publicArtifacts?.sheet,'Asset fiche modifie');
 equal(delivery.artifactSha256s?.[prior.sheetResourceId],prior.artifactSha256s?.[prior.sheetResourceId],'Empreinte fiche modifiee');
 equal(delivery.blockers,(prior.blockers||[]).filter(b=>!['qcm','flashcards'].includes(b.resource)),'Blocages non lies supprimes');
 for(const k of ['sheets','infographics','vocals'])equal(oldData[k].filter(x=>x.courseId===id),newData[k].filter(x=>x.courseId===id),'Anciennes ressources modifiees '+k);
 const before=oldData.registry.courses.find(x=>x.id===id),after=newData.registry.courses.find(x=>x.id===id);
 assert.ok(before&&after);
 const stripCourse=c=>{const x={...c};delete x.additionalDocuments;delete x.sourceNote;return x;};
 equal(stripCourse(before),stripCourse(after),'Cours historique restructure');
 equal(after.additionalDocuments.slice(0,before.additionalDocuments.length),before.additionalDocuments,'Documents historiques retires');
 assert.equal(after.additionalDocuments.length,before.additionalDocuments.length+2,'Deux PDFs uniquement autorises');
 const bank=newData.banks?.[a.bankPath]||[];
 assert.equal(bank.filter(x=>x.courseId===id).length,50,'Banque nouvelle incomplete');
 const beforeTerms=new Map(oldData.vocabulary.map(x=>[x.id,x])),afterTerms=newData.vocabulary.filter(x=>x.courseIds?.includes(id));
 assert.equal(afterTerms.length,50,'Vocabulaire du nouveau cours non egal a 50');
 let adds=0,links=0;
 for(const term of afterTerms){const old=beforeTerms.get(term.id);
  if(!old){adds++;assert.deepEqual(term.courseIds,[id]);continue;}
  links++;const now={...term,courseIds:term.courseIds.filter(x=>x!==id)};
  equal(now,old,'Ancienne definition modifiee '+term.id);
 }
 assert.equal(adds,46);assert.equal(links,4);
 assert.equal(a.publicationApproval?.status,'approved');
 assert.equal(a.publicationApproval?.authorization,'explicit_go_publication');
 assert.equal(a.publicationApproval?.scope,'qcm_flashcards_vocabulary_only');
 assert.ok(Number.isFinite(Date.parse(a.publicationApproval.approvedAt)),'Date du GO invalide');
 assert.equal(a.publicationApproval.bundleSha256,digest,'Empreinte du lot non approuve: '+digest);
 return true;
}
