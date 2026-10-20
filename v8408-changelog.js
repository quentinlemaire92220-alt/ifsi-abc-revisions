(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.108';
 if(document.getElementById('v8408Change'))return true;
 const list=box.querySelector('details .small');if(!list)return false;
 const line=document.createElement('span');line.id='v8408Change';line.dataset.date='2026-10-20';
 const title=document.createElement('b');title.textContent='V8.30.108 — Import privé des supports Pathologies';
 line.append(title,document.createElement('br'));
 line.append(document.createTextNode('L’onglet Pathologies permet d’importer un pack P1 sur l’appareil, sans publication à la promotion. Fiches illustrées 18 planches, QCM 72 questions, 60 flashcards et 24 étapes de cas disponibles en consultation de revue. Aucun corrigé provisoire ne modifie les scores.'));
 line.appendChild(document.createElement('br'));list.insertBefore(line,list.firstChild);return true;
}
let n=0;const timer=setInterval(()=>{if(patch()||++n>50)clearInterval(timer)},100);
window.IFSI_V8408_CHANGELOG={patch};
})();