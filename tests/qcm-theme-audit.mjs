import fs from 'node:fs';
import zlib from 'node:zlib';

const read=p=>fs.readFileSync(p,'utf8');
const json=p=>JSON.parse(read(p));
const schemaRegex=/\b(sch[ée]ma|schema|figure|illustration|diagramme|image\s+ci|ci-dessous|boucle\s+anonyme)\b/i;
const keepQuestion=q=>{const t=q?.question||'';if(schemaRegex.test(t))return false;if(/\brep[eè]re\b/i.test(t)&&/(association|associer|structure|lettre)/i.test(t))return false;return true};
function gzipBody(raw){let p=10,flags=raw[3]||0;if(flags&4){const n=raw[p]|(raw[p+1]<<8);p+=2+n}if(flags&8)while(p<raw.length&&raw[p++]);if(flags&16)while(p<raw.length&&raw[p++]);if(flags&2)p+=2;return raw.subarray(p,-8)}
function parsePackText(txt){try{return JSON.parse(txt)}catch(first){const body=txt.trim().replace(/^\s*\[/,'').replace(/\]\s*$/,'');const parts=body.split(/}\s*,\s*\{"id":/);const recovered=[];for(let i=0;i<parts.length;i++){let s=(i?'{"id":':'')+parts[i];if(!s.trim().endsWith('}'))s+='}';try{const q=JSON.parse(s);if(q&&q.id)recovered.push(q)}catch{}}if(recovered.length)return recovered;throw first}}
function decodePackFile(p){const source=read(p).trim();if(source.startsWith('[')||source.startsWith('{')){const x=parsePackText(source);return Array.isArray(x)?x:(x.questions||[])}const raw=Buffer.from(source,'base64');let txt;if(raw.length>2&&raw[0]===0x1f&&raw[1]===0x8b){try{txt=zlib.gunzipSync(raw).toString('utf8')}catch{txt=zlib.inflateRawSync(gzipBody(raw)).toString('utf8')}}else txt=raw.toString('utf8');const x=parsePackText(txt);return Array.isArray(x)?x:(x.questions||[])}

let base=[];for(let i=1;i<=5;i++)base.push(...json(`questions-${i}.json`));
let extras=[];for(const i of [1,2,3,4,5,6,7,...Array.from({length:30},(_,j)=>j+9)]){const p=`qextra-${String(i).padStart(2,'0')}.txt`;if(fs.existsSync(p))extras.push(...decodePackFile(p))}
let override=[];for(const i of [39,40,41,42,43,44,45]){const p=`qextra-${String(i).padStart(2,'0')}.txt`;if(fs.existsSync(p))override.push(...decodePackFile(p))}
base=base.filter(keepQuestion);extras=extras.filter(keepQuestion);override=override.filter(keepQuestion);
if(override.length){const map=new Map();for(const q of override)if(q?.id)map.set(q.id,q);const finalOverride=[...map.values()];const ids=new Set(finalOverride.map(q=>q.id));extras=extras.filter(q=>!ids.has(q.id));extras.push(...finalOverride)}
const seen=new Set(base.map(q=>q.id)),runtime=[...base];for(const q of extras)if(!seen.has(q.id)){runtime.push(q);seen.add(q.id)}

const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const course=q=>q.course||q.theme||'Sans cours';
const theme=q=>{const t=String(q.theme||'').trim(),c=String(q.course||'').trim();return t&&norm(t)!==norm(c)?t:'Général'};
const map=new Map();
for(const q of runtime){const c=course(q),t=theme(q),m=map.get(c)||new Map();m.set(t,(m.get(t)||0)+1);map.set(c,m)}
const rows=[...map.entries()].map(([course,themes])=>{
  const arr=[...themes.entries()].sort((a,b)=>b[1]-a[1]);
  return {course,total:arr.reduce((s,x)=>s+x[1],0),themeCount:arr.length,largest:arr[0]?.[1]||0,themes:arr};
}).sort((a,b)=>b.total-a.total);
console.log(`✅ Audit thèmes runtime: ${runtime.length} QCM • ${rows.length} cours`);
for(const r of rows){
  console.log(`COURSE|${r.course}|${r.total}|${r.themeCount}|${r.largest}|${r.themes.map(([t,n])=>t+':'+n).join(' ; ')}`);
}
