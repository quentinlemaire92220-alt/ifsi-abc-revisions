(()=>{'use strict';
function patch8447(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.147';
 if(document.getElementById('v8447Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8447Change';span.dataset.date='2026-10-28';
 const title=document.createElement('b');title.textContent='V8.30.147 — Fièvre au retour de voyage et paludisme';
 span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Ajout provisoire du cours UE B1.3 : fiche de révision, 40 QCM interactifs corrigés, 50 flashcards et 50 définitions.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Support officiel en attente ; trois scripts vocaux préparés, aucun MP3 disponible.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8447()||++n>120)clearInterval(t)},100);
window.IFSI_V8447_CHANGELOG={patch:patch8447};
})();
