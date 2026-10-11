(()=>{'use strict';
function patch8376(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.76';
 if(document.getElementById('v8376Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8376Change';span.dataset.date='2026-10-11';
 const title=document.createElement('b');title.textContent='V8.30.76 — Chargement QCM fiabilisé';
 span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Une banque partiellement chargée est désormais signalée et les seuls packs manquants peuvent être récupérés sans recharger ceux déjà disponibles.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Sept QCM qui dépendaient d’une photographie ou d’une radiographie absente sont maintenant autonomes, sans modification des réponses attendues.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8376()||++n>40)clearInterval(t)},100);
window.IFSI_V8376_CHANGELOG={patch:patch8376};
})();
