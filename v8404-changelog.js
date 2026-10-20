(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.104';
 if(document.getElementById('v8404Change'))return true;
 const list=box.querySelector('details .small');if(!list)return false;
 const line=document.createElement('span');line.id='v8404Change';line.dataset.date='2026-10-20';
 const title=document.createElement('b');title.textContent='V8.30.104 — R03 et R05 : exports Canva actualisés';
 line.append(title,document.createElement('br'));
 line.append(document.createTextNode('Dans Anatomie & Physiologie → Système reproducteur, les planches provisoires R03 et R05 utilisent les deux nouveaux exports Canva de revue. R03 pointe désormais la vésicule séminale mais son ampoule déférentielle reste non individualisée et le sens des flèches rouges du déférent demande vérification. R05 présente les régions corticale et médullaire revues, sans légende pour la partie intramurale de la trompe. Les six images restent NON VALIDÉES, et aucun QCM ni score n’en dépend. Les autres cours et vocaux sont conservés.'));
 line.appendChild(document.createElement('br'));list.insertBefore(line,list.firstChild);return true;
}
let n=0;const timer=setInterval(()=>{if(patch()||++n>50)clearInterval(timer)},100);
window.IFSI_V8404_CHANGELOG={patch};
})();
