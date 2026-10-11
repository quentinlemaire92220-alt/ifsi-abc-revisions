(()=>{'use strict';
function patch8371(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.71';
 if(document.getElementById('v8371Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8371Change';span.dataset.date='2026-10-11';
 const title=document.createElement('b');title.textContent='V8.30.71 — S8 et repères de lieu';
 span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('La S8 du 19 au 24 octobre est ajoutée après recoupement du site officiel de la promo avec le planning CM FAC.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Le bloc Aujourd’hui n’affiche désormais que les cours du jour : il ne saute plus au prochain lundi.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Les journées affichent une pastille de lieu : IFSI ABC, FAC KB ou Distanciel.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8371()||++n>40)clearInterval(t)},100);
window.IFSI_V8371_CHANGELOG={patch:patch8371};
})();
