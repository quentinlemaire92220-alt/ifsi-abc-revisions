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

Une première fiche **écrite unique** a été produite en privé selon la charte v1.49 : **40 pages**, texte sélectionnable, synthèse générale précédant le lexique. Empreinte locale SHA-256 : `c5feb9eb80b928668c9e19c4a784d054cb40e39e1822db81db3ada3e764b6a8b`.

**Important :** ce candidat n'est **ni stocké dans GitHub, ni publié dans Drive/app, ni approuvé**. Les trois fiches historiques sont encore la référence opérationnelle. Une fiche de 40 pages n'est pas validée par son seul format : la couverture et les précisions des anciennes fiches et des sources doivent être comparées sémantiquement.

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

Le périmètre ci-dessus est documenté ; **aucune suppression, aucun remplacement, aucun PDF nouveau et aucune mutation des ressources actives** n'ont été effectués ici. Le cours reste accessible dans sa version précédente sur `main`. La PR doit rester **brouillon / bloquée** tant que les conditions ne sont pas réalisées.
