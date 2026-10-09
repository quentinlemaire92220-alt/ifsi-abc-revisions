(()=>{
'use strict';
function patch8360(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.60';
 if(document.getElementById('v8360Change'))return true;
 const span=document.createElement('span');span.id='v8360Change';span.dataset.date='2026-10-09';
 const title=document.createElement('b');title.textContent='V8.30.60 — Audit correctif et qualité des ressources';
 span.appendChild(title);
 span.appendChild(document.createTextNode(' Les anciennes fiches PDF de maths ne sont plus affichées en doublon. Les packs QCM sont contrôlés question par question, la séance de pharmacologie non assurée le 08/10 est signalée, et les garde-fous pédagogiques et PWA sont renforcés.'));
 box.appendChild(span);return true;
}
let n=0;const t=setInterval(()=>{if(patch8360()||++n>40)clearInterval(t)},100);
window.IFSI_V8360_CHANGELOG={patch:patch8360};
})();
