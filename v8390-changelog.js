(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.90';
 if(document.getElementById('v8390Change'))return true;
 const list=box.querySelector('details .small');if(!list)return false;
 const line=document.createElement('span');line.id='v8390Change';line.dataset.date='2026-10-18';
 const title=document.createElement('b');title.textContent='V8.30.90 — Nouveau suivi des cours';line.appendChild(title);
 line.appendChild(document.createElement('br'));
 line.appendChild(document.createTextNode('Inventaire par cours, repérage des références absentes, filtre UE et agenda B1. Sources personnelles conservées hors application.'));
 line.appendChild(document.createElement('br'));list.insertBefore(line,list.firstChild);return true;
}
let attempts=0;const timer=setInterval(()=>{if(patch()||++attempts>50)clearInterval(timer)},100);
window.IFSI_V8390_CHANGELOG={patch};
})();