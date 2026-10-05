(()=>{'use strict';
function patch822(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 if(!document.getElementById('v8231Change')){
  const host=box.querySelector('details div.small');if(!host)return false;
  const span=document.createElement('span');span.id='v8231Change';
  const b=document.createElement('b');b.textContent='V8.23.1 - Correction et optimisation Anatomie';
  span.appendChild(b);span.appendChild(document.createElement('br'));
  span.appendChild(document.createTextNode('Chargement direct des modules, atlas respiratoire et urinaire fiabilisés, systèmes manquants visibles et atlas lourds repliés par défaut.'));
  span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
  host.insertBefore(span,host.firstChild);
 }
 if(!document.getElementById('v822Change')){
  const host=box.querySelector('details div.small');if(!host)return false;
  const span=document.createElement('span');span.id='v822Change';
  const b=document.createElement('b');b.textContent='V8.22 - Atlas anatomique du systeme nerveux';
  span.appendChild(b);span.appendChild(document.createElement('br'));
  span.appendChild(document.createTextNode('8 planches HD. Infographies separees. Zoom, favoris et Voir/Masquer disponibles.'));
  span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
  host.insertBefore(span,host.firstChild);
 }
 return true
}
let n=0;const t=setInterval(()=>{if(patch822()||++n>120)clearInterval(t)},120);
window.IFSI_V822_CHANGELOG={patch:patch822};
})();