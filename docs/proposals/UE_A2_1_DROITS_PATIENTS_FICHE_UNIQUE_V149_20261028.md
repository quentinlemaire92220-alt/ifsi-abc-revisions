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

## Contrôle bloquant identifié lors du GO de mise à jour de l'application

**Décision de publication : BLOQUÉE par la charte v1.49 / contrat PDF V3.** La V3 reste **explicitement acceptée par le propriétaire** (mêmes octets, SHA-256 `7a9d7ccce76ed000394d600a3eac040d2e5e4f1b9aebc44a614c36f4e4120b5f`). Cette acceptation ne vaut pas validation de l'instruction de diffusion en présence de défauts de trame démontrés.

La relecture du **PDF Drive exact** rendu à taille lisible révèle des défauts précis que les contrôles A4, bandeaux et débordements n'avaient pas détectés :

| Page | Défaut observé | Remédiation à contrôler |
| --- | --- | --- |
| 18 | Comparaison CRUA/RU/CDU aplatie en paragraphes ; référence légale orpheline « (dignité), L1111-2… » | Restaurer un vrai tableau avec correspondance des colonnes et rattacher la citation à sa phrase |
| 20 | Diagramme consentement/refus transformé en lignes indépendantes ; fragment orphelin « outil de traduction… » | Rétablir le sens des branches et un encadré lisible |
| 21 | Tableau « Moment du soin / Actions » aplati ; fragment juridique « pas à qualifier automatiquement une complicité pénale » hors contexte | Reconstituer la mise en parallèle et rattacher ou corriger le fragment |
| 24 | Séquence numérotée hors ordre de lecture **1–2–4–3** ; paragraphe commençant « ; aucune indemnisation… » | Restaurer l'ordre 1–2–3–4, vérifier la liaison et la lisibilité |
| 25 | Tableau comparatif « Personne à prévenir / Personne de confiance » aplati ; ligne « confiance. CSP L1111-6… » séparée de sa phrase | Restaurer le tableau à deux colonnes et les phrases |

**Conséquence :** ne pas promouvoir `MODEL_COMPARISON`, `MARGINS_AND_HIERARCHY` ou `COLOR_AND_BOXES` en PASS ; ne pas déclarer `all_pages_compared_at_100_and_200_percent`. Ces pages illustrent des **défauts de structure**, pas une simple préférence visuelle. L'analyse sémantique globale et quatre PLAUD restent non certifiées.

Un rapport paginé de preuve est conservé **sur Drive privé uniquement**. **Aucune URL Drive personnelle ni transcription** ajoutée au dépôt. Il faut préparer une version corrigée (nouveaux octets, donc nouvelle approbation), contrôler l'ensemble du PDF et ensuite seulement activer l'unique fiche dans les manifestes et fusionner la PR. Les trois PDF historiques, les 105 QCM, 93 flashcards et 7 vocaux restent intacts sur `main`.

## Candidat V4 — correction effective des défauts de structure (privé, à revalider)

**GO de correction du propriétaire reçu** (« ok go »). Une vraie nouvelle révision de la fiche a été effectuée, **sans modifier les octets de la V3 acceptée**.

- PDF **V4, 41 pages**, SHA-256 **`a99f8f3582b97aa1cb19dd98fa978b2ea1650dfbee527576e94f8ceb5f1a9e1f`**, **1 078 139 octets (lecture retour Drive)** ; dépôt sur Drive personnel **privé (owner-only)** et empreinte **identique après téléchargement de lecture retour**.
- Refonte du bloc hospitalier de la V3 **p. 17–29** en **15 pages propres** : **327/327 blocs de texte sources consommés**, **25 tableaux structurés** (statut CRUA/RU/CDU, risques, dossiers, consentement, mineur/protecteur, biens et inventaire, personne à prévenir/confiance, directives anticipées, e-Satis, relations avec les usagers, cas patient AVC). **Aucun raccourci simpliste de suppression des notions.**
- Séquences rétablies en **1–2–3–4** (inventaire, e-Satis) ; fragments orphelins re-rattachés à leur paragraphe ou en notes prudentes. Comparaison automatique de quatre mots : **97,02 % des séquences originales du bloc** retrouvées, les principales différences étant des libellés et circuits remis en forme. **Ce score ne prouve pas une revue sémantique complète.**
- Contrôles du **fichier V4 exact lu depuis Drive** : **41/41 pages A4**, bandeaux violets 41/41, aucun span de texte hors page, corps du bloc repris >= 9 pt, **11/11 liens internes** avec nouvelles pages cibles, **25 pages non réécrites au texte de corps strictement identique**, dont **7 pages de définitions**.
- Référence de modèle Communication V3 SHA-256 **`223b163f243373c03d87b8e7b8ec8ffd60a06ab883c40dabfa7a7dbbfe4b30cf`** vérifiée. Rapports privés de fabrication, contrôle par page et téléchargement conservés **dans Drive privé exclusivement**.

**IMPORTANT — règles de mise en ligne :** la V3 a été acceptée par le propriétaire, mais la V4 a **des octets différents et n'a pas encore été approuvée par lui** ; le GO de correction ne vaut pas validation graphique/sémantique de cette révision. Le contrôle visuel de toutes les pages à **100 % et 200 %** et la matrice de non-régression pédagogique complète demeurent à certifier. Le contrôle technique et les 97,02 % lexicaux ne suffisent pas à cocher ces cases. Ne pas publier ni fusionner avant levée des contrôles et acceptation de la **V4 exacte**.

Les trois anciennes fiches, leurs archives et les **105 QCM, 93 flashcards et 7 vocaux** sont inchangés sur `main`. Le PDF V4 n'est **pas public** et n'est **pas** référencé dans `sheets-3.json`.

### Rectification de l'identité du fichier hébergé (V4)

Le PDF V4 a été finalisé **sans les anciens numéros /39 dans la couche texte**, pour éviter les doublons en sélection ou lecture vocale. Le fichier de production local final possède l'empreinte `805d643ab34b14bab9a599d31ca8b3cc21cd8c06893459914ea451a85aac2c3e`, 1 053 184 octets. Le transfert Drive a normalisé les octets et les métadonnées ; **l'empreinte du fichier réellement hébergé et téléchargé** est **`a99f8f3582b97aa1cb19dd98fa978b2ea1650dfbee527576e94f8ceb5f1a9e1f`**, 1 078 139 octets, identifiant `1VBeKiMq94dENvNSQCy6XvwQVe_uvNE2Y`, owner-only.

**Contrôle comparatif effectif des 41 pages** : texte sélectionnable **identique**, pixels rendus à 80 % **identiques**, liens internes **identiques** ; métadonnées d'en-tête différentes uniquement. Contrôle technique **repris sur les octets Drive exacts**, 41 pages, 11 liens et 25 pages du corps original préservées. Le rapport d'expertise reste **privé**. L'identité finale à soumettre à approbation est donc la **SHA Drive a99f8f…**, jamais la SHA locale ni le PDF V4 intermédiaire (SHA ed42a400…/805d643… présent seulement comme historique privé).

**Limite inchangée** : la V4 n'a pas reçu l'approbation explicite du propriétaire sur ces octets finaux. Pas de migration des fiches ni de merge tant que les revues graphique 100/200 % et non-régression pédagogique restent non certifiées. La V3 acceptée et les trois historiques restent inchangés.

## GO explicite sur la V4 — 28 octobre 2026

Le propriétaire a répondu **« Ok go »** juste après la livraison de la fiche **V4 finale de 41 pages**, sa présentation des contrôles et la mention explicite de l'attente d'une nouvelle validation. Cet accord vaut **acceptation de la V4 exacte** et **GO pour poursuivre les vérifications et son intégration**, sans autoriser un contournement des contrôles prépublication.

**Identité approuvée :** fichier Google Drive propriétaire privé `1VBeKiMq94dENvNSQCy6XvwQVe_uvNE2Y`, 1 078 139 octets, SHA-256 **`a99f8f3582b97aa1cb19dd98fa978b2ea1650dfbee527576e94f8ceb5f1a9e1f`** (empreinte du téléchargement, pas celle du fichier de travail local). **Statut d'accord : `owner_accepted` pour V4 SHA a99f8f.** Ne pas redemander le GO pour ces mêmes octets.

**Règle impérative :** la revue de toutes les pages à 100/200 %, la vérification de la fidélité des quatre PLAUD et cinq sources PDF, de l'exactitude juridique, des 57 entrées du lexique, de l'accès public étudiant et les tests sur les manifestes sont des étapes distinctes à exécuter avant publication. Si une erreur impose de changer le PDF, enregistrer une nouvelle SHA et solliciter une nouvelle acceptation sur cette nouvelle version. Archives/QCM/flashcards/vocaux préservés.

## Correction éditoriale détectée après le GO V4 : candidat V5 privé

**Contrôle de dernière lecture** : la V4 acceptée contient un segment mal ponctué sur la responsabilité liée aux biens du patient, en **page 26** : la phrase sur le refus de dépôt et celle sur l'absence d'indemnisation automatique y sont accolées sans séparateur.

Une **V5 strictement éditoriale**, 41 pages, a été générée en insérant le séparateur logique entre les deux propositions, **sans supprimer ni modifier les notions**. Contrôle différentiel par fichier PDF : **40/41 pages strictement identiques en texte et pixels** à la V4 acceptée ; seule la page 26 change ; 11 liens, 25 tableaux, 7 pages finales de lexique conservés. Contrôle des 41 pages : pas de texte hors limites détecté, bandeaux présents.

**Fichier final V5 privé** : Drive `1uS31PA1I1KUEbEh_s81Rj_BA0ZsmPWIb`, 1 053 174 octets, **SHA-256 `52caf6e3e56b9dfc07268ce44ec5b4736d18c01364fdda0444ca7d4a09413a2e`**. **Octets rigoureusement identiques à la lecture retour depuis Drive** (SHA/tailles vérifiées). Le rapport différentiel reste propriétaire/privé.

**Autorisation :** le « Ok go » de l'utilisateur précédent valide précisément **la V4 SHA `a99f8f35…`**. Le fichier V5 diffère : **aucun GO implicite sur la V5**. Cette version requiert une acceptation explicite distincte. La V4 reste préservée ; ni le Drive étudiant, ni `sheets-3.json`, ni `docs/course-deliveries.json` ni `main` ne sont modifiés à ce stade. Revues pédagogiques et graphiques complètes toujours non certifiées. **Ne pas publier la V5 ni fusionner avant levée des contrôles et accord propriétaire.**

## GO explicite sur V5 — 28 octobre 2026, 22 h 06 (Europe/Paris)

Le propriétaire a répondu **« Go »** juste après le message qui présentait la **V5 41 pages** (correction unique de la ponctuation p. 26), le nouveau lien Drive privé et la demande d'approbation sur les octets modifiés.

**Approbation V5 enregistrée** pour la SHA-256 exacte **`52caf6e3e56b9dfc07268ce44ec5b4736d18c01364fdda0444ca7d4a09413a2e`**, Drive ID `1uS31PA1I1KUEbEh_s81Rj_BA0ZsmPWIb`, 1 053 174 octets, 41 pages. Cette validation V5 remplace le statut `not_approved` pour ce SHA précis. Le GO autorise à finaliser les contrôles, publier et intégrer la fiche **si les conditions bloquantes sont satisfaites**, sans retirer les archives, QCM, flashcards ou vocaux. Ne pas demander un quatrième GO sur les mêmes octets.

Le contrôle scientifique/pédagogique de toutes les sources, la revue graphique exhaustive 100/200 %, l'accès réellement étudiant au PDF publié, les manifestes et la CI demeurent **indépendants** de la validation du propriétaire. Aucune déclaration PASS sans preuve.

## Prépublication V5 : contrôle du GO et preuve de limite — 28 octobre, 22 h

**V5 formellement acceptée (GO sur SHA exacte).** Nouvelle revue technique des octets V5 Drive owner-only : 41 pages A4, bandeaux, Lato, pagination, absence de débordement de texte, liens 11/11 et correction de la page 26 vérifiés. Les planches de contact couvrant toutes les pages ont été inspectées. Les deux workflows GitHub **TNR IFSI ABC** et **Audit qualité P2** sont `success` pour le commit du GO ; ils ne portent encore que sur docs et garde-fou, et ne certifient ni le PDF ni un catalogue fusionné.

**Preuve distincte des réserves :** l'index de 251 pages de sources et de 57 fenêtres orales n'était qu'un rapprochement lexical (TF-IDF), avec 24 concepts vérifiés ponctuellement. Il ne constitue **pas** la matrice obligatoire de non-régression pédagogique v1.49. La comparaison exhaustive des pages individuelles à 100 % et 200 % avec le modèle Communication 19p n'est **pas attestée** par les contacts. **Ne pas marquer sourceCoverage:complete, templateConformance:PASS, pagesChecked exhaustivement à 100/200 %, ni owner-accepted comme remplaçant ces audits.**

**Résultat opérationnel : BLOQUÉ AVANT PUBLICATION** ; la V5 reste privée et n'est pas liée dans le catalogue étudiant. La PR demeure draft et `main` reste intacte. Rapport paginé des faits et cases non satisfaites archivé dans le Drive **privé**. Aucun GO supplémentaire ne sera demandé pour la V5 au même SHA ; reprendre les vérifications sans modifier les PDF acceptés, et publier seulement une fois les contrôles effectivement bouclés.
