(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 window.IFSI_V8426_CHANGELOG?.patch?.();
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.127';
 const entries=box.querySelector('details .small');if(!entries)return false;
 if(!document.getElementById('v8427Change')){
  const line=document.createElement('span');line.id='v8427Change';line.dataset.date='2026-10-25';
  const heading=document.createElement('b');heading.textContent='V8.30.127 — Navigation pédagogique des cours';
  line.append(heading,document.createElement('br'));
  line.append(document.createTextNode('Parcours Domaine → UE → Cours avec intitulés pédagogiques du Drive, pastille Provisoire et ordre Support, Fiche, QCM, Infographies, Vocaux. Flashcards et vocabulaire conservés ; 55 cours et vocaux existants inchangés.'));
  line.append(document.createElement('br'));entries.insertBefore(line,entries.firstChild);
 }
 return true;
}
let attempts=0;const timer=setInterval(()=>{if(patch()||++attempts>80)clearInterval(timer)},100);
window.IFSI_V8427_CHANGELOG={patch};
})();
