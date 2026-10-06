(()=>{'use strict';
function patch8321(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.21';
 if(document.getElementById('v8321Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8321Change';span.dataset.date='2026-10-06';
 const title=document.createElement('b');title.textContent='V8.30.21 — Psychologie de la santé';
 span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Nouvelle fiche de révision B2 : Psychologie de la santé — Partie 01.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('La ressource est classée dans le domaine B.2 et rattachée au courseId psychologie_sante.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Le catalogue Drive, le registre des cours et le cache PWA ont été synchronisés.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8321()||++n>40)clearInterval(t)},100);
window.IFSI_V8321_CHANGELOG={patch:patch8321};
})();
