# Préflight de préparation et de publication

Exécuter les contrôles ciblés avant l’ouverture d’une PR, chaque envoi d’un candidat corrigé et toute publication. Ils ne remplacent ni le TNR complet, ni la revue pédagogique, ni l’accord humain. Le lanceur ne modifie aucun contenu et n’écrit aucune approbation.

## Étapes et responsabilités

1. **Préparation privée** : cinq choix A–E, 1 à 3 clés distinctes, cardinalité annoncée, corrections, cartes complètes et autonomes ; isolement des catalogues actifs et des assets.
2. **QA pédagogique** : lecture des sources réellement disponibles, observation/interprétation séparées, analyse de chaque réponse, autonomie des situations et des rectos. Le contrôle automatique repère des références au TD, à la formatrice ou à une vignette absente ; il ne certifie pas le fond. Une réserve orale demeure explicite. `incomplete_tail` ne devient jamais une revue exhaustive.
3. **QA technique** : banque canonique et miroir interactif identiques ; cartes rédigées comparées au moteur réel ; texte natif PDF comparé aux énoncés, choix, clés, arguments et rectos/versos/explications. Présence des assets, SHA-256, pagination, version, build, index et précache SW contrôlés. Pour TD2 : 40 cartes rédigées et six cartes de vocabulaire comptées séparément.
4. **Publication** : accord authentique sur les octets finaux, manifeste cohérent, TNR complets verts, fusion autorisée, déploiement et contrôle du site servi. Une modification dépendante invalide l’ancienne empreinte. Une approbation historique ne signe pas le candidat corrigé.

## Commandes avant PR et publication

Définir `IFSI_BASE_SHA` au SHA complet de la branche publiée de comparaison. Le préflight refuse une base absente, sans repli silencieux. `IFSI_PYTHON` permet de désigner le Python du runtime de travail.

```sh
node tools/course-preflight.mjs --stage preparation --base <SHA_COMPLET> --report <DOSSIER_PRIVE>/preparation.json
node tools/course-preflight.mjs --stage publication --base <SHA_COMPLET> --report <DOSSIER_PRIVE>/publication.json
```

Le parcours publication rassemble tous les échecs ciblés : contrats pédagogiques, PDF/banques, release technique et approbation. Chaque catégorie conserve son résultat. L’autorisation manquante reste bloquante même si les autres catégories réussissent. La préparation ne permet pas de contourner la publication.

## CI complète et cache

Le job `tnr` conserve les commandes historiques et leurs arguments. Les vérifications suivantes s’exécutent avec `!cancelled()` après un échec : le même run révèle les problèmes indépendants. Aucun `continue-on-error` ne masque un échec. Le préflight indépendant fournit le diagnostic précoce sans supprimer les TNR complets. Les deux jobs doivent réussir avant fusion.

Le cache pip est lié aux dépendances épinglées dans `tools/ci-pdf-requirements.txt`. Il accélère l’installation, sans réemployer de PASS. Les ressources historiques et leurs protections ne sont pas migrées rétroactivement.

## PDF servis par Pages

`publicArtifacts` déclare, par rôle, chemin local, SHA-256 mesuré, pagination et identifiant d’artefact. Cette déclaration participe à l’empreinte du package. Les URL utilisent le bon hôte/projet Pages et un fichier existant sous `assets/`, avec la même empreinte dans `artifactSha256s`. Les tests refusent une substitution, un chemin non canonique ou un SHA différent.

Un identifiant d’asset local n’est pas un identifiant Drive et ne prouve pas une copie distante. Si les octets diffèrent, conserver les deux empreintes et signaler la synchronisation en attente. Les reçus, sources, rendus, autorisations détaillées et diagnostics privés restent hors du dépôt public.

Après déploiement, comparer version et octets servis au commit fusionné. Le dossier « À traiter » est archivé après cette vérification ; aucune source ni ancien cours n’est supprimé.
