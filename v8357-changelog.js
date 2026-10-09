(()=>{'use strict';
function patch8357(){
  const box=document.getElementById('v742Changelog');if(!box)return false;
  const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.57';
  if(document.getElementById('v8357Change'))return true;
  const host=box.querySelector('details .small');if(!host)return false;
  const span=document.createElement('span');span.id='v8357Change';span.dataset.date='2026-10-09';
  const title=document.createElement('b');title.textContent='V8.30.57 — Accès QCM par cours rétabli';
  span.appendChild(title);span.appendChild(document.createElement('br'));
  span.appendChild(document.createTextNode('Une carte « QCM par cours » est de nouveau accessible juste après « Ma révision ». Choisis le domaine, le cours, le thème, la difficulté, la taille et le mode Entraînement ou Examen ; les QCM existants et leurs corrections sont conservés.'));
  span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));host.insertBefore(span,host.firstChild);return true;
}
let n=0;const timer=setInterval(()=>{if(patch8357()||++n>40)clearInterval(timer)},100);
window.IFSI_V8357_CHANGELOG={patch:patch8357};
})();