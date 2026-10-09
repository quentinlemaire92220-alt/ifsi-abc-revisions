(()=>{'use strict';
function patch8365(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.65';
 if(document.getElementById('v8365Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8365Change';span.dataset.date='2026-10-10';
 const title=document.createElement('b');title.textContent='V8.30.65 — Accueil et journal finalisés';
 span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('La recherche modernisée de l’accueil conserve ses commandes sans conflit avec les anciens boutons. Les annonces d’interface concernant les flashcards restent dans le journal des évolutions, avec un texte lisible. Les correctifs QCM et de navigation sont conservés.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8365()||++n>40)clearInterval(t)},100);
window.IFSI_V8365_CHANGELOG={patch:patch8365};
})();
