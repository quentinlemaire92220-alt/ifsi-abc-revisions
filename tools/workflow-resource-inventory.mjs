// Inventaire READ-ONLY des ressources historiques contre le workflow v1.14.
// Aucune lecture réseau, aucun accès Drive, aucune publication et aucune transformation.
// Node >=22 ; les résultats de présence ne valent PAS validation pédagogique/clinique.
import fs from 'node:fs';
import {pathToFileURL} from 'node:url';
import {runtimeDeck} from '../tests/flashcards-runtime-fixture.mjs';

const json=path=>JSON.parse(fs.readFileSync(path,'utf8'));
const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const hasSupportPointer=c=>Boolean(c.officialSupportUrl||(c.officialSupportItems||[]).length);
const ext=s=>String(s||'').split('.').at(-1).toLowerCase();
const plural=(n)=>n===1?'fiche':'fiches';

export async function buildAudit(){
 const registry=json('course-registry-v741.json').courses;
 const sheets=[1,2,3].flatMap(n=>json('sheets-'+n+'.json'));
 const infographics=json('infographics.json'),vocals=json('vocals.json');
 const lexicon=json('vocabulaire-v1.json').entries;
 const deliveries=json('docs/course-deliveries.json').courses||[];
 const {questions,deck}=await runtimeDeck();
 const courseMap=new Map(registry.map(c=>[c.id,c]));
 const aliases=new Map(registry.map(c=>[c.id,new Set([c.label,...(c.aliases||[])].map(norm))]));
 function questionCourse(q){
   if(courseMap.has(q.courseId))return q.courseId;
   const label=norm(q.course||q.theme);
   const hits=registry.filter(c=>aliases.get(c.id).has(label));
   return hits.length===1?hits[0].id:null;
 }
 const qc=new Map(registry.map(c=>[c.id,0]));
 let questionsWithoutCourse=0;
 for(const q of questions){
  const id=questionCourse(q);
  if(!id){questionsWithoutCourse++;continue}
  qc.set(id,qc.get(id)+1);
 }
 const courses=registry.map(c=>{
  const ownSheets=sheets.filter(s=>s.courseId===c.id);
  const ownInfo=infographics.filter(s=>s.courseId===c.id);
  const ownVocals=vocals.filter(s=>s.courseId===c.id);
  const ownTerms=lexicon.filter(x=>(x.courseIds||[]).includes(c.id));
  const ownDeck=deck.filter(x=>x.courseId===c.id&&x.kind!=='Vocabulaire');
  const parent=courseMap.get(c.parentId),intentionalChild=Boolean(parent&&c.showInCourses===false);
  const parentRelated=intentionalChild?sheets.filter(s=>s.courseId===parent.id&&
    (norm(s.title).includes(norm(c.label.split(' ')[0]))||
    (c.aliases||[]).some(a=>norm(a).length>8&&norm(s.title).includes(norm(a))))):[];
  const delivery=deliveries.find(d=>d.courseId===c.id);
  const flags=[];
  if(!ownSheets.length&&!intentionalChild)flags.push('no_catalogued_revision_sheet');
  if(!ownSheets.length&&intentionalChild)flags.push('hidden_child_check_parent_coverage');
  if(!hasSupportPointer(c))flags.push('official_source_link_not_catalogued');
  if(ownSheets.some(x=>!x.sheetFormat))flags.push('legacy_sheet_format_unclassified');
  if(!qc.get(c.id))flags.push('no_course_qcm_runtime');
  if(!ownDeck.length&&qc.get(c.id))flags.push('qcm_without_generated_flashcards');
  if(!delivery)flags.push('legacy_delivery_manifest_absent');
  const withoutFigure=ownInfo.length===0;
  return {
   courseId:c.id,label:c.label,ue:c.ue,parentId:c.parentId||null,showInCourses:c.showInCourses!==false,
   officialSourceLinkInRegistry:hasSupportPointer(c),
   sheets:ownSheets.length,pdfSheets:ownSheets.filter(x=>ext(x.title)==='pdf').length,
   nonPdfSheets:ownSheets.filter(x=>ext(x.title)!=='pdf').length,
   sheetFormats:{classic:ownSheets.filter(x=>x.sheetFormat==='classic').length,
                 completeInfographic:ownSheets.filter(x=>x.sheetFormat==='complete_infographic').length,
                 unclassified:ownSheets.filter(x=>!x.sheetFormat).length},
   infographics:ownInfo.length,individualInfographicsDecision:withoutFigure?'NOT_ASSESSED':'PRESENT',
   anatomyDecision:'NOT_ASSESSED',vocals:ownVocals.length,
   terms:ownTerms.length,qcm:qc.get(c.id),flashcards:ownDeck.length,
   deliveryManifest:Boolean(delivery),deliveryStatus:delivery?.status||null,
   parentSheetCandidates:parentRelated.length,
   v114Status:'UNVERIFIED_LEGACY',flags
  };
 });
 const tally=key=>courses.filter(c=>key(c)).length;
 return {
  workflow:'v1.14',basis:'catalogue and local QCM/flashcard runtime only; Drive PDF rendering and medical quality NOT VERIFIED',
  totals:{
   courses:registry.length,visibleCourses:tally(c=>c.showInCourses),groupedHiddenChildren:tally(c=>!c.showInCourses),
   sheets:sheets.length,pdfSheets:courses.reduce((a,c)=>a+c.pdfSheets,0),
   nonPdfSheets:courses.reduce((a,c)=>a+c.nonPdfSheets,0),
   unclassifiedSheetFormats:courses.reduce((a,c)=>a+c.sheetFormats.unclassified,0),
   withClassicalAndCompleteFormat:tally(c=>c.sheetFormats.classic>0&&c.sheetFormats.completeInfographic>0),
   withAnySheet:tally(c=>c.sheets>0),missingDirectSheet:tally(c=>!c.sheets),
   individuallyCataloguedInfographics:infographics.length,coursesWithInfographics:tally(c=>c.infographics>0),
   vocals:vocals.length,coursesWithVocals:tally(c=>c.vocals>0),
   vocabularyTerms:lexicon.length,coursesWithSourcePointer:tally(c=>c.officialSourceLinkInRegistry),
   coursesWithQcm:tally(c=>c.qcm>0),questionsWithoutResolvableCourse:questionsWithoutCourse,
   coursesWithManifest:tally(c=>c.deliveryManifest),flashcardsRuntimeTotal:deck.filter(c=>c.kind!=='Vocabulaire').length
  },
  caveats:[
   'Presence and courseId are not evidence of the exact PDF contents or clinical correctness.',
   'No individual infographic is NOT automatically an anomaly in v1.14.',
   'Hidden child courses may intentionally inherit a parent course sheet.',
   'No official source URL registered does NOT prove the official file is absent on Drive.',
   'Historic sheets are not retroactively required to satisfy v1.14 publication gates.'
  ],
  courses
 };
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const report=await buildAudit();
 if(process.argv.includes('--json'))console.log(JSON.stringify(report,null,2));
 else if(process.argv.includes('--markdown')){
  const T=report.totals;
  console.log('# État des ressources — audit v1.14 (catalogue GitHub, lecture seule)\n');
  console.log('**'+T.courses+' cours ; '+T.sheets+' fiches (dont '+T.pdfSheets+' PDF) ; '+T.individuallyCataloguedInfographics+' infographies ; '+T.vocals+' vocaux.**\n');
  console.log('| Cours | Fiches PDF / autres | Complète identifiée | QCM | Flashcards | Infos | Vocaux | Source référencée | Statut |');
  console.log('|---|---:|---|---:|---:|---:|---:|---|---|');
  for(const c of report.courses){
   const clean=s=>String(s).replaceAll('|','/');
   console.log('| '+clean(c.label)+' | '+c.pdfSheets+' / '+c.nonPdfSheets+
    ' | '+(c.sheetFormats.completeInfographic||'non typée')+
    ' | '+c.qcm+' | '+c.flashcards+' | '+c.infographics+' | '+c.vocals+
    ' | '+(c.officialSourceLinkInRegistry?'lien catalogué':'à vérifier')+
    ' | '+c.v114Status+' |');
  }
  console.log('\n*Non typée ≠ absente. Présence de lien ≠ source authentifiée. Statut v1.14 non vérifié pour chaque ancien cours.*');
 }
 else {
  console.log('🧭 Audit v1.14 READ-ONLY:',JSON.stringify(report.totals));
  for(const c of report.courses.filter(c=>c.flags.includes('no_catalogued_revision_sheet')||
        c.flags.includes('hidden_child_check_parent_coverage')||c.flags.includes('no_course_qcm_runtime')))
   console.log(c.courseId+': '+c.flags.join(', '));
  console.log('⚠️ Aucun cours historique certifié conforme par ce rapport: une revue des fichiers est nécessaire.');
 }
}
