(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 window.IFSI_V8438_CHANGELOG?.patch?.();
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.139';
 const host=box.querySelector('details .small');if(!host)return false;
 if(!document.getElementById('v8439Change')){
  const line=document.createElement('span');line.id='v8439Change';line.dataset.date='2026-10-26';
  const title=document.createElement('b');title.textContent='V8.30.139 — vignettes améliorées';
  line.append(title,document.createElement('br'),document.createTextNode('Quatre illustrations du catalogue ont été améliorées : Grands brûlés, Diagnostic bactériologique, PSSM et Niveaux d’organisation. Les cours, QCM, flashcards, vocaux et progressions restent inchangés.'),document.createElement('br'),document.createElement('br'));
  host.insertBefore(line,host.firstChild);
 }
 return true;
}
let n=0;const timer=setInterval(()=>{if(patch()||++n>80)clearInterval(timer)},100);
window.IFSI_V8439_CHANGELOG={patch};
})();
