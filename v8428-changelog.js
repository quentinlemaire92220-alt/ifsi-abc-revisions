(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 window.IFSI_V8426_CHANGELOG?.patch?.();
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.128';
 const entries=box.querySelector('details .small');if(!entries)return false;
 if(!document.getElementById('v8428Change')){
  const line=document.createElement('span');line.id='v8428Change';line.dataset.date='2026-10-25';
  const heading=document.createElement('b');heading.textContent='V8.30.128 — Correctif du blocage au démarrage';
  line.append(heading,document.createElement('br'));
  line.append(document.createTextNode('Retour temporaire à la navigation stable des cours après un gel au lancement. Le nouveau module d'arborescence est désactivé dans l'application. Les 55 cours, QCM, fiches et vocaux restent conservés.'));
  line.append(document.createElement('br'));entries.insertBefore(line,entries.firstChild);
 }
 return true;
}
let attempts=0;const timer=setInterval(()=>{if(patch()||++attempts>80)clearInterval(timer)},100);
window.IFSI_V8428_CHANGELOG={patch};
})();
