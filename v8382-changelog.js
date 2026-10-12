(()=>{'use strict';
function patch8382(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.82';
 if(document.getElementById('v8382Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8382Change';span.dataset.date='2026-10-12';
 const title=document.createElement('b');title.textContent='V8.30.82 — Supports des sous-cours et tests automatiques';
 span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Le système locomoteur donne accès aux supports officiels des sous-cours : arthrose, traumatologie, rhumatismes inflammatoires et pathologies microcristallines. La chirurgie orthopédique est signalée comme indisponible.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Cellules et tissus propose désormais les trois PDF séparément. Un contrôle anti-régression vérifie automatiquement les accès aux supports et les cours masqués.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8382()||++n>40)clearInterval(t)},100);
window.IFSI_V8382_CHANGELOG={patch:patch8382};
})();
