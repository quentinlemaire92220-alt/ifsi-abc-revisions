(()=>{'use strict';
function patch8359(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.59';
 if(document.getElementById('v8359Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8359Change';span.dataset.date='2026-10-09';
 const title=document.createElement('b');title.textContent='V8.30.59 — 8 nouvelles fiches de mathématiques en infographies';
 span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Les 8 fiches de mathématiques du cours Calculs de doses & mathématiques sont remplacées par des infographies pédagogiques : méthodes, conversions, proportionnalité, concentrations, dilutions, calculs de doses, débits et pousse-seringue. L’ancien catalogue de 5 fiches est retiré pour éviter les doublons. La fiche maître, les QCM et les exercices restent disponibles.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8359()||++n>40)clearInterval(t)},100);
window.IFSI_V8359_CHANGELOG={patch:patch8359};
})();
