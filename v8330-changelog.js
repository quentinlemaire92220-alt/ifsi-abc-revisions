(()=>{'use strict';
function patch8330(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.30';
 if(document.getElementById('v8330Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8330Change';span.dataset.date='2026-10-07';
 const title=document.createElement('b');title.textContent='V8.30.30 — Planning de promo enrichi';
 span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Le planning affiche maintenant le cours en cours ou le prochain cours, ainsi que la date de dernière mise à jour.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Les cours déjà présents dans le catalogue peuvent ouvrir directement leurs ressources depuis le planning.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Les prochains ajouts, suppressions ou changements de créneau pourront être signalés automatiquement sur l’appareil.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8330()||++n>40)clearInterval(t)},100);
window.IFSI_V8330_CHANGELOG={patch:patch8330};
})();
