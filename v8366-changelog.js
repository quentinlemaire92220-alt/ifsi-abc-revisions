(()=>{'use strict';
function patch8366(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.66';
 if(document.getElementById('v8366Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8366Change';span.dataset.date='2026-10-09';
 const title=document.createElement('b');title.textContent='V8.30.66 — Recherche fiable au démarrage';
 span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Une recherche saisie pendant le chargement se met à jour dès que les cours sont disponibles. Les ressources audio sont libellées « vocal » et « vocaux ».'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8366()||++n>40)clearInterval(t)},100);
window.IFSI_V8366_CHANGELOG={patch:patch8366};
})();
