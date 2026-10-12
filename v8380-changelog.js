(()=>{'use strict';
function patch8380(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.80';
 if(document.getElementById('v8380Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8380Change';span.dataset.date='2026-10-12';
 const title=document.createElement('b');title.textContent='V8.30.80 — Supports officiels accessibles depuis chaque cours';
 span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Un raccourci vers le support du cours est disponible dans chaque fiche de cours. 34 cours renvoient vers leurs documents Drive, dont certains dossiers contenant plusieurs parties.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Quand le support est absent, le statut est signalé. Les supports partiels sont distingués des documents complets.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8380()||++n>40)clearInterval(t)},100);
window.IFSI_V8380_CHANGELOG={patch:patch8380};
})();
