(()=>{'use strict';
function patch8307(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.7';
 if(document.getElementById('v8307Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8307Change';
 const b=document.createElement('b');b.textContent='V8.30.7 — Cours et Révision clarifiés';
 span.appendChild(b);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Séparation plus claire entre le parcours Cours et le centre de Révision, avec des écrans plus aérés.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Correction des favoris QCM dupliqués et amélioration du fil d’Ariane et des actions de série.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8307()||++n>120)clearInterval(t)},120);
window.IFSI_V8307_CHANGELOG={patch:patch8307};
})();
