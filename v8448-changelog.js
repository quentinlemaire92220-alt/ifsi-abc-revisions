(()=>{'use strict';
function patch8448(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.148';
 if(document.getElementById('v8448Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8448Change';span.dataset.date='2026-10-28';
 const title=document.createElement('b');title.textContent='V8.30.148 — Gestion du stress, UE B3.2.1';
 span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Fiche de révision v1.49 de 17 pages : audit non-régression de 59 notions et lexique de 50 définitions.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Publication limitée à la fiche écrite ; aucun QCM, flashcard ni vocal créé automatiquement.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8448()||++n>120)clearInterval(t)},100);
window.IFSI_V8448_CHANGELOG={patch:patch8448};
})();
