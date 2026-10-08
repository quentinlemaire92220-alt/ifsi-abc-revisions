(()=>{'use strict';
function patch8353(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.53';
 if(document.getElementById('v8353Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8353Change';span.dataset.date='2026-10-08';
 const title=document.createElement('b');title.textContent='V8.30.53 — Système reproducteur';
 span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Ajout du cours UE S1 B1 « Système reproducteur », de sa fiche de révision et de 5 vocaux.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Les vocaux couvrent l’appareil génital masculin, l’appareil génital féminin, l’ovogenèse et le cycle menstruel, la spermatogenèse, puis la fécondation et la nidation.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8353()||++n>40)clearInterval(t)},100);
window.IFSI_V8353_CHANGELOG={patch:patch8353};
})();
