(()=>{'use strict';
function patch8340(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.40';
 if(document.getElementById('v8340Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8340Change';span.dataset.date='2026-10-08';
 const title=document.createElement('b');title.textContent='V8.30.40 — Correction intervenants FAC/KB';
 span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('À partir du 8 octobre, les intervenants des cours FAC/KB sont alignés sur le planning CM fourni.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Le cours « Les droits du patient » du 8 octobre 9h–12h30 est attribué à Timothy JAMES et « Appareil reproducteur » 13h30–15h30 à Vanessa PETIT.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8340()||++n>40)clearInterval(t)},100);
window.IFSI_V8340_CHANGELOG={patch:patch8340};
})();
