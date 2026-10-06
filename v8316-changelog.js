(()=>{'use strict';
function patch8316(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.16';
 if(document.getElementById('v8316Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8316Change';
 const title=document.createElement('b');title.textContent='V8.30.16 — Introduction au droit';
 span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Ajout du cours A.2 « Introduction au droit » avec sa fiche de révision et une banque de 50 QCM.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Les 50 questions possèdent un niveau explicite : Facile, Moyen ou Difficile, utilisable par le filtre de révision.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('L’arborescence Drive, le registre des cours et la fiche Drive sont synchronisés avec l’application.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8316()||++n>40)clearInterval(t)},100);
window.IFSI_V8316_CHANGELOG={patch:patch8316};
})();