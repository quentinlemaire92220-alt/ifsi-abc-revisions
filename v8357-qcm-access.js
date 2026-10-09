(()=>{'use strict';
const VERSION='8.30.57', $=id=>document.getElementById(id);
const DOMAIN_LABELS={A:'Sciences humaines et droit',B:'Sciences biomédicales',C:'Sciences et techniques infirmières',D:'Communication et relation de soins',E:'Méthodes et outils',Autres:'Autres cours'};
const state={open:false,domain:'all',course:'all',theme:'all',difficulty:'all',count:'10',mode:'train'};
const esc=s=>String(s??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const questions=()=>typeof Q!=='undefined'&&Array.isArray(Q)?Q:[];
const registry=()=>window.IFSI_V741?.getRegistry?.()?.courses||[];
const themeOf=q=>window.IFSI_V79?.themeOf?.(q)||q.theme||'Général';
const difficultyOf=q=>window.IFSI_V79?.difficultyOf?.(q)||q.difficulty||'medium';
const courseIdOf=q=>String(q.courseId||window.IFSI_V741?.courseIdForLabel?.(q.course||q.theme)||q.course||q.theme||'Autres');
function catalog(){
  const byId=new Map(registry().map(c=>[String(c.id),c])),groups=new Map();
  questions().forEach(q=>{
    const id=courseIdOf(q),ref=byId.get(id),item=groups.get(id)||{id,label:ref?.label||q.course||q.theme||'Autres',domain:ref?.domain||'Autres',count:0};
    item.count++;groups.set(id,item);
  });
  return [...groups.values()].sort((a,b)=>a.label.localeCompare(b.label,'fr'));
}
const options=(rows,selected)=>rows.map(([id,label])=>'<option value="'+esc(id)+'"'+(id===selected?' selected':'')+'>'+esc(label)+'</option>').join('');
function pool(){return questions().filter(q=>(state.course==='all'||courseIdOf(q)===state.course)&&(state.theme==='all'||themeOf(q)===state.theme)&&(state.difficulty==='all'||difficultyOf(q)===state.difficulty)&&(state.domain==='all'||domainOf(q)===state.domain))}
function domainOf(q){const c=catalogCache.find(c=>c.id===courseIdOf(q));return c?.domain||'Autres'}
let catalogCache=[];
function populate(){
  const card=$('v8357QcmCard');if(!card)return;
  catalogCache=catalog();
  const domains=[...new Set(catalogCache.map(c=>c.domain))].sort((a,b)=>a.localeCompare(b));
  if(state.domain!=='all'&&!domains.includes(state.domain)){state.domain='all';state.course='all';state.theme='all'}
  const domain=$('v8357Domain');
  domain.innerHTML=options([['all','Tous les domaines'],...domains.map(x=>[x,'Domaine '+x+' — '+(DOMAIN_LABELS[x]||x)])],state.domain);
  const courses=catalogCache.filter(c=>state.domain==='all'||c.domain===state.domain);
  if(state.course!=='all'&&!courses.some(c=>c.id===state.course)){state.course='all';state.theme='all'}
  const course=$('v8357Course');
  course.innerHTML=options([['all','Tous les cours'],...courses.map(c=>[c.id,c.label+' ('+c.count+')'])],state.course);
  const themes=[...new Set(questions().filter(q=>(state.domain==='all'||domainOf(q)===state.domain)&&(state.course==='all'||courseIdOf(q)===state.course)).map(themeOf))].sort((a,b)=>a.localeCompare(b,'fr'));
  if(state.theme!=='all'&&!themes.includes(state.theme))state.theme='all';
  $('v8357Theme').innerHTML=options([['all','Tous les thèmes'],...themes.map(t=>[t,t])],state.theme);
  $('v8357Difficulty').value=state.difficulty;
  $('v8357Count').value=state.count;
  $('v8357Mode').value=state.mode;
  const n=pool().length;
  $('v8357Available').textContent=n+' question'+(n>1?'s':'')+' disponible'+(n>1?'s':'');
  const launch=$('v8357Launch');launch.disabled=!n;launch.textContent=n?'▶ Lancer mes QCM':'Aucun QCM pour ces filtres';
}
function start(){
  const candidates=pool();if(!candidates.length)return;
  if(typeof begin!=='function'){window.alert?.('Le moteur QCM est indisponible pour le moment.');return}
  const shuffled=typeof shuffle==='function'?shuffle([...candidates]):[...candidates];
  if(typeof shuffle!=='function')for(let i=shuffled.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[shuffled[i],shuffled[j]]=[shuffled[j],shuffled[i]]}
  const selected=shuffled.slice(0,state.count==='all'?shuffled.length:Math.min(Number(state.count)||10,shuffled.length));
  localStorage.setItem('ifsiabc_v7_mode',state.mode);
  window.IFSI_V77?.track?.('qcm_start',{resource_type:'qcm',resource_id:'revision_qcm_par_cours',course_id:state.course==='all'?null:state.course,metadata:{domain:state.domain,theme:state.theme,difficulty:state.difficulty,mode:state.mode,count:selected.length}});
  begin(selected);
}
function css(){
  if($('v8357QcmCss'))return;
  const s=document.createElement('style');s.id='v8357QcmCss';s.textContent=
    '#v81Body .v8357-qcm-card{grid-column:1/-1!important;order:3!important;padding:17px!important;border:1px solid #b7a3e8!important;background:color-mix(in srgb,var(--card) 94%,#6941c6 6%);min-width:0}'+
    '#v81Body .v8357-qcm-card h3{margin:0 0 5px;font-size:19px}'+
    '#v81Body .v8357-qcm-card .v8357-intro{margin-bottom:12px;color:var(--muted)}'+
    '#v81Body .v8357-qcm-toggle{width:100%;padding:13px 15px;border-radius:13px;font-size:15px;font-weight:850}'+
    '#v81Body .v8357-qcm-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:14px}'+
    '#v81Body .v8357-qcm-fields label{display:grid;gap:5px;font-weight:800;font-size:13px;min-width:0}'+
    '#v81Body .v8357-qcm-fields select{width:100%;min-width:0;color:var(--ink);background:var(--card);border:1px solid var(--line);border-radius:10px;padding:10px}'+
    '#v81Body .v8357-qcm-footer{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px;margin-top:15px}'+
    '#v81Body .v8357-qcm-footer .btn{min-width:200px}'+
    'body.v72-dark #v81Body .v8357-qcm-card{background:#211c2b!important;border-color:#63508a!important;color:#f7f2ff!important}'+
    'body.v72-dark #v81Body .v8357-qcm-fields select{background:#292332!important;color:#f7f2ff!important;border-color:#554563!important}'+
    '@media(max-width:620px){#v81Body .v8357-qcm-fields{grid-template-columns:1fr}#v81Body .v8357-qcm-footer .btn{width:100%}}';
  document.head.appendChild(s);
}
function inject(){
  const body=$('v81Body'),dash=$('v8312MyRevision');if(!body||!dash||dash.parentElement!==body)return false;
  if($('v8357QcmCard'))return true;
  const card=document.createElement('div');card.id='v8357QcmCard';card.className='card v8357-qcm-card';
  card.innerHTML='<h3>📋 QCM par cours</h3><div class="small v8357-intro">Retrouve tous les QCM classiques. Choisis ton domaine, ton cours, ton thème et ta difficulté.</div>'+
   '<button id="v8357Toggle" type="button" class="btn primary v8357-qcm-toggle" aria-controls="v8357Builder" aria-expanded="false">Choisir mes QCM →</button>'+
   '<div id="v8357Builder" hidden><div class="v8357-qcm-fields">'+
   '<label for="v8357Domain">Domaine<select id="v8357Domain"></select></label>'+
   '<label for="v8357Course">Cours<select id="v8357Course"></select></label>'+
   '<label for="v8357Theme">Thème<select id="v8357Theme"></select></label>'+
   '<label for="v8357Difficulty">Difficulté<select id="v8357Difficulty"><option value="all">Toutes les difficultés</option><option value="easy">Facile</option><option value="medium">Moyen</option><option value="hard">Difficile</option></select></label>'+
   '<label for="v8357Count">Nombre de questions<select id="v8357Count"><option value="10">10 questions</option><option value="20">20 questions</option><option value="30">30 questions</option><option value="50">50 questions</option><option value="all">Toutes les questions</option></select></label>'+
   '<label for="v8357Mode">Mode<select id="v8357Mode"><option value="train">Entraînement (correction immédiate)</option><option value="exam">Examen (correction à la fin)</option></select></label>'+
   '</div><div class="v8357-qcm-footer"><span id="v8357Available" class="small" role="status"></span><button type="button" id="v8357Launch" class="btn primary">▶ Lancer mes QCM</button></div></div>';
  dash.insertAdjacentElement('afterend',card);
  const toggle=$('v8357Toggle'),builder=$('v8357Builder');
  toggle.onclick=()=>{state.open=!state.open;builder.hidden=!state.open;toggle.setAttribute('aria-expanded',String(state.open));toggle.textContent=state.open?'Masquer les filtres ↑':'Choisir mes QCM →';if(state.open)populate()};
  $('v8357Domain').onchange=e=>{state.domain=e.target.value;state.course='all';state.theme='all';populate()};
  $('v8357Course').onchange=e=>{state.course=e.target.value;state.theme='all';populate()};
  $('v8357Theme').onchange=e=>{state.theme=e.target.value;populate()};
  $('v8357Difficulty').onchange=e=>{state.difficulty=e.target.value;populate()};
  $('v8357Count').onchange=e=>{state.count=e.target.value;populate()};
  $('v8357Mode').onchange=e=>{state.mode=e.target.value;populate()};
  $('v8357Launch').onclick=start;
  builder.hidden=!state.open;toggle.setAttribute('aria-expanded',String(state.open));
  toggle.textContent=state.open?'Masquer les filtres ↑':'Choisir mes QCM →';
  if(state.open)populate();
  return true;
}
let observer=null,pending=false;
function apply(){css();inject()}
function schedule(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;apply()})}
function watch(){const body=$('v81Body');if(!body||observer)return;observer=new MutationObserver(schedule);observer.observe(body,{childList:true})}
function init(){apply();watch();return !!observer}
let tries=0;const timer=setInterval(()=>{if(init()||++tries>100)clearInterval(timer)},100);
window.addEventListener('ifsi:v741-ready',schedule);
window.IFSI_V8357_QCM={version:VERSION,apply,open:()=>{apply();if(!state.open)$('v8357Toggle')?.click()},getState:()=>({...state})};
})();