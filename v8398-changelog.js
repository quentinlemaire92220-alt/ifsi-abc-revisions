(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.98';
 if(document.getElementById('v8398Change'))return true;
 const list=box.querySelector('details .small');if(!list)return false;
 const line=document.createElement('span');line.id='v8398Change';line.dataset.date='2026-10-19';
 const title=document.createElement('b');title.textContent='V8.30.98 — Sécurisation des planches anatomiques';
 line.appendChild(title);line.appendChild(document.createElement('br'));
 line.appendChild(document.createTextNode('Deux illustrations anatomiques nécessitent une vérification : voies aériennes supérieures et ancienne coupe rénale. Leur affichage et leur zoom sont temporairement désactivés. Les atlas respiratoire, urinaire, endocrinien, immunitaire et locomoteur indiquent clairement lorsque la validation médicale n’est pas tracée. Les 106 planches du catalogue restent référencées ; les six maquettes Canva du système reproducteur ne sont toujours pas publiées.'));
 line.appendChild(document.createElement('br'));list.insertBefore(line,list.firstChild);return true;
}
let attempts=0;const timer=setInterval(()=>{if(patch()||++attempts>50)clearInterval(timer)},100);
window.IFSI_V8398_CHANGELOG={patch};
})();
