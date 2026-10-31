(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.156';
 if(document.getElementById('v8456Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8456Change';span.dataset.date='2026-10-31';
 const b=document.createElement('b');b.textContent='V8.30.156 — Les organes des sens';span.appendChild(b);
 span.appendChild(document.createTextNode(' · Fiche de révision, 50 QCM corrigés, 50 cartes et 59 définitions. Les 7 planches sont disponibles dans Anatomie.'));
 host.prepend(span);return true;
}
window.IFSI_V8456_CHANGELOG={patch};if(!patch()){let tries=0;const t=setInterval(()=>{if(patch()||++tries>100)clearInterval(t)},100)}setTimeout(patch,100);setTimeout(patch,500);
})();
