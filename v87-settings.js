(()=>{'use strict';
const V=window.IFSI_APP_VERSION||'8.30.4',$=id=>document.getElementById(id);
const K={dark:'ifsiabc_v72_dark',timer:'ifsiabc_v72_timer',analytics:'ifsiabc_analytics_optout_v1'};
function css(){if($('v87css'))return;const s=document.createElement('style');s.id='v87css';s.textContent=`
#v87Nav{position:fixed;left:50%;transform:translateX(-50%);bottom:8px;z-index:90;width:min(760px,calc(100% - 20px));display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:2px;padding:8px;border:1px solid var(--line);border-radius:22px;background:color-mix(in srgb,var(--card) 94%,transparent);box-shadow:0 10px 30px rgba(36,26,65,.12);backdrop-filter:blur(12px)}
#v87Nav button{border:0;background:transparent;color:var(--muted);padding:7px 2px;border-radius:14px;font-size:10px;line-height:1.15;cursor:pointer;min-width:0;overflow-wrap:anywhere}
#v87Nav button span{display:block;font-size:18px;margin-bottom:3px}
#v87Nav button.on{background:#f1ebff;color:#6941c6;font-weight:850}
body.v72-dark #v87Nav button.on{background:#3a3150;color:#ddd0ff}
body.v87-ready nav:not(#v87Nav){display:none!important}
#settings87{padding-bottom:145px}
.v87-head{border:1px solid #d9cfee;background:linear-gradient(135deg,#f7f3ff,#eefaf8);border-radius:22px;padding:16px;margin-bottom:12px}
.v87-head h2{margin:0 0 4px}.v87-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px}
.v87-card{border:1px solid var(--line);background:var(--card);border-radius:18px;padding:14px}
.v87-card h3{margin:0 0 4px;font-size:17px}.v87-card>p{margin:0 0 10px;color:var(--muted);font-size:12px;line-height:1.4}
.v87-setting{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 0;border-top:1px solid var(--line)}
.v87-setting:first-of-type{border-top:0}.v87-setting b{display:block;font-size:14px}.v87-setting small{display:block;color:var(--muted);margin-top:2px;font-size:11px}
.v87-switch{width:46px;height:27px;border-radius:999px;background:#d9d4e1;position:relative;flex:0 0 auto;cursor:pointer;border:0}
.v87-switch:after{content:'';position:absolute;width:21px;height:21px;left:3px;top:3px;border-radius:50%;background:#fff;box-shadow:0 2px 6px rgba(0,0,0,.18);transition:.18s}
.v87-switch.on{background:#7046d9}.v87-switch.on:after{left:22px}
.v87-actions{display:grid;grid-template-columns:1fr 1fr;gap:8px}.v87-actions .btn{width:100%}
.v87-about{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:center;border-top:1px solid var(--line);padding-top:12px;margin-top:10px}
.v87-ver{font-size:24px;font-weight:900;color:#6941c6}.v87-versiongrid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:10px}.v87-versionbox{border:1px solid var(--line);border-radius:12px;padding:9px;background:var(--card)}.v87-versionbox b{display:block;font-size:15px;margin-top:2px}.v87-log{margin-top:10px}.v87-log details[hidden]{display:none!important}.v87-log details{border-top:1px solid var(--line);padding:9px 0}.v87-log details:first-child{border-top:0}.v87-log summary{cursor:pointer;font-weight:800}.v87-log .small{line-height:1.55;margin-top:6px}

#settings87{padding-bottom:calc(170px + env(safe-area-inset-bottom,0px))}
#settings87 .v87-head{background:var(--card);border-color:var(--line);color:var(--ink);padding:13px 15px;border-radius:16px}
#settings87 .v87-head h2,#settings87 .v87-head .small{color:var(--ink)}
#settings87 .v87-head .small{opacity:.75}
#settings87 .v87-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:9px}
#settings87 .v87-card{min-width:0;padding:13px;border-radius:16px}
#settings87 .v87-card h3{font-size:16px;margin-bottom:8px}
#settings87 .v87-card>p{margin-bottom:8px}
#settings87 .v87-preferences{grid-column:1/-1}
#settings87 .v87-preferences .v87-setting{padding:8px 0}
#settings87 .v87-preferences .v87-setting:first-of-type{border:0}
#settings87 .v87-footnote{font-size:11px;color:var(--muted);margin:7px 0 0;line-height:1.45}
#settings87 .v87-versionline{font-size:12px;color:var(--muted);display:flex;gap:10px;flex-wrap:wrap;align-items:center;margin:7px 0}
#settings87 .v87-versionline b{color:var(--ink)}
#settings87 .v87-actions .btn{font-size:12px;padding:9px 8px;min-height:40px}
#settings87 .v87-inline-actions{display:flex;gap:7px;flex-wrap:wrap}
#settings87 .v87-inline-actions .btn{flex:1 1 150px}
#settings87 .v87-expand{margin-top:9px}
#settings87 .v87-expand summary,#v821AuditCard>summary{cursor:pointer;font-weight:800;padding:2px 0;line-height:1.5;color:var(--ink)}
#settings87 .v87-expand[open]>summary,#v821AuditCard[open]>summary{margin-bottom:11px}
#settings87 .v87-expand .v87-actions{margin-top:8px}
#settings87 .v87-card .v87-mini-status{font-size:11px;line-height:1.45;margin:7px 0;color:var(--muted)}
#v821AuditCard{margin-top:9px;scroll-margin-top:16px}
#v821AuditCard .v821-counts{grid-template-columns:repeat(4,minmax(0,1fr))}
@media(max-width:680px){
 #settings87 .v87-grid{grid-template-columns:1fr}
 #settings87 .v87-card{padding:12px}
 #settings87 .v87-actions{grid-template-columns:repeat(2,minmax(0,1fr))}
 #settings87 .v87-actions .btn{overflow-wrap:anywhere}
 #v821AuditCard .v821-counts{grid-template-columns:repeat(2,minmax(0,1fr))}
}
@media(max-width:680px){.v87-grid{grid-template-columns:1fr}.v87-card{padding:13px}#v87Nav{width:calc(100% - 16px);bottom:7px}.v87-actions{grid-template-columns:1fr}#v87Nav button{font-size:9px;padding:7px 1px}}
`;document.head.appendChild(s)}
function oldNav(){return document.querySelector('.app>nav:not(#v87Nav)')}
function addSection(){if($('settings87'))return;const app=document.querySelector('.app');if(!app)return;const sec=document.createElement('section');sec.id='settings87';sec.className='hidden';sec.innerHTML=`
<div class="v87-head"><h2>⚙️ Paramètres</h2><div class="small">Préférences, données et administration.</div></div>
<div class="v87-grid">
 <div class="v87-card v87-preferences"><h3>🎨 Préférences</h3>
  <div class="v87-setting"><span><b>Mode sombre</b><small>Réduire la luminosité de l’interface</small></span><button id="v87Dark" class="v87-switch" aria-label="Mode sombre"></button></div>
  <div class="v87-setting"><span><b>Chronomètre QCM</b><small>Afficher le temps pendant les séries</small></span><button id="v87Timer" class="v87-switch" aria-label="Chronomètre QCM"></button></div>
  <div class="v87-setting"><span><b>Statistiques anonymes</b><small id="v87AnalyticsText"></small></span><button id="v87Analytics" class="v87-switch" aria-label="Statistiques anonymes"></button></div>
  <p class="v87-footnote">Réglages locaux. Les statistiques anonymes ne contiennent ni nom, ni email, ni score individuel.</p>
 </div>
 <div class="v87-card"><h3>📱 Application</h3>
  <div class="v87-versionline"><span>Installée : <b id="v87Installed">V${V}</b></span><span>Serveur : <b id="v87Server">…</b></span><span>Build : <b id="v87Build">…</b></span></div>
  <button id="v87Update" class="btn primary full" type="button">↻ Vérifier les mises à jour</button>
  <div id="v87UpdateStatus" class="v87-mini-status" role="status">Vérification de version à l’ouverture.</div>
  <details class="v87-expand"><summary>Maintenance et autres actions</summary>
    <div class="v87-actions"><button id="v87ForceUpdate" class="btn outline" type="button">⚡ Forcer la mise à jour</button><button id="v87Reload" class="btn outline" type="button">⟳ Recharger l’application</button><button id="v87Improve" class="btn outline" type="button">💡 Proposer une amélioration</button></div>
  </details>
 </div>
 <div class="v87-card"><h3>🗂️ Gestion pédagogique</h3>
  <div class="v87-inline-actions"><button id="v87Followup" class="btn outline" type="button">Suivi des cours →</button><button id="v87AuditOpen" class="btn outline" type="button">Contrôle qualité →</button></div>
  <p class="v87-footnote">Le diagnostic complet se lance uniquement à ta demande, sans scan Drive en direct.</p>
 </div>
 <div class="v87-card"><h3>📣 Nouveautés</h3>
  <button id="v87Whatsapp" class="btn outline full" type="button">💬 Préparer l’annonce WhatsApp</button>
 </div>
</div>
<details id="v87DataPanel" class="v87-card v87-expand"><summary>💾 Données et sauvegardes</summary>
 <p>Exporter tes résultats ou sauvegarder les données locales de l’application.</p>
 <div class="v87-actions"><button id="v87ExportResults" class="btn outline" type="button">Exporter mes résultats</button><button id="v87ExportBackup" class="btn outline" type="button">Sauvegarde complète</button></div>
</details>
<details id="v87LogDisclosure" class="v87-card v87-expand"><summary>🧾 Journal des évolutions</summary>
 <p>Historique UX/UI, technique et correctifs de l’application.</p><div id="v87Log" class="v87-log"></div>
</details>`;
app.insertBefore(sec,oldNav()||null)}
function addNav(){if($('v87Nav'))return;const app=document.querySelector('.app');if(!app)return;const n=document.createElement('nav');n.id='v87Nav';n.innerHTML=`
<button id="v87Home"><span>⌂</span>Accueil</button>
<button id="v87Courses"><span>📚</span>Cours</button>
<button id="v87Anat"><span>🫀</span>Anatomie</button>
<button id="v87Center"><span>🚀</span>Révision</button>
${window.IFSI_APP_FEATURES?.pathologies===true?'<button id="v87Pathologies" aria-label="Ouvrir les pathologies"><span>🩺</span>Pathologies</button>':''}
<button id="v87Settings"><span>⚙️</span>Paramètres</button>`;app.appendChild(n);
$('v87Home').onclick=()=>window.show?.('home');
$('v87Courses').onclick=()=>window.showCourses74?.();
$('v87Anat').onclick=()=>window.IFSI_V82?.showAnatomy?.();
$('v87Center').onclick=()=>window.IFSI_V81?.showHub?.();
if($('v87Pathologies'))$('v87Pathologies').onclick=()=>window.IFSI_PATHOLOGIES?.open?.();
n.style.gridTemplateColumns='repeat('+(window.IFSI_APP_FEATURES?.pathologies===true?6:5)+',minmax(0,1fr))';
$('v87Settings').onclick=showSettings}
function hideSettings(){const s=$('settings87');if(s&&!s.classList.contains('hidden'))s.classList.add('hidden')}
function patchNavigation(){if(window.__v87navpatch)return;window.__v87navpatch=1;
 if(typeof window.show==='function'){const f=window.show;window.show=function(){hideSettings();const r=f.apply(this,arguments);setTimeout(active,0);return r}}
 if(typeof window.showCourses74==='function'){const f=window.showCourses74;window.showCourses74=function(){hideSettings();const r=f.apply(this,arguments);setTimeout(active,0);return r}}
 if(window.IFSI_V82?.showAnatomy){const f=window.IFSI_V82.showAnatomy;window.IFSI_V82.showAnatomy=function(){hideSettings();const r=f.apply(this,arguments);setTimeout(active,0);return r}}
 if(window.IFSI_V81?.showHub){const f=window.IFSI_V81.showHub;window.IFSI_V81.showHub=function(){hideSettings();const r=f.apply(this,arguments);setTimeout(active,0);return r}}
}
function showSettings(){window.show?.('home');$('home')?.classList.add('hidden');['courses74','course74','vocals','v81Hub','anatomy82','anatomy83','v814RespAtlas','v815UrinaryAtlas','v816EndocrineAtlas','v817ImmuneAtlas','v822NervousAtlas','v823CardiovascularAtlas','v824DigestiveAtlas','v829LocomotorAtlas','courseFollowup'].forEach(id=>$(id)?.classList.add('hidden'));$('settings87')?.classList.remove('hidden');render();active();window.scrollTo({top:0,behavior:'smooth'})}
function switchState(id,on){$(id)?.classList.toggle('on',!!on);$(id)?.setAttribute('aria-pressed',on?'true':'false')}
function download(name,obj){const a=document.createElement('a'),b=new Blob([JSON.stringify(obj,null,2)],{type:'application/json'});a.href=URL.createObjectURL(b);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)}
function backup(){const data={version:V,exportedAt:new Date().toISOString(),localStorage:{}};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith('ifsiabc_'))data.localStorage[k]=localStorage.getItem(k)}download(`IFSI_ABC_sauvegarde_V${V}.json`,data)}
function esc87(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function versionLog(){
 const box=$('v87Log');if(!box)return;
 const appEntries=window.IFSI_V8312?.appEntries?.()||[];
 if(appEntries.length){box.innerHTML=appEntries.map((x,i)=>`<details class="v87-history-entry" ${i===0?'open':''} ${i>=5?'hidden':''}><summary>${esc87(String(x.title||'').replace(/Date non renseignée/gi,'').trim())}</summary><div class="small">${esc87(x.copy||'Évolution de l’application.')}</div></details>`).join('')+(appEntries.length>5?'<button type="button" id="v87HistoryMore" class="btn outline" style="width:100%;margin-top:10px">Voir tout l’historique ('+appEntries.length+')</button>':'');const more=$('v87HistoryMore');if(more)more.onclick=()=>{const hidden=box.querySelectorAll('.v87-history-entry[hidden]');const expand=hidden.length>0;box.querySelectorAll('.v87-history-entry').forEach((el,i)=>{if(i>=5)el.hidden=!expand});more.textContent=expand?'Réduire l’historique':'Voir tout l’historique ('+appEntries.length+')'};return}
 const src=$('v742Changelog')?.querySelector('details .small');
 if(src){
   const spans=[...src.querySelectorAll(':scope > span[id$="Change"]')].filter(x=>/audit|correct|navigation|interface|mise à jour|service worker|ergonomie|révision|écran|technique|synchronis|cache|paramètres|fiabilis|refonte|simplifi|réorganis/i.test(x.textContent));
   if(spans.length){box.innerHTML=spans.map((x,i)=>{const title=x.querySelector('b')?.textContent?.trim()||'Évolution';const copy=x.textContent.replace(title,'').trim();return `<details ${i===0?'open':''}><summary>${esc87(title)}</summary><div class="small">${esc87(copy)}</div></details>`}).join('');return}
 }
 box.innerHTML='<div class="small">Aucune évolution technique enregistrée.</div>'
}
async function remoteMeta(){const r=await fetch('./build-meta.json?t='+Date.now(),{cache:'no-store'});if(!r.ok)throw new Error('version');return r.json()}
async function refreshVersionState(){try{const m=await remoteMeta();if($('v87Server'))$('v87Server').textContent='V'+(m.version||'?');if($('v87Build'))$('v87Build').textContent=m.build||'?';if($('v87Installed'))$('v87Installed').textContent='V'+(window.IFSI_APP_VERSION||V);if($('v87UpdateStatus'))$('v87UpdateStatus').textContent=(m.version===(window.IFSI_APP_VERSION||V))?'Application synchronisée avec le serveur.':'Une version plus récente est disponible.';return m}catch{if($('v87UpdateStatus'))$('v87UpdateStatus').textContent='Impossible de lire la version serveur.';return null}}
async function updateWorker(){const reg=await navigator.serviceWorker?.getRegistration?.();if(reg)await reg.update();return reg}
async function forceUpdate(){const b=$('v87ForceUpdate');if(b){b.disabled=true;b.textContent='Nettoyage…'}try{await updateWorker();if(window.caches){const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('ifsi-abc-')).map(k=>caches.delete(k)))}const reg=await navigator.serviceWorker?.getRegistration?.();if(reg?.waiting)reg.waiting.postMessage?.({type:'SKIP_WAITING'});if($('v87UpdateStatus'))$('v87UpdateStatus').textContent='Cache applicatif nettoyé • rechargement…';setTimeout(()=>location.replace(location.pathname+'?refresh='+Date.now()),350)}catch{if(b){b.disabled=false;b.textContent='⚡ Forcer la mise à jour'}if($('v87UpdateStatus'))$('v87UpdateStatus').textContent='Mise à jour forcée impossible.'}}
function latestResourceAnnouncement(){
 const entries=window.IFSI_V8312?.resourceEntries?.()||[],x=entries[0];if(!x)return '';
 const label=String(x.title||'Nouvelle ressource').replace(/^V\d+\.\d+(?:\.\d+)?\s*[—-]\s*/,'').trim();
 const lines=['📚 *Nouvelle ressource IFSI ABC Révisions*','',`*${label}*`];
 if(x.copy)lines.push(x.copy);if(x.date)lines.push('📅 '+x.date);
 const appUrl=/^https?:$/.test(location.protocol)?location.origin+location.pathname:'';
 lines.push('',appUrl?'À retrouver dans l’application : '+appUrl:'À retrouver dans l’application.');
 return lines.join('\n');
}
function shareLatestResourceWhatsapp(){
 const message=latestResourceAnnouncement();if(!message)return alert('Aucune ressource récente à partager.');
 const a=document.createElement('a');a.href='https://wa.me/?text='+encodeURIComponent(message);a.target='_blank';a.rel='noopener noreferrer';document.body.appendChild(a);a.click();a.remove();
}
function render(){switchState('v87Dark',localStorage.getItem(K.dark)==='1');switchState('v87Timer',localStorage.getItem(K.timer)==='1');const on=window.IFSI_V77?.enabled?.()??localStorage.getItem(K.analytics)!=='1';switchState('v87Analytics',on);if($('v87AnalyticsText'))$('v87AnalyticsText').textContent=on?'Activées sur cet appareil':'Désactivées sur cet appareil';if(!$('v87Server')?.dataset.checked){$('v87Server').dataset.checked='1';refreshVersionState()}}
function bind(){
 $('v87Dark').onclick=()=>{const on=localStorage.getItem(K.dark)!=='1';localStorage.setItem(K.dark,on?'1':'0');document.body.classList.toggle('v72-dark',on);render()};
 $('v87Timer').onclick=()=>{const on=localStorage.getItem(K.timer)!=='1';localStorage.setItem(K.timer,on?'1':'0');render()};
 $('v87Analytics').onclick=()=>{const on=!(window.IFSI_V77?.enabled?.()??localStorage.getItem(K.analytics)!=='1');window.IFSI_V77?.setEnabled?.(on);if(!window.IFSI_V77?.setEnabled)localStorage.setItem(K.analytics,on?'0':'1');render()};
 $('v87ExportResults').onclick=()=>{if(typeof window.exportStats==='function')window.exportStats();else{const x=typeof window.st==='function'?window.st():{};download('IFSI_ABC_resultats.json',x)}};
 $('v87ExportBackup').onclick=backup;
 $('v87Whatsapp').onclick=shareLatestResourceWhatsapp;
 $('v87Followup').onclick=()=>window.IFSI_COURSE_FOLLOWUP?.show?.();
 $('v87AuditOpen').onclick=()=>{const panel=$('v821AuditCard');if(!panel)return alert('Le contrôle qualité est indisponible.');panel.open=true;panel.scrollIntoView({block:'start',behavior:'smooth'})};
 $('v87LogDisclosure').addEventListener('toggle',e=>{if(e.target.open)versionLog()});
 $('v87Update').onclick=async()=>{const b=$('v87Update');b.textContent='Vérification…';try{const remote=await refreshVersionState();await updateWorker();const installed=window.IFSI_APP_VERSION||V;if(remote?.version&&remote.version!==installed){b.textContent=`V${remote.version} disponible`;if($('v87UpdateStatus'))$('v87UpdateStatus').textContent='Nouvelle version détectée. Utilise « Forcer la mise à jour » si le rechargement ne suffit pas.'}else b.textContent='À jour ✓'}catch{b.textContent='Réessayer'}setTimeout(()=>{if(b.textContent==='À jour ✓')b.textContent='↻ Vérifier les mises à jour'},1800)};
 $('v87ForceUpdate').onclick=forceUpdate;
 $('v87Reload').onclick=()=>location.reload();
 $('v87Improve').onclick=()=>{const b=$('v72SuggestBtn')||[...document.querySelectorAll('button')].find(x=>x.id!=='v87Improve'&&x.id!=='v86Improve'&&/Proposer une amélioration/i.test(x.textContent));if(b)b.click();else alert('Le formulaire d’amélioration est indisponible pour le moment.')};
}
function active(){const ids=['v87Home','v87Courses','v87Anat','v87Center','v87Pathologies','v87Settings'];ids.forEach(id=>$(id)?.classList.remove('on'));if(!$('settings87')?.classList.contains('hidden')||!$('courseFollowup')?.classList.contains('hidden'))return $('v87Settings')?.classList.add('on');const anatomyIds=['anatomy82','anatomy83','v814RespAtlas','v815UrinaryAtlas','v816EndocrineAtlas','v817ImmuneAtlas','v822NervousAtlas','v823CardiovascularAtlas','v824DigestiveAtlas','v829LocomotorAtlas'];if(anatomyIds.some(id=>$(id)&&!$(id).classList.contains('hidden')))return $('v87Anat')?.classList.add('on');if($('ifsiPathologies')&&!$('ifsiPathologies').classList.contains('hidden'))return $('v87Pathologies')?.classList.add('on');if(!$('v81Hub')?.classList.contains('hidden'))return $('v87Center')?.classList.add('on');if(!$('courses74')?.classList.contains('hidden')||!$('course74')?.classList.contains('hidden'))return $('v87Courses')?.classList.add('on');$('v87Home')?.classList.add('on')}
function init(){css();addSection();addNav();patchNavigation();if(!$('v87Dark')?.dataset.bound){bind();$('v87Dark').dataset.bound='1'}document.body.classList.add('v87-ready');render();active();return !!window.IFSI_V82&&!!window.IFSI_V81&&!!window.IFSI_V77}
let tries=0;const t=setInterval(()=>{tries++;if(init()||tries>240)clearInterval(t)},100);
window.addEventListener('storage',()=>requestAnimationFrame(render));
window.IFSI_V87={version:V,showSettings,render};
})();