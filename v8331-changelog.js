(()=>{'use strict';
function patch8331(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.31';
 if(document.getElementById('v8331Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8331Change';span.dataset.date='2026-10-07';
 const title=document.createElement('b');title.textContent='V8.30.31 — Correctif QCM Épistémologie';
 span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Correction de la vérité des réponses multiples du cours Épistémologie et savoirs infirmiers, notamment la Q17 sur l’école du caring.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Les surcharges runtime ont été réalignées avec les grilles officielles et les QCM restent limités à 1–3 bonnes réponses.'));
 span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Un contrôle automatique vérifie désormais le résultat final après fusion des banques QCM.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8331()||++n>40)clearInterval(t)},100);
window.IFSI_V8331_CHANGELOG={patch:patch8331};
})();
