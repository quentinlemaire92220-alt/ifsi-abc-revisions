(()=>{
'use strict';
const VERSION='7.6';
const $76=id=>document.getElementById(id);
const readJSON=(k,d)=>{try{return JSON.parse(localStorage.getItem(k)||JSON.stringify(d))}catch{return d}};

function addStyles(){
  if($76('v76css'))return;
  const s=document.createElement('style');s.id='v76css';s.textContent=`
  .headAvatar img{object-fit:cover!important;object-position:50% 22%!important;transform:scale(1.05)}
  .v76-home{display:grid;gap:12px}.v76-hero{position:relative;overflow:hidden;border-radius:26px;padding:20px;background:linear-gradient(145deg,#f8f4ff 0%,#eefbfa 100%);border:1px solid #ded4f2;box-shadow:0 14px 34px rgba(55,39,94,.10)}
  .v76-hero-top{display:flex;align-items:center;gap:17px}.v76-portrait{width:118px;height:118px;flex:0 0 118px;border-radius:50%;overflow:hidden;background:#fff;border:5px solid #fff;box-shadow:0 10px 26px rgba(77,50,140,.18)}.v76-portrait img{width:100%;height:100%;display:block;object-fit:cover;object-position:50% 22%;transform:scale(1.05)}
  .v76-welcome{min-width:0}.v76-welcome h2{font-size:25px;line-height:1.12;margin:0 0 7px;color:#242332}.v76-welcome h2 span{color:#6941c6}.v76-welcome p{margin:0;color:#6c6878;line-height:1.45}.v76-spark{position:absolute;font-size:28px;opacity:.78;pointer-events:none}.v76-s1{right:18px;top:14px}.v76-s2{right:44px;bottom:13px}.v76-s3{left:12px;bottom:10px;font-size:20px}
  .v76-actions{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}.v76-action{border:1px solid #e4dcf2;border-radius:20px;padding:15px;background:#fff;text-align:left;cursor:pointer;color:#242332;box-shadow:0 8px 22px rgba(55,39,94,.06);min-height:158px;display:flex;flex-direction:column}.v76-action:hover{transform:translateY(-1px)}.v76-action .ico{font-size:31px;margin-bottom:12px}.v76-action b{font-size:17px;line-height:1.15}.v76-action .small{margin-top:7px;line-height:1.35}.v76-action .go{margin-top:auto;align-self:flex-end;width:34px;height:34px;border-radius:50%;display:grid;place-items:center;font-weight:900;color:#fff}.v76-action.revise{background:linear-gradient(160deg,#fff,#f5efff)}.v76-action.revise .go{background:#7b4be2}.v76-action.resources{background:linear-gradient(160deg,#fff,#ebfbf8)}.v76-action.resources .go{background:#0fa7a0}.v76-action.resume{background:linear-gradient(160deg,#fff,#edf7ff)}.v76-action.resume .go{background:#2783e8}.v76-action:disabled{opacity:.55;cursor:not-allowed;transform:none}
  .v76-quote{display:flex;align-items:center;gap:13px;border:1px solid #e2daf1;background:linear-gradient(135deg,#fbf8ff,#fff);border-radius:20px;padding:14px 16px}.v76-quote .mark{font-size:35px;color:#7650cf;line-height:1}.v76-quote b{display:block;font-size:17px}.v76-quote .plant{margin-left:auto;font-size:33px}
  .v76-today{border:1px solid #e2daf1;border-radius:22px;background:#fff;padding:16px;box-shadow:0 8px 22px rgba(55,39,94,.06)}.v76-title-row{display:flex;align-items:center;justify-content:space-between;gap:10px}.v76-title-row h3{margin:0}.v76-tasks{display:grid;grid-template-columns:repeat(3,1fr);gap:9px;margin-top:12px}.v76-task{border:0;border-radius:16px;padding:12px;text-align:left;cursor:pointer;color:#242332}.v76-task b{display:block;font-size:22px;margin-bottom:2px}.v76-task span{font-size:12px}.v76-task.err{background:#fff0f4}.v76-task.err b{color:#c12f61}.v76-task.voc{background:#eafaf7}.v76-task.voc b{color:#087a75}.v76-task.day{background:#edf7ff}.v76-task.day b{color:#236fd1}.v76-task:disabled{opacity:.5;cursor:not-allowed}
  .v76-more{border:1px solid #e6e0ef;border-radius:18px;background:#fff;padding:0 14px}.v76-more>summary{cursor:pointer;padding:13px 0;font-weight:850;color:#5f5670}.v76-more-body{padding-bottom:14px}.v76-more-body>.section:first-child{margin-top:4px}
  #v76Home #v742Changelog{margin:0}.v76-hidden{display:none!important}
  body.v72-dark .v76-hero,body.v72-dark .v76-action,body.v72-dark .v76-quote,body.v72-dark .v76-today,body.v72-dark .v76-more{background:#211e2a;color:#f4f0fb;border-color:#3b3548}body.v72-dark .v76-welcome h2,body.v72-dark .v76-action{color:#f4f0fb}body.v72-dark .v76-welcome p{color:#bbb3c8}body.v72-dark .v76-task.err{background:#3b2730}body.v72-dark .v76-task.voc{background:#1f3735}body.v72-dark .v76-task.day{background:#23313f}
  @media(max-width:620px){.v76-hero{padding:16px}.v76-hero-top{align-items:flex-start}.v76-portrait{width:92px;height:92px;flex-basis:92px}.v76-welcome h2{font-size:21px}.v76-actions{grid-template-columns:1fr}.v76-action{min-height:0;display:grid;grid-template-columns:auto 1fr auto;grid-template-rows:auto auto;column-gap:12px;align-items:center}.v76-action .ico{grid-row:1/3;margin:0}.v76-action b{grid-column:2}.v76-action .small{grid-column:2;margin-top:3px}.v76-action .go{grid-column:3;grid-row:1/3;margin:0}.v76-tasks{grid-template-columns:1fr}.v76-quote .plant{font-size:27px}}
  `;document.head.appendChild(s);
}

function avatarSrc(){return document.querySelector('.headAvatar img')?.src||document.querySelector('.heroBrand')?.src||''}
function qcmResume(){const r=readJSON('ifsiabc_resume_v1',null);return r&&Array.isArray(r.ids)&&r.ids.length?r:null}
function vocalResume(){const state=window.IFSI_V73?.getState?.()||readJSON('ifsiabc_vocals_v1',{lastId:null});return state?.lastId||null}
function resumeLabel(){const r=qcmResume();if(r)return `Question ${Math.min((r.index||0)+1,r.ids.length)} / ${r.ids.length}`;const id=vocalResume();if(id){const v=(window.IFSI_V73?.getVocals?.()||[]).find(x=>x.id===id);return v?.title||'Dernier vocal consulté'}return 'Aucune activité interrompue'}
function resumeAction(){const r=qcmResume();if(r&&typeof window.resumeSession==='function')return window.resumeSession();const id=vocalResume();if(id){window.showVocals?.();setTimeout(()=>window.IFSI_V73?.play?.(id),100);return}alert('Aucune activité à reprendre pour le moment.')}
function startNow(){const p=window.IFSI_V75?.buildTodaySession?.();if(p?.questions?.length&&typeof window.startTodayV75==='function')return window.startTodayV75();if(typeof window.startSmart==='function')return window.startSmart();window.startQuick?.()}
function openResources(){if(typeof window.showCourses74==='function')return window.showCourses74();window.showSheets?.()}

function buildHome(){
  const home=$76('home');if(!home)return false;if($76('v76Home'))return true;
  const src=avatarSrc();
  const wrap=document.createElement('div');wrap.id='v76Home';wrap.className='v76-home';
  wrap.innerHTML=`
    <section class="v76-hero">
      <span class="v76-spark v76-s1">💡</span><span class="v76-spark v76-s2">🎓</span><span class="v76-spark v76-s3">📚</span>
      <div class="v76-hero-top">
        <div class="v76-portrait">${src?`<img src="${src}" alt="Illustration de profil">`:'👨‍⚕️'}</div>
        <div class="v76-welcome"><h2>Bienvenue dans ton espace de révision 👋</h2><p>QCM, fiches, infographies et vocaux pour réviser efficacement.</p></div>
      </div>
    </section>
    <section class="v76-actions" aria-label="Raccourcis">
      <button id="v76Revise" class="v76-action revise" type="button"><span class="ico">🎯</span><b>Réviser maintenant</b><span class="small">Une session adaptée à tes priorités du jour</span><span class="go">→</span></button>
      <button id="v76Resources" class="v76-action resources" type="button"><span class="ico">📖</span><b>Voir mes ressources</b><span class="small">Cours, fiches, infographies et vocaux</span><span class="go">→</span></button>
      <button id="v76Resume" class="v76-action resume" type="button"><span class="ico">🕘</span><b>Reprendre où j’en étais</b><span id="v76ResumeText" class="small"></span><span class="go">→</span></button>
    </section>
    <section class="v76-quote"><span class="mark">“</span><div><b>Petit pas par petit pas, tu avances. 💜</b><span class="small">IFSI ABC Révisions</span></div><span class="plant">🌱</span></section>
    <section class="v76-today"><div class="v76-title-row"><div><h3>📅 À faire aujourd’hui</h3><div class="small">Tes priorités de révision, mises à jour automatiquement.</div></div><span class="badge">V7.6</span></div><div class="v76-tasks"><button id="v76ErrTask" class="v76-task err" type="button"><b id="v76ErrCount">0</b><span>erreurs à revoir →</span></button><button id="v76VocTask" class="v76-task voc" type="button"><b id="v76VocCount">0</b><span>vocaux à écouter →</span></button><button id="v76DayTask" class="v76-task day" type="button"><b id="v76DayCount">0</b><span>questions du jour →</span></button></div></section>
    <details id="v76More" class="v76-more"><summary>⚙️ Plus d’options de révision</summary><div id="v76MoreBody" class="v76-more-body"></div></details>`;
  home.insertBefore(wrap,home.firstChild);
  $76('v76Revise').onclick=startNow;$76('v76Resources').onclick=openResources;$76('v76Resume').onclick=resumeAction;$76('v76ErrTask').onclick=()=>window.startErrors?.();$76('v76VocTask').onclick=()=>window.showVocals?.();$76('v76DayTask').onclick=()=>window.startTodayV75?.();
  return true;
}

function organizeLegacy(){
  const home=$76('home'),more=$76('v76MoreBody');if(!home||!more)return;
  const direct=[...home.children];
  const hero=direct.find(x=>x.classList?.contains('hero'));
  const install=direct.find(x=>x.classList?.contains('card')&&x.textContent.includes("Installer l'application"));
  const stats=direct.find(x=>x.classList?.contains('grid'));
  const create=direct.find(x=>x.classList?.contains('section')&&x.textContent.includes('Créer une série'));
  const createCard=create?.nextElementSibling?.classList?.contains('stack')?create.nextElementSibling:null;
  const feedback=home.querySelector('.v72-feedback');
  [hero,install,stats,$76('v74Dashboard'),$76('v75TodayCard'),$76('v7LocalNotice'),$76('resumeCard')].forEach(x=>x?.classList.add('v76-hidden'));
  [$76('v74SearchCard'),create,createCard,feedback].forEach(x=>{if(x&&x.parentElement!==more)more.appendChild(x)});
  const changelog=$76('v742Changelog');if(changelog&&changelog.parentElement!==$76('v76Home'))$76('v76Home').insertBefore(changelog,$76('v76More'));
}

function refresh(){
  const stats=typeof st==='function'?st():{},errors=(stats.errors||[]).length;
  const vs=window.IFSI_V73?.getVocals?.()||[],state=window.IFSI_V73?.getState?.()||{listened:[]},listened=new Set(state.listened||[]),unheard=Math.max(0,vs.filter(v=>!listened.has(v.id)).length);
  const today=window.IFSI_V75?.buildTodaySession?.()?.questions?.length||0;
  if($76('v76ErrCount'))$76('v76ErrCount').textContent=errors;if($76('v76VocCount'))$76('v76VocCount').textContent=unheard;if($76('v76DayCount'))$76('v76DayCount').textContent=today;
  const er=$76('v76ErrTask');if(er)er.disabled=!errors;const vo=$76('v76VocTask');if(vo)vo.disabled=!vs.length;const dy=$76('v76DayTask');if(dy)dy.disabled=!today;
  const rt=$76('v76ResumeText');if(rt)rt.textContent=resumeLabel();const rb=$76('v76Resume');if(rb)rb.disabled=!qcmResume()&&!vocalResume();
}
function patchRefresh(){
  if(window.__IFSI_V76_PATCHED)return;window.__IFSI_V76_PATCHED=true;
  if(typeof window.fill==='function'){const oldFill=window.fill;window.fill=function(){const out=oldFill.apply(this,arguments);setTimeout(refresh,0);return out}}
  if(typeof window.show==='function'){const oldShow=window.show;window.show=function(id){const out=oldShow.apply(this,arguments);if(id==='home')setTimeout(refresh,0);return out}}
}
function init(){addStyles();if(!buildHome())return false;organizeLegacy();refresh();patchRefresh();return !!window.IFSI_V75&&!!window.IFSI_V74&&!!window.IFSI_V73}
let tries=0;const timer=setInterval(()=>{tries++;if(init()||tries>180)clearInterval(timer)},100);
window.addEventListener('storage',refresh);
window.IFSI_V76={version:VERSION,refresh,startNow,openResources,resumeAction};
})();