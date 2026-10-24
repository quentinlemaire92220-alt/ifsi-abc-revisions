(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.120';
 if(document.getElementById('v8420Change'))return true;
 const list=box.querySelector('details .small');if(!list)return false;
 const line=document.createElement('span');line.id='v8420Change';line.dataset.date='2026-10-24';
 const title=document.createElement('b');title.textContent='V8.30.120 — TD1 Communication : support, fiche, QCM et flashcards';
 line.append(title,document.createElement('br'));
 line.append(document.createTextNode('Ajout du TD1 La communication : support officiel, fiche écrite, 50 QCM corrigés et 40 flashcards. Deux scripts vocaux restent en attente de MP3.'));
 line.append(document.createElement('br'));list.insertBefore(line,list.firstChild);return true;
}
let attempts=0;const timer=setInterval(()=>{if(patch()||++attempts>80)clearInterval(timer)},100);
window.IFSI_V8419_CHANGELOG={patch};
})();
