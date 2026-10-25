(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 window.IFSI_V8434_CHANGELOG?.patch?.();
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.135';
 const host=box.querySelector('details .small');if(!host)return false;
 if(!document.getElementById('v8435Change')){
  const line=document.createElement('span');line.id='v8435Change';line.dataset.date='2026-10-25';
  const title=document.createElement('b');title.textContent='V8.30.135 — 10 nouveaux vocaux de révision';
  line.append(title,document.createElement('br'),document.createTextNode('Dix vocaux MP3 supplémentaires sont proposés sur cinq cours : arthrose, chirurgie orthopédique, rhumatismes inflammatoires, pathologies microcristallines et ostéoporose, communication TD1. La bibliothèque compte maintenant 179 épisodes. Les 169 vocaux précédents sont conservés. Sept fichiers restent en contrôle privé et ne sont pas publiés.'),document.createElement('br'),document.createElement('br'));
  host.insertBefore(line,host.firstChild);
 }
 return true;
}
let n=0;const timer=setInterval(()=>{if(patch()||++n>80)clearInterval(timer)},100);
window.IFSI_V8435_CHANGELOG={patch};
})();
