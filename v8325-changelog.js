(()=>{'use strict';
function patch8325(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.25';
 if(document.getElementById('v8325Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8325Change';span.dataset.date='2026-10-06';
 const title=document.createElement('b');title.textContent='V8.30.25 — Corrections QCM fiabilisées';
 span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Les QCM sont désormais limités à 1 à 3 bonnes réponses. Les anciennes questions à 4 bonnes réponses sont reformulées automatiquement en question de combinaison, et plusieurs incohérences entre réponses et explications ont été corrigées.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8325()||++n>40)clearInterval(t)},100);
window.IFSI_V8325_CHANGELOG={patch:patch8325};
})();
