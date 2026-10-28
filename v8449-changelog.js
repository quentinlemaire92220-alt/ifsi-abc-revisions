(()=>{'use strict';
function patch8449(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.149';
 if(document.getElementById('v8449Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8449Change';span.dataset.date='2026-10-28';
 const title=document.createElement('b');title.textContent='V8.30.149 — Gestion du stress : QCM et flashcards';
 span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Ajout de 50 QCM interactifs corrigés, 50 flashcards et 50 notions de vocabulaire (46 nouvelles et 4 déjà existantes).'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('La fiche v1.49 de 17 pages reste inchangée. Aucun vocal n’est généré automatiquement.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8449()||++n>120)clearInterval(t)},100);
window.IFSI_V8449_CHANGELOG={patch:patch8449};
})();
