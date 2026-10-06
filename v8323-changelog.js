(()=>{'use strict';
function patch8323(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.23';
 if(document.getElementById('v8323Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8323Change';span.dataset.date='2026-10-06';
 const title=document.createElement('b');title.textContent='V8.30.23 — Introduction à la pharmacologie';
 span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Nouvelle fiche de révision : Introduction à la pharmacologie.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('60 QCM interactifs sont disponibles avec leur thème et leur niveau : 18 faciles, 30 moyens et 12 difficiles.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Les révisions couvrent notamment le médicament, les formes d’administration, la pharmacodynamie, la pharmacocinétique, les interactions, la prescription et la pharmacovigilance.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8323()||++n>40)clearInterval(t)},100);
window.IFSI_V8323_CHANGELOG={patch:patch8323};
})();
