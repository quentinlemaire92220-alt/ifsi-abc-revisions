(()=>{'use strict';
function patch8369(){
 const box=document.getElementById('v742Changelog');if(!box)return false;
 const badge=box.querySelector('.badge');if(badge)badge.textContent='V8.30.69';
 if(document.getElementById('v8369Change'))return true;
 const host=box.querySelector('details .small');if(!host)return false;
 const span=document.createElement('span');span.id='v8369Change';span.dataset.date='2026-10-09';
 const title=document.createElement('b');title.textContent='V8.30.69 — Compréhension des flashcards';
 span.appendChild(title);span.appendChild(document.createElement('br'));
 span.appendChild(document.createTextNode('Les propositions fausses sont identifiées comme telles avec leur contexte. Les réponses en lettres sont remplacées par les notions complètes. Les questions de calcul et plusieurs formulations sont clarifiées. Un contrôle incluant les banques compressées et le vocabulaire est ajouté.'));
 span.appendChild(document.createElement('br'));span.appendChild(document.createElement('br'));host.insertBefore(span,host.firstChild);return true;
}
let n=0;const t=setInterval(()=>{if(patch8369()||++n>40)clearInterval(t)},100);
window.IFSI_V8369_CHANGELOG={patch:patch8369};
})();
