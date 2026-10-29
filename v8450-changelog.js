(()=>{'use strict';
function patch8450(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.150';
 if(document.getElementById('v8450Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8450Change';span.dataset.date='2026-10-28';
 const title=document.createElement('b');title.textContent='V8.30.150 — TD3 Théorie de gestion des symptômes';
 span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Fiche de révision améliorée : 11 pages, six chapitres, titres hiérarchisés, signets et charte v1.49.1.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Les 40 QCM et 40 flashcards déjà publiés restent inchangés. Le TD conserve un statut pédagogique provisoire.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8450()||++n>120)clearInterval(t)},100);
window.IFSI_V8450_CHANGELOG={patch:patch8450};
})();
