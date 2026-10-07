(()=>{'use strict';
function patch8335(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.35';
 if(document.getElementById('v8335Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8335Change';span.dataset.date='2026-10-07';
 const title=document.createElement('b');title.textContent='V8.30.35 — Administration médicamenteuse';
 span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Ajout du cours UE S1 B3 « Initiation à l’administration médicamenteuse ».'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('La fiche de révision et 5 infographies sont désormais accessibles depuis le cours : sécurisation et 7 bons, prescription/traçabilité, voies et matériel, préparation du médicament, surveillance et incidents.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8335()||++n>40)clearInterval(t)},100);
window.IFSI_V8335_CHANGELOG={patch:patch8335};
})();
