(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.122';
 const entries=box.querySelector('details .small');if(!entries)return false;
 if(!document.getElementById('v8422Change')){
  const note=document.createElement('span');note.id='v8422Change';note.dataset.date='2026-10-24';
  const heading=document.createElement('b');heading.textContent='V8.30.122 — TD2 Posture professionnelle';
  note.append(heading,document.createElement('br'));
  note.append(document.createTextNode('Fiche écrite (17 pages), QCM (40 questions) et flashcards (40 cartes) intégrés. Correction du QCM 3 ; revue orale de PT02 limitée à l’extrait reçu.'));
  note.append(document.createElement('br'));entries.insertBefore(note,entries.firstChild);
 }
 if(document.getElementById('v8421Change'))return true;
 const list=box.querySelector('details .small');if(!list)return false;
 const line=document.createElement('span');line.id='v8421Change';line.dataset.date='2026-10-24';
 const title=document.createElement('b');title.textContent='V8.30.121 — Accueil : affichage de la bannière corrigé';
 line.append(title,document.createElement('br'));
 line.append(document.createTextNode('La bannière IFSI ABC avec le portrait infirmier et le message sur la gratuité sont désormais visibles sur l’accueil.'));
 line.append(document.createElement('br'));list.insertBefore(line,list.firstChild);return true;
}
let attempts=0;const timer=setInterval(()=>{if(patch()||++attempts>80)clearInterval(timer)},100);
window.IFSI_V8421_CHANGELOG={patch};
})();
