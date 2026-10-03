(()=>{
'use strict';
const MODE_KEY='ifsiabc_v7_mode';
const RESUME_KEY='ifsiabc_resume_v1';
const FAV_KEY='ifsiabc_favorites_v1';
let activeMode='train';
let examAnswers={};
let examStartedAt=0;

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const getMode=()=>localStorage.getItem(MODE_KEY)==='exam'?'exam':'train';
const setMode=m=>{localStorage.setItem(MODE_KEY,m);syncModeUI()};
const favs=()=>{try{return new Set(JSON.parse(localStorage.getItem(FAV_KEY)||'[]'))}catch{return new Set()}};
const resume=()=>{try{return JSON.parse(localStorage.getItem(RESUME_KEY)||'null')}catch{return null}};
const writeResume=v=>{if(v)localStorage.setItem(RESUME_KEY,JSON.stringify(v));else localStorage.removeItem(RESUME_KEY)};

function addStyles(){
  if(document.getElementById('v7css'))return;
  const s=document.createElement('style');s.id='v7css';s.textContent=`
  .v7-mode{display:grid;grid-template-columns:1fr 1fr;gap:8px;background:#f6f3fc;border:1px solid #e6e0ef;border-radius:16px;padding:6px}
  .v7-mode button{border:0;border-radius:12px;padding:10px 8px;background:transparent;color:#6c6878;font-weight:850;cursor:pointer}
  .v7-mode button.on{background:#fff;color:#6941c6;box-shadow:0 4px 12px #31235318}
  .v7-mode-note{font-size:12px;color:#6c6878;line-height:1.4;margin-top:-2px}
  .v7-local{border:1px solid #a7ddd8;background:#effaf8}
  .v7-local b{color:#087a75}
  .v7-exam-badge{display:inline-block;margin-top:8px;background:#fff3cd;color:#745600;border-radius:999px;padding:5px 9px;font-size:11px;font-weight:900}
  .v7-smart{background:linear-gradient(135deg,#0fa7a0,#168e9b)!important;color:#fff!important}
  .v7-progress-card{border:1px solid #e6e0ef;border-radius:16px;padding:13px;margin:10px 0;background:#fff}
  .v7-progress-card .top{display:flex;justify-content:space-between;align-items:flex-start;gap:10px}
  .v7-progress-card .rate{font-size:22px;font-weight:900;color:#6941c6;white-space:nowrap}
  .v7-mini{height:8px;background:#ede9f3;border-radius:99px;overflow:hidden;margin:10px 0 8px}.v7-mini>div{height:100%;background:linear-gradient(90deg,#0fa7a0,#6941c6)}
  .v7-metrics{display:flex;gap:10px;flex-wrap:wrap;font-size:12px;color:#6c6878}.v7-metrics span{background:#f7f5fb;border-radius:999px;padding:5px 8px}
  .v7-review{margin-top:16px;text-align:left}.v7-review details{border:1px solid #e6e0ef;border-radius:14px;padding:10px 12px;margin:9px 0;background:#fff}.v7-review summary{cursor:pointer;font-weight:850}.v7-review .ok{color:#187a3c}.v7-review .bad{color:#b42318}.v7-answer{margin-top:8px;font-size:13px;line-height:1.45}.v7-expl{margin-top:8px;padding:9px;border-radius:10px;background:#f6f3fc}
  @media(max-width:520px){.v7-mode button{font-size:12px}.v7-progress-card .top{align-items:center}}
  `;document.head.appendChild(s);
}

function injectUI(){
  const stack=document.querySelector('#home .card.stack');
  if(stack&&!document.getElementById('v7Mode')){
    const mode=document.createElement('div');mode.id='v7Mode';
    mode.innerHTML=`<div class="v7-mode"><button id="v7Train" type="button">📘 Entraînement</button><button id="v7Exam" type="button">🎓 Examen</button></div><div id="v7ModeNote" class="v7-mode-note"></div>`;
    stack.insertBefore(mode,stack.firstChild);
    document.getElementById('v7Train').onclick=()=>setMode('train');
    document.getElementById('v7Exam').onclick=()=>setMode('exam');
    const smart=document.createElement('button');smart.id='v7Smart';smart.className='btn full v7-smart';smart.textContent='🧠 Révision ciblée intelligente';smart.onclick=startSmart;
    const launch=[...stack.querySelectorAll('button')].find(b=>b.textContent.trim()==='Lancer');
    if(launch)launch.insertAdjacentElement('afterend',smart);else stack.appendChild(smart);
  }
  const home=document.getElementById('home');
  if(home&&!document.getElementById('v7LocalNotice')){
    const grids=home.querySelector('.grid');
    const card=document.createElement('div');card.id='v7LocalNotice';card.className='card v7-local';
    card.innerHTML='<b>📱 Progression enregistrée sur cet appareil</b><div class="small" style="margin-top:5px">Téléphone, tablette et PC ne se synchronisent pas entre eux. Les scores, erreurs et favoris restent propres à chaque appareil et navigateur.</div>';
    if(grids)grids.insertAdjacentElement('afterend',card);
  }
  const result=document.querySelector('#result .card');
  if(result&&!document.getElementById('v7ExamReview')){
    const d=document.createElement('div');d.id='v7ExamReview';d.className='v7-review hidden';
    const homeBtn=result.querySelector('button');if(homeBtn)result.insertBefore(d,homeBtn);else result.appendChild(d);
  }
  const update=document.getElementById('update');
  if(update){const b=update.parentElement?.querySelector('b');if(b)b.textContent='V7 local';}
  const hero=document.querySelector('#home .hero .muted');
  if(hero)hero.textContent='QCM disponibles hors ligne après la première visite. Ta progression reste uniquement sur l’appareil utilisé : aucune synchronisation automatique entre téléphone et PC.';
  syncModeUI();
  hookResumeButton();
}

function syncModeUI(){
  const m=getMode(),a=document.getElementById('v7Train'),b=document.getElementById('v7Exam'),note=document.getElementById('v7ModeNote');
  a?.classList.toggle('on',m==='train');b?.classList.toggle('on',m==='exam');
  if(note)note.textContent=m==='exam'?'Mode examen : aucune correction pendant la série. Le score et le corrigé complet apparaissent seulement à la fin.':'Mode entraînement : correction argumentée immédiatement après chaque question.';
}

function courseStats(course,x){
  let answered=0,correct=0;
  for(const [k,v] of Object.entries(x.themes||{}))if(k.startsWith(course+' — ')){answered+=Number(v.answered||0);correct+=Number(v.correct||0)}
  return {answered,correct,rate:answered?correct/answered:null};
}

function weightedPick(pool,count,x){
  const fs=favs(),errors=new Set(Array.isArray(x.errors)?x.errors:[]),qstats=x.v7QuestionStats||{};
  const courses=new Map();
  for(const q of pool){const c=q.course||q.theme;if(!courses.has(c))courses.set(c,courseStats(c,x))}
  const items=pool.map(q=>{
    const c=q.course||q.theme,cs=courses.get(c);let w=1;
    if(errors.has(q.id))w+=7;
    if(fs.has(q.id))w+=3;
    if(cs.rate===null)w+=2.5;else w+=(1-cs.rate)*4;
    const qs=qstats[q.id];if(qs){const qr=qs.answered?qs.correct/qs.answered:0;w+=(1-qr)*2}else w+=1;
    return {q,w:Math.max(.1,w)};
  });
  const out=[];while(items.length&&out.length<count){let total=items.reduce((a,b)=>a+b.w,0),r=Math.random()*total,idx=0;for(;idx<items.length;idx++){r-=items[idx].w;if(r<=0)break}const [it]=items.splice(Math.min(idx,items.length-1),1);out.push(it.q)}return out;
}

function startSmart(){
  if(!Array.isArray(Q)||!Q.length)return alert('Les questions ne sont pas encore chargées.');
  const x=st();const count=Math.min(n===999?50:n,Q.length);const picked=weightedPick(Q,count,x);
  if(!picked.length)return alert('Aucune question disponible.');
  begin(picked);
}
window.startSmart=startSmart;

function updateQuestionStats(q,ok){
  const x=st();x.v7QuestionStats=x.v7QuestionStats||{};const s=x.v7QuestionStats[q.id]||{answered:0,correct:0};s.answered++;if(ok)s.correct++;s.last=Date.now();x.v7QuestionStats[q.id]=s;save(x);
}

function recordExamResult(q,ok){
  const x=st();x.errors=Array.isArray(x.errors)?x.errors:[];x.reviewStreaks=x.reviewStreaks||{};x.themes=x.themes||{};x.v7QuestionStats=x.v7QuestionStats||{};
  const wasReview=x.errors.includes(q.id)||Object.prototype.hasOwnProperty.call(x.reviewStreaks,q.id);
  x.answered=(x.answered||0)+1;if(ok)x.correct=(x.correct||0)+1;
  if(ok&&wasReview){const streak=(x.reviewStreaks[q.id]||0)+1;if(streak>=2){x.errors=x.errors.filter(v=>v!==q.id);delete x.reviewStreaks[q.id]}else{x.reviewStreaks[q.id]=streak;if(!x.errors.includes(q.id))x.errors.push(q.id)}}
  else if(!ok){if(!x.errors.includes(q.id))x.errors.push(q.id);x.reviewStreaks[q.id]=0}
  const k=(q.course||'')+' — '+q.theme;x.themes[k]??={answered:0,correct:0};x.themes[k].answered++;if(ok)x.themes[k].correct++;
  const qs=x.v7QuestionStats[q.id]||{answered:0,correct:0};qs.answered++;if(ok)qs.correct++;qs.last=Date.now();x.v7QuestionStats[q.id]=qs;
  save(x);
}

function saveExamResume(){
  if(activeMode!=='exam'||!session?.length)return;
  writeResume({ids:session.map(q=>q.id),index:i,results:[],savedAt:Date.now(),mode:'exam',examAnswers,examStartedAt});
}

function finishExam(){
  const oks=session.map(q=>same(examAnswers[q.id]||[],q.answers));
  oks.forEach((ok,j)=>recordExamResult(session[j],ok));res=oks;writeResume(null);
  const c=oks.filter(Boolean).length;show('result');$('score').textContent=Math.round(c/session.length*100)+'%';$('detail').textContent=c+' / '+session.length+' bonnes réponses';
  renderExamReview();try{fill()}catch(e){}
}

function letters(arr){return arr.map(j=>'ABCDE'[j]).join(', ')||'Aucune'}
function renderExamReview(){
  const box=document.getElementById('v7ExamReview');if(!box)return;box.classList.remove('hidden');
  box.innerHTML='<h3 style="margin:12px 0 6px">Corrigé détaillé</h3><div class="small">Tes réponses ne sont corrigées qu’ici, une fois l’examen terminé.</div>'+
    session.map((q,j)=>{const user=examAnswers[q.id]||[],ok=same(user,q.answers);return `<details><summary class="${ok?'ok':'bad'}">${ok?'✅':'❌'} Q${q.number||j+1} — ${esc(q.course||q.theme||'')}</summary><div class="v7-answer"><b>Ta réponse :</b> ${esc(letters(user))}<br><b>Bonne réponse :</b> ${esc(letters(q.answers))}</div><div class="v7-expl">${esc(q.explanation||'')}</div></details>`}).join('');
}

function restoreExamSelection(){
  if(activeMode!=='exam')return;const q=session?.[i],sel=q?examAnswers[q.id]:null;if(!sel)return;document.querySelectorAll('#choices input').forEach(inp=>{inp.checked=sel.includes(+inp.value)});
}

const prevBegin=begin;
begin=function(a){
  activeMode=new URLSearchParams(location.search).get('testschema')==='1'?'train':getMode();examAnswers={};examStartedAt=Date.now();
  const review=document.getElementById('v7ExamReview');review?.classList.add('hidden');
  prevBegin(a);
  if(activeMode==='exam')saveExamResume();
};

const prevDraw=draw;
draw=function(){
  prevDraw();
  const badgeId='v7ExamBadge';document.getElementById(badgeId)?.remove();
  if(activeMode==='exam'){
    const expected=document.getElementById('expected');if(expected){const b=document.createElement('span');b.id=badgeId;b.className='v7-exam-badge';b.textContent='🎓 Mode examen • correction à la fin';expected.insertAdjacentElement('afterend',b)}
    const valid=document.getElementById('valid');if(valid){valid.textContent=i===session.length-1?'Terminer l’examen':'Enregistrer et continuer';valid.classList.remove('hidden')}
    document.getElementById('next')?.classList.add('hidden');document.getElementById('exp')?.classList.add('hidden');restoreExamSelection();
  }else{const valid=document.getElementById('valid');if(valid)valid.textContent='Valider'}
};

const prevValidate=validateQ;
validateQ=function(){
  if(activeMode!=='exam'){
    const q=session?.[i],before=res.length;prevValidate();if(q&&res.length>before)updateQuestionStats(q,!!res[res.length-1]);return;
  }
  const q=session[i],sel=[...document.querySelectorAll('#choices input:checked')].map(x=>+x.value);if(!sel.length)return alert('Choisis au moins une réponse.');
  examAnswers[q.id]=sel;done=true;
  if(i>=session.length-1){finishExam();return}
  i++;done=false;draw();saveExamResume();
};

function aggregateCourses(){
  const x=st(),fs=favs(),err=new Set(Array.isArray(x.errors)?x.errors:[]);const names=[...new Set(Q.map(q=>q.course||q.theme))].sort((a,b)=>a.localeCompare(b,'fr'));
  return names.map(course=>{const qs=Q.filter(q=>(q.course||q.theme)===course),cs=courseStats(course,x);return {course,total:qs.length,answered:cs.answered,correct:cs.correct,rate:cs.rate,errors:qs.filter(q=>err.has(q.id)).length,favorites:qs.filter(q=>fs.has(q.id)).length}});
}

showProgress=function(){
  show('progress');const list=document.getElementById('progressList');if(!list)return;
  const rows=aggregateCourses();
  list.innerHTML='<div class="v7-local" style="border-radius:14px;padding:11px;margin-bottom:12px"><b>📱 Données locales uniquement</b><div class="small" style="margin-top:4px">Cette progression correspond uniquement à cet appareil et à ce navigateur. Elle ne se synchronise pas avec ton téléphone, ton PC ou ta tablette.</div></div>'+
  rows.map(r=>{const pct=r.rate===null?0:Math.round(r.rate*100),label=r.rate===null?'—':pct+'%';return `<div class="v7-progress-card"><div class="top"><div><b>${esc(r.course)}</b><div class="small">${r.total} questions disponibles</div></div><div class="rate">${label}</div></div><div class="v7-mini"><div style="width:${pct}%"></div></div><div class="v7-metrics"><span>${r.answered} réponses</span><span>${r.errors} à revoir</span><span>${r.favorites} favoris</span></div></div>`}).join('')||'<div class="small">Aucune donnée pour le moment.</div>';
  document.getElementById('np')?.classList.add('on');
};

const prevResume=window.resumeSession;
function resumeV7(){
  const r=resume();
  if(!r||r.mode!=='exam'){if(typeof prevResume==='function')return prevResume();return}
  const byId=new Map(Q.map(q=>[q.id,q])),rebuilt=(r.ids||[]).map(id=>byId.get(id)).filter(Boolean);if(!rebuilt.length){writeResume(null);return alert('Cette série n’est plus disponible.')}
  activeMode='exam';setMode('exam');session=rebuilt;i=Math.min(r.index||0,session.length-1);res=[];done=false;examAnswers=r.examAnswers||{};examStartedAt=r.examStartedAt||Date.now();show('quiz');draw();saveExamResume();
}
window.resumeSession=resumeV7;
function hookResumeButton(){const b=document.getElementById('resumeBtn');if(b)b.onclick=resumeV7}

function ready(){injectUI();hookResumeButton();const u=document.getElementById('update');if(u&&Q.length)u.textContent='Application prête • V7 locale : examen, progression détaillée et révision ciblée.';return Q.length>0}
addStyles();injectUI();let tries=0;const t=setInterval(()=>{tries++;if(ready()||tries>100)clearInterval(t)},125);window.addEventListener('storage',()=>{syncModeUI();hookResumeButton()});
})();