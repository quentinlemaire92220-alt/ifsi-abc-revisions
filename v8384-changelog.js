(()=>{'use strict';
function patch8384(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.84';
 if(document.getElementById('v8384Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8384Change';span.dataset.date='2026-10-12';
 const title=document.createElement('b');title.textContent='V8.30.84 — Sources des cours clairement séparées des fiches de révision';
 span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Chaque cours distingue le support officiel du professeur, les éventuelles captures provisoires et les fiches de révision produites pour apprendre. Aucun PDF de révision ne remplace automatiquement un original manquant.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createTextNode('Contrôles automatiques anti-confusion ajoutés.'));span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8384()||++n>40)clearInterval(t)},100);
window.IFSI_V8384_CHANGELOG={patch:patch8384};
})();
