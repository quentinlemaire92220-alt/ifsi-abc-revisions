# IFSI ABC — Non-régression pédagogique des fiches (charte v1.49)

**Décision validée le 28 octobre 2026.** Référence normative privée : `CHARTE_IFSI_ABC_v1.49_NON_REGRESSION_PEDAGOGIQUE_2026-10-28` (Google Drive propriétaire). Ce document public est une *transcription opérationnelle sans données privées*. Il complète `docs/WRITTEN_REVISION_V153.md`, `docs/PDF_TEMPLATE_CONTRACT_V3.md` et le contrat V5.3 ; il ne remplace pas les règles de trame, de QCM, flashcards ou vocaux. Aucun ancien PDF n'est migré.

## Quand la règle s'applique

À toute **nouvelle fiche** et à toute **révision/régénération** d'une fiche existante, notamment après réception d'un support officiel, de captures ou d'une ou plusieurs parties PLAUD. L'ajout de nouvelles sources n'entraîne **jamais** une régénération automatique : il faut une demande explicite. Le GO de production privée ne vaut pas GO de diffusion ou de fusion d'un lot pédagogique.

## Dossier d'entrée à reconstituer avant de rédiger

- Source officielle intégrale (ou captures provisoires identifiées), toutes les transcriptions de la même séance, notes et annexes pertinentes ; signaler toute partie absente, tronquée ou douteuse, notamment `incomplete_tail`.
- Dernière fiche publiée, versions en préparation et anciennes fiches provisoires **utiles**, sans écraser les originaux ; récupérer aussi le lexique, les exemples, les figures/tables autorisées par la trame et les réserves antérieures.
- Identifier l'UE, l'enseignant, la séance, les objectifs ; distinguer **priorité annoncée explicitement par l'enseignant**, **priorité déduite**, et remarque/réponse d'étudiant non confirmée.
- Ne pas introduire de savoir médical externe sans autorisation préalable du propriétaire. En cas de contradiction, documenter une réserve dans la QA privée au lieu d'inventer une réconciliation.

## Matrice privée de couverture ET d'héritage — obligatoire

Pour **chaque notion importante**, conserver une ligne comprenant au minimum :

| Champ | Contenu attendu |
| --- | --- |
| Identifiant / thème | ID stable de notion, objectif pédagogique |
| Priorité | Enseignant explicite / déduite, avec justification |
| Références sources | Support et page/diapo ; PLAUD partie + repère temporel privé ; statut d'exhaustivité |
| Héritage | Ancienne fiche, version, page/section, précision à conserver |
| Cible | Nouvelle fiche, section/page et références explicatives |
| Profondeur | `citée`, `expliquée` ou `appliquée` selon la compétence attendue |
| Évolution | `conservée`, `enrichie`, `corrigée`, `fusionnée` ou `manquante` |
| Décision | Motif d'une correction/fusion/suppression, réserves et validation effective |

Conserver cette matrice, les transcriptions, les horodatages, les rapports et les approbations **uniquement dans le Drive privé propriétaire** ; ne pas les commiter, y compris en PJ de PR. Un résumé public peut contenir uniquement les règles et le résultat de contrôles non sensibles.

## Deux contrôles pédagogiques distincts

**A. Couverture des sources :** toutes les notions importantes, objectifs, nuances et exemples pertinents des sources réellement accessibles doivent être vérifiables dans la nouvelle fiche ou faire l'objet d'une fusion/correction justifiée.

**B. Non-régression par rapport à la fiche précédente :** chaque définition, condition, exception, mécanisme, seuil, cas clinique, distinction, « À retenir », piège QCM et élément de lexique importants doivent rester présents avec une précision équivalente ou supérieure ; une erreur peut être corrigée en documentant pourquoi. Une réduction de pages ne justifie jamais une perte de fond.

Une occurrence de terme **n'est pas une couverture suffisante**. Selon le besoin, vérifier `définir → comprendre → appliquer` : mécanisme, indications/limites, exemple de soin, rôle infirmier, surveillance/réévaluation et confusion possible. Ne pas forcer artificiellement toutes ces rubriques pour chaque terme.

**Exemple de contrôle :** une fiche qui liste seulement « distraction » parmi les mesures non médicamenteuses ne démontre pas qu'elle explique la distraction antalgique : attention/perception, techniques adaptées, moment du soin, rôle IDE, limites, réévaluation.

## Journal privé des différences

Pour chaque notion : `conservée / enrichie / corrigée / fusionnée / manquante`, emplacement avant/après, motif et réserve. Vérifier sémantiquement le contenu : un diff lexical, un score automatique ou un TNR vert **ne prouve pas** l'exactitude ni l'absence de perte.

**BLOQUÉ — RÉGRESSION PÉDAGOGIQUE** si une notion essentielle disparaît, n'est plus expliquée au niveau nécessaire, est déformée, ou si une suppression/fusion n'est pas justifiée.

**BLOQUÉ — COUVERTURE NON DÉMONTRÉE** si un élément source essentiel manque ou est tronqué, si les transcriptions ne sont pas rapprochées ou si une contradiction importante reste ouverte. Un travail partiel peut rester en préparation privée mais ne devient pas « exhaustif » par déclaration.

## Deux revues et trois frontières

1. **Revue pédagogique/scientifique** de la matrice, des écarts et de l'attribution des propos ; inscrire les réserves non résolues.
2. **Revue graphique** du PDF final **sur toutes ses pages réelles**, selon les deux modèles Communication et le contrat de trame V3. Vérifier notamment bandeaux violets haut/bas, pagination, lisibilité et ordre final : **Pièges QCM unique → Synthèse générale → Définitions et mots-clés en dernier**. Texte sélectionnable.
3. Préparation privée, publication Drive/app et fusion GitHub sont des actions différentes. Un GO ne s'étend pas à d'autres livrables ; les octets modifiés invalident l'ancien contrôle du candidat. Conserver toutes les versions précédentes.

## Intégration de workflow

Pour une fiche créée ou révisée, joindre **dans la revue privée** une matrice avant/après et un journal des écarts. **Ne jamais** certifier « 100 % couvert », « sans régression », « validé médicalement » ni « prêt à publier » sur la seule base du nom du fichier, d'une présence lexicale, de l'absence d'erreur technique ou d'un rapport partiellement vérifié.

Références d'exécution : `docs/skills/controle-non-regression-pedagogique-v149.md`, `docs/skills/production-fiches-revision-ecrites-v153.md`, `docs/COURSE_PREFLIGHT.md`. Ce document ne change pas les contrôles historiques ni les contenus déjà publiés.
