(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.95';
 if(document.getElementById('v8395Change'))return true;
 const list=box.querySelector('details .small');if(!list)return false;
 const line=document.createElement('span');line.id='v8395Change';line.dataset.date='2026-10-19';
 const title=document.createElement('b');title.textContent='V8.30.95 — Deux cours complétés';
 line.appendChild(title);line.appendChild(document.createElement('br'));
 line.appendChild(document.createTextNode('Pharmacologie : 68 QCM et 52 cartes. Infections neuro-méningées : 44 QCM et 41 cartes. Deux fiches par cours, infographies et vocabulaire actualisés à partir des captures de cours. Les 11 vocaux existants sont conservés. La capture sur la digestion est exclue. Le support natif reste à rapprocher.'));
 line.appendChild(document.createElement('br'));list.insertBefore(line,list.firstChild);return true;
}
let attempts=0;const timer=setInterval(()=>{if(patch()||++attempts>50)clearInterval(timer)},100);
window.IFSI_V8395_CHANGELOG={patch};
})();

