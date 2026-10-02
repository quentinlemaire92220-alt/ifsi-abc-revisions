(()=>{
'use strict';
function currentQ(){try{return session&&session[i]||null}catch{return null}}
function normalizeChoices(){
  const q=currentQ();
  if(!q)return;
  document.querySelectorAll('#choices input').forEach(inp=>{
    if(inp.disabled)return;
    // Toujours utiliser des cases cochables avant validation : même avec 1 seule bonne réponse,
    // l'utilisateur peut recocher/décocher librement.
    inp.type='checkbox';
    inp.removeAttribute('name');
  });
}
function install(){
  const box=document.getElementById('choices');
  if(!box)return false;
  box.addEventListener('change',e=>{
    const inp=e.target.closest?.('input');
    if(!inp||inp.disabled)return;
    const q=currentQ();
    if(!q)return;
    // Pour une question à réponse unique : une seule case maximum reste cochée,
    // mais retoucher la même case la décoche normalement.
    if(q.answers?.length===1&&inp.checked){
      box.querySelectorAll('input').forEach(other=>{if(other!==inp)other.checked=false});
    }
  });
  const mo=new MutationObserver(normalizeChoices);
  mo.observe(box,{childList:true,subtree:true});
  normalizeChoices();
  return true;
}
let tries=0;const t=setInterval(()=>{tries++;if(install()||tries>80)clearInterval(t)},125);
})();