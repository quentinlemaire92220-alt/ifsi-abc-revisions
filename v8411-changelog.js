(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.111';
 if(document.getElementById('v8411Change'))return true;
 const list=box.querySelector('details .small');if(!list)return false;
 const line=document.createElement('span');line.id='v8411Change';line.dataset.date='2026-10-21';
 const b=document.createElement('b');b.textContent='V8.30.111 — Correction de l’ouverture des supports Pathologies';
 line.append(b,document.createElement('br'));
 line.append(document.createTextNode('BPCO, HTA et diabète ouvrent directement leur fiche personnelle après import du pack privé. Sans import, le sélecteur JSON est proposé depuis la page de chaque pathologie. Le cours IFSI reste facultatif et replié ; le résultat de l’import reste visible. Supports de revue privée uniquement, aucun score modifié.'));
 line.appendChild(document.createElement('br'));list.insertBefore(line,list.firstChild);return true;
}
let n=0;const timer=setInterval(()=>{if(patch()||++n>50)clearInterval(timer)},100);
window.IFSI_V8411_CHANGELOG={patch};
})();