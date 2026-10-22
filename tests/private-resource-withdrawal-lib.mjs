// Retrait déterministe de pointeurs de TRAVAIL déjà publics, sans autoriser
// de nouveau cours, URL, PDF, QCM, flashcard, MP3 ou changement d'approbation.
import {isDeepStrictEqual} from 'node:util';

export const isScriptWorkItem = x =>
  /\bscripts?\s+voc(?:al|aux)\b/i.test(
    String(x?.label||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()
  );

const clone=x=>JSON.parse(JSON.stringify(x));
const driveId=url=>String(url||'').match(/^https:\/\/drive\.google\.com\/(?:file\/d\/|drive\/folders\/)([A-Za-z0-9_-]+)/)?.[1]||null;

export function expectedPublicCourseAfterWithdrawal(course){
 const out=clone(course);
 if(Array.isArray(out.additionalDocuments)){
  out.additionalDocuments=out.additionalDocuments.filter(x=>!isScriptWorkItem(x));
 }
 return out;
}

export function expectedPublicDeliveryAfterWithdrawal(delivery,course){
 const out=clone(delivery),ids=new Set();
 const oldScripts=Array.isArray(out.vocalScripts)?out.vocalScripts:[];
 for(const x of oldScripts){
  if(x.driveId)ids.add(x.driveId);
  const fromUrl=driveId(x.url);if(fromUrl)ids.add(fromUrl);
 }
 for(const x of course?.additionalDocuments||[])if(isScriptWorkItem(x)){
  const id=driveId(x.url);if(id)ids.add(id);
 }
 for(const key of ['08','99']){
  if(out.folders?.[key])ids.add(out.folders[key]);
  if(out.folders)delete out.folders[key];
 }
 if(oldScripts.length)out.scriptsPreparedCount=oldScripts.length;
 delete out.vocalScripts;
 if(out.artifactSha256s)for(const id of ids)delete out.artifactSha256s[id];
 return out;
}

// S'applique UNIQUEMENT à une livraison existante, explicitement approuvée,
// dont l'unique changement est le retrait des pointeurs script / dossiers internes.
export function isApprovedPrivateReferenceWithdrawal(
 courseId,prior,next,oldBundle,newBundle
){
 if(prior?.courseId!==courseId||next?.courseId!==courseId)return false;
 if(prior.publicationApproval?.status!=='approved'||
    prior.publicationApproval?.authorization!=='explicit_go_publication')return false;
 if(!isDeepStrictEqual(next,expectedPublicDeliveryAfterWithdrawal(prior,oldBundle.course)))return false;
 // Conserver les propriétés optionnelles undefined du bundle réel ; JSON clone les perdrait.
 const normalized=structuredClone(oldBundle);
 normalized.course=expectedPublicCourseAfterWithdrawal(normalized.course);
 normalized.scripts=[];
 normalized.artifactSha256s=expectedPublicDeliveryAfterWithdrawal(prior,oldBundle.course).artifactSha256s||{};
 // Les autres propriétés du bundle, y compris les PDF, QCM, MP3 et le lexique,
 // doivent demeurer identiques au bit près (valeurs, pas ordre des propriétés).
 return isDeepStrictEqual(normalized,newBundle);
}
