(()=>{'use strict';
function patch8377(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.77';
 if(document.getElementById('v8377Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8377Change';span.dataset.date='2026-10-11';
 const title=document.createElement('b');title.textContent='V8.30.77 — Reprise QCM affichée au bon moment';
 span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Le bouton permettant de compléter une banque partielle reste désormais masqué lorsque tous les packs QCM sont chargés.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8377()||++n>40)clearInterval(t)},100);
window.IFSI_V8377_CHANGELOG={patch:patch8377};
})();
