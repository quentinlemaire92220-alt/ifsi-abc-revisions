(()=>{'use strict';
function patch8334(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.34';
 if(document.getElementById('v8334Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8334Change';span.dataset.date='2026-10-07';
 const title=document.createElement('b');title.textContent='V8.30.34 — Planning plus ergonomique';
 span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Le planning est maintenant plus compact avec les sélecteurs Promo et Semaine regroupés en haut de l’écran.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Le bloc Aujourd’hui fusionne le cours en cours et le prochain créneau, sans répéter toute la journée.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('La semaine est affichée sous forme de journées repliables, avec la source clairement distinguée : S5/S6 support IFSI et S7 saisie depuis photo.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8334()||++n>40)clearInterval(t)},100);
window.IFSI_V8334_CHANGELOG={patch:patch8334};
})();
