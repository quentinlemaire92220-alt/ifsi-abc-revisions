(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.118';
 if(document.getElementById('v8418Change'))return true;
 const list=box.querySelector('details .small');if(!list)return false;
 const line=document.createElement('span');line.id='v8418Change';line.dataset.date='2026-10-23';
 const b=document.createElement('b');b.textContent='V8.30.118 — Droits des patients — complément du 21 octobre';
 line.append(b,document.createElement('br'));
 line.append(document.createTextNode('Ajout d’une fiche complémentaire de 22 pages, de 20 QCM et de 24 flashcards. Les supports et les six MP3 historiques sont conservés ; le nouveau complément audio est attendu.'));
 line.appendChild(document.createElement('br'));list.insertBefore(line,list.firstChild);return true;
}
let n=0;const timer=setInterval(()=>{if(patch()||++n>50)clearInterval(timer)},100);
window.IFSI_V8418_CHANGELOG={patch};
})();
