(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.92';
 if(document.getElementById('v8392Change'))return true;
 const list=box.querySelector('details .small');if(!list)return false;
 const line=document.createElement('span');line.id='v8392Change';line.dataset.date='2026-10-18';
 const title=document.createElement('b');title.textContent='V8.30.92 — QCM UE A1 : partie 03';
 line.appendChild(title);line.appendChild(document.createElement('br'));
 line.appendChild(document.createTextNode('Nettoyage de 8 fragments de page PDF et clarification de la question 19, désormais utilisable sans illustration. Réponses et indices conservés. Les questions historiques à 4 bonnes réponses ne sont pas encore révisées.'));
 line.appendChild(document.createElement('br'));list.insertBefore(line,list.firstChild);return true;
}
let attempts=0;const timer=setInterval(()=>{if(patch()||++attempts>50)clearInterval(timer)},100);
window.IFSI_V8392_CHANGELOG={patch};
})();
