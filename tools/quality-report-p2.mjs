// P2 : contrôle local GitHub, en lecture seule (aucun accès direct Drive/Supabase).
import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {pathToFileURL} from 'node:url';
const readJson=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const text=v=>String(v??'').trim();
const clean=v=>text(v).replace(/[\r\n|]/g,' ').slice(0,160);
const hash=v=>createHash('sha256').update(text(v)).digest('hex').slice(0,12);
const ATLAS=[
 ['v814-respiratory-atlas.js',[['systeme_respiratoire','resp_atlas_']]],
 ['v815-urinary-atlas.js',[['systeme_urinaire','urinary_atlas_']]],
 ['v816-endocrine-atlas.js',[['systeme_endocrinien','endo_atlas_']]],
 ['v817-immune-atlas.js',[['systeme_immunitaire','immu_atlas_']]],
 ['v822-nervous-atlas.js',[['systeme_nerveux','nerv_atlas_']]],
 ['v823-cardiovascular-atlas.js',[['systeme_cardiovasculaire','cardio_atlas_']]],
 ['v824-digestive-atlas.js',[['systeme_digestif','digest_atlas_']]],
 ['v829-locomotor-atlas.js',[['appareil_locomoteur','loco_atlas_']]],
 ['v8318-microscopic-atlas.js',[
   ['biomolecules','micro_biomol_'],['cellules_tissus','micro_cell_'],
   ['diagnostic_bacteriologie','micro_bact_'],['virus','micro_virus_']]]
];
const makeIssue=(severity,type,key,detail,courseId='')=>({
 id:type+':'+key,severity,type,detail:clean(detail),courseId:clean(courseId)
});
export function scanQuality({questions,deck,registry,snapshot,sheets,infographics,vocals,atlasCounts={}}){
 const issues=new Map(),courseIds=new Set(registry.courses.map(c=>c.id));
 const add=(severity,type,key,detail,cid='')=>{
  const issue=makeIssue(severity,type,key,detail,cid);
  if(!issues.has(issue.id))issues.set(issue.id,issue);
 };
 const counts={courses:registry.courses.length,questions:questions.length,flashcards:deck.length,
  sheets:sheets.length,infographics:infographics.length,vocals:vocals.length,
  atlas:Object.values(atlasCounts).reduce((a,n)=>a+n,0)};
 const expected=snapshot.expectedTotals||{};
 for(const key of ['courses','sheets','infographics','vocals'])
  if(Number.isInteger(expected[key])&&counts[key]<expected[key])
   add('error','resource_count_below_reference',key,counts[key]+'/'+expected[key]);
 if(Number.isInteger(expected.hdAtlasBoards)&&counts.atlas!==expected.hdAtlasBoards)
  add('error','atlas_total','all',counts.atlas+'/'+expected.hdAtlasBoards);
 for(const [id,n] of Object.entries(snapshot.atlasBoardContracts||{}))
  if((atlasCounts[id]||0)!==n)add('error','atlas_contract',id,(atlasCounts[id]||0)+'/'+n,id);
 const driveId=u=>{
  const s=text(u),m=s.match(/\/d\/([^/?]+)/)||s.match(/[?&]id=([^&]+)/);
  return m?.[1]||(/^[A-Za-z0-9_-]{20,}$/.test(s)?s:null);
 };
 const ids=new Map();
 const register=(type,item)=>{
  if(item.courseId&&!courseIds.has(item.courseId))
   add('error','resource_course_unknown',type+':'+hash(item.id||item.title||item.url||''),'Ressource liée à un cours inconnu',item.courseId);
  const id=driveId(item.driveId||item.url||item.file);
  if(!id)return;
  if(ids.has(id))add('error','drive_id_duplicate',hash(id),ids.get(id)+' et '+type+' partagent le même fichier');
  else ids.set(id,type);
 };
 sheets.forEach(x=>register('fiche',x));
 infographics.forEach(x=>register('infographie',x));
 vocals.forEach(x=>register('vocal',x));
 for(const c of registry.courses){
  if(c.showInCourses===false)continue;
  if(!c.officialSupportUrl&&!(c.officialSupportItems||[]).length)
   add('warning','official_link_not_catalogued',c.id,'Lien officiel non référencé ; fichier Drive non vérifié',c.id);
  if(!sheets.some(x=>x.courseId===c.id))
   add('warning','sheet_not_catalogued',c.id,'Fiche non directement cataloguée ; vérifier les cours parents',c.id);
 }
 const known=new Set(),groups=new Map();
 for(const q of questions){
  const id=text(q.id),cid=text(q.courseId||q.course||q.theme||'sans_cours');
  if(!id){add('error','qcm_missing_id',hash(JSON.stringify(q).slice(0,250)),'Identifiant absent',cid);continue}
  if(known.has(id))add('error','qcm_duplicate_id',id,'ID utilisé plusieurs fois',cid);
  known.add(id);
  if(!text(q.question))add('error','qcm_question_missing',id,'Énoncé absent',cid);
  if(!Array.isArray(q.choices)||![4,5].includes(q.choices.length)){
   add('error','qcm_choices_invalid',id,'Quatre ou cinq propositions attendues',cid);continue;
  }
  if(q.choices.some(x=>!text(x)))add('error','qcm_blank_choice',id,'Proposition vide',cid);
  if(!Array.isArray(q.answers)||q.answers.length<1||q.answers.length>3||
     new Set(q.answers).size!==q.answers.length||
     q.answers.some(x=>!Number.isInteger(x)||x<0||x>=q.choices.length))
   add('error','qcm_answers_invalid',id,'Index ou nombre de bonnes réponses incorrect',cid);
  if(!text(q.explanation))add('error','qcm_explanation_missing',id,'Corrigé absent',cid);
  if(!q.courseId)add('warning','qcm_course_inferred',id,'courseId non explicite dans le QCM',cid);
  else if(!courseIds.has(q.courseId))add('error','qcm_course_unknown',id,'courseId absent du registre',cid);
  const arr=q.answers;
  if(!Array.isArray(arr)||!arr.length||arr.some(x=>!Number.isInteger(x)||x<0||x>=q.choices.length))continue;
  const fmt=q.choices.length,group=groups.get(cid)||{total:0,byFormat:new Map()};
  group.total++;
  const data=group.byFormat.get(fmt)||{n:0,pos:Array(fmt).fill(0),byGood:new Map()};
  data.n++;
  for(const idx of arr)data.pos[idx]++;
  const by=data.byGood.get(arr.length)||[];
  by.push(arr.slice().sort((a,b)=>a-b).join(','));
  data.byGood.set(arr.length,by);
  group.byFormat.set(fmt,data);groups.set(cid,group);
 }
 for(const [cid,group] of groups){
  if(group.total<10)continue;
  for(const [n,d] of group.byFormat){
   for(const [k,arr] of d.byGood){
    if(arr.length<6||k===n)continue;
    const signatures=new Map();
    for(const key of arr)signatures.set(key,(signatures.get(key)||0)+1);
    if(Math.max(...signatures.values())/arr.length>=(k===4?.55:.45))
     add('warning','qcm_balance_combination',cid+':'+n+':'+k,'Combinaison dominante dans '+arr.length+' QCM',cid);
   }
   const m=d.pos.reduce((a,b)=>a+b,0)/n;
   if(d.n>=20&&(Math.min(...d.pos)===0||Math.max(...d.pos)>m*1.65))
    add('warning','qcm_balance_position',cid+':'+n,'Positions '+d.pos.join(' / '),cid);
  }
 }
 const cardIds=new Set(),fronts=new Set();
 for(const c of deck){
  const id=text(c.id||c.qid)||hash(c.front),cid=text(c.courseId||'sans_cours'),front=text(c.front),ans=c.answers;
  if(cardIds.has(id))add('warning','flashcard_duplicate_id',id,'ID de flashcard répété',cid);
  cardIds.add(id);
  if(!front||front==='Question de révision')add('warning','flashcard_missing_front',id,'Recto vide ou générique',cid);
  if(!Array.isArray(ans)||!ans.some(x=>text(x)&&text(x)!=='Voir le corrigé associé'))
   add('warning','flashcard_missing_answer',id,'Verso inexploitable',cid);
  if(!c.courseId||!text(c.theme))add('warning','flashcard_course_theme_missing',id,'Cours ou thème absent',cid);
  if(/^[A-E](?:\s*[/,+&]\s*[A-E])+$/i.test(front))
   add('warning','flashcard_ambiguous_front',id,'Recto constitué de lettres seules',cid);
  const key=cid+'|'+front.toLocaleLowerCase('fr');
  if(front&&fronts.has(key))add('warning','flashcard_duplicate_front',id,'Recto identique dans le même cours',cid);
  fronts.add(key);
 }
 return {counts,issues:[...issues.values()].sort((a,b)=>a.id.localeCompare(b.id,'fr'))};
}
export function compareReports(current,baseline=null){
 const a=new Set((baseline?.issues||[]).map(x=>x.id)),b=new Set(current.issues.map(x=>x.id));
 return {baselineAvailable:!!baseline,new:current.issues.filter(x=>!a.has(x.id)),
  existing:current.issues.filter(x=>a.has(x.id)),
  resolved:(baseline?.issues||[]).filter(x=>!b.has(x.id)),
  errors:current.issues.filter(x=>x.severity==='error'),
  warnings:current.issues.filter(x=>x.severity==='warning')};
}
export function toMarkdown(report,c){
 const lines=['## Contrôle qualité IFSI ABC — P2','',
 'Analyse locale du catalogue et du runtime. **Aucun scan Google Drive, aucune validation médicale, aucune donnée personnelle ou analytique.**','',
 '| Ressources | Total |','|---|---:|'];
 for(const [k,v] of Object.entries(report.counts))lines.push('| '+clean(k)+' | '+v+' |');
 lines.push('','**Erreurs bloquantes : '+c.errors.length+'** · **Avertissements : '+c.warnings.length+'**.',
  c.baselineAvailable?'**Comparaison à la base PR : '+c.new.length+' nouvelles, '+c.existing.length+' connues, '+c.resolved.length+' corrigées.**':'Comparaison à la base non disponible (exécution sur main).',
  '','### Anomalies '+(c.baselineAvailable?'nouvelles':'observées'));
 const list=c.baselineAvailable?c.new:report.issues;
 if(list.length===0)lines.push('Aucune nouvelle anomalie.');
 else{
  lines.push('| Niveau | Règle | Référence | Description |','|---|---|---|---|');
  for(const x of list.slice(0,60))lines.push('| '+clean(x.severity)+' | '+clean(x.type)+' | '+clean(x.id)+' | '+clean(x.detail)+' |');
  if(list.length>60)lines.push('Autres anomalies dans le rapport JSON : '+(list.length-60)+'.');
 }
 lines.push('','Les avertissements sont à vérifier, ils ne bloquent pas la PR. Les erreurs structurelles bloquent. Le rapport ne modifie aucun contenu.');
 return lines.join('\n')+'\n';
}
async function main(){
 const args=process.argv.slice(2),get=k=>args.find(x=>x.startsWith('--'+k+'='))?.slice(k.length+3);
 if(get('root'))process.chdir(path.resolve(get('root')));
 const {runtimeDeck}=await import('../tests/flashcards-runtime-fixture.mjs');
 const registry=readJson('course-registry-v741.json'),snapshot=readJson('resource-audit-v821.json');
 const sheets=[1,2,3].flatMap(i=>readJson('sheets-'+i+'.json'));
 const infographics=readJson('infographics.json'),vocals=readJson('vocals.json');
 const {questions,deck}=await runtimeDeck();
 const atlasCounts={};
 for(const [file,groups] of ATLAS){
  const src=fs.readFileSync(file,'utf8');
  for(const [id,prefix] of groups)atlasCounts[id]=[...src.matchAll(new RegExp("id:'"+prefix,'g'))].length;
 }
 const report={schemaVersion:1,kind:'ifsi-p2-quality',version:readJson('build-meta.json').version,
  generatedAt:new Date().toISOString(),commit:process.env.GITHUB_SHA||null,
  ...scanQuality({questions,deck,registry,snapshot,sheets,infographics,vocals,atlasCounts})};
 const baselinePath=get('baseline'),baseline=baselinePath&&fs.existsSync(baselinePath)?readJson(baselinePath):null;
 const comparison=compareReports(report,baseline),md=toMarkdown(report,comparison);
 if(get('output')){fs.mkdirSync(path.dirname(path.resolve(get('output'))),{recursive:true});fs.writeFileSync(get('output'),JSON.stringify({...report,comparison},null,2));}
 if(get('summary'))fs.appendFileSync(get('summary'),md);
 console.log(md);
 if(comparison.errors.length&&!args.includes('--no-fail'))process.exitCode=1;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(path.resolve(process.argv[1])).href)
 main().catch(e=>{console.error('Audit P2 interrompu :',e.stack||e);process.exitCode=1});
