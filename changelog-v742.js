(()=>{
'use strict';
const VERSION='7.4.2';
const LEGACY_IDS=['v72Changelog','v73News','v74News'];
const $=id=>document.getElementById(id);
let versionClaimed=false;

function removeLegacy(){for(const id of LEGACY_IDS)$(id)?.remove()}

function injectUnified(){
  const home=$('home');if(!home)return;
  removeLegacy();
  if($('v742Changelog'))return;
  const card=document.createElement('div');
  card.id='v742Changelog';
  card.className='card v72-changelog';
  card.innerHTML=`
    <div class="row">
      <b>🆕 Nouveautés de l’application</b>
      <span class="badge">V${VERSION}</span>
    </div>
    <details style="margin-top:7px">
      <summary class="small" style="cursor:pointer">Voir les changements</summary>
      <div class="small" style="margin-top:10px;line-height:1.6">
        <b>V7.4.2 — Accueil allégé</b><br>
        • Toutes les nouveautés sont regroupées dans ce seul bloc repliable.<br>
        • Version affichée stabilisée : les anciens modules ne peuvent plus réécrire leur propre numéro.<br><br>
        <b>V7.4.1 — Registre des cours</b><br>
        • Identifiants de cours stables et diagnostic automatique des rattachements.<br>
        • Contrôle TNR des nouvelles ressources ajoutées.<br><br>
        <b>V7.4 — Parcours par cours</b><br>
        • Pages par cours avec QCM, fiches, infographies et vocaux.<br>
        • Accueil personnalisé, recherche globale V2 et favoris unifiés.<br><br>
        <b>V7.3.1 — Vocaux améliorés</b><br>
        • Vocaux écoutés, favoris et reprise du dernier fichier consulté.<br><br>
        <b>V7.2 — Révisions avancées</b><br>
        • Navigation en examen, chronomètre, historique et difficultés.<br>
        • Révision progressive, mode sombre, signalements et TNR.
      </div>
    </details>`;
  const app=[...home.querySelectorAll('.section')].find(x=>x.textContent.trim()==='Application');
  if(app)app.insertAdjacentElement('beforebegin',card);else home.appendChild(card);
}

function stableText(){return `Application prête • V${VERSION} locale : nouveautés regroupées, version stable et interface d’accueil allégée.`}

function claimVersionUI(){
  if(versionClaimed)return true;
  const legacy=$('update');
  if(!legacy)return false;
  const parent=legacy.parentElement;
  if(!parent)return false;

  legacy.id='updateLegacy';
  legacy.classList.add('hidden');

  let stable=$('appVersionStatus');
  if(!stable){
    stable=document.createElement('div');
    stable.id='appVersionStatus';
    stable.className='small';
    legacy.insertAdjacentElement('afterend',stable);
  }
  stable.textContent=stableText();
  const heading=parent.querySelector('b');
  if(heading)heading.textContent=`V${VERSION} local`;
  versionClaimed=true;

  window.checkUpdate=async function(){
    const status=$('appVersionStatus');
    try{
      if(status)status.textContent='Vérification de la mise à jour…';
      const r=await navigator.serviceWorker.getRegistration();
      if(r)await r.update();
      if(status)status.textContent='Vérification terminée. Recharge si une mise à jour est disponible.';
    }catch{
      if(status)status.textContent='Vérification impossible.';
    }
    setTimeout(()=>{const s=$('appVersionStatus');if(s)s.textContent=stableText()},1800);
  };
  return true;
}

function appBootFinished(){
  try{return Array.isArray(Q)&&Q.length>0&&Array.isArray(S)&&S.length>0&&Array.isArray(I)&&I.length>0}catch{return false}
}

function keepClean(){removeLegacy();injectUnified()}

keepClean();
const home=$('home');
if(home){
  const obs=new MutationObserver(()=>keepClean());
  obs.observe(home,{childList:true,subtree:false});
}

let tries=0;
const wait=setInterval(()=>{
  keepClean();
  tries++;
  if((appBootFinished()&&claimVersionUI())||tries>=160){claimVersionUI();clearInterval(wait)}
},100);

window.IFSI_V742={version:VERSION,refresh:keepClean,versionLocked:()=>versionClaimed};
})();
