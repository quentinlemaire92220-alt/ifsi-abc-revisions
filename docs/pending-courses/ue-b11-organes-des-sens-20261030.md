# UE B1.1 S1 — Les organes des sens — préparation de l'application

Date du cours : 29 octobre 2026. Enseignante : Mme Vanessa Petit. ID cible : `organes_des_sens_b11`.

## Inventaire disponible et intégration préparatoire

- Support officiel reçu (56 diapositives) et transcription de la séance (~1 h 53), conservés dans Drive privé.
- Fiche de révision **écrite**, sans illustrations : 14 pages, contrôle pédagogique final en attente.
- Planches anatomiques : 7 pages, **à corriger** (légendes insuffisamment lisibles et harmonisation avec les planches déjà présentes dans l'application non validée).
- Banque source privée : 50 QCM, 5 propositions A–E chacun, 1 à 3 réponses correctes ; 50 flashcards ; lexique de 59 définitions ; 3 scripts vocaux TXT, **aucun MP3 validé**.
- **Import effectué en préparation uniquement** : `data/course-preparations/organes_des_sens_b11.json` (50 QCM et 50 cartes) et `data/course-preparations/organes_des_sens_b11_lexique.json` (59 définitions). Ces banques ne sont pas lues par les modules étudiants.
- Les PDF étudiants, les scripts vocaux, les sources officielles et transcriptions **ne sont pas importés** dans le dépôt public. Les compteurs `artifacts` du registre de préparation sont désormais 50 / 50 / 59 / 0, correspondant aux données réellement présentes dans `data/course-preparations/`.

## Contrôles et réserves

- Recherche dans `course-registry-v741.json` : aucune entrée correspondant à « Les organes des sens » à la création de cette préparation.
- Les 50 QCM locaux ont cinq choix et entre une et trois bonnes réponses ; ceci constitue seulement un contrôle **structurel**, pas une validation scientifique.
- Contrôle PDF QCM privé : les 50 énoncés, 250 choix et 250 justifications d’origine sont présents dans le PDF de 18 pages. **Après correction des dépendances au « support/cours » dans la banque d’application, son texte ne correspond plus mot pour mot au PDF** : miroir PDF/banque à régénérer, relire et vérifier avant toute diffusion. Les clés et cardinalités sont conservées.
- Les 50 flashcards et les 59 définitions sont converties au format canonique de préparation ; leur validation sémantique reste à effectuer.
- Sept items ont eu une reformulation autonome dans la banque de préparation : IDs 005, 018, 019, 036, 043, 044, 050 ; aucun indice de bonne réponse n'a été modifié.
- Reprise PR #275 : reformulations autonomes complémentaires des QCM 020, 039, 045, 046 et 047 (l’item 045 est recentré sur l’anatomie des papilles et non sur les consignes de l'enseignante). Clés et cardinalités conservées. Relecture scientifique toujours requise.
- Revue complémentaire du lot privé : le QCM 033 ne dépend plus d’un schéma absent ; les corrigés 007, 009, 012, 016, 031, 037, 041 et 049 sont reformulés pour supprimer les références au cours, à la voix de l’enseignante et aux documents. Les réponses correctes et leur nombre ne changent pas.
- Deux PDF de relecture distincts ont été régénérés hors de la branche de publication (50 QCM corrigés / 7 planches), sans validation graphique ou scientifique finale. Ne pas les considérer comme fichiers étudiants prêts à diffuser.
- Statut de l'oral : `unverified` tant que sa couverture exhaustive n'est pas documentée.
- Les schémas anatomiques et leurs flèches / légendes doivent être revus individuellement et comparés aux modèles déjà publiés.
- Contrôle trame PDF V3 / modèle Communication, revue médicale et graphique finale, épreuve des octets, puis décision du propriétaire restent à réaliser.

## Revue ciblée des contenus — 30 octobre 2026 (second passage)

- Rectifications internes de la banque de préparation : QCM 018 (chiasma optique = croisement des fibres, non relais synaptique), 019 (distracteurs auparavant redondants), 020 (propositions autonomes). **Indices et cardinalités des réponses inchangés.**
- Alignement des flashcards 022 (oreille externe), 039 (narines et choanes), 040 (fonctions non gustatives de la langue), 045 (pore gustatif), 046 (couches de la peau) sur leurs chapitres et sur le support officiel, sans modification du nombre total (50).
- Test d'intégrité des flashcards renforcé (thème, unicité du recto, réponse présente). Ce contrôle technique n'est pas une certification scientifique.
- **PDF de relecture antérieur obsolète dès cette modification :** régénérer le PDF QCM à partir du commit de la banque avant tout contrôle de concordance octet/texte. Les sept planches restent candidates : positionnement de chaque repère anatomique à valider visuellement, notamment les repères 06–08 sur la planche 05.

## Suite avant activation

1. **Import effectué**. Vérifier la concordance sémantique des 50 clés et explications avec le PDF QCM et avec les sources, puis rapprocher les 59 définitions sans fuite dans les banques étudiantes.
2. Exécuter le contrôle `node tests/course-preparation-stage.mjs` (désormais déclenché dans la CI TNR de la PR) et les préflights privés de préparation ; vérifier les résultats avant toute fusion.
3. Corriger et contrôler les sept planches, vérifier toutes les pages des PDF de la fiche et des QCM face aux références figées.
4. Obtenir l'acceptation pédagogique et graphique du **lot exact** ; les MP3 restent explicitement absents.
5. Préparer une **PR de publication distincte** pour `course-registry`, `questions-*.json`, fiches, vocaux, vocabulaire et caches, puis TNR complets, CI, contrôles de déploiement.

**Statut de cette PR : préparatoire uniquement.** Aucun cours, QCM, PDF, carte, définition, vocal ou schéma nouveau n'est rendu visible dans l'application active. Ne pas fusionner cette PR tant que les contrôles de préparation ne sont pas terminés. Ne pas confondre instruction de mise à jour avec réception des validations du contenu et de la charte.
