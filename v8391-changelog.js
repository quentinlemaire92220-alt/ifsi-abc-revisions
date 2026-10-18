(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.91';
 if(document.getElementById('v8391Change'))return true;
 const list=box.querySelector('details .small');if(!list)return false;
 const line=document.createElement('span');line.id='v8391Change';line.dataset.date='2026-10-18';
 const title=document.createElement('b');title.textContent='V8.30.91 — Suivi des cours dans Paramètres';
 line.appendChild(title);line.appendChild(document.createElement('br'));
 line.appendChild(document.createTextNode('Le suivi passe de la barre de navigation à Paramètres, avec un retour dédié. Aucun changement des ressources ni des données privées.'));
 line.appendChild(document.createElement('br'));list.insertBefore(line,list.firstChild);return true;
}
let attempts=0;const timer=setInterval(()=>{if(patch()||++attempts>50)clearInterval(timer)},100);
window.IFSI_V8391_CHANGELOG={patch};
})();
