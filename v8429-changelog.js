(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 window.IFSI_V8428_CHANGELOG?.patch?.();
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.129';
 const entries=box.querySelector('details .small');if(!entries)return false;
 if(!document.getElementById('v8429Change')){
  const line=document.createElement('span');line.id='v8429Change';line.dataset.date='2026-10-25';
  const heading=document.createElement('b');heading.textContent='V8.30.129 — Navigation pédagogique des cours sécurisée';
  line.append(heading,document.createElement('br'));
  line.append(document.createTextNode('Retrouvez les 55 cours par Domaine et UE, les intitulés pédagogiques du Drive, les pastilles Provisoire explicatives et les ressources dans l’ordre Support, Fiche, QCM, Infographies et Vocaux. Interface claire/sombre et garde-fou anti-gel.'));
  line.append(document.createElement('br'));entries.insertBefore(line,entries.firstChild);
 }
 return true;
}
let attempts=0;const timer=setInterval(()=>{if(patch()||++attempts>80)clearInterval(timer)},100);
window.IFSI_V8429_CHANGELOG={patch};
})();