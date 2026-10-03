import fs from 'node:fs';
import zlib from 'node:zlib';

const read=p=>fs.readFileSync(p,'utf8');
const json=p=>JSON.parse(read(p));
const assert=(v,msg)=>{if(!v)throw new Error(msg)};
const schemaRegex=/\b(sch[ée]ma|schema|figure|illustration|diagramme|image\s+ci|ci-dessous|boucle\s+anonyme)\b/i;
const keepQuestion=q=>{const t=q?.question||'';if(schemaRegex.test(t))return false;if(/\brep[eè]re\b/i.test(t)&&/(association|associer|structure|lettre)/i.test(t))return false;return true};

let base=[];
for(let i=1;i<=5;i++)base.push(...json(`questions-${i}.json`));
let extras=[];
for(let i=1;i<=7;i++){
  const name=`qextra-${String(i).padStart(2,'0')}.txt`;
  const raw=Buffer.from(read(name).trim(),'base64');
  const parsed=JSON.parse(zlib.gunzipSync(raw).toString('utf8'));
  extras.push(...(Array.isArray(parsed)?parsed:(parsed.questions||[])));
}
base=base.filter(keepQuestion);
extras=extras.filter(keepQuestion);
const seen=new Set(base.map(q=>q.id));
const runtime=[...base];
for(const q of extras)if(!seen.has(q.id)){runtime.push(q);seen.add(q.id)}

const schemaIds=['resp_003','resp_013','resp_015'];
const schemaSource=read('schema-v10.js');
for(const id of schemaIds){assert(schemaSource.includes(`"id":"${id}"`)||schemaSource.includes(`'${id}'`),`Schéma ${id} absent de schema-v10.js`);assert(!seen.has(id),`Le schéma ${id} ferait doublon avec la banque filtrée`);seen.add(id)}

assert(runtime.length+schemaIds.length>=700,`Banque trop petite: ${runtime.length+schemaIds.length}`);
assert(new Set(runtime.map(q=>q.id)).size===runtime.length,'IDs dupliqués dans la banque runtime');
assert(new Set(runtime.map(q=>q.course||q.theme).filter(Boolean)).size>=10,'Nombre de matières anormalement faible');

for(const q of runtime){
  assert(q&&typeof q.id==='string'&&q.id.length>0,'Question sans ID');
  assert(typeof q.question==='string'&&q.question.trim().length>0,`Énoncé absent: ${q.id}`);
  assert(Array.isArray(q.choices)&&q.choices.length>=2,`Choix invalides: ${q.id}`);
  assert(Array.isArray(q.answers)&&q.answers.length>=1,`Réponse absente: ${q.id}`);
  assert(new Set(q.answers).size===q.answers.length,`Réponse dupliquée: ${q.id}`);
  assert(q.answers.every(a=>Number.isInteger(a)&&a>=0&&a<q.choices.length),`Index de réponse invalide: ${q.id}`);
  assert(q.choices.every(c=>typeof c==='string'&&c.trim().length>0),`Choix vide: ${q.id}`);
}

const vocals=json('vocals.json');
assert(Array.isArray(vocals)&&vocals.length>=29,`Catalogue vocaux trop petit: ${vocals.length}`);
assert(new Set(vocals.map(v=>v.id)).size===vocals.length,'IDs vocaux dupliqués');
assert(new Set(vocals.map(v=>v.driveId)).size===vocals.length,'Drive IDs vocaux dupliqués');
assert(new Set(vocals.map(v=>v.course)).size>=6,'Nombre de matières vocales anormalement faible');
for(const v of vocals){
  assert(typeof v.id==='string'&&v.id, 'Vocal sans ID');
  assert(typeof v.course==='string'&&v.course.trim(),`Matière absente: ${v.id}`);
  assert(typeof v.title==='string'&&v.title.trim(),`Titre vocal absent: ${v.id}`);
  assert(Number.isInteger(v.number)&&v.number>=1,`Numéro vocal invalide: ${v.id}`);
  assert(typeof v.driveId==='string'&&v.driveId.length>10,`Drive ID vocal invalide: ${v.id}`);
  assert(typeof v.mime==='string'&&v.mime.startsWith('audio/'),`MIME vocal invalide: ${v.id}`);
}

for(const f of ['schema-resp003.svg','schema-resp013.svg','schema-resp015.svg'])assert(fs.existsSync(f),`Asset manquant: ${f}`);
const sw=read('sw.js');
assert(sw.includes("./v72-pack.js"),'v72-pack.js absent du service worker');
assert(sw.includes("./progressive-v72.js"),'progressive-v72.js absent du service worker');
assert(sw.includes("./vocals.json"),'vocals.json absent du cache PWA');
assert(sw.includes("./vocals-v73.js"),'vocals-v73.js absent du service worker');
assert(sw.includes("./tnr-v72.js"),'tnr-v72.js absent du service worker');
assert(!sw.includes("<script src=\"./incident-v711.js\"></script>"),'Ancien module incident encore injecté');
const pack=read('v72-pack.js');
for(const marker of ["const VERSION='7.2'",'v72Difficulty','v72Progressive','v72SuggestBtn','finishExamV72','pedagogicDifficulty','v72History'])assert(pack.includes(marker),`Fonction V7.2 absente: ${marker}`);
const progressive=read('progressive-v72.js');
for(const marker of ['orderedProgressive',"['easy','medium','hard']",'session=[...out]'])assert(progressive.includes(marker),`Ordre progressif incomplet: ${marker}`);
const vocalScript=read('vocals-v73.js');
for(const marker of ["const VERSION='7.3.1'","const STORAGE='ifsiabc_vocals_v1'",'showVocals','vocalList','vocalPlayer','vocalResume','vocalStateFilter','toggleListened','toggleFavorite','drive.google.com/file/d/','/preview','IFSI_V73'])assert(vocalScript.includes(marker),`Fonction vocaux V7.3.1 absente: ${marker}`);

console.log(`✅ TNR données: ${runtime.length+schemaIds.length} questions runtime contrôlées`);
console.log(`✅ ${new Set(runtime.map(q=>q.course||q.theme).filter(Boolean)).size} matières QCM détectées`);
console.log(`✅ ${vocals.length} vocaux Drive contrôlés sur ${new Set(vocals.map(v=>v.course)).size} matières`);
console.log('✅ IDs, choix, réponses, schémas, progression ordonnée, vocaux V7.3.1, favoris/écoutés/reprise et service worker validés');
