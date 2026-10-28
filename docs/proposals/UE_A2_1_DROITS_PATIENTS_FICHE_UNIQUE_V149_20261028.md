# UE A2.1 S1 — Droits des patients : passage à une fiche unique (v1.49)

**État : PR de préparation — fusion et déploiement bloqués.** Cette note est un plan technique public, **pas** une attestation de conformité ou un accord de publication. Les matrices, transcriptions, horodatages et preuves QA restent strictement privés.

## État actuel observé sur `main` le 28/10/2026

Le cours `droits_patients` est déjà actif. Son manifeste `docs/course-deliveries.json` référence :

- `sheetResourceId: droits_patients_fiche_p01` — fiche classique existante ;
- `infographicSheetResourceId: droits_patients_fiche_infographiee_p01` — ancien cours illustré ;
- `partDeliveries[p01].sheetResourceId: droits_patients_fiche_complement_p01_20261021` — complément du 21 octobre ;
- support officiel, 105 QCM déclarés, 93 flashcards déclarées, vocabulaire, ressources d'illustration, sept vocaux et leurs archives, qui ne font **pas** partie de la migration demandée.

Les trois fiches et leurs identifiants actuels sont préservés tant que le nouveau PDF et sa liaison effective ne sont pas conformes et validés. Les comptes constatés ci-dessus proviennent du manifeste actuel ; ils ne constituent pas une nouvelle validation des banques.

## Candidat source, non public

Une première fiche **écrite unique** a été produite en privé selon la charte v1.49 : **40 pages**, texte sélectionnable, synthèse générale précédant le lexique (ancien candidat, conservé).\n\n**Revue privée V2 — 28/10/2026 :** correction d’une non-régression concrète du lexique. La fiche historique contenait **34 nuances et distinctions** liées à ses **34 entrées**, qui n’étaient pas toutes reprises. Elles sont désormais intégrées sous les termes correspondants, au sein d’un lexique de **57 entrées distinctes**. PDF candidat V2 : **42 pages**, SHA-256 exact vérifié sur le fichier local `3701476645214fbcc3852365c75327fcdf1bf9c44164418e530e1275a1d49589`. Vérifications automatisées sur **42 pages** : format A4, bandeaux violets détectés par pixels, corps ≥ 9 pt et pagination `n / 42`, **0 défaut constaté**. Ces contrôles ne remplacent pas la comparaison humaine des pages à 100 et 200 %, ni la validation pédagogique. Un inventaire privé des titres a ensuite localisé **50/50 rubriques** des deux fiches historiques dans ce candidat : résultat **structurel uniquement**, qui ne valide ni l'intégralité des raisonnements ni la couverture orale. Les quatre parties PLAUD sont présentes et inventoriées ; leur rapprochement sémantique intégral demeure ouvert. L’ancien candidat et les trois publications historiques sont préservés.

**Important :** le PDF V2 n'est **ni stocké dans GitHub, ni publié dans Drive/app, ni approuvé**. Les trois fiches historiques sont encore la référence opérationnelle. Une fiche de 40 pages n'est pas validée par son seul format : la couverture et les précisions des anciennes fiches et des sources doivent être comparées sémantiquement.

## Contrôles bloquants encore ouverts

1. Terminer en **privé** la matrice de couverture et d'héritage : version classique (46 p.), version illustrée (43 p.), complément (22 p.), lexique historique et les deux supports officiels/diaporamas avec les **quatre** transcriptions PLAUD de la séance complémentaire. Documenter chaque notion conservée, enrichie, corrigée, fusionnée ou insuffisante. Contrôler profondeur, exemples, conditions et exceptions.
2. Traiter les réserves juridiques non résolues de manière sourcée et autorisée, notamment les régimes de fin de vie et les nuances légales, sans présenter un point incertain comme acquis.
3. Contrôler les octets réels du PDF final selon `docs/PDF_TEMPLATE_CONTRACT_V3.md`, `docs/pdf-template-policy-v3.json` et les deux PDF modèles Communication (empreintes, pagination, Lato, bandes violettes, marges, sections et textes). **Inspection intégrale des pages à 100 % et 200 %**. Après toute correction, recommencer les contrôles et recalculer le SHA.
4. Recueillir la validation pédagogique et la revue graphique du **PDF final exact**, puis consigner les reçus réels `pedagogicalNonRegression` et `templateConformance` sans inventer une acceptation.
5. Obtenir et vérifier l'hébergement final autorisé de la fiche (identifiant et URL effectivement accessibles) avant d'écrire ses références d'application. Ne jamais inventer un lien Drive.

## Migration applicative, après levée des blocages

- Enregistrer **une seule** ressource fiche v1.49 pour `droits_patients`, avec le nouveau `resourceId` stable et le lien réel du PDF, et un unique emplacement dans la navigation.
- Supprimer uniquement l'**affichage actif en doublon** des trois anciennes fiches ; **ne pas supprimer leurs fichiers, leurs IDs d'archive, leurs historiques ni leurs autorisations d'anciens lots**.
- Adapter le manifeste `docs/course-deliveries.json` et le registre/rendu concernés au contrat de fiche écrite V5.3, sans convertir rétroactivement tous les cours historiques. Garantir l'unicité de la fiche active.
- Laisser inchangés les banques de QCM, corrigés, flashcards, vocabulaire, vocaux, statistiques et scores.
- Exécuter `tools/pedagogical-non-regression-v149.mjs`, `tools/pdf-template-v3.py`, le préflight de préparation/publication, les TNR complets et la CI, puis tester la ressource servie sur mobile et ordinateur.
- Ne fusionner la PR et ne déployer qu'après contrôles verts, preuves authentiques et autorisations correspondant exactement au lot final.

## État de cette branche

Le périmètre ci-dessus est documenté, et la correction lexicale V2 existe en privé ; **aucune suppression, aucun remplacement public, aucun PDF nouveau dans le dépôt et aucune mutation des ressources actives** n'ont été effectués ici. Le cours reste accessible dans sa version précédente sur `main`. La PR doit rester **brouillon / bloquée** tant que les conditions ne sont pas réalisées.


## GO de publication et fusion — 28 octobre 2026 (consigné sans exécution)

Le propriétaire a répondu **« Allez go »** après son acceptation antérieure **« Je VALIDE »** du PDF V2 (**42 pages**, SHA-256 `3701476645214fbcc3852365c75327fcdf1bf9c44164418e530e1275a1d49589`). Cette réponse constitue une instruction explicite de **poursuivre la publication et la fusion après contrôles**, et ne doit pas être transformée en attestation de contrôles non réalisés. **Ne pas redemander inutilement cette autorisation pour les mêmes octets.**

### Contrôles complémentaires menés

- **Vérification législative, distincte du support de cours :** les lois n° 2026-794 du 18 août 2026 (Légifrance `https://www.legifrance.gouv.fr/jorf/id/JORFARTI000054706884`) et n° 2026-404 du 26 mai 2026 (`https://www.legifrance.gouv.fr/loda/id/JORFTEXT000054131776`) existent. Le socle des cinq conditions de la première correspond au texte légal. Les modalités opérationnelles et les textes d'application n'ont **pas** été déclarés exhaustivement contrôlés. Aucune nouvelle information externe n'a été ajoutée au PDF accepté.
- **Intégrité PDF :** SHA-256 recomputé sur les octets V2, **42 pages** ; aucun span extrait ne dépasse la géométrie A4, mais cela ne remplace pas une inspection visuelle intégrale.
- **Différence graphique constatable vis-à-vis du modèle V3 Communication (19p) :** la page d'ouverture V2 laisse une grande zone blanche au lieu du tableau d'objectifs / double lecture et de la synthèse pratique du modèle ; le sommaire V2 prend trois pages au lieu de la synthèse rapide du modèle. Le **contrôle MODEL_COMPARISON n'est pas PASS** et ne doit pas être décrit comme tel. Un reformatage modifierait l'empreinte du PDF déjà accepté, et requerrait une réacceptation des nouveaux octets.
- **Contrôle de non-régression :** 50/50 intitulés de sections localisés et 34 nuances de lexique réintégrées, mais comparaison sémantique exhaustive de tous les raisonnements et quatre transcriptions toujours en attente. Ne pas en déduire `pedagogicalNonRegression.decision=full_review_recorded`.
- **Hébergement :** aucune URL Drive vérifiée pour la V2. Ne pas faire pointer `sheets-3.json` ni `docs/course-deliveries.json` vers une URL fabriquée, et ne pas archiver les ressources historiques tant que la nouvelle n'est pas en ligne.

**État exécutable :** PR en brouillon, migration active non appliquée. **GO reçu, blocages QA/PDF/hébergement non levés, fusion `main` différée** ; conserver strictement les ressources historiques et les banques interactives.


## Progression privée du 28 octobre 2026 — transfert Drive vérifié

- Le PDF V2 accepté a été **réellement transféré sur le Drive propriétaire Primary dans le dossier privé existant de validation**. Retour de lecture Drive : PDF, **608 750 octets**, propriétaire seul, `shared=false`. **Ce n'est pas le lien de publication étudiant** : ne pas recopier d'URL privée dans un manifeste public.
- Une **matrice d'indexation privée** a été produite et également déposée dans ce même dossier de validation. Périmètre : **251 pages PDF** réparties entre 2 supports officiels (85 et 55 pages) et 3 fiches historiques (46, 43, 22 pages), **57 segments de 3 minutes** issus de 4 transcriptions PLAUD, **24 vérifications ciblées** de notions dont deux priorités oralement soulignées. Les segments ont été associés à des pages de la nouvelle fiche par recherche lexicale ; **l'indexation ne constitue pas la validation de leur fidélité sémantique**. La matrice reste privée et absente du dépôt.
- Une nuance précise du support James (p. 6), « honoraires fixés avec tact et mesure », n'apparaît pas littéralement dans le candidat actuel : **à statuer en revue**, sans changement silencieux des octets validés.
- L'hébergement privé et le GO du propriétaire sont maintenant acquis. Restent bloquants : **validation sémantique intégrale**, **conformité visuelle par rapport au modèle V3**, **lien étudiant public fonctionnel**, **CI/TNR**. Conserver `main` et les trois fiches historiques inchangés.


## Fiche V3 de reprise graphique — 28/10/2026 (privée, NON validée)

Le GO du propriétaire et son acceptation du **PDF V2 de 42 pages** restent conservés **sans altération des anciens octets**.

Une version **V3 de travail** vient d'être produite pour lever deux écarts concrets :
- Remplacement de l'ouverture trop vide et des **3 pages de sommaire** par une **page d'ouverture** inspirée du modèle Communication (priorités, lecture à deux niveaux, méthode en 5 étapes, sommaire rapide avec 11 liens internes). Total **39 pages**.
- Rétablissement sur la **page 2** de la nuance exacte du support officiel de Timothy James, p. 6 : en libéral, honoraires « avec tact et mesure ».
- Préservation textuelle vérifiée **V2 p. 6–42 = V3 p. 3–39**, hors numéros et pieds de page ; **aucun écart de texte du corps** dans ces 37 pages. Le lexique conserve les 57 termes et les nuances historiques.
- PDF V3 hébergé et **relu depuis le Drive privé propriétaire** (non partagé). Contrôle du fichier relu : **39 pages**, **1 355 013 octets**, SHA-256 **`7a9d7ccce76ed000394d600a3eac040d2e5e4f1b9aebc44a614c36f4e4120b5f`**. Les octets relus depuis Drive constituent l'identité exacte à soumettre à une éventuelle nouvelle validation, pas ceux du rapport de génération local antérieur.
- Contrôles privés sur les 39 pages : pagination, présence pixel de bandeau violet, absence de mots hors page, **57/57 termes**, nuances historiques et **11/11 zones cliquables** ; aucun écart technique automatique dans le fichier Drive relu. Les rapports de contrôle restent privés sur Drive.

**Bloquants encore réels :** revue visuelle humaine détaillée de chaque page à 100 % et 200 % non certifiée ; rapprochement sémantique exhaustif des quatre transcriptions et cinq PDF sources non terminé ; **V3 non approuvée par le propriétaire** (les GO V2 ne valent pas GO sur nouveaux octets) ; lien étudiant public et tests d'intégration non validés. Aucune modification de `main`, des ressources étudiantes ou des archives. **Ne pas marquer `owner_accepted` sur cette V3.**

## Validation explicite de la V3 — 28 octobre 2026

Le propriétaire a confirmé **« Oui »** en réponse à la question explicite :
« Tu confirmes que tu valides la fiche V3 de 39 pages *Droits des patients* pour remplacer la V2 et poursuivre son intégration dans l'application IFSI ABC ? »

- **Document accepté :** fiche unique écrite V3, 39 pages, 57 entrées lexicales, 11 liens de sommaire, nuance des honoraires réintégrée.
- **SHA-256 du PDF V3 effectivement relu depuis Google Drive Primary :** `7a9d7ccce76ed000394d600a3eac040d2e5e4f1b9aebc44a614c36f4e4120b5f`.
- **Document Drive validé (privé, non partagé) :** identifiant `1CDJjyRYEluD0GQ8WU9rcpudVk3A1Q6X5`; 1 355 013 octets, 39 pages. Identité vérifiée par téléchargement authentifié + calcul SHA-256, pas seulement par nom ou taille.
- **Périmètre :** accord du propriétaire sur la **V3 exacte**, remplaçant la V2 pour le lot futur. Le GO de publication/fusion du cours était déjà exprimé ; aucun nouvel accord sur le même fichier n'est nécessaire.
- **Limite :** l'accord sur le PDF ne transforme pas les contrôles non réalisés en PASS. Indexation lexicale ≠ revue sémantique exhaustive. L'hébergement privé ne fournit pas un lien étudiant accessible. La CI sur les seuls documents et tests de cette PR ne vaut pas validation d'une migration de `sheets-3.json`.

**Statut : V3 `owner_accepted` au sens de l'autorisation humaine sur le fichier exact ; migration bloquée jusqu'à revue pédagogique et graphique intégrale et publication étudiant vérifiée.** Préserver les trois versions historiques, les 105 QCM, les 93 flashcards et les 7 vocaux.

## Contrôle technique V3 après validation du propriétaire

Lecture sur les **octets exacts hébergés sur Drive privé** : SHA-256 `7a9d7ccce76ed000394d600a3eac040d2e5e4f1b9aebc44a614c36f4e4120b5f`.

- Toutes les **39 pages** analysées : pagination 39/39, bandeaux violets 39/39, aucun segment de texte hors format A4 détecté, **11 zones de navigation** présentes.
- Quatre planches de contact réalisées (39 pages). Une revue à 100 % et 200 % de **toutes** les pages n'est **pas** attestée. Libellés secondaires < 9 pt repérés en page de garde et dans l'en-tête du lexique (p. 33 à 39) ; ces libellés font partie de la revue typographique à qualifier, ne pas proclamer un PASS inconditionnel.
- Rapport de contrôle par page enregistré **uniquement sur Drive privé** propriétaire, sans preuve ni URL privée dans la PR.
- Deux workflows de la PR sur le commit précédent étaient `success` : `TNR IFSI ABC` et `Audit qualité P2`. Ils ne contrôlaient **pas** le futur changement de manifeste ni le PDF publié.
- **Prochaines barrières** : non-régression pédagogique sémantique exhaustive ; qualification de la taille des libellés et revue visuelle complète ; publication dans un dossier **partagé aux étudiants** avec lecture retour exacte ; migration JSON, CI/TNR et vérification réelle du PDF depuis l'application.

Aucune activation des fiches uniques dans `main` à ce stade. La validation du propriétaire est acquise et **n'est pas à redemander pour ce même SHA**.
