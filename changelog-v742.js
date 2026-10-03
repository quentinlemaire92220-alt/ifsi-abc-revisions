(()=>{
'use strict';
const VERSION='7.5';
const LEGACY_IDS=['v72Changelog','v73News','v74News'];
const $=id=>document.getElementById(id);

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
        <span id="v75Change"><b>V7.5 — Révision intelligente</b><br>
        • Niveau de confiance : sûr, hésitant ou au hasard.<br>
        • Répétition espacée avec prochaine révision calculée automatiquement.<br>
        • Session « À faire aujourd’hui » mêlant révisions dues, erreurs, points faibles et questions jamais vues.<br><br></span>
        <b>V7.4.2 — Accueil allégé et version stabilisée</b><br>
        • Toutes les nouveautés sont regroupées dans ce seul bloc repliable.<br>
        • Le numéro de version visible est maintenant géré par un module unique, indépendant des anciens modules.<br><br>
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
function keepClean(){removeLegacy();injectUnified()}
keepClean();
const home=$('home');
if(home)new MutationObserver(()=>keepClean()).observe(home,{childList:true,subtree:false});
window.IFSI_CHANGELOG={version:VERSION,refresh:keepClean};
window.IFSI_V742=window.IFSI_CHANGELOG;
})();