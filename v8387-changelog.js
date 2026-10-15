(()=>{'use strict';
function patch8387(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.87';
 if(document.getElementById('v8387Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8387Change';span.dataset.date='2026-10-15';
 const title=document.createElement('b');title.textContent='V8.30.87 — Annales 2025 : 22 nouveaux QCM et 22 flashcards';span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Questions reformulées et vérifiées sur les supports 2026 : biomolécules, niveaux d’organisation, homéostasie, endocrinologie, immunologie. Filtre de provenance et corrections personnalisées. Les questions en attente de validation ne sont pas publiées.'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8387()||++n>40)clearInterval(t)},100);
window.IFSI_V8387_CHANGELOG={patch:patch8387};
})();
