(()=>{'use strict';
const V='8.30.9',$=id=>document.getElementById(id);
let observer=null,scheduled=false,showPatched=false;
function css(){
  if($('v8309RevisionCss'))return;
  const s=document.createElement('style');s.id='v8309RevisionCss';s.textContent=`
  #v81Body.v8309-revision{gap:14px!important}
  #v81Body.v8309-revision>.card{border-radius:18px}
  #v81Body .v8309-head{grid-column:1/-1!important;order:1!important;padding:8px 4px!important;background:transparent!important;border:0!important;box-shadow:none!important}
  #v81Body .v8309-headline{display:flex;align-items:center;gap:14px;min-width:0}
  #v81Body .v8309-back{width:46px;height:46px;min-width:46px;padding:0!important;display:grid!important;place-items:center;border-radius:14px!important;font-size:21px}
  #v81Body .v8309-title{min-width:0}
  #v81Body .v8309-title h2{margin:0;font-size:28px;line-height:1.08}
  #v81Body .v8309-title .small{margin-top:5px;font-size:14px}
  #v81Body .v8309-dashboard{grid-column:1/-1!important;order:2!important;padding:13px 15px!important}
  #v81Body .v8309-dashboard>.v81-grid{grid-template-columns:repeat(3,minmax(0,1fr))!important;gap:10px!important}
  #v81Body .v8309-dashboard .v81-kpi{min-height:92px;padding:12px 13px!important;display:flex;flex-direction:column;justify-content:center}
  #v81Body .v8309-dashboard .v81-kpi>b{font-size:24px!important;line-height:1}
  #v81Body .v8309-dashboard .v8309-kpi-action{margin-top:7px;align-self:flex-start;padding:6px 10px;font-size:12px;border-radius:10px}
  #v81Body .vcr-custom{grid-column:1/-1!important;order:3!important;padding:18px!important;border-color:#5e48a1!important}
  #v81Body .vcr-custom>.row:first-child b{font-size:20px}
  #v81Body .vcr-custom-grid{gap:14px!important}
  #v81Body .vcr-custom .vcr-step{margin-top:15px!important}
  #v81Body .v8309-more{margin-top:14px;border:1px solid var(--line);border-radius:13px;overflow:hidden;background:color-mix(in srgb,var(--card) 94%,#6941c6 6%)}
  #v81Body .v8309-more>summary{cursor:pointer;list-style:none;padding:11px 13px;font-weight:850;display:flex;align-items:center;justify-content:space-between;gap:10px}
  #v81Body .v8309-more>summary::-webkit-details-marker{display:none}
  #v81Body .v8309-more>summary:after{content:'⌄';font-size:18px;transition:transform .15s ease}
  #v81Body .v8309-more[open]>summary:after{transform:rotate(180deg)}
  #v81Body .v8309-more-body{border-top:1px solid var(--line);padding:12px}
  #v81Body .v8309-more-body .v81-search{display:grid!important;margin-top:0!important}
  #v81Body .v8309-more-body .v81-results{display:grid!important}
  #v81Body .v8309-quick{grid-column:span 6!important;order:4!important}
  #v81Body .v8309-exam{grid-column:span 6!important;order:5!important}
  #v81Body .v8309-goal{grid-column:1/-1!important;order:6!important}
  #v81Body .v8309-quick,#v81Body .v8309-exam,#v81Body .v8309-goal{padding:16px!important}
  #v81Body .v8309-quick .v81-actions{display:grid!important;grid-template-columns:repeat(3,1fr)!important;gap:9px!important}
  #v81Body .v8309-quick .v81-actions .btn{width:100%;padding:12px 9px!important}
  #v81Body .v8309-exam .v81-actions{display:grid!important;grid-template-columns:minmax(180px,1.8fr) repeat(3,minmax(58px,.55fr))!important;gap:8px!important}
  #v81Body .v8309-exam .v81-actions>*{width:100%}
  #v81Body .v8309-goal .v828-toggle{max-width:260px;margin-top:12px}
  #v81Body .v8309-hidden{display:none!important}
  body.v72-dark #v81Body .v8309-more{background:#282332;border-color:#4a405c}
  @media(max-width:760px){
    #v81Body .v8309-dashboard>.v81-grid{grid-template-columns:1fr!important}
    #v81Body .v8309-quick,#v81Body .v8309-exam,#v81Body .v8309-goal{grid-column:1!important}
    #v81Body .v8309-exam .v81-actions{grid-template-columns:1fr repeat(3,64px)!important}
    #v81Body .v8309-title h2{font-size:25px}
  }
  @media(max-width:520px){
    #v81Body .v8309-head{padding-inline:0!important}
    #v81Body .v8309-dashboard{padding:12px!important}
    #v81Body .v8309-exam .v81-actions{grid-template-columns:repeat(3,1fr)!important}
    #v81Body .v8309-exam .v81-actions select{grid-column:1/-1}
    #v81Body .v8309-quick .v81-actions{grid-template-columns:1fr!important}
    #v81Body .v8309-more-body .v81-search{grid-template-columns:1fr!important}
  }`;
  document.head.appendChild(s);
}
function cardBy(text){
  return [...document.querySelectorAll('#v81Body > .card')].find(c=>c.textContent.includes(text))||null;
}
function patchHeader(head){
  if(!head)return;
  head.classList.add('v8309-head');
  if(head.dataset.v8309==='1')return;
  head.dataset.v8309='1';
  head.innerHTML=`<div class="v8309-headline"><button id="v81Back" type="button" class="btn outline v8309-back" aria-label="Retour à l’accueil">←</button><div class="v8309-title"><h2>🚀 Révision</h2><div class="small">Choisis un mode de travail adapté à ton besoin.</div></div></div>`;
  $('v81Back').onclick=()=>window.show?.('home');
}
function patchDashboard(dash){
  if(!dash)return;
  dash.classList.add('v8309-dashboard');
  const title=dash.querySelector(':scope > b');if(title)title.textContent='📊 Ton activité';
  const grid=dash.querySelector('.v81-grid'),k=grid?[...grid.children]:[];
  if(k.length>=4)k[2].classList.add('v8309-hidden');
  if(k[1]&&!k[1].querySelector('#v8309WeakBtn')){
    const b=document.createElement('button');b.id='v8309WeakBtn';b.type='button';b.className='btn primary v8309-kpi-action';b.textContent='Travailler →';
    b.disabled=!window.IFSI_V81?.weakThemes?.()?.length;
    b.onclick=()=>window.IFSI_V81?.startWeak?.();
    k[1].appendChild(b);
  }
}
function patchCustom(custom,search){
  if(!custom)return;
  const title=custom.querySelector(':scope > .row:first-child b');if(title)title.textContent='⚙️ Créer une session';
  const intro=custom.querySelector(':scope > .row:first-child .small');if(intro)intro.textContent='Personnalise ta révision en quelques clics et entraîne-toi sur les notions qui comptent.';
  const badge=custom.querySelector(':scope > .row:first-child .badge');if(badge)badge.remove();
  if(!$('v8309More')){
    const details=document.createElement('details');details.id='v8309More';details.className='v8309-more';
    details.innerHTML='<summary><span>⌁ Plus de filtres</span><span class="small">Recherche avancée dans les QCM et ressources</span></summary><div class="v8309-more-body"></div>';
    const preview=custom.querySelector('.vcr-preview');custom.insertBefore(details,preview||custom.lastChild);
  }
  const host=$('v8309More')?.querySelector('.v8309-more-body');
  if(search&&host){
    const fields=search.querySelector('.v81-search'),results=search.querySelector('.v81-results');
    if(fields&&fields.parentElement!==host)host.appendChild(fields);
    if(results&&results.parentElement!==host)host.appendChild(results);
  }
}
function patchSecondary(quick,exam,goal){
  if(quick){quick.classList.add('v8309-quick');const b=quick.querySelector(':scope > b');if(b)b.textContent='⚡ Révision express'}
  if(exam){
    exam.classList.add('v8309-exam');
    const b=exam.querySelector(':scope > b');if(b)b.textContent='🎓 Examen blanc';
    if(!exam.querySelector('.v8309-exam-note')){const n=document.createElement('div');n.className='small v8309-exam-note';n.textContent='Teste tes connaissances en conditions réelles.';b?.insertAdjacentElement('afterend',n)}
  }
  if(goal)goal.classList.add('v8309-goal');
}
function decorate(){
  css();
  const body=$('v81Body');if(!body)return false;
  body.classList.add('v8309-revision');
  const head=[...body.children].find(c=>c.classList?.contains('v81-card')&&c.textContent.includes('Révision'));
  const dash=cardBy('Dashboard local')||cardBy('Ton activité');
  const custom=$('vcrCustom');
  const quick=cardBy('Révision express');
  const weak=cardBy('Points faibles');
  const exam=cardBy('Examen blanc intelligent')||cardBy('Examen blanc');
  const pre=cardBy('Avant partiel');
  const search=cardBy('Recherche avancée');
  const goal=cardBy('Objectif du jour');
  patchHeader(head);patchDashboard(dash);patchCustom(custom,search);patchSecondary(quick,exam,goal);
  weak?.classList.add('v8309-hidden');pre?.classList.add('v8309-hidden');search?.classList.add('v8309-hidden');
  return true;
}
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;decorate()})}
function patchShowHub(){
  if(showPatched||!window.IFSI_V81?.showHub)return false;
  const old=window.IFSI_V81.showHub;
  window.IFSI_V81.showHub=function(){const out=old.apply(this,arguments);schedule();return out};
  showPatched=true;return true;
}
function installObserver(){
  if(observer||!$('v81Body'))return;
  observer=new MutationObserver(schedule);observer.observe($('v81Body'),{childList:true,subtree:false});
}
function init(){css();patchShowHub();decorate();installObserver();return !!window.IFSI_V81&&!!$('v81Body')}
let tries=0;const timer=setInterval(()=>{tries++;if(init()||tries>220)clearInterval(timer)},80);
window.IFSI_V8309={version:V,apply:decorate};
})();