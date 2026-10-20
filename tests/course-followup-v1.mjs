import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const src=fs.readFileSync('course-followup-v1.js','utf8');
const storage=new Map();
const context={window:{addEventListener(){}},document:{getElementById(){return null}},localStorage:{
 getItem:key=>storage.get(key)||null,setItem:(key,v)=>storage.set(key,v)
},setInterval:()=>0,Date,Intl};
vm.runInNewContext(src,context,{filename:'course-followup-v1.js'});
const api=context.window.IFSI_COURSE_FOLLOWUP;
assert.ok(api&&typeof api.courseModel==='function');
const registry=JSON.parse(fs.readFileSync('course-registry-v741.json','utf8')).courses;
assert.ok(registry.length>=45,'Catalogue des cours incomplet');
const ids=new Set(registry.map(c=>c.id));
assert.equal(ids.size,registry.length,'Identifiants dupliqués');
const sample=registry.find(c=>c.id==='systeme_respiratoire');
const sampleView=api.courseModel(sample,{sheets:[{}],questions:[{}],infographics:[],vocals:[]},2,5);
assert.equal(sampleView.hasOfficial,true);
assert.equal(sampleView.toReview,false);
const noLink=api.courseModel({...sample,officialSupportUrl:null,officialSupportItems:[]},{sheets:[{}],questions:[{}]},2,5);
assert.equal(noLink.toReview,true);
assert.equal(noLink.count.infographics,0,'Pas de schéma = pas automatiquement un blocage');
const noQcm=api.courseModel(sample,{sheets:[{}],questions:[]},null,null);
assert.equal(noQcm.toReview,true);
assert.equal(noQcm.count.flashcards,null,'Les ressources non chargées doivent être indéterminées');
const hidden=api.courseModel({...sample,showInCourses:false},{sheets:[],questions:[]},null,null);
assert.equal(hidden.hidden,true);
const planningSrc=fs.readFileSync('planning-v1.js','utf8');
const plan={window:{},document:{},localStorage:{getItem:()=>null,setItem(){}},setInterval:()=>0,Date,Intl};
vm.runInNewContext(planningSrc,plan,{filename:'planning-v1.js'});
const weeks=plan.window.IFSI_PLANNING.weeks;
const s7=weeks.find(x=>x.id==='S7');
const conflicts=s7.events.filter(x=>x.date==='2026-10-12'&&x.start==='09:00'&&x.title==='Rôles et missions de l’IDE');
assert.equal(conflicts.length,2);
assert.equal(conflicts.filter(x=>api.eventForGroup(x,'B1')).length,1,'Ne pas agréger B1/B2');
assert.equal(conflicts.filter(x=>api.eventForGroup(x,'B2')).length,1,'Ne pas agréger B1/B2');
const b1=api.eventsForWeek(s7,'B1');
assert.ok(b1.length>0);
assert.ok(!b1.some(x=>x.groups?.length&&!x.groups.includes('B1')),'Séance d’un autre groupe présente');
// Le suivi des fiches n'est pas une copie intégrale du calendrier.
const s8=weeks.find(x=>x.id==='S8');
assert.ok(s8.events.some(e=>e.title==='Connexion plateforme Myschool'),'MySchool doit rester dans le planning général');
const suivis8=api.eventsForWeek(s8,'B1');
assert.ok(!suivis8.some(e=>/connexion plateforme myschool/i.test(e.title)),'La connexion MySchool ne doit pas apparaître au suivi');
assert.ok(suivis8.some(e=>e.title==='Gestion du stress'),'Un vrai TD doit rester visible');
assert.ok(suivis8.some(e=>e.title==='Initiation à la philosophie éthique'),'Un CM doit rester visible');
assert.ok(!api.eventsForWeek(s7,'B1').some(e=>/appropriation des connaissances/i.test(e.title)),'Même de type TD, une plage autonome doit disparaître du suivi');
for(const title of [
 'Connexion plateforme Myschool','Connexion Mischool (pour ESI Nv2)',
 'Temps d’Appropriation des Connaissances','Travail personnel',
 'Simulation Temps d’Appropriation des Connaissances',
 'Présentation Blason collectif de promotion','Test de personnalité (Big Five)',
 'Simulation Serious Game et Quizz','Réalisation de cas concrets et outil de révision PV',
 'Visionnage du film sur « Les objectifs de stage »'
]){
 assert.equal(api.isRevisionSession({title,type:'TD'}),false,'Activité non révisable conservée : '+title);
}
for(const [title,type] of [
 ['Gestion du stress','TD'],['Simulation en santé J1','TP'],
 ['Simulation J3 — Pansement simple avec pinces','TD'],
 ['Initiation à la philosophie éthique','CM'],['Atelier calculs ESI Nv3','Asynchrone'],
 ['Cours de physiologie respiratoire (support E-campus)','Asynchrone']
]){
 assert.equal(api.isRevisionSession({title,type}),true,'Cours pédagogique exclu à tort : '+title);
}
assert.equal(api.isRevisionSession({title:'Pharmacologie des antalgiques',type:'Annulé'}),false);
assert.equal(api.isRevisionSession({title:'Présentation plateforme MyK',type:'Info'}),false);

const canceled=weeks.flatMap(x=>x.events).find(x=>/annul/i.test(x.type||''));
assert.ok(canceled&&api.eventForGroup(canceled,'B1'),'Séance annulée conservée comme telle au planning');
assert.ok(!/https:\/\/docs\.google\.com\/spreadsheets\/d\//i.test(src),'Aucun registre privé dans le JavaScript public');
assert.ok(!/plaud|transcript|sourceSha256|sourceStatus|sharedSecret/i.test(src),'Métadonnées personnelles interdites');
const html=fs.readFileSync('index.html','utf8'),sw=fs.readFileSync('sw.js','utf8');
assert.ok(html.includes('course-followup-v1.js'),'Chargement du suivi navigateur absent');
assert.ok(sw.includes('./course-followup-v1.js'),'Module absent du cache PWA');
const settings=fs.readFileSync('v87-settings.js','utf8');
assert.ok(settings.includes('id="v87Followup"'),'Entrée Suivi absente des Paramètres');
assert.ok(settings.includes("$('v87Followup').onclick=()=>window.IFSI_COURSE_FOLLOWUP?.show?.()"),'Bouton Paramètres non relié');
assert.ok(settings.includes("'v829LocomotorAtlas','courseFollowup'].forEach"),'Retour Paramètres : la vue Suivi doit être masquée');
assert.ok(!src.includes('vCourseFollowupNav')&&!src.includes('vfollowup-nav'),'Suivi encore présent dans la navigation du bas');
assert.ok(src.includes('bindBottomNavigation')&&src.includes("$('v87Settings')?.classList.add('on')"),'Navigation Paramètres incomplète');
assert.ok(src.includes('id="cfBackSettings"')&&src.includes("$('cfBackSettings').onclick"),'Bouton retour Paramètres absent');

console.log('✅ Suivi sous Paramètres : séances révisables, navigation, groupes, confidentialité et PWA');
