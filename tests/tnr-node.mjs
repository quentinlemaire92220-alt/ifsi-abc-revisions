import fs from 'node:fs';
import zlib from 'node:zlib';

const read=p=>fs.readFileSync(p,'utf8');
const json=p=>JSON.parse(read(p));
const assert=(v,msg)=>{if(!v)throw new Error(msg)};
const schemaRegex=/\b(sch[ée]ma|schema|figure|illustration|diagramme|image\s+ci|ci-dessous|boucle\s+anonyme)\b/i;
const keepQuestion=q=>{const t=q?.question||'';if(schemaRegex.test(t))return false;if(/\brep[eè]re\b/i.test(t)&&/(association|associer|structure|lettre)/i.test(t))return false;return true};
function gzipBody(raw){let p=10,flags=raw[3]||0;if(flags&4){const n=raw[p]|(raw[p+1]<<8);p+=2+n}if(flags&8)while(p<raw.length&&raw[p++]);if(flags&16)while(p<raw.length&&raw[p++]);if(flags&2)p+=2;return raw.subarray(p,-8)}
function parsePackText(txt){try{return JSON.parse(txt)}catch(first){const body=txt.trim().replace(/^\s*\[/,'').replace(/\]\s*$/,'');const parts=body.split(/}\s*,\s*\{"id":/);const recovered=[];for(let i=0;i<parts.length;i++){let s=(i?'{"id":':'')+parts[i];if(!s.trim().endsWith('}'))s+='}';try{const q=JSON.parse(s);if(q&&q.id)recovered.push(q)}catch{}}if(recovered.length)return recovered;throw first}}
function decodePackFile(p){const source=read(p).trim();if(source.startsWith('[')||source.startsWith('{'))return parsePackText(source);const raw=Buffer.from(source,'base64');let txt;if(raw.length>2&&raw[0]===0x1f&&raw[1]===0x8b){try{txt=zlib.gunzipSync(raw).toString('utf8')}catch{txt=zlib.inflateRawSync(gzipBody(raw)).toString('utf8')}}else txt=raw.toString('utf8');return parsePackText(txt)}

let base=[];
for(let i=1;i<=5;i++)base.push(...json(`questions-${i}.json`));
let extras=[],skipped=[];
for(const i of [1,2,3,4,5,6,7,9,10]){const p=`qextra-${String(i).padStart(2,'0')}.txt`;if(!fs.existsSync(p))continue;try{const parsed=decodePackFile(p);extras.push(...(Array.isArray(parsed)?parsed:(parsed.questions||[])))}catch(e){skipped.push(`${p}: ${e.message}`)}}
base=base.filter(keepQuestion);extras=extras.filter(keepQuestion);
const seen=new Set(base.map(q=>q.id));const runtime=[...base];
for(const q of extras)if(!seen.has(q.id)){runtime.push(q);seen.add(q.id)}
const schemaIds=['resp_003','resp_013','resp_015'];
const schemaSource=read('schema-v10.js');
const officialRespAssets=['resp-official-overview-learn.jpg','resp-official-overview-test.jpg','resp-official-bronchial-learn.jpg','resp-official-bronchial-test.jpg','resp-official-epithelium-learn.jpg','resp-official-epithelium-test.jpg'];
for(const p of officialRespAssets)assert(fs.existsSync(p),`Visuel respiratoire officiel absent: ${p}`);

for(const id of schemaIds){assert(schemaSource.includes(id),`Schéma ${id} absent`);assert(!seen.has(id),`Doublon schéma ${id}`)}
assert(runtime.length+schemaIds.length>=700,`Banque trop petite: ${runtime.length+schemaIds.length}${skipped.length?' • packs ignorés '+skipped.join(' | '):''}`);
assert(new Set(runtime.map(q=>q.id)).size===runtime.length,'IDs QCM dupliqués');
for(const q of runtime){assert(typeof q.id==='string'&&q.id,'Question sans ID');assert(typeof q.question==='string'&&q.question.trim(),'Énoncé absent');assert(Array.isArray(q.choices)&&q.choices.length>=2,`Choix invalides ${q.id}`);assert(Array.isArray(q.answers)&&q.answers.length>=1,`Réponse absente ${q.id}`);assert(q.answers.every(a=>Number.isInteger(a)&&a>=0&&a<q.choices.length),`Réponse invalide ${q.id}`)}
const calcQuestions=runtime.filter(q=>q.courseId==='calculs_doses_mathematiques'||/calculs? de doses|math[eé]matiques/i.test(q.course||''));
assert(calcQuestions.length>=220,`Banque calculs insuffisante: ${calcQuestions.length}${skipped.length?' • packs ignorés '+skipped.join(' | '):''}`);

const respiratory=new Map(runtime.filter(q=>q.course==='Système respiratoire').map(q=>[q.id,q]));
assert(respiratory.size===47,`Questions respiratoires textuelles inattendues: ${respiratory.size}`);
assert(JSON.stringify(respiratory.get('resp_049')?.answers)==='[0,3]','Réponses resp_049 non synchronisées');
assert(JSON.stringify(respiratory.get('resp_050')?.answers)==='[0,1,3]','Réponses resp_050 non synchronisées');
assert(new Set([...respiratory.values()].map(q=>q.theme)).size>=5,'Thématiques respiratoires insuffisantes');

const registry=json('course-registry-v741.json');
assert(registry.version==='7.4.1','Registre version incorrecte');
assert(Array.isArray(registry.courses)&&registry.courses.length>=17,'Registre trop petit');
const courseIds=new Set(registry.courses.map(c=>c.id));
assert(courseIds.size===registry.courses.length,'courseId dupliqués');
assert(courseIds.has('calculs_doses_mathematiques'),'CourseId calculs absent');
const vocals=json('vocals.json');
assert(vocals.length>=29,'Catalogue vocaux trop petit');
for(const v of vocals){assert(courseIds.has(v.courseId),`courseId vocal invalide ${v.id}`);assert(v.driveId?.length>10,`Drive ID vocal invalide ${v.id}`)}

const sw=read('sw.js');
for(const marker of ['./app-version-v742.js','./v72-pack.js','./vocals-v73.js','./v74-pack.js','./course-registry-v741.js','./changelog-v742.js','./v75-smart.js','./v76-home.js','./analytics-v77.js','./v79-themes.js','./calculs-parcours-v1.js','./v81-suite.js','./v82-nav-anatomy.js','./v83-anatomy-interactive.js','./v84-respiratory-polish.js','./v85-home-lite.js','./v86-home-clean.js','./v87-settings.js','./tnr-v72.js'])assert(sw.includes(marker),`Asset absent du SW: ${marker}`);
assert(sw.includes("ifsi-abc-v8-7-local-47"),'Cache V8.7 local-47 absent');
assert(sw.includes("'deflate-raw'"),'Récupération gzip dégradé absente du SW');
assert(sw.includes('parsePackText'),'Récupération JSON partielle absente du SW');
assert(sw.indexOf('analytics-v77.js')<sw.indexOf('v79-themes.js'),'V7.9 doit être chargée après analytics');
assert(sw.indexOf('v79-themes.js')<sw.indexOf('calculs-parcours-v1.js'),'Calculs doit être chargé après V7.9');
assert(sw.indexOf('calculs-parcours-v1.js')<sw.indexOf('v81-suite.js'),'V8.1 doit être chargée après le parcours calculs');
assert(sw.indexOf('v81-suite.js')<sw.indexOf('v82-nav-anatomy.js'),'V8.2 doit être chargée après V8.1');
assert(sw.indexOf('v82-nav-anatomy.js')<sw.indexOf('v83-anatomy-interactive.js'),'Anatomie interactive doit être chargée après V8.2');
assert(sw.indexOf('v83-anatomy-interactive.js')<sw.indexOf('v84-respiratory-polish.js'),'V8.4 respiratoire doit être chargée après l’anatomie interactive');
assert(sw.indexOf('v84-respiratory-polish.js')<sw.indexOf('v85-home-lite.js'),'V8.5 accueil doit être chargé après V8.4');
assert(sw.indexOf('v85-home-lite.js')<sw.indexOf('v86-home-clean.js'),'V8.6 doit être chargée après V8.5');
assert(sw.indexOf('v86-home-clean.js')<sw.indexOf('v87-settings.js'),'V8.7 doit être chargée après V8.6');
assert(sw.indexOf('v87-settings.js')<sw.indexOf('tnr-v72.js'),'V8.7 doit être chargée avant le TNR navigateur');
const versionModule=read('app-version-v742.js');
for(const marker of ["const VERSION='8.7'",'IFSI_APP_VERSION','onglet Paramètres','navigation principale simplifiée'])assert(versionModule.includes(marker),`Version V8.7 incomplète: ${marker}`);
const changelog=read('changelog-v742.js');
for(const marker of ["const VERSION='8.7'",'v87Change','V8.7 — Onglet Paramètres','v86Change','V8.6 — Accueil minimal','v85Change','V8.5 — Accueil allégé','v84Change','V8.4 — Système respiratoire enrichi','v83Change','v82Change','v81Change','v80Change','v79Change','IFSI_CHANGELOG'])assert(changelog.includes(marker),`Changelog V8.7 incomplet: ${marker}`);
const analytics=read('analytics-v77.js');
for(const marker of ["const VERSION='7.7'",'analytics_events','app_open','qcm_start','qcm_finish','resource_open','vocal_start','ifsiabc_analytics_optout_v1','sessionStorage','IFSI_V77'])assert(analytics.includes(marker),`Analytics V7.7 incomplet: ${marker}`);
assert(analytics.includes('sb_publishable_'),'Clé publishable Supabase absente');assert(!analytics.includes('sb_secret_'),'Une clé secrète ne doit jamais être exposée côté client');
for(const forbidden of ['email_address:','full_name:','username:','user_id:','ip_address:'])assert(!analytics.includes(forbidden),`Champ personnel interdit dans analytics: ${forbidden}`);
const v79=read('v79-themes.js');for(const marker of ["const VERSION='7.9'",'v79Builder','themeOf','difficultyOf','startCustom','IFSI_V79'])assert(v79.includes(marker),`Fonction V7.9 absente: ${marker}`);
const calc=read('calculs-parcours-v1.js');for(const marker of ["COURSE_ID='calculs_doses_mathematiques'",'stageFor','startProgressive','IFSI_CALCULS'])assert(calc.includes(marker),`Parcours calculs incomplet: ${marker}`);
const v81=read('v81-suite.js');for(const marker of ["const V='8.1'",'v81_activity','v81_goal','Bilan détaillé','Points faibles','Examen blanc intelligent','Avant partiel','Recherche avancée','startWeak','startMock','startQuick','startPreExam','IFSI_V81'])assert(v81.includes(marker),`Fonction V8.1 absente: ${marker}`);for(const marker of ['qcm_start','selected_courses','themes','mode','count'])assert(v81.includes(marker),`Analytics V8.1 incomplète: ${marker}`);
const v82=read('v82-nav-anatomy.js');for(const marker of ["const V='8.7'",'Anatomie & Physiologie','systeme_respiratoire','systeme_urinaire','systeme_endocrinien','systeme_nerveux','showAnatomy','startMixed','IFSI_V82'])assert(v82.includes(marker),`Fonction navigation anatomie absente: ${marker}`);
const v83=read('v83-anatomy-interactive.js');for(const marker of ["const V='8.7'",'resp003','resp013','resp015','resp-official-overview-learn.jpg','resp-official-bronchial-learn.jpg','resp-official-epithelium-learn.jpg','support officiel du Dr Sandrine Dulong','Apprendre','S’entraîner','Tester','10 min anatomie','ifsiabc_v83_anatomy_mastery_v1','IFSI_V83'])assert(v83.includes(marker),`Fonction anatomie V8.4 absente: ${marker}`);assert(!v83.includes('schema-resp003.svg')&&!schemaSource.includes('schema-resp003.svg'),'Les SVG respiratoires simplifiés ne doivent plus être actifs');
if(skipped.length)console.warn('⚠️ Packs optionnels ignorés:',skipped.join(' | '));
console.log(`✅ TNR données: ${runtime.length+schemaIds.length} questions runtime contrôlées`);
console.log(`✅ Banque calculs: ${calcQuestions.length} questions exploitables`);
console.log(`✅ ${vocals.length} vocaux et ${registry.courses.length} courseId contrôlés`);
const v84=read('v84-respiratory-polish.js');for(const marker of ["const V='8.7'",'Vue d’ensemble','Vocabulaire','Trajet de l’air','v84Overview','v84Vocab'])assert(v84.includes(marker),`Interface respiratoire V8.4 incomplète: ${marker}`);
const v85=read('v85-home-lite.js');for(const marker of ["const V='8.5'",'v85-home','v82Primary','v76-today','⚙️ Plus','IFSI_V85'])assert(v85.includes(marker),`Accueil V8.5 incomplet: ${marker}`);
const v86=read('v86-home-clean.js');for(const marker of ["const V='8.6'",'v86-home','v86Tools','v86SettingsDialog','IFSI_V86'])assert(v86.includes(marker),`Accueil V8.6 incomplet: ${marker}`);
const v87=read('v87-settings.js');for(const marker of ["const V='8.7'",'settings87','v87Nav','Exporter mes résultats','Sauvegarde complète','Journal des versions','IFSI_V87'])assert(v87.includes(marker),`Paramètres V8.7 incomplets: ${marker}`);
console.log('✅ V8.7 contrôlée : onglet Paramètres, exports, confidentialité et journal des versions');
console.log('✅ V8.6 conservée : accueil minimal');
console.log('✅ V8.5 conservée comme couche de compatibilité');
console.log('✅ V8.4 conservée : module respiratoire enrichi, anatomie interactive et ressources intégrées');
console.log('✅ V8.2 conservée : navigation hiérarchisée, espace Anatomie & Physiologie, QCM multi-systèmes et partage');
console.log('✅ V8.1 conservée : dashboard, bilan QCM, points faibles, examens, avant-partiel, objectifs, recherche et nouveautés');
console.log('✅ V8.0 calculs conservée avec progression par difficulté');
console.log('✅ Analytics anonymes contrôlées sans clé secrète');