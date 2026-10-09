(()=>{'use strict';
function patch8367(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.67';
 if(document.getElementById('v8367Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8367Change';span.dataset.date='2026-10-10';
 const title=document.createElement('b');title.textContent='V8.30.67 — Bilan QCM stable';
 span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Le bilan de fin de série cesse de se reconstruire en boucle. Les boutons Centre, erreurs et thème restent utilisables, sans recompter une session déjà enregistrée.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8367()||++n>40)clearInterval(t)},100);
window.IFSI_V8367_CHANGELOG={patch:patch8367};
})();
