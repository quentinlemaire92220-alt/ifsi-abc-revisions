(()=>{'use strict';
function patch8312(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.12';
 if(document.getElementById('v8312Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8312Change';
 const b=document.createElement('b');b.textContent='V8.30.12 — Accueil et Révision réorganisés';
 span.appendChild(b);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Le bloc « À faire aujourd’hui » quitte l’accueil et devient « Ma révision » dans le centre Révision, avec un accès direct pour commencer une session.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('« Quoi de neuf ? » distingue désormais les ressources ajoutées des évolutions de l’application avec les repères UX/UI, Technique et Correctif.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Le groupe WhatsApp de remontée est renommé « Technique ».'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8312()||++n>120)clearInterval(t)},120);
window.IFSI_V8312_CHANGELOG={patch:patch8312};
})();
