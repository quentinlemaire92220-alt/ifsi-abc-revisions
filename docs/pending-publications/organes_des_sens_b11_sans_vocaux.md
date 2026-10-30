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
| Planches V7 | 7 | 3313939 | `23946b279755a25f468e1e6fc7843888a453985e60940587850daefff9e9a928` |

Chemins sous `assets/organes-des-sens-20261029/` :

- `UE_B1_1_Organes_des_sens_Fiche_Revision.pdf`
- `UE_B1_1_Organes_des_sens_QCM_50_Corriges.pdf`
- `UE_B1_1_Organes_des_sens_Planches_anatomiques.pdf`

Le ZIP d'origine a été récupéré depuis le chat de préparation. **Seules les planches V7 en ont été reprises** : les anciens PDF fiche/QCM du ZIP ne remplacent pas les présentations corrigées dans #276. Le PDF des planches est conservé sans modification, avec son empreinte exacte.

Les trois PDF passent le contrôle des octets (tailles et SHA-256). Les paginations ont été mesurées ; les sept pages de planches ont été rendues et inspectées. Le texte natif est présent sur chaque page ; le contrôle automatique de propreté des planches réussit.

**Réserve graphique maintenue :** la planche 7 présente une résolution effective d'environ 53 dpi, sous le seuil de 95 dpi. La revue anatomique complète, les droits des figures reprises et l'acceptation graphique du propriétaire restent en attente. L'import en brouillon ne lève aucune de ces réserves.

## Contrôles obligatoires

```sh
node tests/organes-sens-publication-candidate.mjs
node tests/organes-sens-publication-assets.mjs --prepublication
node tests/organes-sens-publication-assets.mjs --require-assets
node tests/organes-sens-publication-assets-test.mjs
```

Le mode `--require-assets` est désormais exécuté par le TNR et exige les trois fichiers exacts. Les deux modes du garde-fou imposent les verrous de prépublication à `false` et `ownerAcceptance=pending`. Les 15 défauts injectés sont contrôlés sur copies temporaires, dont un transfert partiel simulé, les approbations inventées et les tailles/SHA divergents.

Le manifeste de candidature porte `complete_3_of_3_in_github_not_published` et ne conserve plus le blocage d'absence des binaires. Les blocages scientifique, graphique, de dépendance #275 et de GO de publication restent présents.

Les contrôles V3 directs sur fiche/QCM, la comparaison exacte avec la banque #275 et les préflights restent distincts de la revue humaine. Le paquet privé `PR276_REVUE_COMPLETE_3_PDF.zip` rassemble les trois candidats courants et les preuves techniques, sans audio ni source brute.

## Corrections déjà conservées

La mention de fabrication du lexique a été retirée en page 16 de la fiche. Le titre du thème Goût a été déplacé de la page 8 à la page 9 du QCM, avec les premiers blocs du thème, sans réduction de police. Les 38 autres pages restent identiques au rendu ; le texte pédagogique, les réponses et les 59 définitions sont conservés.

Version préparée : `8.30.155`, build `8455`. Métadonnées, index, version affichée et cache/SW sont synchronisés. Cette préparation ne rend pas le cours actif.

## Étapes restantes

1. Lever les réserves graphiques et scientifiques, vérifier les droits de réutilisation des figures et obtenir l'acceptation explicite du propriétaire sur les octets finaux.
2. Achever la comparaison de toutes les pages fiche/QCM aux modèles Communication à 100 % et 200 %. Aucun accord humain n'est déduit d'un PASS technique.
3. Après autorisation du lot, rapprocher #275 et préparer l'intégration canonique sans doublon, puis les catalogues étudiants dans un changement cohérent.
4. Exécuter les préflights, le TNR complet et l'audit P2 du commit final ; obtenir un GO distinct de fusion et déploiement avant toute diffusion.

`studentActivation=false`, `appRegistryChanges=false`, `publishedFilesInThisPr=false`, `ownerGraphicAcceptance=false`, `pedagogicalAcceptance=false`, `publicationApproval=false` et `mergeAuthorized=false` restent obligatoires.

## Retrait de la reconstruction graphique

La reconstruction de la page 7 introduite au commit `a286cc6` est retirée après le retour sur sa dégradation visuelle. Le PDF V7 issu du support est rétabli à l'identique ; les six premières pages et les PDF fiche/QCM corrigés restent conservés. Aucune nouvelle génération n'est lancée. Le contrôle technique d'anatomie ajouté reste actif : il doit signaler la résolution de 53 dpi de la planche 7 et bloquer sa validation finale. La limite reste ouverte, aucune conformité graphique ou scientifique n'est déclarée.

## Correction page 7 V8 — résolution et légendes accessibles (30/10/2026)

Cette section **remplace la réserve technique de 53,1 dpi** mentionnée plus haut et le précédent essai de reconstruction dégradé. La figure originale issue de la diapositive 52 a été **conservée sans redessin**, affichée à une taille correspondant à **96,8 dpi effectifs**, avec ses **16 légendes disponibles en texte PDF natif**, lisible et sélectionnable à droite. Ce choix ne prétend pas recréer des détails absents du fichier source de 550 × 259 pixels.

- PDF final de relecture V8 : `assets/organes-des-sens-20261029/UE_B1_1_Organes_des_sens_Planches_anatomiques.pdf` ; **7 pages A4 paysage**, **3 075 632 octets** ; SHA-256 `772f4b173df5e864f8d16bc1a0d63bbdc99da59d3857095efa46580e0d485d29`.
- Les six premières pages de V8 ont été comparées au PDF V7 : **rendu pixel identique à 150 %**. Seule la planche 7 a été recomposée (positionnement de l'image et transcription des légendes).
- Résolution effective minimum des sept pages : **96,82 dpi**, seuil du test CI : **95 dpi**. Présence vérifiée de **16/16 légendes** via extraction textuelle native de la page 7.
- L'image source est un bitmap de résolution limitée : conformité **technique** ne signifie pas amélioration optique réelle des détails, ni approbation anatomique.
- Le SHA est modifié ; tout GO ultérieur doit porter **sur ces nouveaux octets**, et non sur la V7. La fiche et le QCM restent inchangés à ce commit.
- Le garde-fou `tests/organes-sens-anatomy-quality-test.py` doit passer sur GitHub après cette mise à jour. **Publication, fusion, validation pédagogique et acceptation graphique humaine restent bloquées** : les indicateurs `ownerGraphicAcceptance`, `pedagogicalAcceptance`, `publicationApproval`, `mergeAuthorized` et `studentActivation` restent à `false`.

