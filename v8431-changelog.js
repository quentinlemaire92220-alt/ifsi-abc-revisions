(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 window.IFSI_V8430_CHANGELOG?.patch?.();
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.131';
 const host=box.querySelector('details .small');if(!host)return false;
 if(!document.getElementById('v8431Change')){
  const line=document.createElement('span');line.id='v8431Change';line.dataset.date='2026-10-25';
  const title=document.createElement('b');title.textContent='V8.30.131 — Provisoire : explication à la demande';
  line.append(title,document.createElement('br'),document.createTextNode('La petite pastille Provisoire ouvre le motif et les sources du cours au clic ou au clavier. Le support officiel manquant reste en attente en première position. Fiches, QCM, infographies, vocaux, flashcards et vocabulaire conservent leurs accès.'),document.createElement('br'),document.createElement('br'));
  host.insertBefore(line,host.firstChild);
 }
 return true;
}
let n=0;const timer=setInterval(()=>{if(patch()||++n>80)clearInterval(timer)},100);
window.IFSI_V8431_CHANGELOG={patch};
})();
