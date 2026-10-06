import fs from 'node:fs';
import zlib from 'node:zlib';

const read=p=>fs.readFileSync(p,'utf8');
const json=p=>JSON.parse(read(p));
const assert=(v,msg)=>{if(!v)throw new Error(msg)};
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const registry=json('course-registry-v741.json');
const courses=registry.courses||[];
const courseMap=new Map(courses.map(c=>[c.id,c]));
const aliases=c=>[...new Set([c.label,...(c.aliases||[])].map(norm).filter(Boolean))];
const allAliases=new Map(courses.map(c=>[c.id,aliases(c)]));
const driveId=x=>((x?.url||'').match(/\/d\/([^/]+)/)||[])[1]||x?.driveId||null;
const schemaRegex=/\b(sch[ée]ma|schema|figure|illustration|diagramme|image\s+ci|ci-dessous|boucle\s+anonyme)\b/i;
const keepQuestion=q=>{const t=q?.question||'';if(q?.id==='pharmaco_031')return true;if(schemaRegex.test(t))return false;if(/\brep[eè]re\b/i.test(t)&&/(association|associer|structure|lettre)/i.test(t))return false;return true};
function gzipBody(raw){let p=10,flags=raw[3]||0;if(flags&4){const n=raw[p]|(raw[p+1]<<8);p+=2+n}if(flags&8)while(p<raw.length&&raw[p++]);if(flags&16)while(p<raw.length&&raw[p++]);if(flags&2)p+=2;return raw.subarray(p,-8)}
function parsePackText(txt){try{return JSON.parse(txt)}catch(first){const body=txt.trim().replace(/^\s*\[/,'').replace(/\]\s*$/,'');const parts=body.split(/}\s*,\s*\{"id":/);const recovered=[];for(let i=0;i<parts.length;i++){let s=(i?'{"id":':'')+parts[i];if(!s.trim().endsWith('}'))s+='}';try{const q=JSON.parse(s);if(q&&q.id)recovered.push(q)}catch{}}if(recovered.length)return recovered;throw first}}
function decodePackFile(p){const source=read(p).trim();if(source.startsWith('[')||source.startsWith('{'))return parsePackText(source);const raw=Buffer.from(source,'base64');let txt;if(raw.length>2&&raw[0]===0x1f&&raw[1]===0x8b){try{txt=zlib.gunzipSync(raw).toString('utf8')}catch{txt=zlib.inflateRawSync(gzipBody(raw)).toString('utf8')}}else txt=raw.toString('utf8');return parsePackText(txt)}


function resolveLabel(label){
  const n=norm(label);if(!n)return {status:'unmatched'};
  const exact=courses.filter(c=>allAliases.get(c.id).includes(n));
  if(exact.length===1)return {status:'exact',courseId:exact[0].id};
  if(exact.length>1)return {status:'ambiguous',courseIds:exact.map(c=>c.id)};
  const contained=courses.filter(c=>allAliases.get(c.id).some(a=>a.length>=5&&(n.includes(a)||a.includes(n))));
  if(contained.length===1)return {status:'inferred',courseId:contained[0].id};
  if(contained.length>1)return {status:'ambiguous',courseIds:contained.map(c=>c.id)};
  return {status:'unmatched'};
}

let base=[];for(let i=1;i<=5;i++)base.push(...json(`questions-${i}.json`));
let extras=[],override=[];
for(const i of [1,2,3,4,5,6,7,...Array.from({length:30},(_,j)=>j+9),46]){const p=`qextra-${String(i).padStart(2,'0')}.txt`;if(!fs.existsSync(p))continue;const parsed=decodePackFile(p);extras.push(...(Array.isArray(parsed)?parsed:(parsed.questions||[])))}
for(const i of [39,40,41,42,43,44,45]){const p=`qextra-${String(i).padStart(2,'0')}.txt`;if(!fs.existsSync(p))continue;const parsed=decodePackFile(p);override.push(...(Array.isArray(parsed)?parsed:(parsed.questions||[])))}
base=base.filter(keepQuestion);extras=extras.filter(keepQuestion);override=override.filter(keepQuestion);
if(override.length){const overrideIds=new Set(override.map(q=>q.id).filter(Boolean));extras=extras.filter(q=>!overrideIds.has(q.id));extras.push(...override)}
const seen=new Set(base.map(q=>q.id));const qs=[...base];for(const q of extras)if(!seen.has(q.id)){qs.push(q);seen.add(q.id)}
const vocals=json('vocals.json');
const sheets=[...json('sheets-1.json'),...json('sheets-2.json'),...json('sheets-3.json')];
const infos=json('infographics.json');
const byCourse=Object.fromEntries(courses.map(c=>[c.id,{label:c.label,qcm:0,vocals:0,sheets:0,infographics:0}]));
const errors=[];

assert(registry.version==='8.30.23',`Version registre inattendue: ${registry.version}`);
assert(registry.sourceOfTruth?.driveRootId==='1pjiBdisjbjSsNWZxwOgueBr-uWCu11Ae','Racine Drive canonique absente');
assert(registry.resourcePolicy?.requireExplicitCourseId===true,'Politique courseId explicite absente');
assert(courseMap.get('calculs_doses_mathematiques')?.domain==='E','Calculs de doses doit être classé dans le domaine E');assert(courseMap.has('ist_hors_vih'),'Cours IST hors VIH absent du registre');

for(const q of qs){
  const r=q.courseId?(courseMap.has(q.courseId)?{courseId:q.courseId}:{status:'invalid'}):resolveLabel(q.course||q.theme);
  if(!r.courseId)errors.push(`QCM sans courseId résolvable: ${q.id} — ${q.course||q.theme||''}`);
  else byCourse[r.courseId].qcm++;
}
for(const v of vocals){
  if(!v.courseId||!courseMap.has(v.courseId))errors.push(`Vocal courseId invalide: ${v.id} — ${v.courseId||'absent'}`);
  else byCourse[v.courseId].vocals++;
}

function auditResources(items,type,key){
  const ids=new Set();
  for(const x of items){
    const id=driveId(x);
    if(!x.courseId)errors.push(`${type} sans courseId explicite: ${x.title||x.label||id}`);
    else if(!courseMap.has(x.courseId))errors.push(`${type} courseId inconnu: ${x.courseId} — ${x.title||x.label||id}`);
    else byCourse[x.courseId][key]++;
    if(!x.displayTitle?.trim())errors.push(`${type} sans displayTitle: ${x.title||id}`);
    if(!id)errors.push(`${type} sans Drive ID: ${x.title||x.displayTitle||''}`);
    else if(ids.has(id))errors.push(`Drive ID dupliqué dans ${type}: ${id}`);
    else ids.add(id);
    if(/ARCHIVE/i.test(x.title||''))errors.push(`${type} archive indexée comme active: ${x.title}`);
  }
}
auditResources(sheets,'Fiche','sheets');
auditResources(infos,'Infographie','infographics');

const allIds=new Set(),crossDup=[];
for(const x of [...sheets,...infos]){const id=driveId(x);if(!id)continue;if(allIds.has(id))crossDup.push(id);allIds.add(id)}
if(crossDup.length)errors.push(`Drive IDs dupliqués entre catalogues: ${[...new Set(crossDup)].join(', ')}`);

const forbiddenLegacy=new Set([
'1zzLw5yLwXdUV_msy4os2II7C3cq3_EU1','10bxvto-3uDqwm-QEQIWwZ8zvZ1pyk1fc','1VkbJqEiEGvUIGI8K43CBW6c3qdNCyCOn',
'1rxZT1LobeHw_0xG2yYKdXS6KrW1cRwlB','1eRBGb0ogXJKl2P1SfvSz8emuA8Db4c-7','10J-E5h7z3HgjosJOFpTbl-G3-afmixe4',
'15lGkcjGeZLkrreEsaS6CkxqIvIz_vyAA','1NmFADqMOHyXlx9mmuvyIZd9mb4REbLuG','1ZgpyJwMeTfjI5M5udVbXRiQlg7srV4Av',
'119OcTOnFiSIWzxL17lXSgocMyWGMt7h2','1OfB1qP8lt8T1uYBXmG_5UmIQx_m7dSN3','1X4UMXOyn5wvKiqsXQN7LBXA48z4gWXmk',
'15mfuwRe2PVp4tpDTzdMaKsvdU6Az5Zjv','1U6Bjwpb2_bv8h4kz4YMXglimmdnBSAma','1Jf_vwaXhvQiR8aI8pMba07rwoCvdpbSo',
'1HpID-1xn6uTNYWEmTuNxeQMJ9Lumx8an'
]);
for(const id of allIds)if(forbiddenLegacy.has(id))errors.push(`Ancienne copie réintroduite dans le catalogue: ${id}`);

const count=(id,key)=>byCourse[id]?.[key]||0;
if(count('introduction_droit','qcm')!==50)errors.push(`Introduction au droit: 50 QCM attendus, ${count('introduction_droit','qcm')} trouvés`);
if(count('introduction_droit','sheets')<1)errors.push('Introduction au droit: fiche manquante');
if(count('psychologie_sante','sheets')<1)errors.push('Psychologie de la santé: fiche manquante');
if(count('pharmacologie','qcm')!==60)errors.push(`Introduction à la pharmacologie: 60 QCM attendus, ${count('pharmacologie','qcm')} trouvés`);
if(count('pharmacologie','sheets')<1)errors.push('Introduction à la pharmacologie: fiche manquante');
if(count('systeme_cardiovasculaire','sheets')<1)errors.push('Système cardiovasculaire: fiche manquante');
if(count('systeme_digestif','sheets')<2)errors.push('Système digestif incomplet: moins de 2 fiches');
if(count('systeme_digestif','infographics')<9)errors.push('Système digestif incomplet: moins de 9 infographies');
if(count('appareil_locomoteur','sheets')<2)errors.push('Système locomoteur: anatomie/traumatologie manquante');
if(count('calculs_doses_mathematiques','infographics')<6)errors.push('Calculs de doses: pack d’infographies canonique incomplet');
if(count('epistemologie_savoirs','infographics')<8)errors.push('Épistémologie: infographies canoniques incomplètes');

console.log(`\n🧭 Audit ressources V${registry.version}`);
console.log(`Registre: ${courses.length} courseId • ${sheets.length} fiches • ${infos.length} infographies • ${vocals.length} vocaux`);
for(const [id,x] of Object.entries(byCourse)){if(x.qcm+x.vocals+x.sheets+x.infographics)console.log(`- ${id}: ${x.qcm} QCM | ${x.sheets} fiches | ${x.infographics} infos | ${x.vocals} vocaux`)}
if(errors.length){console.error('\n❌ Audit ressources:',errors.join('\n- '));process.exit(1)}
console.log('✅ Toutes les fiches et infographies ont un courseId explicite, un titre d’affichage et un Drive ID unique.');
console.log('✅ Les anciennes copies connues et les archives sont exclues du catalogue actif.');
