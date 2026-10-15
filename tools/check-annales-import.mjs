#!/usr/bin/env node
// Contrôle structurel et blocage des annales non validées. Ne versionner AUCUN lot privé.
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
export function validateAnnales(payload,registry,{publish=false}={}){
 const items=Array.isArray(payload)?payload:payload?.items;
 if(!Array.isArray(items))return{total:0,errors:['Le lot doit être un tableau ou contenir items.'],warnings:[],publishable:false};
 const courses=new Set((registry?.courses||[]).map(c=>c.id)),ids=new Set(),stems=new Map(),errors=[],warnings=[];
 const err=(id,msg)=>errors.push(id+': '+msg),warn=(id,msg)=>warnings.push(id+': '+msg);
 let mapped=0,approved=0;
 for(const [index,q] of items.entries()){
  const id=String(q?.id||('Ligne '+(index+1))),choices=q?.choices,answers=q?.answers;
  if(ids.has(id))err(id,'Identifiant déjà utilisé');ids.add(id);
  if(!q||typeof q!=='object'||Array.isArray(q)){err(id,'Question invalide');continue}
  if(q.sourceKind!=='annales_privees_2025'||!q.sourceOriginalId||!/annales.+2025/i.test(q.sourceCaption||''))err(id,'Provenance des annales absente');
  if(!Number.isInteger(q.sourcePage)||q.sourcePage<=0)warn(id,'Page source manquante');
  if(typeof q.question!=='string'||q.question.trim().length<12)err(id,'Énoncé manquant');
  else {const key=norm(q.question),previous=stems.get(key);if(previous)err(id,'Énoncé identique à '+previous);else stems.set(key,id);
   if(/ci-dessus|ci-dessous|voir la photo|selon le schéma|sur la figure/i.test(q.question))warn(id,'Contexte visuel à vérifier')}
  if(!Array.isArray(choices)||choices.length<4||choices.length>5||choices.some(x=>typeof x!=='string'||!x.trim()))err(id,'4 ou 5 propositions attendues');
  else if(new Set(choices.map(norm)).size!==choices.length)err(id,'Propositions identiques');
  if(!Array.isArray(answers)||answers.length<1||answers.length>3||new Set(answers).size!==answers.length||answers.some(i=>!Number.isInteger(i)||i<0||i>=((choices||[]).length)))err(id,'Il faut 1 à 3 réponses valides distinctes');
  if(typeof q.explanation!=='string'||q.explanation.trim().length<30)err(id,'Explication insuffisante');
  if(!q.theme||/annales.+2025/i.test(q.theme))(publish?err:warn)(id,'Renseigner un véritable thème du cours, pas la provenance des annales');
  if(!q.courseId||!courses.has(q.courseId))(publish?err:warn)(id,'Cours 2026 manquant');else mapped++;
  if(q.reviewState!=='validated'||q.distractorFeedbackVerified!==true)(publish?err:warn)(id,'Réponses et distracteurs non validés');
  if(q.releaseApproved!==true)(publish?err:warn)(id,'GO publication absent');else approved++;
 }
 return{total:items.length,mapped,approved,errors,warnings,publishable:errors.length===0&&(!publish||approved===items.length&&mapped===items.length)};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const files=process.argv.slice(2).filter(x=>!x.startsWith('--')),publish=process.argv.includes('--publish');
 if(!files.length){console.error('Usage: node tools/check-annales-import.mjs lot.json [course-registry-v741.json] [--publish]');process.exitCode=2}
 else {const [src,registry='course-registry-v741.json']=files;const report=validateAnnales(JSON.parse(fs.readFileSync(src,'utf8')),JSON.parse(fs.readFileSync(registry,'utf8')),{publish});console.log(JSON.stringify(report,null,2));if(!report.publishable)process.exitCode=1}
}
