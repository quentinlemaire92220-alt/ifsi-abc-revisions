(()=>{'use strict';
function patch8327(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.27';
 if(document.getElementById('v8327Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8327Change';span.dataset.date='2026-10-06';
 const title=document.createElement('b');title.textContent='V8.30.27 — Planning officiel de la promo';
 span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Ajout de l’onglet Planning alimenté avec les emplois du temps officiels S5 et S6, avec sélection Promo A / Promo B.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('La vue affiche les créneaux, salles, UE, intervenants, activités asynchrones et permet d’exporter la semaine sélectionnée au format calendrier ICS.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8327()||++n>40)clearInterval(t)},100);
window.IFSI_V8327_CHANGELOG={patch:patch8327};
})();