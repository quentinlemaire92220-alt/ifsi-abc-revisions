(()=>{'use strict';
function patch8329(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.29';
 if(document.getElementById('v8329Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8329Change';span.dataset.date='2026-10-07';
 const title=document.createElement('b');title.textContent='V8.30.29 — Badge Notes / captures visible';
 span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Le repère des fiches sans support officiel est maintenant affiché sous forme de badge « 📝 Notes / captures », y compris sur les cartes de cours concernées.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));
 host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8329()||++n>40)clearInterval(t)},100);
window.IFSI_V8329_CHANGELOG={patch:patch8329};
})();
