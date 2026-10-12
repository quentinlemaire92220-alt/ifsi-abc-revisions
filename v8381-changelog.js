(()=>{'use strict';
function patch8381(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.81';
 if(document.getElementById('v8381Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8381Change';span.dataset.date='2026-10-12';
 const title=document.createElement('b');title.textContent='V8.30.81 — Supports officiels directement dans le catalogue des cours';
 span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Chaque carte de cours avec support dispose d’un lien direct vers Google Drive, sans ouvrir d’abord la fiche du cours.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Dans A1, les trois supports d’épistémologie sont maintenant accessibles séparément depuis le détail du cours.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8381()||++n>40)clearInterval(t)},100);
window.IFSI_V8381_CHANGELOG={patch:patch8381};
})();
