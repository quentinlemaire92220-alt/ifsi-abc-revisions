(()=>{'use strict';
function patch8309(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.9';
 if(document.getElementById('v8309Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8309Change';
 const b=document.createElement('b');b.textContent='V8.30.9 — Centre de révision allégé';
 span.appendChild(b);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('La page Révision est recentrée sur la session personnalisée, la révision express et l’examen blanc.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Les points faibles sont intégrés au tableau de bord, la recherche avancée est repliée dans « Plus de filtres » et l’en-tête est réaligné.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8309()||++n>120)clearInterval(t)},120);
window.IFSI_V8309_CHANGELOG={patch:patch8309};
})();