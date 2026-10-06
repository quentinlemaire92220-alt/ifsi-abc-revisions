(()=>{'use strict';
function patch8314(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.14';
 if(document.getElementById('v8314Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8314Change';
 const title=document.createElement('b');title.textContent='V8.30.14 — Ma révision rendue fiable';
 span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Le bloc « Ma révision » est maintenant injecté directement dans le centre Révision même si l’ancien tableau de bord n’est pas présent au moment du chargement.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('La mise en page de l’examen blanc est aussi contrainte pour éviter le débordement horizontal observé sur la fenêtre desktop.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8314()||++n>120)clearInterval(t)},120);
window.IFSI_V8314_CHANGELOG={patch:patch8314};
})();
