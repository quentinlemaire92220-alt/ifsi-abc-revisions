(()=>{
'use strict';
const VERSION='8.1';
const LEGACY_IDS=['v72Changelog','v73News','v74News'];
const $=id=>document.getElementById(id);
function removeLegacy(){for(const id of LEGACY_IDS)$(id)?.remove()}
function currentMarkup(){return `
<div class="row"><b>🆕 Nouveautés de l’application</b><span class="badge">V${VERSION}</span></div>
<details style="margin-top:7px"><summary class="small" style="cursor:pointer">Voir les changements</summary><div class="small" style="margin-top:10px;line-height:1.6">
<span id="v81Change"><b>V8.1 — Centre de révision complet</b><br>• Nouveau dashboard local : réussite, erreurs, activité sur 7 jours et nouveaux contenus.<br>• Bilan détaillé après chaque QCM par thème et difficulté, avec relance directe des erreurs ou du thème le plus fragile.<br>• Détection automatique des points faibles et bouton « Travailler mes points faibles ».<br>• Examen blanc intelligent 20/30/50 questions avec répartition diversifiée par thème et difficulté.<br>• Mode « Avant partiel » multi-matières, pondéré vers les matières les moins maîtrisées.<br>• Révision express 5/10/20 minutes, objectif quotidien QCM + vocaux, recherche avancée et badges de nouveau contenu.<br>• Les sessions avancées alimentent les statistiques anonymes avec leur mode, leurs matières et leurs thèmes, sans score individuel.<br><br></span>
<span id="v80Change"><b>V8.0 — Parcours Maîtrise des calculs infirmiers</b><br>• Banque Calculs de doses & mathématiques : plus de 220 QCM exploitables avec parcours progressif par difficulté.<br>• 10 niveaux : conversions, durées, concentrations, doses, solutions orales, perfusions, électrolytes, reconstitution, dilutions et cas complets IFSI.<br>• Chaque niveau affiche son nombre de QCM, les questions vues et le taux de réussite local.<br><br></span>
<span id="v79Change"><b>V7.9 — Révision par thèmes</b><br>• Thématiques, difficultés et créateur de séries personnalisées.<br><br></span>
<span id="v78Change"><b>V7.8 — Système respiratoire synchronisé</b><br>• Banque des 50 QCM respiratoires réalignée sur le support officiel.<br><br></span>
<span id="v77Change"><b>V7.7 — Statistiques anonymes</b><br>• Comptage anonyme des ouvertures, QCM et ressources ; aucun nom, email ou score individuel envoyé.<br><br></span>
<span id="v76Change"><b>V7.6 — Nouvel accueil</b><br>• Accueil, raccourcis et reprise d’activité.<br><br></span>
<span id="v75Change"><b>V7.5 — Révision intelligente</b><br>• Confiance, répétition espacée et session du jour.<br><br></span>
<b>V7.4.2 — Accueil allégé et version stabilisée</b><br>• Nouveautés regroupées et numéro de version unifié.<br><br><b>V7.4.1 — Registre des cours</b><br>• Identifiants stables et contrôle des rattachements.<br><br><b>V7.4 — Parcours par cours</b><br>• Pages par cours avec QCM, fiches, infographies et vocaux.<br><br><b>V7.3.1 — Vocaux améliorés</b><br>• Vocaux écoutés, favoris et reprise.<br><br><b>V7.2 — Révisions avancées</b><br>• Navigation examen, chronomètre, historique, difficultés et révision progressive.
</div></details>`}
function injectUnified(){
  const home=$('home');if(!home)return;
  removeLegacy();
  let card=$('v742Changelog');
  if(!card){
    card=document.createElement('div');card.id='v742Changelog';card.className='card v72-changelog';
    const app=[...home.querySelectorAll('.section')].find(x=>x.textContent.trim()==='Application');
    if(app)app.insertAdjacentElement('beforebegin',card);else home.appendChild(card);
  }
  const alreadyCurrent=card.querySelector('#v81Change')&&card.querySelector('.badge')?.textContent===`V${VERSION}`&&card.querySelector('details .small')?.firstElementChild?.id==='v81Change';
  if(!alreadyCurrent){card.className='card v72-changelog';card.innerHTML=currentMarkup()}
}
function keepClean(){removeLegacy();injectUnified()}
keepClean();
const home=$('home');if(home)new MutationObserver(()=>keepClean()).observe(home,{childList:true,subtree:false});
window.IFSI_CHANGELOG={version:VERSION,refresh:keepClean};window.IFSI_V742=window.IFSI_CHANGELOG;
})();