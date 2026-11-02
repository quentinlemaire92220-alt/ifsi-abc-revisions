(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.159';
 if(document.getElementById('v8459Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8459Change';span.dataset.date='2026-11-02';
 const b=document.createElement('b');b.textContent='V8.30.159 — Vocaux interactifs';span.appendChild(b);
 span.appendChild(document.createTextNode(' · 23 épisodes de révision pour 11 cours du catalogue, dont 5 nouveaux. Les anciennes pistes sont conservées. Les nouveaux enregistrements sont provisoires : pauses et fond pédagogique à vérifier.'));host.prepend(span);return true;
}
window.IFSI_V8459_CHANGELOG={patch};if(!patch()){let tries=0;const t=setInterval(()=>{if(patch()||++tries>100)clearInterval(t)},100)}setTimeout(patch,100);setTimeout(patch,500);
})();
