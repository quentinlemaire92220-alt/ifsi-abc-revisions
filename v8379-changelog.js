(()=>{'use strict';
function patch8379(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.79';
 if(document.getElementById('v8379Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8379Change';span.dataset.date='2026-10-12';
 const title=document.createElement('b');title.textContent='V8.30.79 — Vocabulaire intégré aux QCM';
 span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('La fiche vocabulaire reste disponible dans les cours. Les questions rejoignent le thème Vocabulaire des QCM, avec les corrections, scores et statistiques communs.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Les boutons dédiés aux flashcards de vocabulaire sont retirés des fiches et des cours.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8379()||++n>40)clearInterval(t)},100);
window.IFSI_V8379_CHANGELOG={patch:patch8379};
})();
