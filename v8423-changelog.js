(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 window.IFSI_V8422_CHANGELOG?.patch?.();
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.123';
 const entries=box.querySelector('details .small');if(!entries)return false;
 if(!document.getElementById('v8423Change')){
  const line=document.createElement('span');line.id='v8423Change';line.dataset.date='2026-10-25';
  const heading=document.createElement('b');heading.textContent='V8.30.123 — Bientraitance PROVISOIRE';
  line.append(heading,document.createElement('br'));
  line.append(document.createTextNode('Fiche de révision (12 pages), 40 QCM corrigés et 40 flashcards. Sources orales uniquement : support officiel à compléter. Script vocal préparé, aucun MP3.'));
  line.append(document.createElement('br'));entries.insertBefore(line,entries.firstChild);
 }
 return true;
}
let attempts=0;const timer=setInterval(()=>{if(patch()||++attempts>80)clearInterval(timer)},100);
window.IFSI_V8423_CHANGELOG={patch};
})();
