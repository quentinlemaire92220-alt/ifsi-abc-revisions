(()=>{'use strict';
function patch8320(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.20';
 if(document.getElementById('v8320Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8320Change';span.dataset.date='2026-10-06';
 const title=document.createElement('b');title.textContent='V8.30.20 — 26 planches HD réintégrées';
 span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Les 26 planches allant de l’atome aux tissus sont de nouveau disponibles dans Anatomie & Physiologie.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Le chargement est désormais déclenché uniquement au rendu de l’écran Anatomie, sans MutationObserver ni timer de démarrage.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('La séparation Infographies / Anatomie et le suivi des 106 planches HD restent contrôlés par la TNR.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8320()||++n>40)clearInterval(t)},100);
window.IFSI_V8320_CHANGELOG={patch:patch8320};
})();