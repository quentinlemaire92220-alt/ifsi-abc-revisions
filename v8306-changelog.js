(()=>{'use strict';
function patch8306(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.6';
 if(document.getElementById('v8306Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8306Change';
 const b=document.createElement('b');b.textContent='V8.30.6 — Série cardiovasculaire complète';
 span.appendChild(b);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Ajout du cinquième vocal cardiovasculaire : Sang, vaisseaux sanguins et pression artérielle.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('La série Système cardiovasculaire contient désormais 5 vocaux dans le lecteur audio.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8306()||++n>120)clearInterval(t)},120);
window.IFSI_V8306_CHANGELOG={patch:patch8306};
})();
