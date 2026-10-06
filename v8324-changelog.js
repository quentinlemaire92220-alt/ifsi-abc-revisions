(()=>{'use strict';
function patch8324(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.24';
 if(document.getElementById('v8324Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8324Change';span.dataset.date='2026-10-06';
 const title=document.createElement('b');title.textContent='V8.30.24 — Provenance des fiches';
 span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Une icône 📝 signale désormais les fiches réalisées sans support officiel, à partir de captures, notes ou transcriptions du cours.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8324()||++n>40)clearInterval(t)},100);
window.IFSI_V8324_CHANGELOG={patch:patch8324};
})();
