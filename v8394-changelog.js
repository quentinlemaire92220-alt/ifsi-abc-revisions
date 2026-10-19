(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.94';
 if(document.getElementById('v8394Change'))return true;
 const list=box.querySelector('details .small');if(!list)return false;
 const line=document.createElement('span');line.id='v8394Change';line.dataset.date='2026-10-19';
 const title=document.createElement('b');title.textContent='V8.30.94 — 5 vocaux retrouvés';
 line.appendChild(title);line.appendChild(document.createElement('br'));
 line.appendChild(document.createTextNode('Trois vocaux Virus et deux vocaux Système locomoteur sont disponibles avec leur durée. Les enregistrements historiques sont conservés dans leur format d’origine ; le cours complet de traumatologie dure environ 29 minutes.'));
 line.appendChild(document.createElement('br'));list.insertBefore(line,list.firstChild);return true;
}
let attempts=0;const timer=setInterval(()=>{if(patch()||++attempts>50)clearInterval(timer)},100);
window.IFSI_V8394_CHANGELOG={patch};
})();

