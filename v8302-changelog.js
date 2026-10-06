(()=>{'use strict';
function patch8302(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.2';
 if(document.getElementById('v8302Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8302Change';
 const b=document.createElement('b');b.textContent='V8.30.2 — Locomoteur en consultation stable';
 span.appendChild(b);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Les modes S’entraîner et Tester sont retirés du locomoteur : les légendes étant intégrées directement dans les images, leur masquage sélectif n’est pas fiable sans planches muettes dédiées.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Le module conserve les 20 planches HD, les filtres, les favoris, la navigation, les repères et le zoom, avec un sizing mobile verrouillé pour éviter les débordements.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8302()||++n>120)clearInterval(t)},120);
window.IFSI_V8302_CHANGELOG={patch:patch8302};
})();