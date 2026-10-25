(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 window.IFSI_V8433_CHANGELOG?.patch?.();
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.134';
 const host=box.querySelector('details .small');if(!host)return false;
 if(!document.getElementById('v8434Change')){
  const line=document.createElement('span');line.id='v8434Change';line.dataset.date='2026-10-25';
  const title=document.createElement('b');title.textContent='V8.30.134 — Navigation compacte des cours';
  line.append(title,document.createElement('br'),document.createTextNode('Les cours reprennent la présentation compacte validée : icônes colorées, accès regroupés dans les cartes et rubriques numérotées à déplier. Les supports manquants restent en attente. Tous les accès, QCM, flashcards, vocaux, lexiques et favoris sont conservés.'),document.createElement('br'),document.createElement('br'));
  host.insertBefore(line,host.firstChild);
 }
 return true;
}
let n=0;const timer=setInterval(()=>{if(patch()||++n>80)clearInterval(timer)},100);
window.IFSI_V8434_CHANGELOG={patch};
})();
