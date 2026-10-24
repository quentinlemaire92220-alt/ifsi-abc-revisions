(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.119';
 if(document.getElementById('v8419Change'))return true;
 const list=box.querySelector('details .small');if(!list)return false;
 const line=document.createElement('span');line.id='v8419Change';line.dataset.date='2026-10-24';
 const b=document.createElement('b');b.textContent='V8.30.119 — UE D1.1 : TD1 La communication';
 line.append(b,document.createElement('br'));
 line.append(document.createTextNode('Nouveau cours : support officiel, fiche de révision, 50 QCM regroupés par thème avec corrigés argumentés à la fin, 40 flashcards. Vocaux à venir.'));
 line.appendChild(document.createElement('br'));list.insertBefore(line,list.firstChild);return true;
}
let n=0;const timer=setInterval(()=>{if(patch()||++n>50)clearInterval(timer)},100);
window.IFSI_V8419_CHANGELOG={patch};
})();
