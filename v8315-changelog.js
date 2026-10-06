(()=>{'use strict';
function patch8315(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.15';
 if(document.getElementById('v8315Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8315Change';
 const title=document.createElement('b');title.textContent='V8.30.15 — Démarrage sans retour à l’ancienne interface';
 span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Correction du conflit entre le journal historique V8.27 et l’interface actuelle « Ressources ajoutées » au lancement.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('L’ancien journal ne réécrit plus le DOM toutes les 100 ms et les boucles de stabilisation de l’accueil sont arrêtées dès que l’interface moderne est prête.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Le démarrage conserve directement la vue actuelle au lieu d’alterner avec l’ancienne pendant plusieurs secondes.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8315()||++n>40)clearInterval(t)},100);
window.IFSI_V8315_CHANGELOG={patch:patch8315};
})();