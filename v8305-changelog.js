(()=>{'use strict';
function patch8305(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.5';
 if(document.getElementById('v8305Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8305Change';
 const b=document.createElement('b');b.textContent='V8.30.5 — Cours plus clairs et révision mieux séparée';
 span.appendChild(b);span.appendChild(document.createElement('br'));
 [
  'Dans Cours, les filtres avancés ont été retirés : les QCM lancés depuis un cours restent uniquement dans ce cours.',
  'La personnalisation (cours, thème, difficulté, nombre de questions et mode) est regroupée dans Révision.',
  'Le bouton Favori d’une question n’est plus dupliqué et le libellé cours/thème n’est plus répété.',
  'Les écrans Cours et Révision sont plus aérés et la marge basse évite que la navigation masque les actions.'
 ].forEach(t=>{span.appendChild(document.createTextNode('• '+t));span.appendChild(document.createElement('br'))});
 span.appendChild(document.createElement('br'));host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8305()||++n>120)clearInterval(t)},120);
window.IFSI_V8305_CHANGELOG={patch:patch8305};
})();
