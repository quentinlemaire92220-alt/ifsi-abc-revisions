(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.116';
 if(document.getElementById('v8416Change'))return true;
 const list=box.querySelector('details .small');if(!list)return false;
 const line=document.createElement('span');line.id='v8416Change';line.dataset.date='2026-10-22';
 const b=document.createElement('b');b.textContent='V8.30.116 — Pathologies temporairement masqué';
 line.append(b,document.createElement('br'));
 line.append(document.createTextNode('L’onglet Pathologies et ses raccourcis sont temporairement masqués. Les cours, le planning, l’anatomie et la révision restent accessibles.'));
 line.appendChild(document.createElement('br'));list.insertBefore(line,list.firstChild);return true;
}
let n=0;const timer=setInterval(()=>{if(patch()||++n>50)clearInterval(timer)},100);
window.IFSI_V8416_CHANGELOG={patch};
})();
