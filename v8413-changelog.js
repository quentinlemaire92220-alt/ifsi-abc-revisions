(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.113';
 if(document.getElementById('v8413Change'))return true;
 const list=box.querySelector('details .small');if(!list)return false;
 const line=document.createElement('span');line.id='v8413Change';line.dataset.date='2026-10-21';
 const b=document.createElement('b');b.textContent='V8.30.113 — Plaies et pansements, Partie 1/2 — QCM V4.2';
 line.append(b,document.createElement('br'));
 line.append(document.createTextNode('50 QCM V4.2 et corrections argumentées synchronisés, avec les deux PDF étudiants vérifiés. Les 50 identifiants, 86 bonnes propositions et 40 flashcards sont conservés ; autres cours, statistiques et ressources inchangés.'));
 line.appendChild(document.createElement('br'));list.insertBefore(line,list.firstChild);return true;
}
let n=0;const timer=setInterval(()=>{if(patch()||++n>50)clearInterval(timer)},100);
window.IFSI_V8413_CHANGELOG={patch};
})();
