(()=>{'use strict';
function patch8378(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.78';
 if(document.getElementById('v8378Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8378Change';span.dataset.date='2026-10-12';
 const title=document.createElement('b');title.textContent='V8.30.78 — Exercices interactifs et corrections personnalisées';
 span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Découvre deux façons de t’entraîner sur le système urinaire : schéma anatomique original à compléter et associations entre organes et fonctions.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('En cas d’erreur dans un QCM, la correction distingue désormais les propositions incorrectes choisies et les bonnes réponses oubliées. Les explications détaillées sont enrichies progressivement selon les cours.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8378()||++n>40)clearInterval(t)},100);
window.IFSI_V8378_CHANGELOG={patch:patch8378};
})();
