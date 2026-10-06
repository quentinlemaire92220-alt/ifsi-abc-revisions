(()=>{'use strict';
function patch8328(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.28';
 if(document.getElementById('v8328Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8328Change';span.dataset.date='2026-10-06';
 const title=document.createElement('b');title.textContent='V8.30.28 — Infographies Psychologie de la santé';
 span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Ajout de 2 infographies pour la Partie 01 : santé globale, santé perçue et qualité de vie.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Les deux supports sont disponibles dans l’onglet Infographies, UE S1 B2.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8328()||++n>40)clearInterval(t)},100);
window.IFSI_V8328_CHANGELOG={patch:patch8328};
})();