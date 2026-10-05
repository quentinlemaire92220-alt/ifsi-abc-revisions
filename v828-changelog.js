(()=>{'use strict';
function patch828(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.28';
 if(document.getElementById('v828Change'))return true;
 const host=box.querySelector('details div.small');if(!host)return false;
 const span=document.createElement('span');span.id='v828Change';
 const b=document.createElement('b');b.textContent='V8.28 — Centre de révision simplifié';
 span.appendChild(b);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Centre de révision réorganisé en grille : actions prioritaires visibles, réglages secondaires repliés et meilleure lisibilité sur PC/mobile.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Correction de navigation : lancer une révision, un examen blanc ou une série ciblée ouvre désormais réellement le QCM au lieu de laisser le centre affiché au-dessus.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Amélioration du mode sombre et de l’espace sous la barre de navigation.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch828()||++n>120)clearInterval(t)},120);
window.IFSI_V828_CHANGELOG={patch:patch828};
})();