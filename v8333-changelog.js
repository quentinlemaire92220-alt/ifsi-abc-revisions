(()=>{'use strict';
function patch8333(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.33';
 if(document.getElementById('v8333Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8333Change';span.dataset.date='2026-10-07';
 const title=document.createElement('b');title.textContent='V8.30.33 — Planning S7';
 span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Ajout du planning prévisionnel du 12 au 16 octobre 2026 avec les créneaux, UE, salles, intervenants et activités asynchrones visibles sur l’affichage IFSI.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Le filtre Promo A / Promo B est complété par les sous-groupes A1, A2, B1 et B2 pour les journées où les enseignements sont répartis par groupe.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('L’export calendrier ICS et le suivi des modifications prennent désormais en compte S7 et le sous-groupe sélectionné.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8333()||++n>40)clearInterval(t)},100);
window.IFSI_V8333_CHANGELOG={patch:patch8333};
})();