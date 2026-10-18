(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.93';
 if(document.getElementById('v8393Change'))return true;
 const list=box.querySelector('details .small');if(!list)return false;
 const line=document.createElement('span');line.id='v8393Change';line.dataset.date='2026-10-18';
 const title=document.createElement('b');title.textContent='V8.30.93 — 17 vocaux de révision';
 line.appendChild(title);line.appendChild(document.createElement('br'));
 line.appendChild(document.createTextNode('17 nouveaux MP3 : Droits des patients (6), Stomatothérapie (3), Plaies et pansements (5) et Premiers secours en santé mentale (3). Les pauses varient selon les questions ; chaque vocal comprend les corrections et le vocabulaire. Les durées vérifiées sont inférieures à 10 minutes.'));
 line.appendChild(document.createElement('br'));list.insertBefore(line,list.firstChild);return true;
}
let attempts=0;const timer=setInterval(()=>{if(patch()||++attempts>50)clearInterval(timer)},100);
window.IFSI_V8393_CHANGELOG={patch};
})();
