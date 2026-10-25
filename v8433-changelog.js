(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 window.IFSI_V8432_CHANGELOG?.patch?.();
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.133';
 const host=box.querySelector('details .small');if(!host)return false;
 if(!document.getElementById('v8433Change')){
  const line=document.createElement('span');line.id='v8433Change';line.dataset.date='2026-10-25';
  const title=document.createElement('b');title.textContent='V8.30.133 — Cartes de cours et pictogrammes colorés';
  line.append(title,document.createElement('br'),document.createTextNode('Les pictogrammes colorés sont rétablis. Le bouton d’ouverture du cours, le lien du support et la pastille Provisoire sont regroupés dans chaque carte. Les boutons restent compacts sur PC et mobile ; tous les accès, favoris et contenus sont conservés.'),document.createElement('br'),document.createElement('br'));
  host.insertBefore(line,host.firstChild);
 }
 return true;
}
let n=0;const timer=setInterval(()=>{if(patch()||++n>80)clearInterval(timer)},100);
window.IFSI_V8433_CHANGELOG={patch};
})();
