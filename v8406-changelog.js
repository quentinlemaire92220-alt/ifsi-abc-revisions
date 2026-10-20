(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.106';
 if(document.getElementById('v8406Change'))return true;
 const list=box.querySelector('details .small');if(!list)return false;
 const line=document.createElement('span');line.id='v8406Change';line.dataset.date='2026-10-20';
 const title=document.createElement('b');title.textContent='V8.30.106 — Pathologies par système avec volets déroulants';
 line.append(title,document.createElement('br'));
 line.append(document.createTextNode('L’onglet Pathologies ouvre son propre catalogue, avec des panneaux dépliables Respiratoire, Cardiovasculaire et Endocrinien. BPCO, HTA et diabète disposent d’une page dédiée ; aucun clic ne redirige automatiquement vers les cours. Le cours associé est proposé séparément et facultativement. Les ressources non encore validées restent masquées.'));
 line.appendChild(document.createElement('br'));list.insertBefore(line,list.firstChild);return true;
}
let n=0;const timer=setInterval(()=>{if(patch()||++n>50)clearInterval(timer)},100);
window.IFSI_V8406_CHANGELOG={patch};
})();