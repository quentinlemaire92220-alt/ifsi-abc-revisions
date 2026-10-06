(()=>{'use strict';
function patch8313(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.13';
 if(document.getElementById('v8313Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8313Change';
 const b=document.createElement('b');b.textContent='V8.30.13 — Accueil centré sur les ressources';
 span.appendChild(b);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Le bloc « À faire aujourd’hui » est retiré définitivement de l’accueil et reste concentré dans le centre Révision via « Ma révision ».'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('L’accueil affiche désormais uniquement les ressources pédagogiques ajoutées, sans les mises à jour UX/UI ou techniques.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Les évolutions UX/UI, techniques et correctifs sont regroupés dans Paramètres → Journal des évolutions.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8313()||++n>120)clearInterval(t)},120);
window.IFSI_V8313_CHANGELOG={patch:patch8313};
})();
