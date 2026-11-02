(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.161';
 if(document.getElementById('v8461Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8461Change';span.dataset.date='2026-11-02';
 const b=document.createElement('b');b.textContent='V8.30.161 — Classement et illustrations des cours';span.appendChild(b);
 span.appendChild(document.createTextNode(' · Les codes UE détaillés rejoignent leur groupe principal. Le domaine B conserve trois groupes : B1, B2 et B3. Les nouveaux cours reçoivent automatiquement une illustration thématique ; les codes détaillés et toutes les ressources sont conservés.'));host.prepend(span);return true;
}
window.IFSI_V8461_CHANGELOG={patch};if(!patch()){let tries=0;const t=setInterval(()=>{if(patch()||++tries>100)clearInterval(t)},100)}setTimeout(patch,100);setTimeout(patch,500);
})();
