(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 window.IFSI_V8425_CHANGELOG?.patch?.();
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.126';
 const entries=box.querySelector('details .small');if(!entries)return false;
 if(!document.getElementById('v8426Change')){
  const line=document.createElement('span');line.id='v8426Change';line.dataset.date='2026-10-25';
  const heading=document.createElement('b');heading.textContent='V8.30.126 — Trois nouveaux vocaux';
  line.append(heading,document.createElement('br'));
  line.append(document.createTextNode('MP3 disponibles : Posture professionnelle TD2 (1 vocal), Pharmacologie (complément de consolidation) et Infections neuro-méningées (complément de consolidation). Les 21 vocaux déjà référencés restent inchangés.'));
  line.append(document.createElement('br'));entries.insertBefore(line,entries.firstChild);
 }
 return true;
}
let attempts=0;const timer=setInterval(()=>{if(patch()||++attempts>80)clearInterval(timer)},100);
window.IFSI_V8426_CHANGELOG={patch};
})();
