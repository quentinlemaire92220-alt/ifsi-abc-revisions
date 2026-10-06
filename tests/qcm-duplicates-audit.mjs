// Audit qualité des doublons QCM actifs.
import fs from 'node:fs';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';

const read=p=>fs.readFileSync(p,'utf8');
const json=p=>JSON.parse(read(p));
const schemaRegex=/\b(sch[ée]ma|schema|figure|illustration|diagramme|image\s+ci|ci-dessous|boucle\s+anonyme)\b/i;
const keepQuestion=q=>{const t=q?.question||'';if(schemaRegex.test(t))return false;if(/\brep[eè]re\b/i.test(t)&&/(association|associer|structure|lettre)/i.test(t))return false;return true};

function gzipBody(raw){let p=10,flags=raw[3]||0;if(flags&4){const n=raw[p]|(raw[p+1]<<8);p+=2+n}if(flags&8)while(p<raw.length&&raw[p++]);if(flags&16)while(p<raw.length&&raw[p++]);if(flags&2)p+=2;return raw.subarray(p,-8)}
function parsePackText(txt){try{return JSON.parse(txt)}catch(first){const body=txt.trim().replace(/^\s*\[/,'').replace(/\]\s*$/,'');const parts=body.split(/}\s*,\s*\{"id":/);const recovered=[];for(let i=0;i<parts.length;i++){let s=(i?'{"id":':'')+parts[i];if(!s.trim().endsWith('}'))s+='}';try{const q=JSON.parse(s);if(q&&q.id)recovered.push(q)}catch{}}if(recovered.length)return recovered;throw first}}
function decodePackFile(p){const source=read(p).trim();if(source.startsWith('[')||source.startsWith('{')){const x=parsePackText(source);return Array.isArray(x)?x:(x.questions||[])}const raw=Buffer.from(source,'base64');let txt;if(raw.length>2&&raw[0]===0x1f&&raw[1]===0x8b){try{txt=zlib.gunzipSync(raw).toString('utf8')}catch{txt=zlib.inflateRawSync(gzipBody(raw)).toString('utf8')}}else txt=raw.toString('utf8');const x=parsePackText(txt);return Array.isArray(x)?x:(x.questions||[])}

const exactNorm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').replace(/\s+/g,' ').trim();
const looseNorm=s=>exactNorm(s).replace(/\b(?:le|la|les|un|une|des|du|de|d|l|au|aux|et|ou|dans|sur|pour|par|avec|sans|est|sont|etre|concernant|parmi|selon|quel|quelle|quels|quelles)\b/g,' ').replace(/\s+/g,' ').trim();
const tokens=s=>new Set(looseNorm(s).split(' ').filter(x=>x.length>=3));
const jaccard=(a,b)=>{let inter=0;for(const x of a)if(b.has(x))inter++;const union=new Set([...a,...b]).size;return union?inter/union:0};
const course=q=>q.courseId||q.course||q.theme||'sans-cours';
const answerSig=q=>(q.answers||[]).slice().sort((a,b)=>a-b).join(',');
const choiceSig=q=>(q.choices||[]).map(exactNorm).join('||');
const sourceById=new Map();

let base=[];for(let i=1;i<=5;i++){const p=`questions-${i}.json`,a=json(p);for(const q of a)sourceById.set(q.id,p);base.push(...a)}
let extras=[];for(const i of [1,2,3,4,5,6,7,...Array.from({length:30},(_,j)=>j+9)]){const p=`qextra-${String(i).padStart(2,'0')}.txt`;if(fs.existsSync(p)){const a=decodePackFile(p);for(const q of a)if(!sourceById.has(q.id))sourceById.set(q.id,p);extras.push(...a)}}
let override=[];for(const i of [39,40,41,42,43,44,45]){const p=`qextra-${String(i).padStart(2,'0')}.txt`;if(fs.existsSync(p)){const a=decodePackFile(p);for(const q of a)sourceById.set(q.id,p);override.push(...a)}}
base=base.filter(keepQuestion);extras=extras.filter(keepQuestion);override=override.filter(keepQuestion);
if(override.length){const map=new Map();for(const q of override)if(q?.id)map.set(q.id,q);const finalOverride=[...map.values()];const ids=new Set(finalOverride.map(q=>q.id));extras=extras.filter(q=>!ids.has(q.id));extras.push(...finalOverride)}
const seen=new Set(base.map(q=>q.id)),runtime=[...base];for(const q of extras)if(!seen.has(q.id)){runtime.push(q);seen.add(q.id)}

const idCounts=new Map();for(const q of runtime)idCounts.set(q.id,(idCounts.get(q.id)||0)+1);
const duplicateIds=[...idCounts].filter(([,n])=>n>1);
assert.equal(duplicateIds.length,0,`IDs dupliqués runtime: ${duplicateIds.map(([id])=>id).join(', ')}`);

const exactMap=new Map();
for(const q of runtime){const k=exactNorm(q.question);if(!k)continue;(exactMap.get(k)||exactMap.set(k,[]).get(k)).push(q)}
const exact=[...exactMap.values()].filter(g=>new Set(g.map(q=>q.id)).size>1);

const samePayload=[];
const payloadMap=new Map();
for(const q of runtime){const k=exactNorm(q.question)+'###'+choiceSig(q)+'###'+answerSig(q);(payloadMap.get(k)||payloadMap.set(k,[]).get(k)).push(q)}
for(const g of payloadMap.values())if(new Set(g.map(q=>q.id)).size>1)samePayload.push(g);

const byCourse=new Map();
for(const q of runtime){const k=course(q);(byCourse.get(k)||byCourse.set(k,[]).get(k)).push(q)}
const near=[];
for(const [c,qs] of byCourse){
  const prepared=qs.map(q=>({q,t:tokens(q.question),n:exactNorm(q.question)})).filter(x=>x.t.size>=4);
  for(let i=0;i<prepared.length;i++)for(let j=i+1;j<prepared.length;j++){
    const a=prepared[i],b=prepared[j];if(a.n===b.n)continue;
    const ratio=Math.min(a.t.size,b.t.size)/Math.max(a.t.size,b.t.size);if(ratio<.65)continue;
    const sim=jaccard(a.t,b.t);if(sim>=.86)near.push({course:c,sim,a:a.q,b:b.q});
  }
}
near.sort((x,y)=>y.sim-x.sim);
const calcRuntime=runtime.filter(q=>course(q)==='calculs_doses_mathematiques');
const numericSeq=s=>(String(s??'').match(/\d+(?:[,.]\d+)?/g)||[]).map(x=>x.replace(',','.')).join('|');
const calcSameData=[];
for(let i=0;i<calcRuntime.length;i++)for(let j=i+1;j<calcRuntime.length;j++){
  const a=calcRuntime[i],b=calcRuntime[j],na=numericSeq(a.question),nb=numericSeq(b.question);
  if(!na||na!==nb)continue;
  const sim=jaccard(tokens(a.question),tokens(b.question));
  if(sim>=.55)calcSameData.push({sim,a,b,data:na});
}
calcSameData.sort((x,y)=>y.sim-x.sim);
const nearCalc=near.filter(x=>x.course==='calculs_doses_mathematiques');
const nearContent=near.filter(x=>x.course!=='calculs_doses_mathematiques');
const exactSameCourse=exact.filter(g=>new Set(g.map(course)).size===1);

console.log(`✅ Audit doublons runtime: ${runtime.length} QCM • IDs dupliqués 0 • groupes d’énoncés identiques ${exact.length} (même cours ${exactSameCourse.length}) • payloads strictement identiques ${samePayload.length} • quasi-doublons contenu ${nearContent.length} • variantes calcul ${nearCalc.length} • calculs mêmes données ${calcSameData.length}`);
if(exact.length){
  console.log('🔁 Énoncés identiques avec IDs différents:');
  for(const g of exact.slice(0,30))console.log(' - '+g.map(q=>q.id+' ['+course(q)+'] {'+(sourceById.get(q.id)||'?')+'}').join(' ↔ ')+' :: '+g[0].question);
}
if(samePayload.length){
  console.log('🧬 Doublons stricts question + choix + réponses:');
  for(const g of samePayload.slice(0,30))console.log(' - '+g.map(q=>q.id+' ['+course(q)+']').join(' ↔ '));
}
if(nearContent.length){
  console.log('🟠 Quasi-doublons de contenu hors exercices de calcul (similarité ≥ 0,86):');
  for(const x of nearContent.slice(0,40))console.log(` - ${x.sim.toFixed(2)} • ${x.a.id} {${sourceById.get(x.a.id)||'?'}} ↔ ${x.b.id} {${sourceById.get(x.b.id)||'?'}} [${x.course}] :: "${x.a.question}" / "${x.b.question}"`);
}
if(nearCalc.length)console.log(`ℹ️ ${nearCalc.length} paires proches sont des variantes numériques de calcul.`);
if(calcSameData.length){console.log('🔢 Calculs avec les mêmes données numériques:');for(const x of calcSameData.slice(0,30))console.log(` - ${x.a.id} {${sourceById.get(x.a.id)||'?'}} ↔ ${x.b.id} {${sourceById.get(x.b.id)||'?'}} • données ${x.data} :: "${x.a.question}" / "${x.b.question}"`)}

// Plafonds de non-régression : à réduire après nettoyage, jamais augmenter.
assert.equal(exact.length,0,'Énoncé QCM identique détecté dans le runtime');
assert.equal(samePayload.length,0,'Doublon strict question + choix + réponses détecté');
assert.equal(nearContent.length,0,'Quasi-doublon de contenu QCM détecté');
assert.equal(calcSameData.length,0,'Exercices de calcul utilisant les mêmes données détectés');
