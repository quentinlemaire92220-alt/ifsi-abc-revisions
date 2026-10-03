import fs from 'node:fs';
import zlib from 'node:zlib';

const read=p=>fs.readFileSync(p,'utf8');
const json=p=>JSON.parse(read(p));
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const registry=json('course-registry-v741.json');
const courses=registry.courses||[];
const courseMap=new Map(courses.map(c=>[c.id,c]));
const aliases=c=>[...new Set([c.label,...(c.aliases||[])].map(norm).filter(Boolean))];
const allAliases=new Map(courses.map(c=>[c.id,aliases(c)]));
const schemaRegex=/\b(sch[ée]ma|schema|figure|illustration|diagramme|image\s+ci|ci-dessous|boucle\s+anonyme)\b/i;
const keepQuestion=q=>{const t=q?.question||'';if(schemaRegex.test(t))return false;if(/\brep[eè]re\b/i.test(t)&&/(association|associer|structure|lettre)/i.test(t))return false;return true};

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
function infoLabel(t){return String(t||'').replace(/\.pdf$/i,'').replace(/^UE_S\d+_[A-Z]\d+_/i,'').replace(/_Partie\d+_/i,'_').replace(/_Infographie_\d+_/i,' — ').replace(/_Pack_Infographies/i,' — Pack infographies').replace(/_/g,' ').replace(/\s+/g,' ').trim()}
function resolveResource(x,type){
  if(x?.courseId)return courseMap.has(x.courseId)?{status:'explicit',courseId:x.courseId}:{status:'invalid_explicit',courseIds:[x.courseId]};
  const text=norm(type==='sheet'?`${x.label||''} ${x.title||''} ${x.ue||''}`:`${infoLabel(x.title)} ${x.title||''}`),scores=[];
  for(const c of courses){let best=0;for(const a of allAliases.get(c.id)){if(a.length<5)continue;if(text.includes(a))best=Math.max(best,a.length)}if(best)scores.push({id:c.id,score:best})}
  if(!scores.length)return {status:'unmatched'};
  scores.sort((a,b)=>b.score-a.score);const top=scores[0].score,candidates=scores.filter(x=>x.score===top).map(x=>x.id);
  return candidates.length===1?{status:'inferred',courseId:candidates[0]}:{status:'ambiguous',courseIds:candidates};
}

let base=[];for(let i=1;i<=5;i++)base.push(...json(`questions-${i}.json`));
let extras=[];for(let i=1;i<=7;i++){const raw=Buffer.from(read(`qextra-${String(i).padStart(2,'0')}.txt`).trim(),'base64');const parsed=JSON.parse(zlib.gunzipSync(raw).toString('utf8'));extras.push(...(Array.isArray(parsed)?parsed:(parsed.questions||[])))}
base=base.filter(keepQuestion);extras=extras.filter(keepQuestion);const seen=new Set(base.map(q=>q.id));const qs=[...base];for(const q of extras)if(!seen.has(q.id)){qs.push(q);seen.add(q.id)}
const vocals=json('vocals.json');const sheets=[...json('sheets-1.json'),...json('sheets-2.json'),...json('sheets-3.json')];const infos=json('infographics.json');
const byCourse=Object.fromEntries(courses.map(c=>[c.id,{label:c.label,qcm:0,vocals:0,sheets:0,infographics:0}]));
const errors=[];

for(const q of qs){const r=q.courseId?resolveResource(q,'question'):resolveLabel(q.course||q.theme);if(!r.courseId)errors.push(`QCM sans courseId résolvable: ${q.id} — ${q.course||q.theme||''}`);else byCourse[r.courseId].qcm++}
for(const v of vocals){const r=resolveResource(v,'vocal');if(r.status!=='explicit')errors.push(`Vocal sans courseId explicite valide: ${v.id} — ${v.course}`);else{const labelResolved=resolveLabel(v.course);if(labelResolved.courseId!==v.courseId)errors.push(`Vocal courseId incohérent: ${v.id} → ${v.courseId} / ${v.course}`);byCourse[v.courseId].vocals++}}

function auditResources(items,type,key){const unmatched=[],ambiguous=[],invalid=[];for(const x of items){const r=resolveResource(x,type);const label=type==='sheet'?(x.label||x.title):infoLabel(x.title);if(r.status==='explicit'||r.status==='inferred')byCourse[r.courseId][key]++;else if(r.status==='ambiguous')ambiguous.push(`${label} => ${r.courseIds.join(', ')}`);else if(r.status==='invalid_explicit')invalid.push(`${label} => ${r.courseIds.join(', ')}`);else unmatched.push(label)}return {unmatched,ambiguous,invalid}}
const sheetAudit=auditResources(sheets,'sheet','sheets');const infoAudit=auditResources(infos,'info','infographics');
for(const x of sheetAudit.ambiguous)errors.push(`Fiche ambiguë: ${x}`);for(const x of infoAudit.ambiguous)errors.push(`Infographie ambiguë: ${x}`);for(const x of sheetAudit.invalid)errors.push(`Fiche courseId invalide: ${x}`);for(const x of infoAudit.invalid)errors.push(`Infographie courseId invalide: ${x}`);

const baseline=registry.auditBaseline||{};
if(Number.isInteger(baseline.unmatchedSheets)&&sheetAudit.unmatched.length!==baseline.unmatchedSheets)errors.push(`Nombre de fiches non rattachées modifié: ${sheetAudit.unmatched.length} au lieu de ${baseline.unmatchedSheets}. Nouveau contenu à classer ?`);
if(Number.isInteger(baseline.unmatchedInfographics)&&infoAudit.unmatched.length!==baseline.unmatchedInfographics)errors.push(`Nombre d'infographies non rattachées modifié: ${infoAudit.unmatched.length} au lieu de ${baseline.unmatchedInfographics}. Nouveau contenu à classer ?`);

console.log(`\n🧭 Audit rattachements V${registry.version}`);
console.log(`Registre: ${courses.length} courseId stables`);
for(const [id,x] of Object.entries(byCourse)){if(x.qcm+x.vocals+x.sheets+x.infographics)console.log(`- ${id}: ${x.qcm} QCM | ${x.sheets} fiches | ${x.infographics} infos | ${x.vocals} vocaux`)}
console.log(`\nNon rattachées (tolérées/baseline): ${sheetAudit.unmatched.length} fiches | ${infoAudit.unmatched.length} infographies`);
if(sheetAudit.unmatched.length)console.log('Fiches hors registre:',sheetAudit.unmatched.join(' | '));
if(infoAudit.unmatched.length)console.log('Infographies hors registre:',infoAudit.unmatched.join(' | '));
if(errors.length){console.error('\n❌ Audit courseId:',errors.join('\n- '));process.exit(1)}
console.log('✅ Aucun rattachement ambigu ou courseId invalide.');
