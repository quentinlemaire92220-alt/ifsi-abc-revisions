(()=>{'use strict';
function patch8311(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.11';
 if(document.getElementById('v8311Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8311Change';
 const b=document.createElement('b');b.textContent='V8.30.11 — Série complète Système urinaire';
 span.appendChild(b);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Ajout de 4 vocaux : organisation et fonctions des reins, néphron et circulation rénale, formation de l’urine, puis régulation de l’eau, voies urinaires et miction.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Le catalogue audio contient désormais 42 vocaux actifs.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8311()||++n>120)clearInterval(t)},120);
window.IFSI_V8311_CHANGELOG={patch:patch8311};
})();
