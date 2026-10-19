(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.96';
 if(document.getElementById('v8396Change'))return true;
 const list=box.querySelector('details .small');if(!list)return false;
 const line=document.createElement('span');line.id='v8396Change';line.dataset.date='2026-10-19';
 const title=document.createElement('b');title.textContent='V8.30.96 — 25 nouveaux vocaux de révision';
 line.appendChild(title);line.appendChild(document.createElement('br'));
 line.appendChild(document.createTextNode('25 nouveaux épisodes audio pour six cours : système endocrinien (5), système digestif (5), système immunitaire (5), anatomie locomotrice (5), homéostasie (3) et niveaux d’organisation du corps humain (2). Les 80 vocaux précédents restent disponibles. Tous les nouveaux épisodes durent moins de 10 minutes.'));
 line.appendChild(document.createElement('br'));list.insertBefore(line,list.firstChild);return true;
}
let attempts=0;const timer=setInterval(()=>{if(patch()||++attempts>50)clearInterval(timer)},100);
window.IFSI_V8396_CHANGELOG={patch};
})();
