(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.101';
 if(document.getElementById('v8401Change'))return true;
 const list=box.querySelector('details .small');if(!list)return false;
 const line=document.createElement('span');line.id='v8401Change';line.dataset.date='2026-10-19';
 const title=document.createElement('b');title.textContent='V8.30.101 — 26 nouveaux vocaux : infections et microbiologie';
 line.appendChild(title);line.appendChild(document.createElement('br'));
 line.appendChild(document.createTextNode('Ajout de 26 épisodes audio de révision sur huit cours de l’UE B1 : Parasites et champignons (4), Physiopathologie des infections (3), Diagnostic virologique (2), Infections urinaires (3), Infections pulmonaires bactériennes (4), Infections respiratoires virales (3), Infections cutanées (5) et IST hors VIH (2). Le catalogue contient désormais 131 vocaux. Chacun des nouveaux enregistrements dure moins de 10 minutes.'));
 line.appendChild(document.createElement('br'));list.insertBefore(line,list.firstChild);return true;
}
let attempts=0;const t=setInterval(()=>{if(patch()||++attempts>50)clearInterval(t)},100);
window.IFSI_V8401_CHANGELOG={patch};
})();
