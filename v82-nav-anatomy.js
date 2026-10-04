(()=>{'use strict';
const V='8.9',SECTION='anatomy82',MK='ifsiabc_v7_mode';
const $=id=>document.getElementById(id);
const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const R=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch{return d}};
const ST=()=>{try{return typeof st==='function'?st():{}}catch{return {}}};
const SH=a=>{a=[...a];for(let i=a.length-1;i;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
const FOUNDATION=[
  {id:'niveaux_organisation',icon:'🧍',subtitle:'Organisation du corps humain'},
  {id:'cellules_tissus',icon:'🔬',subtitle:'Cellules, tissus et organisation'},
  {id:'homeostasie',icon:'⚖️',subtitle:'Équilibres et régulations'}
];
const SYSTEMS=[
  {id:'systeme_respiratoire',icon:'🫁',subtitle:'Respiration et échanges gazeux'},
  {id:'systeme_urinaire',icon:'💧',subtitle:'Fonction rénale et appareil urinaire'},
  {id:'systeme_endocrinien',icon:'🧪',subtitle:'Hormones et régulation'},
  {id:'systeme_nerveux',icon:'🧠',subtitle:'Système nerveux'},
  {id:'systeme_immunitaire',icon:'🛡️',subtitle:'Défenses de l’organisme'},
  {id:'systeme_digestif',icon:'🍽️',subtitle:'Anatomie, glandes annexes et physiologie digestive'},
  {id:'appareil_locomoteur',icon:'🦴',subtitle:'Ostéologie, articulations, rachis et traumatologie'}
];
const FUTURE=[
  ['❤️','Système cardiovasculaire'],['🧬','Reproduction'],['👁️','Organes des sens'],['🧴','Peau & téguments']
];
const ALL=[...FOUNDATION,...SYSTEMS];

function css(){
  if($('v82css'))return;
  const s=document.createElement('style');s.id='v82css';s.textContent=`
  .v82-hidden{display:none!important}
  .v82-primary{border:1px solid #d9cfee;background:linear-gradient(145deg,#fff,#f7f3ff);border-radius:22px;padding:16px;box-shadow:0 10px 28px rgba(55,39,94,.08)}
  .v82-primary-head{display:flex;align-items:center;justify-content:space-between;gap:12px}.v82-primary-head h3{margin:0}
  .v82-mainbtn{width:100%;margin-top:12px;border:0;border-radius:18px;padding:16px 18px;background:linear-gradient(135deg,#7046d9,#5d35c5);color:#fff;text-align:left;cursor:pointer;box-shadow:0 9px 22px rgba(94,57,190,.24)}
  .v82-mainbtn b{display:block;font-size:18px}.v82-mainbtn span{display:block;font-size:12px;opacity:.9;margin-top:3px}
  .v82-navgrid{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-top:10px}
  .v82-nav{border:1px solid #e2daf0;background:#fff;border-radius:17px;padding:13px;text-align:left;cursor:pointer;color:#282331;min-height:106px}
  .v82-nav .ico{font-size:27px;display:block;margin-bottom:8px}.v82-nav b{display:block}.v82-nav small{display:block;color:#736c80;margin-top:4px;line-height:1.3}
  .v82-nav.anat{background:linear-gradient(150deg,#fff,#eefaf7)}.v82-nav.center{background:linear-gradient(150deg,#fff,#f4efff)}
  .v82-pagehead{border:1px solid #d8cfec;background:linear-gradient(135deg,#f7f3ff,#eefaf8);border-radius:23px;padding:17px}
  .v82-pagehead h2{margin:9px 0 4px}.v82-kpis{display:flex;gap:7px;flex-wrap:wrap;margin-top:9px}
  .v82-kpi{border-radius:999px;background:#fff;border:1px solid #ddd5eb;padding:5px 9px;font-size:11px;font-weight:800}
  .v82-section-title{display:flex;align-items:end;justify-content:space-between;gap:10px;margin-bottom:9px}.v82-section-title h3{margin:0}
  .v82-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:9px}.v82-card{border:1px solid var(--line);border-radius:18px;padding:13px;background:var(--card);min-width:0}
  .v82-card-top{display:flex;gap:10px;align-items:flex-start}.v82-icon{font-size:31px;line-height:1}.v82-card h4{margin:0 0 3px;font-size:16px}.v82-card .meta{display:flex;gap:5px;flex-wrap:wrap;margin-top:8px}
  .v82-pill{font-size:10px;font-weight:850;padding:4px 7px;border-radius:999px;background:#f0ecf8;color:#5d3ca5}.v82-pill.ok{background:#e8f8f3;color:#087a75}
  .v82-progress{height:7px;background:#ece8f1;border-radius:99px;overflow:hidden;margin-top:9px}.v82-progress span{display:block;height:100%;background:linear-gradient(90deg,#0fa7a0,#6941c6)}
  .v82-actions{display:grid;grid-template-columns:1fr 1fr auto;gap:6px;margin-top:9px}.v82-actions .btn{min-width:0}.v82-share{border:1px solid var(--line);background:var(--card);border-radius:12px;padding:8px 10px;cursor:pointer}
  .v82-future{display:flex;gap:7px;flex-wrap:wrap}.v82-future span{border:1px dashed #d8d0e5;border-radius:999px;padding:7px 10px;color:#77707f;font-size:12px;background:#faf9fc}
  .v82-mixed{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}.v82-mixed .btn{flex:1 1 160px}
  #v82Anatomy .card{margin-top:12px}
  body.v72-dark .v82-primary,body.v72-dark .v82-nav,body.v72-dark .v82-pagehead,body.v72-dark .v82-card,body.v72-dark .v82-future span{background:#211e2a;color:#f4f0fb;border-color:#3b3548}body.v72-dark .v82-nav small{color:#bbb3c8}
  @media(max-width:680px){.v82-navgrid,.v82-grid{grid-template-columns:1fr}.v82-nav{min-height:0}.v82-actions{grid-template-columns:1fr 1fr auto}}
  `;document.head.appendChild(s)
}
function registry(){return window.IFSI_V741?.getRegistry?.()?.courses||[]}
function course(id){return registry().find(c=>c.id===id)||{id,label:id.replaceAll('_',' ')}}
function resources(id){return window.IFSI_V741?.resourcesForCourse?.(id)||{questions:[],vocals:[],sheets:[],infographics:[]}}
function stats(id){
  const qs=resources(id).questions||[],m=ST().v7QuestionStats||{};let a=0,c=0,seen=0;
  qs.forEach(q=>{const z=m[q.id];if(z?.answered){seen++;a+=z.answered;c+=z.correct||0}});
  return{seen,total:qs.length,rate:a?Math.round(c/a*100):null,answers:a}
}
function totals(){
  const ids=ALL.map(x=>x.id);let q=0,s=0,i=0,v=0;
  ids.forEach(id=>{const r=resources(id);q+=(r.questions||[]).length;s+=(r.sheets||[]).length;i+=(r.infographics||[]).length;v+=(r.vocals||[]).length});
  return{q,s,i,v}
}
function weakSystem(){
  return SYSTEMS.map(x=>({x,st:stats(x.id)})).filter(z=>z.st.answers>0).sort((a,b)=>(a.st.rate??101)-(b.st.rate??101))[0]||null
}
function trackStart(qs,src,courseId=null){
  window.IFSI_V77?.track?.('qcm_start',{resource_type:'qcm',resource_id:src,course_id:courseId,metadata:{source:src,mode:'train',count:qs.length,themes:[...new Set(qs.map(q=>window.IFSI_V79?.themeOf?.(q)||q.theme||'Général'))].slice(0,12)}})
}
function startCourse(id,n=10){
  const qs=resources(id).questions||[];if(!qs.length)return alert('Aucun QCM disponible pour ce système.');
  const pack=SH(qs).slice(0,Math.min(n,qs.length));localStorage.setItem(MK,'train');trackStart(pack,'v82_anatomy_system',id);begin(pack)
}
function mixed(n=20){
  const groups=SYSTEMS.map(x=>SH(resources(x.id).questions||[])).filter(x=>x.length),out=[];let k=0;
  while(out.length<n&&groups.some(g=>g.length)){const g=groups[k%groups.length];if(g.length)out.push(g.shift());k++}
  if(!out.length)return alert('Aucun QCM anatomie disponible.');
  localStorage.setItem(MK,'train');trackStart(out,'v82_anatomy_mixed');begin(SH(out))
}
function openSystem(id){
  const c=course(id);if(!c?.label)return;
  if(typeof window.openCourse74==='function')window.openCourse74(c.label)
}
async function shareSystem(id){
  const u=new URL(location.href);u.search='';u.hash='';u.searchParams.set('course',id);
  try{await navigator.clipboard.writeText(u.toString());alert('Lien du système copié ✅')}catch{prompt('Copie ce lien :',u.toString())}
}
function card(def){
  const c=course(def.id),r=resources(def.id),stt=stats(def.id),pct=stt.rate??0;
  return `<div class="v82-card" data-anat-card="${E(def.id)}"><div class="v82-card-top"><span class="v82-icon">${def.icon}</span><div><h4>${E(c.label)}</h4><div class="small">${E(def.subtitle)}</div></div></div><div class="meta"><span class="v82-pill">${r.questions.length} QCM</span><span class="v82-pill">📄 ${r.sheets.length}</span><span class="v82-pill">◫ ${r.infographics.length}</span><span class="v82-pill">🎧 ${r.vocals.length}</span>${stt.rate==null?'':`<span class="v82-pill ok">${stt.rate}%</span>`}</div><div class="v82-progress"><span style="width:${pct}%"></span></div><div class="small" style="margin-top:5px">${stt.seen}/${stt.total} questions vues${stt.rate==null?'':' • '+stt.rate+'% de réussite'}</div><div class="v82-actions"><button class="btn primary" data-open="${E(def.id)}">Ouvrir</button>${r.questions.length?`<button class="btn outline" data-test="${E(def.id)}">10 QCM</button>`:`<button class="btn outline" type="button" disabled>Pas de QCM</button>`}<button class="v82-share" title="Copier le lien" data-share="${E(def.id)}">🔗</button></div></div>`
}
function ensureSection(){
  if($(SECTION))return;
  const app=document.querySelector('.app');if(!app)return;
  const sec=document.createElement('section');sec.id=SECTION;sec.className='hidden';sec.innerHTML='<div id="v82AnatomyBody"></div>';
  const quiz=$('quiz');if(quiz)quiz.insertAdjacentElement('beforebegin',sec);else app.appendChild(sec)
}
let showPatched=false;
function patchShow(){
  if(showPatched||typeof window.show!=='function')return;
  const old=window.show;window.show=function(id){
    $(SECTION)?.classList.add('hidden');
    if(id===SECTION){
      document.querySelectorAll('.app > section').forEach(x=>x.classList.add('hidden'));
      $(SECTION)?.classList.remove('hidden');document.querySelectorAll('nav button').forEach(b=>b.classList.remove('on'));renderAnatomy();return
    }
    return old(id)
  };showPatched=true
}
function showAnatomy(){renderAnatomy();window.show?.(SECTION);scrollTo({top:0,behavior:'smooth'})}
function bindAnatomy(){
  document.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>openSystem(b.dataset.open));
  document.querySelectorAll('[data-test]').forEach(b=>b.onclick=()=>startCourse(b.dataset.test,10));
  document.querySelectorAll('[data-share]').forEach(b=>b.onclick=()=>shareSystem(b.dataset.share));
  $('v82Back')?.addEventListener('click',()=>window.show?.('home'));
  $('v82Mixed20')?.addEventListener('click',()=>mixed(20));$('v82Mixed30')?.addEventListener('click',()=>mixed(30));
  const w=weakSystem();if(w)$('v82Weak')?.addEventListener('click',()=>startCourse(w.x.id,10))
}
function renderAnatomy(){
  const b=$('v82AnatomyBody');if(!b)return;const t=totals(),w=weakSystem();
  b.innerHTML=`<div class="v82-pagehead"><button id="v82Back" class="btn outline">← Accueil</button><div class="row"><div><h2>🫀 Anatomie & Physiologie</h2><div class="small">Retrouve les systèmes du corps, leurs QCM et toutes les ressources déjà disponibles dans l’application.</div></div><span class="badge">V${V}</span></div><div class="v82-kpis"><span class="v82-kpi">${SYSTEMS.length} systèmes disponibles</span><span class="v82-kpi">${t.q} QCM</span><span class="v82-kpi">${t.s} fiches</span><span class="v82-kpi">${t.i} infographies</span><span class="v82-kpi">${t.v} vocaux</span></div><div class="v82-mixed"><button id="v82Mixed20" class="btn primary">▶ 20 QCM multi-systèmes</button><button id="v82Mixed30" class="btn outline">🎓 30 QCM multi-systèmes</button>${w?`<button id="v82Weak" class="btn outline">🎯 À renforcer : ${E(course(w.x.id).label)} (${w.st.rate}%)</button>`:''}</div></div>
  <div class="card"><div class="v82-section-title"><div><h3>🧩 Fondamentaux</h3><div class="small">Les bases nécessaires pour comprendre l’organisation et le fonctionnement du corps.</div></div></div><div class="v82-grid">${FOUNDATION.map(card).join('')}</div></div>
  <div class="card"><div class="v82-section-title"><div><h3>🫀 Systèmes du corps</h3><div class="small">Accès direct aux parcours déjà présents dans tes cours.</div></div></div><div class="v82-grid">${SYSTEMS.map(card).join('')}</div></div>
  <div class="card"><div class="v82-section-title"><div><h3>🧭 Prochains systèmes</h3><div class="small">Ils apparaîtront ici automatiquement lorsque les cours correspondants seront ajoutés à l’application.</div></div></div><div class="v82-future">${FUTURE.map(x=>`<span>${x[0]} ${E(x[1])} • à venir</span>`).join('')}</div></div>`;
  bindAnatomy()
}
function hasResume(){const b=$('v76Resume');return !!b&&!b.disabled}
function primaryAction(){if(hasResume())return window.IFSI_V76?.resumeAction?.();return window.IFSI_V76?.startNow?.()}
function hierarchy(){
  const wrap=$('v76Home');if(!wrap)return false;
  wrap.querySelector('.v76-actions')?.classList.add('v82-hidden');
  let p=$('v82Primary');
  if(!p){
    p=document.createElement('section');p.id='v82Primary';p.className='v82-primary';
    const hero=wrap.querySelector('.v76-hero');hero?.insertAdjacentElement('afterend',p)
  }
  const oldResume=$('v76ResumeText')?.textContent?.trim()||'';
  p.innerHTML=`<div class="v82-primary-head"><div><h3>Que veux-tu faire maintenant ?</h3><div class="small">Les fonctions principales d’abord, le reste dans le Centre de révision.</div></div><span class="badge">V${V}</span></div><button id="v82Continue" class="v82-mainbtn"><b>▶ ${hasResume()?'Continuer ma révision':'Commencer ma révision'}</b><span>${hasResume()&&oldResume?E(oldResume):'Session adaptée à tes priorités du jour'}</span></button><div class="v82-navgrid"><button id="v82Courses" class="v82-nav"><span class="ico">📚</span><b>Mes cours</b><small>QCM, fiches, infographies et vocaux</small></button><button id="v82Anat" class="v82-nav anat"><span class="ico">🫀</span><b>Anatomie & Physiologie</b><small>Réviser le corps humain par système</small></button><button id="v82Center" class="v82-nav center"><span class="ico">🚀</span><b>Centre de révision</b><small>Points faibles, examens, recherche et objectifs</small></button></div>`;
  $('v82Continue').onclick=primaryAction;$('v82Courses').onclick=()=>window.showCourses74?.();$('v82Anat').onclick=showAnatomy;$('v82Center').onclick=()=>window.IFSI_V81?.showHub?.();
  const daily=wrap.querySelector('.v76-today');const badge=daily?.querySelector('.badge');if(badge)badge.textContent='Aujourd’hui';
  const quote=wrap.querySelector('.v76-quote'),more=$('v76More'),change=$('v742Changelog');
  if(quote&&more&&quote.nextElementSibling!==more)more.insertAdjacentElement('beforebegin',quote);
  if(change&&more&&change.previousElementSibling!==more)more.insertAdjacentElement('afterend',change);
  return true
}
function links(){
  const p=new URLSearchParams(location.search),cid=p.get('course');
  if(cid&&ALL.some(x=>x.id===cid)){openSystem(cid);return true}
  if(p.get('view')==='anatomie'){showAnatomy();return true}
  return false
}
function init(){
  css();ensureSection();patchShow();const ok=hierarchy();
  return ok&&!!window.IFSI_V81&&!!window.IFSI_V74&&!!window.IFSI_V741?.getRegistry?.()
}
let tries=0,linked=false;const timer=setInterval(()=>{tries++;if(init()){if(!linked)linked=links();clearInterval(timer)}else if(tries>260)clearInterval(timer)},150);
window.addEventListener('ifsi:v741-ready',()=>{hierarchy();if(!linked)linked=links()});
window.addEventListener('storage',()=>{hierarchy();renderAnatomy()});
window.IFSI_V82={version:V,showAnatomy,startSystem:startCourse,startMixed:mixed,openSystem};
})();