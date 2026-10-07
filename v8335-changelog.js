(()=>{'use strict';
function patch8335(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.35';
 if(document.getElementById('v8335Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8335Change';span.dataset.date='2026-10-07';
 const title=document.createElement('b');title.textContent='V8.30.35 — Lecteur vocal intégré stabilisé';
 span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Les vocaux utilisent maintenant en priorité le lecteur audio natif du téléphone ou du navigateur, plus stable que le lecteur Drive intégré.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('La position de lecture est mémorisée localement et restaurée lors de la reprise du même vocal.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Si Google Drive refuse le flux direct, un lecteur Drive de secours reste disponible ainsi que le bouton Ouvrir dans Drive.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8335()||++n>40)clearInterval(t)},100);
window.IFSI_V8335_CHANGELOG={patch:patch8335};
})();
