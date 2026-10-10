(()=>{'use strict';
function patch8370(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.70';
 if(document.getElementById('v8370Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8370Change';span.dataset.date='2026-10-10';
 const title=document.createElement('b');title.textContent='V8.30.70 — QCM de maths et accueil corrigés';
 span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Le pack de maths est de nouveau lisible dans le navigateur : les 226 questions sont disponibles. Les ressources de l’accueil sont triées de la plus récente à la plus ancienne et les mises à jour techniques restent dans les paramètres.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8370()||++n>40)clearInterval(t)},100);
window.IFSI_V8370_CHANGELOG={patch:patch8370};
})();
