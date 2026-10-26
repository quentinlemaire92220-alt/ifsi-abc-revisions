(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 window.IFSI_V8439_CHANGELOG?.patch?.();
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.140';
 const host=box.querySelector('details .small');if(!host)return false;
 if(!document.getElementById('v8440Change')){
  const line=document.createElement('span');line.id='v8440Change';line.dataset.date='2026-10-26';
  const title=document.createElement('b');title.textContent='V8.30.140 — Vignettes automatiques pour les nouveaux cours';
  line.append(title,document.createElement('br'),document.createTextNode('Les futurs cours disposent automatiquement d’un repère par UE jusqu’à la validation d’une illustration. Les images déjà publiées sont associées par identifiant sans liste manuelle.'),document.createElement('br'),document.createElement('br'));
  host.insertBefore(line,host.firstChild);
 }
 return true;
}
let n=0;const timer=setInterval(()=>{if(patch()||++n>80)clearInterval(timer)},100);
window.IFSI_V8440_CHANGELOG={patch};
})();
