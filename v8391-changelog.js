(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.91';
 if(document.getElementById('v8391Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8391Change';span.dataset.date='2026-10-18';
 const title=document.createElement('b');title.textContent='V8.30.91 — Révisions, accès et confidentialité';span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Rattachement des QCM chargés tardivement, catalogue Flashcards actualisé, exercices urinaires visibles et bandeau sombre lisible. Résultats maths conservés sur cet appareil. Quatre fiches sont signalées temporairement indisponibles pendant la vérification de leur accès.'));span.appendChild(document.createElement('br'));host.insertBefore(span,host.firstChild);return true;
}
let n=0;const timer=setInterval(()=>{if(patch()||++n>40)clearInterval(timer)},100);
window.IFSI_V8391_CHANGELOG={patch};
})();
