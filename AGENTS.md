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
