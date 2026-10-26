(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 window.IFSI_V8436_CHANGELOG?.patch?.();
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.137';
 const host=box.querySelector('details .small');if(!host)return false;
 if(!document.getElementById('v8437Change')){
  const line=document.createElement('span');line.id='v8437Change';line.dataset.date='2026-10-26';
  const title=document.createElement('b');title.textContent='V8.30.137 — Quatre nouveaux vocaux de révision';
  line.append(title,document.createElement('br'),document.createTextNode('Quatre compléments audio disponibles : Prévention des IAS et asepsie (épisodes 2 et 3), Histoire et identité de la profession infirmière (épisode 2), Droits des patients (épisode 7). Le catalogue contient 190 vocaux. Les épisodes existants sont conservés.'),document.createElement('br'),document.createElement('br'));
  host.insertBefore(line,host.firstChild);
 }
 return true;
}
let n=0;const timer=setInterval(()=>{if(patch()||++n>80)clearInterval(timer)},100);
window.IFSI_V8437_CHANGELOG={patch};
})();
