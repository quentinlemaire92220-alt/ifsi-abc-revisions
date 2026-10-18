import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {runtimeDeck} from './flashcards-runtime-fixture.mjs';

// Audit en lecture seule sur la banque VRAIMENT fusionnée par le Service Worker.
// Les anciennes vérifications de doublons/thèmes/niveaux chargent des packs différents.
const {questions:all,registry,window:registries}=await runtimeDeck({includeVocabulary:true});
const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
const errors=[],counts={};
const add=(type,id,detail)=>{counts[type]=(counts[type]||0)+1;if(errors.length<55)errors.push({type,id,detail})};
const declared=new Set(registry.courses.map(c=>String(c.id)));
const ids=new Set(),byQuestionText=new Map(),courseCounts=new Map(),themeCounts=new Map(),levels={explicit:0,inferred:0,invalid:0},answersDistribution={1:0,2:0,3:0,4:0},choiceDistribution={4:0,5:0};
const rawSamples={shortExplanation:[],genericExplanation:[],sourceReferences:[],threeOfFour:[],missingCourseId:[],duplicateChoices:[],imageWithoutFigure:[],exactQuestionDuplicates:[]};
const pick=(type,q)=>{const a=rawSamples[type];if(a&&a.length<8)a.push({id:q.id,course:q.course,question:q.question.slice(0,130)})};
for(const q of all){
 if(!q||typeof q.id!=='string'||!q.id) {add('id_missing','?', 'ID absent');continue}
 if(ids.has(q.id))add('id_duplicate',q.id,'ID déjà utilisé');
 ids.add(q.id);
 const qkey=norm(q.question).replace(/[?!,;.:]+$/,'');
 if(qkey){const previous=byQuestionText.get(qkey);if(previous){add('identical_question',q.id,'Même énoncé que '+previous);pick('exactQuestionDuplicates',q)}else byQuestionText.set(qkey,q.id)}
 if(!String(q.question||'').trim())add('question_missing',q.id,'Énoncé absent');
 if(!Array.isArray(q.choices)||![4,5].includes(q.choices.length)){add('invalid_choices',q.id,'4 ou 5 choix attendus');continue}
 choiceDistribution[q.choices.length]++;
 const choices=q.choices.map(norm);
 if(choices.some(x=>!x))add('blank_choice',q.id,'Proposition vide');
 if(new Set(choices).size!==choices.length){add('duplicate_choices',q.id,'Choix identiques');pick('duplicateChoices',q)}
 if(!Array.isArray(q.answers)||q.answers.length<1||q.answers.length>3){add('invalid_answer_count',q.id,'1 à 3 bonnes réponses attendues');continue}
 answersDistribution[q.answers.length]++;
 if(new Set(q.answers).size!==q.answers.length||q.answers.some(x=>!Number.isInteger(x)||x<0||x>=q.choices.length))add('invalid_answer_index',q.id,'Index dupliqué ou invalide');
 if(q.answers.length>=q.choices.length)add('no_distractor',q.id,'Aucune réponse fausse');
 if(q.choices.length===4&&q.answers.length===3){counts.three_of_four=(counts.three_of_four||0)+1;pick('threeOfFour',q)}
 const explanation=String(q.explanation||'').trim();
 if(!explanation)add('missing_explanation',q.id,'Corrigé absent');
 else {
  if(explanation.length<80){(counts.short_explanation??=0);counts.short_explanation++;pick('shortExplanation',q)}
  if(/^r[eé]ponses? attendues? selon le corrig[eé] du QCM\s*:/i.test(explanation)){(counts.generic_explanation??=0);counts.generic_explanation++;pick('genericExplanation',q)}
 }
 if(/\b(?:radiographie|photographie|sur la radio|sur le clich[eé]|sur ce trac[eé]|sur cette image)\b/i.test(q.question)){counts.image_without_figure=(counts.image_without_figure||0)+1;pick('imageWithoutFigure',q)}
 if(/\b(?:selon la diapo|dans le cours|comme vu en cours|sur le support|illustration ci[- ]dessous)\b/i.test(q.question)){(counts.source_dependent_question??=0);counts.source_dependent_question++;pick('sourceReferences',q)}
 const course=String(q.courseId||q.course||q.theme||'Sans cours');
 courseCounts.set(course,(courseCounts.get(course)||0)+1);
 const th=String(registries.IFSI_V79?.themeOf?.(q)||q.theme||'Général');
 const themes=themeCounts.get(course)||new Set();themes.add(th);themeCounts.set(course,themes);
 if(!q.courseId){(counts.missing_courseId??=0);counts.missing_courseId++;pick('missingCourseId',q)}
 else if(!declared.has(String(q.courseId))){(counts.unregistered_courseId??=0);counts.unregistered_courseId++}
 if(['easy','medium','hard'].includes(q.difficulty))levels.explicit++;
 else if(q.difficulty==null||q.difficulty==='')levels.inferred++;
 else levels.invalid++;
}
assert.equal(all.length,3038,'Banque active : 2560 QCM Service Worker + 478 QCM vocabulaire');
assert.equal(all.filter(q=>q.kind==='Vocabulaire').length,478);
assert.equal(counts.missing_courseId||0,0,'Chaque QCM actif doit être rattaché à un cours');
assert.equal(ids.size,all.length,'Identifiants en double dans la banque active');
for(const key of ['id_missing','id_duplicate','question_missing','invalid_choices','blank_choice','invalid_answer_count','invalid_answer_index','no_distractor','missing_explanation'])assert.equal(counts[key]||0,0,'Erreur structurelle active : '+key);
assert.equal(levels.invalid,0,'Niveaux de difficulté invalides');
const access=fs.readFileSync('v8357-qcm-access.js','utf8');
const elements=new Map(),fake=()=>({innerHTML:'',value:'all',textContent:'',disabled:false});
for(const id of ['v8357QcmCard','v8357Domain','v8357Course','v8357Theme','v8357Difficulty','v8357Count','v8357Mode','v8357Available','v8357Launch'])elements.set(id,fake());
const context={Q:all,window:{IFSI_QCM_LOAD:{status:'ready',count:all.length,failed:[]},IFSI_V741:registries.IFSI_V741,IFSI_V79:registries.IFSI_V79},document:{getElementById:id=>elements.get(id)},console};
vm.createContext(context);
vm.runInContext(access.slice(0,access.indexOf('function css(){')).replace("(()=>{'use strict';","'use strict';"),context);
const count=vm.runInContext('pool().length',context);
vm.runInContext('populate()',context);
assert.equal(count,all.length,'Les filtres Tous ne doivent éliminer aucun QCM');
assert.equal(elements.get('v8357Launch').disabled,false,'Bouton QCM doit être cliquable si la banque est chargée');
assert.match(elements.get('v8357Available').textContent,new RegExp('^'+all.length+' questions disponibles?'),'Compteur QCM incorrect');
const auditedCourses=[...courseCounts.entries()].sort((a,b)=>b[1]-a[1]);
const single=[...courseCounts].filter(([c,n])=>n>=20&&(themeCounts.get(c)?.size||0)===1).map(([id,count])=>({id,count}));
const report={
 version:JSON.parse(fs.readFileSync('build-meta.json','utf8')).version,
 bankScope:'Service Worker + vocabulaire généré (fixture ; ordre réel contrôlé par Playwright)',
 runtimeQuestions:all.length,uniqueIds:ids.size,registryCourses:registry.courses.length,
 coursesWithQuestions:courseCounts.size,totalAllFilter:count,
 choices:choiceDistribution,correctAnswers:answersDistribution,
 difficulty:levels,oneThemeCoursesWithAtLeast20:single,
 errors:counts,firstErrors:errors,qualityExamples:rawSamples,
 largestCourses:auditedCourses.slice(0,15).map(([id,count])=>({id,count,themes:themeCounts.get(id).size}))
};
console.log('AUDIT_QCM_RUNTIME_COMPLET_JSON');
console.log(JSON.stringify(report,null,2));
console.log('✅ Audit QCM complet : toutes les questions du Service Worker, filtres Tous, corrections, réponses, cours, thèmes, niveaux et alertes qualité contrôlés');
