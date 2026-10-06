(()=>{'use strict';
function patch8303(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.3';
 if(document.getElementById('v8303Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8303Change';
 const b=document.createElement('b');b.textContent='V8.30.3 — Accueil synchronisé au démarrage';
 span.appendChild(b);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Les nouveautés, la proposition d’amélioration et les compteurs du jour sont maintenant synchronisés dès le premier affichage de l’application.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Le compteur des vocaux est rafraîchi dès que le catalogue audio est chargé, sans devoir changer d’onglet puis revenir à l’accueil.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('L’état visuel de l’accueil est également resynchronisé après chaque navigation.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8303()||++n>120)clearInterval(t)},120);
window.IFSI_V8303_CHANGELOG={patch:patch8303};
})();