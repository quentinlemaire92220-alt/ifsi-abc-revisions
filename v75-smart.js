(()=>{
'use strict';
const VERSION='7.5';
const REVIEW_KEY='ifsiabc_v75_review_v1';
const DAY=86400000;
const SEQ={
  guess:[1,1,3,7,14],
  hesitant:[1,3,7,14,30],
  sure:[3,7,14,30,60]
};
let sessionConfidence={};
let sessionStartedAtV75=0;
let examRecorded=false;
const $75=id=>document.getElementById(id);
const readJSON=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch{return d}};
const writeJSON=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const mode=()=>localStorage.getItem('ifsiabc_v7_mode')==='exam'?'exam':'train';
const currentQ=()=>{try{return session?.[i]||null}catch{return null}};
const shuffle=a=>[...a].sort(()=>Math.random()-.5);
const isToday=ts=>{if(!ts)return false;const a=new Date(ts),b=new Date();return a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate()};

function addStyles(){
  if($75('v75css'))return;
  const s=document.createElement('style');s.id='v75css';s.textContent=`
  .v75-today{border:1px solid #b9e5df;background:linear-gradient(135deg,#f0fbf9,#faf8ff)}
  .v75-today h3{margin:0 0 5px}.v75-today-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin:11px 0}
  .v75-mini{border:1px solid #dceeea;background:#fff;border-radius:12px;padding:9px;text-align:center}.v75-mini b{display:block;font-size:19px;color:#087a75}.v75-mini span{font-size:10px;color:#6c6878}
  .v75-confidence{border:1px solid #ded5ef;border-radius:14px;padding:10px 11px;margin-top:10px;background:#faf8ff}
  .v75-confidence-title{font-size:12px;font-weight:900;color:#5e4b8a;margin-bottom:7px}.v75-confidence-row{display:grid;grid-template-columns:repeat(3,1fr);gap:7px}
  .v75-conf{border:1px solid #d9cfef;background:#fff;border-radius:11px;padding:9px 6px;font-weight:800;color:#5f5670;cursor:pointer}.v75-conf.on{background:#eee8fb;border-color:#9b82d5;color:#4f319f;box-shadow:0 0 0 2px #eee8fb inset}.v75-conf:disabled{cursor:not-allowed;opacity:.68}
  .v75-next{margin-top:10px;padding:9px 10px;border-radius:10px;background:#eef9ff;color:#245675;font-size:12px;font-weight:800}
  body.v72-dark .v75-today,body.v72-dark .v75-confidence,body.v72-dark .v75-mini{background:#211e2a;color:#f4f0fb;border-color:#3b3548}body.v72-dark .v75-conf{background:#2b2638;color:#ddd4ea;border-color:#4a405c}body.v72-dark .v75-conf.on{background:#3a3150;color:#eee8ff}
  @media(max-width:520px){.v75-today-grid{grid-template-columns:repeat(2,1fr)}.v75-confidence-row{grid-template-columns:1fr}.v75-conf{padding:8px}}
  `;document.head.appendChild(s);
}

function reviewState(){return readJSON(REVIEW_KEY,{})}
function saveReviewState(v){writeJSON(REVIEW_KEY,v)}
function confidenceForCurrent(){const q=currentQ();return q?(sessionConfidence[q.id]||'hesitant'):'hesitant'}
function setConfidence(v){
  if($75('v75Confidence')?.dataset.frozen==='1')return;
  if(!['guess','hesitant','sure'].includes(v))return;
  const q=currentQ();if(!q)return;sessionConfidence[q.id]=v;
  document.querySelectorAll('#v75Confidence .v75-conf').forEach(b=>b.classList.toggle('on',b.dataset.conf===v));
}

function injectConfidence(){
  const choices=$75('choices');if(!choices)return;
  $75('v75Confidence')?.remove();
  const q=currentQ();if(!q)return;
  if(!sessionConfidence[q.id])sessionConfidence[q.id]='hesitant';
  const box=document.createElement('div');box.id='v75Confidence';box.className='v75-confidence';
  box.innerHTML='<div class="v75-confidence-title">🧠 Ton niveau de confiance avant la correction</div><div class="v75-confidence-row"><button type="button" class="v75-conf" data-conf="guess">🎲 Au hasard</button><button type="button" class="v75-conf" data-conf="hesitant">🤔 Hésitant</button><button type="button" class="v75-conf" data-conf="sure">✅ Sûr de moi</button></div>';
  choices.insertAdjacentElement('afterend',box);
  box.querySelectorAll('.v75-conf').forEach(b=>b.onclick=()=>setConfidence(b.dataset.conf));
  setConfidence(sessionConfidence[q.id]);
}
function freezeConfidence(){
  const box=$75('v75Confidence');if(!box)return;
  box.dataset.frozen='1';
  box.querySelectorAll('.v75-conf').forEach(b=>{b.disabled=true;b.setAttribute('aria-disabled','true')});
}

function recordReview(q,ok,confidence){
  if(!q?.id)return null;
  const all=reviewState(),prev=all[q.id]||{},conf=['guess','hesitant','sure'].includes(confidence)?confidence:'hesitant';
  let streak=ok?(Number(prev.streak||0)+1):0;
  let days=1;
  if(ok){const seq=SEQ[conf];days=seq[Math.min(Math.max(streak-1,0),seq.length-1)]}
  all[q.id]={
    due:Date.now()+days*DAY,
    intervalDays:days,
    streak,
    last:Date.now(),
    lastCorrect:!!ok,
    confidence:conf
  };
  saveReviewState(all);
  return all[q.id];
}
function dueLabel(r){
  if(!r)return '';
  if(r.intervalDays===1)return 'Prochaine révision : demain';
  return `Prochaine révision : dans ${r.intervalDays} jours`;
}
function showNextReview(r){
  const exp=$75('exp');if(!exp||!r)return;
  exp.querySelector('#v75ReviewNote')?.remove();
  const d=document.createElement('div');d.id='v75ReviewNote';d.className='v75-next';d.textContent='📅 '+dueLabel(r);exp.appendChild(d);
}

function classifyToday(){
  const now=Date.now(),x=typeof st==='function'?st():{},review=reviewState(),qstats=x.v7QuestionStats||{},errors=new Set(x.errors||[]);
  const usable=(Array.isArray(Q)?Q:[]).filter(q=>{const r=review[q.id],s=qstats[q.id];return !isToday(r?.last||s?.last)});
  const due=usable.filter(q=>review[q.id]?.due&&review[q.id].due<=now);
  const err=usable.filter(q=>errors.has(q.id));
  const weak=usable.filter(q=>{const s=qstats[q.id];return s&&s.answered>=2&&(s.correct/Math.max(1,s.answered))<.7});
  const unseen=usable.filter(q=>!qstats[q.id]||!qstats[q.id].answered);
  return {due,err,weak,unseen,usable,review,qstats,errors};
}
function uniqueAdd(out,seen,list,max){for(const q of shuffle(list)){if(out.length>=15||max<=0)break;if(seen.has(q.id))continue;seen.add(q.id);out.push(q);max--}}
function scoreQuestion(q,c){
  let score=Math.random()*1.5;
  if(c.review[q.id]?.due&&c.review[q.id].due<=Date.now())score+=10;
  if(c.errors.has(q.id))score+=8;
  const s=c.qstats[q.id];if(s&&s.answered>=2&&(s.correct/Math.max(1,s.answered))<.7)score+=5;
  if(!s||!s.answered)score+=3;
  return score;
}
function buildTodaySession(){
  const c=classifyToday(),out=[],seen=new Set();
  uniqueAdd(out,seen,c.due,5);
  uniqueAdd(out,seen,c.err,4);
  uniqueAdd(out,seen,c.weak,3);
  uniqueAdd(out,seen,c.unseen,3);
  if(out.length<15){
    const rest=c.usable.filter(q=>!seen.has(q.id)).map(q=>({q,score:scoreQuestion(q,c)})).sort((a,b)=>b.score-a.score);
    for(const it of rest){if(out.length>=15)break;out.push(it.q);seen.add(it.q.id)}
  }
  return {questions:out,counts:{due:c.due.length,errors:c.err.length,weak:c.weak.length,unseen:c.unseen.length}};
}
function startToday(){
  if(!Array.isArray(Q)||!Q.length)return alert('Les questions ne sont pas encore chargées.');
  const pack=buildTodaySession();
  if(!pack.questions.length)return alert('Tout est à jour pour aujourd’hui 🎉');
  begin(pack.questions);
}
window.startTodayV75=startToday;

function injectTodayCard(){
  const home=$75('home');if(!home||$75('v75TodayCard'))return;
  const card=document.createElement('div');card.id='v75TodayCard';card.className='card v75-today';
  card.innerHTML='<div class="row"><div><h3>🎯 À faire aujourd’hui</h3><div class="small">15 questions max, choisies parmi tes révisions dues, erreurs, points faibles et questions jamais vues.</div></div><span class="badge">V7.5</span></div><div class="v75-today-grid"><div class="v75-mini"><b id="v75Due">0</b><span>dues</span></div><div class="v75-mini"><b id="v75Err">0</b><span>erreurs</span></div><div class="v75-mini"><b id="v75Weak">0</b><span>fragiles</span></div><div class="v75-mini"><b id="v75Unseen">0</b><span>jamais vues</span></div></div><button id="v75TodayBtn" class="btn primary full" type="button">▶ Lancer ma session du jour</button><div id="v75TodayNote" class="small" style="margin-top:8px"></div>';
  card.querySelector('#v75TodayBtn').onclick=startToday;
  const dash=$75('v74Dashboard');
  if(dash)dash.insertAdjacentElement('afterend',card);else{const grid=home.querySelector('.grid');if(grid)grid.insertAdjacentElement('beforebegin',card);else home.prepend(card)}
}
function refreshTodayCard(){
  injectTodayCard();const p=buildTodaySession();
  if($75('v75Due'))$75('v75Due').textContent=p.counts.due;
  if($75('v75Err'))$75('v75Err').textContent=p.counts.errors;
  if($75('v75Weak'))$75('v75Weak').textContent=p.counts.weak;
  if($75('v75Unseen'))$75('v75Unseen').textContent=p.counts.unseen;
  const b=$75('v75TodayBtn'),n=$75('v75TodayNote');
  if(b)b.disabled=!p.questions.length;
  if(n)n.textContent=p.questions.length?`${p.questions.length} question${p.questions.length>1?'s':''} proposée${p.questions.length>1?'s':''} aujourd’hui.`:'Tout est à jour pour aujourd’hui 🎉';
}

function recordExamAtEnd(){
  if(examRecorded||mode()!=='exam'||!Array.isArray(session)||!session.length||!Array.isArray(res)||res.length!==session.length)return;
  examRecorded=true;
  session.forEach((q,j)=>recordReview(q,!!res[j],sessionConfidence[q.id]||'hesitant'));
  refreshTodayCard();
}
function observeResult(){
  const r=$75('result');if(!r||r.dataset.v75obs)return;r.dataset.v75obs='1';
  new MutationObserver(()=>{if(!r.classList.contains('hidden'))setTimeout(recordExamAtEnd,40)}).observe(r,{attributes:true,attributeFilter:['class']});
}

function patchRuntime(){
  if(window.__IFSI_V75_PATCHED)return;window.__IFSI_V75_PATCHED=true;
  const prevBegin=begin;
  begin=function(a){sessionConfidence={};sessionStartedAtV75=Date.now();examRecorded=false;prevBegin(a)};
  const prevDraw=draw;
  draw=function(){prevDraw();injectConfidence()};
  const prevValidate=validateQ;
  validateQ=function(){
    const q=currentQ(),before=Array.isArray(res)?res.length:0,wasExam=mode()==='exam',conf=confidenceForCurrent();
    const out=prevValidate();
    if(!wasExam&&q&&Array.isArray(res)&&res.length>before){freezeConfidence();const r=recordReview(q,!!res[res.length-1],conf);showNextReview(r);refreshTodayCard()}
    return out;
  };
}

function enhanceChangelog(){
  const card=$75('v742Changelog');if(!card)return false;
  if(card.querySelector('#v81Change')||card.querySelector('#v75Change'))return true;
  const badge=card.querySelector('.badge');if(badge)badge.textContent='V7.5';
  const content=card.querySelector('details .small');if(content){
    const marker='<span id="v75Change"><b>V7.5 — Révision intelligente</b><br>• Niveau de confiance : sûr, hésitant ou au hasard.<br>• Répétition espacée avec prochaine révision calculée automatiquement.<br>• Session « À faire aujourd’hui » mêlant révisions dues, erreurs, points faibles et questions jamais vues.<br><br></span>';
    content.insertAdjacentHTML('afterbegin',marker);
  }
  return true;
}

function init(){
  addStyles();injectTodayCard();patchRuntime();observeResult();refreshTodayCard();enhanceChangelog();
  return Array.isArray(Q)&&Q.length>0;
}
let tries=0;const timer=setInterval(()=>{tries++;if(init()||tries>160)clearInterval(timer)},100);
window.addEventListener('storage',()=>refreshTodayCard());
window.IFSI_V75={version:VERSION,startToday,buildTodaySession,getReviewState:()=>reviewState(),recordReview};
})();