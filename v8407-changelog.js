(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.107';
 if(document.getElementById('v8407Change'))return true;
 const list=box.querySelector('details .small');if(!list)return false;
 const line=document.createElement('span');line.id='v8407Change';line.dataset.date='2026-10-20';
 const title=document.createElement('b');title.textContent='V8.30.107 — Planning S9 (26–30 octobre)';
 line.append(title,document.createElement('br'));
 line.append(document.createTextNode('18 séances du 26 au 30 octobre 2026 depuis la photo IFSI, avec CM, TD et répartition fidèle des promotions A/B et sous-groupes A1/A2 et B1/B2. La connexion Mischool reste asynchrone. Le lieu du CM « Organes des sens » doit être confirmé. Les améliorations Pathologies de V8.30.106 sont conservées.'));
 line.appendChild(document.createElement('br'));list.insertBefore(line,list.firstChild);return true;
}
let n=0;const timer=setInterval(()=>{if(patch()||++n>50)clearInterval(timer)},100);
window.IFSI_V8407_CHANGELOG={patch};
})();
