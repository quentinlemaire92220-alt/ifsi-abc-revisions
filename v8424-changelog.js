(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 window.IFSI_V8423_CHANGELOG?.patch?.();
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.124';
 const entries=box.querySelector('details .small');if(!entries)return false;
 if(!document.getElementById('v8424Change')){
  const line=document.createElement('span');line.id='v8424Change';line.dataset.date='2026-10-25';
  const heading=document.createElement('b');heading.textContent='V8.30.124 — QCM dans la bonne rubrique';
  line.append(heading,document.createElement('br'));
  line.append(document.createTextNode('Les PDF de QCM corrigés sont regroupés avec les QCM interactifs ; fiches de révision, supports officiels et contenus pédagogiques restent inchangés.'));
  line.append(document.createElement('br'));entries.insertBefore(line,entries.firstChild);
 }
 return true;
}
let attempts=0;const timer=setInterval(()=>{if(patch()||++attempts>80)clearInterval(timer)},100);
window.IFSI_V8424_CHANGELOG={patch};
})();
