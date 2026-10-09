(()=>{'use strict';
function patch8364(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.64';
 if(document.getElementById('v8364Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8364Change';span.dataset.date='2026-10-10';
 const title=document.createElement('b');title.textContent='V8.30.64 — Navigation et révisions fiabilisées';
 span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Les écrans de vocabulaire et de flashcards se ferment lors du changement de rubrique. La validation des QCM et le démarrage ne dépendent plus des anciens champs supprimés. Les flashcards communes à plusieurs cours conservent une seule progression. Les alertes du contrôle des ressources, les dates et la séparation des nouveautés sont corrigées.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8364()||++n>40)clearInterval(t)},100);
window.IFSI_V8364_CHANGELOG={patch:patch8364};
})();
