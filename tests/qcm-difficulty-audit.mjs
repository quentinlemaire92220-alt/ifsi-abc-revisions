// Audit pédagogique des difficultés explicites vs estimées.
import fs from 'node:fs';
import zlib from 'node:zlib';
import assert from 'node:assert/strict';

const read=p=>fs.readFileSync(p,'utf8');
const json=p=>JSON.parse(read(p));
const VALID=new Set(['easy','medium','hard']);
const schemaRegex=/\b(sch[ée]ma|schema|figure|illustration|diagramme|image\s+ci|ci-dessous|boucle\s+anonyme)\b/i;
const keepQuestion=q=>{const t=q?.question||'';if(q?.id==='pharmaco_031')return true;if(schemaRegex.test(t))return false;if(/\brep[eè]re\b/i.test(t)&&/(association|associer|structure|lettre)/i.test(t))return false;return true};

function gzipBody(raw){let p=10,flags=raw[3]||0;if(flags&4){const n=raw[p]|(raw[p+1]<<8);p+=2+n}if(flags&8)while(p<raw.length&&raw[p++]);if(flags&16)while(p<raw.length&&raw[p++]);if(flags&2)p+=2;return raw.subarray(p,-8)}
function parsePackText(txt){try{return JSON.parse(txt)}catch(first){const body=txt.trim().replace(/^\s*\[/,'').replace(/\]\s*$/,'');const parts=body.split(/}\s*,\s*\{"id":/);const recovered=[];for(let i=0;i<parts.length;i++){let s=(i?'{"id":':'')+parts[i];if(!s.trim().endsWith('}'))s+='}';try{const q=JSON.parse(s);if(q&&q.id)recovered.push(q)}catch{}}if(recovered.length)return recovered;throw first}}
function decodePackFile(p){const source=read(p).trim();if(source.startsWith('[')||source.startsWith('{'))return parsePackText(source);const raw=Buffer.from(source,'base64');let txt;if(raw.length>2&&raw[0]===0x1f&&raw[1]===0x8b){try{txt=zlib.gunzipSync(raw).toString('utf8')}catch{txt=zlib.inflateRawSync(gzipBody(raw)).toString('utf8')}}else txt=raw.toString('utf8');const parsed=parsePackText(txt);return Array.isArray(parsed)?parsed:(parsed.questions||[])}

function level(q){
  if(VALID.has(q?.difficulty))return q.difficulty;
  const t=((q?.question||'')+' '+(q?.theme||'')+' '+(q?.course||'')).toLowerCase();let score=0;
  if((q?.answers||[]).length>=3)score+=2;else if((q?.answers||[]).length===2)score+=1;
  if(/sch[ée]ma|figure|caryotype|pcr|physiopath|m[ée]canisme|r[ée]gulation|association|associer|interpr|cascade|cons[ée]quence|diagnostic|g[ée]n[ée]tiq|gaz du sang|hom[ée]ostasie/.test(t))score+=2;
  if(/sauf|fausse|fausses|incorrect|ne .* pas|exception/.test(t))score+=1;
  if((q?.choices||[]).some(c=>String(c).length>95))score+=1;
  if(/d[ée]finition|correspond|d[ée]signe|quel est|quelle est/.test(t))score-=1;
  return score>=4?'hard':score>=2?'medium':'easy';
}
const courseKey=q=>q.courseId||q.course||q.theme||'sans-cours';
const summarize=list=>{
  const out={total:list.length,explicit:0,inferred:0,invalid:0,levels:{easy:0,medium:0,hard:0},courses:new Map()};
  for(const q of list){
    const d=q?.difficulty,valid=VALID.has(d),missing=d==null||d==='';
    if(valid)out.explicit++;else if(missing)out.inferred++;else out.invalid++;
    out.levels[level(q)]++;
    const k=courseKey(q),c=out.courses.get(k)||{total:0,explicit:0,inferred:0,invalid:0};
    c.total++;if(valid)c.explicit++;else if(missing)c.inferred++;else c.invalid++;out.courses.set(k,c);
  }
  return out;
};
const show=(label,s)=>{
  const pct=s.total?Math.round(s.explicit/s.total*1000)/10:0;
  console.log(`✅ ${label}: ${s.total} QCM • difficulté explicite ${s.explicit} (${pct} %) • estimée ${s.inferred} • invalide ${s.invalid} • easy/medium/hard ${s.levels.easy}/${s.levels.medium}/${s.levels.hard}`);
  const missing=[...s.courses.entries()].map(([course,x])=>({course,...x})).filter(x=>x.inferred||x.invalid).sort((a,b)=>b.inferred-a.inferred||b.total-a.total).slice(0,20);
  console.log('📊 Principales banques sans niveau explicite:');
  for(const x of missing)console.log(` - ${x.course}: ${x.inferred}/${x.total} estimés${x.invalid?` • ${x.invalid} invalides`:''}`);
};

const packFiles=fs.readdirSync('.').filter(p=>/^qextra-\d+\.txt$/.test(p)).sort();
let raw=[];
for(let i=1;i<=5;i++){const p=`questions-${i}.json`;raw.push(...json(p))}
for(const p of packFiles){try{raw.push(...decodePackFile(p))}catch(e){console.warn(`Pack ignoré ${p}: ${e.message}`)}}
for(const p of packFiles){const n=Number(p.match(/qextra-(\d+)\.txt/)?.[1]||0);if(n<46)continue;const qs=decodePackFile(p);assert.ok(qs.every(q=>VALID.has(q?.difficulty)),`Nouveau pack ${p}: difficulty explicite obligatoire sur chaque QCM`)}

let base=[];for(let i=1;i<=5;i++)base.push(...json(`questions-${i}.json`));
let extras=[];for(const i of [1,2,3,4,5,6,7,...Array.from({length:30},(_,j)=>j+9),46]){const p=`qextra-${String(i).padStart(2,'0')}.txt`;if(fs.existsSync(p))extras.push(...decodePackFile(p))}
let override=[];for(const i of [39,40,41,42,43,44,45,47,48,49]){const p=`qextra-${String(i).padStart(2,'0')}.txt`;if(fs.existsSync(p))override.push(...decodePackFile(p))}
base=base.filter(keepQuestion);extras=extras.filter(keepQuestion);override=override.filter(keepQuestion);
if(override.length){const map=new Map();for(const q of override)if(q?.id)map.set(q.id,q);const finalOverride=[...map.values()];const ids=new Set(finalOverride.map(q=>q.id));extras=extras.filter(q=>!ids.has(q.id));extras.push(...finalOverride)}
const seen=new Set(base.map(q=>q.id)),runtime=[...base];for(const q of extras)if(!seen.has(q.id)){runtime.push(q);seen.add(q.id)}

const rawSummary=summarize(raw),runtimeSummary=summarize(runtime);
assert.equal(rawSummary.invalid,0,'Valeur difficulty invalide dans les sources');
assert.equal(runtimeSummary.invalid,0,'Valeur difficulty invalide dans le runtime');
assert.ok(rawSummary.inferred<=3356,`Dette difficulty source en hausse: ${rawSummary.inferred}/3356`);
assert.ok(runtimeSummary.inferred<=1779,`Dette difficulty runtime en hausse: ${runtimeSummary.inferred}/1779`);
show('Sources QCM',rawSummary);
show('Runtime QCM',runtimeSummary);
console.log(`ℹ️ Le runtime conserve l’estimation automatique uniquement lorsque difficulty est absent.`);
console.log('✅ Les futurs packs qextra-46+ devront renseigner easy / medium / hard sur chaque QCM.');
