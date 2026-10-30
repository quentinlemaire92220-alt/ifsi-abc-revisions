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

## Candidats privés V2 générés après la deuxième revue

- **QCM :** `UE_B1_1_Organes_des_sens_QCM_50_CORRIGES_RELECTURE_V2.pdf`, 26 pages, SHA-256 `d5a09b3f7bc6fcadefcf1a26ac78773606207de41f6444b8bc19a8ab0a1691db`.
- **Planches :** `UE_B1_1_Organes_des_sens_7_planches_RELECTURE_V2.pdf`, 7 pages A4 paysage, SHA-256 `2f0e2f5f98b51e0019827747e344b1095af33e652d9710d60a3ffcf331d44830`.
- **Banque JSON :** 50 QCM, 50 cartes, SHA-256 `8f83de7842996bc0185d0165db8d31d0d647cdfdd3427f3a2e5989b7f139ae14`.
- Ces fichiers de relecture sont **produits hors dépôt GitHub**, sans transmission aux modules étudiants. Le PDF QCM a été régénéré après les derniers changements de la banque ; ses 250 propositions sont retrouvées à l'extraction, sans prétendre à une approbation pédagogique complète.
- Les planches 01–04 et 06–07 présentent des repères non numérotés ; seule la planche 05 conserve des pastilles 1–8, assorties d'une légende. **Vérification anatomique finale de chaque repère toujours nécessaire.**

## Candidats privés V3 — relecture avant publication (30/10/2026)

- **QCM V3** : `UE_B1_1_Organes_des_sens_QCM_50_CORRIGES_RELECTURE_V3.pdf`, **24 pages**, SHA-256 `e456458080e81b91733fc2c8032e4e3cb2064246facc1413ea536e9b0bec829f`. Enoncés et propositions sans clé dans la première section ; **50 corrigés argumentés A–E séparés**, mise en page Lato, bandeaux et cases.
- **Planches V3** : `UE_B1_1_Organes_des_sens_7_planches_RELECTURE_V3.pdf`, 7 pages A4 paysage, SHA-256 `f8a866e36b5c02ace71a0782a8675ffce74b9c64f9277114a2d83058e62ab22d`. La planche 05 utilise **le schéma officiellement légendé de la diapositive 36** ; les numéros imaginés sur l'image précédente sont retirés. Les six autres illustrations restent à vérifier par un relecteur anatomique.
- **Banque V3** : `UE_B1_1_Organes_des_sens_BANQUE_QCM_50_REVISEE_V3.json`, SHA-256 `65acba4cbafb8667aa18ffa9b91d6a9a16dc11d67b32d21bbd7268624c24a4e2`. Correspond à la banque de la branche au blob Git `251930d2687d9eb03611261dda7ebcfe1d6cf6c5`. QCM 014, 020, 022 et 041 ajustés sans changement des réponses ni de leur nombre.
- **Modèle QCM identifié et vérifié en octets :** `communication_qcm_2026-10-24`, 23 pages, SHA-256 `199f8d4fe7dcefcd76a8be90f097d652c0d1854407c91ce370a9099844e10ec7`. C'est bien la référence figée de `docs/pdf-template-policy-v3.json`.
- **Exécution réelle** de `tools/pdf-template-v3.py --role qcm --technical-only` sur le PDF QCM V3 : **PASS, zéro erreur, 24 pages**. Contrôles complémentaires : 50 intitulés, 250 propositions, 50 corrections A-E synchronisés ; aucun corrigé livré avant la section de réponses.
- **Sans statut `owner_accepted` :** le contrôle technique n'est pas la revue humaine des 24 pages à 100 % et 200 %, ni une approbation pédagogique ou anatomique. Fiche écrite, 50 flashcards, 59 définitions et sources orales restent à valider exhaustivement. Aucun MP3 ni activation étudiant ; tous les nouveaux PDF demeurent **hors dépôt et hors application publiée**.
- Les versions V1 et V2 servent d'historique de relecture mais sont **remplacées par V3 pour toute revue du QCM et de la planche 05**. Ne pas publier les versions anciennes.

## Candidat privé V4 — couverture des notions officielles (30/10/2026)

- Banque QCM source : 50 questions, 250 choix, 50 cartes. **QCM 018, 019, 021, 035, 040 et 047** ont été enrichis en distracteurs/corrigés à partir des diapos 21, 22, 15/20, 38, 44 et 53 (respectivement radiations optiques, astigmatisme, trajet de la lumière, groupes de sinus, phonation, synthèse cutanée de vitamine D). **Réponses et cardinalités inchangées.** Nouveau blob Git `c52d88a15706481c291df9c01e340ba3c3d1ac06`.
- Fichier de relecture **QCM V4** : `UE_B1_1_Organes_des_sens_QCM_50_CORRIGES_RELECTURE_V4.pdf`, **24 pages**, SHA-256 **`b3e6ed008bf0b4bec8f76406fa35544901450d1463afe3dfbd344dab40658aea`**. Le titre décrit correctement les **cinq sens et les principes sensoriels** (six rubriques). La banque locale V4 a pour SHA-256 `c7232ab3e74e75acd018503fb610c0b7b3582b04fd14bf2c656443de43d7dbd6` et son Git blob est identique à celui de la branche.
- **Contrat PDF V3 technique réexécuté sur les octets V4 exacts : PASS, 0 erreur**, `humanReviewRequired: true`. Concordance 50 intitulés + 250 propositions avec le PDF, clés et corrigés distincts, toutes les pages paginées. Un aperçu des 24 pages et des vues agrandies ciblées ont été examinés, mais **aucune attestation de comparaison humaine exhaustive à 100 % et 200 % n'est émise**.
- **Planches anatomiques** : conserver les 7 pages **V3 inchangées**, SHA-256 `f8a866e36b5c02ace71a0782a8675ffce74b9c64f9277114a2d83058e62ab22d`. La planche 05 reprend le schéma légendé du support officiel (diapo 36) ; les six autres planches doivent encore être validées anatomiquement par un relecteur.
- **Réserves scientifiques relevées dans le support lui-même :** la diapo 49 annonce « deux paires » de nerfs gustatifs puis cite facial, glossopharyngien et vague ; la synthèse diapo 56 place le bulbe olfactif en « récepteur » ; la diapo 48 ne cite que quatre saveurs. Le QCM évite de transformer ces points contradictoires/incomplets en affirmations exclusives. Une revue médicale experte demeure requise.
- Le rapport de correspondance des questions aux chapitres, les réserves et le JSON de validation technique restent **dans le dossier privé de relecture V4**, pas dans l'application étudiante. Les **V1–V3 du QCM sont obsolètes** pour l'accord de publication ; **V3 des planches** inchangée.
- Aucun `owner_accepted`, aucun MP3, aucune fusion ou publication du cours ; une **PR de publication distincte** sera nécessaire après toutes les validations sur les fichiers exacts.

## Relecture anatomique ciblée — planches V5

- **Planche 06 (langue)** : schéma de l'enseignante figurant dans le support officiel diapositive **47**, inchangé au rendu par rapport à V4. L'illustration source porte les noms des papilles et du bourgeon gustatif.
- **Planche 07 (peau)** : remplacement de l'illustration source diapositive **51** par l'image officielle plus détaillée de la diapositive **52**. La bande basse du schéma d'origine portait plusieurs légendes qui se chevauchaient : seule cette bande de légendes est masquée, et les noms « cellules adipeuses », « terminaisons nerveuses », « cellules matricielles » et « tissu conjonctif » sont réinscrits en texte PDF, sans nouvelles flèches ou positionnements anatomiques inventés.
- **Nouveau candidat privé** `UE_B1_1_Organes_des_sens_7_planches_RELECTURE_V5.pdf` : 7 pages A4 paysage, SHA-256 **`d17cdd23a2e0d1ac52e67a4bb5fd9aa141d27541ac9302e6f63b23566d03dd40`**. Contrôle de rendu : les six premières pages restent **pixel-identiques à V4**, la septième est modifiée ; sept illustrations présentes.
- Le lot associé conserve le **QCM V4 inchangé** (24 pages, SHA-256 `b3e6ed008bf0b4bec8f76406fa35544901450d1463afe3dfbd344dab40658aea`) et la **banque JSON V4** (SHA-256 `c7232ab3e74e75acd018503fb610c0b7b3582b04fd14bf2c656443de43d7dbd6`). Les octets V4 du QCM ne sont pas modifiés ; leur PASS technique V3 précédent est maintenu, non présenté comme une nouvelle exécution.
- **Périmètre** : PDF et captures de vérification créés hors GitHub et hors application étudiante. Les contrôles anatomiques et l'accord graphique intégral ne sont pas certifiés ; garder le statut **relecture**, sans `owner_accepted`, sans fusion ni publication.

## Relecture graphique V6 — corrections ciblées (30/10/2026)

- **Anomalies relevées dans V5 :** flèches et repères coupés sur la **planche 02**, première légende « Bulbe olfactif » sans bulbe identifiable sur la **planche 05**, et pieds de page restés au statut « candidat V4 » sur les six premières pages.
- **Planche 02 corrigée** : suppression du dessin synthétique tronqué et insertion du schéma **officiel de la diapositive 12**, contenant directement les noms des cellules rétiniennes. Provenance indiquée sur la planche.
- **Planche 05 corrigée** : le bulbe olfactif, qui n'est pas visible dans la figure du support (diapo 36), est remplacé dans la liste des structures repérées par les **neurones olfactifs**, effectivement dessinés et légendés. Le bulbe demeure étudié dans les contenus écrits.
- **Toutes les planches** portent maintenant le pied de page « CANDIDAT V6 À RELIRE ». Comparaison des corps de page au rendu à 1× : **01, 03, 04, 06 et 07 inchangées**, **02 et 05 modifiées**.
- **Candidat privé V6** : `UE_B1_1_Organes_des_sens_7_planches_RELECTURE_V6.pdf` — **7 pages A4 paysage**, SHA-256 `5bee011ab3a129b55441d6ee323e965959ecd1a99d1128c89b67dfa1d13bff38`.
- Le **QCM V4 demeure inchangé**, SHA-256 `b3e6ed008bf0b4bec8f76406fa35544901450d1463afe3dfbd344dab40658aea` ; **contrat PDF V3 technique réexécuté** sur les octets de ce QCM : **PASS, 0 erreur, 24 pages**, sans équivalence avec l'accord graphique humain. Banque QCM V4 inchangée, SHA-256 `c7232ab3e74e75acd018503fb610c0b7b3582b04fd14bf2c656443de43d7dbd6`.
- La **fiche écrite privée de 14 pages** est inventoriée, mais aucun fichier final correspondant n'a été localisé dans les dossiers Drive inspectés pendant cette passe : la vérification du PDF de fiche reste donc **non exécutée**, et non un PASS.
- Les candidats V6 restent **hors GitHub public et hors application**. Les schémas synthétiques des autres pages et la revue médicale de toutes les sources nécessitent encore une validation. **Aucun accord `owner_accepted` ou GO de diffusion n'est enregistré.** Les anciennes planches V1–V5 sont remplacées par V6 pour la relecture.

## Fiche écrite retrouvée / reconstituée — décision de reprise (30/10/2026)

- Recherche de l'original historique **14 pages** : aucun fichier correspondant retrouvé dans le dossier du cours, dans les recherches Drive ciblées ni dans les fichiers de conversation identifiés. **Ne pas présenter la nouvelle fiche comme le même fichier**.
- **Nouvelle fiche écrite de relecture V1, 17 pages A4 portrait** : `UE_B1_1_Organes_des_sens_FICHE_ECRITE_RECONSTITUEE_RELECTURE_V1.pdf` ; SHA-256 **`4232cc1de0f9d39319183628a4f316070170913410de90634f0695ed14338a9a`**. Générée hors dépôt à partir des 56 diapositives officielles, de passages sélectionnés de la transcription et du lexique canonique à 59 définitions ; les 17 pages privilégient la lisibilité au maintien artificiel du quota historique.
- Le modèle **fiche Communication V5.3 de 19 pages** a été téléchargé depuis le Drive privé et ses octets SHA-256 **`223b163f243373c03d87b8e7b8ec8ffd60a06ab883c40dabfa7a7dbbfe4b30cf`** vérifiés contre la politique `docs/pdf-template-policy-v3.json`.
- **Contrat V3 technique exécuté sur le PDF fiche exact** : `tools/pdf-template-v3.py --role sheet --technical-only` → **PASS / zéro erreur / 17 pages**. Police Lato, marges et corps requis, bandes violettes, signets du sommaire, ordre Pièges QCM → Synthèse → Définitions ; **59/59 termes** retrouvés, **0 image**. Les 17 pages ont été rendues à 100 % et 200 % pour preuve privée.
- Les documents de contrôle et la matrice source→parties se trouvent dans le dossier privé de relecture. **Aucune revue exhaustive de l'oral, ni aucune acceptation graphique humaine** n'est revendiquée. La lecture d'extraits n'est pas la vérification des 113 minutes de la transcription.
- Le registre `docs/course-preparations.json` indique désormais **17 pages candidates**, conserve le décompte historique non localisé (14), et marque explicitement `revisionWrittenStatus=reconstructed_local_candidate_pending_review`. Il ne déclare **aucun statut validé** ni aucun nouveau PDF dans l'application étudiante.
- **Blocs maintenus** : revue scientifique intégrale, réception et comparaison visuelle du PDF exact par le propriétaire, pack privé final QCM V4 / planches V6, GO de publication distinct. La PR reste préparatoire, non fusionnée.

## Révision finale V7 — lot harmonisé et contrôle des priorités orales (30/10/2026)

- **Reconstruction de la fiche V2** : 17 pages, modèle PDF V3 technique **PASS / 0 erreur**, SHA-256 `f16adf8cbb1a9415446f38eadb849da137e9119ec1504912347b25c0f275563d`. Le PDF historique de 14 pages n'a toujours pas été retrouvé, il ne s'agit donc pas d'une récupération de cet original.
- **Correction pédagogique sourcée** : la diapositive **49** du support énumère **deux nerfs** (facial, glossopharyngien). Le nerf vague est **évoqué à l'oral vers 01:39:03**, avec l'indication expresse de l'enseignante de **ne pas mémoriser le détail de ces nerfs**. La formule V1 sur une « diapositive citant trois nerfs alors qu'elle annonce deux paires » était **inexacte et est désormais annulée**. Le QCM ne demande pas de mémoriser les noms. Le titre « Piège fréquent » au milieu de la fiche est également remplacé par un repère anatomique, conformément à la rubrique unique Pièges QCM située en fin de fiche.
- **QCM V5 sans mentions techniques** : 24 pages, SHA-256 `401e59115979cc98fa30c3b1403da4faae8a02efb6726bc7640688a72efca7a4`. Banque QCM/flashcards **inchangée** (50/50, 250 propositions), bandeau de pied de page pédagogique sans la mention « DOCUMENT PRIVÉ À RELIRE ». Test PDF V3 technique **PASS / zéro erreur** sur ces octets exacts.
- **Planches V7 sans mentions techniques** : 7 pages A4 paysage, SHA-256 `23946b279755a25f468e1e6fc7843888a453985e60940587850daefff9e9a928`. Les 7 corps de planches sont **pixel-identiques à V6 au rendu**, seuls les pieds de page ont été neutralisés. Les figures 02/05/06/07 conservent les rectifications précédemment documentées. La conformité anatomique humaine reste **à accepter**, aucune attestation automatique ne remplace cette étape.
- **Traçabilité privée** : correspondance **56 diapositives → sections de fiche**, index temporel de **676 prises de parole jusqu'à 01:53:35**, avec **14 occurrences automatiques** d'indications « à retenir / pas à mémoriser » ou équivalents. La vérification ciblée a retenu les nuances sur la rétine, les papilles et les nerfs gustatifs. Cet index **n'est pas une lecture médicale humaine exhaustive des 676 interventions** et ne clôt pas le blocage de revue orale.
- **Aucun marqueur interne** `CANDIDAT`, `PRIVÉ`, `À RELIRE`, `NON PUBLIÉ` n'apparaît dans les textes extraits des trois PDFs V7/V5/V2. Toutes les anciennes copies restent dans l'historique de relecture ; seul le lot candidat ci-dessus est proposé à l'acceptation.
- **Dossier privé hors GitHub** : `PR275_LOT_FINAL_A_RELIRE_V7.zip` avec trois PDF, banque canonique, matrice 56 diapositives, repères oraux, rapports PDF techniques, inventaire SHA et montages visuels. **Ne contient pas les 56 diapositives brutes ni la transcription intégrale.**
- **Décision** : `validated=false`, `studentPublication=false`, `approval=null`. Les validations pédagogiques et graphiques du propriétaire, les préflights de publication et la PR distincte de déploiement **restent bloquants**. Les scripts vocaux : 3 ; MP3 : 0.

## Suite avant activation

1. **Import effectué**. Vérifier la concordance sémantique des 50 clés et explications avec le PDF QCM et avec les sources, puis rapprocher les 59 définitions sans fuite dans les banques étudiantes.
2. Exécuter le contrôle `node tests/course-preparation-stage.mjs` (désormais déclenché dans la CI TNR de la PR) et les préflights privés de préparation ; vérifier les résultats avant toute fusion.
3. Corriger et contrôler les sept planches, vérifier toutes les pages des PDF de la fiche et des QCM face aux références figées.
4. Obtenir l'acceptation pédagogique et graphique du **lot exact** ; les MP3 restent explicitement absents.
5. Préparer une **PR de publication distincte** pour `course-registry`, `questions-*.json`, fiches, vocaux, vocabulaire et caches, puis TNR complets, CI, contrôles de déploiement.

**Statut de cette PR : préparatoire uniquement.** Aucun cours, QCM, PDF, carte, définition, vocal ou schéma nouveau n'est rendu visible dans l'application active. Ne pas fusionner cette PR tant que les contrôles de préparation ne sont pas terminés. Ne pas confondre instruction de mise à jour avec réception des validations du contenu et de la charte.
