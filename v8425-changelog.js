(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 window.IFSI_V8424_CHANGELOG?.patch?.();
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.125';
 const entries=box.querySelector('details .small');if(!entries)return false;
 if(!document.getElementById('v8425Change')){
  const line=document.createElement('span');line.id='v8425Change';line.dataset.date='2026-10-25';
  const heading=document.createElement('b');heading.textContent='V8.30.125 — Relation soignant-soigné (provisoire)';
  line.append(heading,document.createElement('br'));
  line.append(document.createTextNode('Cours D1.1 ajouté depuis deux transcriptions : fiche de révision écrite, 40 QCM corrigés, 40 flashcards et 25 définitions. Diaporama officiel toujours manquant ; statut PROVISOIRE maintenu.'));
  line.append(document.createElement('br'));entries.insertBefore(line,entries.firstChild);
 }
 return true;
}
let attempts=0;const timer=setInterval(()=>{if(patch()||++attempts>80)clearInterval(timer)},100);
window.IFSI_V8425_CHANGELOG={patch};
})();
