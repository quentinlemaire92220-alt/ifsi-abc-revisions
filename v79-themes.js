(()=>{
'use strict';
const VERSION='7.9';
const MODE_KEY='ifsiabc_v7_mode';
let currentCourse='';
let selectedThemes=new Set();
let selectedDifficulty='all';
let selectedCount=10;
let selectedMode=localStorage.getItem(MODE_KEY)==='exam'?'exam':'train';
let rendering=false;

const $79=id=>document.getElementById(id);
const esc79=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm79=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
const qCourse79=q=>q?.course||q?.theme||'';
const themeOf=q=>{const t=String(q?.theme||'').trim(),c=String(q?.course||'').trim();return t&&(!c||norm79(t)!==norm79(c))?t:'Général'};

function difficultyOf(q){
  if(['easy','medium','hard'].includes(q?.difficulty))return q.difficulty;
  const t=((q?.question||'')+' '+(q?.theme||'')+' '+(q?.course||'')).toLowerCase();let score=0;
  if((q?.answers||[]).length>=3)score+=2;else if((q?.answers||[]).length===2)score+=1;
  if(/sch[ée]ma|figure|caryotype|pcr|physiopath|m[ée]canisme|r[ée]gulation|association|associer|interpr|cascade|cons[ée]quence|diagnostic|g[ée]n[ée]tiq|gaz du sang|hom[ée]ostasie/.test(t))score+=2;
  if(/sauf|fausse|fausses|incorrect|ne .* pas|exception/.test(t))score+=1;
  if((q?.choices||[]).some(c=>String(c).length>95))score+=1;
  if(/d[ée]finition|correspond|d[ée]signe|quel est|quelle est/.test(t))score-=1;
  return score>=4?'hard':score>=2?'medium':'easy';
}
function diffLabel(d){return d==='easy'?'🟢 Facile':d==='medium'?'🟠 Moyen':'🔴 Difficile'}
function questionsFor(course){return (Array.isArray(Q)?Q:[]).filter(q=>qCourse79(q)===course)}
function appState(){try{return typeof st==='function'?st():{}}catch{return {}}}
function themeStats(course,theme){
  const qs=questionsFor(course).filter(q=>themeOf(q)===theme),x=appState(),qstats=x.v7QuestionStats||{},errors=new Set(x.errors||[]);let answered=0,correct=0,seen=0;
  for(const q of qs){const s=qstats[q.id];if(s?.answered){seen++;answered+=s.answered||0;correct+=s.correct||0}}
  return {total:qs.length,seen,answered,correct,rate:answered?Math.round(correct/answered*100):null,errors:qs.filter(q=>errors.has(q.id)).length};
}
function themesFor(course){const m=new Map();for(const q of questionsFor(course)){const t=themeOf(q);m.set(t,(m.get(t)||0)+1)}return [...m.entries()].sort((a,b)=>a[0].localeCompare(b[0],'fr'))}
function activePool(course){
  let pool=questionsFor(course);
  if(selectedThemes.size)pool=pool.filter(q=>selectedThemes.has(themeOf(q)));
  if(selectedDifficulty!=='all')pool=pool.filter(q=>difficultyOf(q)===selectedDifficulty);
  return pool;
}
function courseFromDOM(){return document.querySelector('#v74CourseDetail .v74-course-head h2')?.textContent?.trim()||''}
function courseIdFor(course,qs){return qs.find(q=>q.courseId)?.courseId||window.IFSI_V741?.courseIdForLabel?.(course)||null}

function addStyles79(){
  if($79('v79css'))return;const s=document.createElement('style');s.id='v79css';s.textContent=`
  .v79-builder{border:1px solid #cfc2ee;background:linear-gradient(145deg,#fff,#f8f5ff)}.v79-block{margin-top:14px}.v79-label{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:8px}.v79-chips{display:flex;gap:7px;flex-wrap:wrap}.v79-chip{border:1px solid #ded6eb;background:#fff;color:#514861;border-radius:999px;padding:8px 11px;font-weight:800;font-size:12px;cursor:pointer}.v79-chip.on{background:#6941c6;color:#fff;border-color:#6941c6}.v79-chip:disabled{opacity:.42;cursor:not-allowed}.v79-chip .n{opacity:.72;margin-left:4px}.v79-preview{margin-top:14px;border-radius:14px;padding:11px 12px;background:#eef9ff;border:1px solid #cae7f5}.v79-launch{margin-top:10px;width:100%}.v79-theme-grid{display:grid;gap:9px;margin-top:10px}.v79-theme-card{border:1px solid var(--line);border-radius:15px;padding:12px;background:var(--card)}.v79-theme-card .top{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.v79-theme-card .pct{font-weight:900;color:#6941c6}.v79-theme-bar{height:7px;background:#ede9f3;border-radius:99px;overflow:hidden;margin:9px 0}.v79-theme-bar span{display:block;height:100%;background:linear-gradient(90deg,#0fa7a0,#6941c6)}.v79-theme-meta{display:flex;gap:6px;flex-wrap:wrap}.v79-mini{font-size:11px;border-radius:999px;padding:4px 7px;background:#f3f0f8;color:#5f5670}.v79-theme-card .actions{display:flex;gap:7px;margin-top:10px;flex-wrap:wrap}.v79-home-shortcut{border:1px solid #d9cef0;border-radius:15px;padding:12px;background:#faf7ff;margin-bottom:10px}.v79-home-shortcut .btn{width:100%;margin-top:8px}
  body.v72-dark .v79-builder,body.v72-dark .v79-theme-card,body.v72-dark .v79-chip,body.v72-dark .v79-home-shortcut{background:#211e2a;color:#f4f0fb;border-color:#3b3548}body.v72-dark .v79-chip.on{background:#6941c6}body.v72-dark .v79-preview{background:#23313f;border-color:#354b58}body.v72-dark .v79-mini{background:#2d2938;color:#d4ccdf}
  @media(min-width:720px){.v79-theme-grid{grid-template-columns:repeat(2,1fr)}}
  `;document.head.appendChild(s);
}

function difficultyCounts(course){const base=selectedThemes.size?questionsFor(course).filter(q=>selectedThemes.has(themeOf(q))):questionsFor(course);return {all:base.length,easy:base.filter(q=>difficultyOf(q)==='easy').length,medium:base.filter(q=>difficultyOf(q)==='medium').length,hard:base.filter(q=>difficultyOf(q)==='hard').length}}
function countOptions(available){const vals=[10,20,30,50];return vals.map(v=>`<button class="v79-chip ${selectedCount===v?'on':''}" data-v79count="${v}" type="button" ${available<v?'disabled':''}>${v}</button>`).join('')+`<button class="v79-chip ${selectedCount===999?'on':''}" data-v79count="999" type="button" ${!available?'disabled':''}>Toutes</button>`}

function builderHTML(course){
  const qs=questionsFor(course),themes=themesFor(course),dc=difficultyCounts(course),available=activePool(course).length;
  return `<div class="card v79-builder" id="v79Builder"><div class="row"><div><b>🎛️ Série personnalisée</b><div class="small">Cours → thème(s) → difficulté → nombre de questions</div></div><span class="badge">V${VERSION}</span></div>
  <div class="v79-block"><div class="v79-label"><b>1. Thème(s)</b><span class="small">${themes.length} disponibles</span></div><div class="v79-chips"><button class="v79-chip ${selectedThemes.size?'':'on'}" data-v79theme="__all" type="button">Tous <span class="n">${qs.length}</span></button>${themes.map(([t,n])=>`<button class="v79-chip ${selectedThemes.has(t)?'on':''}" data-v79theme="${esc79(t)}" type="button">${esc79(t)} <span class="n">${n}</span></button>`).join('')}</div></div>
  <div class="v79-block"><div class="v79-label"><b>2. Difficulté</b><span class="small">Les nouvelles banques utiliseront les niveaux de la charte v1.31</span></div><div class="v79-chips"><button class="v79-chip ${selectedDifficulty==='all'?'on':''}" data-v79diff="all" type="button">Toutes <span class="n">${dc.all}</span></button><button class="v79-chip ${selectedDifficulty==='easy'?'on':''}" data-v79diff="easy" type="button" ${!dc.easy?'disabled':''}>🟢 Facile <span class="n">${dc.easy}</span></button><button class="v79-chip ${selectedDifficulty==='medium'?'on':''}" data-v79diff="medium" type="button" ${!dc.medium?'disabled':''}>🟠 Moyen <span class="n">${dc.medium}</span></button><button class="v79-chip ${selectedDifficulty==='hard'?'on':''}" data-v79diff="hard" type="button" ${!dc.hard?'disabled':''}>🔴 Difficile <span class="n">${dc.hard}</span></button></div></div>
  <div class="v79-block"><div class="v79-label"><b>3. Nombre de questions</b><span class="small">${available} disponibles avec ces filtres</span></div><div class="v79-chips">${countOptions(available)}</div></div>
  <div class="v79-block"><div class="v79-label"><b>4. Mode</b></div><div class="v79-chips"><button class="v79-chip ${selectedMode==='train'?'on':''}" data-v79mode="train" type="button">📘 Entraînement</button><button class="v79-chip ${selectedMode==='exam'?'on':''}" data-v79mode="exam" type="button">🎓 Examen</button></div></div>
  <div class="v79-preview"><b id="v79Preview">${available?`${selectedCount===999?available:Math.min(selectedCount,available)} question${Math.min(selectedCount===999?available:selectedCount,available)>1?'s':''} seront tirées parmi ${available}.`:'Aucune question disponible avec ces filtres.'}</b><div class="small" style="margin-top:3px">${selectedDifficulty==='all'?'Toutes difficultés':diffLabel(selectedDifficulty)} • ${selectedThemes.size?[...selectedThemes].map(esc79).join(' + '):'Tous les thèmes'} • ${selectedMode==='exam'?'Mode examen':'Mode entraînement'}</div></div><button id="v79Launch" class="btn primary v79-launch" type="button" ${available?'':'disabled'}>▶ Lancer la série</button></div>`;
}
function themesHTML(course){
  const themes=themesFor(course);return `<div class="card" id="v79ThemesCard"><div class="row"><div><b>🧩 Réviser par thème</b><div class="small">Progression locale et accès rapide à une série de 10 questions.</div></div><span class="badge">${themes.length}</span></div><div class="v79-theme-grid">${themes.map(([t])=>{const s=themeStats(course,t),pct=s.rate??0;return `<div class="v79-theme-card"><div class="top"><div><b>${esc79(t)}</b><div class="small">${s.total} question${s.total>1?'s':''}</div></div><span class="pct">${s.rate===null?'—':s.rate+'%'}</span></div><div class="v79-theme-bar"><span style="width:${pct}%"></span></div><div class="v79-theme-meta"><span class="v79-mini">${s.seen}/${s.total} vues</span><span class="v79-mini">${s.errors} erreur${s.errors>1?'s':''}</span></div><div class="actions"><button class="btn outline" type="button" data-v79choose="${esc79(t)}">Configurer</button><button class="btn primary" type="button" data-v79quick="${esc79(t)}">▶ 10 QCM</button></div></div>`}).join('')}</div></div>`;
}

function attachHandlers(course){
  const box=$79('v74CourseDetail');if(!box)return;
  box.querySelectorAll('[data-v79theme]').forEach(b=>b.onclick=()=>{const t=b.dataset.v79theme;if(t==='__all')selectedThemes.clear();else{selectedThemes.has(t)?selectedThemes.delete(t):selectedThemes.add(t)}refreshCourse(course)});
  box.querySelectorAll('[data-v79diff]').forEach(b=>b.onclick=()=>{selectedDifficulty=b.dataset.v79diff;refreshCourse(course)});
  box.querySelectorAll('[data-v79count]').forEach(b=>b.onclick=()=>{selectedCount=Number(b.dataset.v79count);refreshCourse(course)});
  box.querySelectorAll('[data-v79mode]').forEach(b=>b.onclick=()=>{selectedMode=b.dataset.v79mode;refreshCourse(course)});
  box.querySelectorAll('[data-v79choose]').forEach(b=>b.onclick=()=>{selectedThemes=new Set([b.dataset.v79choose]);selectedDifficulty='all';refreshCourse(course);setTimeout(()=>$79('v79Builder')?.scrollIntoView({behavior:'smooth',block:'start'}),30)});
  box.querySelectorAll('[data-v79quick]').forEach(b=>b.onclick=()=>startCustom(course,{themes:[b.dataset.v79quick],difficulty:'all',count:10,mode:'train',source:'theme_quick'}));
  if($79('v79Launch'))$79('v79Launch').onclick=()=>startCustom(course,{themes:[...selectedThemes],difficulty:selectedDifficulty,count:selectedCount,mode:selectedMode,source:'custom_builder'});
}
function refreshCourse(course){
  if(rendering)return;rendering=true;try{const box=$79('v74CourseDetail'),head=box?.querySelector('.v74-course-head');if(!box||!head)return;box.querySelector('#v79Builder')?.remove();box.querySelector('#v79ThemesCard')?.remove();head.insertAdjacentHTML('afterend',builderHTML(course)+themesHTML(course));attachHandlers(course)}finally{rendering=false}}

function startCustom(course,opts){
  let pool=questionsFor(course);const themes=new Set(opts.themes||[]);if(themes.size)pool=pool.filter(q=>themes.has(themeOf(q)));if(opts.difficulty&&opts.difficulty!=='all')pool=pool.filter(q=>difficultyOf(q)===opts.difficulty);
  if(!pool.length)return alert('Aucune question disponible avec ces filtres.');
  const count=opts.count===999?pool.length:Math.min(Number(opts.count)||10,pool.length);const picked=(typeof shuffle==='function'?shuffle([...pool]):[...pool].sort(()=>Math.random()-.5)).slice(0,count);
  localStorage.setItem(MODE_KEY,opts.mode==='exam'?'exam':'train');selectedMode=opts.mode==='exam'?'exam':'train';
  const cid=courseIdFor(course,pool);window.IFSI_V77?.track?.('qcm_start',{resource_type:'qcm',resource_id:'v79_'+(opts.source||'custom'),course_id:cid,metadata:{themes:[...themes],difficulty:opts.difficulty||'all',count,mode:selectedMode}});
  if(typeof begin==='function')begin(picked);else alert('Le moteur QCM n’est pas encore prêt.');
}

function clearCourseCustomizer(){
  const box=$79('v74CourseDetail');if(!box)return false;
  box.querySelector('#v79Builder')?.remove();
  box.querySelector('#v79ThemesCard')?.remove();
  return true;
}
function injectIntoCourse(){return clearCourseCustomizer()}
function injectHomeShortcut(){
  $79('v79HomeShortcut')?.remove();
  return true;
}
function watchCourse(){const root=$79('v74CourseDetail');if(!root)return false;new MutationObserver(()=>{if(!rendering)setTimeout(injectIntoCourse,0)}).observe(root,{childList:true,subtree:false});return true}
function init(){addStyles79();injectHomeShortcut();injectIntoCourse();return !!window.IFSI_V74&&!!window.IFSI_V76&&!!window.IFSI_V77&&watchCourse()}
let tries=0,watching=false;const timer=setInterval(()=>{tries++;addStyles79();injectHomeShortcut();injectIntoCourse();if(!watching&&$79('v74CourseDetail'))watching=watchCourse();if(window.IFSI_V74&&window.IFSI_V76&&window.IFSI_V77&&watching){clearInterval(timer)}else if(tries>200)clearInterval(timer)},100);
window.addEventListener('storage',()=>{if(currentCourse)refreshCourse(currentCourse)});
window.IFSI_V79={version:VERSION,difficultyOf,themeOf,themesFor,startCustom,refresh:()=>{injectHomeShortcut();injectIntoCourse()}};
})();
