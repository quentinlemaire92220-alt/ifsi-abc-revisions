(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 window.IFSI_V8437_CHANGELOG?.patch?.();
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.138';
 const host=box.querySelector('details .small');if(!host)return false;
 if(!document.getElementById('v8438Change')){
  const line=document.createElement('span');line.id='v8438Change';line.dataset.date='2026-10-26';
  const title=document.createElement('b');title.textContent='V8.30.138 — 55 vignettes médicales distinctes';
  line.append(title,document.createElement('br'),document.createTextNode('Chaque cours possède désormais une vignette médicale dédiée. Le chargement est optimisé pour mobile et un ancien pictogramme reste disponible si une image est temporairement inaccessible. Les 190 vocaux, QCM, flashcards, fiches et progressions sont conservés.'),document.createElement('br'),document.createElement('br'));
  host.insertBefore(line,host.firstChild);
 }
 return true;
}
let n=0;const timer=setInterval(()=>{if(patch()||++n>80)clearInterval(timer)},100);
window.IFSI_V8438_CHANGELOG={patch};
})();
