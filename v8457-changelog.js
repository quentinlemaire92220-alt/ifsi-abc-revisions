(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.157';
 if(document.getElementById('v8457Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8457Change';span.dataset.date='2026-10-31';
 const b=document.createElement('b');b.textContent='V8.30.157 — Les organes des sens';span.appendChild(b);
 span.appendChild(document.createTextNode(' · Accès aux 7 planches corrigé dans le catalogue Anatomie. La fiche, les 50 QCM, les 50 cartes et les 59 définitions sont conservés.'));
 host.prepend(span);return true;
}
window.IFSI_V8457_CHANGELOG={patch};if(!patch()){let tries=0;const t=setInterval(()=>{if(patch()||++tries>100)clearInterval(t)},100)}setTimeout(patch,100);setTimeout(patch,500);
})();
