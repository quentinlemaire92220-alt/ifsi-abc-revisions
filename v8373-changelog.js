(()=>{'use strict';
function patch8373(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.73';
 if(document.getElementById('v8373Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8373Change';span.dataset.date='2026-10-11';
 const title=document.createElement('b');title.textContent='V8.30.73 — Douleur : ressources officielles';
 span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('La fiche de Douleur et ses 52 QCM sont désormais ceux du support officiel Catherine Machado 2026. La mention provisoire est retirée. Le système respiratoire affiche la provenance officielle de sa fiche.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8373()||++n>40)clearInterval(t)},100);
window.IFSI_V8373_CHANGELOG={patch:patch8373};
})();
