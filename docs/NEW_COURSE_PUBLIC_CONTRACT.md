# Contrat technique public — ajout d'un cours IFSI ABC

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

- Un lot = une branche courte + une PR.
- Exécuter les tests existants et `node tests/course-delivery.mjs`. Le nouveau garde-fou `node tests/course-delivery-new-course.mjs` compare le registre du changement à son commit de base ; la CI réalise cette comparaison avec l'historique Git complet.
- Vérifier la CI `TNR IFSI ABC`, puis le rendu dans l'application et les ressources réellement accessibles. Un succès de CI ne démontre pas à lui seul la validité scientifique du cours ni l'accès en temps réel à Google Drive.
- Ne pas fusionner lorsque les tests sont rouges. Aucun cours sans couverture du manifeste ne peut être déclaré livré si la publication de ressources est prévue.

## 5. Confidentialité

Ce dépôt est public. Ne pas y commiter de fichiers privés issus du Drive, de transcriptions, de supports non autorisés, de secrets, de photographies privées ou de liens vers un référentiel privé. Conserver les chartes pédagogiques complètes et les modèles graphiques dans un emplacement à accès restreint.
