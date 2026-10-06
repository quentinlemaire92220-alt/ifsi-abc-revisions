(()=>{
'use strict';
const FAV_KEY='ifsiabc_favorites_v1';
const RESUME_KEY='ifsiabc_resume_v1';

function readFavs(){try{return new Set(JSON.parse(localStorage.getItem(FAV_KEY)||'[]'))}catch{return new Set()}}
function writeFavs(set){localStorage.setItem(FAV_KEY,JSON.stringify([...set]))}
function getResume(){try{return JSON.parse(localStorage.getItem(RESUME_KEY)||'null')}catch{return null}}
function setResume(v){if(v)localStorage.setItem(RESUME_KEY,JSON.stringify(v));else localStorage.removeItem(RESUME_KEY)}

function addStyles(){
  const s=document.createElement('style');
  s.textContent=`
  .feature-actions{display:grid;gap:8px;margin-top:2px}
  .favQuizBtn{border:1px solid #d9cfef;background:#fff;color:#6941c6;border-radius:999px;padding:7px 10px;font-weight:800;cursor:pointer;white-space:nowrap}
  .favQuizBtn.on{background:#fff7d6;border-color:#f0c952;color:#7b5a00}
  .resume-card{border:1px solid #cfc2ee;background:linear-gradient(135deg,#fff,#f5f0ff)}
  .resume-title{font-weight:900;color:#4f319f}
  .review-note{font-size:12px;color:#6c6878;margin-top:-2px;line-height:1.35}
  .mastery-note{margin-top:10px;padding:9px 10px;border-radius:10px;background:#eef9ff;color:#245675;font-size:13px;font-weight:700}
  @media(max-width:520px){.favQuizBtn{font-size:12px;padding:6px 8px}}
  `;
  document.head.appendChild(s);
}

function ensureSingleFavoriteButton(){
  const quiz=document.getElementById('quiz');
  const topRow=quiz?.querySelector('.card > .row');
  if(!topRow)return null;
  const buttons=[...quiz.querySelectorAll('.favQuizBtn')];
  let b=buttons[0]||null;
  buttons.slice(1).forEach(x=>x.remove());
  if(!b){
    b=document.createElement('button');
    b.className='favQuizBtn';
    b.type='button';
    b.textContent='☆ Favori';
    topRow.appendChild(b);
  }
  b.id='favQBtn';
  b.onclick=toggleCurrentFavorite;
  return b;
}

function injectUI(){
  const home=document.getElementById('home');
  const stack=home?.querySelector('.card.stack');
  if(stack&&!document.getElementById('favStartBtn')){
    const errorBtn=[...stack.querySelectorAll('button')].find(b=>b.textContent.includes('Refaire mes erreurs'));
    const fav=document.createElement('button');
    fav.id='favStartBtn'; fav.className='btn secondary full'; fav.innerHTML='⭐ Réviser mes favoris <span id="favCount">(0)</span>';
    fav.onclick=startFavorites;
    if(errorBtn)errorBtn.insertAdjacentElement('afterend',fav); else stack.appendChild(fav);
    const note=document.createElement('div');
    note.className='review-note';
    note.textContent='Une erreur reste « à revoir » jusqu’à 2 bonnes réponses consécutives.';
    fav.insertAdjacentElement('afterend',note);
  }
  const stats=home?.querySelector('.grid');
  if(stats&&!document.getElementById('resumeCard')){
    const card=document.createElement('div');
    card.id='resumeCard'; card.className='card resume-card hidden';
    card.innerHTML='<div class="row"><div><div class="resume-title">▶ Série en cours</div><div id="resumeText" class="small"></div></div><button id="resumeBtn" class="btn primary">Reprendre</button></div>';
    card.querySelector('#resumeBtn').onclick=resumeSession;
    stats.insertAdjacentElement('afterend',card);
  }
  ensureSingleFavoriteButton();
}

function currentQuestion(){try{return session?.[i]||null}catch{return null}}
function cleanMetaText(v){return String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim()}
function updateQuizMeta(){
  const q=currentQuestion(),meta=document.getElementById('meta');if(!q||!meta)return;
  const course=String(q.course||'').trim(),theme=String(q.theme||'').trim();
  meta.textContent=!theme||cleanMetaText(theme)===cleanMetaText(course)||cleanMetaText(theme)==='general'?course:`${course} • ${theme}`;
}
function updateFavUI(){
  const favs=readFavs();
  const c=document.getElementById('favCount'); if(c)c.textContent=`(${favs.size})`;
  const b=document.getElementById('favStartBtn'); if(b)b.disabled=favs.size===0;
  const q=currentQuestion(),qb=document.getElementById('favQBtn');
  if(qb&&q){const on=favs.has(q.id);qb.classList.toggle('on',on);qb.textContent=on?'★ Favori':'☆ Favori'}
}
function toggleCurrentFavorite(){const q=currentQuestion();if(!q)return;const f=readFavs();f.has(q.id)?f.delete(q.id):f.add(q.id);writeFavs(f);updateFavUI()}
function startFavorites(){const f=readFavs();const a=Q.filter(q=>f.has(q.id));if(!a.length)return alert('Aucune question en favoris.');begin(a)}
window.startFavorites=startFavorites;

function saveResume(nextIndex){
  if(!session?.length)return;
  const idx=Math.max(0,Math.min(nextIndex,session.length));
  if(idx>=session.length){setResume(null);refreshResumeUI();return}
  setResume({ids:session.map(q=>q.id),index:idx,results:[...res],savedAt:Date.now()});
  refreshResumeUI();
}
function refreshResumeUI(){
  const c=document.getElementById('resumeCard'),t=document.getElementById('resumeText');
  if(!c||!t)return;
  const r=getResume();
  if(!r||!Array.isArray(r.ids)||!r.ids.length||r.index>=r.ids.length){c.classList.add('hidden');return}
  const available=new Set(Q.map(q=>q.id));
  const valid=r.ids.filter(id=>available.has(id));
  if(!valid.length){setResume(null);c.classList.add('hidden');return}
  c.classList.remove('hidden');
  t.textContent=`Question ${Math.min(r.index+1,r.ids.length)} / ${r.ids.length}`;
}
function resumeSession(){
  const r=getResume();if(!r)return;
  const byId=new Map(Q.map(q=>[q.id,q]));
  const rebuilt=r.ids.map(id=>byId.get(id)).filter(Boolean);
  if(!rebuilt.length){setResume(null);refreshResumeUI();return alert('Cette série n’est plus disponible.')}
  session=rebuilt;
  i=Math.min(r.index||0,session.length-1);
  res=Array.isArray(r.results)?r.results.slice(0,i):[];
  done=false;
  show('quiz');
  draw();
  saveResume(i);
}
window.resumeSession=resumeSession;

const originalBegin=begin;
begin=function(a){originalBegin(a);if(session?.length)saveResume(0);updateFavUI()};

const originalDraw=draw;
draw=function(){originalDraw();ensureSingleFavoriteButton();updateQuizMeta();updateFavUI()};

const originalNextQ=nextQ;
nextQ=function(){const last=i>=session.length-1;originalNextQ();if(last){setResume(null);refreshResumeUI()}else saveResume(i)};

validateQ=function(){
  if(done)return;
  const q=session[i];
  const sel=[...document.querySelectorAll('#choices input:checked')].map(x=>+x.value);
  if(!sel.length)return alert('Choisis au moins une réponse.');
  done=true;
  const ok=same(sel,q.answers);
  q.choices.forEach((_,j)=>{
    const e=$('c'+j);
    if(q.answers.includes(j))e.classList.add(sel.includes(j)?'good':'miss');
    else if(sel.includes(j))e.classList.add('bad');
    e.querySelector('input').disabled=true;
  });

  const x=st();
  x.errors=Array.isArray(x.errors)?x.errors:[];
  x.reviewStreaks=x.reviewStreaks||{};
  const wasReview=x.errors.includes(q.id)||Object.prototype.hasOwnProperty.call(x.reviewStreaks,q.id);
  let mastered=false,reviewMsg='';

  x.answered++;
  if(ok)x.correct++;
  if(ok&&wasReview){
    const streak=(x.reviewStreaks[q.id]||0)+1;
    if(streak>=2){
      x.errors=x.errors.filter(v=>v!==q.id);
      delete x.reviewStreaks[q.id];
      mastered=true;
      reviewMsg='✅ Notion maîtrisée : 2 bonnes réponses consécutives.';
    }else{
      x.reviewStreaks[q.id]=streak;
      if(!x.errors.includes(q.id))x.errors.push(q.id);
      reviewMsg='🧠 Encore 1 bonne réponse consécutive pour sortir cette question des erreurs.';
    }
  }else if(!ok){
    if(!x.errors.includes(q.id))x.errors.push(q.id);
    x.reviewStreaks[q.id]=0;
    reviewMsg='🧠 Cette question reste dans « Erreurs » jusqu’à 2 bonnes réponses consécutives.';
  }

  const k=(q.course||'')+' — '+q.theme;
  x.themes=x.themes||{};
  x.themes[k]??={answered:0,correct:0};
  x.themes[k].answered++;
  if(ok)x.themes[k].correct++;
  save(x);

  $('exp').innerHTML='<b>'+(ok?'✅ Bonne réponse':'❌ À revoir')+'</b><br>'+q.explanation+(reviewMsg?'<div class="mastery-note">'+reviewMsg+'</div>':'');
  $('exp').classList.remove('hidden');
  $('valid').classList.add('hidden');
  $('next').classList.remove('hidden');
  res.push(ok);
  fill();
  saveResume(i+1);
  updateFavUI();
};

const originalFill=fill;
fill=function(){originalFill();updateFavUI();refreshResumeUI()};

function ready(){
  injectUI();
  ensureSingleFavoriteButton();
  updateQuizMeta();
  updateFavUI();
  refreshResumeUI();
  const u=document.getElementById('update');
  if(u&&Q.length)u.textContent='Application prête • favoris, erreurs intelligentes et reprise de série.';
  return Q.length>0;
}
addStyles();injectUI();
let tries=0;const timer=setInterval(()=>{tries++;if(ready()||tries>80)clearInterval(timer)},125);
window.addEventListener('storage',()=>{updateFavUI();refreshResumeUI()});
})();