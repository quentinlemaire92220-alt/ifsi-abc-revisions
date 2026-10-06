(()=>{'use strict';
function patch8318(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.18';
 if(document.getElementById('v8318Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8318Change';span.dataset.date='2026-10-06';
 const title=document.createElement('b');title.textContent='V8.30.18 — 26 nouvelles planches HD';
 span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Ajout de 26 planches dédiées du microscopique aux tissus : atome, molécule, ADN, cellules humaines, bactéries, virus et tissus.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Les planches sont classées par cours et restent strictement séparées des infographies.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Le catalogue Anatomie passe de 80 à 106 planches HD suivies par l’audit.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8318()||++n>40)clearInterval(t)},100);
window.IFSI_V8318_CHANGELOG={patch:patch8318};
})();