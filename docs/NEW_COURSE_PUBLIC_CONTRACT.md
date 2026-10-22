> **PRIORITÉ 22/10/2026 — charte v1.47.** Le contrat des nouveaux cours reste `hybrid_v1` avec **une fiche hybride unique**. Le maître de contrôle graphique n'est plus l'annexe v1.46 à dix pages : il s'agit de **Pharmacologie P01, fiche hybride de 24 pages**, identifiant technique `pharmacologie_v1.47_24_pages`. Les sections imposant deux PDF ci-dessous sont historiques et n'autorisent aucune migration rétroactive. QCM, flashcards et vocaux inchangés ; contrôle médical/visuel et GO publication restent requis.

> **CONTRAT PRIORITAIRE NOUVEAUX COURS — 22/10/2026 — v1.46.** Les premières livraisons futures utilisent par défaut `hybrid_v1` (un seul PDF de fiche hybride infographiée, avec lexique sélectionnable à la fin). Les anciennes obligations d'un deuxième PDF `complete_infographic` et des planches totales séparées sont archivées ci-dessous et restent uniquement valides pour les packs historiques. La nouvelle validation est `tests/hybrid-sheet-contract.mjs` et le détail dans [HYBRID_REVISION_V146.md](HYBRID_REVISION_V146.md). QCM, flashcards et vocaux restent inchangés ; preuve Drive, contrôles médicaux/visuels, revue privée et GO publication distinct demeurent obligatoires. Ne jamais publier un brouillon ou falsifier les champs d'audit.

## RECTIFICATIF PRIORITAIRE — PILOTE ≠ LIVRABLE FINAL (20/10/2026)

Le pilote « une page de chaque » sert exclusivement à valider la maquette graphique. Pour un VRAI cours, livrer **DEUX COURS COMPLETS** couvrant toutes les notions du support officiel : (1) fiche de révision textuelle complète avec schémas infographiés intégrés au besoin ; (2) **cours intégralement infographié MULTIPAGE**, sans plafond de pages et avec toutes les notions expliquées. Compléter par QCM A–E (1–3 bonnes réponses), flashcards et planches anatomiques si nécessaires. Modèles graphiques cardio/respiratoire. Aucun contenu ne doit être sacrifié pour tenir sur une page.

Le contrat `lean_v1` garde son nom technique pour compatibilité, mais exige désormais `sheetFormat:"complete_infographic"`, `dualSheetCoverage.expectedNotions===classicCovered===infographicCovered`, et audit de toutes les pages. `summaryPanels`, `summaryCoverage`, `infographic_summary` et « synthèse A4 une page » sont des consignes ERRONÉES pour les vraies livraisons et doivent être considérées comme obsolètes. La seule-page s'applique aux PILOTES de revue uniquement. Ne jamais valider des TNR qui testent une réduction de couverture.

ChatGPT classique par défaut, Work seulement si nécessaire. GO audit → GO production privée → revue pédagogique → GO publication distincte ; aucun merge ni déploiement implicite.


**CONTRÔLE GRAPHIQUE OBLIGATOIRE :** consulter `docs/skills/standard-visuel-fiche-revision-vs-infographie.md`. Pour chaque nouveau pack, produire deux évaluations MANUELLES indépendantes : `REVISION_TEXT_FIRST` (paragraphes et tableaux majoritaires, illustrations ponctuelles et justifiées) et `INFOGRAPHIC_VISUAL_FIRST` (grand schéma anatomique, flèches exactes, zooms et légendes, pas une grille de textes). Aucune validation par simple présence d'image, nombre de pages ou succès TNR ; maquettes non conformes bloquées, sans publication.

# Contrat technique public — ajout d'un cours IFSI ABC


## Avis de compatibilité — standard pédagogique simplifié validé le 20/10/2026

Le propriétaire a retenu pour les futurs cours une fiche complète avec schémas utiles, **un cours complet infographié multipage** distinct, QCM corrigés, flashcards, et planches anatomiques selon besoin. Le second cours exhaustif infographié est obligatoire ; seuls les vocaux, vocabulaire séparé et exports de figures sont facultatifs par défaut.

**Ce document et les TNR historiques peuvent encore imposer une couverture complète dans deux PDF, des champs `dualSheetCoverage` ou des comptes de ressources.** La simplification pédagogique **n'est pas** une modification automatique de schéma : ne pas injecter de fausses empreintes, `validated: true`, lien Drive fictif, `PASS` fictif ni couverture de notions fictive pour satisfaire des tests hérités. Si une livraison est incompatible avec le contrat applicatif existant, garder son statut privé et proposer une évolution du contrat/tests dans une PR spécifique avec tests et autorisation de publication séparée.

Conserver les règles d'identifiants stables, de corrections cohérentes et d'approbation explicite avant diffusion.

Ce document définit les obligations **techniques** du dépôt, indépendamment des chartes pédagogiques et références graphiques conservées hors du dépôt. Il ne contient aucun lien vers des documents privés.

## 1. Identification et données

- Lire le registre `course-registry-v741.json` et réutiliser le `courseId` existant. Si le cours est nouveau, ajouter un identifiant snake_case stable et un libellé canonique.
- Un cours inscrit uniquement pour préparer un support peut rester sans ressources publiées. Ne pas créer artificiellement des PDF ou des URL.
- Toute ressource effectivement publiée doit être rattachée au bon `courseId` et avoir des IDs stables.
- Le cours officiel, la fiche de révision et les captures provisoires sont des catégories différentes.

## 2. Questions et correction

- Une question intégrée utilise les réponses `answers` comme vérité unique pour l'affichage, la notation, la correction, le mode Erreurs et les statistiques.
- Le moteur actuel et les contrats de livraison acceptent **1 à 3 bonnes réponses** pour chaque nouvelle question ; ne pas injecter un QCM à 4 bonnes réponses sans migration explicite des tests et du moteur.
- Chaque nouvelle question comporte thème, difficulté et explication argumentée. Afficher distinctement « Ta réponse » et « Bonne réponse » après validation, avec sélection et confiance figées.
- Les fichiers PDF et les banques applicatives doivent rester cohérents sur la même question.

## 3. Livraison déclarée

- Utiliser `docs/course-deliveries.json` pour la livraison complète des cours concernés, selon `docs/COURSE_DELIVERY.md`.
- Les **neuf dossiers** prévus sont 01 à 08 et 99, avec le dossier 07 pour les flashcards et le 08 pour les scripts vocaux.
- Un cours nouvellement ajouté au registre **ou déjà pré-inscrit sans ressources** et désormais pourvu pour la première fois de fiches, QCM PDF, infographies ou vocaux est bloqué en CI s'il n'est pas enregistré dans le manifeste.
- Si un cours **déjà publié** reçoit une nouvelle partie, les nouveaux `resourceId` de fiches, infographies, vocaux ainsi que les nouveaux ID QCM provenant des banques `qextra-*.txt` modifiées doivent être déclarés dans `partDeliveries[]` du même cours. La CI compare le commit de base aux fichiers et refuse les ajouts sans déclaration ou rattachés à un mauvais `partId`.
- Une simple entrée de calendrier / un cours sans ressources publiées ne déclenche pas cette exigence.
- Le statut `awaiting_mp3` est utilisé lorsque les scripts sont disponibles mais que les MP3 n'ont pas été fournis.
- Chaque partie contient `partId` (ex. `p02`), `validated`, `status`, et les tableaux d'identifiants `sheetResourceIds`, `infographicResourceIds`, `vocalIds`, `qcmQuestionIds` correspondant aux nouvelles ressources. Une partie avec fiche sans schéma doit indiquer `schematics: "none"` après vérification de son support.
- Pour une première publication ou une nouvelle partie comportant des infographies, le bilan `visualAudit` doit être `PASS`, suivi de `publishedVerification` à `MATCH` avec la même empreinte SHA-256, calculé à partir du PDF authentiquement retéléchargé depuis le dossier Drive final.
- Les déclarations détaillées de schémas, les fichiers privés et les rapports médicaux complets ne doivent jamais être placés dans GitHub public. La CI ne certifie pas la provenance du fichier Drive et ne remplace pas la revue médicale.

## 4. Qualité et intégration

- Avant publication pédagogique, présenter tous les livrables en revue privée et obtenir une validation du package suivie d'un **GO publication** explicite. Un GO production n'autorise pas la mise à disposition étudiante. Voir `PUBLICATION_APPROVAL.md` et le contrôle `tests/course-publication-approval.mjs`.
- Un lot = une branche courte + une PR.
- Exécuter les tests existants et `node tests/course-delivery.mjs`. Le nouveau garde-fou `node tests/course-delivery-new-course.mjs` compare le registre du changement à son commit de base ; la CI réalise cette comparaison avec l'historique Git complet.
- Vérifier la CI `TNR IFSI ABC`, puis le rendu dans l'application et les ressources réellement accessibles. Un succès de CI ne démontre pas à lui seul la validité scientifique du cours ni l'accès en temps réel à Google Drive.
- Ne pas fusionner lorsque les tests sont rouges. Aucun cours sans couverture du manifeste ne peut être déclaré livré si la publication de ressources est prévue.

## 5. Confidentialité

Ce dépôt est public. Ne pas y commiter de fichiers privés issus du Drive, de transcriptions, de supports non autorisés, de secrets, de photographies privées ou de liens vers un référentiel privé. Conserver les chartes pédagogiques complètes et les modèles graphiques dans un emplacement à accès restreint.

## Nouveau contrat v1.13 — deux PDF indépendants

Les nouvelles premières publications et parties complètes requièrent un `sheetResourceId` classique et un `infographicSheetResourceId` complet infographié. Les entrées `sheets-*.json` sont identifiées par `sheetFormat: "classic"` ou `"complete_infographic"`, avec Drive ID distinct.

Leurs contrôles PDF et empreintes Drive ne sont jamais mutualisés : `visualAudit`/`publishedVerification` pour la classique, `infographicSheetVisualAudit`/`infographicSheetPublishedVerification` pour l'infographiée, `artifactSha256s` pour les deux fichiers et `dualSheetCoverage` pour toutes les notions importantes. Les tests CI n'attestent pas la qualité clinique ni les octets Drive privés ; revue privée et GO publication restent obligatoires.

Les nouvelles planches classées `category: "anatomy"` dans les compléments exigent un `atlasId` réel et n'apparaissent pas dans la liste générique des documents du cours. Les contenus antérieurs restent inchangés jusqu'à une migration validée. Voir `docs/DUAL_SHEET_WORKFLOW_V113.md`.
