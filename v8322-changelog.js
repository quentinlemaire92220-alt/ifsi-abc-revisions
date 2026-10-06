(()=>{'use strict';
function patch8322(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.22';
 if(document.getElementById('v8322Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8322Change';span.dataset.date='2026-10-06';
 const title=document.createElement('b');title.textContent='V8.30.22 — Partage WhatsApp des nouveautés';
 span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Ajout dans Paramètres d’un bouton pour préparer l’annonce de la dernière ressource et l’ouvrir dans WhatsApp.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Les cartes « Ressources ajoutées » affichent désormais uniquement les informations utiles à la révision ; les correctifs et détails techniques restent dans le Journal des évolutions.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8322()||++n>40)clearInterval(t)},100);
window.IFSI_V8322_CHANGELOG={patch:patch8322};
})();
