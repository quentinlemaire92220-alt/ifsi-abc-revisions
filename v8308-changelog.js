(()=>{'use strict';
function patch8308(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.8';
 if(document.getElementById('v8308Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8308Change';
 const b=document.createElement('b');b.textContent='V8.30.8 — Série complète Système nerveux';
 span.appendChild(b);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Le vocal général du système nerveux est remplacé par 5 vocaux structurés.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Organisation et SNC, hémisphères et lobes, tronc cérébral et moelle, système nerveux périphérique et autonome, puis réflexes, mémoire et douleur.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('L’ancien vocal est archivé et le catalogue audio contient désormais 38 vocaux actifs.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8308()||++n>120)clearInterval(t)},120);
window.IFSI_V8308_CHANGELOG={patch:patch8308};
})();
