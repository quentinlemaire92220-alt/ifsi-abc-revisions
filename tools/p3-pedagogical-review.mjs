// P3 — triage pédagogique en lecture seule des banques réellement chargées.
// Ne change aucune question, réponse ou flashcard. Aucun accès Drive/Supabase.
import fs from 'node:fs';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import {runtimeDeck} from '../tests/flashcards-runtime-fixture.mjs';
const trim=s=>String(s??'').replace(/\s+/g,' ').trim();
const md=s=>trim(s).replaceAll('|','/').slice(0,125);
export function findQcmBias(questions){
 const groups=new Map(),letters='ABCDE';
 for(const q of questions){
  const courseId=q.courseId||q.course||'sans_course',n=Array.isArray(q.choices)?q.choices.length:0,
    a=Array.isArray(q.answers)?q.answers.slice().sort((x,y)=>x-y):[];
  if(n<2||n>5||!a.length||a.length>4||a.some(x=>!Number.isInteger(x)||x<0||x>=n))continue;
  if(!groups.has(courseId))groups.set(courseId,{id:courseId,label:q.course||courseId,n:0,formats:{}});
  const g=groups.get(courseId);g.n++;
  if(!g.formats[n])g.formats[n]={nq:0,pos:Array(n).fill(0),byCount:{1:[],2:[],3:[],4:[]}};
  const f=g.formats[n];f.nq++;
  for(const x of a)f.pos[x]++;
  f.byCount[a.length].push({sig:a.map(x=>letters[x]).join(''),id:q.id});
 }
 const flagged=[];
 for(const g of groups.values()){
  if(g.n<10)continue;
  const patterns=[];
  for(const [nKey,f] of Object.entries(g.formats)){
   const n=Number(nKey);
   for(const k of [1,2,3,4]){
    const arr=f.byCount[k];
    if(arr.length<6||k===n)continue;
    const sigs=new Map();
    for(const x of arr){const rec=sigs.get(x.sig)||{count:0,ids:[]};rec.count++;rec.ids.push(x.id);sigs.set(x.sig,rec)}
    const [sig,best]=[...sigs].sort((a,b)=>b[1].count-a[1].count)[0]||['',{count:0,ids:[]}];
    const threshold=k===4?.55:.45;
    if(best.count/arr.length>=threshold)patterns.push({
     category:'dominant_answer_combination',choices:n,goodAnswers:k,
     count:best.count,denominator:arr.length,combination:sig,
     questionIds:best.ids.slice(0,25)});
   }
   const total=f.pos.reduce((a,b)=>a+b,0),mean=total/n,min=Math.min(...f.pos),max=Math.max(...f.pos);
   if(f.nq>=20&&(min===0||max>mean*1.65))patterns.push({
    category:'imbalanced_position',choices:n,questions:f.nq,positions:f.pos,
    expectedMean:Math.round(mean*10)/10});
  }
  if(patterns.length)flagged.push({courseId:g.id,label:g.label,questions:g.n,patterns});
 }
 return flagged.sort((a,b)=>b.questions-a.questions||a.courseId.localeCompare(b.courseId,'fr'));
}
export function findFlashcardIssues(cards){
 const seenIds=new Set(),seenFronts=new Map(),problems=[];
 for(const c of cards){
  const reasons=[],front=trim(c.front),answers=c.answers||[],id=trim(c.id||c.qid);
  if(!front||front==='Question de révision')reasons.push('question manquante');
  if(!Array.isArray(answers)||!answers.some(x=>trim(x)&&x!=='Voir le corrigé associé'))reasons.push('réponse manquante');
  if(!c.courseId||!trim(c.theme))reasons.push('cours ou thème absent');
  if(/^[A-E](?:\s*[/,+&]\s*[A-E])+$/i.test(front))reasons.push('libellé ambigu');
  if(seenIds.has(id))reasons.push('ID en double');
  seenIds.add(id);
  const key=(c.courseId||'')+'|'+front.toLocaleLowerCase('fr');
  const earlier=seenFronts.get(key);
  if(earlier)reasons.push('question en double');
  else seenFronts.set(key,{id,answers:(Array.isArray(answers)?answers:[]).map(trim)});
  const sameAnswers=!!earlier&&JSON.stringify(earlier.answers)===JSON.stringify((Array.isArray(answers)?answers:[]).map(trim));
  if(reasons.length)problems.push({id,qid:c.qid||null,courseId:c.courseId||null,front:front.slice(0,160),reasons,duplicateOf:earlier?.id||null,sameAnswers});
 }
 return problems;
}
export function toMarkdown(report){
 const lines=[
 '# P3 — Revue QCM et flashcards','',
 'Analyse **automatique et non clinique** des contenus publiés ; signalement ne signifie pas erreur de fond.',
 '',
 '**'+report.counts.qcmFlaggedCourses+' cours signalé(s) sur '+report.counts.questions+' QCM** · **'+report.counts.flashcardIssues+' flashcards à revoir sur '+report.counts.flashcards+'**.',
 '',
 '## Biais statistiques des réponses QCM','',
 '| Cours | QCM | Motif | Échantillon IDs à examiner |','|---|---:|---|---|'
 ];
 for(const g of report.qcmBias)for(const p of g.patterns){
  let reason=p.category==='dominant_answer_combination'
    ?p.combination+' : '+p.count+'/'+p.denominator+' questions à '+p.goodAnswers+' bonne(s) réponse(s)'
    :'Position '+p.positions.join('/')+' sur '+p.questions+' questions';
  lines.push('| '+md(g.label)+' ('+md(g.courseId)+') | '+g.questions+' | '+md(reason)+' | '+(p.questionIds||[]).slice(0,10).map(md).join(', ')+' |');
 }
 if(!report.qcmBias.length)lines.push('| Aucune alerte | — | — | — |');
 lines.push('','## Flashcards nécessitant un contrôle','',
 '| Cours | Question ID | Signalement | Recto actuel |','|---|---|---|---|');
 for(const x of report.flashcardIssues){
  lines.push('| '+md(x.courseId||'?')+' | '+md(x.qid||x.id)+' | '+x.reasons.map(md).join(', ')+' | '+md(x.front)+' |');
 }
 if(!report.flashcardIssues.length)lines.push('| Aucune alerte | — | — | — |');
 lines.push('','## Décisions à valider','',
 '- Vérifier la qualité pédagogique des distracteurs et les explications **avant** toute éventuelle permutation de propositions.',
 '- Pour chaque flashcard : relire le recto/verso et la source officielle ; confirmer tout changement de sens ou de réponse.',
 '- Pas de correction automatique des réponses, des textes pédagogiques ou des supports.',
 '',
 'Source : runtime local de la PWA, sans scan Google Drive. Ces indicateurs ne certifient pas la justesse du contenu.');
 return lines.join('\n')+'\n';
}
async function main(){
 const {questions,deck}=await runtimeDeck();
 const report={schema:1,version:JSON.parse(fs.readFileSync('build-meta.json','utf8')).version,
  generatedAt:new Date().toISOString(),qcmBias:findQcmBias(questions),
  flashcardIssues:findFlashcardIssues(deck)};
 report.counts={questions:questions.length,flashcards:deck.length,
  qcmFlaggedCourses:report.qcmBias.length,flashcardIssues:report.flashcardIssues.length};
 const out=process.argv.find(x=>x.startsWith('--output='))?.slice(9);
 if(out){fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(report,null,2))}
 const markdown=toMarkdown(report);
 const mdPath=process.argv.find(x=>x.startsWith('--markdown='))?.slice(11);
 if(mdPath){fs.mkdirSync(path.dirname(mdPath),{recursive:true});fs.writeFileSync(mdPath,markdown)}
 // CI : résumé exploitable sans copier les textes QCM dans des logs publics.
 console.log('P3_COUNTS_JSON '+JSON.stringify(report.counts));
 console.log('P3_QCM_COURSES_JSON '+JSON.stringify(report.qcmBias.map(x=>({id:x.courseId,n:x.questions,patterns:x.patterns.map(p=>({category:p.category,combination:p.combination,dominant:p.count,total:p.denominator,positions:p.positions}))}))));
 console.log('P3_FLASHCARD_IDS_JSON '+JSON.stringify(report.flashcardIssues.map(x=>({id:x.id,qid:x.qid,courseId:x.courseId,reasons:x.reasons,duplicateOf:x.duplicateOf,sameAnswers:x.sameAnswers}))));
 if(process.env.GITHUB_STEP_SUMMARY)fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY,markdown);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)main().catch(e=>{console.error('Audit P3 indisponible',e);process.exitCode=1});
