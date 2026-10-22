(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.114';
 if(document.getElementById('v8414Change'))return true;
 const list=box.querySelector('details .small');if(!list)return false;
 const line=document.createElement('span');line.id='v8414Change';line.dataset.date='2026-10-22';
 const b=document.createElement('b');b.textContent='V8.30.114 — Douleur : 16 planches infographiées';
 line.append(b,document.createElement('br'));
 line.append(document.createTextNode('Ajout du PDF de 16 planches UE B3.3 S1, construit sur le support Catherine Machado. Synthèse complémentaire non exhaustive : ancienne fiche, 52 QCM, 3 vocaux et infographies historiques conservés.'));
 line.appendChild(document.createElement('br'));list.insertBefore(line,list.firstChild);return true;
}
let n=0;const timer=setInterval(()=>{if(patch()||++n>50)clearInterval(timer)},100);
window.IFSI_V8414_CHANGELOG={patch};
})();
