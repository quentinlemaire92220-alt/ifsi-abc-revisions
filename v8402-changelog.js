(()=>{'use strict';
function patch(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.102';
 if(document.getElementById('v8402Change'))return true;
 const list=box.querySelector('details .small');if(!list)return false;
 const line=document.createElement('span');line.id='v8402Change';line.dataset.date='2026-10-19';
 const title=document.createElement('b');title.textContent='V8.30.102 — six planches reproducteur en galerie de revue';
 line.append(title,document.createElement('br'));
 line.append(document.createTextNode('Dans Anatomie & Physiologie → Système reproducteur, les six illustrations R02–R07 sont consultables individuellement avec zoom. Elles portent toutes le statut NON VALIDÉ et signalent les points restant à contrôler. Le repère douteux « médulla ovarienne » de R05 a été neutralisé. Aucun QCM, test ni score ne s’appuie sur les images ; elles ne sont pas comptées parmi les 106 planches validées et R01 reste à produire.'));
 line.appendChild(document.createElement('br'));list.insertBefore(line,list.firstChild);return true;
}
let attempts=0;const t=setInterval(()=>{if(patch()||++attempts>50)clearInterval(t)},100);
window.IFSI_V8402_CHANGELOG={patch};
})();
