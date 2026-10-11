(()=>{'use strict';
function patch8372(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.72';
 if(document.getElementById('v8372Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8372Change';span.dataset.date='2026-10-11';
 const title=document.createElement('b');title.textContent='V8.30.72 — Plaies et pansements : révision et flashcards';
 span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('UE B3, partie 1/2 : fiche illustrée de 16 pages, 50 QCM avec corrigé argumenté, 40 flashcards et six infographies. Les cinq scripts vocaux sont prêts à convertir ; les audios seront ajoutés après réception des MP3.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8372()||++n>40)clearInterval(t)},100);
window.IFSI_V8372_CHANGELOG={patch:patch8372};
})();
