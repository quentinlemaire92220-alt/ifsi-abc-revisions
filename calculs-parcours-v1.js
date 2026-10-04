(()=>{
'use strict';
const COURSE_ID='calculs_doses_mathematiques';
const VERSION='1.1';
const LEVELS=[
 {id:1,title:'Conversions et lecture des unités',icon:'🔢'},
 {id:2,title:'Durées et horaires',icon:'⏱️'},
 {id:3,title:'Pourcentages, pour mille et concentrations',icon:'🧪'},
 {id:4,title:'Comprimés, ampoules et doses proportionnelles',icon:'💊'},
 {id:5,title:'Solutions buvables et gouttes orales',icon:'💧'},
 {id:6,title:'Perfusions et débits',icon:'🩸'},
 {id:7,title:'Électrolytes et volumes ajoutés',icon:'➕'},
 {id:8,title:'Reconstitution et horaires de prises',icon:'🧴'},
 {id:9,title:'Dilutions : exercices de mathématiques',icon:'↔️'},
 {id:10,title:'Problèmes complets type IFSI',icon:'🎓'}
];
const $=id=>document.getElementById(id);
const shuffle=a=>{for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
function isCalc(q){return q?.courseId===COURSE_ID||/calculs? de doses|math[eé]matiques/i.test(q?.course||'')}
function calcQuestions(){return (Array.isArray(Q)?Q:[]).filter(isCalc)}
function levelOf(q){if(Number.isInteger(q?.level)&&q.level>=1&&q.level<=10)return q.level;const s=(q?.theme||'')+' '+(q?.question||'');
  if(/buvable|gouttes orales|compte-gouttes/i.test(s))return 5;
  if(/[ée]lectrolyte|kcl|nacl|par litre|par poche|volume ajout/i.test(s))return 7;
  if(/dilution|c1|v1|solution m[eè]re/i.test(s))return 9;
  if(/reconstitution|volume final|poudre/i.test(s))return 8;
  if(/perfusion|d[eé]bit|gouttes\/min|pousse-seringue|seringue [ée]lectrique/i.test(s))return 6;
  if(/pourcent|pour mille|‰|concentration|dosage/i.test(s))return 3;
  if(/comprim|ampoule|dose|proportion|r[eè]gle de trois/i.test(s))return 4;
  if(/dur[eé]e|horaire|heure|minute|temps/i.test(s))return 2;
  if(/probl[eè]me complet|cas |type feuille/i.test(s))return 10;
  return 1;
}
function difficultyOf(q){return ['easy','medium','hard'].includes(q?.difficulty)?q.difficulty:(window.IFSI_V72?.difficultyOf?.(q)||'medium')}
function qstats(){try{return typeof st==='function'?(st().v7QuestionStats||{}):{}}catch{return {}}}
function statsFor(level,difficulty=null){const qs=calcQuestions().filter(q=>levelOf(q)===level&&(!difficulty||difficultyOf(q)===difficulty));const s=qstats();let seen=0,answered=0,correct=0;for(const q of qs){const x=s[q.id];if(x?.answered){seen++;answered+=x.answered||0;correct+=x.correct||0}}return{total:qs.length,seen,answered,correct,rate:answered?Math.round(correct/answered*100):null}}
function passed(s,minSeen){return s.seen>=Math.min(minSeen,s.total)&&s.rate!==null&&s.rate>=80}
function stageFor(level){const e=statsFor(level,'easy'),m=statsFor(level,'medium'),h=statsFor(level,'hard');if(!passed(e,4))return'easy';if(!passed(m,5))return'medium';if(!passed(h,2))return'hard';return'mixed'}
function mastery(level){const all=statsFor(level);return stageFor(level)==='mixed'&&all.rate!==null&&all.rate>=80}
function stageLabel(s){return s==='easy'?'🟢 Facile':s==='medium'?'🟠 Intermédiaire':s==='hard'?'🔴 Difficile':'🟣 Mixte'}
function currentCourseTitle(){return document.querySelector('#v74CourseDetail .v74-course-head h2')?.textContent?.trim()||''}
function isCalcPage(){return /calculs? de doses|math[eé]matiques/i.test(currentCourseTitle())}
function css(){if($('calcMasteryCss'))return;const s=document.createElement('style');s.id='calcMasteryCss';s.textContent=`
.calc-mastery{border:1px solid #cfc2ee;background:linear-gradient(145deg,#fff,#faf7ff)}.calc-levels{display:grid;gap:9px;margin-top:12px}.calc-level{border:1px solid var(--line);border-radius:16px;padding:12px;background:var(--card)}.calc-level.done{box-shadow:inset 4px 0 #12a7a1}.calc-level .top{display:flex;gap:10px;justify-content:space-between;align-items:flex-start}.calc-level .num{width:31px;height:31px;border-radius:50%;display:grid;place-items:center;background:#6941c6;color:#fff;font-weight:900;flex:0 0 auto}.calc-level .name{font-weight:900}.calc-level .meta{font-size:11px;color:var(--muted);margin-top:3px}.calc-bar{height:7px;border-radius:999px;background:#ece8f1;overflow:hidden;margin:9px 0}.calc-bar span{height:100%;display:block;background:linear-gradient(90deg,#12a7a1,#6941c6)}.calc-actions{display:flex;gap:7px;flex-wrap:wrap}.calc-roadmap{border-radius:14px;background:#eef9ff;border:1px solid #cae7f5;padding:11px 12px;margin-top:10px}.calc-badge{font-size:11px;border-radius:999px;padding:4px 8px;background:#f1edf8;color:#5b3f8c;font-weight:800}.calc-badge.ok{background:#d9f4f1;color:#116e69}.calc-master-btn{width:100%;margin-top:10px}@media(min-width:760px){.calc-levels{grid-template-columns:repeat(2,1fr)}} body.v72-dark .calc-mastery,body.v72-dark .calc-level{background:#211e2a;color:#f4f0fb;border-color:#3b3548}body.v72-dark .calc-roadmap{background:#23313f;border-color:#354b58}`;document.head.appendChild(s)}
function startLevel(level,count=10,mode='train',difficulty=null){let pool=calcQuestions().filter(q=>levelOf(q)===level&&(!difficulty||difficultyOf(q)===difficulty));if(!pool.length&&difficulty)pool=calcQuestions().filter(q=>levelOf(q)===level);if(!pool.length)return alert('Aucune question disponible pour ce niveau.');pool=shuffle([...pool]);const picked=pool.slice(0,Math.min(count,pool.length));localStorage.setItem('ifsiabc_v7_mode',mode==='exam'?'exam':'train');window.IFSI_V77?.track?.('qcm_start',{resource_type:'qcm',resource_id:'calculs_level_'+level,course_id:COURSE_ID,metadata:{level,difficulty:difficulty||'all',count:picked.length,mode}});if(typeof begin==='function')begin(picked);else alert('Le moteur QCM n’est pas encore prêt.')}
function startProgressive(level){const stage=stageFor(level);startLevel(level,10,'train',stage==='mixed'?null:stage)}
function firstToWork(){for(const l of LEVELS)if(!mastery(l.id))return l.id;return 10}
function html(){const total=calcQuestions().length;const mastered=LEVELS.filter(l=>mastery(l.id)).length;return `<div class="card calc-mastery" id="calcMastery"><div class="row"><div><b>🧮 Parcours Maîtrise des calculs infirmiers</b><div class="small">10 niveaux • ${total} QCM disponibles • progression facile → intermédiaire → difficile → mixte.</div></div><span class="badge">V${VERSION}</span></div><div class="calc-roadmap"><b>${mastered}/10 niveaux maîtrisés</b><div class="small">Pour valider un niveau : réussir les étapes facile, intermédiaire et difficile avec ≥ 80 %, puis conserver ≥ 80 % au global.</div></div><button class="btn primary calc-master-btn" id="calcContinue" type="button">▶ Continuer mon parcours</button><div class="calc-levels">${LEVELS.map(l=>{const s=statsFor(l.id),pct=s.rate??0,done=mastery(l.id),stage=stageFor(l.id);return `<div class="calc-level ${done?'done':''}"><div class="top"><div style="display:flex;gap:9px"><span class="num">${l.id}</span><div><div class="name">${l.icon} ${l.title}</div><div class="meta">${s.total} QCM • ${s.seen} vus • ${s.rate===null?'aucun score':s.rate+' %'} • étape : ${stageLabel(stage)}</div></div></div><span class="calc-badge ${done?'ok':''}">${done?'✓ maîtrisé':'à travailler'}</span></div><div class="calc-bar"><span style="width:${pct}%"></span></div><div class="calc-actions"><button class="btn primary" data-calcprog="${l.id}" type="button">▶ Étape suivante</button><button class="btn outline" data-calc20="${l.id}" type="button">20 QCM mixtes</button></div></div>`}).join('')}</div></div>`}
function inject(){if(!isCalcPage())return false;const box=$('v74CourseDetail'),head=box?.querySelector('.v74-course-head');if(!box||!head)return false;css();$('calcMastery')?.remove();head.insertAdjacentHTML('afterend',html());$('calcContinue').onclick=()=>startProgressive(firstToWork());box.querySelectorAll('[data-calcprog]').forEach(b=>b.onclick=()=>startProgressive(Number(b.dataset.calcprog)));box.querySelectorAll('[data-calc20]').forEach(b=>b.onclick=()=>startLevel(Number(b.dataset.calc20),20,'train'));return true}
let timer=setInterval(()=>{if(inject())clearInterval(timer)},500);setTimeout(()=>clearInterval(timer),10000);
window.IFSI_CALCULS_MASTERY={version:VERSION,levels:LEVELS,startLevel,startProgressive,refresh:inject,levelOf,stageFor,mastery};
})();