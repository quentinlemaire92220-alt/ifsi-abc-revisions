(()=>{'use strict';
const V=window.IFSI_APP_VERSION||'8.30.79',$=id=>document.getElementById(id);
let revisionObserver = null;
let midnightTimer;
function css(){
  if($('v8312css'))return;
  const s=document.createElement('style');s.id='v8312css';s.textContent=`
  body.v86-home .v76-today{display:none!important}
  body.v86-home #v76Home>#v82Primary{order:1}
  body.v86-home #v76Home>#v86Tools{order:2}
  body.v86-home #v76Home>#v8303HomeExtras{order:3}
  #v8303HomeExtras{gap:12px!important}
  #v742Changelog.v8312-news{padding:16px!important}
  .v8312-news-list{display:grid;gap:0;margin-top:12px;border-top:1px solid var(--line)}
  .v8312-news-item{padding:13px 2px;border-bottom:1px solid var(--line)}
  .v8312-news-item-head{display:flex;align-items:center;gap:7px;flex-wrap:wrap}
  .v8312-news-item-title{font-weight:850;line-height:1.3}
  .v8312-news-date{font-size:11px;font-weight:750;color:var(--muted);white-space:nowrap}
  #v87Log .v8312-log-date{float:right;margin-left:10px;font-size:11px;font-weight:750;color:var(--muted);white-space:nowrap}
  .v8312-home-feedback{order:2}
  #v742Changelog{order:1}
  #v81Body .v8309-dashboard.v8312-myrevision{padding:16px!important}
  #v81Body .v8312-revision-head b{font-size:20px}
  #v81Body .v8312-revision-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin-top:13px}
  #v81Body .v8312-revision-kpi{border:1px solid var(--line);border-radius:15px;padding:13px 12px;background:color-mix(in srgb,var(--card) 94%,#6941c6 6%);color:var(--ink);text-align:left;cursor:pointer;min-height:92px}
  #v81Body .v8312-revision-kpi b{display:block;font-size:25px;line-height:1;margin-bottom:6px}
  #v81Body .v8312-revision-kpi span{font-size:12px;font-weight:800}
  #v81Body .v8312-revision-kpi.err b{color:#c12f61}
  #v81Body .v8312-revision-kpi.q b{color:#2f73db}
  #v81Body .v8312-revision-kpi.voc b{color:#0b8e81}
  #v81Body .v8312-revision-kpi:disabled{opacity:.5;cursor:not-allowed}
  #v81Body .v8312-start{width:100%;margin-top:12px;padding:13px 15px!important;font-size:15px}
  #v81Body{min-width:0!important}
  #v81Body .v8309-quick,#v81Body .v8309-exam,#v81Body .v8309-goal{min-width:0!important}
  #v81Body .v8309-exam .v81-actions{grid-template-columns:minmax(0,1.8fr) repeat(3,minmax(0,.55fr))!important}
  #v81Body .v8309-exam .v81-actions>*{min-width:0!important}
  body.v72-dark #v81Body .v8312-revision-kpi{background:#282332;border-color:#4a405c}
  @media(max-width:620px){
    #v81Body .v8312-revision-grid{grid-template-columns:1fr}
    #v81Body .v8312-revision-kpi{min-height:0}
  }`;
  document.head.appendChild(s);
}
function replaceGroupName(){
  document.querySelectorAll('.v72-feedback .small,#v8303ImproveCard .small').forEach(x=>{x.textContent='Une suggestion, un problème ou une amélioration à proposer ? Le message sera préparé pour le groupe « Technique ».'});
  const modal=$('v72SuggestModal');if(modal){
    const note=[...modal.querySelectorAll('.small')].find(x=>/Aucune donnée/i.test(x.textContent));if(note)note.textContent='Aucune donnée n’est envoyée automatiquement. Après « Partager », choisis WhatsApp puis le groupe « Technique ».';
    const share=$('v72SuggestShare');if(share)share.textContent='Partager vers Technique';
  }
}
function home(){
  const h=$('v76Home');if(!h)return false;
  h.querySelector('.v76-today')?.remove();
  const extras=$('v8303HomeExtras'),news=$('v742Changelog'),feedback=document.querySelector('.v72-feedback');
  if(extras&&news&&news.parentElement===extras)extras.insertBefore(news,extras.firstChild);
  if(feedback){feedback.classList.add('v8312-home-feedback');if(extras&&feedback.parentElement===extras)extras.appendChild(feedback)}
  replaceGroupName();return true;
}
function renderNews(){
  const list = $('v8312NewsList');
  if (!list) return false;
  const {today, entries, nextMidnight} = window.IFSI_CHANGELOG.week();
  if (list.dataset.day === today) return true;
  list.dataset.day = today;
  list.innerHTML = entries.map(note => {
    const title = note.title.replace(/^V[\d.]+\s*[—-]\s*/, '');
    const date = note.date.split('-').reverse().join('/');
    return `<article class="v8312-news-item"><div class="v8312-news-item-head"><span class="v8312-news-item-title">${escapeHtml(title)}</span><time class="v8312-news-date" datetime="${note.date}">${date}</time></div></article>`;
  }).join('') || '<p class="small">Aucune mise à jour ces sept derniers jours.</p>';
  clearTimeout(midnightTimer);
  midnightTimer = setTimeout(renderNews, Math.max(1, nextMidnight - Date.now() + 20));
  return true;
}
function escapeHtml(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function counts(){
  let stats={};try{stats=typeof st==='function'?st():JSON.parse(localStorage.getItem('ifsiabc_stats')||'{}')}catch{}
  const errors=Array.isArray(stats.errors)?stats.errors.length:0;
  const vocals=window.IFSI_V73?.getVocals?.()?.length||0;
  const questions=window.IFSI_V75?.buildTodaySession?.()?.questions?.length||0;
  return {errors,vocals,questions};
}
function startMainRevision(){
  const c=counts();
  if(c.questions&&typeof window.startTodayV75==='function')return window.startTodayV75();
  if(window.IFSI_V76?.startNow)return window.IFSI_V76.startNow();
  if(typeof window.startSmart==='function')return window.startSmart();
  window.startQuick?.();
}
function revision(){
  const body=$('v81Body');if(!body)return false;
  let dash=$('v8312MyRevision')||body.querySelector('.v8309-dashboard')||[...body.children].find(c=>c.classList?.contains('card')&&/Ton activité|Dashboard local/.test(c.textContent));
  if(!dash){
    dash=document.createElement('div');dash.className='card v8309-dashboard';dash.id='v8312MyRevision';
    const custom=$('vcrCustom'),head=body.querySelector('.v8309-head')||[...body.children].find(c=>c.classList?.contains('v81-card')&&/Révision/.test(c.textContent));
    if(custom&&custom.parentElement===body)body.insertBefore(dash,custom);
    else if(head&&head.parentElement===body)head.insertAdjacentElement('afterend',dash);
    else body.insertBefore(dash,body.firstChild);
  }
  dash.id='v8312MyRevision';
  dash.classList.add('v8309-dashboard','v8312-myrevision');
  if(dash.dataset.v8312!=='1'){
    dash.dataset.v8312='1';
    dash.innerHTML=`<div class="v8312-revision-head"><b>🎯 Ma révision</b><div class="small" style="margin-top:4px">Tes éléments à travailler et tes ressources disponibles.</div></div><div class="v8312-revision-grid"><button id="v8312Err" type="button" class="v8312-revision-kpi err"><b id="v8312ErrN">0</b><span>Erreurs à revoir</span></button><button id="v8312Questions" type="button" class="v8312-revision-kpi q"><b id="v8312QuestionsN">0</b><span>Questions recommandées</span></button><button id="v8312Vocals" type="button" class="v8312-revision-kpi voc"><b id="v8312VocalsN">0</b><span>Vocaux disponibles</span></button></div><button id="v8312Start" type="button" class="btn primary v8312-start">▶ Commencer ma révision</button>`;
    $('v8312Err').onclick=()=>window.startErrors?.();
    $('v8312Questions').onclick=()=>typeof window.startTodayV75==='function'?window.startTodayV75():startMainRevision();
    $('v8312Vocals').onclick=()=>window.showVocals?.();
    $('v8312Start').onclick=startMainRevision;
  }
  const c=counts();
  if($('v8312ErrN'))$('v8312ErrN').textContent=c.errors;
  if($('v8312QuestionsN'))$('v8312QuestionsN').textContent=c.questions;
  if($('v8312VocalsN'))$('v8312VocalsN').textContent=c.vocals;
  if($('v8312Err'))$('v8312Err').disabled=!c.errors;
  if($('v8312Questions'))$('v8312Questions').disabled=!c.questions;
  return true;
}
function observeRevision(){
  const body=$('v81Body');if(!body||revisionObserver)return;
  revisionObserver=new MutationObserver(()=>requestAnimationFrame(revision));
  revisionObserver.observe(body,{childList:true,subtree:false});
}
function apply(){css();home();renderNews();revision();observeRevision()}
function startupStable(){return !!$('v8303HomeExtras')&&!!$('v8312NewsUi')&&!!$('v8312MyRevision')&&!!$('v87Log')}
let tries=0;const timer=setInterval(()=>{tries++;apply();if(startupStable()||tries>30)clearInterval(timer)},100);
window.addEventListener('pageshow',renderNews);
window.addEventListener('ifsi:qcm-load',()=>{
 const hub=$('v81Hub');
 if(hub&&!hub.classList.contains('hidden'))requestAnimationFrame(revision);
});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)renderNews()});
window.addEventListener('storage',()=>requestAnimationFrame(apply));
window.addEventListener('ifsi:v73-ready',()=>requestAnimationFrame(apply));
window.addEventListener('load',()=>setTimeout(apply,0));
window.IFSI_V8312={version:V,apply,renderNews,revision};
})();
