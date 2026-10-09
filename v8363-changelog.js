(()=>{'use strict';
function patch8363(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.63';
 if(document.getElementById('v8363Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8363Change';span.dataset.date='2026-10-09';
 const title=document.createElement('b');title.textContent='V8.30.63 — Fiabilité des QCM de mathématiques';
 span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Calculs exacts rétablis : 125 µg = 0,125 mg ; 75 mL = 0,075 L ; 0,5 g/L × 250 mL = 0,125 g. Quatre énoncés peuvent désormais être compris seuls, même lorsqu’ils sont tirés au hasard. Les niveaux 8 (reconstitution et horaires) et 10 (cas complets) du parcours de mathématiques contiennent désormais des exercices existants. Les 226 QCM et les huit fiches sont conservés.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8363()||++n>40)clearInterval(t)},100);
window.IFSI_V8363_CHANGELOG={patch:patch8363};
})();
