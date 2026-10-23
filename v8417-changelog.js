(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.117';
 if(document.getElementById('v8417Change'))return true;
 const list=box.querySelector('details .small');if(!list)return false;
 const line=document.createElement('span');line.id='v8417Change';line.dataset.date='2026-10-23';
 const b=document.createElement('b');b.textContent='V8.30.117 — Planning du 2 au 6 novembre';
 line.append(b,document.createElement('br'));
 line.append(document.createTextNode('Ajout de la semaine S10 : CM, TD, TP et séances asynchrones, avec les groupes 1/3, 2/3 et 3/3 distincts. Les salles non attribuées dans le support restent à confirmer.'));
 line.appendChild(document.createElement('br'));list.insertBefore(line,list.firstChild);return true;
}
let n=0;const timer=setInterval(()=>{if(patch()||++n>50)clearInterval(timer)},100);
window.IFSI_V8417_CHANGELOG={patch};
})();
