(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.99';
 if(document.getElementById('v8399Change'))return true;
 const list=box.querySelector('details .small');if(!list)return false;
 const line=document.createElement('span');line.id='v8399Change';line.dataset.date='2026-10-19';
 const title=document.createElement('b');title.textContent='V8.30.99 — Paramètres simplifiés et contrôle qualité à la demande';
 line.appendChild(title);line.appendChild(document.createElement('br'));
 line.appendChild(document.createTextNode('Nouvel écran Paramètres compact : préférences réunies, contraste amélioré, actions de maintenance et sauvegardes repliables, journal consultable à la demande. Le contrôle qualité pédagogique et des ressources reste accessible, mais son audit détaillé ne s’exécute plus automatiquement. Les alertes et données existantes sont conservées.'));
 line.appendChild(document.createElement('br'));list.insertBefore(line,list.firstChild);return true;
}
let attempts=0;const timer=setInterval(()=>{if(patch()||++attempts>50)clearInterval(timer)},100);
window.IFSI_V8399_CHANGELOG={patch};
})();
