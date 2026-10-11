(()=>{'use strict';
function patch8372(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.72';
 if(document.getElementById('v8372Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8372Change';span.dataset.date='2026-10-11';
 const title=document.createElement('b');title.textContent='V8.30.72 — Corrections QCM plus lisibles';
 span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('En thème sombre, le bloc « Ta réponse / Bonne réponse » utilise désormais des couleurs cohérentes et lisibles.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Les mentions inutiles comme « selon le cours » sont retirées des questions. La question sur le diabète insipide a été reformulée avec des propositions plus directes.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8372()||++n>40)clearInterval(t)},100);
window.IFSI_V8372_CHANGELOG={patch:patch8372};
})();
