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
  const raw=Buffer.from(read(`qextra-${String(i).padStart(2,'0')}.txt`).trim(),'base64');
  const parsed=JSON.parse(zlib.gunzipSync(raw).toString('utf8'));
  extras.push(...(Array.isArray(parsed)?parsed:(parsed.questions||[])));
}
base=base.filter(keepQuestion);extras=extras.filter(keepQuestion);
const seen=new Set(base.map(q=>q.id));const runtime=[...base];
for(const q of extras)if(!seen.has(q.id)){runtime.push(q);seen.add(q.id)}
const schemaIds=['resp_003','resp_013','resp_015'];
const schemaSource=read('schema-v10.js');
for(const id of schemaIds){assert(schemaSource.includes(id),`Schéma ${id} absent`);assert(!seen.has(id),`Doublon schéma ${id}`)}
assert(runtime.length+schemaIds.length>=700,`Banque trop petite: ${runtime.length+schemaIds.length}`);
assert(new Set(runtime.map(q=>q.id)).size===runtime.length,'IDs QCM dupliqués');
for(const q of runtime){assert(typeof q.id==='string'&&q.id,'Question sans ID');assert(typeof q.question==='string'&&q.question.trim(),'Énoncé absent');assert(Array.isArray(q.choices)&&q.choices.length>=2,`Choix invalides ${q.id}`);assert(Array.isArray(q.answers)&&q.answers.length>=1,`Réponse absente ${q.id}`);assert(q.answers.every(a=>Number.isInteger(a)&&a>=0&&a<q.choices.length),`Réponse invalide ${q.id}`)}

const respiratory=new Map(runtime.filter(q=>q.course==='Système respiratoire').map(q=>[q.id,q]));
assert(respiratory.size===47,`Questions respiratoires textuelles inattendues: ${respiratory.size}`);
assert(JSON.stringify(respiratory.get('resp_049')?.answers)==='[0,3]','Réponses resp_049 non synchronisées');
assert(JSON.stringify(respiratory.get('resp_050')?.answers)==='[0,1,3]','Réponses resp_050 non synchronisées');
assert(respiratory.get('resp_050')?.theme==='Acido-base, circulation et contrôle respiratoire','Thème resp_050 non synchronisé');

const registry=json('course-registry-v741.json');
assert(registry.version==='7.4.1','Registre version incorrecte');
assert(Array.isArray(registry.courses)&&registry.courses.length>=16,'Registre trop petit');
const courseIds=new Set(registry.courses.map(c=>c.id));
assert(courseIds.size===registry.courses.length,'courseId dupliqués');

const vocals=json('vocals.json');
assert(vocals.length>=29,'Catalogue vocaux trop petit');
for(const v of vocals){assert(courseIds.has(v.courseId),`courseId vocal invalide ${v.id}`);assert(v.driveId?.length>10,`Drive ID vocal invalide ${v.id}`)}

const sheets=json('sheets-1.json');
const respiratorySheet=sheets.find(s=>s.title==='UE_S1_B1_Systeme_Respiratoire_Partie01_Fiche_Revision_Systeme_Respiratoire.pdf');
assert(respiratorySheet?.url?.includes('1Xmqfaw-c4TIn_T8KbMa95iH9-srbuHJ8'),'Lien fiche respiratoire non synchronisé');

const sw=read('sw.js');
for(const marker of ['./app-version-v742.js','./v72-pack.js','./vocals-v73.js','./v74-pack.js','./course-registry-v741.js','./changelog-v742.js','./v75-smart.js','./v76-home.js','./analytics-v77.js','./tnr-v72.js'])assert(sw.includes(marker),`Asset absent du SW: ${marker}`);
assert(sw.includes("ifsi-abc-v7-8-local-30"),'Cache V7.8 local-30 absent');
assert(sw.indexOf('v76-home.js')<sw.indexOf('analytics-v77.js'),'Analytics doit être chargé après la home V7.6');
assert(sw.indexOf('analytics-v77.js')<sw.indexOf('tnr-v72.js'),'Analytics doit être chargé avant le TNR navigateur');

const versionModule=read('app-version-v742.js');
for(const marker of ["const VERSION='7.8'",'IFSI_APP_VERSION','IFSI_VERSION_UI'])assert(versionModule.includes(marker),`Version V7.8 incomplète: ${marker}`);
const changelog=read('changelog-v742.js');
for(const marker of ["const VERSION='7.8'",'v78Change','V7.8 — Système respiratoire synchronisé','v77Change','IFSI_CHANGELOG'])assert(changelog.includes(marker),`Changelog V7.8 incomplet: ${marker}`);
const analytics=read('analytics-v77.js');
for(const marker of ["const VERSION='7.7'",'analytics_events','app_open','qcm_start','qcm_finish','resource_open','vocal_start','ifsiabc_analytics_optout_v1','sessionStorage','IFSI_V77'])assert(analytics.includes(marker),`Analytics V7.7 incomplet: ${marker}`);
assert(analytics.includes('sb_publishable_'),'Clé publishable Supabase absente');
assert(!analytics.includes('sb_secret_'),'Une clé secrète ne doit jamais être exposée côté client');
for(const forbidden of ['email_address:','full_name:','username:','user_id:','ip_address:'])assert(!analytics.includes(forbidden),`Champ personnel interdit dans analytics: ${forbidden}`);

const v76=read('v76-home.js');
for(const marker of ["const VERSION='7.6'",'v76Home','v76Revise','v76Resources','v76Resume','IFSI_V76'])assert(v76.includes(marker),`Home V7.6 absente: ${marker}`);

console.log(`✅ TNR données: ${runtime.length+schemaIds.length} questions runtime contrôlées`);
console.log(`✅ ${vocals.length} vocaux et ${registry.courses.length} courseId contrôlés`);
console.log('✅ V7.8 contrôlée : système respiratoire synchronisé, fiche Drive actualisée et schémas cohérents');
console.log('✅ V7.7 analytics contrôlée : statistiques anonymes, opt-out local et aucune clé secrète exposée');