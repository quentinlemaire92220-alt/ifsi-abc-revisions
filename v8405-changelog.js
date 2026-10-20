(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.105';
 if(document.getElementById('v8405Change'))return true;
 const list=box.querySelector('details .small');if(!list)return false;
 const line=document.createElement('span');line.id='v8405Change';line.dataset.date='2026-10-20';
 const title=document.createElement('b');title.textContent='V8.30.105 — Plaies et pansements : QCM V4.2';
 line.append(title,document.createElement('br'));
 line.append(document.createTextNode('50 QCM de la partie 1/2 : répartition rééquilibrée des réponses A–E, 67 distracteurs retravaillés dans 18 questions, précisions pédagogiques sur les escarres Q18 et Q20, corrigé et supports PDF V4.2 synchronisés. Les flashcards historiques restent disponibles.'));
 line.appendChild(document.createElement('br'));list.insertBefore(line,list.firstChild);return true;
}
let n=0;const timer=setInterval(()=>{if(patch()||++n>50)clearInterval(timer)},100);
window.IFSI_V8405_CHANGELOG={patch};
})();
