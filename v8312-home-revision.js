(()=>{'use strict';
const V=window.IFSI_APP_VERSION||'8.30.68',$=id=>document.getElementById(id);
const NEWS_META={
  v8368Change:{type:'app',badges:['CORRECTIF']},
  v8367Change:{type:'app',badges:['CORRECTIF']},
  v8366Change:{type:'app',badges:['CORRECTIF']},
  v8365Change:{type:'app',badges:['CORRECTIF']},
  v8338Change:{type:'app',badges:['UX/UI']},
  v8339Change:{type:'app',badges:['UX/UI']},
  v8364Change:{type:'app',badges:['CORRECTIF']},
  v8363Change:{type:'app',badges:['CORRECTIF']},
  v8362Change:{type:'app',badges:['CORRECTIF']},
  v8361Change:{type:'app',badges:['CORRECTIF']},
  v8360Change:{type:'app',badges:['CORRECTIF']},
  v8359Change:{type:'resource',badges:['RESSOURCE']},
  v8358Change:{type:'app',badges:['UX/UI','RESSOURCE']},
  v8357Change:{type:'app',badges:['UX/UI','CORRECTIF']},
  v8356Change:{type:'app',badges:['UX/UI','RESSOURCE']},
  v8355Change:{type:'app',badges:['UX/UI','RESSOURCE']},
  v8354Change:{type:'resource',badges:['RESSOURCE']},
  v8353Change:{type:'resource',badges:['RESSOURCE']},
  v8337Change:{type:'resource',badges:['RESSOURCE']},
  v8334Change:{type:'app',badges:['UX/UI']},
  v8331Change:{type:'app',badges:['TECHNIQUE','CORRECTIF']},
  v8330Change:{type:'app',badges:['UX/UI']},
  v8329Change:{type:'app',badges:['UX/UI','CORRECTIF']},
  v8326Change:{type:'resource',badges:['RESSOURCE']},
  v8325Change:{type:'app',badges:['TECHNIQUE','CORRECTIF']},
  v8324Change:{type:'app',badges:['UX/UI']},
  v8322Change:{type:'app',badges:['UX/UI']},
  v8321Change:{type:'resource',badges:['RESSOURCE']},
  v8320Change:{type:'app',badges:['CORRECTIF']},
  v8319Change:{type:'app',badges:['CORRECTIF']},
  v8318Change:{type:'resource',badges:['RESSOURCE']},
  v8317Change:{type:'app',badges:['TECHNIQUE','CORRECTIF']},
  v8316Change:{type:'resource',badges:['RESSOURCE']},
  v8315Change:{type:'app',badges:['TECHNIQUE','CORRECTIF']},
  v8314Change:{type:'app',badges:['UX/UI','CORRECTIF']},
  v8313Change:{type:'app',badges:['UX/UI']},
  v8312Change:{type:'app',badges:['UX/UI','TECHNIQUE']},
  v8311Change:{type:'resource',badges:['RESSOURCE']},
  v8310Change:{type:'app',badges:['TECHNIQUE']},
  v8309Change:{type:'app',badges:['UX/UI']},
  v8308Change:{type:'resource',badges:['RESSOURCE']},
  v8307Change:{type:'app',badges:['UX/UI','CORRECTIF']},
  v8306Change:{type:'resource',badges:['RESSOURCE']},
  v8305Change:{type:'resource',badges:['RESSOURCE']},
  v8304Change:{type:'app',badges:['CORRECTIF']}
};
const VERSION_DATES={
  '8.30.67':'10/10/2026',
  '8.30.68':'10/10/2026',
  '8.30.64':'10/10/2026',
  '8.30.65':'10/10/2026',
  '8.30.66':'09/10/2026',
  '8.30.67':'10/10/2026',
  '8.30.68':'10/10/2026',
  '8.30.63':'09/10/2026','8.30.62':'09/10/2026','8.30.61':'09/10/2026','8.30.60':'09/10/2026','8.30.59':'09/10/2026',
  '8.30.58':'09/10/2026',
  '8.30.57':'09/10/2026',
  '8.30.56':'09/10/2026',
  '8.30.55':'09/10/2026','8.30.54':'08/10/2026',
  '8.30.53':'08/10/2026',
  '8.30.37':'07/10/2026',
  '8.30.34':'07/10/2026','8.30.33':'07/10/2026','8.30.32':'07/10/2026',
  '8.30.31':'07/10/2026','8.30.30':'07/10/2026','8.30.29':'07/10/2026','8.30.28':'06/10/2026','8.30.27':'06/10/2026',  '8.30.26':'06/10/2026',
  '8.30.25':'06/10/2026','8.30.24':'06/10/2026','8.30.23':'06/10/2026','8.30.22':'06/10/2026','8.30.21':'06/10/2026','8.30.20':'06/10/2026','8.30.19':'06/10/2026','8.30.18':'06/10/2026','8.30.17':'06/10/2026','8.30.16':'06/10/2026','8.30.15':'06/10/2026','8.30.14':'06/10/2026','8.30.13':'06/10/2026','8.30.12':'06/10/2026','8.30.11':'06/10/2026','8.30.10':'06/10/2026','8.30.9':'06/10/2026','8.30.8':'06/10/2026','8.30.7':'06/10/2026','8.30.6':'06/10/2026','8.30.5':'06/10/2026','8.30.4':'06/10/2026','8.30.3':'06/10/2026','8.30.2':'06/10/2026','8.30.1':'06/10/2026','8.30':'06/10/2026',
  '8.29':'05/10/2026','8.28':'05/10/2026','8.27':'05/10/2026','8.26':'05/10/2026','8.25.1':'05/10/2026','8.25':'05/10/2026','8.24':'05/10/2026','8.23.1':'05/10/2026','8.23':'05/10/2026','8.22':'05/10/2026','8.21':'05/10/2026','8.20':'05/10/2026','8.19.1':'05/10/2026','8.19':'05/10/2026','8.18':'05/10/2026','8.17':'05/10/2026','8.16':'05/10/2026','8.15.1':'05/10/2026','8.15':'05/10/2026',
  '8.14.1':'04/10/2026','8.14':'04/10/2026','8.13':'04/10/2026','8.12':'04/10/2026','8.11.4':'04/10/2026','8.11.3':'04/10/2026','8.11.2':'04/10/2026','8.11.1':'04/10/2026','8.11':'04/10/2026','8.10':'04/10/2026','8.9.1':'04/10/2026','8.9':'04/10/2026','8.8.4':'04/10/2026','8.8.3':'04/10/2026','8.8.2':'04/10/2026','8.8.1':'04/10/2026','8.8':'04/10/2026','8.7':'04/10/2026','8.6':'04/10/2026','8.5':'04/10/2026','8.4':'04/10/2026',
  '8.3':'03/10/2026','8.2':'03/10/2026','8.1':'03/10/2026','8.0':'03/10/2026','7.9':'03/10/2026','7.8':'03/10/2026','7.7':'03/10/2026','7.6':'03/10/2026','7.5':'03/10/2026'
};
let newsExpanded=false,revisionObserver=null,settingsDateObserver=null;
function css(){
  if($('v8312css'))return;
  const s=document.createElement('style');s.id='v8312css';s.textContent=`
  body.v86-home .v76-today{display:none!important}
  body.v86-home #v76Home>#v82Primary{order:1}
  body.v86-home #v76Home>#v86Tools{order:2}
  body.v86-home #v76Home>#v8303HomeExtras{order:3}
  #v8303HomeExtras{gap:12px!important}
  #v742Changelog.v8312-news{padding:16px!important}
  #v742Changelog.v8312-news>details{display:none!important}
  .v8312-news-sub{margin-top:4px;line-height:1.35}
  .v8312-news-tabs{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}
  .v8312-news-tab{border:1px solid var(--line);background:var(--card);color:var(--ink);border-radius:999px;padding:8px 11px;font-weight:800;font-size:12px;cursor:pointer}
  .v8312-news-tab.on{background:#6941c6;color:#fff;border-color:#6941c6}
  .v8312-news-list{display:grid;gap:0;margin-top:12px;border-top:1px solid var(--line)}
  .v8312-news-item{padding:13px 2px;border-bottom:1px solid var(--line)}
  .v8312-news-item-head{display:flex;align-items:center;gap:7px;flex-wrap:wrap}
  .v8312-news-item-title{font-weight:850;line-height:1.3}
  .v8312-news-copy{margin-top:6px;line-height:1.45;color:var(--muted);font-size:13px}
  .v8312-news-badge{font-size:10px;font-weight:900;border-radius:999px;padding:4px 7px;border:1px solid transparent}
  .v8312-news-badge.resource{background:#e8f8ef;color:#137443;border-color:#bce8cd}
  .v8312-news-badge.ux{background:#efe8ff;color:#6840c8;border-color:#cfbdf7}
  .v8312-news-badge.tech{background:#e9f2ff;color:#2663a8;border-color:#bed6f5}
  .v8312-news-badge.fix{background:#fff1dd;color:#9a5a00;border-color:#f0cf98}
  .v8312-news-date{font-size:11px;font-weight:750;color:var(--muted);white-space:nowrap}
  #v87Log .v8312-log-date{float:right;margin-left:10px;font-size:11px;font-weight:750;color:var(--muted);white-space:nowrap}
  .v8312-news-more{margin-top:11px;width:100%}
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
  body.v72-dark .v8312-news-tab{background:#211e2a}
  body.v72-dark #v81Body .v8312-revision-kpi{background:#282332;border-color:#4a405c}
  @media(max-width:620px){
    .v8312-news-tabs{display:grid;grid-template-columns:1fr 1fr}.v8312-news-tab:first-child{grid-column:1/-1}
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
function linesFromSpan(span){
  const lines=[''];
  span.childNodes.forEach(n=>{if(n.nodeName==='BR')lines.push('');else lines[lines.length-1]+=(n.textContent||'')});
  return lines.map(x=>x.trim()).filter(Boolean);
}
function inferMeta(id,text){
  if(NEWS_META[id])return NEWS_META[id];
  if(/\b(ajout|ajouté|ajoutée|nouveau|nouvelle|série|vocaux?|atlas|planches? anatomiques?|infographies?|fiches? de révision)\b/i.test(text))return {type:'resource',badges:['RESSOURCE']};
  if(/audit|correct|navigation|interface|mise à jour|service worker|ergonomie|révision|écran|fil d’ariane|technique|synchronis|cache|paramètres|fiabilis|refonte|simplifi|réorganis/i.test(text))return {type:'app',badges:[/correct/i.test(text)?'CORRECTIF':'TECHNIQUE']};
  return {type:'app',badges:['TECHNIQUE']};
}
function versionFromTitle(title){return title.match(/^V(\d+\.\d+(?:\.\d+)?)/)?.[1]||''}
function formatIsoDate(raw){const m=String(raw||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?`${m[3]}/${m[2]}/${m[1]}`:String(raw||'')}
function dateForTitle(title,span){return formatIsoDate(span?.dataset?.date)||VERSION_DATES[versionFromTitle(title)]||'Date non renseignée'}
function badgeHtml(label){
  const cls=label==='RESSOURCE'?'resource':label==='UX/UI'?'ux':label==='CORRECTIF'?'fix':'tech';
  return `<span class="v8312-news-badge ${cls}">${label}</span>`;
}
function pedagogicalCopy(copy){
  const technical=/\b(?:Drive|registre|cache|PWA|TNR|audit|MutationObserver|timer|courseId|arborescence|synchronis\w*|catalogue|chargement|runtime)\b/i;
  return String(copy||'').split(/(?<=[.!?])\s+/).map(x=>x.trim()).filter(x=>x&&!technical.test(x)).join(' ');
}
function newsEntries(){
  const box=$('v742Changelog');if(!box)return [];
  return [...box.querySelectorAll('details .small > span[id$="Change"]')].map(span=>{
    const lines=linesFromSpan(span),title=span.querySelector('b')?.textContent?.trim()||lines[0]||'',copy=lines.join(' ').replace(title,'').trim(),meta=inferMeta(span.id,title+' '+copy),displayCopy=meta.type==='resource'?pedagogicalCopy(copy):copy;
    return {id:span.id,title,copy:displayCopy,date:dateForTitle(title,span),type:meta.type,badges:meta.badges||[]};
  }).filter(x=>x.title);
}
function renderNews(){
  const box=$('v742Changelog');if(!box)return false;
  box.classList.add('v8312-news');
  const top=box.querySelector(':scope > .row');if(top){
    const title=top.querySelector('b');if(title)title.textContent='📚 Ressources ajoutées';
    const badge=top.querySelector('.badge');if(badge)badge.textContent='V'+V;
  }
  if(!$('v8312NewsUi')){
    const ui=document.createElement('div');ui.id='v8312NewsUi';ui.innerHTML=`<div class="small v8312-news-sub">Les dernières ressources pédagogiques ajoutées à l’application.</div><div id="v8312NewsList" class="v8312-news-list"></div><button id="v8312NewsMore" type="button" class="btn secondary v8312-news-more">Voir toutes les ressources →</button>`;
    const details=box.querySelector(':scope > details');details?.insertAdjacentElement('beforebegin',ui);
    $('v8312NewsMore').onclick=()=>{newsExpanded=!newsExpanded;drawNews()};
  }
  drawNews();return true;
}
function resourceEntries(){return newsEntries().filter(x=>x.type==='resource')}
function appEntries(){return newsEntries().filter(x=>x.type==='app').sort((a,b)=>versionFromTitle(b.title).localeCompare(versionFromTitle(a.title),'en',{numeric:true}))}
function drawNews(){
  const list=$('v8312NewsList'),more=$('v8312NewsMore');if(!list)return;
  const filtered=resourceEntries(),shown=newsExpanded?filtered:filtered.slice(0,4);
  list.innerHTML=shown.map(x=>`<article class="v8312-news-item"><div class="v8312-news-item-head"><span class="v8312-news-item-title">${escapeHtml(x.title)}</span><span class="v8312-news-date">📅 ${escapeHtml(x.date)}</span>${x.badges.map(badgeHtml).join('')}</div>${x.copy?`<div class="v8312-news-copy">${escapeHtml(x.copy)}</div>`:''}</article>`).join('')||'<div class="small" style="padding:12px 0">Aucune nouvelle ressource pour le moment.</div>';
  if(more){more.hidden=filtered.length<=4;more.textContent=newsExpanded?'Réduire les ressources ↑':'Voir toutes les ressources →'}
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
function decorateSettingsDates(){
  const box=$('v87Log');if(!box)return false;
  box.querySelectorAll('details summary').forEach(summary=>{
    if(summary.querySelector('.v8312-log-date'))return;
    const title=summary.textContent.trim(),entry=appEntries().find(x=>x.title===title);const date=entry?.date||dateForTitle(title);
    const tag=document.createElement('span');tag.className='v8312-log-date';tag.textContent='📅 '+date;summary.appendChild(tag);
  });
  return true;
}
function observeSettingsDates(){
  const box=$('v87Log');if(!box||settingsDateObserver)return;
  settingsDateObserver=new MutationObserver(()=>requestAnimationFrame(decorateSettingsDates));
  settingsDateObserver.observe(box,{childList:true,subtree:true});decorateSettingsDates();
}
function observeRevision(){
  const body=$('v81Body');if(!body||revisionObserver)return;
  revisionObserver=new MutationObserver(()=>requestAnimationFrame(revision));
  revisionObserver.observe(body,{childList:true,subtree:false});
}
function apply(){css();home();renderNews();revision();observeRevision();observeSettingsDates();decorateSettingsDates()}
function startupStable(){return !!$('v8303HomeExtras')&&!!$('v8312NewsUi')&&!!$('v8312MyRevision')&&!!$('v87Log')}
let tries=0;const timer=setInterval(()=>{tries++;apply();if(startupStable()||tries>30)clearInterval(timer)},100);
window.addEventListener('storage',()=>requestAnimationFrame(apply));
window.addEventListener('ifsi:v73-ready',()=>requestAnimationFrame(apply));
window.addEventListener('load',()=>setTimeout(apply,0));
window.IFSI_V8312={version:V,apply,renderNews,revision,resourceEntries,appEntries,dateForTitle};
})();
