# UE B1.1 — Les organes des sens : prépublication sans vocaux

**État : PR #276 en brouillon, import binaire complet 3/3, aucune activation étudiant.** La vérification des fichiers ne constitue ni une acceptation scientifique/graphique, ni un GO de fusion ou de publication.

## Source canonique et périmètre

- PR #275 : branche `prep/b11-organes-sens-20261030`, commit `332f0c0fc7c3c69dfaa0a0be5e3a8945ac553640`, toujours ouverte en brouillon et non fusionnée.
- Banque et lexique canoniques sur #275 : `data/course-preparations/organes_des_sens_b11.json` et `data/course-preparations/organes_des_sens_b11_lexique.json`.
- Lot prévu : fiche de 17 pages, 50 QCM / 250 propositions, 50 flashcards, 59 définitions et 7 planches anatomiques.
- Aucun MP3 ni lien audio. #276 ne recopie ni n'active les banques de #275.
- Sources officielles, transcription, rendus et preuves détaillées restent hors du dépôt public.

## Fichiers présents dans la branche

| Rôle | Pages | Octets | SHA-256 exact |
| --- | ---: | ---: | --- |
| Fiche — présentation corrigée | 17 | 110387 | `d1e18e9d272d5cfaa4314c606744f1d4ac9d080083386275db03f0f087329c8d` |
| QCM — présentation corrigée | 24 | 108383 | `58dfcd2d90c6c9e41a0a544a69a7059c8dc0e8f93c79abb04297c3ddd906042e` |
| Planches V8 — peau nette | 7 | 6748766 | `c287e07ff7e0f039e2ee6993f62cc297afef70a6dea839980ee64e6fd2b3e952` |

Chemins sous `assets/organes-des-sens-20261029/` :

- `UE_B1_1_Organes_des_sens_Fiche_Revision.pdf`
- `UE_B1_1_Organes_des_sens_QCM_50_Corriges.pdf`
- `UE_B1_1_Organes_des_sens_Planches_anatomiques.pdf`

Le ZIP d'origine a été récupéré depuis le chat de préparation. **Seules les planches V7 en ont été reprises** : les anciens PDF fiche/QCM du ZIP ne remplacent pas les présentations corrigées dans #276. La V7 d'origine est conservée en privé. La V8 courante ne remplace que la page 7 ; les six premières pages sont identiques pixel par pixel.

Les trois PDF passent le contrôle des octets (tailles et SHA-256). Les paginations ont été mesurées ; les sept pages de planches ont été rendues et inspectées. Le texte natif est présent sur chaque page ; le contrôle automatique de propreté des planches réussit.

**Définition de la planche 7 corrigée :** nouvelle illustration originale de 1536 × 1024 pixels, environ 240 dpi effectifs, avec 16 repères/légendes natifs séparés. Les structures du schéma source ont été reprises pour cette reconstruction ; aucune simple augmentation artificielle de résolution. Les légendes et leurs positions sont conservées dans un dossier privé éditable. La revue anatomique et l'acceptation graphique du propriétaire restent en attente ; la correction technique ne les remplace pas. Les droits des figures reprises dans les autres pages restent à examiner.

## Contrôles obligatoires

```sh
node tests/organes-sens-publication-candidate.mjs
node tests/organes-sens-publication-assets.mjs --prepublication
node tests/organes-sens-publication-assets.mjs --require-assets
node tests/organes-sens-publication-assets-test.mjs
python tests/organes-sens-anatomy-quality-test.py
```

Le mode `--require-assets` est désormais exécuté par le TNR et exige les trois fichiers exacts. Les deux modes du garde-fou imposent les verrous de prépublication à `false` et `ownerAcceptance=pending`. Les 15 défauts injectés sont contrôlés sur copies temporaires, dont un transfert partiel simulé, les approbations inventées et les tailles/SHA divergents.

Le manifeste de candidature porte `complete_3_of_3_in_github_not_published` et ne conserve plus le blocage d'absence des binaires. Les blocages scientifique, graphique, de dépendance #275 et de GO de publication restent présents.

Les contrôles V3 directs sur fiche/QCM, la comparaison exacte avec la banque #275 et les préflights restent distincts de la revue humaine. Le paquet privé `PR276_REVUE_COMPLETE_3_PDF_PEAU_HD.zip` rassemble les trois candidats courants et les preuves techniques, sans audio ni source brute.

Le contrôle anatomie mesure désormais la résolution effective des images de chaque page et la présence des 16 légendes natives de la page 7. Il ne certifie pas les structures ou les pointes de flèches médicalement.

## Corrections déjà conservées

La mention de fabrication du lexique a été retirée en page 16 de la fiche. Le titre du thème Goût a été déplacé de la page 8 à la page 9 du QCM, avec les premiers blocs du thème, sans réduction de police. Les 38 autres pages restent identiques au rendu ; le texte pédagogique, les réponses et les 59 définitions sont conservés.

Version préparée : `8.30.155`, build `8455`. Métadonnées, index, version affichée et cache/SW sont synchronisés. Cette préparation ne rend pas le cours actif.

## Étapes restantes

1. Lever les réserves graphiques et scientifiques, vérifier les droits de réutilisation des figures et obtenir l'acceptation explicite du propriétaire sur les octets finaux.
2. Achever la comparaison de toutes les pages fiche/QCM aux modèles Communication à 100 % et 200 %. Aucun accord humain n'est déduit d'un PASS technique.
3. Après autorisation du lot, rapprocher #275 et préparer l'intégration canonique sans doublon, puis les catalogues étudiants dans un changement cohérent.
4. Exécuter les préflights, le TNR complet et l'audit P2 du commit final ; obtenir un GO distinct de fusion et déploiement avant toute diffusion.

`studentActivation=false`, `appRegistryChanges=false`, `publishedFilesInThisPr=false`, `ownerGraphicAcceptance=false`, `pedagogicalAcceptance=false`, `publicationApproval=false` et `mergeAuthorized=false` restent obligatoires.
