(()=>{'use strict';
function patch8305(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.5';
 if(document.getElementById('v8305Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8305Change';
 const b=document.createElement('b');b.textContent='V8.30.5 — Vocaux cardiovasculaires';
 span.appendChild(b);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Ajout des quatre premiers vocaux du système cardiovasculaire dans le lecteur audio : circulation et trajet du sang, anatomie du cœur et valves, paroi cardiaque et conduction, cycle et débit cardiaque.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Les fichiers sont rattachés au courseId systeme_cardiovasculaire et lus directement depuis Google Drive.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8305()||++n>120)clearInterval(t)},120);
window.IFSI_V8305_CHANGELOG={patch:patch8305};
})();
