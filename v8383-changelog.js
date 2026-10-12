(()=>{'use strict';
function patch8383(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.83';
 if(document.getElementById('v8383Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8383Change';span.dataset.date='2026-10-12';
 const title=document.createElement('b');title.textContent='V8.30.83 — Calendrier des sous-groupes';
 span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Le lundi 12 octobre de 9 h à 10 h 30, B1 (salle S11) et B2 (salle S3) sont désormais deux séances indépendantes. Le filtre de sous-groupe et les exports calendrier respectent cette séparation.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Le bandeau Aujourd’hui affiche toutes les séances simultanées et précise la semaine réelle, même lors de la consultation d’une autre semaine.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8383()||++n>40)clearInterval(t)},100);
window.IFSI_V8383_CHANGELOG={patch:patch8383};
})();
