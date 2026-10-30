# UE B1.1 S1 — Les organes des sens — préparation de l'application

Date du cours : 29 octobre 2026. Enseignante : Mme Vanessa Petit. ID cible : `organes_des_sens_b11`.

## Inventaire local privé disponible, non importé

- Support officiel reçu (56 diapositives) et transcription de la séance (~1 h 53), conservés dans Drive privé.
- Fiche de révision **écrite**, sans illustrations : 14 pages, contrôle pédagogique final en attente.
- Planches anatomiques : 7 pages, **à corriger** (légendes insuffisamment lisibles et harmonisation avec les planches déjà présentes dans l'application non validée).
- Banque source privée : 50 QCM, 5 propositions A–E chacun, 1 à 3 réponses correctes ; 50 flashcards ; lexique de 59 définitions ; 3 scripts vocaux TXT, **aucun MP3 validé**.
- La banque locale et les PDF étudiants n'ont **pas** été importés dans le dépôt public. Les compteurs `artifacts` du registre de préparation comptent uniquement les banques effectivement présentes dans ce dépôt ; ils restent donc à zéro jusqu'à import contrôlé.

## Contrôles et réserves

- Recherche dans `course-registry-v741.json` : aucune entrée correspondant à « Les organes des sens » à la création de cette préparation.
- Les 50 QCM locaux ont cinq choix et entre une et trois bonnes réponses ; ceci constitue seulement un contrôle **structurel**, pas une validation scientifique.
- Les 50 flashcards et les 59 définitions locales sont prêtes pour conversion au format canonique, à rapprocher du support et de l'oral.
- Statut de l'oral : `unverified` tant que sa couverture exhaustive n'est pas documentée.
- Les schémas anatomiques et leurs flèches / légendes doivent être revus individuellement et comparés aux modèles déjà publiés.
- Contrôle trame PDF V3 / modèle Communication, revue médicale et graphique finale, épreuve des octets, puis décision du propriétaire restent à réaliser.

## Suite avant activation

1. Importer les QCM et flashcards dans `data/course-preparations/` et vérifier les 50 clés, les explications et les 59 définitions, sans fuite dans les banques étudiantes.
2. Exécuter `node tests/course-preparation-stage.mjs` et les préflights privés de préparation.
3. Corriger et contrôler les sept planches, vérifier toutes les pages des PDF de la fiche et des QCM face aux références figées.
4. Obtenir l'acceptation pédagogique et graphique du **lot exact** ; les MP3 restent explicitement absents.
5. Préparer une **PR de publication distincte** pour `course-registry`, `questions-*.json`, fiches, vocaux, vocabulaire et caches, puis TNR complets, CI, contrôles de déploiement.

**Statut de cette PR : préparatoire uniquement.** Aucun cours, QCM, PDF, carte, définition, vocal ou schéma nouveau n'est rendu visible dans l'application active. Ne pas fusionner cette PR tant que les contrôles de préparation ne sont pas terminés. Ne pas confondre instruction de mise à jour avec réception des validations du contenu et de la charte.
