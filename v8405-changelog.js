(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.105';
 if(document.getElementById('v8405Change'))return true;
 const list=box.querySelector('details .small');if(!list)return false;
 const line=document.createElement('span');line.id='v8405Change';line.dataset.date='2026-10-20';
 const title=document.createElement('b');title.textContent='V8.30.105 — Plaies et pansements : 50 QCM V4.2';
 line.append(title,document.createElement('br'));
 line.append(document.createTextNode('Les 50 questions de Plaies et pansements (partie 1/2) sont réordonnées et leurs distracteurs retravaillés, avec corrigés et explications harmonisés. Les supports PDF QCM et corrigé sont maintenant séparés et accessibles depuis le cours. Les identifiants des QCM, les bonnes propositions et les flashcards rattachées sont conservés. Le module Pathologies et les autres ressources restent inchangés.'));
 line.appendChild(document.createElement('br'));list.insertBefore(line,list.firstChild);return true;
}
let n=0;const timer=setInterval(()=>{if(patch()||++n>50)clearInterval(timer)},100);
window.IFSI_V8405_CHANGELOG={patch};
})();
