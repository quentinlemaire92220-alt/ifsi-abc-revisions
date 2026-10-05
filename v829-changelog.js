(()=>{'use strict';
function patch829(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.29';
 if(document.getElementById('v829Change'))return true;
 const host=box.querySelector('details div.small');if(!host)return false;
 const span=document.createElement('span');span.id='v829Change';
 const b=document.createElement('b');b.textContent='V8.29 — Atlas anatomique locomoteur HD';
 span.appendChild(b);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Ajout de 20 planches anatomiques légendées : squelette, repères, os long, membre supérieur, épaule, coude, main, membre inférieur, bassin, hanche, genou, jambe, cheville, pied et rachis.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Nouvel atlas avec favoris, navigation par vignettes, recherche dans les repères et zoom plein écran tactile / molette.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Les exports WebP sont rangés dans 06 - Planches anatomiques / 03 - Exports application.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch829()||++n>120)clearInterval(t)},120);
window.IFSI_V829_CHANGELOG={patch:patch829};
})();
