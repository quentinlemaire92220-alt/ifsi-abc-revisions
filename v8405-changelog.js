(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.105';
 if(document.getElementById('v8405Change'))return true;
 const list=box.querySelector('details .small');if(!list)return false;
 const line=document.createElement('span');line.id='v8405Change';line.dataset.date='2026-10-20';
 const title=document.createElement('b');title.textContent='V8.30.105 — Pathologies dans la barre de navigation';
 line.append(title,document.createElement('br'));
 line.append(document.createTextNode('L’accès Pathologies apparaît désormais dans la barre du bas, entre Révision et Paramètres. Planning, Cours, Anatomie et les autres onglets sont conservés. L’accueil propose toujours le raccourci Pathologies. BPCO, HTA et diabète restent signalés en cours de validation ; leurs fiches et exercices cliniques ne sont pas diffusés.'));
 line.appendChild(document.createElement('br'));list.insertBefore(line,list.firstChild);return true;
}
let n=0;const timer=setInterval(()=>{if(patch()||++n>50)clearInterval(timer)},100);
window.IFSI_V8405_CHANGELOG={patch};
})();