(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.115';
 if(document.getElementById('v8415Change'))return true;
 const list=box.querySelector('details .small');if(!list)return false;
 const line=document.createElement('span');line.id='v8415Change';line.dataset.date='2026-10-22';
 const b=document.createElement('b');b.textContent='V8.30.115 — Infographies Douleur : accès simplifié';
 line.append(b,document.createElement('br'));
 line.append(document.createTextNode('Le pack des 16 planches du cours Douleur est correctement identifié par UE B3.3 S1 et son titre pédagogique. Recherche et filtres corrigés ; la fiche, les 52 QCM, les 3 vocaux et les 4 infographies historiques sont conservés.'));
 line.appendChild(document.createElement('br'));list.insertBefore(line,list.firstChild);return true;
}
let n=0;const timer=setInterval(()=>{if(patch()||++n>50)clearInterval(timer)},100);
window.IFSI_V8415_CHANGELOG={patch};
})();
