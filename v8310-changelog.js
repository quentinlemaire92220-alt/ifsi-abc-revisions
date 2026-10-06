(()=>{'use strict';
function patch8310(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.10';
 if(document.getElementById('v8310Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8310Change';
 const b=document.createElement('b');b.textContent='V8.30.10 — Audit catalogue fiabilisé';
 span.appendChild(b);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('L’audit compte désormais les huit atlas, dont les 20 planches du locomoteur : 80 planches HD sont contrôlées par contrat.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('La détection des IDs Drive couvre aussi les URLs thumbnail?id, les contrôles par cours sont renforcés et le détail de l’équilibre des réponses QCM est réellement affiché.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8310()||++n>120)clearInterval(t)},120);
window.IFSI_V8310_CHANGELOG={patch:patch8310};
})();