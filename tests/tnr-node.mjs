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

const registry=json('course-registry-v741.json');
assert(registry.version==='7.4.1','Registre cours version incorrecte');
assert(Array.isArray(registry.courses)&&registry.courses.length>=16,`Registre cours trop petit: ${registry.courses?.length||0}`);
assert(new Set(registry.courses.map(c=>c.id)).size===registry.courses.length,'courseId dupliqués dans le registre');
for(const c of registry.courses){assert(/^[a-z0-9_]+$/.test(c.id),`courseId invalide: ${c.id}`);assert(typeof c.label==='string'&&c.label.trim(),`Label absent: ${c.id}`);assert(Array.isArray(c.aliases)&&c.aliases.length,`Aliases absents: ${c.id}`)}

const vocals=json('vocals.json');
assert(Array.isArray(vocals)&&vocals.length>=29,`Catalogue vocaux trop petit: ${vocals.length}`);
assert(new Set(vocals.map(v=>v.id)).size===vocals.length,'IDs vocaux dupliqués');
assert(new Set(vocals.map(v=>v.driveId)).size===vocals.length,'Drive IDs vocaux dupliqués');
assert(new Set(vocals.map(v=>v.course)).size>=6,'Nombre de matières vocales anormalement faible');
const courseIds=new Set(registry.courses.map(c=>c.id));
for(const v of vocals){
  assert(typeof v.id==='string'&&v.id,'Vocal sans ID');
  assert(typeof v.courseId==='string'&&courseIds.has(v.courseId),`courseId vocal invalide: ${v.id}`);
  assert(typeof v.course==='string'&&v.course.trim(),`Matière absente: ${v.id}`);
  assert(typeof v.title==='string'&&v.title.trim(),`Titre vocal absent: ${v.id}`);
  assert(Number.isInteger(v.number)&&v.number>=1,`Numéro vocal invalide: ${v.id}`);
  assert(typeof v.driveId==='string'&&v.driveId.length>10,`Drive ID vocal invalide: ${v.id}`);
  assert(typeof v.mime==='string'&&v.mime.startsWith('audio/'),`MIME vocal invalide: ${v.id}`);
}

for(const f of ['schema-resp003.svg','schema-resp013.svg','schema-resp015.svg'])assert(fs.existsSync(f),`Asset manquant: ${f}`);
const sw=read('sw.js');
assert(sw.includes("./app-version-v742.js"),'module de version dédié absent du service worker');
assert(sw.indexOf("app-version-v742.js")<sw.indexOf("features-v9.js"),'le module de version doit être chargé avant les modules historiques');
assert(sw.includes("./v72-pack.js"),'v72-pack.js absent du service worker');
assert(sw.includes("./progressive-v72.js"),'progressive-v72.js absent du service worker');
assert(sw.includes("./vocals.json"),'vocals.json absent du cache PWA');
assert(sw.includes("./vocals-v73.js"),'vocals-v73.js absent du service worker');
assert(sw.includes("./v74-pack.js"),'v74-pack.js absent du service worker');
assert(sw.includes("./course-registry-v741.json"),'registre V7.4.1 absent du cache PWA');
assert(sw.includes("./course-registry-v741.js"),'module registre V7.4.1 absent du service worker');
assert(sw.includes("./changelog-v742.js"),'changelog unifié absent du service worker');
assert(sw.includes("./v75-smart.js"),'module V7.5 absent du service worker');
assert(sw.indexOf("v75-smart.js")<sw.indexOf("tnr-v72.js"),'V7.5 doit être chargée avant le TNR navigateur');
assert(sw.includes("./tnr-v72.js"),'tnr-v72.js absent du service worker');
assert(sw.includes("ifsi-abc-v7-5-local-26"),'cache V7.5 local-26 absent');
assert(!sw.includes("<script src=\"./incident-v711.js\"></script>"),'Ancien module incident encore injecté');

const versionModule=read('app-version-v742.js');
for(const marker of ["const VERSION='7.5'",'legacyVersionSink','appVersion742','appVersionTitle742','appVersionStatus742','IFSI_APP_VERSION','IFSI_VERSION_UI'])assert(versionModule.includes(marker),`Module version incomplet: ${marker}`);
const pack=read('v72-pack.js');
for(const marker of ["const VERSION='7.2'",'v72Difficulty','v72Progressive','v72SuggestBtn','finishExamV72','pedagogicDifficulty','v72History'])assert(pack.includes(marker),`Fonction V7.2 absente: ${marker}`);
const progressive=read('progressive-v72.js');
for(const marker of ['orderedProgressive',"['easy','medium','hard']",'session=[...out]'])assert(progressive.includes(marker),`Ordre progressif incomplet: ${marker}`);
const vocalScript=read('vocals-v73.js');
for(const marker of ["const VERSION='7.3.1'","const STORAGE='ifsiabc_vocals_v1'",'showVocals','vocalList','vocalPlayer','vocalResume','vocalStateFilter','toggleListened','toggleFavorite','drive.google.com/file/d/','/preview','IFSI_V73'])assert(vocalScript.includes(marker),`Fonction vocaux V7.3.1 absente: ${marker}`);
const v74=read('v74-pack.js');
for(const marker of ["const VERSION='7.4'","ifsiabc_v74_resource_favorites_v1",'v74Dashboard','v74SearchCard','courses74','course74','favorites74','courseData74','resourceMatchesCourse74','showCourses74','showFavorites74','enhanceResourceCards74','IFSI_V74'])assert(v74.includes(marker),`Fonction V7.4 absente: ${marker}`);
assert(v74.includes('QCM, cours, fiches, infographies et vocaux'),'Recherche V7.4 incomplète');
const v741=read('course-registry-v741.js');
for(const marker of ["const VERSION='7.4.1'",'course-registry-v741.json','resolveResource','resolveLabel','resourcesForCourse','diagnosticUI','IFSI_V741'])assert(v741.includes(marker),`Fonction V7.4.1 absente: ${marker}`);
const changelog=read('changelog-v742.js');
for(const marker of ["const VERSION='7.5'",'v742Changelog','v72Changelog','v73News','v74News','Nouveautés de l’application','V7.5 — Révision intelligente','IFSI_CHANGELOG','IFSI_V742'])assert(changelog.includes(marker),`Changelog V7.5 incomplet: ${marker}`);
assert(!changelog.includes('claimVersionUI'),'Le changelog ne doit plus gérer la version visible');
const v75=read('v75-smart.js');
for(const marker of ["const VERSION='7.5'","ifsiabc_v75_review_v1",'v75TodayCard','v75Confidence','buildTodaySession','recordReview','startTodayV75','IFSI_V75',"guess:[1,1,3,7,14]","hesitant:[1,3,7,14,30]","sure:[3,7,14,30,60]"])assert(v75.includes(marker),`Fonction V7.5 absente: ${marker}`);

console.log(`✅ TNR données: ${runtime.length+schemaIds.length} questions runtime contrôlées`);
console.log(`✅ ${new Set(runtime.map(q=>q.course||q.theme).filter(Boolean)).size} matières QCM détectées`);
console.log(`✅ ${vocals.length} vocaux Drive contrôlés avec courseId explicite`);
console.log(`✅ ${registry.courses.length} courseId stables contrôlés`);
console.log('✅ V7.5 contrôlée : confiance, répétition espacée, session du jour et nouveautés unifiées');
