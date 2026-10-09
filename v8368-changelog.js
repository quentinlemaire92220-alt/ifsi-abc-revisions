(()=>{'use strict';
function patch8368(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.68';
 if(document.getElementById('v8368Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8368Change';span.dataset.date='2026-10-10';
 const title=document.createElement('b');title.textContent='V8.30.68 — Reprise des erreurs en entraînement';
 span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Le mode Erreurs à revoir démarre en entraînement, avec correction après chaque question, même après un examen blanc. Le bilan stable et les autres correctifs sont conservés.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8368()||++n>40)clearInterval(t)},100);
window.IFSI_V8368_CHANGELOG={patch:patch8368};
})();
