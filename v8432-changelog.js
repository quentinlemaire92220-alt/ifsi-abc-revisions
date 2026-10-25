(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 window.IFSI_V8431_CHANGELOG?.patch?.();
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.132';
 const host=box.querySelector('details .small');if(!host)return false;
 if(!document.getElementById('v8432Change')){
  const line=document.createElement('span');line.id='v8432Change';line.dataset.date='2026-10-25';
  const title=document.createElement('b');title.textContent='V8.30.132 — Boutons et icônes compacts';
  line.append(title,document.createElement('br'),document.createTextNode('Les raccourcis vers les supports deviennent discrets. Les actions QCM et les ressources utilisent des boutons compacts et des icônes vectorielles lisibles en clair et sombre, sur PC et mobile. Tous les liens, favoris et contenus sont conservés.'),document.createElement('br'),document.createElement('br'));
  host.insertBefore(line,host.firstChild);
 }
 return true;
}
let n=0;const timer=setInterval(()=>{if(patch()||++n>80)clearInterval(timer)},100);
window.IFSI_V8432_CHANGELOG={patch};
})();
