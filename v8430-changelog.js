(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 window.IFSI_V8429_CHANGELOG?.patch?.();
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.130';
 const entries=box.querySelector('details .small');if(!entries)return false;
 if(!document.getElementById('v8430Change')){
  const line=document.createElement('span');line.id='v8430Change';line.dataset.date='2026-10-25';
  const heading=document.createElement('b');heading.textContent='V8.30.130 — Finition graphique du parcours des cours';
  line.append(heading,document.createElement('br'));
  line.append(document.createTextNode('Titres des UE mieux espacés avec intitulé et compteurs séparés, flèches de dépliage plus visibles et boutons des fiches, infographies et vocaux plus compacts. Les contenus, QCM et la navigation restent inchangés.'));
  line.append(document.createElement('br'));entries.insertBefore(line,entries.firstChild);
 }
 return true;
}
let attempts=0;const timer=setInterval(()=>{if(patch()||++attempts>80)clearInterval(timer)},100);
window.IFSI_V8430_CHANGELOG={patch};
})();