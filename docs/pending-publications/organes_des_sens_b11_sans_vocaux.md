# UE B1.1 — Les organes des sens : préparation de publication sans vocaux

**État : prépublication, brouillon uniquement.** Ce dossier ne constitue **ni un GO de publication**, ni une acceptation pédagogique/graphique. Il prépare une livraison par PR distincte, sans produire ni diffuser de MP3.

## Dépendance et source de vérité

- Source canonique : PR #275, branche `prep/b11-organes-sens-20261030`, commit observé `332f0c0fc7c3c69dfaa0a0be5e3a8945ac553640`.
- Inventaire : 50 QCM (250 propositions, 1–3 bonnes réponses annoncées par question), 50 flashcards, 59 définitions, 7 planches, fiche écrite de 17 pages.
- Cette branche de prépublication **ne copie pas les banques** tant que #275 n'a pas été intégrée/rebasée : règle de source unique.
- Source officielle et transcription : **conservées hors dépôt**. Ne pas les ajouter au dépôt, dans une issue, ni dans la description des PR.

## Fichiers candidats (import partiel 2/3, non servis par l'application)

| Ressource | Pages | SHA-256 exact |
| --- | ---: | --- |
| Fiche écrite — présentation corrigée | 17 | `d1e18e9d272d5cfaa4314c606744f1d4ac9d080083386275db03f0f087329c8d` |
| QCM — présentation corrigée | 24 | `58dfcd2d90c6c9e41a0a544a69a7059c8dc0e8f93c79abb04297c3ddd906042e` |
| Planches V7 | 7 | `23946b279755a25f468e1e6fc7843888a453985e60940587850daefff9e9a928` |

La fiche et le QCM sont présents dans la branche depuis le commit `88c3300444768d4486e2bedcd70ff9e5fd3a295b` ; les planches restent absentes. Les deux PDF présents ont été recontrôlés depuis le checkout : tailles, SHA-256 et paginations conformes ; contrôle technique V3 et absence de marqueurs de génération réussis. Aucun de ces résultats ne constitue une acceptation scientifique ou graphique humaine.

## Périmètre autorisé à préparer

Fiche écrite, PDF QCM, banque interactive de 50 QCM, 50 flashcards, 59 définitions, 7 planches anatomiques. **Sans vocaux** : 0 MP3, pas de liens audio ni de ressources « vocal » fictives ; trois scripts restent en préparation privée.

Le « oui » du 30/10/2026 autorise la **préparation** de ce périmètre sans attendre les MP3 ; il **ne valide pas** l'exactitude médicale, le graphisme final, ni une publication immédiatement accessible aux étudiants.

## Passage en publication — étapes bloquantes

1. Achever la revue scientifique du support de 56 diapositives et de la transcription (environ 113 minutes), puis des 50 QCM, 50 cartes, 59 termes et 7 schémas. Consigner les réserves et leur levée sans inventer d'avis expert.
2. Comparer la fiche et le QCM **page par page à 100 % et 200 %** aux modèles figés Communication, puis inspecter chaque planche anatomique. Obtenir une acceptation explicite du propriétaire sur **le lot exact, identifié par SHA-256**.
3. Rapprocher la branche publication avec la PR #275, garder une source canonique ; ajouter les fichiers PDF binaires et comparer leurs empreintes avant toute déclaration dans le manifeste public.
4. Construire les références des ressources de la fiche/QCM/planches et les banques étudiant en respectant les schémas de l'app ; aucune entrée dans `course-registry-v741.json`, `questions-*.json`, `sheets-*.json`, `vocabulaire-v1.json` ou `docs/course-deliveries.json` avant la levée des validations.
5. Transférer le cours hors du registre `preparation` **dans le même changement atomique que l'activation**, faute de quoi `tests/course-preparation-stage.mjs` bloque volontairement toute fuite vers les catalogues étudiants. Ne jamais contourner ce contrôle.
6. Rejouer les préflights préparation/publication, le contrat PDF V3 sur les octets du dépôt, les TNR et l'audit P2 ; seulement après GO explicite de fusion/déploiement, vérifier les URL et octets servis sur GitHub Pages.

## Sécurité actuelle

Le manifeste `docs/publication-candidates/organes_des_sens_b11_sans_vocaux.json` garde `studentActivation=false`, `ownerGraphicAcceptance=false`, `publicationApproval=false` et `mergeAuthorized=false`. Le test `tests/organes-sens-publication-candidate.mjs` vérifie que le cours n'a pas été activé par accident. Il n'est **pas** un certificat de conformité des supports.

**Livraison possible sans MP3, mais pas sans validations et accord de publication.**

## Import binaire prêt pour GitHub / Work — preuve avant activation

Le chat de préparation référence un paquet `PR276_ORGANES_SENS_ASSETS_A_IMPORTER_SANS_VOCAUX.zip` de **3 PDF**, sans enregistrement ni source brute, avec manifeste et empreintes. Ce ZIP et le PDF V7 des planches ne sont pas disponibles dans l'espace de reprise. Le paquet **n'est pas un fichier du dépôt GitHub**, et sa mention dans l'historique ne fournit ni ses octets ni une preuve de transfert. Aucune ancienne version n'est substituée au candidat exact.

| Rôle | Chemin exact à importer dans la PR #276 | Pages | SHA-256 |
|---|---|---:|---|
| Fiche | `assets/organes-des-sens-20261029/UE_B1_1_Organes_des_sens_Fiche_Revision.pdf` | 17 | `d1e18e9d272d5cfaa4314c606744f1d4ac9d080083386275db03f0f087329c8d` |
| QCM | `assets/organes-des-sens-20261029/UE_B1_1_Organes_des_sens_QCM_50_Corriges.pdf` | 24 | `58dfcd2d90c6c9e41a0a544a69a7059c8dc0e8f93c79abb04297c3ddd906042e` |
| Planches | `assets/organes-des-sens-20261029/UE_B1_1_Organes_des_sens_Planches_anatomiques.pdf` | 7 | `23946b279755a25f468e1e6fc7843888a453985e60940587850daefff9e9a928` |

**État réel du transfert :** la fiche (110387 octets) et le QCM (108383 octets) sont présents avec les SHA-256 ci-dessus. Les planches ne sont **pas encore importées** : 3313939 octets attendus ; l'historique rapporte un échec de transport, mais le candidat V7 manque dans l'espace de reprise. Le manifeste distingue `gitBinaryUploaded=true` pour fiche/QCM et `false` pour planches. Ne modifier ce dernier indicateur qu'après constat du vrai fichier et de son empreinte.

Le contrôle `node tests/organes-sens-publication-assets.mjs --prepublication` accepte un import **partiel uniquement en brouillon**, en vérifiant SHA et statut de chaque fichier présent ; aucune activation étudiant n'est autorisée. Une divergence SHA-256 ou un statut de transfert inventé reste bloquant. Une fois les 3 fichiers importés, exécuter `node tests/organes-sens-publication-assets.mjs --require-assets` : ce mode exige les trois PDF présents et conformes. **Ni l'un ni l'autre ne crée un GO pédagogique ou graphique.**

Le transfert des binaires **n'est pas terminé dans le dépôt** ; ne pas introduire de liens étudiants et ne pas changer `studentActivation=false` avant les autres autorisations. Le passage final en catalogue ne doit se faire que dans un changement contrôlé, en rapprochant la source PR #275 et en conservant les garde-fous de publication.

## Reprise technique — contrôles et limites

Les deux modes du contrôle binaire exigent désormais aussi les verrous `studentActivation`, `appRegistryChanges`, `publishedFilesInThisPr`, `mergeAuthorized`, `ownerGraphicAcceptance`, `pedagogicalAcceptance` et `publicationApproval` à `false`, avec `ownerAcceptance=pending` pour chaque PDF. Aucun PASS de ces commandes ne donne un GO.

Le test `node tests/organes-sens-publication-assets-test.mjs`, inclus dans le TNR, utilise des copies temporaires : import partiel exact accepté ; 15 défauts injectés bloqués, dont activation ou approbation inventée, statut de transfert faux, taille/SHA divergents et en-tête PDF absent. `--require-assets` doit toujours échouer avec les planches absentes.

La reprise prépare la version `8.30.155`, build `8455` : métadonnées, version affichée, index, cache/SW et références synchronisés. Le contrôle `tests/release-assets-current.mjs` reste intact et réussit en contrôle ciblé. Cette préparation de version ne déclenche ni activation du cours ni diffusion ; les préflights et le TNR complet sont relancés sur les nouvelles entrées.

Les PDF candidats ne figurent pas dans les catalogues actifs : un préflight global ne suffit donc pas à certifier leur contenu. Les contrôles V3 directs sur fiche/QCM restent distincts ; la revue complète comparée au modèle à 100 % et 200 %, la revue scientifique et l'acceptation du propriétaire restent en attente. Les rendus et diagnostics détaillés sont conservés en privé.


## Corrections de présentation autorisées

La mention de fabrication du lexique a été retirée en page 16 de la fiche. Le titre du thème Goût est déplacé de la page 8 vers la page 9 du QCM, avec le premier bloc de questions ; les questions Q40 à Q44 sont décalées sans réduction de police. Seules ces trois pages diffèrent au rendu ; les 38 autres pages sont identiques pixel par pixel. Les textes pédagogiques, réponses et 59 définitions sont conservés. Les nouvelles empreintes ci-dessus remplacent celles des candidats précédents ; `ownerAcceptance=pending` reste applicable aux nouveaux octets. Le paquet privé corrigé `PR276_REVUE_CORRIGEE_2_PDF.zip` contient les deux PDF présents ; les planches restent absentes.
