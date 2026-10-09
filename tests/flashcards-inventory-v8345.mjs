import fs from 'node:fs';
import vm from 'node:vm';

const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const files=fs.readdirSync('.').filter(x=>/^questions-\d+\.json$/.test(x)||/^qextra-\d+\.txt$/.test(x)).sort();
const all=[];
for(const file of files){
  try{
    const a=JSON.parse(fs.readFileSync(file,'utf8'));
    if(Array.isArray(a))for(const q of a)all.push({...q,__file:file});
  }catch{}
}
const dedup=new Map();
for(const q of all)if(q?.id)dedup.set(q.id,q);
const questions=[...dedup.values()];
const registry=JSON.parse(fs.readFileSync('course-registry-v741.json','utf8'));
const courses=registry.courses||[];
const byId=new Map(courses.map(c=>[c.id,c]));
function resolveCourse(q){
  if(q.courseId&&byId.has(q.courseId))return q.courseId;
  const n=norm(q.course||q.theme||'');
  if(!n)return null;
  const hits=courses.filter(c=>[c.label,...(c.aliases||[])].some(a=>{const x=norm(a);return x===n||(x.length>=5&&(n.includes(x)||x.includes(n)))}));
  return hits.length===1?hits[0].id:null;
}
const grouped=new Map(courses.map(c=>[c.id,[]]));
for(const q of questions){const id=resolveCourse(q);if(id&&grouped.has(id)){q.courseId=id;grouped.get(id).push(q)}}

const window={
  IFSI_V741:{
    getRegistry:()=>registry,
    resourcesForCourse:id=>({questions:grouped.get(id)||[],sheets:[],vocals:[],infographics:[]})
  },
  IFSI_V79:{
    themeOf:q=>String(q.theme||'Général').trim()||'Général',
    difficultyOf:q=>q.difficulty||'medium'
  }
};
const context={
  window,
  localStorage:{getItem:()=>null,setItem:()=>{}},
  document:{getElementById:()=>null,querySelector:()=>null,querySelectorAll:()=>[]},
  setInterval:()=>0,clearInterval:()=>{},setTimeout:()=>0,clearTimeout:()=>{},
  scrollTo:()=>{},MutationObserver:class{observe(){}},console
};
vm.createContext(context);
vm.runInContext(fs.readFileSync('v8338-flashcards.js','utf8'),context);
const api=window.IFSI_V8338_FLASHCARDS;
if(!api)throw new Error('Moteur Flashcards non exposé');
api.rebuild();
const deck=api.getDeck();

const reContext=/\b(?:support|diapo(?:sitive)?\s*\d*|dans le cours|selon le cours|cours\b|cité(?:e|es|s)?|mentionné(?:e|es|s)?|présenté(?:e|es|s)?|proposé(?:e|es|s)?|suivant(?:e|es|s)?|indiqué(?:e|es|s)?|exemple|figure|schéma|document|ci-dessus|ci-dessous)\b/i;
const reMeta=/\b(?:propositions?|affirmations?)\b|\b(?:sont|est) (?:exactes?|justes?|correctes?)\b|\bassociations?\b.*\b(?:justes?|exactes?|correctes?)\b|\bcorrespondent au support\b|\bvaleurs ou définitions\b/i;
const reVague=/que faut-il retenir|la hiérarchie correcte|quelle valeur .*\bdiapo|correspondent au support|dans l['’]exemple|selon le support|dans ce cours|qcm oral|^concernant\s+.+\?$|^(?:le|la|les|l['’])\s+[^?]{2,60}\?$/i;
const reBareAcronym=/«\s*[A-ZÀ-Ý]{2,6}[0-9₂₃]*[+⁺\-−⁻]*\s*»/;
const reGenericPair=/À quoi correspond\s+«\s*(?:Capteur|Convection|Conduction|Évaporation|Rayonnement)\s*»\s*\?/i;
const rePair=/\bassociation|associer|\b(?:mécanisme|composant|cible|cellule|structure|organe)\s*[-–—→]\s*(?:exemple|fonction|rôle|effet)|«[^»]+[-–—][^»]+»/i;
const countWords={deux:2,trois:3,quatre:4,cinq:5,six:6,sept:7,huit:8,neuf:9,dix:10};
function expected(front){const f=front.toLowerCase(),m=f.match(/\b([2-9]|10|deux|trois|quatre|cinq|six|sept|huit|neuf|dix)\s+(?:(?:grands?|grandes?|principaux?|principales?)\s+)?(?:classes?|types?|étapes?|phases?|familles?|éléments?|signes?|aspects?|axes?|parties?|catégories?|mécanismes?|fonctions?|propriétés?|caractéristiques?|facteurs?|critères?)\b/);if(!m)return null;return /^\d+$/.test(m[1])?Number(m[1]):countWords[m[1]]||null}
function key(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\barnm\b/g,'arn messager').replace(/[^a-z0-9%]+/g,' ').trim()}
const audit={green:[],rewrite:[],split:[],reject:[]};
for(const c of deck){
  const front=String(c.front||'').replace(/\s+/g,' ').trim();
  const answers=(c.answers||[]).filter(Boolean);
  const explanation=String(c.explanation||''),sourceMeta=/\b(?:support(?: de cours)?|dans ce cours|selon le cours|QCM\s+oral|diapo(?:sitive)?\s*\d*)\b/i.test(front+' '+explanation),contextDep=reContext.test(front),meta=reMeta.test(front),vague=reVague.test(front)||reBareAcronym.test(front)||reGenericPair.test(front),pair=rePair.test(front);
  const n=expected(front),countMismatch=!!n&&answers.length!==n;
  const duplicateAnswers=new Set(answers.map(key)).size!==answers.length;
  const tooBroad=answers.length>=3 && (pair||/quels sont|quelles sont|quelles associations|quelles valeurs|quelles fonctions/i.test(front));
  let bucket='green',reasons=[];
  if(contextDep||vague||sourceMeta||countMismatch){bucket='reject';if(contextDep)reasons.push('dépend du support/contexte');if(vague)reasons.push('formulation vague ou sigle non développé');if(sourceMeta)reasons.push('métadonnée de cours/support visible');if(countMismatch)reasons.push(`recto annonce ${n}, verso contient ${answers.length}`)}
  else if(meta||duplicateAnswers){bucket='rewrite';if(meta)reasons.push('formulation QCM/meta');if(duplicateAnswers)reasons.push('réponses dupliquées')}
  else if(pair||tooBroad){bucket='split';reasons.push('à scinder en cartes atomiques')}
  audit[bucket].push({...c,front,answers,reasons});
}
const byCourse={};
for(const [bucket,cards] of Object.entries(audit))for(const c of cards){
  const x=byCourse[c.courseId]??={label:c.course,green:0,rewrite:0,split:0,reject:0,total:0};
  x[bucket]++;x.total++;byCourse[c.courseId]=x;
}
const courseStats=courses.map(course=>{
  const courseQuestions=grouped.get(course.id)||[];
  const qcmCount=courseQuestions.length;
  const sourceFiles=[...new Set(courseQuestions.map(q=>q.__file).filter(Boolean))];
  const sampleQuestions=courseQuestions.slice(0,3).map(q=>({id:q.id,question:q.question,theme:q.theme}));
  const cards=deck.filter(c=>c.courseId===course.id);
  const coveredQcm=new Set(cards.map(c=>c.qid)).size;
  const quality=byCourse[course.id]||{label:course.label,green:0,rewrite:0,split:0,reject:0,total:0};
  const generatedCards=cards.length;
  const issues=quality.rewrite+quality.split+quality.reject;
  return{
    id:course.id,label:course.label,qcmCount,generatedCards,coveredQcm,sourceFiles,sampleQuestions,
    coverageRate:qcmCount?Math.round(coveredQcm/qcmCount*1000)/10:0,
    green:quality.green,rewrite:quality.rewrite,split:quality.split,reject:quality.reject,
    rejectRate:generatedCards?Math.round(quality.reject/generatedCards*1000)/10:0,
    issueRate:generatedCards?Math.round(issues/generatedCards*1000)/10:0
  }
}).filter(x=>x.qcmCount>0);
const top=courseStats.map(x=>({...x,total:x.generatedCards,issues:x.rewrite+x.split+x.reject}))
  .sort((a,b)=>b.issues-a.issues||b.generatedCards-a.generatedCards).slice(0,20);
const sample=o=>o.slice(0,120).map(c=>({id:c.qid,course:c.course,theme:c.theme,front:c.front,answers:c.answers,reasons:c.reasons}));
const report={
  sourceFiles:files.length,
  rawRows:all.length,
  uniqueQuestions:questions.length,
  linkedQuestions:[...grouped.values()].reduce((n,a)=>n+a.length,0),
  generatedCards:deck.length,
  counts:Object.fromEntries(Object.entries(audit).map(([k,v])=>[k,v.length])),
  issueRate:deck.length?Math.round((audit.rewrite.length+audit.split.length+audit.reject.length)/deck.length*1000)/10:0,
  courseStats,
  topCourses:top,
  samples:{reject:sample(audit.reject),rewrite:sample(audit.rewrite),split:sample(audit.split)}
};
console.log('FLASHCARD_INVENTORY_JSON');
console.log(JSON.stringify(report,null,2));
