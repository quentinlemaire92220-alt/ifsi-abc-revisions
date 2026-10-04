(()=>{'use strict';
const V='8.10',$=id=>document.getElementById(id);
const K={dark:'ifsiabc_v72_dark',timer:'ifsiabc_v72_timer',analytics:'ifsiabc_analytics_optout_v1'};
function css(){if($('v87css'))return;const s=document.createElement('style');s.id='v87css';s.textContent=`
#v87Nav{position:fixed;left:50%;transform:translateX(-50%);bottom:8px;z-index:90;width:min(680px,calc(100% - 20px));display:grid;grid-template-columns:repeat(5,1fr);gap:2px;padding:8px;border:1px solid var(--line);border-radius:22px;background:color-mix(in srgb,var(--card) 94%,transparent);box-shadow:0 10px 30px rgba(36,26,65,.12);backdrop-filter:blur(12px)}
#v87Nav button{border:0;background:transparent;color:var(--muted);padding:7px 3px;border-radius:14px;font-size:11px;line-height:1.15;cursor:pointer;min-width:0}
#v87Nav button span{display:block;font-size:18px;margin-bottom:3px}
#v87Nav button.on{background:#f1ebff;color:#6941c6;font-weight:850}
body.v72-dark #v87Nav button.on{background:#3a3150;color:#ddd0ff}
body.v87-ready nav:not(#v87Nav){display:none!important}
#settings87{padding-bottom:92px}
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
.v87-ver{font-size:24px;font-weight:900;color:#6941c6}.v87-log{margin-top:10px}.v87-log details{border-top:1px solid var(--line);padding:9px 0}.v87-log details:first-child{border-top:0}.v87-log summary{cursor:pointer;font-weight:800}.v87-log .small{line-height:1.55;margin-top:6px}
@media(max-width:680px){.v87-grid{grid-template-columns:1fr}.v87-card{padding:13px}#v87Nav{width:calc(100% - 16px);bottom:7px}.v87-actions{grid-template-columns:1fr}#v87Nav button{font-size:10px}}
`;document.head.appendChild(s)}
function oldNav(){return document.querySelector('.app>nav:not(#v87Nav)')}
function addSection(){if($('settings87'))return;const app=document.querySelector('.app');if(!app)return;const sec=document.createElement('section');sec.id='settings87';sec.className='hidden';sec.innerHTML=`
<div class="v87-head"><div class="small">APPLICATION</div><h2>⚙️ Paramètres</h2><div class="small">Affichage, QCM, données, confidentialité et journal des versions.</div></div>
<div class="v87-grid">
 <div class="v87-card"><h3>🎨 Apparence & QCM</h3><p>Réglages enregistrés uniquement sur cet appareil.</p>
  <div class="v87-setting"><span><b>Mode sombre</b><small>Réduire la luminosité de l’interface</small></span><button id="v87Dark" class="v87-switch" aria-label="Mode sombre"></button></div>
  <div class="v87-setting"><span><b>Chronomètre QCM</b><small>Afficher le temps pendant les séries</small></span><button id="v87Timer" class="v87-switch" aria-label="Chronomètre QCM"></button></div>
 </div>
 <div class="v87-card"><h3>💾 Données & export</h3><p>Exporter tes résultats ou sauvegarder les données locales de l’application.</p>
  <div class="v87-actions"><button id="v87ExportResults" class="btn outline">Exporter mes résultats</button><button id="v87ExportBackup" class="btn outline">Sauvegarde complète</button></div>
 </div>
 <div class="v87-card"><h3>🔒 Confidentialité</h3><p>Les statistiques d’usage sont anonymes et ne contiennent ni nom, ni email, ni score individuel.</p>
  <div class="v87-setting"><span><b>Statistiques anonymes</b><small id="v87AnalyticsText"></small></span><button id="v87Analytics" class="v87-switch" aria-label="Statistiques anonymes"></button></div>
 </div>
 <div class="v87-card"><h3>📱 Application</h3><p>Version installée, mise à jour et informations techniques.</p>
  <div class="v87-about"><div><div class="small">Version actuelle</div><div class="v87-ver">V8.10</div></div><button id="v87Update" class="btn primary">↻ Vérifier</button></div>
  <div class="v87-actions" style="margin-top:10px"><button id="v87Improve" class="btn outline">💡 Proposer une amélioration</button><button id="v87Reload" class="btn outline">⟳ Recharger l’application</button></div>
 </div>
</div>
<div class="v87-card" style="margin-top:10px"><h3>🧾 Journal des versions</h3><p>Historique des principales évolutions de l’application.</p><div id="v87Log" class="v87-log"></div></div>`;
app.insertBefore(sec,oldNav()||null)}
function addNav(){if($('v87Nav'))return;const app=document.querySelector('.app');if(!app)return;const n=document.createElement('nav');n.id='v87Nav';n.innerHTML=`
<button id="v87Home"><span>⌂</span>Accueil</button>
<button id="v87Courses"><span>📚</span>Cours</button>
<button id="v87Anat"><span>🫀</span>Anatomie</button>
<button id="v87Center"><span>🚀</span>Révision</button>
<button id="v87Settings"><span>⚙️</span>Paramètres</button>`;app.appendChild(n);
$('v87Home').onclick=()=>window.show?.('home');
$('v87Courses').onclick=()=>window.showCourses74?.();
$('v87Anat').onclick=()=>window.IFSI_V82?.showAnatomy?.();
$('v87Center').onclick=()=>window.IFSI_V81?.showHub?.();
$('v87Settings').onclick=showSettings}
function hideSettings(){const s=$('settings87');if(s&&!s.classList.contains('hidden'))s.classList.add('hidden')}
function patchNavigation(){if(window.__v87navpatch)return;window.__v87navpatch=1;
 if(typeof window.show==='function'){const f=window.show;window.show=function(){hideSettings();const r=f.apply(this,arguments);setTimeout(active,0);return r}}
 if(typeof window.showCourses74==='function'){const f=window.showCourses74;window.showCourses74=function(){hideSettings();const r=f.apply(this,arguments);setTimeout(active,0);return r}}
 if(window.IFSI_V82?.showAnatomy){const f=window.IFSI_V82.showAnatomy;window.IFSI_V82.showAnatomy=function(){hideSettings();const r=f.apply(this,arguments);setTimeout(active,0);return r}}
 if(window.IFSI_V81?.showHub){const f=window.IFSI_V81.showHub;window.IFSI_V81.showHub=function(){hideSettings();const r=f.apply(this,arguments);setTimeout(active,0);return r}}
}
function showSettings(){window.show?.('home');$('home')?.classList.add('hidden');['courses74','course74','vocals','v81Hub','anatomy82','anatomy83'].forEach(id=>$(id)?.classList.add('hidden'));$('settings87')?.classList.remove('hidden');render();active();window.scrollTo({top:0,behavior:'smooth'})}
function switchState(id,on){$(id)?.classList.toggle('on',!!on);$(id)?.setAttribute('aria-pressed',on?'true':'false')}
function download(name,obj){const a=document.createElement('a'),b=new Blob([JSON.stringify(obj,null,2)],{type:'application/json'});a.href=URL.createObjectURL(b);a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),500)}
function backup(){const data={version:V,exportedAt:new Date().toISOString(),localStorage:{}};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith('ifsiabc_'))data.localStorage[k]=localStorage.getItem(k)}download('IFSI_ABC_sauvegarde_V8.10.json',data)}
function versionLog(){const box=$('v87Log');if(!box)return;const src=$('v742Changelog')?.querySelector('details .small');if(src){box.innerHTML=src.innerHTML;return}box.innerHTML='<details open><summary>V8.8 — Ressources auditées</summary><div class="small">Catalogue dédoublonné, rattachements explicites et noms d’affichage normalisés.</div></details>'}
function render(){switchState('v87Dark',localStorage.getItem(K.dark)==='1');switchState('v87Timer',localStorage.getItem(K.timer)==='1');const on=window.IFSI_V77?.enabled?.()??localStorage.getItem(K.analytics)!=='1';switchState('v87Analytics',on);if($('v87AnalyticsText'))$('v87AnalyticsText').textContent=on?'Activées sur cet appareil':'Désactivées sur cet appareil';versionLog()}
function bind(){
 $('v87Dark').onclick=()=>{const on=localStorage.getItem(K.dark)!=='1';localStorage.setItem(K.dark,on?'1':'0');document.body.classList.toggle('v72-dark',on);render()};
 $('v87Timer').onclick=()=>{const on=localStorage.getItem(K.timer)!=='1';localStorage.setItem(K.timer,on?'1':'0');render()};
 $('v87Analytics').onclick=()=>{const on=!(window.IFSI_V77?.enabled?.()??localStorage.getItem(K.analytics)!=='1');window.IFSI_V77?.setEnabled?.(on);if(!window.IFSI_V77?.setEnabled)localStorage.setItem(K.analytics,on?'0':'1');render()};
 $('v87ExportResults').onclick=()=>{if(typeof window.exportStats==='function')window.exportStats();else{const x=typeof window.st==='function'?window.st():{};download('IFSI_ABC_resultats.json',x)}};
 $('v87ExportBackup').onclick=backup;
 $('v87Update').onclick=async()=>{const b=$('v87Update');b.textContent='Vérification…';try{const r=await navigator.serviceWorker.getRegistration();if(r){await r.update();b.textContent='À jour ✓'}else b.textContent='Non installée'}catch{b.textContent='Réessayer'}setTimeout(()=>b.textContent='↻ Vérifier',1800)};
 $('v87Reload').onclick=()=>location.reload();
 $('v87Improve').onclick=()=>{const b=$('v72SuggestBtn')||[...document.querySelectorAll('button')].find(x=>/Proposer une amélioration/i.test(x.textContent));if(b)b.click();else alert('Le formulaire d’amélioration est indisponible pour le moment.')};
}
function active(){const ids=['v87Home','v87Courses','v87Anat','v87Center','v87Settings'];ids.forEach(id=>$(id)?.classList.remove('on'));if(!$('settings87')?.classList.contains('hidden'))return $('v87Settings')?.classList.add('on');if(!$('anatomy82')?.classList.contains('hidden')||!$('anatomy83')?.classList.contains('hidden'))return $('v87Anat')?.classList.add('on');if(!$('v81Hub')?.classList.contains('hidden'))return $('v87Center')?.classList.add('on');if(!$('courses74')?.classList.contains('hidden')||!$('course74')?.classList.contains('hidden'))return $('v87Courses')?.classList.add('on');$('v87Home')?.classList.add('on')}
function init(){css();addSection();addNav();patchNavigation();if(!$('v87Dark')?.dataset.bound){bind();$('v87Dark').dataset.bound='1'}document.body.classList.add('v87-ready');render();active();return !!window.IFSI_V82&&!!window.IFSI_V81&&!!window.IFSI_V77}
let tries=0;const t=setInterval(()=>{tries++;if(init()||tries>240)clearInterval(t)},100);
window.addEventListener('storage',()=>requestAnimationFrame(render));
window.IFSI_V87={version:V,showSettings,render};
})();