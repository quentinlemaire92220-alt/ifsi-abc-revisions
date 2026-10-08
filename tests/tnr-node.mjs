import fs from 'node:fs';
import zlib from 'node:zlib';

const read=p=>fs.readFileSync(p,'utf8');
const json=p=>JSON.parse(read(p));
const assert=(v,msg)=>{if(!v)throw new Error(msg)};
const schemaRegex=/\b(sch[ée]ma|schema|figure|illustration|diagramme|image\s+ci|ci-dessous|boucle\s+anonyme)\b/i;
const keepQuestion=q=>{const t=q?.question||'';if(q?.id==='pharmaco_031')return true;if(schemaRegex.test(t))return false;if(/\brep[eè]re\b/i.test(t)&&/(association|associer|structure|lettre)/i.test(t))return false;return true};
function gzipBody(raw){let p=10,flags=raw[3]||0;if(flags&4){const n=raw[p]|(raw[p+1]<<8);p+=2+n}if(flags&8)while(p<raw.length&&raw[p++]);if(flags&16)while(p<raw.length&&raw[p++]);if(flags&2)p+=2;return raw.subarray(p,-8)}
function parsePackText(txt){try{return JSON.parse(txt)}catch(first){const body=txt.trim().replace(/^\s*\[/,'').replace(/\]\s*$/,'');const parts=body.split(/}\s*,\s*\{"id":/);const recovered=[];for(let i=0;i<parts.length;i++){let s=(i?'{"id":':'')+parts[i];if(!s.trim().endsWith('}'))s+='}';try{const q=JSON.parse(s);if(q&&q.id)recovered.push(q)}catch{}}if(recovered.length)return recovered;throw first}}
function decodePackFile(p){const source=read(p).trim();if(source.startsWith('[')||source.startsWith('{'))return parsePackText(source);const raw=Buffer.from(source,'base64');let txt;if(raw.length>2&&raw[0]===0x1f&&raw[1]===0x8b){try{txt=zlib.gunzipSync(raw).toString('utf8')}catch{txt=zlib.inflateRawSync(gzipBody(raw)).toString('utf8')}}else txt=raw.toString('utf8');return parsePackText(txt)}
function normalizeMaxThreeAnswers(q){
 if(!q||q.answerCountNormalized===true||!Array.isArray(q.answers)||!Array.isArray(q.choices)||q.answers.length<=3)return q;
 if(q.answers.length!==4||q.choices.length!==5)return q;
 const out={...q,choices:[...q.choices],answers:[...q.answers]};
 const letters='ABCDE',good=[...new Set(out.answers)].sort((a,b)=>a-b);
 if(good.length!==4)return out;
 const original=[...out.choices],all=[0,1,2,3,4],key=a=>a.join(',');
 const combos=all.map(omit=>all.filter(i=>i!==omit));
 const shift=Array.from(String(out.id||'')).reduce((n,c)=>(n+c.charCodeAt(0))%5,0);
 const ordered=combos.slice(shift).concat(combos.slice(0,shift)),target=key(good),answerIndex=ordered.findIndex(c=>key(c)===target);
 assert(answerIndex>=0,`Combinaison 4 réponses introuvable: ${out.id}`);
 const refs=original.map((choice,i)=>`${letters[i]}. ${choice}`).join(' • ');
 out.question=`${String(out.question||'').trim()} — Repères : ${refs} — Quelle combinaison regroupe toutes les bonnes réponses ?`;
 out.choices=ordered.map(c=>c.map(i=>letters[i]).join(' + '));
 out.answers=[answerIndex];
 out.explanation=`${String(out.explanation||'').trim()} Combinaison correcte : ${good.map(i=>letters[i]).join(' + ')}.`;
 out.answerCountNormalized=true;
 return out;
}
let rawOver3=0,rawThreeOfFour=0,rawMissingExplanation=0,rawAudited=0;
function auditRawQuestion(q,p){rawAudited++;assert(typeof q?.id==='string'&&q.id,`Question brute sans ID dans ${p}`);assert(typeof q?.question==='string'&&q.question.trim(),`Énoncé brut absent ${p}: ${q?.id||'sans-id'}`);assert(Array.isArray(q?.choices)&&q.choices.length>=4&&q.choices.length<=5,`Nombre de propositions brut invalide ${p}: ${q.id} (${q?.choices?.length??'∅'})`);assert(Array.isArray(q?.answers)&&q.answers.length>=1,`Réponse brute absente ${p}: ${q.id}`);assert(q.answers.every(a=>Number.isInteger(a)&&a>=0&&a<q.choices.length),`Index brut invalide ${p}: ${q.id}`);assert(q.answers.length<q.choices.length,`Toutes les propositions sont correctes dans la source ${p}: ${q.id}`);if(typeof q.explanation!=='string'||!q.explanation.trim())rawMissingExplanation++;if(q.answers.length>3)rawOver3++;if(q.choices.length===4&&q.answers.length===3)rawThreeOfFour++}

let base=[];
for(let i=1;i<=5;i++){const p=`questions-${i}.json`,a=json(p);for(const q of a)auditRawQuestion(q,p);base.push(...a)}
let extras=[],override=[],skipped=[];
for(const i of [1,2,3,4,5,6,7,...Array.from({length:30},(_,j)=>j+9),46]){const p=`qextra-${String(i).padStart(2,'0')}.txt`;if(!fs.existsSync(p))continue;try{const parsed=decodePackFile(p),a=Array.isArray(parsed)?parsed:(parsed.questions||[]);for(const q of a)auditRawQuestion(q,p);extras.push(...a)}catch(e){skipped.push(`${p}: ${e.message}`)}}
for(const i of [39,40,41,42,43,44,45,47]){const p=`qextra-${String(i).padStart(2,'0')}.txt`;assert(fs.existsSync(p),`Pack de rééquilibrage absent: ${p}`);try{const parsed=decodePackFile(p),a=Array.isArray(parsed)?parsed:(parsed.questions||[]);for(const q of a)auditRawQuestion(q,p);override.push(...a)}catch(e){skipped.push(`${p}: ${e.message}`)}}
const v820RawPacks=[];for(let i=12;i<=38;i++){const p=`qextra-${String(i).padStart(2,'0')}.txt`;assert(fs.existsSync(p),`Pack V8.20 absent: ${p}`);const a=decodePackFile(p);assert(Array.isArray(a)&&a.length>0,`Pack V8.20 vide: ${p}`);v820RawPacks.push(...a)}
assert(v820RawPacks.length>=1000,`Banque V8.20 trop petite: ${v820RawPacks.length}`);
// Régression épistémologie: préserver les réponses multiples de la grille officielle.
const epistemologyPack=decodePackFile('qextra-12.txt');
assert(epistemologyPack.length===68,`Pack épistémologie inattendu: ${epistemologyPack.length}/68`);
assert(epistemologyPack.filter(q=>Array.isArray(q.answers)&&q.answers.length>1).length===37,'Réponses multiples épistémologie incomplètes');
const caringQ17=epistemologyPack.find(q=>q.id==='v820_a1p3_017');
assert(caringQ17&&JSON.stringify(caringQ17.answers)===JSON.stringify([0,3]),'Q17 caring doit accepter A + D');
// QCM IAS: aucune correction vide et argumentation minimale conservée.
const iasTail=decodePackFile('qextra-17.txt');
assert(iasTail.length===42,`Pack IAS qextra-17 inattendu: ${iasTail.length}/42`);
assert(iasTail.every(q=>String(q.explanation||'').trim().length>=80),'Corrections IAS qextra-17 insuffisamment argumentées');
assert(rawOver3<=284,`QCM bruts à 4 bonnes réponses en hausse inattendue: ${rawOver3}/284`);
assert(rawThreeOfFour<=935,`Dette QCM brute 3/4 en hausse: ${rawThreeOfFour}/935`);
assert(rawMissingExplanation===0,`QCM bruts sans explication: ${rawMissingExplanation}`);
for(const q of v820RawPacks){assert(q.courseId,`courseId V8.20 absent: ${q.id}`);assert(Array.isArray(q.choices)&&q.choices.length>=4,`Choix V8.20 invalides: ${q.id}`);assert(!q.choices.some(x=>/CORRIG[ÉE]|GRILLE (?:SYNTH[ÉE]TIQUE|DES R[ÉE]PONSES)|IFSI Antoine Béclère[\s\S]*Page\s+\d+/i.test(x)),`Fragment PDF parasite dans ${q.id}`)}
base=base.filter(keepQuestion);extras=extras.filter(keepQuestion);override=override.filter(keepQuestion);
if(override.length){const map=new Map();for(const q of override)if(q?.id)map.set(q.id,q);const finalOverride=[...map.values()];const overrideIds=new Set(finalOverride.map(q=>q.id));extras=extras.filter(q=>!overrideIds.has(q.id));extras.push(...finalOverride)}
const seen=new Set(base.map(q=>q.id));const runtime=[...base];
for(const q of extras)if(!seen.has(q.id)){runtime.push(q);seen.add(q.id)}
for(let i=0;i<runtime.length;i++)runtime[i]=normalizeMaxThreeAnswers(runtime[i]);
const runtimeNormalizedFour=runtime.filter(q=>q.answerCountNormalized===true).length;
// Régression épistémologie après fusion des overrides : la vérité affichée doit rester cohérente avec la grille officielle.
const semanticEpistemologyText=s=>String(s||'').replace(/CM[34]\s*•[\s\S]*$/,'').replace(/\s+(?:Cas Mme L\. avec Henderson|Théorie de gestion des symptômes \(TGS\)|Les six écoles de pensée|Métaparadigme selon les écoles|Théories infirmières|Niveaux d’abstraction et utilité)$/,'').replace(/\s+/g,' ').trim().toLowerCase();
const epistemologyOfficial=new Map(epistemologyPack.map(q=>[q.id,q]));
const epistemologyRuntime=new Map(runtime.filter(q=>q.courseId==='epistemologie_savoirs').map(q=>[q.id,q]));
assert(epistemologyRuntime.size>=68,`Banque runtime épistémologie incomplète: ${epistemologyRuntime.size}/68`);
for(const [id,source] of epistemologyOfficial){
  if(!keepQuestion(source))continue; // Les QCM dépendants d'un schéma externe sont volontairement exclus du runtime.
  const live=epistemologyRuntime.get(id);assert(live,`QCM épistémologie runtime absent: ${id}`);
  const liveChoiceIndex=new Map((live.choices||[]).map((x,i)=>[semanticEpistemologyText(x),i]));
  const liveAnswers=new Set(live.answers||[]);
  for(const sourceIndex of source.answers||[]){
    const key=semanticEpistemologyText(source.choices?.[sourceIndex]);
    if(!liveChoiceIndex.has(key))continue; // Une réécriture volontaire peut retirer une proposition pour rester à 1–3 bonnes réponses.
    assert(liveAnswers.has(liveChoiceIndex.get(key)),`Bonne réponse officielle perdue après override: ${id} → ${source.choices?.[sourceIndex]}`);
  }
}
const caringRuntime=epistemologyRuntime.get('v820_a1p3_017');
const caringRuntimeAnswers=(caringRuntime?.answers||[]).map(i=>semanticEpistemologyText(caringRuntime.choices?.[i])).sort();
assert(JSON.stringify(caringRuntimeAnswers)===JSON.stringify(['champ phénoménologique','dimension culturelle / spirituelle'].sort()),'Q17 caring runtime doit accepter Champ phénoménologique + Dimension culturelle / spirituelle');
assert((caringRuntime?.answers||[]).length===2,'Q17 caring runtime doit avoir exactement 2 bonnes réponses');
const schemaIds=['resp_003','resp_013','resp_015'];
const schemaSource=read('schema-v10.js');
const officialRespAssets=['resp-official-overview-learn.jpg','resp-official-overview-test.jpg','resp-official-bronchial-learn.jpg','resp-official-bronchial-test.jpg','resp-official-epithelium-test.jpg'];
for(const p of officialRespAssets)assert(fs.existsSync(p),`Visuel respiratoire officiel absent: ${p}`);

for(const id of schemaIds){assert(schemaSource.includes(id),`Schéma ${id} absent`);assert(!seen.has(id),`Doublon schéma ${id}`)}
assert(runtime.length+schemaIds.length>=1400,`Banque trop petite: ${runtime.length+schemaIds.length}${skipped.length?' • packs ignorés '+skipped.join(' | '):''}`);
assert(new Set(runtime.map(q=>q.id)).size===runtime.length,'IDs QCM dupliqués');
for(const q of runtime){assert(typeof q.id==='string'&&q.id,'Question sans ID');assert(typeof q.question==='string'&&q.question.trim(),'Énoncé absent');assert(Array.isArray(q.choices)&&q.choices.length>=4&&q.choices.length<=5,`Choix invalides ${q.id}: ${q?.choices?.length??'∅'}`);assert(Array.isArray(q.answers)&&q.answers.length>=1,`Réponse absente ${q.id}`);assert(q.answers.every(a=>Number.isInteger(a)&&a>=0&&a<q.choices.length),`Réponse invalide ${q.id}`)}
for(const q of runtime){const m=(q.explanation||'').match(/^Réponses? attendues? selon le corrigé du QCM\s*:\s*([^.<]+)/i);if(!m)continue;const stated=(m[1].match(/[A-E]/g)||[]).join(',');const actual=(q.answers||[]).map(i=>'ABCDE'[i]).filter(Boolean).join(',');assert(stated===actual,`Corrigé textuel désynchronisé ${q.id}: ${stated||'∅'} ≠ ${actual||'∅'}`)}
let runtimeThreeOfFour=0;
for(const q of runtime){
  if((q.choices||[]).length===4&&(q.answers||[]).length===3)runtimeThreeOfFour++;
  assert((q.answers||[]).length<=3,`Plus de 3 bonnes réponses dans ${q.id}: ${(q.answers||[]).length}`);
  assert((q.answers||[]).length<(q.choices||[]).length,`Toutes les propositions sont correctes dans ${q.id}`);
  assert(String(q.explanation||'').trim().length>=45,`Explication trop courte dans ${q.id}`);
  assert(!/→\s*[A-E](?:\s*,\s*[A-E])+/i.test(String(q.question||'')),`Réponse divulguée dans l'énoncé: ${q.id}`);
  assert(!(q.choices||[]).some(x=>/^\s*(?:Vrai|Faux)\s*[.:]/i.test(String(x))),`Choix révélant vrai/faux: ${q.id}`);
  const qc=[q.question,...(q.choices||[])].join(' ');
  assert(!/CORRIG[ÉE]\s*[-—·:]?\s*GRILLE|GRILLE\s+SYNTH[ÉE]TIQUE|Support officiel\s*\+\s*transcript/i.test(qc),`Artefact de corrigé/import dans ${q.id}`);
}
assert(runtimeThreeOfFour<=647,`Dette runtime 3/4 en hausse: ${runtimeThreeOfFour}/647`);
const calcQuestions=runtime.filter(q=>q.courseId==='calculs_doses_mathematiques'||/calculs? de doses|math[eé]matiques/i.test(q.course||''));
assert(calcQuestions.length>=220,`Banque calculs insuffisante: ${calcQuestions.length}${skipped.length?' • packs ignorés '+skipped.join(' | '):''}`);

const pharmacologie=runtime.filter(q=>q.courseId==='pharmacologie');
assert(pharmacologie.length===60,`Questions pharmacologie inattendues: ${pharmacologie.length}/60`);
assert(pharmacologie.every(q=>q.choices.length===5),'Pharmacologie : chaque QCM doit avoir exactement 5 propositions');
assert(pharmacologie.every(q=>['easy','medium','hard'].includes(q.difficulty)),'Pharmacologie : difficulté absente ou invalide');
const pharmDiff=Object.fromEntries(['easy','medium','hard'].map(d=>[d,pharmacologie.filter(q=>q.difficulty===d).length]));
assert(pharmDiff.easy===18&&pharmDiff.medium===30&&pharmDiff.hard===12,`Répartition difficultés pharmacologie invalide: ${JSON.stringify(pharmDiff)}`);
const pharmAnswerCounts=Object.fromEntries([1,2,3,4].map(n=>[n,pharmacologie.filter(q=>q.answers.length===n).length]));
assert(pharmAnswerCounts[1]===14&&pharmAnswerCounts[2]===33&&pharmAnswerCounts[3]===13&&pharmAnswerCounts[4]===0,`Répartition bonnes réponses pharmacologie invalide après normalisation: ${JSON.stringify(pharmAnswerCounts)}`);
assert(pharmAnswerCounts[4]===0,'Pharmacologie : aucune question runtime ne doit conserver 4 bonnes réponses');
assert(new Set(pharmacologie.map(q=>q.theme)).size===7,'Pharmacologie : découpage thématique incomplet');
const pharmV2Ids=['pharmaco_016','pharmaco_018','pharmaco_021','pharmaco_022','pharmaco_024','pharmaco_026','pharmaco_028','pharmaco_049','pharmaco_050','pharmaco_051'];
for(const id of pharmV2Ids)assert(pharmacologie.some(q=>q.id===id),`QCM Pharmacologie V2 absent: ${id}`);
assert(pharmacologie.find(q=>q.id==='pharmaco_026')?.question.includes('Kd'),'Pharmacologie V2 : Kd absent');
assert(pharmacologie.find(q=>q.id==='pharmaco_028')?.question.includes('DE50'),'Pharmacologie V2 : DE50/Emax absent');
assert(pharmacologie.find(q=>q.id==='pharmaco_049')?.choices.some(x=>String(x).includes('CRAT')),'Pharmacologie V2 : CRAT absent');

const respiratory=new Map(runtime.filter(q=>q.course==='Système respiratoire').map(q=>[q.id,q]));
assert(respiratory.size===47,`Questions respiratoires textuelles inattendues: ${respiratory.size}`);
assert(JSON.stringify(respiratory.get('resp_049')?.answers)==='[0,3]','Réponses resp_049 non synchronisées');
assert(JSON.stringify(respiratory.get('resp_050')?.answers)==='[0,1,3]','Réponses resp_050 non synchronisées');
assert(new Set([...respiratory.values()].map(q=>q.theme)).size>=5,'Thématiques respiratoires insuffisantes');
const nervous=new Map(runtime.filter(q=>q.courseId==='systeme_nerveux').map(q=>[q.id,q]));
assert(nervous.size===49,`Questions système nerveux inattendues: ${nervous.size}`);
assert(JSON.stringify(nervous.get('nervous_001')?.answers)==='[1,2,3]','Réponses nervous_001 non synchronisées');
assert(JSON.stringify(nervous.get('nervous_049')?.answers)==='[0,1,2]','Réponses nervous_049 non synchronisées');
assert(!/sch[ée]ma/i.test(nervous.get('nervous_010')?.question||''),'nervous_010 doit être autonome sans schéma externe');
assert(!/sch[ée]ma/i.test(nervous.get('nervous_031')?.question||''),'nervous_031 doit être autonome sans schéma externe');

const semanticAnswerContracts={
  v820_a1p3_001:[0],
  v820_a1p3_003:[0,2,4],
  v820_a1p3_028:[0,2,4],
  v820_a1p4_008:[2,3,4],
  v820_a1p4_020:[0,1,4],
  v820_a1p4_027:[1,2,3]
};
const semanticRuntime=new Map(runtime.map(q=>[q.id,q]));
for(const [id,answers] of Object.entries(semanticAnswerContracts)){
  const q=semanticRuntime.get(id);
  assert(q,`QCM de contrat sémantique absent: ${id}`);
  assert(JSON.stringify(q.answers)===JSON.stringify(answers),`Réponse ↔ explication désynchronisée: ${id} (${JSON.stringify(q.answers)} ≠ ${JSON.stringify(answers)})`);
  assert(String(q.explanation||'').trim().length>=80,`Explication sémantique insuffisante: ${id}`);
}
assert(read('sw.js').includes('function normalizeMaxThreeAnswers(q)'),'Normalisation runtime 1–3 bonnes réponses absente');
const registry=json('course-registry-v741.json');
assert(registry.version===json('build-meta.json').version,'Registre version incorrecte');
assert(Array.isArray(registry.courses)&&registry.courses.length>=35,'Registre trop petit');
const courseIds=new Set(registry.courses.map(c=>c.id));
assert(courseIds.size===registry.courses.length,'courseId dupliqués');
const revisionSheets=[...json('sheets-1.json'),...json('sheets-2.json'),...json('sheets-3.json')];
const noteBasedSheetTitles=["UE_S1_B1_Systeme_Respiratoire_Partie01_Fiche_Revision_Systeme_Respiratoire.pdf","UE_S1_B1_Arthrose_Fiche_Revision_PROVISOIRE.pdf","UE_S1_B1_Traumatologie_Fiche_Revision_Appareil_Locomoteur_et_Traumatismes.pdf","UE_S1_B3_Douleur_Fiche_Revision_PROVISOIRE.pdf","UE_S1_B3_Parametres_Vitaux_Fiche_Revision_PROVISOIRE.pdf","UE_S1_B1_Chirurgie_Orthopedique_Fiche_Revision_PROVISOIRE.pdf","UE_S1_B2_Psychologie_de_la_Sante_Partie01_Fiche_Revision_Psychologie_de_la_Sante.pdf"];
for(const title of noteBasedSheetTitles){const sheet=revisionSheets.find(x=>x.title===title);assert(sheet,'Fiche de provenance absente: '+title);assert(sheet.officialSupport===false,'Fiche sans support officiel non marquée: '+title);assert(typeof sheet.sourceBasis==='string'&&sheet.sourceBasis.trim().length>3,'Provenance de fiche absente: '+title);}
const officialGrandBrules=revisionSheets.find(x=>x.courseId==='grands_brules');assert(officialGrandBrules?.officialSupport!==false,'La fiche Grands brûlés actuelle est issue du support officiel et ne doit pas être marquée');
const sourceLegendIndexHtml=read('index.html');assert(sourceLegendIndexHtml.includes('sheetSourceLegend')&&sourceLegendIndexHtml.includes('officialSupport===false')&&sourceLegendIndexHtml.includes('📝 Notes / captures'),'Indicateur visible de provenance absent de la liste des fiches');
const sourceLegendV74=read('v74-pack.js');assert(sourceLegendV74.includes("type==='sheet'&&x.officialSupport===false")&&sourceLegendV74.includes('📝 Notes / captures')&&sourceLegendV74.includes("d.sheets.some(x=>x.officialSupport===false)"),'Indicateur visible de provenance absent des cartes de cours/favoris');
assert(courseIds.has('introduction_droit'),'CourseId Introduction au droit absent');assert(courseIds.has('psychologie_sante'),'CourseId Psychologie de la santé absent');
const droitIntro=runtime.filter(q=>q.courseId==='introduction_droit');
assert(droitIntro.length===60,`Banque Introduction au droit inattendue: ${droitIntro.length}/60`);
assert(droitIntro.every(q=>Array.isArray(q.choices)&&q.choices.length===5),'Introduction au droit doit avoir exactement 5 propositions par question');
assert(droitIntro.every(q=>['easy','medium','hard'].includes(q.difficulty)),'Niveau de difficulté explicite absent sur Introduction au droit');
const droitDiff=droitIntro.reduce((a,q)=>(a[q.difficulty]=(a[q.difficulty]||0)+1,a),{});
assert(droitDiff.easy===18&&droitDiff.medium===29&&droitDiff.hard===13,`Répartition difficulté droit invalide: ${JSON.stringify(droitDiff)}`);
assert(JSON.stringify(droitIntro.find(q=>q.id==='droit_intro_013')?.answers)==='[3,4]','Correction droit_intro_013 invalide');
assert(JSON.stringify(droitIntro.find(q=>q.id==='droit_intro_050')?.answers)==='[0,2,3]','Correction droit_intro_050 invalide');
assert(courseIds.has('calculs_doses_mathematiques'),'CourseId calculs absent');assert(courseIds.has('ist_hors_vih'),'CourseId IST hors VIH absent');assert(runtime.filter(q=>q.courseId==='ist_hors_vih').length===56,'Banque IST hors VIH inattendue');assert(courseIds.has('systeme_digestif'),'CourseId digestif absent');assert(courseIds.has('douleur'),'CourseId douleur absent');assert(courseIds.has('epistemologie_savoirs'),'CourseId épistémologie absent');
const infographics=json('infographics.json');
const nervousInfos=infographics.filter(x=>x.courseId==='systeme_nerveux');
assert(nervousInfos.length===4,`Infographies système nerveux inattendues: ${nervousInfos.length}`);
for(const title of ['Organisation générale du système nerveux','Système nerveux central','Système nerveux périphérique','Fonctions neurologiques'])assert(nervousInfos.some(x=>x.displayTitle===title),`Infographie système nerveux absente: ${title}`);
const v820MinCounts={epistemologie_savoirs:110,histoire_profession_infirmiere:45,ethique_infirmiere:45,prevention_ias_asepsie:120,infections_cutanees:45,infections_neuro_meningees:30,appareil_locomoteur:45,traumatologie:80,arthrose:35,chirurgie_orthopedique:25,rhumatismes_inflammatoires:30,pathologies_microcristallines_osteoporose:40,systeme_digestif:65,grands_brules:30,parametres_vitaux:45,douleur:25,competences_psychosociales:25,systeme_cardiovasculaire:53};
for(const [id,min] of Object.entries(v820MinCounts)){const n=runtime.filter(q=>q.courseId===id).length;assert(n>=min,`V8.20 course QCM insuffisant ${id}: ${n}/${min}`)}
const expectedInfoCounts={cellules_tissus:9,niveaux_organisation:2,prevention_ias_asepsie:8,virus:1,infections_cutanees:3,infections_neuro_meningees:7,infections_urinaires:3,diagnostic_bacteriologie:3};
for(const [id,min] of Object.entries(expectedInfoCounts)){const n=infographics.filter(x=>x.courseId===id).length;assert(n>=min,`Infographies V8.20 insuffisantes ${id}: ${n}/${min}`)}
const vocals=json('vocals.json');
assert(vocals.length>=29,'Catalogue vocaux trop petit');
for(const v of vocals){assert(courseIds.has(v.courseId),`courseId vocal invalide ${v.id}`);assert(v.driveId?.length>10,`Drive ID vocal invalide ${v.id}`)}

const releaseMeta=json('build-meta.json');
assert(/^\d+\.\d+(?:\.\d+)?$/.test(releaseMeta.version),'Version build-meta invalide');
assert(/^\d+$/.test(String(releaseMeta.build)),'Build build-meta invalide');
const releaseChangelog=`v${releaseMeta.build}-changelog.js`;
const sw=read('sw.js');
for(const marker of ['./app-version-v742.js','./v72-pack.js','./vocals-v73.js','./v74-pack.js','./course-registry-v741.js','./changelog-v742.js','./v75-smart.js','./v76-home.js','./analytics-v77.js','./v79-themes.js','./calculs-parcours-v1.js','./v81-suite.js','./v82-nav-anatomy.js','./v83-anatomy-interactive.js','./v84-respiratory-polish.js','./v85-home-lite.js','./v86-home-clean.js','./v87-settings.js','./v813-home-discovery.js','./v814-respiratory-atlas.js','./v815-urinary-atlas.js','./v816-endocrine-atlas.js','./v817-immune-atlas.js','./v822-nervous-atlas.js','./v823-cardiovascular-atlas.js','./v824-digestive-atlas.js','./v829-locomotor-atlas.js','./v8318-microscopic-atlas.js','./assets/locomotor/locomotor-01.webp','./assets/locomotor/locomotor-02.webp','./assets/locomotor/locomotor-03.webp','./assets/locomotor/locomotor-04.webp','./assets/locomotor/locomotor-05.webp','./assets/locomotor/locomotor-06.webp','./assets/locomotor/locomotor-07.webp','./assets/locomotor/locomotor-08.webp','./assets/locomotor/locomotor-09.webp','./assets/locomotor/locomotor-10.webp','./assets/locomotor/locomotor-11.webp','./assets/locomotor/locomotor-12.webp','./assets/locomotor/locomotor-13.webp','./assets/locomotor/locomotor-14.webp','./assets/locomotor/locomotor-15.webp','./assets/locomotor/locomotor-16.webp','./assets/locomotor/locomotor-17.webp','./assets/locomotor/locomotor-18.webp','./assets/locomotor/locomotor-19.webp','./assets/locomotor/locomotor-20.webp','./v826-changelog.js','./v821-resource-audit.js','./v828-revision-clean.js','./v8309-revision-redesign.js','./v828-changelog.js','./v829-changelog.js','./v830-changelog.js','./v8301-changelog.js','./v8302-changelog.js','./v8303-changelog.js','./v8304-changelog.js','./v8305-changelog.js','./v8306-changelog.js','./v8307-changelog.js','./v8308-changelog.js','./v8309-changelog.js','./v8310-changelog.js','./v8303-home-startup.js','./resource-audit-v821.json','./qextra-11.txt','./qextra-12.txt','./qextra-13.txt','./qextra-14.txt','./qextra-15.txt','./qextra-16.txt','./qextra-17.txt','./qextra-18.txt','./qextra-19.txt','./qextra-20.txt','./qextra-21.txt','./qextra-22.txt','./qextra-23.txt','./qextra-24.txt','./qextra-25.txt','./qextra-26.txt','./qextra-27.txt','./qextra-28.txt','./qextra-29.txt','./qextra-30.txt','./qextra-31.txt','./qextra-32.txt','./qextra-33.txt','./qextra-34.txt','./qextra-35.txt','./qextra-36.txt','./qextra-37.txt','./qextra-38.txt','./build-meta.json','./tnr-v72.js'])assert(sw.includes(marker),`Asset absent du SW: ${marker}`);
const releaseCachePrefix=`ifsi-abc-v${releaseMeta.version.replaceAll('.','-')}-local-`;assert(sw.includes(releaseCachePrefix),`Cache PWA désynchronisé de V${releaseMeta.version}`);assert(sw.includes(`./${releaseChangelog}`),`Changelog courant absent du SW: ${releaseChangelog}`);assert(sw.includes('./qextra-42.txt'),'Asset qextra-42 absent du SW');assert(sw.includes('./qextra-43.txt'),'Asset qextra-43 absent du SW');assert(sw.includes('./qextra-44.txt'),'Asset qextra-44 absent du SW');assert(sw.includes('./qextra-45.txt'),'Asset qextra-45 absent du SW');assert(sw.includes('./qextra-46.txt'),'Asset qextra-46 absent du SW');assert(sw.includes('./qextra-47.txt'),'Asset qextra-47 absent du SW');
assert(sw.includes('syncCorrectionExplanation'),'Garde-fou de synchronisation des corrigés absent du SW');assert(sw.includes('function validateQuestion(')&&sw.includes('validQuestions('),'Garde-fou runtime QCM absent du SW');
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
assert(sw.indexOf('v87-settings.js')<sw.indexOf('v813-home-discovery.js'),'Accueil V8.13 doit être chargé après Paramètres');assert(sw.indexOf('v813-home-discovery.js')<sw.indexOf('v814-respiratory-atlas.js'),'Atlas respiratoire V8.14 doit être chargé après l’accueil V8.13');assert(sw.indexOf('v814-respiratory-atlas.js')<sw.indexOf('v815-urinary-atlas.js'),'Atlas urinaire V8.15 doit être chargé après l’atlas respiratoire');assert(sw.indexOf('v815-urinary-atlas.js')<sw.indexOf('v816-endocrine-atlas.js'),'Atlas endocrinien V8.16 doit être chargé après l’atlas urinaire');assert(sw.indexOf('v816-endocrine-atlas.js')<sw.indexOf('v817-immune-atlas.js'),'Atlas immunitaire V8.17 doit être chargé après l’atlas endocrinien');assert(sw.indexOf('v817-immune-atlas.js')<sw.indexOf('v822-nervous-atlas.js'),'Atlas nerveux V8.22 doit être chargé après l’atlas immunitaire');assert(sw.indexOf('v822-nervous-atlas.js')<sw.indexOf('v823-cardiovascular-atlas.js'),'Atlas cardiovasculaire V8.23 doit être chargé après l’atlas nerveux');assert(sw.indexOf('v823-cardiovascular-atlas.js')<sw.indexOf('v824-digestive-atlas.js'),'Atlas digestif V8.24 doit être chargé après l’atlas cardiovasculaire');assert(sw.indexOf('v824-digestive-atlas.js')<sw.indexOf('v829-locomotor-atlas.js'),'Atlas locomoteur V8.29 doit être chargé après l’atlas digestif');assert(sw.indexOf('v829-locomotor-atlas.js')<sw.indexOf('v8318-microscopic-atlas.js'),'Atlas microscopiques V8.30.18 doit être chargé après l’atlas locomoteur');assert(sw.indexOf('v8318-microscopic-atlas.js')<sw.indexOf('v826-changelog.js'),'Journal V8.26 doit rester chargé après les atlas');assert(sw.indexOf('v826-changelog.js')<sw.indexOf('v821-resource-audit.js'),'Audit ressources doit être chargé après le journal V8.26');assert(sw.indexOf('v821-resource-audit.js')<sw.indexOf('v828-revision-clean.js'),'Correctif Révision V8.28 doit être chargé après l’audit ressources');assert(sw.indexOf('v828-revision-clean.js')<sw.indexOf('v8309-revision-redesign.js'),'Refonte Révision V8.30.9 doit être chargée après V8.28');assert(sw.indexOf('v8309-revision-redesign.js')<sw.indexOf('v828-changelog.js'),'Changelog V8.28 doit rester chargé après les correctifs Révision');assert(sw.indexOf('v828-changelog.js')<sw.indexOf('v829-changelog.js'),'Changelog V8.29 doit être chargé après V8.28');assert(sw.indexOf('v829-changelog.js')<sw.indexOf('v830-changelog.js'),'Changelog V8.30 doit être chargé après V8.29');assert(sw.indexOf('v830-changelog.js')<sw.indexOf('v8301-changelog.js'),'Changelog V8.30.1 doit être chargé après V8.30');assert(sw.indexOf('v8301-changelog.js')<sw.indexOf('v8302-changelog.js'),'Changelog V8.30.2 doit être chargé après V8.30.1');assert(sw.indexOf('v8302-changelog.js')<sw.indexOf('v8303-changelog.js'),'Changelog V8.30.3 doit être chargé après V8.30.2');assert(sw.indexOf('v8303-changelog.js')<sw.indexOf('v8304-changelog.js'),'Changelog V8.30.4 doit être chargé après V8.30.3');assert(sw.indexOf('v8304-changelog.js')<sw.indexOf('v8305-changelog.js'),'Changelog V8.30.5 doit être chargé après V8.30.4');assert(sw.indexOf('v8305-changelog.js')<sw.indexOf('v8306-changelog.js'),'Changelog V8.30.6 doit être chargé après V8.30.5');assert(sw.indexOf('v8306-changelog.js')<sw.indexOf('v8307-changelog.js'),'Changelog V8.30.7 doit être chargé après V8.30.6');assert(sw.indexOf('v8307-changelog.js')<sw.indexOf('v8308-changelog.js'),'Changelog V8.30.8 doit être chargé après V8.30.7');assert(sw.indexOf('v8308-changelog.js')<sw.indexOf('v8309-changelog.js'),'Changelog V8.30.9 doit être chargé après V8.30.8');assert(sw.indexOf('v8309-changelog.js')<sw.indexOf('v8310-changelog.js'),'Changelog V8.30.10 doit être chargé après V8.30.9');assert(sw.indexOf('v8310-changelog.js')<sw.indexOf('v8303-home-startup.js'),'Synchroniseur accueil doit être chargé après le changelog V8.30.10');assert(sw.indexOf(releaseChangelog)<sw.indexOf('v8303-home-startup.js'),`Le changelog courant ${releaseChangelog} doit précéder le synchroniseur accueil`);assert(sw.indexOf('v8303-home-startup.js')<sw.indexOf('tnr-v72.js'),'Correctif accueil V8.30.3 doit être chargé avant le TNR navigateur');
const versionModule=read('app-version-v742.js');
for(const marker of [`const VERSION='${releaseMeta.version}'`,'IFSI_APP_VERSION','build-meta.json'])assert(versionModule.includes(marker),`Version V${releaseMeta.version} incomplète: ${marker}`);
const buildMeta=releaseMeta;assert(fs.existsSync(releaseChangelog),`Fichier changelog courant absent: ${releaseChangelog}`);
const changelog=read('changelog-v742.js');
for(const marker of ["const VERSION='8.27'",'v826Change','V8.26 — IST hors VIH et mises à jour fiables','v823Change','V8.23 — Système cardiovasculaire complet','v822Change','V8.22 — Atlas anatomique du système nerveux','v821Change','V8.21 — Audit automatique Drive ↔ Application','v820Change','V8.20 — Synchronisation Drive → application','v8191Change','V8.19.1 — Accueil allégé','v819Change','V8.19 — Nettoyage structurel','v818Change','V8.18 — Système nerveux complété','v817Change','V8.17 — Atlas immunitaire HD 8 planches','v816Change','V8.16 — Atlas endocrinien HD 8 planches','v8151Change','V8.15.1 — Correctif atlas urinaire','v815Change','V8.15 — Atlas urinaire 8 planches','v8141Change','V8.14.1 — Correctif atlas respiratoire','v814Change','V8.14 — Atlas respiratoire 8 planches','v813Change','V8.13 — Accueil : recherche cours & nouveautés','v812Change','V8.12 — Planches anatomiques multi-systèmes','v8114Change','V8.11.4 — Module respiratoire HD complet','v8113Change','V8.11.3 — Planche HD Voies respiratoires','v8112Change','V8.11.2 — Zoom plein écran des planches','v8111Change','V8.11.1 — Test réel de la planche Voies respiratoires','v811Change','V8.11 — Planches respiratoires premium','v810Change','V8.10 — Cours par domaine & Anatomie simplifiée','v891Change','V8.9.1 — Mathématiques dans le domaine E','v89Change','V8.9 — Mes cours rangés par UE','v884Change','V8.8.4 — Hotfix gel immédiat','v883Change','V8.8.3 — Correctif performance mobile','v882Change','V8.8.2 — Hotfix anti-gel mobile','v881Change','V8.8.1 — Stabilité mobile','v88Change','V8.8 — Audit et rangement des ressources','v87Change','V8.7 — Onglet Paramètres','v86Change','V8.6 — Accueil minimal','v85Change','V8.5 — Accueil allégé','v84Change','V8.4 — Système respiratoire enrichi','v83Change','v82Change','v81Change','v80Change','v79Change','IFSI_CHANGELOG'])assert(changelog.includes(marker),`Changelog historique incomplet: ${marker}`);
const v826Changelog=read('v826-changelog.js');for(const marker of ['v826Change','V8.26 — IST hors VIH et mises à jour fiables',"badge.textContent='V8.26'"])assert(v826Changelog.includes(marker),`Changelog V8.26 incomplet: ${marker}`);
const v828=read('v828-revision-clean.js');for(const marker of ["const V='8.28'","if(id!=='v81Hub')$('v81Hub')?.classList.add('hidden')",'v828PreToggle','v828SearchToggle','v828GoalToggle','IFSI_V828'])assert(v828.includes(marker),`Correctif V8.28 incomplet: ${marker}`);
const v8309Revision=read('v8309-revision-redesign.js');for(const marker of ["const V='8.30.9'",'v8309-dashboard','v8309WeakBtn','v8309-more','Révision express','Examen blanc','v8309-hidden','IFSI_V8309'])assert(v8309Revision.includes(marker),`Refonte Révision V8.30.9 incomplète: ${marker}`);
const v828Change=read('v828-changelog.js');for(const marker of ['v828Change','V8.28 — Centre de révision simplifié',"badge.textContent='V8.28'"])assert(v828Change.includes(marker),`Changelog V8.28 incomplet: ${marker}`);
for(let i=1;i<=20;i++){const p=`assets/locomotor/locomotor-${String(i).padStart(2,'0')}.webp`;assert(fs.existsSync(p),`Planche locomoteur locale absente: ${p}`)}
const v829=read('v829-locomotor-atlas.js');for(const marker of ["const V='8.30.2'",'const ATLAS=[','loco_atlas_01','loco_atlas_20','buildCatalogSection','data-v830open','v830ZoomOpen','setFav','Consultation + zoom','👁️ Voir la planche','assets/locomotor/locomotor-','IFSI_V830'])assert(v829.includes(marker),`Atlas locomoteur V8.30.2 incomplet: ${marker}`);assert(!v829.includes('id="v830Train"')&&!v829.includes('id="v830Test"')&&!v829.includes('function renderTrain(')&&!v829.includes('function renderTest('),'Les modes locomoteur entraînement/test doivent rester désactivés');const locoCount=(v829.match(/id:'loco_atlas_/g)||[]).length;assert(locoCount===20,`Atlas locomoteur incomplet: ${locoCount}/20 planches`);
const v829Change=read('v829-changelog.js');for(const marker of ['v829Change','V8.29 — Atlas anatomique locomoteur HD',"badge.textContent='V8.29'"])assert(v829Change.includes(marker),`Changelog V8.29 incomplet: ${marker}`);
const v830Change=read('v830-changelog.js');for(const marker of ['v830Change','V8.30 — Anatomie locomotrice active et mises à jour robustes',"badge.textContent='V8.30'"])assert(v830Change.includes(marker),`Changelog V8.30 incomplet: ${marker}`);
const v8301Change=read('v8301-changelog.js');for(const marker of ['v8301Change','V8.30.1 — Correctif mobile atlas locomoteur',"badge.textContent='V8.30.1'"])assert(v8301Change.includes(marker),`Changelog V8.30.1 incomplet: ${marker}`);
const v8302Change=read('v8302-changelog.js');for(const marker of ['v8302Change','V8.30.2 — Locomoteur en consultation stable',"badge.textContent='V8.30.2'"])assert(v8302Change.includes(marker),`Changelog V8.30.2 incomplet: ${marker}`);
const v8303Change=read('v8303-changelog.js');for(const marker of ['v8303Change','V8.30.3 — Accueil synchronisé au démarrage',"badge.textContent='V8.30.3'"])assert(v8303Change.includes(marker),`Changelog V8.30.3 incomplet: ${marker}`);
const v8304Change=read('v8304-changelog.js');for(const marker of ['v8304Change','V8.30.4 — Nouveautés visibles dès l’ouverture',"badge.textContent='V8.30.4'"])assert(v8304Change.includes(marker),`Changelog V8.30.4 incomplet: ${marker}`);
const v8305Change=read('v8305-changelog.js');for(const marker of ['v8305Change','V8.30.5 — Vocaux cardiovasculaires',"badge.textContent='V8.30.5'"])assert(v8305Change.includes(marker),`Changelog V8.30.5 incomplet: ${marker}`);
const v8306Change=read('v8306-changelog.js');for(const marker of ['v8306Change','V8.30.6 — Série cardiovasculaire complète',"badge.textContent='V8.30.6'"])assert(v8306Change.includes(marker),`Changelog V8.30.6 incomplet: ${marker}`);
const v8307Change=read('v8307-changelog.js');for(const marker of ['v8307Change','V8.30.7 — Cours et Révision clarifiés',"badge.textContent='V8.30.7'",'favoris QCM dupliqués'])assert(v8307Change.includes(marker),`Changelog V8.30.7 incomplet: ${marker}`);
const v8308Change=read('v8308-changelog.js');for(const marker of ['v8308Change','V8.30.8 — Série complète Système nerveux',"badge.textContent='V8.30.8'",'38 vocaux actifs'])assert(v8308Change.includes(marker),`Changelog V8.30.8 incomplet: ${marker}`);
const v8309Change=read('v8309-changelog.js');for(const marker of ['v8309Change','V8.30.9 — Centre de révision allégé',"badge.textContent='V8.30.9'",'points faibles sont intégrés'])assert(v8309Change.includes(marker),`Changelog V8.30.9 incomplet: ${marker}`);
const v8310Change=read('v8310-changelog.js');for(const marker of ['v8310Change','V8.30.10 — Audit catalogue fiabilisé',"badge.textContent='V8.30.10'",'80 planches HD'])assert(v8310Change.includes(marker),`Changelog V8.30.10 incomplet: ${marker}`);
const v8316Change=read('v8316-changelog.js');for(const marker of ['v8316Change','V8.30.16 — Introduction au droit',"badge.textContent='V8.30.16'",'Facile, Moyen ou Difficile'])assert(v8316Change.includes(marker),`Changelog V8.30.16 incomplet: ${marker}`);
const v8303Home=read('v8303-home-startup.js');const releaseChangelogGlobal=`IFSI_V${releaseMeta.build}_CHANGELOG`;for(const marker of [`const V='${releaseMeta.version}'`,'v8303HomeExtras','ifsi:v73-ready','window.IFSI_V76?.refresh?.()','window.IFSI_CHANGELOG?.refresh?.()',releaseChangelogGlobal,'normalizeHomeState','patchNavigation','IFSI_V8303'])assert(v8303Home.includes(marker),`Synchronisation accueil V${releaseMeta.version} incomplète: ${marker}`);
const analytics=read('analytics-v77.js');
for(const marker of ["const VERSION='7.7'",'analytics_events','app_open','qcm_start','qcm_finish','resource_open','vocal_start','ifsiabc_analytics_optout_v1','sessionStorage','IFSI_V77'])assert(analytics.includes(marker),`Analytics V7.7 incomplet: ${marker}`);
assert(analytics.includes('sb_publishable_'),'Clé publishable Supabase absente');assert(!analytics.includes('sb_secret_'),'Une clé secrète ne doit jamais être exposée côté client');
for(const forbidden of ['email_address:','full_name:','username:','user_id:','ip_address:'])assert(!analytics.includes(forbidden),`Champ personnel interdit dans analytics: ${forbidden}`);
assert(analytics.includes("$('v77Privacy')?.remove()"),'Le bloc statistiques doit être retiré de l’accueil');assert(!analytics.includes("host.appendChild(box)"),'Le bloc statistiques ne doit plus être injecté sur l’accueil');
const v79=read('v79-themes.js');for(const marker of ["const VERSION='7.9'",'v79Builder','themeOf','difficultyOf','startCustom','IFSI_V79'])assert(v79.includes(marker),`Fonction V7.9 absente: ${marker}`);
const v74=read('v74-pack.js');for(const marker of ['v74-domain-group','v74-domain-body','domainName74','Ressources rangées par domaine puis par UE.'])assert(v74.includes(marker),`Rangement Mes cours V8.10 incomplet: ${marker}`);
const calc=read('calculs-parcours-v1.js');for(const marker of ["COURSE_ID='calculs_doses_mathematiques'",'stageFor','startProgressive','IFSI_CALCULS'])assert(calc.includes(marker),`Parcours calculs incomplet: ${marker}`);
const v81=read('v81-suite.js');for(const marker of ["const V='8.1'",'v81_activity','v81_goal','Bilan détaillé','Points faibles','Examen blanc intelligent','Avant partiel','Recherche avancée','startWeak','startMock','startQuick','startPreExam','IFSI_V81'])assert(v81.includes(marker),`Fonction V8.1 absente: ${marker}`);for(const marker of ['qcm_start','selected_courses','themes','mode','count'])assert(v81.includes(marker),`Analytics V8.1 incomplète: ${marker}`);
const v82=read('v82-nav-anatomy.js');for(const marker of ["const V='8.24'",'showSystemBoards','URINARY_BOARDS','urinary001','urinary002','urinary003','systeme_urinaire','systeme_cardiovasculaire','Anatomie & Physiologie','Des planches anatomiques classées par cours.','Voir les planches','v82-resp-card','index:1','Apprendre','S’entraîner','Tester','data-v82diagram','systeme_respiratoire','showAnatomy','IFSI_V82'])assert(v82.includes(marker),`Catalogue Anatomie V8.24 incomplet: ${marker}`);
assert(!v82.includes("return (resources(def.id).infographics||[])"),'Une infographie ne doit jamais devenir automatiquement une planche anatomique');
assert(v82.includes('séparation stricte')&&v82.includes('return []'),'Règle V8.19 de séparation Infographies / Anatomie absente');
const v83=read('v83-anatomy-interactive.js');for(const marker of ["const V='8.12'",'SYSTEM_META','systeme_urinaire','urinary001','urinary002','urinary003','1oMT0A4FuqrVWaI8GDLIKeI1qc3qxm67V','1GdqA-Vw5zIWBZFzLTLfOrpatl9ayJ57J','155CIVMe4XaPcfkcGM8SS2MFW5XdL7Hpl','v83Zoom','v83ZoomOpen','bindZoom','zoomBy','pointermove','wheel','resp003','resp013','resp015','drive.google.com/thumbnail?id=1_xbRk8WEGKha8Mggn0br5oAFQnxveXtJ','drive.google.com/thumbnail?id=1G2agsVxnMlIeksAdV0-vguUE5bRKQ65Y','drive.google.com/thumbnail?id=11A147V9LowK3-PnJASkqmrfU-T1nTVIJ','resp-official-bronchial-learn.jpg','Support officiel du cours','Apprendre','S’entraîner','Tester','diagramMastery','toggleFavorite','openDiagram','ifsiabc_v83_anatomy_mastery_v1','IFSI_V83'])assert(v83.includes(marker),`Planche interactive V8.12 incomplète: ${marker}`);assert(!v83.includes('schema-resp003.svg')&&!schemaSource.includes('schema-resp003.svg'),'Les SVG respiratoires simplifiés ne doivent plus être actifs');
if(skipped.length)console.warn('⚠️ Packs optionnels ignorés:',skipped.join(' | '));
console.log(`✅ TNR données: ${runtime.length+schemaIds.length} questions runtime contrôlées • 4 réponses normalisées: ${runtimeNormalizedFour} • dette runtime 3/4: ${runtimeThreeOfFour}`);console.log(`✅ ${rawAudited} QCM bruts audités • questions à 4 bonnes réponses: ${rawOver3} • dette 3/4: ${rawThreeOfFour} • dette explications absentes: ${rawMissingExplanation}`);
console.log(`✅ Banque calculs: ${calcQuestions.length} questions exploitables`);
console.log(`✅ ${vocals.length} vocaux et ${registry.courses.length} courseId contrôlés`);
const v84=read('v84-respiratory-polish.js');for(const marker of ["const V='8.11'",'function decorate(){updateBodyClass()}'])assert(v84.includes(marker),`Couche respiratoire V8.11 incomplète: ${marker}`);
const v85=read('v85-home-lite.js');for(const marker of ["const V='8.5'",'v85-home','v82Primary','v76-today','⚙️ Plus','IFSI_V85'])assert(v85.includes(marker),`Accueil V8.5 incomplet: ${marker}`);
const v86=read('v86-home-clean.js');for(const marker of ["const V=window.IFSI_APP_VERSION||'8.30.4'",'v86-home','v86Tools','v86SettingsDialog',"$('v76More')?.remove()",'IFSI_V86'])assert(v86.includes(marker),`Accueil V8.30 incomplet: ${marker}`);assert(v86.includes(':not(#v8303HomeExtras)'),'Le bloc Nouveautés accueil ne doit pas être masqué par le mode compact');
const v87=read('v87-settings.js');for(const marker of ["const V=window.IFSI_APP_VERSION||'8.30.4'",'settings87','v87Nav','Exporter mes résultats','Sauvegarde complète','Statistiques anonymes','Journal des évolutions','v87ForceUpdate','forceUpdate','v87Server','v87Build','IFSI_V87'])assert(v87.includes(marker),`Paramètres V8.30 incomplets: ${marker}`);
const v813=read('v813-home-discovery.js');for(const marker of ["const V='8.26'",'Rechercher un cours','grid-template-columns:1fr!important','v813Search','v813Results','systeme_urinaire','systeme_respiratoire','systeme_endocrinien','systeme_immunitaire','IFSI_V813'])assert(v813.includes(marker),`Accueil V8.25 incomplet: ${marker}`);assert(!v813.includes('id="v813News"')&&!v813.includes('class="v813-news"'),'Le panneau Nouveautés latéral ne doit plus être rendu sur l’accueil');
const v814=read('v814-respiratory-atlas.js');for(const marker of ["const V='8.14.1'",'resp_atlas_01','resp_atlas_08','Planche ${d.n}/8','DIRECT','1KRBSiliS28bwxYuOVRONNyX--EIFu1Kx','1r7yE3tfybb3NwHTFL7Czc4YU66ovceh4','10MHUvCdXBMzN4NSByaqv_4s_jSa8MnQV','1WlQUhCDtZIsPr-h3atnYxybO0hkYMxlw','1SDHGvwcbP7fdsFZk_ljdeKxwIbGeeRSr','1NlKD6v4iFgbXsnwpJS1IT4fBeqoz4Sl7','1tUgY_VkNhKJcIoFIsu3ZV8jt4LASXyB-','v814Zoom','decorateCatalog','IFSI_V814'])assert(v814.includes(marker),`Atlas respiratoire V8.14.1 incomplet: ${marker}`);assert(!v814.includes("const COLLAGE="),'Le découpage du collage ne doit plus être utilisé');
const v815=read('v815-urinary-atlas.js');for(const marker of ["const V='8.15.1'",'urinary_atlas_01','urinary_atlas_08','Complément anatomie','1xKV0-_DCk9nQbQjcCqibrQILNU9be8fG','v815Zoom','decorateCatalog','IFSI_V815'])assert(v815.includes(marker),`Atlas urinaire V8.15.1 incomplet: ${marker}`);
const v816=read('v816-endocrine-atlas.js');for(const marker of ["const V='8.16'",'endo_atlas_01','endo_atlas_08','Système endocrinien — Vue d’ensemble','Hypothalamus & hypophyse','Thyroïde','Parathyroïdes','Glandes surrénales','Pancréas endocrine','Gonades','Glande pinéale','Complément anatomie','v816Zoom','data-v816toggle','Masquer','Voir les planches','buildCatalogSection','IFSI_V816'])assert(v816.includes(marker),`Atlas endocrinien V8.16 incomplet: ${marker}`);
const v821=read('v821-resource-audit.js');for(const marker of ["const V='8.30.10'",'🔎 Contrôle des ressources','resource-audit-v821.json','IFSI_V823','IFSI_V824','IFSI_V829','atlasBoardContracts','renderBalance','anatomyInfoOverlap','runAudit','IFSI_V821'])assert(v821.includes(marker),`Audit ressources V8.30.10 incomplet: ${marker}`);
const audit821=json('resource-audit-v821.json');assert(audit821.version===releaseMeta.version,`Snapshot ressources V${releaseMeta.version} invalide`);assert(audit821.auditLogicVersion==='8.30.10','Version logique audit invalide');assert(audit821.expectedTotals?.courses===45,'Snapshot V8.30.36 cours invalide');assert(audit821.expectedTotals?.sheets===52,'Snapshot V8.30.36 fiches invalide');assert(audit821.expectedTotals?.infographics===155,'Snapshot V8.30.36 infographies invalide');assert(audit821.expectedTotals?.hdAtlasBoards===106,'Snapshot V8.30.21 planches HD invalide');assert(Object.keys(audit821.anatomyFolderContracts||{}).length===12,'Snapshot V8.30.21 dossiers 06 incomplet');assert(Object.keys(audit821.atlasBoardContracts||{}).length===12,'Snapshot contrats atlas incomplet');assert(Object.values(audit821.atlasBoardContracts||{}).reduce((a,b)=>a+b,0)===106,'Contrats atlas doivent totaliser 106 planches');
const v8318=read('v8318-microscopic-atlas.js');for(const marker of ["const V='8.30.20'",'micro_biomol_01','micro_cell_26','micro_bact_13','micro_virus_16','biomolecules','cellules_tissus','diagnostic_bacteriologie','virus','IFSI_V8318'])assert(v8318.includes(marker),`Atlas microscopiques V8.30.20 incomplet: ${marker}`);
assert((v8318.match(/id:'micro_/g)||[]).length===26,'Atlas microscopiques V8.30.20 doit contenir 26 planches');
assert((v8318.match(/id:'micro_biomol_/g)||[]).length===3,'Biomolécules: 3 planches attendues');
assert((v8318.match(/id:'micro_cell_/g)||[]).length===15,'Cellules et tissus: 15 planches attendues');
assert((v8318.match(/id:'micro_bact_/g)||[]).length===3,'Bactériologie: 3 planches attendues');
assert((v8318.match(/id:'micro_virus_/g)||[]).length===5,'Virus: 5 planches attendues');
const microOrder=[...v8318.matchAll(/id:'micro_[^']+',courseId:'[^']+',n:(\d+)/g)].map(m=>Number(m[1]));
assert(JSON.stringify(microOrder)===JSON.stringify(Array.from({length:26},(_,i)=>i+1)),'Ordre des 26 planches microscopiques invalide');
assert(!v8318.includes('new MutationObserver'),'Atlas microscopiques: MutationObserver interdit après le crash V8.30.18');
assert(!v8318.includes('setInterval('),'Atlas microscopiques: timer de démarrage interdit');
assert(!v8318.includes('show:()=>{}')&&!v8318.includes('decorateCatalog:()=>{}'),'Atlas microscopiques: hotfix no-op encore actif');
assert(v8318.includes('show,decorateCatalog:decorate'),'Atlas microscopiques: API lazy active absente');
assert(v82.includes('window.IFSI_V8318?.decorateCatalog?.()'),'Catalogue Anatomie: hook lazy des 26 planches absent');
const v817=read('v817-immune-atlas.js');for(const marker of ["const V='8.17'",'immu_atlas_01','immu_atlas_08','Système immunitaire — Vue d’ensemble','Moelle osseuse','Thymus','Réseau lymphatique','Ganglion lymphatique','Rate','Amygdales','Tissus lymphoïdes des muqueuses','Complément anatomie','v817Zoom','data-v817toggle','Masquer','Voir les planches','buildCatalogSection','IFSI_V817'])assert(v817.includes(marker),`Atlas immunitaire V8.17 incomplet: ${marker}`);
const v823=read('v823-cardiovascular-atlas.js');for(const marker of ["const V='8.23'",'cardio_atlas_01','cardio_atlas_08','systeme_cardiovasculaire','Cœur — Situation anatomique','Cœur — Vue antérieure','Cœur — Vue postérieure','Cœur — Vue intérieure','Vascularisation coronaire — Vue antérieure','Vascularisation coronaire — Vue postérieure','Système artériel du corps','Système veineux du corps','v823Zoom','data-v823toggle','Masquer','Voir les planches','IFSI_V823'])assert(v823.includes(marker),`Atlas cardiovasculaire V8.23 incomplet: ${marker}`);assert((v823.match(/id:'cardio_atlas_/g)||[]).length===8,'Atlas cardiovasculaire V8.23 doit contenir 8 planches');
const v824=read('v824-digestive-atlas.js');for(const marker of ["const V='8.24'",'digest_atlas_01','digest_atlas_12','systeme_digestif','Organes du système digestif','Cavité buccale, pharynx et œsophage','Estomac','Péritoine','Aorte abdominale','Vascularisation des viscères','Dents','Division segmentaire du foie','Neuf régions de l’abdomen','Muscles de la paroi abdominale','v824Zoom','data-v824toggle','Masquer','Voir les planches','IFSI_V824'])assert(v824.includes(marker),`Atlas digestif V8.24 incomplet: ${marker}`);assert((v824.match(/id:'digest_atlas_/g)||[]).length===12,'Atlas digestif V8.24 doit contenir 12 planches');
const v822=read('v822-nervous-atlas.js');for(const marker of ["const V='8.22'",'nerv_atlas_01','nerv_atlas_07','nerv_atlas_08','systeme_nerveux','Système nerveux — Vue d’ensemble','Encéphale humain','Lobes cérébraux','Tronc cérébral','Cervelet','Moelle épinière','Nerfs crâniens','Plexus nerveux','v822Zoom','data-v822toggle','Masquer','Voir les planches','IFSI_V822'])assert(v822.includes(marker),`Atlas nerveux V8.22 incomplet: ${marker}`);assert((v822.match(/id:'nerv_atlas_/g)||[]).length===8,'Atlas nerveux V8.22 doit contenir 8 planches');
const planningUx=read('planning-v1.js');
for(const marker of ["K_DAY='ifsiabc_planning_day_v1'",'function todaySummary()','function hasResources(id)','vp-day-toggle','vp-sourcechip',"version:'1.4'",'S7 saisie depuis photo'])assert(planningUx.includes(marker),`Planning ergonomique incomplet: ${marker}`);
assert(!planningUx.includes('3 plannings officiels importés'),'Le planning ne doit pas présenter S7 comme un PDF officiel');
assert(!planningUx.includes('Source officielle importée'),'Le planning ne doit pas utiliser une source officielle générique pour S7');
const planningKb=read('planning-v1.js');
assert(planningKb.includes("date:'2026-10-08',start:'09:00',end:'12:30'")&&planningKb.includes("teacher:'Timothy JAMES'"),'Intervenant FAC/KB du 08/10 matin incorrect');
assert(planningKb.includes("date:'2026-10-08',start:'13:30',end:'15:30'")&&planningKb.includes("teacher:'Vanessa PETIT'"),'Intervenant FAC/KB du 08/10 après-midi incorrect');
assert(planningKb.includes("date:'2026-10-06',start:'09:00',end:'12:30'")&&planningKb.includes("teacher:'L Chevreau'"),'Les jours antérieurs au 08/10 ne doivent pas être rétro-corrigés');
console.log(`✅ V${releaseMeta.version} contrôlée : release, cache PWA et changelog alignés dynamiquement`);
console.log('✅ V8.30.9 conservée : centre de Révision allégé, dashboard fusionné et recherche repliée');
console.log('✅ V8.30.8 conservée : série Système nerveux complète avec 5 vocaux');
console.log('✅ V8.24 contrôlée : système digestif et atlas HD 12 planches');
console.log('✅ V8.23 conservée : système cardiovasculaire, 53 QCM, fiche et atlas HD 8 planches');
console.log('✅ V8.22 conservée : atlas nerveux 8 planches, zoom, favoris et Voir/Masquer');
console.log('✅ V8.21 conservée : audit automatique Drive ↔ Application actif');
console.log('✅ V8.20 conservée : 21 QCM PDF représentés et infographies Drive synchronisées');
console.log('✅ V8.19.1 conservée : accueil sans panneau Nouveautés latéral et statistiques uniquement dans Paramètres');
console.log('✅ V8.19 conservée : séparation Infographies / Anatomie et boutons Masquer');
console.log('✅ V8.18 conservée : système nerveux, 49 QCM et 4 infographies');
console.log('✅ V8.17 conservée : atlas immunitaire HD 8 planches, zoom et favoris');
console.log('✅ V8.16 conservée : atlas endocrinien HD 8 planches, zoom et favoris');
console.log('✅ V8.15.1 contrôlée : atlas urinaire corrigé, planche urètre complète et zoom');
console.log('✅ V8.6 conservée : accueil minimal');
console.log('✅ V8.5 conservée comme couche de compatibilité');
console.log('✅ Visionneuse anatomique multi-systèmes contrôlée : Apprendre, zoom, favoris et progression');
console.log('✅ Anatomie V8.12 contrôlée : catalogue de planches par cours et visionneuse multi-systèmes');
console.log('✅ V8.1 conservée : dashboard, bilan QCM, points faibles, examens, avant-partiel, objectifs, recherche et nouveautés');
console.log('✅ V8.0 calculs conservée avec progression par difficulté');
console.log('✅ Analytics anonymes contrôlées sans clé secrète');