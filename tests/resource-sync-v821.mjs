import fs from 'node:fs';

const read=p=>fs.readFileSync(p,'utf8');
const json=p=>JSON.parse(read(p));
const assert=(v,msg)=>{if(!v)throw new Error(msg)};
const driveId=u=>String(u||'').match(/\/d\/([^/]+)/)?.[1]||null;

const snap=json('resource-audit-v821.json');
const registry=json('course-registry-v741.json').courses||[];
const sheets=[...json('sheets-1.json'),...json('sheets-2.json'),...json('sheets-3.json')];
const infos=json('infographics.json');
const vocals=json('vocals.json');
const ids=new Set(registry.map(x=>x.id));

assert(snap.version==='8.23','Snapshot audit ≠ V8.23');
assert(snap.driveSourceOfTruth?.id==='1pjiBdisjbjSsNWZxwOgueBr-uWCu11Ae','Racine Drive audit inattendue');
assert(registry.length===snap.expectedTotals.courses,`Cours: ${registry.length}/${snap.expectedTotals.courses}`);
assert(sheets.length===snap.expectedTotals.sheets,`Fiches: ${sheets.length}/${snap.expectedTotals.sheets}`);
assert(infos.length===snap.expectedTotals.infographics,`Infographies: ${infos.length}/${snap.expectedTotals.infographics}`);
assert(vocals.length===snap.expectedTotals.vocals,`Vocaux: ${vocals.length}/${snap.expectedTotals.vocals}`);

for(const [type,list] of [['fiche',sheets],['infographie',infos],['vocal',vocals]]){
 for(const x of list)assert(x.courseId&&ids.has(x.courseId),`${type} avec courseId invalide: ${x.title||x.id}`);
}

let v820=[];
for(let n=snap.expectedTotals.v820PackFirst;n<=snap.expectedTotals.v820PackLast;n++){
 const p=`qextra-${String(n).padStart(2,'0')}.txt`;
 assert(fs.existsSync(p),`Pack V8.20 absent: ${p}`);
 const a=json(p);
 assert(Array.isArray(a)&&a.length,`Pack V8.20 vide: ${p}`);
 v820.push(...a);
}
assert(v820.length===snap.expectedTotals.v820QcmImported,`QCM V8.20: ${v820.length}/${snap.expectedTotals.v820QcmImported}`);
for(const q of v820)assert(q.courseId&&ids.has(q.courseId),`QCM V8.20 courseId invalide: ${q.id}`);

const atlasSpecs=[
 ['v814-respiratory-atlas.js','resp_atlas_',8],
 ['v815-urinary-atlas.js','urinary_atlas_',8],
 ['v816-endocrine-atlas.js','endo_atlas_',8],
 ['v817-immune-atlas.js','immu_atlas_',8],
 ['v822-nervous-atlas.js','nerv_atlas_',8],
 ['v823-cardiovascular-atlas.js','cardio_atlas_',8]
];
let atlasBoardCount=0;const atlasFiles=[];
for(const [p,prefix,expected] of atlasSpecs){
 const src=read(p);
 const count=[...src.matchAll(new RegExp("id:'"+prefix,"g"))].length;
 assert(count===expected,`${p}: ${count}/${expected} planches HD`);
 atlasBoardCount+=count;
 for(const m of src.matchAll(/drive\.google\.com\/thumbnail\?id=([^&'"\\]+)/g))atlasFiles.push(m[1]);
 for(const m of src.matchAll(/\bfile:'([^']+)'/g))atlasFiles.push(m[1]);
}
const uniqueAtlasFiles=[...new Set(atlasFiles)];
assert(atlasBoardCount>=snap.expectedTotals.hdAtlasBoards,`Planches HD: ${atlasBoardCount}/${snap.expectedTotals.hdAtlasBoards} minimum`);

const infoIds=new Set(infos.map(x=>driveId(x.url)).filter(Boolean));
const overlap=uniqueAtlasFiles.filter(id=>infoIds.has(id));
assert(overlap.length===0,`Infographies réutilisées comme planches anatomiques: ${overlap.join(', ')}`);

const active=[
 ...sheets.map(x=>({type:'fiche',id:driveId(x.url)})),
 ...infos.map(x=>({type:'infographie',id:driveId(x.url)})),
 ...vocals.map(x=>({type:'vocal',id:x.driveId})),
 ...uniqueAtlasFiles.map(id=>({type:'anatomie',id}))
].filter(x=>x.id);
const seen=new Map();
for(const x of active){if(!seen.has(x.id))seen.set(x.id,[]);seen.get(x.id).push(x.type)}
const dup=[...seen.entries()].filter(([,v])=>v.length>1);
assert(dup.length===0,`Drive IDs dupliqués dans les catalogues actifs: ${dup.map(([id,v])=>id+'='+v.join('/')).join(', ')}`);

const contracts=snap.anatomyFolderContracts||{};
assert(Object.keys(contracts).length===7,'Contrats de dossiers 06 incomplets');
assert(new Set(Object.values(contracts)).size===Object.values(contracts).length,'Dossiers 06 dupliqués dans le snapshot');
for(const courseId of Object.keys(contracts))assert(ids.has(courseId),`CourseId anatomie absent du registre: ${courseId}`);

console.log(`✅ V8.21 audit snapshot: ${registry.length} cours • ${sheets.length} fiches • ${infos.length} infographies • ${vocals.length} vocaux • ${v820.length} QCM V8.20 • ${atlasBoardCount} planches HD`);
console.log('✅ Séparation stricte Infographies / Anatomie et unicité des Drive IDs contrôlées');
