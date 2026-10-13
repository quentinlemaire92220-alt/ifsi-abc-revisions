(()=>{'use strict';
function patch8385(){const box=document.getElementById('v742Changelog');if(!box)return false;
const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.85';
if(document.getElementById('v8385Change'))return true;const host=box.querySelector('details .small');if(!host)return false;
const span=document.createElement('span');span.id='v8385Change';span.dataset.date='2026-10-13';
const title=document.createElement('b');title.textContent='V8.30.85 — Stomatothérapie — fiche illustrée et révision par cours';span.appendChild(title);span.appendChild(document.createElement('br'));
span.appendChild(document.createTextNode('Fiche, 50 QCM corrigés, 29 termes et 69 flashcards. Sept infographies expliquent les organes, les soins et les appareillages. Les vocaux seront ajoutés après réception des MP3.'));span.appendChild(document.createElement('br'));host.insertBefore(span,host.firstChild);return true;}
let n=0;const t=setInterval(()=>{if(patch8385()||++n>40)clearInterval(t)},100);window.IFSI_V8385_CHANGELOG={patch:patch8385};})();
