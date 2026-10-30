# UE B1.1 S1 — Les organes des sens — préparation de l'application

Date du cours : 29 octobre 2026. Enseignante : Mme Vanessa Petit. ID cible : `organes_des_sens_b11`.

## Inventaire disponible et intégration préparatoire

- Support officiel reçu (56 diapositives) et transcription de la séance (~1 h 53), conservés dans Drive privé.
- Fiche de révision **écrite**, sans illustrations : 14 pages, contrôle pédagogique final en attente.
- Planches anatomiques : 7 pages, **à corriger** (légendes insuffisamment lisibles et harmonisation avec les planches déjà présentes dans l'application non validée).
- Banque source privée : 50 QCM, 5 propositions A–E chacun, 1 à 3 réponses correctes ; 50 flashcards ; lexique de 59 définitions ; 3 scripts vocaux TXT, **aucun MP3 validé**.\n- **Import effectué en préparation uniquement** : `data/course-preparations/organes_des_sens_b11.json` (50 QCM et 50 cartes) et `data/course-preparations/organes_des_sens_b11_lexique.json` (59 définitions). Ces banques ne sont pas lues par les modules étudiants.
- Les PDF étudiants, les scripts vocaux, les sources officielles et transcriptions **ne sont pas importés** dans le dépôt public. Les compteurs `artifacts` du registre de préparation sont désormais 50 / 50 / 59 / 0, correspondant aux données réellement présentes dans `data/course-preparations/`.

## Contrôles et réserves

- Recherche dans `course-registry-v741.json` : aucune entrée correspondant à « Les organes des sens » à la création de cette préparation.
- Les 50 QCM locaux ont cinq choix et entre une et trois bonnes réponses ; ceci constitue seulement un contrôle **structurel**, pas une validation scientifique.
- Les 50 flashcards et les 59 définitions sont converties au format canonique de préparation ; leur validation sémantique reste à effectuer.
- Statut de l'oral : `unverified` tant que sa couverture exhaustive n'est pas documentée.
- Les schémas anatomiques et leurs flèches / légendes doivent être revus individuellement et comparés aux modèles déjà publiés.
- Contrôle trame PDF V3 / modèle Communication, revue médicale et graphique finale, épreuve des octets, puis décision du propriétaire restent à réaliser.

## Suite avant activation

1. **Import effectué**. Vérifier la concordance sémantique des 50 clés et explications avec le PDF QCM et avec les sources, puis rapprocher les 59 définitions sans fuite dans les banques étudiantes.
2. Exécuter `node tests/course-preparation-stage.mjs` et les préflights privés de préparation.
3. Corriger et contrôler les sept planches, vérifier toutes les pages des PDF de la fiche et des QCM face aux références figées.
4. Obtenir l'acceptation pédagogique et graphique du **lot exact** ; les MP3 restent explicitement absents.
5. Préparer une **PR de publication distincte** pour `course-registry`, `questions-*.json`, fiches, vocaux, vocabulaire et caches, puis TNR complets, CI, contrôles de déploiement.

**Statut de cette PR : préparatoire uniquement.** Aucun cours, QCM, PDF, carte, définition, vocal ou schéma nouveau n'est rendu visible dans l'application active. Ne pas fusionner cette PR tant que les contrôles de préparation ne sont pas terminés. Ne pas confondre instruction de mise à jour avec réception des validations du contenu et de la charte.
