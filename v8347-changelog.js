(()=>{'use strict';
function patch8347(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.47';
 if(document.getElementById('v8347Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8347Change';span.dataset.date='2026-10-08';
 const title=document.createElement('b');title.textContent='V8.30.47 — Contrôle des ressources et flashcards';span.appendChild(title);
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Ajout du nombre de flashcards et du contrôle des cartes invalides, ambiguës, sans réponse ou en doublon. Contrôle des ressources plus lisible, détails techniques repliés et journal des évolutions allégé.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));host.insertBefore(span,host.firstChild);return true;
}
let n=0;const timer=setInterval(()=>{if(patch8347()||++n>40)clearInterval(timer)},100);
window.IFSI_V8347_CHANGELOG={patch:patch8347};
})();