(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.97';
 if(document.getElementById('v8397Change'))return true;
 const list=box.querySelector('details .small');if(!list)return false;
 const line=document.createElement('span');line.id='v8397Change';line.dataset.date='2026-10-19';
 const title=document.createElement('b');title.textContent='V8.30.97 — Suivi des planches du système reproducteur';
 line.appendChild(title);line.appendChild(document.createElement('br'));
 line.appendChild(document.createTextNode('Dans Anatomie & Physiologie, une rubrique Système reproducteur recense les sept planches prévues : six maquettes Canva en revue anatomique et une planche à refaire. Aucun visuel non validé n’est publié, aucun mode test ou QCM anatomique ajouté. L’accès au lien Canva de revue reste facultatif et local sur votre appareil.'));
 line.appendChild(document.createElement('br'));list.insertBefore(line,list.firstChild);return true;
}
let tries=0;const timer=setInterval(()=>{if(patch()||++tries>50)clearInterval(timer)},100);
window.IFSI_V8397_CHANGELOG={patch};
})();
