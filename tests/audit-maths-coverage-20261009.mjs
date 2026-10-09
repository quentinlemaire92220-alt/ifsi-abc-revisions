// Audit de couverture des QCM de mathematiques face aux 8 fiches graphiques.
// Lecture seule : aucune mutation des questions ni de leurs corrections.
import fs from 'node:fs';
import zlib from 'node:zlib';
const read = p=>fs.readFileSync(p,'utf8');
const parse = p=>JSON.parse(read(p));
function gzipBody(raw) {let p=10, flags=raw[3]||0;if(flags&4){const n=raw[p]|(raw[p+1]<<8);p+=2+n}if(flags&8)while(p<raw.length&&raw[p++]);if(flags&16)while(p<raw.length&&raw[p++]);if(flags&2)p+=2;return raw.subarray(p,-8)}
function parsePackText(txt){
 try{return JSON.parse(txt)}
 catch(first){
  const body=txt.trim().replace(/^\s*\[/,'').replace(/\]\s*$/,'');
  const parts=body.split(/}\s*,\s*\{"id":/),recovered=[];
  for(let i=0;i<parts.length;i++){let s=(i?'{"id":':'')+parts[i];if(!s.trim().endsWith('}'))s+='}';try{const q=JSON.parse(s);if(q?.id)recovered.push(q)}catch{}}
  if(recovered.length)return recovered;
  throw first;
 }
}
function decode(p) {
 const src=read(p).trim();
 if(src.startsWith('[')||src.startsWith('{')){const v=parsePackText(src);return Array.isArray(v)?v:v.questions||[]}
 const raw=Buffer.from(src,'base64');
 const txt=(raw[0]===31&&raw[1]===139?(()=>{try{return zlib.gunzipSync(raw)}catch{return zlib.inflateRawSync(gzipBody(raw))}})():raw).toString('utf8');
 const v=parsePackText(txt);return Array.isArray(v)?v:v.questions||[];
}
const schemaRegex=/\b(sch[ée]ma|schema|figure|illustration|diagramme|image\s+ci|ci-dessous|boucle\s+anonyme)\b/i;
const keep=q=>!((q.id!=='pharmaco_031'&&schemaRegex.test(q.question||''))||(/\brep[eè]re\b/i.test(q.question||'')&&/(association|associer|structure|lettre)/i.test(q.question||'')));
const list=[];
for(let i=1;i<=5;i++)list.push(...parse('questions-'+i+'.json'));
const extras=[];
for(const i of [1,2,3,4,5,6,7,...Array.from({length:30},(_,j)=>j+9),46]) {
 const p='qextra-'+String(i).padStart(2,'0')+'.txt';
 if(fs.existsSync(p))extras.push(...decode(p));
}
const override=[];
for(const i of [39,40,41,42,43,44,45,47,48]) {
 const p='qextra-'+String(i).padStart(2,'0')+'.txt';
 if(fs.existsSync(p))override.push(...decode(p));
}
const overridesById=new Map(override.filter(keep).map(q=>[q.id,q]));
const extraFiltered=extras.filter(keep).filter(q=>!overridesById.has(q.id));
extraFiltered.push(...overridesById.values());
const runtime=[...list.filter(keep)];
const seen=new Set(runtime.map(q=>q.id));
for(const q of extraFiltered)if(!seen.has(q.id)){runtime.push(q);seen.add(q.id)}
const math=runtime.filter(q=>q.courseId==='calculs_doses_mathematiques'||/calculs? de doses|math[eé]matiques/i.test(q.course||''));
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const exact=s=>norm(s).replace(/[^a-z0-9]+/g,' ').trim();
const tokens=s=>new Set(exact(s).split(' ').filter(t=>t.length>=3&&!['dans','pour','avec','quelle','quel','quels','sont','plus','combien','correspond'].includes(t)));
const jaccard=(a,b)=>{let common=0;for(const t of a)if(b.has(t))common++;const union=new Set([...a,...b]).size;return union?common/union:0};
function levelOf(q){
 if(Number.isInteger(q.level)&&q.level>=1&&q.level<=10)return q.level;
 const s=(q.theme||'')+' '+(q.question||'');
 if(/buvable|gouttes orales|compte-gouttes/i.test(s))return 5;
 if(/[ée]lectrolyte|kcl|nacl|par litre|par poche|volume ajout/i.test(s))return 7;
 if(/dilution|c1|v1|solution m[eè]re/i.test(s))return 9;
 if(/reconstitution|volume final|poudre/i.test(s))return 8;
 if(/perfusion|d[eé]bit|gouttes\/min|pousse-seringue|seringue [ée]lectrique/i.test(s))return 6;
 if(/pourcent|pour mille|‰|concentration|dosage/i.test(s))return 3;
 if(/comprim|ampoule|dose|proportion|r[eè]gle de trois/i.test(s))return 4;
 if(/dur[eé]e|horaire|heure|minute|temps/i.test(s))return 2;
 if(/probl[eè]me complet|cas |type feuille/i.test(s))return 10;
 return 1;
}
const ficheTitles={
 1:'Methodes mathematiques',2:'Conversions',3:'Proportionnalite',4:'Concentrations',
 5:'Dilutions et reconstitutions',6:'Calculs de doses',7:'Debits de perfusion',8:'Pousse-seringue electrique'
};
const coverage=(q)=>{
 const t=norm((q.theme||'')+' '+(q.question||'')),level=levelOf(q);
 if(/pousse.seringue|seringue electrique|\bpse\b/.test(t))return 8;
 if(/dilut|reconstit|solution mere|c1\s*[x×*]\s*v1|c2\s*[x×*]\s*v2/.test(t))return 5;
 if(/pourcentage|pour mille|‰|concentr|%|dosage/.test(t))return 4;
 if(/proportion|produit en croix|regle de trois/.test(t))return 3;
 if(/perfusion|gouttes\/min|debit|perfusion|volume restant/.test(t))return 7;
 if(/comprim|buvable|gouttes orale|ampoule|dose prescrite|flacon|medicament|dose/.test(t))return 6;
 if(/convert|equival|unite|kg|µg|litre/.test(t))return 2;
 if(/horaire|duree|heure|minute|temps|methode|fraction/.test(t))return 1;
 return ({1:2,2:1,3:4,4:6,5:6,6:7,7:5,8:5,9:5,10:1})[level];
};
const categories={};
for(let i=1;i<=8;i++)categories[i]={fiche:ficheTitles[i],n:0,levels:{easy:0,medium:0,hard:0,undefined:0},sample:[]};
const levelCounts=Object.fromEntries(Array.from({length:10},(_,i)=>[i+1,0]));
const themes={}, flags=[], difficulty={easy:0,medium:0,hard:0,missing:0}, answerCounts={};
for(const q of math){
 const group=coverage(q),c=categories[group];
 c.n++;if(c.sample.length<4)c.sample.push({id:q.id,theme:q.theme,q:q.question.slice(0,190)});
 const d=['easy','medium','hard'].includes(q.difficulty)?q.difficulty:'missing';
 difficulty[d]++;c.levels[d==='missing'?'undefined':d]++;
 const l=levelOf(q);levelCounts[l]++;
 themes[q.theme||'']=(themes[q.theme||'']||0)+1;
 answerCounts[q.answers.length]=(answerCounts[q.answers.length]||0)+1;
 if(!q.explanation||q.explanation.trim().length<80)flags.push({kind:'CORRECTION_COURTE',id:q.id,length:q.explanation?.trim().length||0,question:q.question});
 if(!Array.isArray(q.answers)||q.answers.length<1||q.answers.length>3||q.answers.length===q.choices.length)flags.push({kind:'REPONSES',id:q.id,answers:q.answers,choiceN:q.choices?.length});
 if(/kcl|electrolyt|nacl|par poche|par litre|volume ajoute/.test(norm((q.theme||'')+' '+q.question))) flags.push({kind:'NOTION_SANS_FICHE_EXPLICITE',id:q.id,level:l,theme:q.theme,question:q.question});
 if(!/(\d|[a-z])/.test(q.explanation||'')) flags.push({kind:'ARGUMENTATION_VIDE',id:q.id,question:q.question});
}
const exactGroups=new Map();
for(const q of math){const k=exact(q.question);if(!exactGroups.has(k))exactGroups.set(k,[]);exactGroups.get(k).push(q.id)}
const duplicated=[...exactGroups.entries()].filter(([k,ids])=>ids.length>1).map(([k,ids])=>({ids,q:k}));
const near=[];
for(let i=0;i<math.length;i++)for(let j=i+1;j<math.length;j++){
 const a=math[i],b=math[j],sa=tokens(a.question),sb=tokens(b.question);
 if(sa.size<4||sb.size<4)continue;
 const sim=jaccard(sa,sb);
 if(sim>=0.82&&!duplicated.some(g=>g.ids.includes(a.id)&&g.ids.includes(b.id)))near.push({sim:Math.round(sim*100)/100,ids:[a.id,b.id],a:a.question,b:b.question});
}
near.sort((a,b)=>b.sim-a.sim);
const all=math.map(q=>({id:q.id,fiche:coverage(q),niveau:levelOf(q),difficulty:q.difficulty||null,theme:q.theme,question:q.question,choices:q.choices,answers:q.answers,explanation:q.explanation}));
const report={total:math.length,distribution:categories,levels:levelCounts,topics:themes,difficulty,answerCounts,exactDuplicates:duplicated,nearDuplicates:near.slice(0,25),nearTotal:near.length,flags:flags.slice(0,100),flagCount:flags.length,
 inferredDifficulty:math.filter(q=>!['easy','medium','hard'].includes(q.difficulty)).map(q=>q.id)};
console.log('MATH_QCM_AUDIT_JSON='+JSON.stringify(report));
console.log('MATH_QCM_ALL_JSON='+JSON.stringify(all));
console.log('MATH_QCM_AUDIT_COMPLETE '+math.length+' questions read-only');
