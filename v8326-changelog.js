(()=>{'use strict';
function patch8326(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.26';
 if(document.getElementById('v8326Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8326Change';span.dataset.date='2026-10-06';
 const title=document.createElement('b');title.textContent='V8.30.26 — Vocaux Introduction à la pharmacologie';
 span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Ajout de 5 vocaux de révision : médicament et développement, pharmacodynamie, pharmacocinétique, interactions et terrains à risque, puis prescription, iatrogénie et pharmacovigilance.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('La série suit le cours de pharmacologie fondamentale et met l’accent sur les mécanismes d’action et les notions prioritaires pour l’évaluation.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8326()||++n>40)clearInterval(t)},100);
window.IFSI_V8326_CHANGELOG={patch:patch8326};
})();
