(()=>{'use strict';
function patch8336(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.36';
 if(document.getElementById('v8336Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8336Change';span.dataset.date='2026-10-07';
 const title=document.createElement('b');title.textContent='V8.30.36 — Normes des paramètres vitaux';
 span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Ajout d’une 4e infographie dans UE S1 B3 « Paramètres vitaux ».'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('La nouvelle planche regroupe les principales normes et repères du cours : température, fréquence cardiaque, pression artérielle, fréquence respiratoire, SpO₂, glycémie, diurèse et élimination.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8336()||++n>40)clearInterval(t)},100);
window.IFSI_V8336_CHANGELOG={patch:patch8336};
})();
