(()=>{'use strict';
function patch826(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.27';
 if(document.getElementById('v826Change'))return true;
 const host=box.querySelector('details div.small');if(!host)return false;
 const span=document.createElement('span');span.id='v826Change';
 const b=document.createElement('b');b.textContent='V8.26 — IST hors VIH et mises à jour fiables';
 span.appendChild(b);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('IST hors VIH : fiche de révision + 56 QCM interactifs. Les 4 questions illustrées restent dans le PDF.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Audit clarifié : comparaison avec le dernier inventaire Drive validé, sans faux statut de synchronisation temps réel.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Mise à jour PWA renforcée : manifeste de version, cache renouvelé et récupération réseau sans cache.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch826()||++n>120)clearInterval(t)},120);
window.IFSI_V826_CHANGELOG={patch:patch826};
})();
