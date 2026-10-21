(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.112';
 if(document.getElementById('v8412Change'))return true;
 const list=box.querySelector('details .small');if(!list)return false;
 const line=document.createElement('span');line.id='v8412Change';line.dataset.date='2026-10-21';
 const b=document.createElement('b');b.textContent='V8.30.112 — Synchronisation privée des supports Pathologies';
 line.append(b,document.createElement('br'));
 line.append(document.createTextNode('Connexion au compte Supabase par lien e-mail, stockage privé des supports BPCO, HTA et diabète avec accès strict par compte. Le premier import du fichier JSON est nécessaire une seule fois ; les appareils connectés récupèrent ensuite automatiquement les fiches, planches et exercices provisoires. Aucune publication pédagogique ni statistique des réponses.'));
 line.appendChild(document.createElement('br'));list.insertBefore(line,list.firstChild);return true;
}
let n=0;const timer=setInterval(()=>{if(patch()||++n>50)clearInterval(timer)},100);
window.IFSI_V8412_CHANGELOG={patch};
})();