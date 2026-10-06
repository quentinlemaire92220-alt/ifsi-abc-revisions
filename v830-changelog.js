(()=>{'use strict';
function patch830(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30';
 if(document.getElementById('v830Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v830Change';
 const b=document.createElement('b');b.textContent='V8.30 — Anatomie locomotrice active et mises à jour robustes';
 span.appendChild(b);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Atlas locomoteur : 20 planches embarquées hors ligne, filtres par région, précédent/suivant, favoris, reprise de la dernière planche et suivi de maîtrise.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Nouveaux modes S’entraîner et Tester avec score par planche. Les tests masquent la planche jusqu’à la correction.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Paramètres : affichage version installée / serveur / build et bouton Forcer la mise à jour pour nettoyer le cache PWA sans effacer les résultats.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch830()||++n>120)clearInterval(t)},120);
window.IFSI_V830_CHANGELOG={patch:patch830};
})();