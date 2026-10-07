(()=>{'use strict';
function patch8332(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.32';
 if(document.getElementById('v8332Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8332Change';span.dataset.date='2026-10-07';
 const title=document.createElement('b');title.textContent='V8.30.32 — Pharmacologie renforcée';
 span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('La fiche Introduction à la pharmacologie a été enrichie à partir des deux parties du support officiel et des explications du cours.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Le QCM Pharmacologie reste à 60 questions et a été réaligné sur les notions restaurées : administration, unités, cibles, seconds messagers, Kd, DE50/Emax, populations à risque et prescription.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Le niveau de difficulté et la répartition des réponses restent inchangés.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8332()||++n>40)clearInterval(t)},100);
window.IFSI_V8332_CHANGELOG={patch:patch8332};
})();
