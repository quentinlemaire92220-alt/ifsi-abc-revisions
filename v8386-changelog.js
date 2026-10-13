(()=>{'use strict';
function patch8386(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.86';
 if(document.getElementById('v8386Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8386Change';span.dataset.date='2026-10-13';
 const title=document.createElement('b');title.textContent='V8.30.86 — Exercices pratiques : 10 problèmes de calculs infirmiers';span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('10 cas avec énoncé, prescription, matériel, 35 réponses à saisir, indices gradués, méthode et corrigé expliqué. Le parcours QCM de mathématiques reste disponible.'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8386()||++n>40)clearInterval(t)},100);window.IFSI_V8386_CHANGELOG={patch:patch8386};
})();
