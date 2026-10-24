(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.119';
 if(document.getElementById('v8419Change'))return true;
 const list=box.querySelector('details .small');if(!list)return false;
 const line=document.createElement('span');line.id='v8419Change';line.dataset.date='2026-10-24';
 const title=document.createElement('b');title.textContent='V8.30.119 — Accueil : nouvelle bannière et esprit d’entraide';
 line.append(title,document.createElement('br'));
 line.append(document.createTextNode('Une bannière plus soignée, avec un portrait en tenue de soins, et un encart rappelant que l’application est gratuite et créée pour partager les révisions.'));
 line.append(document.createElement('br'));list.insertBefore(line,list.firstChild);return true;
}
let attempts=0;const timer=setInterval(()=>{if(patch()||++attempts>80)clearInterval(timer)},100);
window.IFSI_V8419_CHANGELOG={patch};
})();
