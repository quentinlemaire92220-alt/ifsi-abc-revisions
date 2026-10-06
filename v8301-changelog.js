(()=>{'use strict';
function patch8301(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.1';
 if(document.getElementById('v8301Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8301Change';
 const b=document.createElement('b');b.textContent='V8.30.1 — Correctif mobile atlas locomoteur';
 span.appendChild(b);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Le mode S’entraîner conserve maintenant les proportions de la planche et affiche une planche floutée plutôt qu’un espace vide.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('La révélation retire le masque sans reconstruire la zone image, ce qui évite les gros sauts de mise en page sur mobile.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Le mode Tester utilise le même masquage visuel, et les boutons Apprendre / S’entraîner / Tester restent alignés sur une seule rangée mobile.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8301()||++n>120)clearInterval(t)},120);
window.IFSI_V8301_CHANGELOG={patch:patch8301};
})();