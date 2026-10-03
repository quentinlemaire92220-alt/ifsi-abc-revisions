(()=>{
'use strict';
const VERSION='8.0';
const LEGACY_IDS=['v72Changelog','v73News','v74News'];
const $=id=>document.getElementById(id);
function removeLegacy(){for(const id of LEGACY_IDS)$(id)?.remove()}
function injectUnified(){const home=$('home');if(!home)return;removeLegacy();if($('v742Changelog'))return;const card=document.createElement('div');card.id='v742Changelog';card.className='card v72-changelog';card.innerHTML=`
<div class="row"><b>🆕 Nouveautés de l’application</b><span class="badge">V${VERSION}</span></div>
<details style="margin-top:7px"><summary class="small" style="cursor:pointer">Voir les changements</summary><div class="small" style="margin-top:10px;line-height:1.6">
<span id="v80Change"><b>V8.0 — Parcours Maîtrise des calculs infirmiers</b><br>• Banque Calculs de doses & mathématiques portée à environ 300 QCM avec 200 nouvelles questions issues des méthodes du cahier d’entraînement.<br>• Nouveau parcours en 10 niveaux : conversions, durées, concentrations, doses, solutions orales, perfusions, électrolytes, reconstitution, dilutions et cas complets IFSI.<br>• Chaque niveau affiche son nombre de QCM, les questions vues et le taux de réussite local ; ≥ 80 % après au moins 10 questions valide le niveau localement.<br>• Bouton « Continuer mon parcours » pour reprendre automatiquement le premier niveau non maîtrisé.<br><br></span>
<span id="v79Change"><b>V7.9 — Révision par thèmes</b><br>• Chaque cours affiche désormais ses thématiques avec le nombre de questions, les questions vues, les erreurs et le taux de réussite local.<br>• Nouveau créateur de série : thème(s), difficulté, 10/20/30/50 questions ou toutes, puis mode entraînement ou examen.<br>• Accès rapide à une série de 10 QCM directement depuis une thématique.<br><br></span>
<span id="v78Change"><b>V7.8 — Système respiratoire synchronisé</b><br>• Banque des 50 QCM respiratoires réalignée sur le support officiel du Dr Sandrine Dulong.<br>• Fin de cours ajoutée : hémodynamique pulmonaire, contrôle du rythme respiratoire et intégration des récepteurs.<br><br></span>
<span id="v77Change"><b>V7.7 — Statistiques anonymes</b><br>• Comptage anonyme des ouvertures de l’application et ressources ; aucun nom, email ou score individuel n’est envoyé.<br><br></span>
<span id="v76Change"><b>V7.6 — Nouvel accueil</b><br>• Accueil plus chaleureux, raccourcis et reprise d’activité.<br><br></span>
<span id="v75Change"><b>V7.5 — Révision intelligente</b><br>• Niveau de confiance, répétition espacée et session « À faire aujourd’hui ».<br><br></span>
<b>V7.4.2 — Accueil allégé et version stabilisée</b><br>• Nouveautés regroupées et numéro de version unifié.<br><br><b>V7.4.1 — Registre des cours</b><br>• Identifiants stables et contrôle des rattachements.<br><br><b>V7.4 — Parcours par cours</b><br>• Pages par cours avec QCM, fiches, infographies et vocaux.<br><br><b>V7.3.1 — Vocaux améliorés</b><br>• Vocaux écoutés, favoris et reprise.<br><br><b>V7.2 — Révisions avancées</b><br>• Navigation examen, chronomètre, historique, difficultés et révision progressive.
</div></details>`;const app=[...home.querySelectorAll('.section')].find(x=>x.textContent.trim()==='Application');if(app)app.insertAdjacentElement('beforebegin',card);else home.appendChild(card)}
function keepClean(){removeLegacy();injectUnified()}keepClean();const home=$('home');if(home)new MutationObserver(()=>keepClean()).observe(home,{childList:true,subtree:false});window.IFSI_CHANGELOG={version:VERSION,refresh:keepClean};window.IFSI_V742=window.IFSI_CHANGELOG;
})();