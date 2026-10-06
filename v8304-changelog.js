(()=>{'use strict';
function patch8304(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.4';
 if(document.getElementById('v8304Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8304Change';
 const b=document.createElement('b');b.textContent='V8.30.4 — Nouveautés visibles dès l’ouverture';
 span.appendChild(b);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Correction d’une règle CSS héritée qui masquait encore le bloc Nouveautés et la carte d’amélioration au premier affichage malgré leur chargement correct.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Le conteneur des informations d’accueil est maintenant explicitement autorisé dans le mode compact, sans devoir changer d’onglet.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8304()||++n>120)clearInterval(t)},120);
window.IFSI_V8304_CHANGELOG={patch:patch8304};
})();