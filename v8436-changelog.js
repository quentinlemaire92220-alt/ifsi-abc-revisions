(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 window.IFSI_V8435_CHANGELOG?.patch?.();
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.136';
 const host=box.querySelector('details .small');if(!host)return false;
 if(!document.getElementById('v8436Change')){
  const line=document.createElement('span');line.id='v8436Change';line.dataset.date='2026-10-26';
  const title=document.createElement('b');title.textContent='V8.30.136 — Sept nouveaux vocaux provisoires';
  line.append(title,document.createElement('br'),document.createTextNode('Sept vocaux de révision ajoutés : responsabilité et exercice professionnel (2), santé mondiale et santé en France (2), bientraitance (1), relation soignant-soigné (1), traumatologie — décubitus (1). Le catalogue atteint 186 épisodes. Le badge Provisoire signale un support officiel absent, incomplet ou des sources orales non exhaustives. La validation scientifique sera revue dès réception des documents manquants. Les 179 anciens vocaux sont conservés.'),document.createElement('br'),document.createElement('br'));
  host.insertBefore(line,host.firstChild);
 }
 return true;
}
let n=0;const timer=setInterval(()=>{if(patch()||++n>80)clearInterval(timer)},100);
window.IFSI_V8436_CHANGELOG={patch};
})();
