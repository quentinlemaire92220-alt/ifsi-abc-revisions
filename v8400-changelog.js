(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.100';
 if(document.getElementById('v8400Change'))return true;
 const list=box.querySelector('details .small');if(!list)return false;
 const line=document.createElement('span');line.id='v8400Change';line.dataset.date='2026-10-19';
 const title=document.createElement('b');title.textContent='V8.30.100 — Consulter les six maquettes du reproducteur en privé';
 line.appendChild(title);line.appendChild(document.createElement('br'));
 line.appendChild(document.createTextNode('Dans Anatomie & Physiologie → Système reproducteur, un lecteur permet de charger localement le PDF Canva R02–R07, parcourir les six pages et les ouvrir en plein écran. Le fichier demeure sur l’appareil et n’est transmis ni à GitHub ni aux étudiants. Les planches restent en revue médicale et ne sont pas comptées dans l’atlas public ni disponibles en QCM.'));
 line.appendChild(document.createElement('br'));list.insertBefore(line,list.firstChild);return true;
}
let attempts=0;const t=setInterval(()=>{if(patch()||++attempts>50)clearInterval(t)},100);
window.IFSI_V8400_CHANGELOG={patch};
})();
