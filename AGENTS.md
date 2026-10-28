# PRIORITÉ v1.49 — NON-RÉGRESSION PÉDAGOGIQUE (28/10/2026)

Pour toute **création ou régénération de fiche**, appliquer **avant rédaction** `docs/PEDAGOGICAL_NON_REGRESSION_V149.md` et `docs/skills/controle-non-regression-pedagogique-v149.md`, en complément du modèle écrit V5.3 et du contrat trame V3. Inventorier la dernière fiche, ses versions et lexiques, le support officiel et toutes les transcriptions PLAUD/captures ; établir une **matrice privée de couverture ET d'héritage**. Une notion seulement mentionnée n'est pas considérée comme suffisamment traitée lorsqu'un mécanisme ou une application sont nécessaires. Comparer le fond **avant/après**, documenter `conservée / enrichie / corrigée / fusionnée / manquante`, bloquer toute perte inexpliquée ou source essentielle non rapprochée. Ne rien publier, ne migrer aucune ancienne fiche, et ne jamais stocker ces preuves privées sur GitHub. Le dépôt de sources seul ne déclenche pas une génération. Les règles V3/V5.3/QCM/flashcards/vocaux ne changent pas.

---

# Verrou prioritaire de trame — 26/10/2026

Pour toute fiche de révision ou QCM, ChatGPT et Work doivent lire et appliquer `docs/PDF_TEMPLATE_CONTRACT_V3.md` et `docs/pdf-template-policy-v3.json` AVANT de produire ou réparer. Ouvrir les PDF Communication référencés et vérifier leurs empreintes ; référence inaccessible = arrêt avant toute conformité déclarée. Le contrôle technique V3, la revue intégrale comparée au modèle et le GO sur les octets finaux sont distincts et bloquants. Conserver l’historique ; ne pas migrer les PDF inchangés. Le reçu `templateConformance` de chaque PDF modifié entre dans le digest du lot. Ne jamais fabriquer une revue ou réécrire automatiquement un accord après correction.

---

# Contrôle graphique V2 — nouveaux cours (25/10/2026)

Avant toute approbation graphique, appliquer [le contrôle V2](docs/GRAPHIC_QA_V2.md) sur le PDF **réel et intégral** : positions/tailles, bandeaux violets haut/bas, cases QCM à gauche, sections finales et rendu de toutes les pages. Le rapport technique ne remplace jamais la comparaison visuelle humaine au modèle V5.3. Contrôle réservé aux nouveaux PDF, sans modifier l'historique ni les TNR bloquants. Première expérimentation privée : D1.1 Bientraitance, source orale uniquement, encore « À traiter ».

---

# RÈGLE PRIORITAIRE SUPPORTS FINALS — 24/10/2026

Avant PR et publication, appliquer `docs/COURSE_PREFLIGHT.md`. Exécuter les préflights de préparation et de publication, puis conserver tous les TNR complets et bloquants. Séparer la revue pédagogique, les vérifications techniques et l’autorisation du lot final ; ne jamais réécrire automatiquement une approbation après correction. Contrôler PDF/banques/empreintes, versions, cache/SW et présence des assets. Toute source tronquée reste signalée ; archivage seulement après déploiement réellement vérifié.

## PRIORITÉ TRANSVERSALE — NETTOYAGE DES SUPPORTS ÉTUDIANTS (24/10/2026)

**TOUT document étudiant final** (fiche PDF, QCM, corrigé, flashcards, vocabulaire, script vocal) doit être exempt de marqueurs techniques : « brouillon », « à valider », « non publié », « privé », numéro de version de génération / édition interne (ex. V5.3), traces QA, noms de scripts, notes de workflow, provenance du générateur. Les conserver seulement dans les manifestes et rapports QA privés, hors des supports étudiants. Conserver UE, date/séance, titre, thèmes et pagination.
Le QCM standard tient dans **UN seul PDF** : questions réparties en **blocs par thème**, chaque question dans un encadré, **case à cocher à gauche de chaque choix A à E**, puis **tous les corrigés argumentés à la fin**. Aucune réponse divulguée dans les pages de questions. Ne jamais modifier silencieusement les banques QCM/flashcards, clés ou argumentations en améliorant la forme.
Contrôle bloquant pré-publication : inspecter texte extrait, métadonnées PDF et rendu de chaque page ; utiliser le garde-fou `tools/student_support_clean_gate.py`. Ces obligations ne modifient pas les ressources historiques déjà publiées et ne déclenchent aucune publication ou fusion automatique.


---

# DIRECTIVE PRIORITAIRE 24/10/2026 — STANDARD ÉCRIT V5.3

**Pour TOUS les nouveaux cours IFSI ABC, la fiche maîtresse est désormais la fiche de révision ÉCRITE V5.3, sans images, schémas ni infographies générés.** Lire `docs/WRITTEN_REVISION_V153.md` et `docs/skills/production-fiches-revision-ecrites-v153.md`. Cette règle prime sur les passages historiques ci-dessous exigeant des schémas ou le modèle Pharmacologie P01 de v1.47.

Une fiche PDF écrite par cours/partie, multipage, sans quota ; bandeaux violets **en haut et en bas de chaque page**, code couleur pédagogique, notes de l'intervenant intégrées sans horodatages, matrice privée support officiel + oral, double lecture, raisonnements et tableaux pertinents ; une seule rubrique « Pièges QCM », suivie de la **synthèse générale** puis de « Définitions et mots-clés » en toute dernière section. Aucune source externe sans accord préalable. QCM, flashcards et vocaux : **règles inchangées**. Préserver toutes les ressources et les validateurs historiques. Nouveau contrat technique `written_v1` / `written_revision`; ne pas forcer d'images factices dans `hybrid_v1`. QA complet et GO séparé avant toute publication ou fusion.

Les anciennes directives qui suivent sont conservées comme **historique**, pas comme instructions nouvelles.

---

# PRIORITÉ ACTUELLE — CHARTE IFSI ABC v1.47 (22/10/2026)

**Cette décision récente prime sur toutes les références v1.46, v1.45 et anciennes instructions à deux PDF ci-dessous.**
Pour les nouvelles productions : **une seule fiche de révision hybride infographiée** multipage ; texte sélectionnable, vraies infographies médicales intégrées, tableaux utiles, « À retenir », « Pièges QCM », puis « Définitions et mots-clés » en fin de document. Modèle graphique **Pharmacologie P01 de 24 pages**, à ouvrir et à inspecter avant la production ; les dix anciennes pages v1.46 ne sont que des témoins historiques. Vérifier les notions importantes, les priorités explicitement annoncées par l'enseignant et les priorités déduites séparément, la confrontation au support officiel et à l'oral disponible, chaque page et chaque repère médical. Aucun second cours infographié/pack de planches par défaut.

Le contrat technique reste `hybrid_v1`/`hybrid_infographic` et son identifiant de modèle visuel pour les nouveaux lots devient `pharmacologie_v1.47_24_pages`. Les anciens cours, les QCM, flashcards et vocaux gardent leurs contrats et ressources ; aucune migration rétroactive. Les validations scientifiques/visuelles, l'empreinte des octets approuvés, les preuves Drive et le GO publication distinct restent obligatoires. Aucune fiche médicale ne devient publiable du seul fait d'un TNR vert.

---

## DÉCISION PRIORITAIRE — CHARTE v1.46, FICHE HYBRIDE UNIQUE (22/10/2026)

Pour les **NOUVELLES productions pédagogiques**, un seul support PDF principal : **fiche de révision hybride infographiée**, rédigée et illustrée, avec « Définitions et mots-clés » en fin de document. Le modèle graphique normatif est la série de **10 pages pharmacologie** dans la charte privée v1.46, consultée et comparée réellement avant production et revue de chaque page. Les planches infographiques totales séparées et le cours infographié complet séparé **cessent d'être des livrables systématiques**. Les QCM, flashcards et vocaux restent intégralement **INCHANGÉS**.

Contrat GitHub NON RÉTROACTIF : nouveaux packs `packFormat:"hybrid_v1"` et `sheetFormat:"hybrid_infographic"`, un seul `sheetResourceId`, matrice des notions essentielles, audit PDF et preuve Drive, revue médicale, modèle visuel comparé sur toutes les pages et lexique final sélectionnable. Voir `docs/HYBRID_REVISION_V146.md`, `tools/hybrid_course_pack.py`, `tests/hybrid-sheet-contract.mjs`. Les packs historiques `lean_v1`, dual-sheet et single-with-complete-boards conservent **tous** leurs validateurs et ressources ; ne pas les migrer silencieusement. Le contrat actuel des QCM, flashcards et vocaux n'est pas modifié.

**Cette règle prévaut sur les rectificatifs du 20/10/2026 et tous les paragraphes contradictoires ci-dessous concernant le nombre de fiches ou les planches autonomes par défaut.** Un succès de génération/TNR n'est ni une validation graphique ni scientifique. GO PRODUCTION = privé ; GO PUBLICATION étudiant, fusion et déploiement distincts et explicites.

---

## RECTIFICATIF PRIORITAIRE — PILOTE ≠ LIVRABLE FINAL (20/10/2026)

Le pilote « une page de chaque » sert exclusivement à valider la maquette graphique. Pour un VRAI cours, livrer **DEUX COURS COMPLETS** couvrant toutes les notions du support officiel : (1) fiche de révision textuelle complète avec schémas infographiés intégrés au besoin ; (2) **cours intégralement infographié MULTIPAGE**, sans plafond de pages et avec toutes les notions expliquées. Compléter par QCM A–E (1–3 bonnes réponses), flashcards et planches anatomiques si nécessaires. Modèles graphiques cardio/respiratoire. Aucun contenu ne doit être sacrifié pour tenir sur une page.

Le contrat `lean_v1` garde son nom technique pour compatibilité, mais exige désormais `sheetFormat:"complete_infographic"`, `dualSheetCoverage.expectedNotions===classicCovered===infographicCovered`, et audit de toutes les pages. `summaryPanels`, `summaryCoverage`, `infographic_summary` et « synthèse A4 une page » sont des consignes ERRONÉES pour les vraies livraisons et doivent être considérées comme obsolètes. La seule-page s'applique aux PILOTES de revue uniquement. Ne jamais valider des TNR qui testent une réduction de couverture.

ChatGPT classique par défaut, Work seulement si nécessaire. GO audit → GO production privée → revue pédagogique → GO publication distincte ; aucun merge ni déploiement implicite.

## CONTRAT PRIORITAIRE — PACK DE COURS ALLÉGÉ VALIDÉ LE 20/10/2026

Pour chaque **nouveau cours IFSI ABC**, appliquer en priorité le pack validé par l'utilisateur, devant les anciens contrats de production systématique : **(1)** fiche de révision PDF complète, explications écrites conservées et schémas originaux infographiés *au besoin* ; **(2)** **un cours complet infographié multipage** distinct (exhaustif, visuel, avec schémas anatomiques contrôlés) ; **(3)** QCM corrigé argumenté, cinq choix A–E, 1–3 bonnes réponses ; **(4)** flashcards à questions autonomes, réponse cachée avant retournement dans l'application ; **(5)** planches anatomiques uniquement si pertinentes et absentes de la bibliothèque Anatomie. **Deux références distinctes fournies par l'utilisateur : fiche de révision cardiovasculaire de 17 pages (priorité au texte) et planche circulation sanguine (priorité aux illustrations)**, pilote du 20/10. La fidélité médicale doit être contrôlée indépendamment de l'approbation du style.

**Fiche vocabulaire séparée, scripts vocaux, MP3, exports d'infographies et autres livrables** ne sont plus obligatoires pour chaque cours : création sur demande. **Ne pas effacer** les ressources déjà validées, ni perdre les définitions nécessaires dans la fiche ou dans les flashcards.

**ChatGPT classique par défaut** : audit du support/Drive/application, matrice, rédaction, création des visuels et fichiers réalisables, vérifications, classement ordinaire. **Work seulement en renfort ciblé** si le rendu ou les opérations techniques volumineuses le nécessitent ; pas de seconde génération d'un fichier déjà conforme. GO audit → GO production privée → validation du lot → GO publication distinct.

**Limite technique** : les manifests et tests historiques peuvent imposer deux PDF complets ou d'autres ressources. Ne pas mentir sur un TNR PASS ou publier un pack incomplet au regard du contrat actuel : documenter l'écart et préparer une migration technique dédiée, testée et validée. Ne jamais ajuster le contenu pédagogique pour tromper les tests. Les instructions historiques qui contredisent ce paragraphe sont obsolètes pour les nouvelles productions.


**CONTRÔLE GRAPHIQUE OBLIGATOIRE :** consulter `docs/skills/standard-visuel-fiche-revision-vs-infographie.md`. Pour chaque nouveau pack, produire deux évaluations MANUELLES indépendantes : `REVISION_TEXT_FIRST` (paragraphes et tableaux majoritaires, illustrations ponctuelles et justifiées) et `INFOGRAPHIC_VISUAL_FIRST` (grand schéma anatomique, flèches exactes, zooms et légendes, pas une grille de textes). Aucune validation par simple présence d'image, nombre de pages ou succès TNR ; maquettes non conformes bloquées, sans publication.

# Production et publication des cours

Un « GO production » autorise la préparation du package, ses contrôles et ses autocorrections. Il n'autorise pas sa mise à disposition aux étudiants.

Pour chaque nouveau cours ou mise à jour pédagogique :

1. Préparer et contrôler tous les livrables disponibles, sans demander d'approbation pour chaque brouillon.
2. Présenter un package de revue privé avec des liens ouvrables pour la fiche, le QCM et son corrigé, les infographies intégrées et séparées, le vocabulaire, les flashcards, les planches et les scripts vocaux prévus.
3. Attendre la validation du package et un **GO publication**, ou une instruction explicite équivalente du propriétaire, avant toute mise à disposition dans le Drive étudiant, tout ajout de contenu pédagogique au dépôt public, toute fusion ou tout déploiement de ce lot.
4. Enregistrer la portée et l'empreinte du lot approuvé selon `docs/PUBLICATION_APPROVAL.md`. Une approbation d'un fichier seul ne valide pas les autres éléments. Ne jamais déduire une autorisation de publication d'un simple accusé de réception.
5. Après autorisation, publier les fichiers validés, comparer les copies Drive retéléchargées, exécuter les TNR, vérifier la CI et le déploiement.

Tout changement de contenu après validation invalide l'approbation du lot. Représenter les éléments modifiés avant publication. Les MP3 absents restent explicitement en attente et ne peuvent être annoncés comme produits. Les MP3 reçus ultérieurement font l'objet de leurs propres contrôles et autorisation de mise à disposition.

Les instructions pédagogiques détaillées, transcriptions, pièces officielles non autorisées, captures et liens de revue privés restent hors du dépôt public. Les preuves détaillées de validation utilisateur restent privées ; seules les métadonnées techniques minimales sont versionnées.

## Skill fiches de révision / infographies originales

Pour toute fiche de révision, appliquer **`docs/skills/production-fiches-revision-infographies-originales.md`** avant sa génération, son contrôle et sa publication. **Aucune capture, photo ou figure extraite du support officiel ne doit être intégrée au PDF** : les notions utiles doivent être réinterprétées en infographies originales au modèle validé de la fiche cardiovasculaire, texte majoritaire et figures ponctuelles. Ce skill est distinct des planches anatomiques autonomes et des schémas de QCM. Une maquette non conforme est bloquée avant présentation ; pas de répétition de la consigne à demander à l'utilisateur.

## Skill Pathologies — modèle maître infographies BPCO

**Pour toute nouvelle pathologie et toute refonte d'une fiche Pathologies**, appliquer impérativement `docs/skills/production-pathologies-infographies-cliniques.md` **en complément** du skill fiches original. La présentation des infographies BPCO validée le 20/10/2026 est le **modèle de forme** : toute représentation schématique dans une fiche Pathologies doit être une vraie infographie pédagogique **originale, sourcée, intégrée à la section**, jamais un schéma brut, une capture, une image décorative ou une coupe non expliquée. Nombre de visuels libre selon les notions illustrables ; aucune obligation artificielle de 10 infographies.

**Contrôles bloquants** : inventaire schéma→infographie, vérification médicale du texte/des repères/flèches/chiffres/dispositifs, provenance officielle vs complément vérifié, contrôle PDF page par page à 100 % et mobile, package en revue privée. **La validation du style BPCO ne vaut pas validation médicale ni GO publication.** Les visuels de QCM et les planches anatomiques autonomes conservent leurs règles spécifiques. Ne pas diffuser de contenus non approuvés.

## Validation de forme P1 Pathologies — 20/10/2026

**BPCO, HTA et diabète de type 2 : forme et structure générale acceptées par le propriétaire.** Les témoins graphiques à six panneaux doivent être **préservés fidèlement** : infographies anatomiques riches, comparaisons, encadrés, bandeaux, densité et lisibilité. Une refonte simplifiée ou en géométrie abstraite n'est pas un substitut autorisé. Corriger localement les légendes et erreurs médicales en gardant la qualité visuelle ; si refonte substantielle, revue avant/après obligatoire. Cette validation **ne concerne pas** les assertions médicales, les QCM, flashcards et cas. Exiger un contrôle des choix QCM : aucune bonne réponse systématiquement en A ; répartition des lettres et synchronisation de toutes les corrections. Voir `docs/skills/production-pathologies-infographies-cliniques.md` et `docs/PATHOLOGIES_LOT_P1_VALIDATION_FORME_20261020.md`. **Pas de GO publication du lot à ce stade.**

## Skill anatomie — génération + annotations SVG (méthode principale)

Pour toute planche anatomique nouvelle ou remplacée, appliquer **`docs/skills/production-planches-anatomiques-svg.md`** (en complément du standard IFSI ABC). **Canva n'est plus l'outil de production par défaut** : son ancien skill `docs/skills/production-planches-anatomiques-canva.md` est une archive et un secours ponctuel seulement.

Procédure : illustration anatomique originale **sans texte ni flèche incrustée**, contrôle de l'orientation et des organes, **légendes et flèches en SVG éditables séparément**, contrôle de chaque pointe contre le cours officiel, export HD automatique et TNR. Les positions non vérifiées demeurent `null` : **aucune flèche inventée**. Style graphique : `Planche_05_Cellule_humaine_HD.png` ; pas de collage de figures du cours.

Bloquants : licence/provenance de chaque illustration, validation clinique réelle de toutes les structures et directions, contrôle A4 et mobile, validation de la forme distincte de la validation médicale. Les maquettes en revue n'incrémentent pas le total de planches approuvées et ne servent pas aux QCM. **Pas de diffusion aux étudiants ni de master HD annoncé comme validé sans revue et GO publication explicite du lot exact.** Pilote : `docs/anatomy-r01-svg-pilot.json` (R01 sagittale masculine, 11 repères à vérifier).

## Éligibilité des séances du planning

Avant de créer ou de signaler une fiche manquante à partir du planning, appliquer `docs/COURSE_REVISION_ELIGIBILITY.md` : exclure les connexions MySchool, les temps d’appropriation et les activités administratives/autonomes sans nouveau contenu. Exclure aussi **toutes les simulations** et **toutes les séances asynchrones**, même pédagogiques, de la liste de suivi ; conserver les autres CM, TD et TP pertinents. Ne pas effacer ces créneaux du planning général.

## Orchestration ChatGPT classique / Work — 20/10/2026

**Lire et appliquer `docs/skills/orchestration-chatgpt-classique-work.md`** pour tout nouveau cours, rapprochement d'un support officiel, reprise d'une fiche ou ajout Pathologies. ChatGPT classique pilote l'audit de présence et de qualité, le cadrage pédagogique et la revue ; Work fabrique et contrôle les fichiers lourds, prépare les opérations de classement en masse et l'intégration technique. Si un audit déjà vérifiable est fourni, le réutiliser sans refaire inutilement le même travail. L'organisation ne diminue aucune exigence des skills de fiches originales, Pathologies ou anatomie.

Préserver les ressources précédemment validées, les textes explicatifs et les modèles graphiques récents. Préparer la revue privée avant toute copie étudiante. GO production et GO publication restent deux autorisations distinctes. Les documents pédagogiques détaillés, la traçabilité privée, les liens privés et les transcriptions demeurent hors du dépôt.
