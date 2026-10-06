(()=>{'use strict';
const V='8.28';
const $=id=>document.getElementById(id);
let showPatched=false,apiPatched=false,observed=false,preOpen=false,searchOpen=false,goalOpen=false;
function css(){
  if($('v828css'))return;
  const s=document.createElement('style');s.id='v828css';s.textContent=`
  #v81Hub{padding-bottom:96px}
  #v81Body.v828-revision{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));gap:16px;align-items:start}
  #v81Body.v828-revision>.card{margin:0;min-width:0}
  #v81Body .v828-head{grid-column:1/-1;order:1;padding:13px 15px}
  #v81Body .v828-head .row{margin-top:7px!important}
  #v81Body .v828-dashboard{grid-column:1/-1;order:2;padding:13px 15px}
  #v81Body .v828-dashboard>.v81-grid{grid-template-columns:repeat(4,minmax(0,1fr));gap:8px!important}
  #v81Body .v828-dashboard .v81-kpi{padding:9px 11px}
  #v81Body .v828-dashboard .v81-kpi>b{font-size:20px}
  #v81Body .v8305-custom{grid-column:1/-1;order:3}
  #v81Body .v828-quick{grid-column:span 7;order:4}
  #v81Body .v828-weak{grid-column:span 5;order:5}
  #v81Body .v828-goal{grid-column:span 5;order:6}
  #v81Body .v828-exam{grid-column:span 7;order:7}
  #v81Body .v828-pre{grid-column:1/-1;order:8}
  #v81Body .v828-search{grid-column:1/-1;order:9}
  #v81Body .v828-quick .v81-actions{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
  #v81Body .v828-quick .v81-actions .btn{width:100%;padding:12px 10px}
  #v81Body .v828-exam .v81-actions{display:grid;grid-template-columns:minmax(180px,1.7fr) repeat(3,1fr);gap:8px}
  #v81Body .v828-exam .v81-actions>*{width:100%}
  #v81Body .v828-goal .v81-actions{display:none;margin-top:9px}
  #v81Body .v828-goal.v828-open .v81-actions{display:grid;grid-template-columns:1fr 1fr}
  #v81Body .v828-pre>.v81-chips{display:none;margin-top:10px;max-height:220px;overflow:auto;padding-right:3px}
  #v81Body .v828-pre.v828-open>.v81-chips{display:flex}
  #v81Body .v828-search>.v81-search,#v81Body .v828-search>.v81-results{display:none}
  #v81Body .v828-search.v828-open>.v81-search{display:grid}
  #v81Body .v828-search.v828-open>.v81-results{display:grid}
  #v81Body .v828-toggle{width:100%;display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:9px;border:1px solid var(--line);background:color-mix(in srgb,var(--card) 92%,#6941c6 8%);color:var(--ink);border-radius:12px;padding:10px 12px;font-weight:800;cursor:pointer;text-align:left}
  #v81Body .v828-toggle .chev{font-size:18px;line-height:1;transition:transform .15s ease}
  #v81Body .v828-open>.v828-toggle .chev{transform:rotate(180deg)}
  #v81Body .v828-pre .v81-actions{margin-top:10px!important;display:grid;grid-template-columns:auto auto auto minmax(160px,1fr);gap:8px}
  #v81Body .v828-pre .v81-actions #v81StartPre{min-width:160px}
  #v81Body .v828-weak .v81-row{padding:8px 9px}
  #v81Body .v828-weak .v81-row:nth-of-type(n+5){display:none}
  body.v72-dark #v81Hub .btn.outline{background:#2b2638;color:#ece4ff;border-color:#50465f}
  body.v72-dark #v81Hub .v81-chip{background:#2b2638;color:#ece4ff;border-color:#50465f}
  body.v72-dark #v81Hub .v81-chip.on{background:#6941c6;color:#fff;border-color:#805be0}
  body.v72-dark #v81Hub .v828-toggle{background:#282332;color:#f4f0fb;border-color:#4a405c}
  @media(max-width:760px){
    #v81Body.v828-revision{grid-template-columns:1fr;gap:14px}
    #v81Body.v828-revision>.card{grid-column:1!important}
    #v81Body .v828-dashboard>.v81-grid{grid-template-columns:repeat(2,1fr)}
    #v81Body .v828-exam .v81-actions{grid-template-columns:1fr 1fr}
    #v81Body .v828-exam .v81-actions select{grid-column:1/-1}
    #v81Body .v828-pre .v81-actions{grid-template-columns:repeat(3,auto) 1fr}
  }
  @media(max-width:480px){
    #v81Body .v828-dashboard>.v81-grid{grid-template-columns:1fr 1fr}
    #v81Body .v828-quick .v81-actions{grid-template-columns:1fr}
    #v81Body .v828-exam .v81-actions{grid-template-columns:1fr}
    #v81Body .v828-exam .v81-actions select{grid-column:auto}
    #v81Body .v828-pre .v81-actions{grid-template-columns:repeat(3,1fr)}
    #v81Body .v828-pre .v81-actions #v81StartPre{grid-column:1/-1;min-width:0}
  }`;
  document.head.appendChild(s);
}
function patchShow(){
  if(showPatched||typeof window.show!=='function')return false;
  const old=window.show;
  window.show=function(id){
    if(id!=='v81Hub')$('v81Hub')?.classList.add('hidden');
    return old.apply(this,arguments);
  };
  showPatched=true;return true;
}
function cardBy(text){return [...document.querySelectorAll('#v81Body > .card')].find(c=>c.textContent.includes(text))||null}
function ensureToggle(card,id,label,getOpen,setOpen){
  if(!card)return;
  let b=$(id);
  if(!b){b=document.createElement('button');b.id=id;b.type='button';b.className='v828-toggle';card.insertBefore(b,card.querySelector('.v81-chips,.v81-search,.v81-actions')||card.lastChild)}
  const update=()=>{const open=getOpen();card.classList.toggle('v828-open',open);b.innerHTML=`<span>${label()}</span><span class="chev">⌄</span>`};
  b.onclick=()=>{setOpen(!getOpen());update()};update();
}
function tidy(){
  css();patchShow();
  const hub=$('v81Hub'),body=$('v81Body');if(!hub||!body)return false;
  body.classList.add('v828-revision');
  const head=[...body.children].find(c=>c.classList?.contains('v81-card')&&c.textContent.includes('Centre de révision'));
  const dash=cardBy('Dashboard local'),goal=cardBy('Objectif du jour'),quick=cardBy('Révision express'),weak=cardBy('Points faibles'),exam=cardBy('Examen blanc intelligent'),pre=cardBy('Avant partiel'),search=cardBy('Recherche avancée');
  head?.classList.add('v828-head');dash?.classList.add('v828-dashboard');goal?.classList.add('v828-goal');quick?.classList.add('v828-quick');weak?.classList.add('v828-weak');exam?.classList.add('v828-exam');pre?.classList.add('v828-pre');search?.classList.add('v828-search');
  body.querySelectorAll('button').forEach(b=>{if(!b.hasAttribute('type'))b.type='button'});
  if(goal){ensureToggle(goal,'v828GoalToggle',()=>goalOpen?'Masquer le réglage':'Modifier mon objectif',()=>goalOpen,v=>goalOpen=v)}
  if(pre){ensureToggle(pre,'v828PreToggle',()=>{const n=pre.querySelectorAll('[data-pre].on').length;return `${preOpen?'Masquer':'Choisir'} les matières${n?` • ${n} sélectionnée${n>1?'s':''}`:''}`},()=>preOpen,v=>preOpen=v)}
  if(search){ensureToggle(search,'v828SearchToggle',()=>searchOpen?'Masquer la recherche':'Ouvrir la recherche avancée',()=>searchOpen,v=>searchOpen=v)}
  return true;
}
function openSearch(){
  searchOpen=true;tidy();
  requestAnimationFrame(()=>{const el=$('v81S');el?.scrollIntoView({behavior:'smooth',block:'center'});el?.focus()});
}
function patchApi(){
  if(apiPatched||!window.IFSI_V81?.showHub)return false;
  const old=window.IFSI_V81.showHub;
  window.IFSI_V81.showHub=function(){const out=old.apply(this,arguments);requestAnimationFrame(()=>{tidy();installObserver()});return out};
  window.IFSI_V81.version=V;window.IFSI_V81.__v828=true;apiPatched=true;return true;
}
function installObserver(){
  if(observed)return;const body=$('v81Body');if(!body)return;
  new MutationObserver(()=>requestAnimationFrame(tidy)).observe(body,{childList:true});observed=true;
}
function init(){css();patchShow();patchApi();tidy();installObserver();return !!window.IFSI_V81&&!!$('v81Body')}
let tries=0;const t=setInterval(()=>{tries++;if(init()||tries>200)clearInterval(t)},80);
window.IFSI_V828={version:V,apply:tidy,openSearch};
})();