(()=>{'use strict';
function patch8319(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.19';
 if(document.getElementById('v8319Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8319Change';span.dataset.date='2026-10-06';
 const title=document.createElement('b');title.textContent='V8.30.19 — Correctif crash planches HD';
 span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Désactivation temporaire de l’injection automatique des 26 nouvelles planches après détection d’un crash au lancement.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Les ressources restent conservées dans le Drive et référencées dans l’audit pendant la correction du module.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8319()||++n>40)clearInterval(t)},100);
window.IFSI_V8319_CHANGELOG={patch:patch8319};
})();