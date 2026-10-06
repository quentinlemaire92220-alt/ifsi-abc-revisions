(()=>{'use strict';
function patch8317(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.17';
 if(document.getElementById('v8317Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8317Change';span.dataset.date='2026-10-06';
 const title=document.createElement('b');title.textContent='V8.30.17 — Dates des mises à jour';
 span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Chaque ressource ajoutée affiche désormais sa date dans l’accueil.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Le journal des évolutions dans Paramètres affiche également la date de chaque mise à jour UX/UI, technique ou corrective.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Les dates historiques sont reprises depuis les dates de publication Git des versions correspondantes.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8317()||++n>40)clearInterval(t)},100);
window.IFSI_V8317_CHANGELOG={patch:patch8317};
})();